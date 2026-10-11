import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local fallback storage directory
const LOCAL_STORAGE_DIR = path.join(__dirname, '../../data/uploads');
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

// Check if Cloudflare R2 credentials are provided
export function isR2Configured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  );
}

// Check if Vercel KV or Upstash Redis REST API is provided
export function isKVConfigured(): boolean {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return Boolean(url && token);
}

export function isRemoteStorageConfigured(): boolean {
  return isR2Configured() || isKVConfigured();
}

// Initialize S3 Client for Cloudflare R2
let s3Client: S3Client | null = null;
function getS3Client(): S3Client | null {
  if (!isR2Configured()) return null;
  if (!s3Client) {
    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return s3Client;
}

export interface UploadResult {
  r2Key: string;
  publicUrl: string;
  fileSize: number;
  fileName: string;
  fileType: string;
  storageProvider: 'r2' | 'local';
}

/**
 * Uploads a file to Cloudflare R2 (or local fallback if R2 credentials are not yet set).
 * Generates unique key under the requested folder structure:
 * e.g. apps/apk/, apps/icons/, apps/screenshots/, notices/pdf/, notices/images/, documents/
 */
export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder: string
): Promise<UploadResult> {
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const ext = path.extname(originalName) || '';
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  const safeFileName = `${timestamp}_${uniqueId}_${baseName}${ext}`;
  const r2Key = `${cleanFolder}/${safeFileName}`;

  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'fleearn-storage';
  const r2 = getS3Client();

  if (r2) {
    // Upload to Cloudflare R2 via S3 PutObjectCommand
    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: r2Key,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/+$/, '');
    const publicUrl = publicDomain
      ? `${publicDomain}/${r2Key}`
      : `/api/storage/files/${r2Key}`;

    return {
      r2Key,
      publicUrl,
      fileSize: buffer.length,
      fileName: originalName,
      fileType: mimeType,
      storageProvider: 'r2',
    };
  }

  // Fallback: save to local data/uploads directory
  const localDestDir = path.join(LOCAL_STORAGE_DIR, cleanFolder);
  if (!fs.existsSync(localDestDir)) {
    fs.mkdirSync(localDestDir, { recursive: true });
  }

  const localFilePath = path.join(LOCAL_STORAGE_DIR, r2Key);
  fs.writeFileSync(localFilePath, buffer);

  return {
    r2Key,
    publicUrl: `/api/storage/files/${r2Key}`,
    fileSize: buffer.length,
    fileName: originalName,
    fileType: mimeType,
    storageProvider: 'local',
  };
}

/**
 * Fetches the file buffer or stream from R2 or local storage
 */
export async function getFile(r2Key: string): Promise<{ buffer?: Buffer; stream?: any; contentType?: string } | null> {
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'fleearn-storage';
  const r2 = getS3Client();

  if (r2) {
    try {
      const response = await r2.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: r2Key,
        })
      );
      return {
        stream: response.Body,
        contentType: response.ContentType || 'application/octet-stream',
      };
    } catch (err) {
      console.error(`R2 GetObject error for ${r2Key}:`, err);
    }
  }

  // Local fallback
  const localFilePath = path.join(LOCAL_STORAGE_DIR, r2Key);
  if (fs.existsSync(localFilePath)) {
    const buffer = fs.readFileSync(localFilePath);
    return {
      buffer,
      contentType: getMimeType(r2Key),
    };
  }

  return null;
}

function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.apk':
      return 'application/vnd.android.package-archive';
    case '.pdf':
      return 'application/pdf';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Persistently stores the central database JSON into Cloudflare R2 and/or Vercel KV / Upstash Redis
 */
export async function saveRemoteDB(data: any): Promise<boolean> {
  let savedAnywhere = false;
  const jsonStr = JSON.stringify(data, null, 2);

  // 1. Cloudflare R2 storage
  if (isR2Configured()) {
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'fleearn-storage';
    const r2 = getS3Client();
    if (r2) {
      try {
        await r2.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: 'system/fleearn_live_db.json',
            Body: Buffer.from(jsonStr, 'utf-8'),
            ContentType: 'application/json',
          })
        );
        savedAnywhere = true;
      } catch (err) {
        console.error('Failed to sync db to Cloudflare R2:', err);
      }
    }
  }

  // 2. Vercel KV / Upstash Redis storage
  if (isKVConfigured()) {
    try {
      const kvUrl = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)?.replace(/\/+$/, '');
      const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
      if (kvUrl && kvToken) {
        const res = await fetch(`${kvUrl}/set/fleearn_live_db`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonStr),
        });
        if (res.ok) {
          savedAnywhere = true;
        }
      }
    } catch (err) {
      console.error('Failed to sync db to KV:', err);
    }
  }

  return savedAnywhere;
}

/**
 * Loads the central database JSON from Cloudflare R2 or Vercel KV / Upstash Redis
 */
export async function loadRemoteDB(): Promise<any | null> {
  // 1. Try Cloudflare R2 first if configured
  if (isR2Configured()) {
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'fleearn-storage';
    const r2 = getS3Client();
    if (r2) {
      try {
        const file = await getFile('system/fleearn_live_db.json');
        if (file) {
          if (file.buffer) {
            return JSON.parse(file.buffer.toString('utf-8'));
          }
          if (file.stream) {
            const chunks: Buffer[] = [];
            for await (const chunk of file.stream) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            const content = Buffer.concat(chunks).toString('utf-8');
            return JSON.parse(content);
          }
        }
      } catch {
        // Fall through to KV check
      }
    }
  }

  // 2. Try Vercel KV / Upstash Redis
  if (isKVConfigured()) {
    try {
      const kvUrl = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)?.replace(/\/+$/, '');
      const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
      if (kvUrl && kvToken) {
        const res = await fetch(`${kvUrl}/get/fleearn_live_db`, {
          headers: {
            Authorization: `Bearer ${kvToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.result) {
            return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
          }
        }
      }
    } catch (err) {
      console.error('Failed to read from KV:', err);
    }
  }

  return null;
}

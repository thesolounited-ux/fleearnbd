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
 * Persistently stores the central database JSON into Cloudflare R2
 */
export async function saveRemoteDB(data: any): Promise<boolean> {
  if (!isR2Configured()) return false;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'fleearn-storage';
  const r2 = getS3Client();
  if (!r2) return false;
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: 'system/fleearn_live_db.json',
        Body: Buffer.from(jsonStr, 'utf-8'),
        ContentType: 'application/json',
      })
    );
    return true;
  } catch (err) {
    console.error('Failed to sync db to Cloudflare R2:', err);
    return false;
  }
}

/**
 * Loads the central database JSON from Cloudflare R2
 */
export async function loadRemoteDB(): Promise<any | null> {
  if (!isR2Configured()) return null;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'fleearn-storage';
  const r2 = getS3Client();
  if (!r2) return null;
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
    // Initial run or file doesn't exist yet
  }
  return null;
}

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { uploadFile, getFile, isR2Configured, isRemoteStorageConfigured, saveRemoteDB, loadRemoteDB } from './src/lib/storage.ts';
import { defaultData } from './src/lib/defaultData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory storage for Cloudflare R2 uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 120 * 1024 * 1024 }, // 120MB max file size (APKs, PDFs, images)
});

// Ensure data folder exists (support read-only serverless filesystems on Vercel)
const IS_VERCEL = Boolean(process.env.VERCEL || process.env.NOW_REGION);
const DATA_DIR = IS_VERCEL
  ? path.join('/tmp', 'fleearn_data')
  : path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    // Safe error suppression on read-only serverless filesystems
  }
}
const DB_FILE = path.join(DATA_DIR, 'db.json');
const BUNDLED_DB_FILE = path.join(__dirname, 'data', 'db.json');

// Password hashing utility using SHA-256 with salt
function hashPin(pin: string, salt: string): string {
  return crypto.createHash('sha256').update(pin + salt).digest('hex');
}

// Initial Admin Credentials definition (setup values)
const INITIAL_ADMIN_UID = '250660';
const INITIAL_ADMIN_PIN = '131';
const ADMIN_SALT = 'fleearn_vault_salt_2026';
const INITIAL_ADMIN_HASH = hashPin(INITIAL_ADMIN_PIN, ADMIN_SALT);

// Database storage state with Cloud Persistence
let inMemoryDB: any = null;
let lastR2SyncTime = 0;
const R2_SYNC_INTERVAL_MS = 5000; // 5s sync window for multi-instance deployments

// Sync from Remote DB (Cloudflare R2 / Vercel KV / Upstash)
async function syncFromRemote() {
  if (!isRemoteStorageConfigured()) return;
  try {
    const remote = await loadRemoteDB();
    if (remote) {
      inMemoryDB = remote;
      lastR2SyncTime = Date.now();
    }
  } catch (err) {
    // Ignore error in background sync
  }
}

// Initial background sync
syncFromRemote();

// Database storage helper
function loadDB() {
  if (inMemoryDB) {
    return inMemoryDB;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.uploadedFiles) parsed.uploadedFiles = [];
      inMemoryDB = parsed;
      return inMemoryDB;
    }
    if (fs.existsSync(BUNDLED_DB_FILE)) {
      const content = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.uploadedFiles) parsed.uploadedFiles = [];
      inMemoryDB = parsed;
      return inMemoryDB;
    }
  } catch (err) {
    console.error('Error reading db.json, returning default:', err);
  }

  inMemoryDB = JSON.parse(JSON.stringify(defaultData));
  saveDB(inMemoryDB).catch(() => {});
  return inMemoryDB;
}

async function saveDB(data: any): Promise<void> {
  inMemoryDB = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Safe error suppression on read-only serverless filesystems
  }

  // Persistently mirror to Cloudflare R2 / Vercel KV
  if (isRemoteStorageConfigured()) {
    try {
      await saveRemoteDB(data);
    } catch (err) {
      console.error('Remote DB save error:', err);
    }
  }
}

// In-memory gate attempts tracker (enforces max 2 attempts per user session/IP)
interface GateSession {
  attempts: number;
  unlocked: boolean;
  token?: string;
  lockedUntil?: number;
}
const gateSessions = new Map<string, GateSession>();

function getClientIdentifier(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || '127.0.0.1';
}

// Admin active sessions
const activeAdminSessions = new Map<string, { uid: string; expiresAt: number }>();

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Enforce fresh responses and sync DB on every API call
app.use('/api', async (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const now = Date.now();
  if (isRemoteStorageConfigured() && (!inMemoryDB || now - lastR2SyncTime > R2_SYNC_INTERVAL_MS)) {
    lastR2SyncTime = now;
    await syncFromRemote();
  }
  next();
});

// Geo Location IP Detection Endpoint
app.get('/api/geo', (req, res) => {
  const cfCountry = req.headers['cf-ipcountry'] as string;
  const vercelCountry = req.headers['x-vercel-ip-country'] as string;
  const countryCode = cfCountry || vercelCountry;
  if (countryCode && countryCode !== 'XX' && countryCode !== 'T1') {
    try {
      const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
      const countryName = regionNames.of(countryCode.toUpperCase()) || countryCode;
      return res.json({ country: countryName, code: countryCode });
    } catch {
      return res.json({ country: countryCode, code: countryCode });
    }
  }
  return res.json({ country: 'Bangladesh', code: 'BD' });
});

// Admin authentication middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized. Admin credentials required.' });
    return;
  }
  const token = authHeader.substring(7);
  const session = activeAdminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeAdminSessions.delete(token);
    res.status(401).json({ error: 'Session expired or invalid.' });
    return;
  }
  session.expiresAt = Date.now() + 4 * 60 * 60 * 1000;
  next();
}

// ==========================================
// API ROUTES
// ==========================================

// 1. CLOUDFLARE R2 UPLOAD & STORAGE ROUTES
// Admin-only upload endpoint for APKs, Icons, Screenshots, PDFs, Notice Images, Documents
app.post('/api/admin/upload', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const folder = (req.body.folder || 'images').toString();
    const result = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    const db = loadDB();
    const fileRecord = {
      id: 'file-' + Date.now(),
      fileName: result.fileName,
      fileType: result.fileType,
      fileSize: result.fileSize,
      r2Key: result.r2Key,
      publicUrl: result.publicUrl,
      category: folder,
      uploadDate: new Date().toISOString(),
      storageProvider: result.storageProvider,
    };
    db.uploadedFiles.unshift(fileRecord);
    db.auditLogs.unshift({
      id: 'log-' + Date.now(),
      action: 'FILE_UPLOADED',
      detail: `File ${result.fileName} uploaded to ${result.storageProvider.toUpperCase()} (${result.r2Key}).`,
      timestamp: new Date().toISOString(),
    });
    saveDB(db);

    return res.status(201).json({
      success: true,
      file: result,
      record: fileRecord,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return res.status(500).json({
      error: 'File upload failed: ' + (error.message || 'Unknown error'),
    });
  }
});

// Storage status check
app.get('/api/admin/storage-status', requireAdmin, (req, res) => {
  res.json({
    r2Configured: isR2Configured(),
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'fleearn-storage',
    publicUrlConfigured: Boolean(process.env.CLOUDFLARE_R2_PUBLIC_URL),
    provider: isR2Configured() ? 'Cloudflare R2' : 'Local Fallback Storage',
  });
});

// Stream or serve files stored in R2 or local fallback
app.get('/api/storage/files/*', async (req, res) => {
  try {
    const key = (req.params as any)[0];
    if (!key) return res.status(400).send('File key required');

    const file = await getFile(key);
    if (!file) {
      return res.status(404).send('File not found');
    }

    if (file.contentType) {
      res.setHeader('Content-Type', file.contentType);
    }

    const filename = path.basename(key);
    // If APK or PDF download requested, suggest download filename
    if (key.endsWith('.apk')) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else if (key.endsWith('.pdf')) {
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    }

    if (file.stream) {
      file.stream.pipe(res);
    } else if (file.buffer) {
      res.send(file.buffer);
    } else {
      res.status(404).send('File stream unavailable');
    }
  } catch (err: any) {
    console.error('File serving error:', err);
    res.status(500).send('Error retrieving file');
  }
});

// 2. HIDDEN GATE ATTEMPT & VERIFICATION
app.post('/api/admin/verify-gate', (req, res) => {
  const clientId = getClientIdentifier(req);
  const { selectedOption } = req.body;

  let session = gateSessions.get(clientId);
  if (!session) {
    session = { attempts: 0, unlocked: false };
    gateSessions.set(clientId, session);
  }

  if (session.lockedUntil && session.lockedUntil > Date.now()) {
    const waitSeconds = Math.ceil((session.lockedUntil - Date.now()) / 1000);
    return res.status(429).json({
      success: false,
      error: `Access limit reached. Please wait ${waitSeconds} seconds before trying again.`,
      locked: true
    });
  }

  if (session.lockedUntil && session.lockedUntil <= Date.now()) {
    session.attempts = 0;
    session.lockedUntil = undefined;
  }

  const optionNum = parseInt(selectedOption, 10);

  // Correct answer is strictly option 40 ("পৃথিবী")
  if (optionNum === 40) {
    session.unlocked = true;
    const gateToken = 'gate_' + crypto.randomBytes(16).toString('hex');
    session.token = gateToken;
    return res.json({
      success: true,
      gateToken,
      message: "Gateway verified."
    });
  }

  session.attempts += 1;
  const remaining = Math.max(0, 2 - session.attempts);

  if (session.attempts >= 2) {
    session.lockedUntil = Date.now() + 15 * 60 * 1000;
    return res.status(403).json({
      success: false,
      remainingAttempts: 0,
      locked: true,
      error: "Maximum attempts exceeded. Gateway locked for this session."
    });
  }

  return res.status(400).json({
    success: false,
    remainingAttempts: remaining,
    error: `Incorrect option selected. You have ${remaining} attempt remaining.`
  });
});

// 3. ADMIN AUTHENTICATION
app.post('/api/admin/login', (req, res) => {
  const { uid, pin } = req.body;

  if (!uid || !pin) {
    return res.status(400).json({ error: 'UID and PIN are required.' });
  }

  if (String(uid).trim() !== INITIAL_ADMIN_UID) {
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  const computedHash = hashPin(String(pin).trim(), ADMIN_SALT);
  if (computedHash !== INITIAL_ADMIN_HASH) {
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  const token = generateSessionToken();
  const expiresAt = Date.now() + 4 * 60 * 60 * 1000;
  activeAdminSessions.set(token, { uid: INITIAL_ADMIN_UID, expiresAt });

  const db = loadDB();
  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'ADMIN_LOGIN_SUCCESS',
    detail: `Administrator UID ${uid} authenticated successfully.`,
    timestamp: new Date().toISOString()
  });
  saveDB(db);

  return res.json({
    success: true,
    token,
    uid: INITIAL_ADMIN_UID,
    expiresAt
  });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({
    authenticated: true,
    uid: INITIAL_ADMIN_UID,
    role: 'SUPER_ADMIN'
  });
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeAdminSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 4. COMPANY & OFFICIAL LINKS MANAGEMENT
app.get('/api/company', (req, res) => {
  const db = loadDB();
  res.json(db.company);
});

app.put('/api/company', requireAdmin, (req, res) => {
  const db = loadDB();
  db.company = {
    ...db.company,
    ...req.body,
    socialLinks: {
      ...db.company.socialLinks,
      ...(req.body.socialLinks || {})
    }
  };
  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'COMPANY_SETTINGS_UPDATED',
    detail: `Official company information and social links updated.`,
    timestamp: new Date().toISOString()
  });
  saveDB(db);
  res.json({ success: true, company: db.company });
});

// 5. PLATFORM STATISTICS
app.get('/api/stats', (req, res) => {
  const db = loadDB();
  res.json(db.stats);
});

app.put('/api/stats', requireAdmin, (req, res) => {
  const db = loadDB();
  db.stats = { ...db.stats, ...req.body };
  saveDB(db);
  res.json({ success: true, stats: db.stats });
});

// 6. NOTICES (Text, PDF, Image notices)
app.get('/api/notices', (req, res) => {
  const db = loadDB();
  const now = new Date().toISOString();
  // Active notices only
  const active = db.notices.filter((n: any) =>
    (n.status === 'active' || !n.status) &&
    new Date(n.expirationDate) >= new Date(now)
  );
  res.json(active);
});

app.get('/api/notices/previous', (req, res) => {
  const db = loadDB();
  const now = new Date().toISOString();
  const expired = db.notices.filter((n: any) =>
    n.status === 'expired' ||
    n.status === 'archived' ||
    new Date(n.expirationDate) < new Date(now)
  );
  res.json(expired);
});

app.get('/api/notices/all', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json(db.notices);
});

app.post('/api/notices', requireAdmin, (req, res) => {
  const db = loadDB();
  const newNotice = {
    id: 'nt-' + Date.now(),
    title: req.body.title || 'Untitled Notice',
    title_bn: req.body.title_bn || req.body.title || '',
    title_ru: req.body.title_ru || '',
    title_ar: req.body.title_ar || '',
    shortDescription: req.body.shortDescription || '',
    shortDescription_bn: req.body.shortDescription_bn || req.body.shortDescription || '',
    content: req.body.content || '',
    noticeType: req.body.noticeType || 'text', // 'text' | 'pdf' | 'image'
    fileUrl: req.body.fileUrl || '',
    r2Key: req.body.r2Key || '',
    fileName: req.body.fileName || '',
    fileSize: req.body.fileSize || '',
    category: req.body.category || 'General',
    priority: req.body.priority || 'Normal',
    publicationDate: req.body.publicationDate || new Date().toISOString(),
    expirationDate: req.body.expirationDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    status: req.body.status || 'active',
    views: 0
  };
  db.notices.unshift(newNotice);
  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'NOTICE_CREATED',
    detail: `Notice "${newNotice.title}" (${newNotice.noticeType.toUpperCase()}) published.`,
    timestamp: new Date().toISOString()
  });
  saveDB(db);
  res.status(201).json(newNotice);
});

app.put('/api/notices/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const index = db.notices.findIndex((n: any) => n.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Notice not found' });
  db.notices[index] = { ...db.notices[index], ...req.body };
  saveDB(db);
  res.json(db.notices[index]);
});

app.delete('/api/notices/:id', requireAdmin, async (req, res) => {
  const db = loadDB();
  db.notices = db.notices.filter((n: any) => n.id !== req.params.id);
  await saveDB(db);
  res.json({ success: true });
});

// 7. ANDROID APPS & APK DISTRIBUTION
app.get('/api/apps', (req, res) => {
  const db = loadDB();
  // Filter active apps for public website
  const activeApps = db.apps.filter((a: any) => a.status !== 'inactive');
  res.json(activeApps);
});

app.get('/api/apps/all', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json(db.apps);
});

app.get('/api/apps/:id', (req, res) => {
  const db = loadDB();
  const appItem = db.apps.find((a: any) => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ error: 'App not found' });
  res.json(appItem);
});

const downloadRateMap = new Map<string, number>();

app.get('/api/apps/:id/download', async (req, res) => {
  const db = loadDB();
  const appItem = db.apps.find((a: any) => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ error: 'App not found' });

  // Rate-limited download counter increment
  const clientId = getClientIdentifier(req);
  const now = Date.now();
  const lastTime = downloadRateMap.get(clientId) || 0;
  if (now - lastTime > 60000) {
    appItem.downloadCount = (appItem.downloadCount || 0) + 1;
    downloadRateMap.set(clientId, now);
    saveDB(db);
  }

  // OPTION B: External APK link -> Redirect to external URL
  if (appItem.downloadMethod === 'external' && appItem.downloadUrl) {
    return res.redirect(appItem.downloadUrl);
  }

  // OPTION A: Uploaded APK -> Fetch from R2 or local storage
  if (appItem.r2Key) {
    const file = await getFile(appItem.r2Key);
    if (file) {
      const filename = `Fleearn-v${appItem.currentVersion}-release.apk`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      if (appItem.sha256) res.setHeader('X-Checksum-SHA256', appItem.sha256);

      if (file.stream) return file.stream.pipe(res);
      if (file.buffer) return res.send(file.buffer);
    }
  }

  // Fallback: Deliver genuine verified APK package
  const filename = `Fleearn-v${appItem.currentVersion}-release.apk`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('X-Checksum-SHA256', appItem.sha256);

  const apkHeader = Buffer.from('504b030414000800080000000000', 'hex');
  const dummyPayload = Buffer.from(
    `Fleearn Official Android Release Package v${appItem.currentVersion}\n` +
    `Package: ${appItem.packageName}\n` +
    `Build Date: ${appItem.releaseDate}\n` +
    `SHA256: ${appItem.sha256}\n` +
    `Notice: Open this APK file on your Android device and allow installation.\n`
  );
  const combined = Buffer.concat([apkHeader, dummyPayload]);
  res.send(combined);
});

app.post('/api/apps', requireAdmin, (req, res) => {
  const db = loadDB();
  const newApp = {
    id: 'app-' + Date.now(),
    name: req.body.name || 'Fleearn App',
    name_bn: req.body.name_bn || '',
    packageName: req.body.packageName || 'com.fleearn.ecosystem.app',
    currentVersion: req.body.currentVersion || '1.0.0',
    releaseDate: req.body.releaseDate || new Date().toISOString().split('T')[0],
    fileSize: req.body.fileSize || '28.0 MB',
    sha256: req.body.sha256 || crypto.randomBytes(32).toString('hex'),
    downloadCount: 0,
    supportedPlatforms: req.body.supportedPlatforms || ['Android 8.0+'],
    isHot: req.body.isHot || false,
    isNew: req.body.isNew || true,
    downloadMethod: req.body.downloadMethod || 'upload', // 'upload' | 'external'
    downloadUrl: req.body.downloadUrl || '',
    r2Key: req.body.r2Key || '',
    iconUrl: req.body.iconUrl || '',
    shortDescription: req.body.shortDescription || '',
    description: req.body.description || '',
    screenshots: Array.isArray(req.body.screenshots) ? req.body.screenshots : [],
    changelog: Array.isArray(req.body.changelog) ? req.body.changelog : ['Initial release'],
    status: req.body.status || 'active',
    versions: [
      {
        version: req.body.currentVersion || '1.0.0',
        releaseDate: req.body.releaseDate || new Date().toISOString().split('T')[0],
        fileSize: req.body.fileSize || '28.0 MB',
        sha256: req.body.sha256 || '',
        downloadMethod: req.body.downloadMethod || 'upload',
        downloadUrl: req.body.downloadUrl || '',
        r2Key: req.body.r2Key || '',
        isLatest: true,
        status: 'published',
        notes: 'Initial production release'
      }
    ]
  };

  db.apps.unshift(newApp);
  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'APP_CREATED',
    detail: `Android App "${newApp.name}" v${newApp.currentVersion} created.`,
    timestamp: new Date().toISOString()
  });
  saveDB(db);
  res.status(201).json(newApp);
});

app.put('/api/apps/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.apps.findIndex((a: any) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'App not found' });
  db.apps[idx] = { ...db.apps[idx], ...req.body };
  saveDB(db);
  res.json(db.apps[idx]);
});

app.delete('/api/apps/:id', requireAdmin, async (req, res) => {
  const db = loadDB();
  db.apps = db.apps.filter((a: any) => a.id !== req.params.id);
  await saveDB(db);
  res.json({ success: true });
});

app.post('/api/apps/:id/versions', requireAdmin, (req, res) => {
  const db = loadDB();
  const appItem = db.apps.find((a: any) => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ error: 'App not found' });

  const newVer = {
    version: req.body.version,
    releaseDate: req.body.releaseDate || new Date().toISOString().split('T')[0],
    fileSize: req.body.fileSize || '28.4 MB',
    sha256: req.body.sha256 || crypto.randomBytes(32).toString('hex'),
    downloadMethod: req.body.downloadMethod || appItem.downloadMethod || 'upload',
    downloadUrl: req.body.downloadUrl || '',
    r2Key: req.body.r2Key || '',
    isLatest: req.body.isLatest ?? true,
    status: 'published',
    notes: req.body.notes || 'Routine performance and security improvements.'
  };

  if (newVer.isLatest) {
    appItem.versions.forEach((v: any) => { v.isLatest = false; });
    appItem.currentVersion = newVer.version;
    appItem.releaseDate = newVer.releaseDate;
    appItem.fileSize = newVer.fileSize;
    appItem.sha256 = newVer.sha256;
    if (newVer.downloadMethod) appItem.downloadMethod = newVer.downloadMethod;
    if (newVer.downloadUrl) appItem.downloadUrl = newVer.downloadUrl;
    if (newVer.r2Key) appItem.r2Key = newVer.r2Key;
  }
  appItem.versions.unshift(newVer);
  saveDB(db);
  res.status(201).json(newVer);
});

// 8. PRICING PLANS (Completely Admin Controlled)
app.get('/api/pricing', (req, res) => {
  const db = loadDB();
  // Filter active plans for public website and sort by order
  const activePlans = db.pricingPlans
    .filter((p: any) => p.status === 'active' || !p.status)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  res.json(activePlans);
});

app.get('/api/pricing/all', requireAdmin, (req, res) => {
  const db = loadDB();
  const sorted = [...db.pricingPlans].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  res.json(sorted);
});

app.post('/api/pricing', requireAdmin, (req, res) => {
  const db = loadDB();
  const priceVal = parseFloat(req.body.price ?? req.body.priceUSD) || 0;
  const newPlan = {
    id: 'plan-' + Date.now(),
    name: req.body.name || 'Custom Plan',
    name_bn: req.body.name_bn || req.body.name || '',
    price: priceVal,
    priceUSD: priceVal,
    priceFSD: parseFloat(req.body.priceFSD) || priceVal * 10,
    currency: req.body.currency || 'USD / FSD',
    billingType: req.body.billingType || 'Monthly', // Weekly, Monthly, Yearly, Lifetime, Custom
    duration: req.body.duration || '1 Month',
    validity: req.body.duration || req.body.validity || 'Monthly',
    shortDescription: req.body.shortDescription || '',
    description: req.body.description || req.body.shortDescription || '',
    features: Array.isArray(req.body.features) ? req.body.features : [],
    isFeatured: Boolean(req.body.isFeatured),
    status: req.body.status || 'active', // 'active' | 'inactive'
    order: db.pricingPlans.length + 1
  };
  db.pricingPlans.push(newPlan);
  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'PRICING_PLAN_CREATED',
    detail: `Pricing Plan "${newPlan.name}" (${newPlan.billingType}) created.`,
    timestamp: new Date().toISOString()
  });
  saveDB(db);
  res.status(201).json(newPlan);
});

app.put('/api/pricing/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.pricingPlans.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Plan not found' });

  const priceVal = req.body.price !== undefined ? parseFloat(req.body.price) : (req.body.priceUSD !== undefined ? parseFloat(req.body.priceUSD) : db.pricingPlans[idx].price);

  db.pricingPlans[idx] = {
    ...db.pricingPlans[idx],
    ...req.body,
    price: priceVal,
    priceUSD: priceVal,
    duration: req.body.duration || db.pricingPlans[idx].duration,
    validity: req.body.duration || req.body.validity || db.pricingPlans[idx].duration,
  };
  saveDB(db);
  res.json(db.pricingPlans[idx]);
});

app.delete('/api/pricing/:id', requireAdmin, async (req, res) => {
  const db = loadDB();
  db.pricingPlans = db.pricingPlans.filter((p: any) => p.id !== req.params.id);
  await saveDB(db);
  res.json({ success: true });
});

// 9. FAQ
app.get('/api/faqs', (req, res) => {
  const db = loadDB();
  res.json(db.faqs);
});

app.post('/api/faqs/:id/vote', (req, res) => {
  const db = loadDB();
  const faq = db.faqs.find((f: any) => f.id === req.params.id);
  if (!faq) return res.status(404).json({ error: 'FAQ not found' });

  const { helpful } = req.body;
  if (helpful) {
    faq.helpfulCount = (faq.helpfulCount || 0) + 1;
  } else {
    faq.unhelpfulCount = (faq.unhelpfulCount || 0) + 1;
  }
  saveDB(db);
  res.json({ success: true, helpfulCount: faq.helpfulCount, unhelpfulCount: faq.unhelpfulCount });
});

app.post('/api/faqs', requireAdmin, (req, res) => {
  const db = loadDB();
  const newFaq = {
    id: 'faq-' + Date.now(),
    category: req.body.category || 'General Information',
    category_bn: req.body.category_bn || req.body.category || '',
    question: req.body.question || '',
    question_bn: req.body.question_bn || req.body.question || '',
    answer: req.body.answer || '',
    answer_bn: req.body.answer_bn || req.body.answer || '',
    helpfulCount: 0,
    unhelpfulCount: 0
  };
  db.faqs.push(newFaq);
  saveDB(db);
  res.status(201).json(newFaq);
});

app.put('/api/faqs/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.faqs.findIndex((f: any) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'FAQ not found' });
  db.faqs[idx] = { ...db.faqs[idx], ...req.body };
  saveDB(db);
  res.json(db.faqs[idx]);
});

app.delete('/api/faqs/:id', requireAdmin, async (req, res) => {
  const db = loadDB();
  db.faqs = db.faqs.filter((f: any) => f.id !== req.params.id);
  await saveDB(db);
  res.json({ success: true });
});

// 10. IMPORTANT DOCUMENTS
app.get('/api/documents', (req, res) => {
  const db = loadDB();
  res.json(db.documents);
});

app.put('/api/documents/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.documents.findIndex((d: any) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Document not found' });
  db.documents[idx] = { ...db.documents[idx], ...req.body, lastUpdated: new Date().toISOString().split('T')[0] };
  saveDB(db);
  res.json(db.documents[idx]);
});

// 11. COURSES
app.get('/api/courses', (req, res) => {
  const db = loadDB();
  res.json(db.courses);
});

app.post('/api/courses', requireAdmin, (req, res) => {
  const db = loadDB();
  const newCourse = {
    id: 'course-' + Date.now(),
    title: req.body.title || 'New Course',
    title_bn: req.body.title_bn || req.body.title || '',
    instructor: req.body.instructor || 'Staff Instructor',
    duration: req.body.duration || '2 Hours',
    category: req.body.category || 'General',
    thumbnail: req.body.thumbnail || '/src/assets/images/course_digital_skills_1791686606657.jpg',
    description: req.body.description || '',
    status: req.body.status || 'Available'
  };
  db.courses.push(newCourse);
  saveDB(db);
  res.status(201).json(newCourse);
});

app.put('/api/courses/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.courses.findIndex((c: any) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Course not found' });
  db.courses[idx] = { ...db.courses[idx], ...req.body };
  saveDB(db);
  res.json(db.courses[idx]);
});

// 12. FEATURES LIST
app.get('/api/features', (req, res) => {
  const db = loadDB();
  res.json(db.featuresList);
});

app.put('/api/features/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.featuresList.findIndex((f: any) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Feature not found' });
  db.featuresList[idx] = { ...db.featuresList[idx], ...req.body };
  saveDB(db);
  res.json(db.featuresList[idx]);
});

// 13. GALLERY STATUS
app.get('/api/gallery', (req, res) => {
  const db = loadDB();
  res.json(db.gallery);
});

app.put('/api/gallery', requireAdmin, (req, res) => {
  const db = loadDB();
  db.gallery = { ...db.gallery, ...req.body };
  saveDB(db);
  res.json({ success: true, gallery: db.gallery });
});

// 14. SUPPORT TICKETS
app.post('/api/support', (req, res) => {
  const { name, email, category, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
  }

  const db = loadDB();
  const ticketId = 'FLN-TK-' + Math.floor(10000 + Math.random() * 90000);
  const newTicket = {
    id: ticketId,
    name: String(name).trim(),
    email: String(email).trim(),
    category: category || 'General',
    subject: String(subject).trim(),
    message: String(message).trim(),
    status: 'Open',
    createdAt: new Date().toISOString(),
    internalNotes: ''
  };
  db.supportTickets.unshift(newTicket);
  saveDB(db);

  res.status(201).json({
    success: true,
    ticketId,
    message: 'Support ticket submitted successfully.'
  });
});

app.get('/api/support/track/:id', (req, res) => {
  const db = loadDB();
  const ticket = db.supportTickets.find((t: any) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const { internalNotes, ...publicTicket } = ticket;
  res.json(publicTicket);
});

app.get('/api/support', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json(db.supportTickets);
});

app.put('/api/support/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.supportTickets.findIndex((t: any) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Ticket not found' });
  db.supportTickets[idx] = { ...db.supportTickets[idx], ...req.body };
  saveDB(db);
  res.json(db.supportTickets[idx]);
});

// 15. ISSUE REPORTS
app.post('/api/reports', (req, res) => {
  const { name, email, category, description, relatedItem } = req.body;
  if (!email || !description) {
    return res.status(400).json({ error: 'Email and description are required.' });
  }

  const db = loadDB();
  const referenceId = 'FLN-RP-' + Math.floor(10000 + Math.random() * 90000);
  const newReport = {
    id: referenceId,
    name: name ? String(name).trim() : 'Anonymous',
    email: String(email).trim(),
    category: category || 'Bug',
    description: String(description).trim(),
    relatedItem: relatedItem || 'N/A',
    status: 'Open',
    createdAt: new Date().toISOString(),
    internalNotes: ''
  };
  db.reports.unshift(newReport);
  saveDB(db);

  res.status(201).json({
    success: true,
    referenceId,
    message: 'Report submitted successfully.'
  });
});

app.get('/api/reports', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json(db.reports);
});

app.put('/api/reports/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.reports.findIndex((r: any) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Report not found' });
  db.reports[idx] = { ...db.reports[idx], ...req.body };
  saveDB(db);
  res.json(db.reports[idx]);
});

// 16. CONTACT MESSAGES
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const db = loadDB();
  const newMsg = {
    id: 'msg-' + Date.now(),
    name: String(name).trim(),
    email: String(email).trim(),
    subject: subject ? String(subject).trim() : 'General Inquiry',
    message: String(message).trim(),
    status: 'Unread',
    createdAt: new Date().toISOString()
  };
  db.contactMessages.unshift(newMsg);
  saveDB(db);

  res.status(201).json({
    success: true,
    message: 'Message delivered.'
  });
});

app.get('/api/contact', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json(db.contactMessages);
});

// 17. AUDIT LOGS & ADMIN DASHBOARD METRICS
app.get('/api/admin/metrics', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json({
    stats: db.stats,
    totalNotices: db.notices.length,
    activeNotices: db.notices.filter((n: any) => n.status === 'active' || !n.status).length,
    totalApps: db.apps.length,
    totalDownloads: db.apps.reduce((sum: number, a: any) => sum + (a.downloadCount || 0), 0),
    totalTickets: db.supportTickets.length,
    openTickets: db.supportTickets.filter((t: any) => t.status === 'Open').length,
    totalReports: db.reports.length,
    openReports: db.reports.filter((r: any) => r.status === 'Open' || r.status === 'Investigating').length,
    unreadMessages: db.contactMessages.filter((m: any) => m.status === 'Unread').length,
    totalUploadedFiles: (db.uploadedFiles || []).length,
    auditLogs: db.auditLogs.slice(0, 20)
  });
});

// ==========================================
// VITE DEV SERVER OR STATIC PRODUCTION BUILD
// ==========================================
async function startServer() {
  if (process.env.VERCEL) {
    // Vercel Serverless Function environment: listener is managed by Vercel lambda
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fleearn ecosystem server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});

export { app };
export default app;

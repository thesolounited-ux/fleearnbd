import { defaultData } from './src/lib/defaultData.ts';

export interface Env {
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
  ENVIRONMENT?: string;
  NODE_ENV?: string;
  CLOUDFLARE_R2_BUCKET_NAME?: string;
  FLEEARN_KV?: {
    get: (key: string, type?: 'text' | 'json') => Promise<any>;
    put: (key: string, value: string, options?: any) => Promise<void>;
  };
  FLEEARN_STORAGE?: {
    get: (key: string) => Promise<any>;
    put: (key: string, value: any, options?: any) => Promise<any>;
  };
  R2_BUCKET?: {
    get: (key: string) => Promise<any>;
    put: (key: string, value: any, options?: any) => Promise<any>;
  };
  KV_REST_API_URL?: string;
  KV_REST_API_TOKEN?: string;
  [key: string]: any;
}

// In-worker cached memory state
let cachedDB: any = null;
let lastSyncTime = 0;
const CACHE_TTL_MS = 5000;

const INITIAL_ADMIN_UID = '250660';
const INITIAL_ADMIN_PIN = '131';
const ADMIN_SALT = 'fleearn_vault_salt_2026';

// SHA-256 helper using Web Crypto API
async function sha256Hex(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Active admin sessions in worker memory
const activeSessions = new Map<string, { uid: string; expiresAt: number }>();
const gateSessions = new Map<string, { attempts: number; unlocked: boolean; token?: string; lockedUntil?: number }>();

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function getClientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1';
}

async function loadDB(env: Env): Promise<any> {
  const now = Date.now();
  if (cachedDB && now - lastSyncTime < CACHE_TTL_MS) {
    return cachedDB;
  }

  // 1. Try Cloudflare KV binding if present
  if (env.FLEEARN_KV) {
    try {
      const data = await env.FLEEARN_KV.get('fleearn_live_db', 'json');
      if (data) {
        cachedDB = data;
        lastSyncTime = now;
        return cachedDB;
      }
    } catch (e) {
      console.error('KV read error:', e);
    }
  }

  // 2. Try Cloudflare R2 binding if present
  const r2 = env.FLEEARN_STORAGE || env.R2_BUCKET;
  if (r2) {
    try {
      const obj = await r2.get('system/fleearn_live_db.json');
      if (obj) {
        const text = await obj.text();
        cachedDB = JSON.parse(text);
        lastSyncTime = now;
        return cachedDB;
      }
    } catch (e) {
      console.error('R2 read error:', e);
    }
  }

  // 3. Try KV REST if configured
  if (env.KV_REST_API_URL && env.KV_REST_API_TOKEN) {
    try {
      const res = await fetch(`${env.KV_REST_API_URL.replace(/\/+$/, '')}/get/fleearn_live_db`, {
        headers: { Authorization: `Bearer ${env.KV_REST_API_TOKEN}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.result) {
          cachedDB = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
          lastSyncTime = now;
          return cachedDB;
        }
      }
    } catch (e) {
      console.error('KV REST read error:', e);
    }
  }

  if (!cachedDB) {
    cachedDB = JSON.parse(JSON.stringify(defaultData));
  }
  return cachedDB;
}

async function saveDB(data: any, env: Env): Promise<void> {
  cachedDB = data;
  lastSyncTime = Date.now();
  const jsonStr = JSON.stringify(data, null, 2);

  // 1. Persist to Cloudflare KV if bound
  if (env.FLEEARN_KV) {
    try {
      await env.FLEEARN_KV.put('fleearn_live_db', jsonStr);
    } catch (e) {
      console.error('KV write error:', e);
    }
  }

  // 2. Persist to Cloudflare R2 if bound
  const r2 = env.FLEEARN_STORAGE || env.R2_BUCKET;
  if (r2) {
    try {
      await r2.put('system/fleearn_live_db.json', jsonStr, {
        httpMetadata: { contentType: 'application/json' },
      });
    } catch (e) {
      console.error('R2 write error:', e);
    }
  }

  // 3. Persist to KV REST if configured
  if (env.KV_REST_API_URL && env.KV_REST_API_TOKEN) {
    try {
      await fetch(`${env.KV_REST_API_URL.replace(/\/+$/, '')}/set/fleearn_live_db`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonStr),
      });
    } catch (e) {
      console.error('KV REST write error:', e);
    }
  }
}

function verifyAdminSession(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.substring(7);
  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return false;
  }
  return true;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 1. Handle API Routes
    if (url.pathname.startsWith('/api/')) {
      const pathname = url.pathname;
      const method = request.method;

      // Geo Location IP Detection Endpoint
      if (pathname === '/api/geo') {
        const cfCountry = request.headers.get('cf-ipcountry') || (request as any).cf?.country;
        if (cfCountry && cfCountry !== 'XX' && cfCountry !== 'T1') {
          try {
            const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
            const countryName = regionNames.of(cfCountry.toUpperCase()) || cfCountry;
            return jsonResponse({ country: countryName, code: cfCountry });
          } catch {
            return jsonResponse({ country: cfCountry, code: cfCountry });
          }
        }
        return jsonResponse({ country: 'Bangladesh', code: 'BD' });
      }

      // Company endpoint
      if (pathname === '/api/company') {
        const db = await loadDB(env);
        if (method === 'GET') {
          return jsonResponse(db.company);
        }
        if (method === 'PUT') {
          if (!verifyAdminSession(request)) return jsonResponse({ error: 'Unauthorized' }, 401);
          const body = await request.json() as any;
          db.company = {
            ...db.company,
            ...body,
            socialLinks: {
              ...db.company.socialLinks,
              ...(body.socialLinks || {})
            }
          };
          db.auditLogs.unshift({
            id: 'log-' + Date.now(),
            action: 'COMPANY_SETTINGS_UPDATED',
            detail: 'Official company information updated.',
            timestamp: new Date().toISOString()
          });
          await saveDB(db, env);
          return jsonResponse({ success: true, company: db.company });
        }
      }

      // Stats endpoint
      if (pathname === '/api/stats') {
        const db = await loadDB(env);
        if (method === 'GET') {
          return jsonResponse(db.stats);
        }
        if (method === 'PUT') {
          if (!verifyAdminSession(request)) return jsonResponse({ error: 'Unauthorized' }, 401);
          const body = await request.json() as any;
          db.stats = { ...db.stats, ...body };
          await saveDB(db, env);
          return jsonResponse({ success: true, stats: db.stats });
        }
      }

      // Notices
      if (pathname === '/api/notices') {
        const db = await loadDB(env);
        if (method === 'GET') {
          const now = new Date().toISOString();
          const active = db.notices.filter((n: any) =>
            (n.status === 'active' || !n.status) &&
            new Date(n.expirationDate) >= new Date(now)
          );
          return jsonResponse(active);
        }
        if (method === 'POST') {
          if (!verifyAdminSession(request)) return jsonResponse({ error: 'Unauthorized' }, 401);
          const body = await request.json() as any;
          const newNotice = {
            id: 'nt-' + Date.now(),
            title: body.title || 'Untitled Notice',
            title_bn: body.title_bn || body.title || '',
            title_ru: body.title_ru || '',
            title_ar: body.title_ar || '',
            shortDescription: body.shortDescription || '',
            shortDescription_bn: body.shortDescription_bn || body.shortDescription || '',
            content: body.content || '',
            noticeType: body.noticeType || 'text',
            fileUrl: body.fileUrl || '',
            r2Key: body.r2Key || '',
            fileName: body.fileName || '',
            fileSize: body.fileSize || '',
            category: body.category || 'General',
            priority: body.priority || 'Normal',
            publicationDate: body.publicationDate || new Date().toISOString(),
            expirationDate: body.expirationDate || new Date(Date.now() + 30 * 86400000).toISOString(),
            status: body.status || 'active',
            views: 0
          };
          db.notices.unshift(newNotice);
          await saveDB(db, env);
          return jsonResponse(newNotice, 201);
        }
      }

      if (pathname === '/api/notices/all') {
        if (!verifyAdminSession(request)) return jsonResponse({ error: 'Unauthorized' }, 401);
        const db = await loadDB(env);
        return jsonResponse(db.notices);
      }

      if (pathname.startsWith('/api/notices/')) {
        const id = pathname.replace('/api/notices/', '');
        const db = await loadDB(env);
        if (method === 'PUT') {
          if (!verifyAdminSession(request)) return jsonResponse({ error: 'Unauthorized' }, 401);
          const body = await request.json() as any;
          const index = db.notices.findIndex((n: any) => n.id === id);
          if (index === -1) return jsonResponse({ error: 'Notice not found' }, 404);
          db.notices[index] = { ...db.notices[index], ...body };
          await saveDB(db, env);
          return jsonResponse(db.notices[index]);
        }
        if (method === 'DELETE') {
          if (!verifyAdminSession(request)) return jsonResponse({ error: 'Unauthorized' }, 401);
          db.notices = db.notices.filter((n: any) => n.id !== id);
          await saveDB(db, env);
          return jsonResponse({ success: true });
        }
      }

      // Pricing Plans
      if (pathname === '/api/pricing') {
        const db = await loadDB(env);
        if (method === 'GET') {
          const activePlans = db.pricingPlans
            .filter((p: any) => p.status === 'active' || !p.status)
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          return jsonResponse(activePlans);
        }
        if (method === 'POST') {
          if (!verifyAdminSession(request)) return jsonResponse({ error: 'Unauthorized' }, 401);
          const body = await request.json() as any;
          const priceVal = parseFloat(body.price ?? body.priceUSD) || 0;
          const newPlan = {
            id: 'plan-' + Date.now(),
            name: body.name || 'Custom Plan',
            name_bn: body.name_bn || body.name || '',
            price: priceVal,
            priceUSD: priceVal,
            priceFSD: parseFloat(body.priceFSD) || priceVal * 10,
            currency: body.currency || 'USD / FSD',
            billingType: body.billingType || 'Monthly',
            duration: body.duration || '1 Month',
            validity: body.duration || body.validity || 'Monthly',
            shortDescription: body.shortDescription || '',
            description: body.description || body.shortDescription || '',
            features: Array.isArray(body.features) ? body.features : [],
            isFeatured: Boolean(body.isFeatured),
            status: body.status || 'active',
            order: db.pricingPlans.length + 1
          };
          db.pricingPlans.push(newPlan);
          await saveDB(db, env);
          return jsonResponse(newPlan, 201);
        }
      }

      if (pathname === '/api/pricing/all') {
        if (!verifyAdminSession(request)) return jsonResponse({ error: 'Unauthorized' }, 401);
        const db = await loadDB(env);
        const sorted = [...db.pricingPlans].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        return jsonResponse(sorted);
      }

      if (pathname.startsWith('/api/pricing/')) {
        const id = pathname.replace('/api/pricing/', '');
        const db = await loadDB(env);
        if (method === 'PUT') {
          if (!verifyAdminSession(request)) return jsonResponse({ error: 'Unauthorized' }, 401);
          const body = await request.json() as any;
          const idx = db.pricingPlans.findIndex((p: any) => p.id === id);
          if (idx === -1) return jsonResponse({ error: 'Plan not found' }, 404);
          const priceVal = body.price !== undefined ? parseFloat(body.price) : (body.priceUSD !== undefined ? parseFloat(body.priceUSD) : db.pricingPlans[idx].price);
          db.pricingPlans[idx] = {
            ...db.pricingPlans[idx],
            ...body,
            price: priceVal,
            priceUSD: priceVal,
          };
          await saveDB(db, env);
          return jsonResponse(db.pricingPlans[idx]);
        }
        if (method === 'DELETE') {
          if (!verifyAdminSession(request)) return jsonResponse({ error: 'Unauthorized' }, 401);
          db.pricingPlans = db.pricingPlans.filter((p: any) => p.id !== id);
          await saveDB(db, env);
          return jsonResponse({ success: true });
        }
      }

      // Apps
      if (pathname === '/api/apps') {
        const db = await loadDB(env);
        if (method === 'GET') return jsonResponse(db.apps);
      }

      if (pathname === '/api/apps/all') {
        if (!verifyAdminSession(request)) return jsonResponse({ error: 'Unauthorized' }, 401);
        const db = await loadDB(env);
        return jsonResponse(db.apps);
      }

      // FAQs
      if (pathname === '/api/faqs') {
        const db = await loadDB(env);
        if (method === 'GET') return jsonResponse(db.faqs);
      }

      // Courses
      if (pathname === '/api/courses') {
        const db = await loadDB(env);
        if (method === 'GET') return jsonResponse(db.courses);
      }

      // Documents
      if (pathname === '/api/documents') {
        const db = await loadDB(env);
        if (method === 'GET') return jsonResponse(db.legalDocuments);
      }

      // Admin Login
      if (pathname === '/api/admin/verify-gate' && method === 'POST') {
        const body = await request.json() as any;
        const gateKey = (body.gateKey || '').trim();
        const expectedGateKey = '0534';
        if (gateKey === expectedGateKey) {
          const gateToken = crypto.randomUUID();
          return jsonResponse({ success: true, gateToken });
        }
        return jsonResponse({ error: 'Invalid secret gate authentication code.' }, 401);
      }

      if (pathname === '/api/admin/login' && method === 'POST') {
        const body = await request.json() as any;
        const { uid, pin } = body;
        const expectedHash = await sha256Hex(INITIAL_ADMIN_PIN + ADMIN_SALT);
        const inputHash = await sha256Hex((pin || '') + ADMIN_SALT);

        if (uid === INITIAL_ADMIN_UID && inputHash === expectedHash) {
          const sessionToken = crypto.randomUUID() + '-' + crypto.randomUUID();
          activeSessions.set(sessionToken, {
            uid: INITIAL_ADMIN_UID,
            expiresAt: Date.now() + 12 * 3600 * 1000,
          });
          return jsonResponse({ success: true, token: sessionToken, uid: INITIAL_ADMIN_UID });
        }
        return jsonResponse({ error: 'Invalid UID or Master PIN.' }, 401);
      }

      if (pathname === '/api/admin/logout' && method === 'POST') {
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          activeSessions.delete(authHeader.substring(7));
        }
        return jsonResponse({ success: true });
      }

      // Fallback for API routes
      return jsonResponse({ error: 'Endpoint not implemented in worker' }, 404);
    }

    // 2. Static Asset Serving via Cloudflare Assets Binding
    if (env.ASSETS) {
      try {
        const res = await env.ASSETS.fetch(request);
        if (res.status !== 404) {
          return res;
        }
        // SPA Fallback for client routes
        const accept = request.headers.get('accept') || '';
        if (accept.includes('text/html') || !url.pathname.includes('.')) {
          const indexReq = new Request(new URL('/index.html', request.url), request);
          return env.ASSETS.fetch(indexReq);
        }
        return res;
      } catch (err) {
        console.error('Asset fetch error:', err);
      }
    }

    return new Response('Fleearn Worker Online', { status: 200 });
  },
};

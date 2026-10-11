// @ts-nocheck
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "*" };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    
    if (url.pathname.startsWith("/api/")) {
      try {
        // --- LOGIN ---
        if (url.pathname.includes("admin/login")) {
          const b = await request.json().catch(()=>({}));
          if (b.uid === "250660" && b.pin === "1331") return Response.json({ success: true, token: "adm_"+Date.now() }, { headers: cors });
          return Response.json({ success: false, error: "Invalid" }, { status: 401, headers: cors });
        }

        // --- CREATE TABLES ---
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS plans (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price INTEGER, duration TEXT, daily_profit TEXT, data TEXT, created_at TEXT)`).run();
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS apps (id INTEGER PRIMARY KEY AUTOINCREMENT, app_name TEXT, package_name TEXT, version TEXT, status TEXT, apk_key TEXT, created_at TEXT)`).run();
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS stats (id INTEGER PRIMARY KEY AUTOINCREMENT, total_users INTEGER, active_users INTEGER, banned_accounts INTEGER, total_transactions INTEGER, created_at TEXT)`).run();

        // --- FILE UPLOAD ---
        if (request.method === "POST" && (request.headers.get("content-type")||"").includes("multipart")) {
          const fd = await request.formData();
          let file=null; for(const v of fd.values()) if(v instanceof File && v.size>0){file=v;break;}
          if(file){
            const key=`apks/${Date.now()}-${file.name}`;
            await env.R2_STORAGE.put(key, await file.arrayBuffer());
            return Response.json({ success: true, key, url: key }, { headers: cors });
          }
        }

        const body = await request.json().catch(()=>null);
        
        // --- PLANS API ---
        if (url.pathname.includes("plans") || url.pathname.includes("plan")) {
          if (request.method === "GET") {
            const { results } = await env.DB.prepare(`SELECT * FROM plans ORDER BY id DESC`).all();
            return Response.json({ success: true, plans: results, data: results }, { headers: cors });
          }
          if (request.method === "POST" && body) {
            await env.DB.prepare(`INSERT INTO plans (name, price, duration, daily_profit, data, created_at) VALUES (?,?,?,?,?,?)`).bind(body.name||body.title||"Plan", body.price||0, body.duration||"", body.daily_profit||"", JSON.stringify(body), new Date().toISOString()).run();
            return Response.json({ success: true, message: "Plan created" }, { headers: cors });
          }
        }

        // --- APPS / STATS SAVE ---
        if (request.method === "POST" && body) {
           if(body.app_name || body.package_name){
             await env.DB.prepare(`INSERT INTO apps (app_name, package_name, version, status, apk_key, created_at) VALUES (?,?,?,?,?,?)`).bind(body.app_name||"App", body.package_name||"", body.version||"1.0", body.status||"Active", body.apk_key||"", new Date().toISOString()).run();
           }
           return Response.json({ success: true }, { headers: cors });
        }

        if (request.method === "GET") {
           const { results } = await env.DB.prepare(`SELECT * FROM plans ORDER BY id DESC`).all();
           return Response.json({ success: true, data: results, plans: results }, { headers: cors });
        }

        return Response.json({ success: true }, { headers: cors });
      } catch(e){ return Response.json({ success: false, error: e.message }, { headers: cors }); }
    }
    return env.ASSETS.fetch(request);
  }
}

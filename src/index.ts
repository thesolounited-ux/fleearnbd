export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    if (url.pathname.startsWith("/api/")) {
      try {
        // 1. FILE UPLOAD - R2 তে
        if (url.pathname.includes("upload") && request.method === "POST") {
          const form = await request.formData();
          const file = form.get("file") || form.get("apk") || form.get("apk_file");
          if (!file) throw new Error("File not found in request");

          const packageName = form.get("package_name") || form.get("packageName") || "app";
          const key = `apks/${packageName}-${Date.now()}.apk`;

          await env.R2_STORAGE.put(key, file.stream(), {
            httpMetadata: { contentType: "application/vnd.android.package-archive" }
          });

          return Response.json({ success: true, key: key, url: key }, { headers: cors });
        }

        // 2. STATS & APPS SAVE - D1 তে
        if (request.method === "POST") {
          let body: any = {};
          const ct = request.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            body = await request.json();
          } else {
            const fd = await request.formData();
            fd.forEach((v, k) => body[k] = v);
          }

          // Table বানানো
          await env.DB.prepare(`CREATE TABLE IF NOT EXISTS stats (id INTEGER PRIMARY KEY AUTOINCREMENT, total_users INTEGER, active_users INTEGER, banned_accounts INTEGER, total_transactions INTEGER, created_at TEXT)`).run();
          await env.DB.prepare(`CREATE TABLE IF NOT EXISTS apps (id INTEGER PRIMARY KEY AUTOINCREMENT, app_name TEXT, package_name TEXT, version TEXT, status TEXT, download_method TEXT, apk_key TEXT, created_at TEXT)`).run();

          // যদি stats data হয়
          if (body.total_users!== undefined) {
            await env.DB.prepare(`INSERT INTO stats (total_users, active_users, banned_accounts, total_transactions, created_at) VALUES (?,?,?,?,?)`)
             .bind(body.total_users||0, body.active_users||0, body.banned_accounts||0, body.total_transactions||0, new Date().toISOString()).run();
          }
          // যদি app data হয়
          if (body.app_name || body.package_name || body.packageName) {
            await env.DB.prepare(`INSERT INTO apps (app_name, package_name, version, status, download_method, apk_key, created_at) VALUES (?,?,?,?,?,?,?)`)
             .bind(body.app_name||"Fleearn Mobile", body.package_name||body.packageName||"", body.version||"1.0", body.status||"Active (Visible)", body.download_method||"", body.apk_key||"", new Date().toISOString()).run();
          }

          return Response.json({ success: true }, { headers: cors });
        }

        return Response.json({ success: true }, { headers: cors });
      } catch (e: any) {
        return Response.json({ success: false, error: e.message }, { status: 500, headers: cors });
      }
    }
    return env.ASSETS.fetch(request);
  }
}

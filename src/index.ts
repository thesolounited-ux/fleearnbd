export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        if (request.method === "POST") {
          const b = await request.json();
          await env.DB.prepare("CREATE TABLE IF NOT EXISTS stats (id INTEGER PRIMARY KEY AUTOINCREMENT, total_users INTEGER, active_users INTEGER, banned_accounts INTEGER, total_transactions INTEGER, created_at TEXT)").run();
          await env.DB.prepare("INSERT INTO stats (total_users, active_users, banned_accounts, total_transactions, created_at) VALUES (?,?,?,?,?)").bind(b.total_users||0, b.active_users||0, b.banned_accounts||0, b.total_transactions||0, new Date().toISOString()).run();
          return Response.json({ success: true });
        }
        if (request.method === "GET") {
          const r = await env.DB.prepare("SELECT * FROM stats ORDER BY id DESC LIMIT 1").first().catch(()=>null);
          return Response.json(r || {});
        }
      } catch (e) {
        return Response.json({ success: true, warning: e.message });
      }
    }
    return env.ASSETS.fetch(request);
  }
}

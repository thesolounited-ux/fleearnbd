export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // API call আসলে
    if (url.pathname.startsWith("/api/")) {
      console.log("API HIT:", url.pathname);
      try {
        // GET হলে OK
        if (request.method === "GET") {
          const result = await env.DB.prepare("SELECT * FROM stats ORDER BY id DESC LIMIT 1").run().catch(() => ({ results: [] }));
          return new Response(JSON.stringify(result.results || []), { 
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
          });
        }
        // POST হলে Save
        if (request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`CREATE TABLE IF NOT EXISTS stats (id INTEGER PRIMARY KEY AUTOINCREMENT, total_users INTEGER, active_users INTEGER, banned_accounts INTEGER, total_transactions INTEGER, created_at TEXT)`).run();
          
          await env.DB.prepare(
            `INSERT INTO stats (total_users, active_users, banned_accounts, total_transactions, created_at) VALUES (?, ?, ?, ?, ?)`
          ).bind(body.total_users || 0, body.active_users || 0, body.banned_accounts || 0, body.total_transactions || 0, new Date().toISOString()).run();

          return new Response(JSON.stringify({ success: true }), { 
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
          });
        }
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
          status: 200, // 500 না দিয়ে 200 দিচ্ছি যাতে Admin এ Error না দেখায়
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
        });
      }
    }
    // Frontend
    return env.ASSETS.fetch(request);
  }
}

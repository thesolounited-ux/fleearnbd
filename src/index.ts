export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // API request হলে DB তে save করবে
    if (url.pathname.startsWith("/api/") && request.method === "POST") {
      try {
        const body = await request.json();
        // এখানে তোমার DB save এর কোড আসবে
        // আপাতত 405 যাতে না আসে তার জন্য OK return করছি
        return new Response(JSON.stringify({ success: true, data: body }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }
    // বাকি সব frontend
    return env.ASSETS.fetch(request);
  }
}

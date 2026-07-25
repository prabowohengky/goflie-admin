export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Home
    if (url.pathname === "/") {
      return new Response("Goflie Admin API");
    }

    // Create Short Link
    if (url.pathname === "/api/create" && request.method === "POST") {
      const body = await request.json();

      await env.DB.prepare(
        "INSERT INTO links (slug, original_url, created_at) VALUES (?, ?, ?)"
      )
        .bind(
          body.slug,
          body.original_url,
          Date.now()
        )
        .run();

      return Response.json({
        success: true
      });
    }

    // List Links
    if (url.pathname === "/api/list") {
      const result = await env.DB.prepare(
        "SELECT * FROM links ORDER BY created_at DESC"
      ).all();

      return Response.json(result.results);
    }

    return new Response("404 Not Found", {
      status: 404
    });
  }
}

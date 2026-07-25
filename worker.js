export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Home
    if (url.pathname === "/") {
      return new Response("Goflie Admin API");
    }

    // List links
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

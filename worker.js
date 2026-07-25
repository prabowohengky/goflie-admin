export default {
  async fetch(request, env) {
    const url = new URL(request.url);
if (url.pathname === "/index.html") {
  const html = await fetch(
    "https://raw.githubusercontent.com/prabowohengky/goflie-admin/main/index.html"
  ).then(r => r.text());

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=UTF-8"
    }
  });
}
    // Home
    if (url.pathname === "/") {
      return new Response("GoFlie Admin API");
    }

    // List links
    if (url.pathname === "/api/list") {
      const { results } = await env.DB
        .prepare("SELECT * FROM links ORDER BY created_at DESC")
        .all();

      return Response.json(results);
    }

    // Create link
    if (url.pathname === "/api/create" && request.method === "POST") {
      const body = await request.json();

      await env.DB.prepare(
        "INSERT INTO links (slug, original_url, title, created_at) VALUES (?, ?, ?, ?)"
      )
        .bind(
          body.slug,
          body.url,
          "",
          Date.now()
        )
        .run();

      return Response.json({
        success: true
      });
    }

    // Delete link
    if (url.pathname.startsWith("/api/delete/")) {
      const slug = url.pathname.split("/").pop();

      await env.DB.prepare(
        "DELETE FROM links WHERE slug=?"
      )
        .bind(slug)
        .run();

      return Response.json({
        success: true
      });
    }
// Redirect
const slug = url.pathname.slice(1);

if (
  slug &&
  slug !== "index.html" &&
  !slug.startsWith("api/")
) {
  const row = await env.DB.prepare(
    "SELECT original_url FROM links WHERE slug=?"
  ).bind(slug).first();

  if (row) {
    return Response.redirect(row.original_url, 302);
  }
}
    return new Response("404 Not Found", {
      status: 404
    });
  }
}

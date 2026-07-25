export default {
  async fetch(request, env) {

    const url = new URL(request.url);

// Dashboard
if (url.pathname === "/" || url.pathname === "/index.html") {

return Response.redirect(
"https://prabowohengky.github.io/goflie-admin/",
302
);

}

    // List
    if (url.pathname === "/api/list") {

      const { results } = await env.DB.prepare(
        "SELECT slug, original_url FROM links ORDER BY rowid DESC"
      ).all();

      return Response.json(results);

    }

    // Create
    if (url.pathname === "/api/create" && request.method === "POST") {

      const body = await request.json();

      await env.DB.prepare(
        "INSERT INTO links(slug, original_url) VALUES(?,?)"
      )
      .bind(body.slug, body.url)
      .run();

      return Response.json({
        success:true
      });

    }

    // Update
    if (url.pathname === "/api/update" && request.method === "POST") {

      const body = await request.json();

      await env.DB.prepare(
        "UPDATE links SET original_url=? WHERE slug=?"
      )
      .bind(body.url, body.slug)
      .run();

      return Response.json({
        success:true
      });

    }

    // Delete
    if (url.pathname.startsWith("/api/delete/")) {

      const slug = url.pathname.split("/").pop();

      await env.DB.prepare(
        "DELETE FROM links WHERE slug=?"
      )
      .bind(slug)
      .run();

      return Response.json({
        success:true
      });

    }

    // Redirect
    const slug = url.pathname.substring(1);

    if (slug) {

      const row = await env.DB.prepare(
        "SELECT original_url FROM links WHERE slug=?"
      )
      .bind(slug)
      .first();

      if (row) {
        return Response.redirect(row.original_url, 302);
      }

    }

    return new Response("Not Found", {
      status:404
    });

  }
}

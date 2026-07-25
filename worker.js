export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Dashboard (Serve HTML for both / and /index.html)
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(HTML_DASHBOARD, {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
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
      if (!body.slug || !body.url) {
        return Response.json({ success: false, error: "Missing slug or url" }, { status: 400 });
      }
      await env.DB.prepare(
        "INSERT INTO links(slug, original_url) VALUES(?,?)"
      )
      .bind(body.slug, body.url)
      .run();
      return Response.json({ success: true });
    }

    // Update
    if (url.pathname === "/api/update" && request.method === "POST") {
      const body = await request.json();
      await env.DB.prepare(
        "UPDATE links SET original_url=? WHERE slug=?"
      )
      .bind(body.url, body.slug)
      .run();
      return Response.json({ success: true });
    }

    // Delete
    if (url.pathname.startsWith("/api/delete/")) {
      const slug = url.pathname.split("/").pop();
      await env.DB.prepare(
        "DELETE FROM links WHERE slug=?"
      )
      .bind(slug)
      .run();
      return Response.json({ success: true });
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
      status: 404
    });
  }
};

const HTML_DASHBOARD = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GoFlie Admin v2</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#111;color:#fff;font-family:Arial,sans-serif;max-width:1100px;margin:auto;padding:20px;}
h1{text-align:center;margin-bottom:20px;}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;}
.total{font-size:18px;font-weight:bold;}
input{width:100%;padding:12px;margin:8px 0;background:#222;color:#fff;border:1px solid #444;border-radius:6px;}
button{padding:10px 16px;border:none;border-radius:6px;cursor:pointer;color:#fff;}
.add{background:#00c853;width:100%;margin-top:5px;}
.copy{background:#1565c0;margin-right:5px;}
.edit{background:#ff9800;margin-right:5px;}
.delete{background:#d50000;}
.refresh{background:#555;}
table{width:100%;margin-top:20px;border-collapse:collapse;}
th,td{border:1px solid #333;padding:10px;text-align:left;}
th{background:#222;}
a{color:#00e5ff;text-decoration:none;}
.search{margin-top:10px;}
@mediamax-width:768px
</style>
</head>
<body>

<h1>GoFlie Admin v2</h1>

<div class="top">
<div class="total">Total Links : <span id="total">0</span></div>
<button class="refresh" onclick="load()">Refresh</button>
</div>

<input id="search" class="search" placeholder="Search slug..." onkeyup="searchLinks()">
<input id="slug" placeholder="Enter custom slug (e.g. my-link)">
<input id="url" placeholder="https://example.com">
<button class="add" onclick="create()">➕ Add Link</button>

<table>
<thead>
<tr>
<th>Slug</th>
<th>Original URL</th>
<th>Action</th>
</tr>
</thead>
<tbody id="list">
</tbody>
</table>

<script>
let allLinks = [];

async function load() {
    const res = await fetch('/api/list');
    allLinks = await res.json();
    displayLinks(allLinks);
}

function displayLinks(links) {
    const tbody = document.getElementById('list');
    document.getElementById('total').innerText = links.length;
    tbody.innerHTML = '';
    
    links.

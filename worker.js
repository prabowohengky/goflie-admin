forEach(item => {
        const tr = document.createElement('tr');
        const shortUrl = window.location.origin + '/' + item.slug;
        tr.innerHTML = \`
            <td><a href="/\${item.slug}" target="_blank">\${item.slug}</a></td>
            <td><a href="\${item.original_url}" target="_blank">\${item.original_url}</a></td>
            <td>
                <button class="copy" onclick="copyText('\${shortUrl}')">Copy</button>
                <button class="edit" onclick="editLink('\${item.slug}', '\${item.original_url}')">Edit</button>
                <button class="delete" onclick="deleteLink('\${item.slug}')">Delete</button>
            </td>
        \`;
        tbody.appendChild(tr);
    });
}

async function create() {
    const slug = document.getElementById('slug').value.trim();
    const url = document.getElementById('url').value.trim();
    if (!slug || !url) {
        alert('Please fill in both slug and URL');
        return;
    }
    const res = await fetch('/api/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({slug, url})
    });
    if (res.ok) {
        document.getElementById('slug').value = '';
        document.getElementById('url').value = '';
        load();
    } else {
        alert('Error creating link');
    }
}

async function editLink(slug, oldUrl) {
    const newUrl = prompt('Enter new URL:', oldUrl);
    if (!newUrl) return;
    const res = await fetch('/api/update', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({slug, url: newUrl})
    });
    if (res.ok) load();
}

async function deleteLink(slug) {
    if (!confirm('Are you sure you want to delete ' + slug + '?')) return;
    const res = await fetch('/api/delete/' + slug);
    if (res.ok) load();
}

function copyText(text) {
    navigator.clipboard.writeText(text);
    alert('Copied: ' + text);
}

function searchLinks() {
    const query = document.getElementById('search').value.toLowerCase();
    const filtered = allLinks.filter(item => item.slug.toLowerCase().includes(query));
    displayLinks(filtered);
}

load();
</script>
</body>
</html>`;

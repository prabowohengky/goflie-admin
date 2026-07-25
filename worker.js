export default {
  async fetch(request, env) {
    return new Response("Goflie Admin is working!", {
      headers: {
        "Content-Type": "text/plain"
      }
    });
  }
}

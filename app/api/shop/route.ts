export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) {
      return Response.json({ error: text || "n8n returned an error" }, { status: res.status });
    }
    return new Response(text || "[]", { headers: { "Content-Type": "application/json" } });
  } catch {
    return Response.json({ error: "Cannot reach n8n workflow" }, { status: 502 });
  }
}
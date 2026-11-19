export type Action = "getAll" | "create" | "update" | "delete";

export async function shop(
  table: string,
  action: Action,
  payload: { id?: number; data?: Record<string, unknown> } = {}
) {
  const res = await fetch("/api/shop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, action, ...payload }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error ?? json?.message ?? "Request failed";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  const rows = Array.isArray(json) ? json : json ? [json] : [];
  return rows.filter((r: any) => r && r.id !== undefined);
}
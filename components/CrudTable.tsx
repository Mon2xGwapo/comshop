"use client";
import { useCallback, useEffect, useState } from "react";
import { shop } from "@/lib/api";
import { TABLES, Field } from "@/lib/schema";

type Row = Record<string, any>;

const toLocalInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function CrudTable({ table }: { table: string }) {
  const cfg = TABLES[table];
  const [rows, setRows] = useState<Row[]>([]);
  const [refs, setRefs] = useState<Record<string, Row[]>>({});
  const [form, setForm] = useState<Row>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await shop(table, "getAll"));
      const refTables = [...new Set(cfg.fields.filter(f => f.ref).map(f => f.ref!.table))];
      const entries = await Promise.all(refTables.map(async t => [t, await shop(t, "getAll")] as const));
      setRefs(Object.fromEntries(entries));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [table, cfg]);

  useEffect(() => { load(); }, [load]);

  const reset = () => { setForm({}); setEditingId(null); };

  const startEdit = (row: Row) => {
    const f: Row = {};
    cfg.fields.forEach(fd => {
      f[fd.name] = fd.type === "datetime" ? toLocalInput(row[fd.name]) : row[fd.name] ?? "";
    });
    setForm(f);
    setEditingId(row.id);
  };

  const buildPayload = () => {
    const data: Row = {};
    cfg.fields.forEach(fd => {
      const v = form[fd.name];
      if (v === "" || v === undefined) { if (!fd.required) data[fd.name] = null; return; }
      if (fd.type === "number" || fd.ref) data[fd.name] = Number(v);
      else if (fd.type === "datetime") data[fd.name] = new Date(v).toISOString();
      else data[fd.name] = v;
    });
    return data;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = buildPayload();
      if (editingId) await shop(table, "update", { id: editingId, data });
      else await shop(table, "create", { data });
      reset();
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this record?")) return;
    setError("");
    try {
      await shop(table, "delete", { id });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const display = (fd: Field, row: Row) => {
    const v = row[fd.name];
    if (v === null || v === undefined) return "—";
    if (fd.ref) return refs[fd.ref.table]?.find(r => r.id === v)?.[fd.ref.label] ?? v;
    if (fd.type === "datetime") return new Date(v).toLocaleString();
    return String(v);
  };

  const input = "w-full rounded border border-gray-600 bg-gray-900 px-2 py-1.5 text-sm text-white";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{cfg.title}</h1>

      {error && <div className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={submit} className="grid gap-3 rounded border p-4 sm:grid-cols-2 lg:grid-cols-3">
        {cfg.fields.map(fd => (
          <label key={fd.name} className="text-sm">
            <span className="mb-1 block font-medium">{fd.label}{fd.required && " *"}</span>
            {fd.type === "select" ? (
              <select className={input} required={fd.required} value={form[fd.name] ?? ""}
                onChange={e => setForm({ ...form, [fd.name]: e.target.value })}>
                <option value="">Select…</option>
                {fd.ref
                ? refs[fd.ref.table]?.map(r => (
                 <option key={r.id} value={r.id} className="bg-gray-900 text-white">{r[fd.ref!.label]}</option>
                ))
                 : fd.options?.map(o => (
                  <option key={o} value={o} className="bg-gray-900 text-white">{o}</option>
                ))}
              </select>
            ) : (
              <input className={input} required={fd.required}
                type={fd.type === "number" ? "number" : fd.type === "datetime" ? "datetime-local" : "text"}
                step={fd.type === "number" ? "0.01" : undefined}
                value={form[fd.name] ?? ""}
                onChange={e => setForm({ ...form, [fd.name]: e.target.value })} />
            )}
          </label>
        ))}
        <div className="flex items-end gap-2">
          <button disabled={saving} className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white disabled:opacity-50 cursor-pointer">
            {saving ? "Saving…" : editingId ? "Update" : "Add"}
          </button>
          {editingId && <button type="button" onClick={reset} className="rounded border px-4 py-1.5 text-sm cursor-pointer">Cancel</button>}
        </div>
      </form>

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-left text-sm">
          <thead className="bg-black-100">
            <tr>
              <th className="p-2">ID</th>
              {cfg.fields.map(f => <th key={f.name} className="p-2">{f.label}</th>)}
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-gray-500" colSpan={cfg.fields.length + 2}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="p-4 text-gray-500" colSpan={cfg.fields.length + 2}>No records yet.</td></tr>
            ) : rows.map(row => (
              <tr key={row.id} className="border-t">
                <td className="p-2">{row.id}</td>
                {cfg.fields.map(f => <td key={f.name} className="p-2">{display(f, row)}</td>)}
                <td className="space-x-2 p-2">
                  <button onClick={() => startEdit(row)} className="text-blue-600 cursor-pointer">Edit</button>
                  <button onClick={() => remove(row.id)} className="text-red-600 cursor-pointer">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
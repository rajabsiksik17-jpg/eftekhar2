"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { EntitySchema, Field } from "@/lib/admin/schemas";
import {
  Loader2,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { IconPicker } from "@/components/admin/IconPicker";

type Row = Record<string, unknown>;

export function EntityManager({ entity, schema }: { entity: string; schema: EntitySchema }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const pageSize = schema.listPageSize ?? 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/${entity}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`,
        { cache: "no-store" },
      );
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      setRows(json.data.items ?? []);
      setCount(json.data.count ?? 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [entity, page, pageSize, search]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (data: Row) => {
    setSaving(true);
    try {
      const isEdit = Boolean(editing?.id);
      const res = await fetch(
        isEdit ? `/api/admin/${entity}/${editing!.id}` : `/api/admin/${entity}`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...schema.hiddenDefaults, ...data }),
        },
      );
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      toast.success(isEdit ? "تم التحديث" : "تم الإنشاء");
      setEditing(null);
      setCreating(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Row) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`/api/admin/${entity}/${row.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      toast.success("تم الحذف");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    }
  };

  const reorder = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setRows(next);
    try {
      await fetch(`/api/admin/${entity}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((r) => r.id) }),
      });
      toast.success("تم إعادة الترتيب");
      load();
    } catch {
      /* noop */
    }
  };

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="بحث..."
            className="input w-64 ps-9"
          />
        </div>
        {schema.fields.length > 0 && (
          <button onClick={() => setCreating(true)} className="btn-primary btn-md">
            <Plus className="h-4 w-4" />
            إضافة {schema.singular}
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-950/10 bg-brand-50/50 text-start">
                {schema.columns.map((c) => (
                  <th key={c.key} className="whitespace-nowrap px-4 py-3 text-start font-semibold text-brand-700">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={schema.columns.length + 1} className="py-10 text-center text-ink-muted">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={schema.columns.length + 1} className="py-10 text-center text-ink-muted">
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={String(row.id)} className="border-b border-brand-950/5 hover:bg-brand-50/40">
                    {schema.columns.map((c) => (
                      <td key={c.key} className="max-w-[220px] truncate px-4 py-3 text-ink-secondary">
                        <Cell row={row} column={c} />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => reorder(i, -1)} className="rounded p-1 text-ink-muted hover:bg-brand-100" aria-label="Up">
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button onClick={() => reorder(i, 1)} className="rounded p-1 text-ink-muted hover:bg-brand-100" aria-label="Down">
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        {schema.fields.length > 0 && (
                          <>
                            <button onClick={() => setEditing(row)} className="rounded p-1 text-brand-600 hover:bg-brand-100" aria-label="Edit">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => remove(row)} className="rounded p-1 text-red-500 hover:bg-red-50" aria-label="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-brand-600">
          <span>الإجمالي: {count}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline btn-sm">السابق</button>
            <span className="flex items-center">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-outline btn-sm">التالي</button>
          </div>
        </div>
      )}

      {(creating || editing) && (
        <EntityForm
          schema={schema}
          initial={editing ?? {}}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={save}
          saving={saving}
        />
      )}
    </div>
  );
}

function Cell({ row, column }: { row: Row; column: { key: string; label: string; type?: string; badgeMap?: Record<string, string> } }) {
  const v = row[column.key];
  if (column.type === "boolean") {
    return v ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">نعم</span> : <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-600">لا</span>;
  }
  if (column.type === "date" && v) {
    return <span className="whitespace-nowrap text-brand-600">{new Date(String(v)).toLocaleDateString("ar")}</span>;
  }
  if (column.type === "badge" && column.badgeMap) {
    return <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">{column.badgeMap[String(v)] ?? String(v)}</span>;
  }
  return <span>{String(v ?? "")}</span>;
}

function EntityForm({
  schema,
  initial,
  onClose,
  onSave,
  saving,
}: {
  schema: EntitySchema;
  initial: Row;
  onClose: () => void;
  onSave: (data: Row) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<Row>(() => {
    const base: Row = {};
    for (const f of schema.fields) {
      base[f.name] = initial[f.name] ?? (f.type === "boolean" ? false : "");
    }
    return base;
  });

  const set = (name: string, value: unknown) => setForm((f) => ({ ...f, [name]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Row = { ...form };
    for (const f of schema.fields) {
      if (f.type === "json") {
        const raw = String(form[f.name] ?? "");
        if (raw.trim()) {
          try {
            data[f.name] = JSON.parse(raw);
          } catch {
            toast.error(`صيغة JSON غير صحيحة في: ${f.label}`);
            return;
          }
        } else {
          data[f.name] = f.name === "bullets" ? [] : null;
        }
      }
      if (f.type === "number") data[f.name] = form[f.name] === "" ? null : Number(form[f.name]);
      if (f.type === "boolean") data[f.name] = Boolean(form[f.name]);
    }
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl" dir="rtl">
        <div className="flex items-center justify-between border-b border-brand-950/10 p-5">
          <h2 className="text-lg font-bold text-brand-950">
            {initial.id ? `تعديل ${schema.singular}` : `إضافة ${schema.singular}`}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-muted hover:bg-brand-50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2">
          {schema.fields.map((f) => (
            <FieldInput key={f.name} field={f} value={form[f.name]} onChange={(v) => set(f.name, v)} />
          ))}
          <div className="col-span-full flex justify-end gap-2 border-t border-brand-950/10 pt-4">
            <button type="button" onClick={onClose} className="btn-ghost btn-md">إلغاء</button>
            <button type="submit" disabled={saving} className="btn-primary btn-md">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const full = field.type === "textarea" || field.type === "json" || field.type === "image";
  const label = (
    <label className="label">
      {field.label}
      {field.required && <span className="text-red-500"> *</span>}
    </label>
  );

  return (
    <div className={cn(full && "sm:col-span-2")}>
      {label}
      {field.type === "textarea" ? (
        <textarea className="input min-h-[80px] resize-y" rows={field.rows ?? 3} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === "json" ? (
        <textarea className="input font-mono text-xs" dir="ltr" rows={field.rows ?? 3} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === "boolean" ? (
        <label className="flex items-center gap-2 rounded-xl border border-brand-950/15 px-4 py-2.5">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-brand-300 text-brand-600" />
          <span className="text-sm text-ink-secondary">مفعّل</span>
        </label>
      ) : field.type === "select" ? (
        <select className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          <option value="">— اختر —</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : field.type === "date" ? (
        <input type="date" className="input" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === "icon" ? (
        <IconPicker value={String(value ?? "")} onChange={onChange} />
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          className="input"
          dir={field.dir === "ltr" ? "ltr" : undefined}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.help && <p className="mt-1 text-xs text-brand-400">{field.help}</p>}
    </div>
  );
}

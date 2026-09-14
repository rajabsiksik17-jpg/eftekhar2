"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, X } from "lucide-react";

interface Role {
  id: string;
  name: string;
  slug: string;
}
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  is_super_admin: boolean;
  is_active: boolean;
  user_roles: { role_id: string }[];
}

export function UsersManager() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | null>(null);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role_ids: [] as string[], is_super_admin: false });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [u, r] = await Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/roles").then((r) => r.json()),
    ]);
    setUsers(u.data ?? []);
    setRoles(r.data?.roles ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      toast.success("تم إنشاء المستخدم");
      setModal(null);
      setForm({ email: "", password: "", full_name: "", role_ids: [], is_super_admin: false });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const update = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          full_name: editing.full_name,
          is_active: editing.is_active,
          is_super_admin: editing.is_super_admin,
          role_ids: editing.user_roles.map((r) => r.role_id),
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      toast.success("تم التحديث");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      <button onClick={() => setModal("create")} className="btn-primary btn-md"><Plus className="h-4 w-4" /> إضافة مستخدم</button>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-950/10 bg-brand-50/50">
              <th className="px-4 py-3 text-start">البريد الإلكتروني</th>
              <th className="px-4 py-3 text-start">الاسم</th>
              <th className="px-4 py-3 text-start">الأدوار</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-end">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-brand-950/5">
                <td className="px-4 py-3 text-brand-800" dir="ltr">{u.email}</td>
                <td className="px-4 py-3 text-brand-800">{u.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-brand-800">
                  {u.is_super_admin
                    ? "مدير عام"
                    : u.user_roles.map((r) => roles.find((x) => x.id === r.role_id)?.name ?? "؟").join("، ") || "—"}
                </td>
                <td className="px-4 py-3">
                  {u.is_active ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">نشط</span> : <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">معطّل</span>}
                </td>
                <td className="px-4 py-3 text-end">
                  <button onClick={() => setEditing(u)} className="rounded p-1 text-brand-600 hover:bg-brand-100"><Pencil className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === "create" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-brand-950">إضافة مستخدم</h2>
              <button onClick={() => setModal(null)}><X className="h-5 w-5 text-brand-500" /></button>
            </div>
            <form onSubmit={create} className="space-y-4">
              <div><label className="label">البريد الإلكتروني</label><input className="input" dir="ltr" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="label">كلمة المرور</label><input className="input" dir="ltr" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div><label className="label">الاسم الكامل</label><input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div>
                <label className="label">الأدوار</label>
                <div className="space-y-1">
                  {roles.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={form.role_ids.includes(r.id)} onChange={(e) => setForm({ ...form, role_ids: e.target.checked ? [...form.role_ids, r.id] : form.role_ids.filter((x) => x !== r.id) })} className="h-4 w-4" />
                      {r.name}
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_super_admin} onChange={(e) => setForm({ ...form, is_super_admin: e.target.checked })} className="h-4 w-4" />
                مدير عام
              </label>
              <button type="submit" disabled={saving} className="btn-primary btn-md w-full">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "إنشاء"}</button>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-brand-950">تعديل المستخدم</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-brand-500" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="label">الاسم الكامل</label><input className="input" value={editing.full_name ?? ""} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} /></div>
              <div>
                <label className="label">الأدوار</label>
                <div className="space-y-1">
                  {roles.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={editing.user_roles.some((x) => x.role_id === r.id)} onChange={(e) => setEditing({ ...editing, user_roles: e.target.checked ? [...editing.user_roles, { role_id: r.id }] : editing.user_roles.filter((x) => x.role_id !== r.id) })} className="h-4 w-4" />
                      {r.name}
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="h-4 w-4" /> نشط</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_super_admin} onChange={(e) => setEditing({ ...editing, is_super_admin: e.target.checked })} className="h-4 w-4" /> مدير عام</label>
              <button onClick={update} disabled={saving} className="btn-primary btn-md w-full">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface Role {
  id: string;
  name: string;
  slug: string;
  is_system: boolean;
}
interface Permission {
  id: string;
  name: string;
  slug: string;
  group: string | null;
}

export function RolesManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePerms, setRolePerms] = useState<{ role_id: string; permission_id: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/roles").then((r) => r.json()).then((j) => {
      setRoles(j.data?.roles ?? []);
      setPermissions(j.data?.permissions ?? []);
      setRolePerms(j.data?.role_permissions ?? []);
      setSelected(j.data?.roles?.[0]?.id ?? null);
    });
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const p of permissions) {
      const g = p.group ?? "other";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(p);
    }
    return Array.from(map.entries());
  }, [permissions]);

  const selectedIds = rolePerms.filter((rp) => rp.role_id === selected).map((rp) => rp.permission_id);
  const role = roles.find((r) => r.id === selected);

  const toggle = (pid: string) => {
    const has = selectedIds.includes(pid);
    setRolePerms((rp) => {
      if (has) return rp.filter((x) => !(x.role_id === selected && x.permission_id === pid));
      return [...rp, { role_id: selected!, permission_id: pid }];
    });
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/roles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role_id: selected, permission_ids: selectedIds }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      toast.success("تم حفظ الصلاحيات");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  if (!roles.length) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="card h-fit p-3">
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={cn(
              "mb-1 block w-full rounded-xl px-3 py-2 text-start text-sm font-medium transition",
              selected === r.id ? "bg-brand-600 text-white" : "text-brand-700 hover:bg-brand-50",
            )}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-brand-950">صلاحيات: {role?.name}</h2>
          <button onClick={save} disabled={saving} className="btn-primary btn-md">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ
          </button>
        </div>
        <div className="space-y-6">
          {groups.map(([group, perms]) => (
            <div key={group}>
              <h3 className="mb-2 text-sm font-semibold text-ink-muted">{group}</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {perms.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 rounded-xl border border-brand-950/10 px-3 py-2 text-sm">
                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4 rounded border-brand-300 text-brand-600" />
                    <span className="text-ink-secondary">{p.slug}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, X, Save } from "lucide-react";

type Row = Record<string, any>;

const FIELD_TYPES = [
  { value: "text", label: "نص (Text)" },
  { value: "textarea", label: "نص متعدد (Textarea)" },
  { value: "email", label: "بريد إلكتروني" },
  { value: "phone", label: "هاتف دولي" },
  { value: "number", label: "رقم" },
  { value: "date", label: "تاريخ" },
  { value: "time", label: "وقت" },
  { value: "datetime", label: "تاريخ ووقت" },
  { value: "select", label: "قائمة (Select)" },
  { value: "multiselect", label: "قائمة متعددة" },
  { value: "checkbox", label: "مربع اختيار" },
  { value: "radio", label: "خيارات (Radio)" },
  { value: "country", label: "الدولة" },
  { value: "file", label: "رفع ملف" },
  { value: "hidden", label: "مخفي" },
  { value: "url", label: "رابط" },
  { value: "categories", label: "تصنيفات الخدمات" },
  { value: "services", label: "الخدمات" },
  { value: "doctors", label: "الأطباء" },
  { value: "consent", label: "الموافقة" },
];

export function FormsManager() {
  const [forms, setForms] = useState<Row[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Row | null>(null);
  const [fields, setFields] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadForms = useCallback(async () => {
    const res = await fetch("/api/admin/forms").then((r) => r.json());
    const list = res.data ?? [];
    setForms(list);
    if (!selectedId && list.length) setSelectedId(list[0].id);
  }, [selectedId]);

  const loadForm = useCallback(async (id: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/forms/${id}`).then((r) => r.json());
    setForm(res.data?.form ?? null);
    setFields(res.data?.fields ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  useEffect(() => {
    if (selectedId) loadForm(selectedId);
  }, [selectedId, loadForm]);

  const call = async (method: string, path: string, body?: unknown) => {
    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);
    return json;
  };

  const saveForm = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await call("PATCH", `/api/admin/forms/${form.id}`, form);
      toast.success("تم حفظ النموذج");
      loadForms();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const createForm = async () => {
    setSaving(true);
    try {
      const res = await call("POST", "/api/admin/forms", { key: form?.key ?? "", name_ar: "نموذج جديد", name_en: "New Form" });
      setSelectedId(res.data.id);
      setCreating(false);
      toast.success("تم إنشاء النموذج");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const reorder = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    const [m] = next.splice(index, 1);
    next.splice(target, 0, m);
    setFields(next);
    await call("POST", `/api/admin/forms/${form!.id}/reorder`, { ids: next.map((f) => f.id) });
  };

  const deleteField = async (f: Row) => {
    if (!confirm("حذف هذا الحقل؟")) return;
    await call("DELETE", `/api/admin/forms/${form!.id}/fields/${f.id}`);
    loadForm(form!.id);
    toast.success("تم الحذف");
  };

  const toggleField = async (f: Row) => {
    await call("PATCH", `/api/admin/forms/${form!.id}/fields/${f.id}`, { is_active: !f.is_active });
    loadForm(form!.id);
  };

  const saveField = async (data: Row) => {
    setSaving(true);
    try {
      if (editing?.id) {
        await call("PATCH", `/api/admin/forms/${form!.id}/fields/${editing.id}`, data);
      } else {
        await call("POST", `/api/admin/forms/${form!.id}/fields`, data);
      }
      toast.success("تم حفظ الحقل");
      setEditing(null);
      setCreating(false);
      loadForm(form!.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="card h-fit p-3">
        {forms.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedId(f.id)}
            className={cn(
              "mb-1 block w-full rounded-xl px-3 py-2 text-start text-sm font-medium transition",
              selectedId === f.id ? "bg-brand-600 text-white" : "text-brand-700 hover:bg-brand-50",
            )}
          >
            {String(f.name_ar ?? f.key)}
          </button>
        ))}
        <button onClick={() => setCreating(true)} className="btn-outline btn-sm mt-3 w-full">
          <Plus className="h-4 w-4" /> نموذج جديد
        </button>
      </div>

      <div className="space-y-6">
        {form ? (
          <>
            <div className="card p-6">
              <h2 className="mb-4 font-bold text-brand-950">إعدادات النموذج</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="المعرّف (Key)"><input className="input" dir="ltr" value={String(form.key ?? "")} onChange={(e) => setForm({ ...form, key: e.target.value })} /></Field>
                <Field label="الاسم (عربي)"><input className="input" value={String(form.name_ar ?? "")} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} /></Field>
                <Field label="الاسم (إنجليزي)"><input className="input" dir="ltr" value={String(form.name_en ?? "")} onChange={(e) => setForm({ ...form, name_en: e.target.value })} /></Field>
                <Field label="نص زر الإرسال (عربي)"><input className="input" value={String(form.submit_button_ar ?? "")} onChange={(e) => setForm({ ...form, submit_button_ar: e.target.value })} /></Field>
                <Field label="نص زر الإرسال (إنجليزي)"><input className="input" dir="ltr" value={String(form.submit_button_en ?? "")} onChange={(e) => setForm({ ...form, submit_button_en: e.target.value })} /></Field>
                <Field label="رسالة النجاح (عربي)"><input className="input" value={String(form.success_message_ar ?? "")} onChange={(e) => setForm({ ...form, success_message_ar: e.target.value })} /></Field>
                <Field label="رسالة النجاح (إنجليزي)"><input className="input" dir="ltr" value={String(form.success_message_en ?? "")} onChange={(e) => setForm({ ...form, success_message_en: e.target.value })} /></Field>
                <Field label="بريد الإشعارات"><input className="input" dir="ltr" value={String(form.notify_email ?? "")} onChange={(e) => setForm({ ...form, notify_email: e.target.value })} /></Field>
                <Toggle label="تفعيل إشعار البريد" checked={Boolean(form.notify_enabled)} onChange={(v) => setForm({ ...form, notify_enabled: v })} />
                <Toggle label="النموذج نشط" checked={Boolean(form.is_active)} onChange={(v) => setForm({ ...form, is_active: v })} />
              </div>
              <button onClick={saveForm} disabled={saving} className="btn-primary btn-md mt-4">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ
              </button>
            </div>

            <div className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-brand-950">الحقول ({fields.length})</h2>
                <button onClick={() => setEditing({})} className="btn-primary btn-md"><Plus className="h-4 w-4" /> إضافة حقل</button>
              </div>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>
              ) : (
                <div className="space-y-2">
                  {fields.map((f, i) => (
                    <div key={f.id} className={cn("flex items-center gap-3 rounded-xl border border-brand-950/10 p-3", !f.is_active && "opacity-50")}>
                      <div className="flex flex-col">
                        <button onClick={() => reorder(i, -1)} className="rounded p-0.5 text-ink-muted hover:bg-brand-100"><ChevronUp className="h-4 w-4" /></button>
                        <button onClick={() => reorder(i, 1)} className="rounded p-0.5 text-ink-muted hover:bg-brand-100"><ChevronDown className="h-4 w-4" /></button>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-brand-950">{String(f.label_ar ?? f.name)}</div>
                        <div className="text-xs text-ink-muted" dir="ltr">{String(f.name)} · {String(f.field_type)}{f.required ? " · مطلوب" : ""}</div>
                      </div>
                      <button onClick={() => toggleField(f)} className="rounded p-1.5 text-ink-muted hover:bg-brand-100">{f.is_active ? "إخفاء" : "إظهار"}</button>
                      <button onClick={() => setEditing(f)} className="rounded p-1.5 text-brand-600 hover:bg-brand-100"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => deleteField(f)} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="card p-10 text-center text-ink-muted">اختر نموذجًا من القائمة</div>
        )}
      </div>

      {creating && (
        <Modal title="نموذج جديد" onClose={() => setCreating(false)}>
          <Field label="المعرّف (Key)">
            <input className="input" dir="ltr" value={String(form?.key ?? "")} onChange={(e) => setForm((f) => (f ? { ...f, key: e.target.value } : { key: e.target.value }))} />
          </Field>
          <button onClick={createForm} disabled={saving} className="btn-primary btn-md mt-4 w-full">إنشاء</button>
        </Modal>
      )}

      {editing && (
        <FieldEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={saveField}
          saving={saving}
        />
      )}
    </div>
  );
}

function FieldEditor({ initial, onClose, onSave, saving }: { initial: Row; onClose: () => void; onSave: (d: Row) => void; saving: boolean }) {
  const [f, setF] = useState<Row>(() => ({
    field_type: "text",
    name: "",
    label_ar: "",
    label_en: "",
    placeholder_ar: "",
    placeholder_en: "",
    help_text_ar: "",
    help_text_en: "",
    required: false,
    validation: "",
    default_value: "",
    options: [],
    ...initial,
  }));

  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.name || !f.label_ar) {
      toast.error("الاسم والمعرّف مطلوبان");
      return;
    }
    let options = f.options;
    if (typeof options === "string") {
      try {
        options = JSON.parse(options);
      } catch {
        options = [];
      }
    }
    onSave({ ...f, options });
  };

  const needsOptions = ["select", "multiselect", "radio"].includes(String(f.field_type));

  return (
    <Modal title={initial.id ? "تعديل حقل" : "إضافة حقل"} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="نوع الحقل">
          <select className="input" value={String(f.field_type)} onChange={(e) => set("field_type", e.target.value)}>
            {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="المعرّف (name)"><input className="input" dir="ltr" value={String(f.name ?? "")} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="التسمية (عربي)"><input className="input" value={String(f.label_ar ?? "")} onChange={(e) => set("label_ar", e.target.value)} /></Field>
        <Field label="التسمية (إنجليزي)"><input className="input" dir="ltr" value={String(f.label_en ?? "")} onChange={(e) => set("label_en", e.target.value)} /></Field>
        <Field label="العنصر النائب (عربي)"><input className="input" value={String(f.placeholder_ar ?? "")} onChange={(e) => set("placeholder_ar", e.target.value)} /></Field>
        <Field label="العنصر النائب (إنجليزي)"><input className="input" dir="ltr" value={String(f.placeholder_en ?? "")} onChange={(e) => set("placeholder_en", e.target.value)} /></Field>
        <Field label="نص مساعد (عربي)"><input className="input" value={String(f.help_text_ar ?? "")} onChange={(e) => set("help_text_ar", e.target.value)} /></Field>
        <Field label="القيمة الافتراضية"><input className="input" dir="ltr" value={String(f.default_value ?? "")} onChange={(e) => set("default_value", e.target.value)} /></Field>
        <Field label="التحقق (validation)" help="مثل: email, min:2, max:200, number"><input className="input" dir="ltr" value={String(f.validation ?? "")} onChange={(e) => set("validation", e.target.value)} /></Field>
        <Toggle label="مطلوب" checked={Boolean(f.required)} onChange={(v) => set("required", v)} />
      </div>
      {needsOptions && (
        <div className="mt-3">
          <Field label="الخيارات (JSON)" help='مثال: [{"value":"a","label":"الخيار"}]'>
            <textarea className="input min-h-[80px] font-mono text-xs" dir="ltr" value={typeof f.options === "string" ? f.options : JSON.stringify(f.options ?? [])} onChange={(e) => set("options", e.target.value)} />
          </Field>
        </div>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost btn-md">إلغاء</button>
        <button onClick={submit} disabled={saving} className="btn-primary btn-md">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}</button>
      </div>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4">
      <div className="my-8 w-full max-w-xl rounded-2xl bg-white p-6" dir="rtl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-brand-950">{title}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-ink-muted" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, help }: { label: string; children: React.ReactNode; help?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {help && <p className="mt-1 text-xs text-brand-400">{help}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-end pb-2">
      <label className="flex items-center gap-2 text-sm font-medium text-ink-secondary">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-brand-300 text-brand-600" />
        {label}
      </label>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface Service {
  id: string;
  name_ar: string;
  name_en: string;
}

export function ServiceSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch("/api/admin/services?pageSize=500")
      .then((r) => r.json())
      .then((j) => setServices(j.data?.items ?? []));
  }, []);

  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">— غير مرتبط —</option>
      {services.map((s) => (
        <option key={s.id} value={s.id}>{s.name_ar}</option>
      ))}
    </select>
  );
}

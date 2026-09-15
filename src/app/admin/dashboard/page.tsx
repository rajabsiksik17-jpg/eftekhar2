import { requireAdminPage } from "@/lib/admin/guard";
import { createServiceClient } from "@/lib/supabase/client";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { CalendarDays, MessageSquare, Scissors, Users, Images, Video } from "lucide-react";

export const dynamic = "force-dynamic";

async function count(table: string, filter?: string) {
  const service = createServiceClient();
  let q = service.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter, true);
  const { count } = await q;
  return count ?? 0;
}

export default async function DashboardPage() {
  const admin = await requireAdminPage();
  const service = createServiceClient();

  const today = new Date().toISOString().slice(0, 10);

  const [appointmentsToday, appointmentsTotal, messages, messagesUnread, services, doctors, gallery, videos] =
    await Promise.all([
      service.from("appointments").select("*", { count: "exact", head: true }).gte("created_at", `${today}T00:00:00`),
      service.from("appointments").select("*", { count: "exact", head: true }),
      service.from("contact_messages").select("*", { count: "exact", head: true }),
      service.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false),
      count("services"),
      service.from("doctors").select("*", { count: "exact", head: true }).eq("type", "doctor"),
      count("gallery_items"),
      count("videos"),
    ]);

  // last 14 days aggregates
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentAppointments } = await service
    .from("appointments")
    .select("created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true });
  const { data: recentMessages } = await service
    .from("contact_messages")
    .select("created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  const group = (rows: { created_at: string }[]) => {
    const map = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      map.set(d.toISOString().slice(0, 10), 0);
    }
    for (const r of rows) {
      const key = r.created_at.slice(0, 10);
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([day, count]) => ({
      day: day.slice(5),
      count,
    }));
  };

  const cards = [
    { label: "مواعيد اليوم", value: appointmentsToday.count ?? 0, icon: CalendarDays, color: "bg-brand-600" },
    { label: "إجمالي المواعيد", value: appointmentsTotal.count ?? 0, icon: CalendarDays, color: "bg-brand-700" },
    { label: "رسائل جديدة", value: messagesUnread.count ?? 0, icon: MessageSquare, color: "bg-gold-500" },
    { label: "الخدمات", value: services, icon: Scissors, color: "bg-brand-500" },
    { label: "الأطباء", value: doctors.count ?? 0, icon: Users, color: "bg-brand-800" },
    { label: "الصور", value: gallery, icon: Images, color: "bg-gold-400" },
    { label: "الفيديوهات", value: videos, icon: Video, color: "bg-brand-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-l from-brand-700 to-brand-900 p-6 text-white">
        <h1 className="text-xl font-bold">مرحبًا {admin.user.email}</h1>
        <p className="mt-1 text-sm text-brand-100/80">
          {admin.isSuperAdmin ? "لديك صلاحيات المدير العام." : "لوحة تحكم عيادات افتخار."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-4 p-4">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-2xl font-bold text-brand-950">{c.value}</div>
              <div className="text-sm text-ink-muted">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <DashboardCharts
        appointmentsPerDay={group(recentAppointments ?? [])}
        messagesPerDay={group(recentMessages ?? [])}
      />
    </div>
  );
}

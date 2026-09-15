import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin/guard";
import { getSchema } from "@/lib/admin/schemas";
import { EntityManager } from "@/components/admin/EntityManager";

export const dynamic = "force-dynamic";

const PERMISSION_MAP: Record<string, string> = {
  services: "services.view",
  "service-categories": "categories.view",
  doctors: "doctors.view",
  staff: "doctors.view",
  appointments: "appointments.view",
  messages: "messages.view",
  gallery: "gallery.view",
  videos: "videos.view",
  testimonials: "testimonials.view",
  "before-after": "gallery.view",
  media: "media.view",
  pages: "pages.view",
  navigation: "settings.view",
  "social-links": "settings.view",
  "hero-slides": "pages.view",
  "audit-logs": "security.view",
};

export default async function AdminEntityPage({ params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const schema = getSchema(entity);
  if (!schema) notFound();

  const permission = PERMISSION_MAP[entity];
  if (permission) await requireAdminPage(permission);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950">{schema.label}</h1>
        <p className="text-sm text-ink-muted">إدارة {schema.label.toLowerCase()}</p>
      </div>
      <EntityManager entity={entity} schema={schema} />
    </div>
  );
}

import { requireAdminPage } from "@/lib/admin/guard";
import { getSchema } from "@/lib/admin/schemas";
import { EntityManager } from "@/components/admin/EntityManager";

export const dynamic = "force-dynamic";

export default async function SeoPage() {
  await requireAdminPage("seo.view");
  const schema = getSchema("seo")!;
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950">SEO</h1>
        <p className="text-sm text-brand-500">إدارة بيانات SEO لكل مسار</p>
      </div>
      <EntityManager entity="seo" schema={schema} />
    </div>
  );
}

import { requireAdminPage } from "@/lib/admin/guard";
import { EmailSettingsForm } from "@/components/admin/EmailSettingsForm";

export const dynamic = "force-dynamic";

export default async function EmailPage() {
  await requireAdminPage("settings.view");
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-950">البريد الإلكتروني</h1>
        <p className="text-sm text-ink-muted">إعدادات SMTP و IMAP</p>
      </div>
      <EmailSettingsForm />
    </div>
  );
}

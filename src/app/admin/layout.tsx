import { headers } from "next/headers";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "لوحة التحكم | عيادات افتخار",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  return <AdminShell>{children}</AdminShell>;
}

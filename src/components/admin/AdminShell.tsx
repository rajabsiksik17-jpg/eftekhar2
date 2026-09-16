"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Home,
  FileText,
  Menu as MenuIcon,
  Share2,
  Scissors,
  Users,
  UserCog,
  Images,
  Video,
  ArrowLeftRight,
  Quote,
  FolderOpen,
  CalendarDays,
  MessageSquare,
  Search,
  BarChart3,
  Globe,
  Settings,
  Phone,
  Mail,
  Plug,
  ShieldCheck,
  ScrollText,
  X,
  LogOut,
  Loader2,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface Me {
  verified: boolean;
  email: string;
  user: { id: string; email: string; full_name: string | null; is_super_admin: boolean };
  permissions: string[];
}

const NAV: { group: string; items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  {
    group: "لوحة التحكم",
    items: [{ href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard }],
  },
  {
    group: "الموقع",
    items: [
      { href: "/admin/pages", label: "الصفحات", icon: FileText },
      { href: "/admin/navigation", label: "القائمة", icon: MenuIcon },
    ],
  },
  {
    group: "الخدمات",
    items: [
      { href: "/admin/service-categories", label: "التصنيفات", icon: Share2 },
      { href: "/admin/services", label: "الخدمات", icon: Scissors },
      { href: "/admin/service-content", label: "محتوى الخدمات", icon: FileText },
    ],
  },
  {
    group: "الفريق",
    items: [
      { href: "/admin/doctors", label: "الأطباء", icon: Users },
    ],
  },
  {
    group: "المحتوى",
    items: [
      { href: "/admin/gallery", label: "معرض الصور", icon: Images },
      { href: "/admin/videos", label: "معرض الفيديوهات", icon: Video },
      { href: "/admin/before-after", label: "قبل وبعد", icon: ArrowLeftRight },
      { href: "/admin/testimonials", label: "التقييمات", icon: Quote },
      { href: "/admin/media", label: "مكتبة الوسائط", icon: FolderOpen },
    ],
  },
  {
    group: "التواصل",
    items: [
      { href: "/admin/forms", label: "النماذج", icon: FileText },
      { href: "/admin/appointments", label: "المواعيد", icon: CalendarDays },
      { href: "/admin/messages", label: "الرسائل", icon: MessageSquare },
    ],
  },
  {
    group: "التسويق وSEO",
    items: [
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/analytics", label: "Google Analytics", icon: BarChart3 },
      { href: "/admin/search-console", label: "Search Console", icon: Globe },
    ],
  },
  {
    group: "الإعدادات",
    items: [
      { href: "/admin/settings", label: "معلومات الموقع", icon: Settings },
      { href: "/admin/social-links", label: "مواقع التواصل", icon: Share2 },
      { href: "/admin/email", label: "البريد الإلكتروني", icon: Mail },
      { href: "/admin/integrations", label: "التكاملات", icon: Plug },
      { href: "/admin/users", label: "المستخدمون", icon: Users },
      { href: "/admin/roles", label: "الأدوار والصلاحيات", icon: ShieldCheck },
      { href: "/admin/security", label: "الأمان", icon: ShieldCheck },
      { href: "/admin/audit-logs", label: "سجل النشاط", icon: ScrollText },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth/me", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const json = await res.json();
      const data = json.data as Me;
      setMe(data);
      if (!data.verified) {
        router.replace("/admin/login?step=otp");
      }
    } catch {
      router.replace("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!me?.verified) return null;

  return (
    <div className="min-h-screen bg-brand-50/50" dir="rtl">
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex flex-col border-e border-brand-950/10 bg-white transition-all",
          collapsed ? "w-[72px]" : "w-64",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-brand-950/10 px-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            اف
          </span>
          {!collapsed && <span className="truncate font-bold text-brand-950">عيادات افتخار</span>}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((g) => (
            <div key={g.group} className="mb-4">
              {!collapsed && (
                <div className="mb-1 px-2 text-xs font-semibold text-brand-400">{g.group}</div>
              )}
              {g.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-brand-600 text-white"
                        : "text-brand-700 hover:bg-brand-50",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-brand-950/10 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && "تسجيل الخروج"}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-brand-950/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className={cn("transition-all", collapsed ? "lg:ms-[72px]" : "lg:ms-64")}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-brand-950/10 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-700 hover:bg-brand-50 lg:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-brand-700 hover:bg-brand-50 lg:flex"
              aria-label="Toggle sidebar"
            >
              {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
            <ChevronLeft className="hidden h-4 w-4 text-brand-300 lg:block" />
            <span className="text-sm font-medium text-brand-600">لوحة التحكم</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/ar" target="_blank" className="text-sm text-brand-600 hover:text-ink-secondary">
              عرض الموقع
            </Link>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {(me.user.full_name ?? me.email).charAt(0).toUpperCase()}
              </span>
              <div className="hidden text-end sm:block">
                <div className="text-sm font-medium text-brand-950">{me.user.full_name ?? me.email}</div>
                <div className="text-xs text-ink-muted">{me.user.is_super_admin ? "مدير عام" : "مدير"}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

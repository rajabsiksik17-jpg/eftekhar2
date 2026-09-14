"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<"credentials" | "otp">(params.get("step") === "otp" ? "otp" : "credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message ?? "error");
      setStep("otp");
      toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message ?? "error");
      router.replace("/admin/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "رمز غير صحيح");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl" dir="rtl">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white">
            اف
          </span>
          <h1 className="mt-4 text-xl font-bold text-brand-950">عيادات افتخار للخدمات العلاجية</h1>
          <p className="text-sm text-brand-500">تسجيل دخول الإدارة</p>
        </div>

        {step === "credentials" ? (
          <form onSubmit={submitCredentials} className="space-y-4">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
                <input
                  type="email"
                  required
                  className="input ps-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2 text-brand-400" />
                <input
                  type="password"
                  required
                  className="input ps-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              متابعة
            </button>
          </form>
        ) : (
          <form onSubmit={submitOtp} className="space-y-4">
            <div className="text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-brand-600" />
              <p className="mt-2 text-sm text-brand-600">
                أدخل رمز التحقق المكوّن من 6 أرقام المرسل إلى بريدك الإلكتروني
              </p>
            </div>
            <div>
              <label className="label">رمز التحقق</label>
              <input
                type="text"
                inputMode="numeric"
                required
                maxLength={6}
                className="input text-center text-2xl tracking-[0.5em]"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                dir="ltr"
              />
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary btn-lg w-full">
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              تأكيد الدخول
            </button>
            <button type="button" onClick={() => setStep("credentials")} className="btn-ghost btn-md w-full">
              العودة لتسجيل الدخول
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

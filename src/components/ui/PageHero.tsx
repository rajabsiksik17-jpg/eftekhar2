import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHero({
  title,
  subtitle,
  breadcrumb,
  children,
  className,
}: {
  title: string;
  subtitle?: string | null;
  breadcrumb?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("bg-brand-950 py-16 text-white", className)}>
      <div className="container-px">
        {breadcrumb}
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-brand-100/85">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

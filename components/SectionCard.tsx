import { PropsWithChildren } from "react";
import clsx from "clsx";

interface SectionCardProps extends PropsWithChildren {
  title?: string;
  className?: string;
  subtitle?: string;
}

export default function SectionCard({
  title,
  subtitle,
  className,
  children,
}: SectionCardProps) {
  return (
    <section
      className={clsx(
        "rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur",
        className,
      )}
    >
      {title ? <h2 className="text-xl font-semibold text-zinc-100">{title}</h2> : null}
      {subtitle ? <p className="mt-1 text-sm text-zinc-400">{subtitle}</p> : null}
      <div className={title || subtitle ? "mt-4" : ""}>{children}</div>
    </section>
  );
}

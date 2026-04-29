"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HOME_MACRO_CATEGORIES } from "@/lib/constants";

export function CategoryBar({
  counts,
  activeCategory = "",
}: {
  counts?: Partial<Record<(typeof HOME_MACRO_CATEGORIES)[number]["slug"], number>>;
  activeCategory?: string;
}) {
  const pathname = usePathname();
  const active = activeCategory;
  const isExplore = pathname.startsWith("/explorar");

  return (
    <div className="sticky top-[72px] z-40 w-full min-w-0 border-y border-border/70 bg-white/85 backdrop-blur">
      {/* Capa de scroll separada de la fila flex con w-max evita que el último chip se comprima o recorte el texto */}
      <div className="fp-scroll-x w-full min-w-0 overflow-x-auto overflow-y-visible overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <div className="flex w-max min-w-full max-w-none flex-nowrap items-center justify-center gap-2 px-4 py-2 pe-10">
          <Link
            href="/explorar"
            className={`flex-none whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              !active && isExplore
                ? "bg-primary text-white shadow-sm"
                : "border border-border text-foreground hover:border-primary/30 hover:text-primary"
            }`}
          >
            Todo Lima
          </Link>
          {HOME_MACRO_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = active === category.slug;
            return (
              <Link
                key={category.slug}
                href={`/explorar?macroCategory=${encodeURIComponent(category.slug)}`}
                className={`inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "border border-border text-foreground hover:border-primary/30 hover:text-primary"
                }`}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden />
                {category.label}
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${
                    isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                  }`}
                >
                  {counts?.[category.slug] ?? 0}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

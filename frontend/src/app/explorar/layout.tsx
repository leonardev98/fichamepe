import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Explorar servicios freelance",
  description:
    "Descubre servicios freelance activos en Lima y Perú por categoría, precio y disponibilidad.",
  path: "/explorar",
  keywords: [
    "explorar freelancers",
    "servicios freelance lima",
    "buscar talento freelance",
  ],
});

export default function ExplorarLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <Suspense
      fallback={<div className="min-h-screen flex-1 bg-background" aria-hidden />}
    >
      {children}
    </Suspense>
  );
}

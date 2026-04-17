import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/layout/StaticInfoPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Blog de freelancers y clientes",
  description:
    "Historias, tendencias y estrategias para vender y contratar mejor servicios freelance en Lima.",
  path: "/blog",
  keywords: ["blog freelance", "consejos para freelancers", "contratar talento"],
});

export default function BlogPage() {
  return (
    <StaticInfoPage
      title="Blog"
      description="Historias, tendencias y estrategias para vender y contratar mejor en Lima."
    />
  );
}

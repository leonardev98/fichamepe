import type { MetadataRoute } from "next";
import { SEO_SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/auth/",
          "/cuenta/",
          "/dashboard/",
          "/conversaciones/",
          "/notificaciones/",
          "/verificar-correo/",
        ],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "Google-Extended"],
        allow: "/",
        disallow: ["/cuenta/", "/dashboard/", "/auth/"],
      },
    ],
    sitemap: `${SEO_SITE_URL}/sitemap.xml`,
    host: SEO_SITE_URL,
  };
}

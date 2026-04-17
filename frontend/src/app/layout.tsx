import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_FAVICON_SVG_URL, SITE_LOGO_URL } from "@/lib/constants";
import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_KEYWORDS,
  SEO_DEFAULT_OG_IMAGE,
  SEO_SITE_NAME,
  SEO_SITE_URL,
} from "@/lib/seo";
import { Providers } from "./providers";
import "./globals.css";

const headingFont = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const bodyFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SEO_SITE_URL),
  title: {
    default: `${SEO_SITE_NAME} | Talento freelance en Lima`,
    template: `%s | ${SEO_SITE_NAME}`,
  },
  description: SEO_DEFAULT_DESCRIPTION,
  keywords: [...SEO_DEFAULT_KEYWORDS],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: SEO_SITE_NAME,
    title: `${SEO_SITE_NAME} | Talento freelance en Lima`,
    description: SEO_DEFAULT_DESCRIPTION,
    url: "/",
    images: [
      {
        url: SEO_DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "FichaMePe - Marketplace de talento freelance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SEO_SITE_NAME} | Talento freelance en Lima`,
    description: SEO_DEFAULT_DESCRIPTION,
    images: [SEO_DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: SITE_FAVICON_SVG_URL, type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO_SITE_NAME,
    url: SEO_SITE_URL,
    inLanguage: "es-PE",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SEO_SITE_URL}/explorar?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_SITE_NAME,
    url: SEO_SITE_URL,
    logo: SITE_LOGO_URL,
    sameAs: [SEO_SITE_URL],
  };

  return (
    <html
      lang="es"
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

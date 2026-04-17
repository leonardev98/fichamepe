import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CategoryBar } from "@/components/layout/CategoryBar";
import { HeroSection } from "@/components/hero/HeroSection";
import { FeaturedServicesSection } from "@/components/sections/FeaturedServicesSection";
import { FlashDeals } from "@/components/sections/FlashDeals";
import { TrendingSection } from "@/components/sections/TrendingSection";
import { DiscoveryFeed } from "@/components/sections/DiscoveryFeed";
import { NearYouSection } from "@/components/sections/NearYouSection";
import { TopRatedSection } from "@/components/sections/TopRatedSection";
import { NewArrivals } from "@/components/sections/NewArrivals";
import { ComboDeals } from "@/components/sections/ComboDeals";
import { ActivityToast } from "@/components/engagement/ActivityToast";
import { fetchFeedServicesSafe, fetchMergedHomeFeed } from "@/lib/api/services.api";
import { COUNTRY_COOKIE_NAME, normalizeCountryCode } from "@/lib/country";
import { HOME_MACRO_CATEGORIES } from "@/lib/constants";
import { macroSlugForService } from "@/lib/service-macro-category";
import { isActivePromo } from "@/lib/service-promo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Talento freelance en Lima",
  description:
    "Encuentra freelancers verificados, explora publicaciones activas y contrata rápido en FichaMePe.",
  path: "/",
  keywords: [
    "freelancers lima",
    "contratar servicios freelance",
    "marketplace freelance peru",
  ],
});

export const revalidate = 86400;

export default async function Home() {
  const cookieStore = await cookies();
  const countryCode = normalizeCountryCode(
    cookieStore.get(COUNTRY_COOKIE_NAME)?.value ?? null,
  );
  const featuredFeed = await fetchFeedServicesSafe({
    limit: 8,
    orderBy: "popular",
    featuredOnly: true,
    country: countryCode ?? undefined,
  });
  const { services } = await fetchMergedHomeFeed(36, countryCode ?? undefined);
  const hasFlashDeals = services.filter((s) => isActivePromo(s)).slice(0, 4).length > 0;
  const counts = Object.fromEntries(HOME_MACRO_CATEGORIES.map((category) => [category.slug, 0]));

  for (const service of services) {
    counts[macroSlugForService(service)] += 1;
  }

  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Navbar />
      <CategoryBar counts={counts} />
      <HeroSection />
      <ActivityToast />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 pb-28 pt-5">
        <FeaturedServicesSection services={featuredFeed.services} />
        <FlashDeals services={services} />
        <TrendingSection services={services} prioritizeFirstCover={!hasFlashDeals} />
        <DiscoveryFeed services={services} />
        <NearYouSection services={services} />
        <TopRatedSection services={services} />
        <NewArrivals services={services} />
        <ComboDeals services={services} />
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}

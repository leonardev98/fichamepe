"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Checkbox } from "@heroui/react/checkbox";
import { CheckboxGroup } from "@heroui/react/checkbox-group";
import { Label } from "@heroui/react/label";
import { Slider } from "@heroui/react/slider";
import { Switch } from "@heroui/react/switch";
import { BottomSheet } from "@/components/mobile/BottomSheet";
import { BottomNav } from "@/components/layout/BottomNav";
import { CategoryBar } from "@/components/layout/CategoryBar";
import { SearchBar } from "@/components/ui/SearchBar";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { SkeletonCard } from "@/components/cards/SkeletonCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { fetchFeedServicesClient } from "@/lib/api/services.client";
import {
  getAllSkills,
  type SkillRow,
  type SkillsGroupedByCategory,
} from "@/lib/api/skills.api";
import { HOME_MACRO_CATEGORIES, type MacroCategorySlug } from "@/lib/constants";
import {
  macroSlugForWizardCategory,
  serviceMatchesMacroSlug,
} from "@/lib/service-macro-category";
import type { ServicePublic } from "@/types/service.types";
import { useCountryStore } from "@/stores/countryStore";

const MACRO_SLUG_SET = new Set<string>(
  HOME_MACRO_CATEGORIES.map((c) => c.slug),
);

const PRICE_MIN = 20;
const PRICE_MAX = 120;
const PAGE_SIZE = 12;

function dedupeServicesById(services: ServicePublic[]): ServicePublic[] {
  const seen = new Set<string>();
  const out: ServicePublic[] = [];
  for (const s of services) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push(s);
  }
  return out;
}

function EmptySearchIllustration() {
  return (
    <svg
      className="mx-auto h-32 w-32 text-muted/40"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="52" cy="52" r="28" stroke="currentColor" strokeWidth="3" />
      <path
        d="M74 74L98 98"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M44 48h16M44 56h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FiltersContent({
  skillsGrouped,
  categoryKey,
  onCategoryChange,
  selectedSkillIds,
  onSkillIdsChange,
  availableOnly,
  onAvailableChange,
  maxHourly,
  onMaxHourlyChange,
}: {
  skillsGrouped: SkillsGroupedByCategory;
  categoryKey: string;
  onCategoryChange: (key: string) => void;
  selectedSkillIds: string[];
  onSkillIdsChange: (ids: string[]) => void;
  availableOnly: boolean;
  onAvailableChange: (v: boolean) => void;
  maxHourly: number;
  onMaxHourlyChange: (v: number) => void;
}) {
  const categoryLabelId = useId();
  const categorySelectId = useId();
  const availabilityLabelId = useId();
  const priceSliderLabelId = useId();

  const skillsList: SkillRow[] = useMemo(() => {
    const flat = skillsGrouped.flatMap((g) => g.skills);
    if (!categoryKey || !MACRO_SLUG_SET.has(categoryKey)) {
      return flat;
    }
    const macro = categoryKey as MacroCategorySlug;
    return flat.filter((sk) => macroSlugForWizardCategory(sk.category) === macro);
  }, [skillsGrouped, categoryKey]);
  const filterLabelClass =
    "mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#1A1A2E]";

  return (
    <div className="flex flex-col">
      <div className="mb-6 border-b border-[#F3F4F6] pb-6">
        <label id={categoryLabelId} htmlFor={categorySelectId} className={filterLabelClass}>
          Categoría
        </label>
        <select
          id={categorySelectId}
          aria-labelledby={categoryLabelId}
          value={categoryKey}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/25"
        >
          <option value="">Todas las categorías</option>
          {HOME_MACRO_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 border-b border-[#F3F4F6] pb-6">
        <CheckboxGroup
          value={selectedSkillIds}
          onChange={(v) => onSkillIdsChange(v as string[])}
          className="flex max-h-64 flex-col gap-2 overflow-y-auto"
        >
          <Label className={filterLabelClass}>Habilidades</Label>
          {skillsList.length === 0 ? (
            <p className="text-xs text-muted">No hay habilidades en esta vista.</p>
          ) : (
            skillsList.map((sk) => (
              <Checkbox key={sk.id} value={sk.id} className="text-sm text-muted">
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>{sk.name}</Checkbox.Content>
              </Checkbox>
            ))
          )}
        </CheckboxGroup>
      </div>

      <div className="mb-6 border-b border-[#F3F4F6] pb-6">
        <Label id={availabilityLabelId} className={filterLabelClass}>
          Disponibilidad
        </Label>
        <Switch
          isSelected={availableOnly}
          onChange={onAvailableChange}
          aria-labelledby={availabilityLabelId}
          className="flex-row-reverse gap-2"
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content className="text-xs text-muted">
            Solo disponibles
          </Switch.Content>
        </Switch>
      </div>

      <div>
        <Label id={priceSliderLabelId} className={filterLabelClass}>
          Precio máx. / hora
        </Label>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-accent">
            S/ {maxHourly}
          </span>
        </div>
        <Slider.Root
          minValue={PRICE_MIN}
          maxValue={PRICE_MAX}
          step={5}
          value={[maxHourly]}
          onChange={(v) => {
            const next = Array.isArray(v) ? v[0] : v;
            if (typeof next === "number") onMaxHourlyChange(next);
          }}
          aria-labelledby={priceSliderLabelId}
          className="w-full"
        >
          <Slider.Track className="relative h-1.5 rounded-full bg-border">
            <Slider.Fill className="rounded-full bg-primary" />
            <Slider.Thumb
              aria-label="Precio máximo por hora"
              className="top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-primary bg-surface shadow"
            />
          </Slider.Track>
        </Slider.Root>
      </div>
    </div>
  );
}

export default function ExplorarPage() {
  const searchParams = useSearchParams();
  const countryCode = useCountryStore((s) => s.countryCode);
  const [skillsGrouped, setSkillsGrouped] = useState<SkillsGroupedByCategory>(
    [],
  );
  const [categoryKey, setCategoryKey] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxHourly, setMaxHourly] = useState(PRICE_MAX);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 400);
  const [offset, setOffset] = useState(0);
  const [services, setServices] = useState<ServicePublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [feedHasMore, setFeedHasMore] = useState(true);

  useEffect(() => {
    getAllSkills()
      .then(setSkillsGrouped)
      .catch(() => setSkillsGrouped([]));
  }, []);

  useEffect(() => {
    const qSearch = searchParams.get("search");
    const qMacro = searchParams.get("macroCategory");
    if (qSearch != null && qSearch !== "") {
      setSearchInput(qSearch);
    }
    if (qMacro && MACRO_SLUG_SET.has(qMacro)) {
      setCategoryKey(qMacro as MacroCategorySlug);
      setSelectedSkillIds([]);
      setOffset(0);
    }
  }, [searchParams]);

  const handleCategoryChange = (key: string) => {
    setCategoryKey(key);
    setSelectedSkillIds([]);
    setOffset(0);
  };

  const handleSkillIdsChange = (ids: string[]) => {
    setSelectedSkillIds(ids);
    setOffset(0);
  };

  const handleAvailableChange = (v: boolean) => {
    setAvailableOnly(v);
    setOffset(0);
  };

  const handleMaxHourlyChange = (v: number) => {
    setMaxHourly(v);
    setOffset(0);
  };

  const skillNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of skillsGrouped) {
      for (const sk of g.skills) {
        m.set(sk.id, sk.name);
      }
    }
    return m;
  }, [skillsGrouped]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = debouncedSearch
        ? `${service.title} ${service.description}`
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())
        : true;
      const matchesAvailability = availableOnly
        ? service.profile?.isAvailable === true
        : true;
      const matchesPrice = service.price == null ? true : service.price <= maxHourly;
      const matchesSkills =
        selectedSkillIds.length === 0
          ? true
          : selectedSkillIds.some((id) => {
              const name = skillNameById.get(id)?.toLowerCase();
              if (!name) return false;
              const hay = `${service.tags.join(" ")} ${service.title}`.toLowerCase();
              return hay.includes(name);
            });
      const matchesCategory =
        !categoryKey ||
        (MACRO_SLUG_SET.has(categoryKey) &&
          serviceMatchesMacroSlug(service, categoryKey as MacroCategorySlug));

      return (
        matchesSearch &&
        matchesAvailability &&
        matchesPrice &&
        matchesSkills &&
        matchesCategory
      );
    });
  }, [
    services,
    debouncedSearch,
    availableOnly,
    maxHourly,
    selectedSkillIds,
    categoryKey,
    skillNameById,
  ]);

  const loadServices = useCallback(
    async (append: boolean, nextOffset: number) => {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);
      setError(null);
      try {
        const res = await fetchFeedServicesClient({
          limit: PAGE_SIZE,
          offset: nextOffset,
          orderBy: "random",
          search: debouncedSearch || undefined,
          country: countryCode ?? undefined,
        });
        setServices((prev) => {
          if (!append) return dedupeServicesById(res.services);
          const seen = new Set(prev.map((s) => s.id));
          const merged = [...prev];
          for (const s of res.services) {
            if (seen.has(s.id)) continue;
            seen.add(s.id);
            merged.push(s);
          }
          return merged;
        });
        setFeedHasMore(res.services.length >= PAGE_SIZE);
      } catch (e) {
        setError(e);
        if (!append) setServices([]);
        setFeedHasMore(false);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [countryCode, debouncedSearch],
  );

  useEffect(() => {
    setOffset(0);
    void loadServices(false, 0);
  }, [countryCode, debouncedSearch, loadServices]);

  const canLoadMore = feedHasMore && !error;
  const markerRef = useInfiniteScroll({
    enabled: canLoadMore && !isLoadingMore && !isLoading,
    onLoadMore: () => {
      setOffset((prev) => {
        const next = prev + PAGE_SIZE;
        return next;
      });
    },
  });

  useEffect(() => {
    if (offset === 0) return;
    void loadServices(true, offset);
  }, [offset, loadServices]);

  const filtersBlock = (
    <FiltersContent
      skillsGrouped={skillsGrouped}
      categoryKey={categoryKey}
      onCategoryChange={handleCategoryChange}
      selectedSkillIds={selectedSkillIds}
      onSkillIdsChange={handleSkillIdsChange}
      availableOnly={availableOnly}
      onAvailableChange={handleAvailableChange}
      maxHourly={maxHourly}
      onMaxHourlyChange={handleMaxHourlyChange}
    />
  );

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Navbar />
      <CategoryBar activeCategory={categoryKey} />
      <div className="border-b border-border px-4 py-4 md:py-6">
        <SearchBar
          className="mx-auto max-w-3xl"
          value={searchInput}
          onValueChange={setSearchInput}
          onSubmit={setSearchInput}
        />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 lg:gap-8">
        <aside className="hidden shrink-0 md:block md:w-[240px] md:border-r md:border-border md:pr-6 lg:w-[260px] lg:pr-8">
          <div className="sticky top-24">
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted">
              Filtros
            </h2>
            {filtersBlock}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3 md:justify-end">
            <div className="md:hidden">
              <BottomSheet triggerLabel="Filtros" title="Ajusta tu búsqueda">
                {filtersBlock}
              </BottomSheet>
            </div>
            {!isLoading && !error ? (
              <p className="text-sm text-muted">
                {filteredServices.length} resultado
                {filteredServices.length === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>

          {error ? (
            <Card
              variant="secondary"
              className="mb-6 border border-red-500/40 bg-surface/90 p-6"
            >
              <p className="text-sm font-medium text-foreground">
                No pudimos cargar los servicios.
              </p>
              <p className="mt-1 text-xs text-muted">
                Revisa tu conexión o vuelve a intentar.
              </p>
              <Button
                variant="primary"
                className="mt-4 bg-primary text-white"
                onPress={() => void loadServices(false, 0)}
              >
                Reintentar
              </Button>
            </Card>
          ) : null}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            {isLoading
              ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
              : filteredServices.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    coverPriority={index < 2}
                  />
                ))}
          </div>

          {!isLoading && !error && filteredServices.length === 0 ? (
            <div className="mt-12 flex flex-col items-center text-center">
              <EmptySearchIllustration />
              <p className="mt-4 max-w-sm text-sm text-muted">
                No encontramos servicios con esos filtros.
              </p>
            </div>
          ) : null}

          {isLoadingMore ? (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              {Array.from({ length: 3 }, (_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : null}
          <div ref={markerRef} className="h-3" />

          {!isLoading && !error && canLoadMore ? (
            <div className="sticky top-24">
              <Button
                variant="outline"
                className="mt-6 border-border"
                onPress={() => setOffset((prev) => prev + PAGE_SIZE)}
              >
                Cargar más
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      <BottomNav />
      <Footer />
    </div>
  );
}

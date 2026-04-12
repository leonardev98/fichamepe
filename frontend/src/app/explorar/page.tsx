"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { useOverlayState } from "@heroui/react";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Checkbox } from "@heroui/react/checkbox";
import { CheckboxGroup } from "@heroui/react/checkbox-group";
import { Drawer } from "@heroui/react/drawer";
import { SearchField } from "@heroui/react/search-field";
import { Skeleton } from "@heroui/react/skeleton";
import { Slider } from "@heroui/react/slider";
import { Switch } from "@heroui/react/switch";
import { Navbar } from "@/components/layout/Navbar";
import { FreelancerCard } from "@/components/ui/FreelancerCard";
import { searchProfiles } from "@/lib/api/profiles.api";
import {
  getAllSkills,
  type SkillRow,
  type SkillsGroupedByCategory,
} from "@/lib/api/skills.api";
import { LIMA_DISTRICTS } from "@/lib/constants";
import type { Profile, SearchFilters } from "@/types/profile.types";

const PRICE_MIN = 20;
const PRICE_MAX = 120;
const PAGE_SIZE = 12;

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

function ProfileCardSkeleton() {
  return (
    <Card
      variant="secondary"
      className="border border-border bg-surface/90 p-4"
    >
      <div className="flex flex-row items-start gap-4">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3 rounded-md" />
          <Skeleton className="h-3 w-1/3 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
      <Skeleton className="mt-4 h-4 w-28 rounded-md" />
      <Skeleton className="mt-4 h-10 w-full rounded-lg" />
    </Card>
  );
}

function FiltersContent({
  skillsGrouped,
  categoryKey,
  onCategoryChange,
  selectedSkillIds,
  onSkillIdsChange,
  districtKey,
  onDistrictChange,
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
  districtKey: string;
  onDistrictChange: (key: string) => void;
  availableOnly: boolean;
  onAvailableChange: (v: boolean) => void;
  maxHourly: number;
  onMaxHourlyChange: (v: number) => void;
}) {
  const skillsList: SkillRow[] = useMemo(() => {
    if (!categoryKey) {
      return skillsGrouped.flatMap((g) => g.skills);
    }
    const block = skillsGrouped.find((g) => g.category === categoryKey);
    return block?.skills ?? [];
  }, [skillsGrouped, categoryKey]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <label
          id="category-label"
          htmlFor="category-select"
          className="text-sm font-semibold text-foreground"
        >
          Categoría
        </label>
        <select
          id="category-select"
          aria-labelledby="category-label"
          value={categoryKey}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/25"
        >
          <option value="">Todas</option>
          {skillsGrouped.map((g) => (
            <option key={g.category} value={g.category}>
              {g.category}
            </option>
          ))}
        </select>
      </div>

      <CheckboxGroup
        value={selectedSkillIds}
        onChange={(v) => onSkillIdsChange(v as string[])}
        className="flex max-h-64 flex-col gap-2 overflow-y-auto"
      >
        <span className="mb-1 text-sm font-semibold text-foreground">
          Habilidades
        </span>
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

      <div className="flex flex-col gap-2">
        <label
          id="district-label"
          htmlFor="district-select"
          className="text-sm font-semibold text-foreground"
        >
          Distrito de Lima
        </label>
        <select
          id="district-select"
          aria-labelledby="district-label"
          value={districtKey}
          onChange={(e) => onDistrictChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/25"
        >
          {LIMA_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">
            Disponibilidad
          </span>
          <Switch
            isSelected={availableOnly}
            onChange={onAvailableChange}
            aria-label="Solo freelancers disponibles"
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
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            Precio máx. / hora
          </span>
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
  const [skillsGrouped, setSkillsGrouped] = useState<SkillsGroupedByCategory>(
    [],
  );
  const [categoryKey, setCategoryKey] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [districtKey, setDistrictKey] = useState("Todos");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxHourly, setMaxHourly] = useState(PRICE_MAX);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 400);

  const [page, setPage] = useState(1);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const filterDrawer = useOverlayState();

  const filters = useMemo<SearchFilters>(
    () => ({
      skill: selectedSkillIds.length ? selectedSkillIds : undefined,
      district: districtKey === "Todos" ? undefined : districtKey,
      isAvailable: availableOnly ? true : undefined,
      maxHourlyRate: maxHourly,
      search: debouncedSearch.trim() || undefined,
      category: categoryKey.trim() || undefined,
    }),
    [
      selectedSkillIds,
      districtKey,
      availableOnly,
      maxHourly,
      debouncedSearch,
      categoryKey,
    ],
  );

  useEffect(() => {
    getAllSkills()
      .then(setSkillsGrouped)
      .catch(() => setSkillsGrouped([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const runSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await searchProfiles(filters, page, PAGE_SIZE);
      setProfiles(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e);
      setProfiles([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void runSearch();
  }, [runSearch]);

  const handleCategoryChange = (key: string) => {
    setCategoryKey(key);
    setSelectedSkillIds([]);
    setPage(1);
  };

  const handleSkillIdsChange = (ids: string[]) => {
    setSelectedSkillIds(ids);
    setPage(1);
  };

  const handleDistrictChange = (key: string) => {
    setDistrictKey(key);
    setPage(1);
  };

  const handleAvailableChange = (v: boolean) => {
    setAvailableOnly(v);
    setPage(1);
  };

  const handleMaxHourlyChange = (v: number) => {
    setMaxHourly(v);
    setPage(1);
  };

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const filtersBlock = (
    <FiltersContent
      skillsGrouped={skillsGrouped}
      categoryKey={categoryKey}
      onCategoryChange={handleCategoryChange}
      selectedSkillIds={selectedSkillIds}
      onSkillIdsChange={handleSkillIdsChange}
      districtKey={districtKey}
      onDistrictChange={handleDistrictChange}
      availableOnly={availableOnly}
      onAvailableChange={handleAvailableChange}
      maxHourly={maxHourly}
      onMaxHourlyChange={handleMaxHourlyChange}
    />
  );

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <div className="flex min-h-full flex-1 flex-col">
        <div className="border-b border-border px-4 py-4 md:py-6">
          <SearchField
            value={searchInput}
            onChange={setSearchInput}
            className="mx-auto w-full max-w-3xl"
            aria-label="Buscar freelancers"
          >
            <SearchField.Group className="border-border bg-surface-elevated">
              <SearchField.SearchIcon className="text-muted" />
              <SearchField.Input
                placeholder="Busca diseñadores, programadores, profesores..."
                className="text-foreground placeholder:text-muted"
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6">
          <aside className="hidden w-72 shrink-0 md:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur-sm">
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-muted">
                Filtros
              </h2>
              {filtersBlock}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between gap-3 md:justify-end">
              <Drawer state={filterDrawer}>
                <Drawer.Trigger className="rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-surface md:hidden">
                  Filtros
                </Drawer.Trigger>
                <Drawer.Backdrop isDismissable className="md:hidden">
                  <Drawer.Content placement="bottom" className="max-h-[85vh]">
                    <Drawer.Dialog className="border-t border-border bg-surface">
                      <Drawer.Handle />
                      <Drawer.Header className="border-b border-border px-4 py-3">
                        <Drawer.Heading className="text-lg font-semibold">
                          Filtros
                        </Drawer.Heading>
                        <Drawer.CloseTrigger aria-label="Cerrar filtros" />
                      </Drawer.Header>
                      <Drawer.Body className="px-4 py-4">
                        {filtersBlock}
                      </Drawer.Body>
                      <Drawer.Footer className="border-t border-border p-4">
                        <Button
                          variant="primary"
                          fullWidth
                          className="bg-primary text-white"
                          onPress={() => filterDrawer.close()}
                        >
                          Ver resultados
                        </Button>
                      </Drawer.Footer>
                    </Drawer.Dialog>
                  </Drawer.Content>
                </Drawer.Backdrop>
              </Drawer>
              {!isLoading && !error ? (
                <p className="text-sm text-muted">
                  {total} resultado{total === 1 ? "" : "s"}
                </p>
              ) : null}
            </div>

            {error ? (
              <Card
                variant="secondary"
                className="mb-6 border border-red-500/40 bg-surface/90 p-6"
              >
                <p className="text-sm font-medium text-foreground">
                  No pudimos cargar los perfiles.
                </p>
                <p className="mt-1 text-xs text-muted">
                  Revisa tu conexión o vuelve a intentar.
                </p>
                <Button
                  variant="primary"
                  className="mt-4 bg-primary text-white"
                  onPress={() => void runSearch()}
                >
                  Reintentar
                </Button>
              </Card>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }, (_, i) => (
                    <ProfileCardSkeleton key={i} />
                  ))
                : profiles.map((p) => (
                    <FreelancerCard key={p.id} profile={p} />
                  ))}
            </div>

            {!isLoading && !error && profiles.length === 0 ? (
              <div className="mt-12 flex flex-col items-center text-center">
                <EmptySearchIllustration />
                <p className="mt-4 max-w-sm text-sm text-muted">
                  No encontramos freelancers con esos filtros
                </p>
              </div>
            ) : null}

            {!isLoading && !error && total > 0 ? (
              <div className="mt-10 flex flex-col items-center gap-4 border-t border-border pt-6">
                <p className="text-sm text-muted">
                  Mostrando {from}–{to} de {total} freelancers
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-border"
                    isDisabled={page <= 1}
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border"
                    isDisabled={page * PAGE_SIZE >= total}
                    onPress={() => setPage((p) => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { normalizeCountryCode } from "@/lib/country";
import { useCountryStore } from "@/stores/countryStore";

type GeoCountryResponse = {
  countryCode?: string | null;
};

export function CountryBootstrap() {
  const router = useRouter();
  const ran = useRef(false);
  const hydrateFromCookie = useCountryStore((s) => s.hydrateFromCookie);
  const setAutoCountry = useCountryStore((s) => s.setAutoCountry);

  useEffect(() => {
    if (ran.current) {
      return;
    }
    ran.current = true;
    const initialCountry = useCountryStore.getState().countryCode;

    hydrateFromCookie();
    const afterCookie = useCountryStore.getState();
    if (afterCookie.countryCode) {
      if (!initialCountry) {
        router.refresh();
      }
      return;
    }

    let cancelled = false;
    void fetch("/api/geo/country", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          return null;
        }
        const data = (await res.json()) as GeoCountryResponse;
        return normalizeCountryCode(data.countryCode ?? null);
      })
      .then((detected) => {
        if (!detected || cancelled) {
          return;
        }
        setAutoCountry(detected);
        if (!initialCountry) {
          router.refresh();
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [hydrateFromCookie, router, setAutoCountry]);

  return null;
}

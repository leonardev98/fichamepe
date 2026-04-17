"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  normalizeCountryCode,
  readCountryCookieFromDocument,
  writeCountryCookie,
} from "@/lib/country";

type CountrySelectionMode = "manual" | "auto" | null;

type CountryState = {
  countryCode: string | null;
  selectionMode: CountrySelectionMode;
  setManualCountry: (code: string) => void;
  setAutoCountry: (code: string) => void;
  hydrateFromCookie: () => void;
};

export const useCountryStore = create<CountryState>()(
  persist(
    (set, get) => ({
      countryCode: null,
      selectionMode: null,
      setManualCountry: (code) => {
        const normalized = normalizeCountryCode(code);
        if (!normalized) {
          return;
        }
        writeCountryCookie(normalized);
        set({ countryCode: normalized, selectionMode: "manual" });
      },
      setAutoCountry: (code) => {
        const normalized = normalizeCountryCode(code);
        if (!normalized) {
          return;
        }
        const state = get();
        if (state.selectionMode === "manual") {
          return;
        }
        writeCountryCookie(normalized);
        set({
          countryCode: normalized,
          selectionMode: state.selectionMode ?? "auto",
        });
      },
      hydrateFromCookie: () => {
        const state = get();
        if (state.countryCode || state.selectionMode === "manual") {
          return;
        }
        const cookieCode = readCountryCookieFromDocument();
        if (!cookieCode) {
          return;
        }
        set({
          countryCode: cookieCode,
          selectionMode: "auto",
        });
      },
    }),
    {
      name: "fichame-country-preference",
      partialize: (state) => ({
        countryCode: state.countryCode,
        selectionMode: state.selectionMode,
      }),
    },
  ),
);

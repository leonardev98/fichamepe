"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  clearCountryCookie,
  isNavbarContentCountryCode,
  normalizeCountryCode,
  readCountryCookieFromDocument,
  sanitizeContentCountryFilter,
  writeCountryCookie,
} from "@/lib/country";

type CountrySelectionMode = "manual" | "auto" | null;

type CountryState = {
  countryCode: string | null;
  selectionMode: CountrySelectionMode;
  /** Sin filtro por país: todas las publicaciones. */
  clearToWorldwide: () => void;
  setManualCountry: (code: string) => void;
  setAutoCountry: (code: string) => void;
  hydrateFromCookie: () => void;
};

export const useCountryStore = create<CountryState>()(
  persist(
    (set, get) => ({
      countryCode: null,
      selectionMode: null,
      clearToWorldwide: () => {
        clearCountryCookie();
        set({ countryCode: null, selectionMode: "manual" });
      },
      setManualCountry: (code) => {
        const normalized = sanitizeContentCountryFilter(code);
        if (!normalized) {
          return;
        }
        writeCountryCookie(normalized);
        set({ countryCode: normalized, selectionMode: "manual" });
      },
      setAutoCountry: (code) => {
        const normalized = sanitizeContentCountryFilter(code);
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
        if (!isNavbarContentCountryCode(cookieCode)) {
          clearCountryCookie();
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
      version: 2,
      migrate: (persisted, _version) => {
        if (!persisted || typeof persisted !== "object") {
          return { countryCode: null, selectionMode: null };
        }
        const p = persisted as {
          countryCode?: unknown;
          selectionMode?: unknown;
        };
        const rawCode =
          typeof p.countryCode === "string" || p.countryCode === null
            ? p.countryCode
            : null;
        const countryCode = sanitizeContentCountryFilter(rawCode ?? undefined);
        const sm = p.selectionMode;
        const selectionMode: CountrySelectionMode =
          sm === "manual" || sm === "auto" || sm === null ? sm : null;
        if (selectionMode === "auto") {
          return { countryCode: null, selectionMode: null };
        }
        if (!countryCode) {
          const nextMode: CountrySelectionMode =
            selectionMode === "manual" ? "manual" : null;
          return { countryCode: null, selectionMode: nextMode };
        }
        return { countryCode, selectionMode };
      },
      partialize: (state) => ({
        countryCode: state.countryCode,
        selectionMode: state.selectionMode,
      }),
    },
  ),
);

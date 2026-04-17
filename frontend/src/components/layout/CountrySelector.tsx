"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  countryCodeToFlagEmoji,
  getCountryFlagIconUrl,
  getCountryOptions,
} from "@/lib/country";
import { useCountryStore } from "@/stores/countryStore";

export function CountrySelector({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const typeaheadBufferRef = useRef("");
  const typeaheadTimerRef = useRef<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const countryCode = useCountryStore((s) => s.countryCode);
  const setManualCountry = useCountryStore((s) => s.setManualCountry);
  const options = useMemo(() => getCountryOptions("es"), []);
  const selectedOption = useMemo(
    () => options.find((item) => item.code === countryCode) ?? null,
    [countryCode, options],
  );
  const selectedFlagUrl = useMemo(
    () => getCountryFlagIconUrl(countryCode ?? ""),
    [countryCode],
  );
  const selectedIndex = useMemo(
    () => options.findIndex((item) => item.code === countryCode),
    [countryCode, options],
  );
  const id = useId();
  const listboxId = `country-selector-listbox-${id}`;
  const showCompactFlagOnly = compact && Boolean(selectedOption);

  const normalizeText = (value: string): string =>
    value
      .toLocaleLowerCase("es")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const closeDropdown = (focusTrigger = false) => {
    setIsOpen(false);
    if (focusTrigger) {
      triggerRef.current?.focus();
    }
  };

  const selectCountry = (code: string) => {
    setManualCountry(code);
    closeDropdown();
    router.refresh();
  };

  const findMatchingIndex = (query: string, startIndex = 0): number => {
    if (!query || options.length === 0) {
      return -1;
    }
    const normalizedQuery = normalizeText(query);
    for (let offset = 0; offset < options.length; offset += 1) {
      const index = (startIndex + offset) % options.length;
      const option = options[index];
      if (!option) {
        continue;
      }
      const normalizedLabel = normalizeText(option.label);
      const normalizedCode = normalizeText(option.code);
      if (normalizedLabel.startsWith(normalizedQuery) || normalizedCode.startsWith(normalizedQuery)) {
        return index;
      }
    }
    return -1;
  };

  const runTypeahead = (key: string) => {
    if (typeaheadTimerRef.current !== null) {
      window.clearTimeout(typeaheadTimerRef.current);
    }
    typeaheadBufferRef.current = `${typeaheadBufferRef.current}${key}`;
    typeaheadTimerRef.current = window.setTimeout(() => {
      typeaheadBufferRef.current = "";
      typeaheadTimerRef.current = null;
    }, 700);

    const startIndex = activeIndex >= 0 ? activeIndex + 1 : 0;
    const matchIndex = findMatchingIndex(typeaheadBufferRef.current, startIndex);
    if (matchIndex >= 0) {
      setActiveIndex(matchIndex);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown(true);
      }
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const nextIndex = selectedIndex >= 0 ? selectedIndex : 0;
    setActiveIndex(nextIndex);
  }, [isOpen, selectedIndex]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) {
      return;
    }
    const option = optionRefs.current[activeIndex];
    if (!option) {
      return;
    }
    option.focus();
    option.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  useEffect(() => {
    return () => {
      if (typeaheadTimerRef.current !== null) {
        window.clearTimeout(typeaheadTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative ${compact ? "w-auto" : "w-full"} ${className ?? ""}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Seleccionar país"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        onClick={() => {
          setIsOpen((prev) => {
            if (prev) {
              return false;
            }
            const nextIndex = selectedIndex >= 0 ? selectedIndex : 0;
            setActiveIndex(nextIndex);
            return true;
          });
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            const fallbackIndex = selectedIndex >= 0 ? selectedIndex : 0;
            const nextIndex = event.key === "ArrowUp" ? options.length - 1 : fallbackIndex;
            setIsOpen(true);
            setActiveIndex(nextIndex);
          }
        }}
        className={`inline-flex w-full items-center gap-2 rounded-full border border-border bg-white py-1.5 text-xs text-muted transition hover:border-primary/40 ${
          showCompactFlagOnly ? "w-[68px] justify-between px-2.5" : "px-3"
        } ${
          compact && !showCompactFlagOnly ? "max-w-[190px]" : ""
        }`}
      >
        <span className="sr-only">País de contenido</span>
        <span
          className={`flex min-w-0 items-center gap-1.5 text-foreground ${
            showCompactFlagOnly ? "flex-none" : "flex-1"
          }`}
        >
          {selectedFlagUrl ? (
            <img
              src={selectedFlagUrl}
              alt=""
              width={18}
              height={14}
              loading="lazy"
              className="h-[14px] w-[18px] shrink-0 rounded-[2px] object-cover"
            />
          ) : (
            <Globe className="size-3.5 shrink-0 text-primary" aria-hidden />
          )}
          {showCompactFlagOnly ? null : (
            <span className="truncate">{selectedOption?.label ?? "País"}</span>
          )}
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-muted transition ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div
          className={`absolute z-[80] mt-2 overflow-hidden rounded-2xl border border-border bg-white shadow-lg ${
            compact ? "right-0 w-[290px]" : "left-0 w-full min-w-[290px]"
          }`}
        >
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Países disponibles"
            aria-activedescendant={activeIndex >= 0 ? `country-option-${options[activeIndex]?.code}` : undefined}
            className="max-h-80 overflow-auto p-1.5"
          >
            {options.map((item, index) => {
              const isSelected = item.code === countryCode;
              const isActive = index === activeIndex;
              const flagUrl = getCountryFlagIconUrl(item.code);
              return (
                <li
                  key={item.code}
                  id={`country-option-${item.code}`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <button
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    type="button"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => selectCountry(item.code)}
                    onFocus={() => setActiveIndex(index)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setActiveIndex((prev) => (prev + 1) % options.length);
                        return;
                      }
                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        setActiveIndex((prev) => (prev - 1 + options.length) % options.length);
                        return;
                      }
                      if (event.key === "Home") {
                        event.preventDefault();
                        setActiveIndex(0);
                        return;
                      }
                      if (event.key === "End") {
                        event.preventDefault();
                        setActiveIndex(options.length - 1);
                        return;
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        closeDropdown(true);
                        return;
                      }
                      if (event.key === "Tab") {
                        closeDropdown();
                        return;
                      }
                      const isPrintableKey =
                        event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey;
                      if (isPrintableKey) {
                        event.preventDefault();
                        runTypeahead(event.key);
                      }
                    }}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                      isSelected
                        ? "bg-primary/10 font-medium text-primary"
                        : isActive
                          ? "bg-primary/5 text-foreground"
                          : "text-foreground hover:bg-primary/5"
                    }`}
                  >
                    {flagUrl ? (
                      <img
                        src={flagUrl}
                        alt=""
                        width={18}
                        height={14}
                        loading="lazy"
                        className="h-[14px] w-[18px] shrink-0 rounded-[2px] object-cover"
                      />
                    ) : (
                      <span aria-hidden>{countryCodeToFlagEmoji(item.code)}</span>
                    )}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {isSelected ? <Check className="size-4 shrink-0" aria-hidden /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

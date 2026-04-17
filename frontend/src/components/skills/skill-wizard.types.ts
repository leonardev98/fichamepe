import type { ServicePublic } from "@/types/service.types";
import { DEFAULT_WIZARD_STATUS } from "./skill-wizard.constants";
import { isoToDatetimeLocalValue } from "./skill-wizard-promo";

export type SkillWizardFormData = {
  title: string;
  category: string;
  tags: string[];
  description: string;
  deliveryMode: string;
  price: string;
  /** Precio habitual (tachado) si hay oferta temporal. */
  listPrice: string;
  promoEnabled: boolean;
  featuredEnabled: boolean;
  /** Valor para `datetime-local` (zona local). */
  promoEndsAtLocal: string;
  deliveryTime: string;
  revisionsIncluded: string;
  coverImageUrl: string | null;
  coverImageKey: string | null;
  coverImageName: string | null;
};

export type SkillWizardErrors = Partial<Record<keyof SkillWizardFormData, string>>;

export const EMPTY_SKILL_FORM_DATA: SkillWizardFormData = {
  title: "",
  category: "",
  tags: [],
  description: "",
  deliveryMode: "",
  price: "",
  listPrice: "",
  promoEnabled: false,
  featuredEnabled: false,
  promoEndsAtLocal: "",
  deliveryTime: "",
  revisionsIncluded: "0",
  coverImageUrl: null,
  coverImageKey: null,
  coverImageName: null,
};

export function fromServiceToWizardData(service: ServicePublic): SkillWizardFormData {
  const hasPromoFields =
    service.previousPrice != null && service.flashDealEndsAt != null;
  return {
    title: service.title ?? "",
    category: service.category ?? "",
    tags: service.tags ?? [],
    description: service.description ?? "",
    deliveryMode: service.deliveryMode ?? "",
    price: service.price !== null && service.price !== undefined ? String(service.price) : "",
    listPrice:
      service.previousPrice !== null && service.previousPrice !== undefined
        ? String(service.previousPrice)
        : "",
    promoEnabled: hasPromoFields,
    featuredEnabled: service.isFeatured ?? false,
    promoEndsAtLocal: isoToDatetimeLocalValue(service.flashDealEndsAt ?? undefined),
    deliveryTime: service.deliveryTime ?? "",
    revisionsIncluded: service.revisionsIncluded ?? "0",
    coverImageUrl: service.coverImageUrl ?? null,
    coverImageKey: null,
    coverImageName: null,
  };
}

export const DEFAULT_STATUS = DEFAULT_WIZARD_STATUS;

import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TAG_LENGTH,
  MAX_TAGS,
  MAX_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MIN_PRICE,
} from "./skill-wizard.constants";
import type { SkillWizardErrors, SkillWizardFormData } from "./skill-wizard.types";

const PROMO_MIN_LEAD_MS = 60_000;

export function validatePromoFields(
  data: SkillWizardFormData,
): Pick<SkillWizardErrors, "listPrice" | "promoEndsAtLocal"> {
  const out: Pick<SkillWizardErrors, "listPrice" | "promoEndsAtLocal"> = {};
  if (!data.promoEnabled) return out;

  const priceNum = Number(data.price);
  const listRaw = data.listPrice.trim();
  if (!listRaw) {
    out.listPrice = "Ingresa tu precio normal (sin descuento). Debe ser mayor que el precio en oferta.";
    return out;
  }
  const listNum = Number(listRaw);
  if (!Number.isFinite(listNum)) {
    out.listPrice = "Precio normal inválido.";
    return out;
  }
  if (!String(data.price).trim() || !Number.isFinite(priceNum)) {
    return out;
  }
  if (listNum <= priceNum) {
    out.listPrice = "El precio normal debe ser mayor que el precio en oferta.";
  }

  const local = data.promoEndsAtLocal.trim();
  if (!local) {
    out.promoEndsAtLocal = "Elige cuándo termina la oferta o un acceso rápido (24 h, 3 d, 7 d).";
    return out;
  }
  const endMs = new Date(local).getTime();
  if (!Number.isFinite(endMs)) {
    out.promoEndsAtLocal = "Fecha u hora inválida.";
    return out;
  }
  if (endMs <= Date.now() + PROMO_MIN_LEAD_MS) {
    out.promoEndsAtLocal = "La oferta debe terminar al menos en un par de minutos.";
  }
  return out;
}

export function sanitizeTag(value: string): string {
  return value.trim().toLowerCase().slice(0, MAX_TAG_LENGTH);
}

export function validateField(
  field: keyof SkillWizardFormData,
  data: SkillWizardFormData,
): string | undefined {
  const value = data[field];
  switch (field) {
    case "title": {
      const title = String(value).trim();
      if (!title) return "El título es obligatorio.";
      if (title.length > MAX_TITLE_LENGTH) return `Máximo ${MAX_TITLE_LENGTH} caracteres.`;
      return undefined;
    }
    case "category":
      return data.category ? undefined : "Selecciona una categoría.";
    case "description": {
      const description = data.description.trim();
      if (!description) return "La descripción es obligatoria.";
      if (description.length < MIN_DESCRIPTION_LENGTH) {
        return `Mínimo ${MIN_DESCRIPTION_LENGTH} caracteres.`;
      }
      if (description.length > MAX_DESCRIPTION_LENGTH) {
        return `Máximo ${MAX_DESCRIPTION_LENGTH} caracteres.`;
      }
      return undefined;
    }
    case "deliveryMode":
      return data.deliveryMode ? undefined : "Selecciona una modalidad.";
    case "price": {
      if (!String(value).trim()) {
        return data.promoEnabled ? "Ingresa el precio en oferta (S/)." : "Ingresa el precio de tu publicación (S/).";
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return "Ingresa un número válido.";
      if (parsed < MIN_PRICE) return `El precio mínimo es S/ ${MIN_PRICE}.`;
      return undefined;
    }
    case "listPrice":
    case "promoEndsAtLocal": {
      if (!data.promoEnabled) return undefined;
      return validatePromoFields(data)[field];
    }
    case "promoEnabled":
    case "featuredEnabled":
      return undefined;
    case "deliveryTime":
      return data.deliveryTime ? undefined : "Selecciona tiempo de entrega.";
    case "tags":
      if (data.tags.length > MAX_TAGS) return `Máximo ${MAX_TAGS} etiquetas.`;
      if (data.tags.some((tag) => tag.length > MAX_TAG_LENGTH)) {
        return `Cada etiqueta debe tener máximo ${MAX_TAG_LENGTH} caracteres.`;
      }
      return undefined;
    default:
      return undefined;
  }
}

export function validateStep(step: number, data: SkillWizardFormData): SkillWizardErrors {
  if (step === 0) {
    return {
      title: validateField("title", data),
      category: validateField("category", data),
      tags: validateField("tags", data),
    };
  }
  if (step === 1) {
    const promo = validatePromoFields(data);
    return {
      description: validateField("description", data),
      deliveryMode: validateField("deliveryMode", data),
      price: validateField("price", data),
      deliveryTime: validateField("deliveryTime", data),
      listPrice: promo.listPrice,
      promoEndsAtLocal: promo.promoEndsAtLocal,
    };
  }
  return {};
}

export function canPublish(data: SkillWizardFormData): boolean {
  const promo = validatePromoFields(data);
  return (
    !validateField("title", data) &&
    !validateField("category", data) &&
    !validateField("description", data) &&
    !validateField("deliveryMode", data) &&
    !validateField("price", data) &&
    !validateField("deliveryTime", data) &&
    !promo.listPrice &&
    !promo.promoEndsAtLocal
  );
}

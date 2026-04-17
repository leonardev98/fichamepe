"use client";

import {
  Image as ImageIcon,
  Lightbulb,
  Star,
  Sparkles,
  Timer,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { Switch } from "@heroui/react/switch";
import { TextArea } from "@heroui/react/textarea";
import Image from "next/image";
import { DeliveryModeCardGrid } from "./DeliveryModeCardGrid";
import {
  DELIVERY_TIMES,
  MAX_DESCRIPTION_LENGTH,
  MIN_PRICE,
  REVISION_OPTIONS,
} from "./skill-wizard.constants";
import { PromoEndsAtPicker } from "./PromoEndsAtPicker";
import { wizardSectionClass, wizardTextAreaClass, wizardTextFieldClass } from "./skill-wizard.ui";
import type { SkillWizardErrors, SkillWizardFormData } from "./skill-wizard.types";
import { SkillImageCropper } from "./SkillImageCropper";

type SkillDetailsStepProps = {
  data: SkillWizardFormData;
  errors: SkillWizardErrors;
  onFieldChange: <K extends keyof SkillWizardFormData>(field: K, value: SkillWizardFormData[K]) => void;
  onFieldBlur: (field: keyof SkillWizardFormData) => void;
  onPickCoverImage: (file: File) => void;
  onRemoveCoverImage: () => void;
  coverImageError?: string | null;
  coverImageUploading?: boolean;
  pendingCropFile?: File | null;
  onCancelCrop?: () => void;
  onConfirmCroppedCover?: (file: File) => Promise<void> | void;
  onPromoToggle: (enabled: boolean) => void;
  onPromoPreset: (msFromNow: number) => void;
  featuredSlotsAvailable: number;
  onFeaturedToggle: (enabled: boolean) => void;
};

export function SkillDetailsStep({
  data,
  errors,
  onFieldChange,
  onFieldBlur,
  onPickCoverImage,
  onRemoveCoverImage,
  coverImageError,
  coverImageUploading,
  pendingCropFile = null,
  onCancelCrop,
  onConfirmCroppedCover,
  onPromoToggle,
  onPromoPreset,
  featuredSlotsAvailable,
  onFeaturedToggle,
}: SkillDetailsStepProps) {
  const parsedPrice = Number(data.price);
  const priceText = Number.isFinite(parsedPrice) ? parsedPrice : 0;
  const parsedList = Number(data.listPrice);
  const listOk = Number.isFinite(parsedList) && Number.isFinite(parsedPrice) && parsedList > parsedPrice;
  const canFeature = featuredSlotsAvailable > 0;

  const coverBlock = (
    <div className={wizardSectionClass}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ImageIcon className="size-4" strokeWidth={2} aria-hidden />
        </span>
        <div>
          <p className="text-base font-bold tracking-tight text-foreground">Foto de portada (opcional)</p>
          <p className="mt-0.5 text-xs text-muted">
            JPG, PNG o WebP (hasta 5 MB). Ajusta el recorte cuadrado en el mismo recuadro.
          </p>
        </div>
      </div>
      {pendingCropFile && onCancelCrop && onConfirmCroppedCover ? (
        <div className="overflow-hidden rounded-2xl border-2 border-border bg-surface-elevated shadow-sm">
          <SkillImageCropper
            key={`${pendingCropFile.name}-${pendingCropFile.size}-${pendingCropFile.lastModified}`}
            file={pendingCropFile}
            isSaving={coverImageUploading}
            onCancel={onCancelCrop}
            onConfirm={onConfirmCroppedCover}
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="overflow-hidden rounded-2xl border-2 border-border bg-surface-elevated shadow-sm">
            <div className="relative aspect-square w-full sm:aspect-[4/3] lg:aspect-square">
              {data.coverImageUrl ? (
                <Image
                  src={data.coverImageUrl}
                  alt="Portada de habilidad"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 540px"
                />
              ) : (
                <div className="fp-gradient-bg flex h-full w-full flex-col justify-end p-5">
                  <p className="text-sm font-semibold text-foreground">Aún sin portada</p>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">
                    Elige una imagen clara y céntrala para destacar en tarjetas y listados.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-sm font-semibold text-foreground">Acciones de portada</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Sube una imagen y aplica el recorte para guardar tu portada final.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <label className="inline-flex w-full">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  className="sr-only"
                  disabled={coverImageUploading}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) onPickCoverImage(file);
                    event.currentTarget.value = "";
                  }}
                />
                <span className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:opacity-95">
                  <Upload className="size-4 shrink-0" aria-hidden />
                  {data.coverImageUrl ? "Cambiar foto" : "Elegir foto"}
                </span>
              </label>
              {data.coverImageUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-full border-border px-5 text-sm font-semibold text-foreground"
                  isDisabled={coverImageUploading}
                  onPress={onRemoveCoverImage}
                >
                  <X className="size-4 shrink-0" aria-hidden />
                  Quitar portada
                </Button>
              ) : null}
            </div>
            {coverImageUploading ? (
              <p className="mt-3 text-xs font-medium text-primary">Subiendo imagen...</p>
            ) : null}
          </aside>
        </div>
      )}
      {coverImageError ? (
        <p className="mt-3 text-xs font-medium text-accent-red">{coverImageError}</p>
      ) : null}
    </div>
  );

  const promoBlock = (
    <div className={`${wizardSectionClass} border-primary/15 bg-gradient-to-br from-primary/[0.06] to-transparent`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Sparkles className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <p className="text-base font-bold tracking-tight text-foreground">Oferta por tiempo limitado</p>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted sm:text-[13px]">
              Indica tu precio normal, un precio en oferta más bajo y cuándo termina. En la tarjeta se verá el precio
              normal tachado, el precio en oferta destacado y un contador hasta la fecha de fin.
            </p>
          </div>
        </div>
        <Switch
          isSelected={data.promoEnabled}
          onChange={onPromoToggle}
          className="shrink-0 self-start sm:self-center"
          aria-label="Activar oferta por tiempo limitado"
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <span className="text-sm font-semibold text-foreground">Activar</span>
          </Switch.Content>
        </Switch>
      </div>

      {data.promoEnabled ? (
        <div className="space-y-5 border-t border-primary/10 pt-5">
          <p className="rounded-lg border border-primary/15 bg-surface/90 px-3 py-2 text-xs leading-relaxed text-muted">
            Primero el <strong className="text-foreground">precio normal</strong> (el más alto), luego el{" "}
            <strong className="text-foreground">precio en oferta</strong> (más bajo). Si ya tenías un precio guardado,
            puedes usarlo como oferta y subir el normal arriba de ese valor.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="skill-list-price" className="text-sm font-semibold text-foreground">
                Precio normal (S/)
              </Label>
              <p className="mt-0.5 text-xs text-muted">
                Lo que sueles cobrar o tu tarifa sin descuento (debe ser mayor que la oferta).
              </p>
              <Input
                id="skill-list-price"
                type="number"
                min={MIN_PRICE + 1}
                value={data.listPrice}
                onChange={(event) => onFieldChange("listPrice", event.target.value)}
                onBlur={() => onFieldBlur("listPrice")}
                placeholder="100"
                className={`mt-2 ${wizardTextFieldClass} ${
                  errors.listPrice
                    ? "border-accent-red focus-visible:border-accent-red focus-visible:ring-accent-red/20"
                    : ""
                }`}
              />
              {errors.listPrice ? (
                <p className="mt-2 text-xs font-medium text-accent-red">{errors.listPrice}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="skill-price-promo" className="text-sm font-semibold text-foreground">
                Precio en oferta (S/)
              </Label>
              <p className="mt-0.5 text-xs text-muted">Lo que pagarán durante la promoción (más bajo que el normal).</p>
              <Input
                id="skill-price-promo"
                type="number"
                min={MIN_PRICE}
                value={data.price}
                onChange={(event) => onFieldChange("price", event.target.value)}
                onBlur={() => onFieldBlur("price")}
                placeholder="90"
                className={`mt-2 ${wizardTextFieldClass} ${
                  errors.price
                    ? "border-accent-red focus-visible:border-accent-red focus-visible:ring-accent-red/20"
                    : ""
                }`}
              />
              {errors.price ? <p className="mt-2 text-xs font-medium text-accent-red">{errors.price}</p> : null}
            </div>
          </div>
          <div>
            <Label id="skill-promo-ends-label" htmlFor="skill-promo-ends" className="text-sm font-semibold text-foreground">
              Termina
            </Label>
            <p className="mt-0.5 text-xs text-muted">Fecha y hora (tu zona). También puedes usar un acceso rápido abajo.</p>
            <div className="mt-2">
              <PromoEndsAtPicker
                id="skill-promo-ends"
                labelId="skill-promo-ends-label"
                value={data.promoEndsAtLocal}
                onChange={(v) => onFieldChange("promoEndsAtLocal", v)}
                onBlur={() => onFieldBlur("promoEndsAtLocal")}
                isInvalid={Boolean(errors.promoEndsAtLocal)}
              />
            </div>
            {errors.promoEndsAtLocal ? (
              <p className="mt-2 text-xs font-medium text-accent-red">{errors.promoEndsAtLocal}</p>
            ) : null}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Acceso rápido</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "24 horas", ms: 24 * 3_600_000 },
                { label: "3 días", ms: 72 * 3_600_000 },
                { label: "7 días", ms: 168 * 3_600_000 },
              ].map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  className="h-9 rounded-full border-border px-4 text-xs font-semibold text-foreground hover:border-primary/40 hover:bg-primary/[0.06]"
                  onPress={() => onPromoPreset(preset.ms)}
                >
                  <Timer className="mr-1.5 size-3.5 shrink-0 text-primary" aria-hidden />
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          {listOk && data.promoEndsAtLocal.trim() ? (
            <p className="flex items-start gap-2 rounded-xl border border-success/25 bg-success/10 px-3 py-2.5 text-xs leading-relaxed text-foreground">
              <span
                className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-success/20 text-success"
                aria-hidden
              >
                ✓
              </span>
              <span>
                En la tarjeta se tachará <strong className="line-through decoration-muted">S/ {parsedList}</strong>{" "}
                (normal) y el precio visible será <strong>S/ {priceText}</strong> (oferta), con contador hasta la fecha
                elegida.
              </span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const featuredBlock = (
    <div className={wizardSectionClass}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-primary-dark">
            <Star className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <p className="text-base font-bold tracking-tight text-foreground">Publicación destacada</p>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted sm:text-[13px]">
              1 referido te da 1 cupo de destacada activa. Las destacadas aparecen arriba en la
              página de inicio.
            </p>
            <p className="mt-2 text-xs font-semibold text-foreground">
              Cupos disponibles: <span className="tabular-nums text-primary">{featuredSlotsAvailable}</span>
            </p>
          </div>
        </div>
        <Switch
          isSelected={data.featuredEnabled}
          isDisabled={!canFeature}
          onChange={onFeaturedToggle}
          className="shrink-0 self-start sm:self-center"
          aria-label="Activar publicación destacada"
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <span className="text-sm font-semibold text-foreground">Destacar</span>
          </Switch.Content>
        </Switch>
      </div>
      {!canFeature ? (
        <p className="mt-3 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs leading-relaxed text-muted">
          Ahora mismo no tienes cupos de destacadas. Consigue 1 referido para desbloquear 1
          destacada activa.
        </p>
      ) : null}
    </div>
  );

  return (
    <section className="space-y-8">
      <div className={wizardSectionClass}>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="size-4" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <Label htmlFor="skill-description" className="text-base font-bold tracking-tight text-foreground">
              Describe tu habilidad
            </Label>
            <p className="mt-0.5 text-xs text-muted">Paso 2 · Los detalles</p>
          </div>
        </div>
        <TextArea
          id="skill-description"
          value={data.description}
          onChange={(event) =>
            onFieldChange("description", event.target.value.slice(0, MAX_DESCRIPTION_LENGTH))
          }
          onBlur={() => onFieldBlur("description")}
          placeholder="Cuéntale al comprador exactamente qué recibirá, cómo trabajas y por qué eres la persona indicada."
          rows={6}
          className={`${wizardTextAreaClass} ${
            errors.description
              ? "border-accent-red focus-visible:border-accent-red focus-visible:ring-accent-red/20"
              : ""
          }`}
        />
        <div className="mt-2 flex items-center justify-end">
          <p className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
            {data.description.length}/{MAX_DESCRIPTION_LENGTH}
          </p>
        </div>
        {errors.description ? (
          <p className="mt-2 text-xs font-medium text-accent-red">{errors.description}</p>
        ) : null}
        <div className="mt-4 flex gap-3 rounded-xl border border-border bg-surface px-4 py-3 sm:items-start">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden>
            <Lightbulb className="size-4" strokeWidth={2} />
          </span>
          <p className="text-sm leading-relaxed text-muted">
            Los servicios con descripciones de más de 150 caracteres reciben 3x más contactos.
          </p>
        </div>
      </div>

      <div className={wizardSectionClass}>
        <p className="mb-1 text-base font-bold tracking-tight text-foreground">Modalidad de entrega</p>
        <p className="mb-3 text-xs text-muted">Una opción (obligatorio)</p>
        <DeliveryModeCardGrid
          value={data.deliveryMode}
          onChange={(v) => onFieldChange("deliveryMode", v)}
          onBlur={() => onFieldBlur("deliveryMode")}
          error={errors.deliveryMode}
        />
      </div>

      <div className={`grid gap-6 ${data.promoEnabled ? "" : "md:grid-cols-2"}`}>
        {!data.promoEnabled ? (
          <div className={wizardSectionClass}>
            <Label htmlFor="skill-price" className="text-base font-bold tracking-tight text-foreground">
              Precio base (S/)
            </Label>
            <p className="mt-1 text-xs text-muted">Precio mínimo sugerido: S/ 15</p>
            <Input
              id="skill-price"
              type="number"
              min={MIN_PRICE}
              value={data.price}
              onChange={(event) => onFieldChange("price", event.target.value)}
              onBlur={() => onFieldBlur("price")}
              placeholder="15"
              className={`mt-3 ${wizardTextFieldClass} ${
                errors.price
                  ? "border-accent-red focus-visible:border-accent-red focus-visible:ring-accent-red/20"
                  : ""
              }`}
            />
            {errors.price ? <p className="mt-2 text-xs font-medium text-accent-red">{errors.price}</p> : null}
            <span className="mt-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              El comprador pagará S/ {priceText}
            </span>
          </div>
        ) : null}

        <div className={`${wizardSectionClass} ${data.promoEnabled ? "md:col-span-2" : ""}`}>
          <p className="text-base font-bold tracking-tight text-foreground">Entrega estimada</p>
          <p className="mt-1 text-xs text-muted">Una opción (obligatorio)</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DELIVERY_TIMES.map((value) => {
              const selected = data.deliveryTime === value;
              return (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  className={`h-10 rounded-xl border-2 px-3 text-xs font-semibold transition-[border-color,box-shadow] ${
                    selected
                      ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15"
                      : "border-border bg-surface-elevated text-foreground hover:border-primary/35"
                  }`}
                  onPress={() => onFieldChange("deliveryTime", value)}
                  onBlur={() => onFieldBlur("deliveryTime")}
                >
                  {value}
                </Button>
              );
            })}
          </div>
          {errors.deliveryTime ? (
            <p className="mt-2 text-xs font-medium text-accent-red">{errors.deliveryTime}</p>
          ) : null}
        </div>
      </div>

      <div className={wizardSectionClass}>
        <p className="mb-1 text-base font-bold tracking-tight text-foreground">Revisiones incluidas</p>
        <p className="mb-3 text-xs text-muted">Cuántas rondas de ajuste ofreces</p>
        <div className="flex flex-wrap gap-2">
          {REVISION_OPTIONS.map((value) => {
            const selected = data.revisionsIncluded === value;
            return (
              <Button
                key={value}
                type="button"
                variant="outline"
                className={`h-10 min-w-10 rounded-xl border-2 px-3 text-sm font-semibold transition-[border-color,box-shadow] ${
                  selected
                    ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15"
                    : "border-border bg-surface-elevated text-foreground hover:border-primary/35"
                }`}
                onPress={() => onFieldChange("revisionsIncluded", value)}
              >
                {value}
              </Button>
            );
          })}
        </div>
      </div>

      {coverBlock}
      {featuredBlock}
      {promoBlock}
    </section>
  );
}

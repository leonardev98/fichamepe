"use client";

import { useCallback, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react/button";
import type { SkillFormDraft } from "@/lib/api/my-services.api";
import {
  createSkillService,
  publishSkill,
  updateSkillService,
} from "@/lib/api/my-services.api";
import {
  presignUpload,
  putFileToPresignedUrl,
} from "@/lib/api/user-profile.api";
import { datetimeLocalToIso, promoEndFromNowMs } from "./skill-wizard-promo";
import type { ServicePublic } from "@/types/service.types";
import { SkillBasicStep } from "./SkillBasicStep";
import { SkillDetailsStep } from "./SkillDetailsStep";
import { SkillPreviewStep } from "./SkillPreviewStep";
import { SkillWizardProgress } from "./SkillWizardProgress";
import { SKILL_WIZARD_STEPS } from "./skill-wizard.constants";
import {
  EMPTY_SKILL_FORM_DATA,
  fromServiceToWizardData,
  type SkillWizardErrors,
  type SkillWizardFormData,
} from "./skill-wizard.types";
import {
  canPublish,
  validateField,
  validatePromoFields,
  validateStep,
} from "./skill-wizard.validation";
import { useAuthStore } from "@/store/auth.store";

type SkillWizardPageShellProps = {
  mode: "create" | "edit";
  skillId?: string;
  initialService?: ServicePublic | null;
};

function editStatusBannerClass(status: ServicePublic["status"]): string {
  if (status === "ACTIVA") return "border-success/30 bg-success/10";
  if (status === "PAUSADA") return "border-accent/35 bg-accent/10";
  if (status === "EN_REVISION") return "border-primary/30 bg-primary/10";
  if (status === "REQUIERE_CAMBIOS") return "border-accent-red/30 bg-accent-red/10";
  return "border-border bg-surface-elevated";
}

function statusLabel(status: ServicePublic["status"]): string {
  if (status === "ACTIVA") return "Activa";
  if (status === "PAUSADA") return "Pausada";
  if (status === "EN_REVISION") return "En revisión";
  if (status === "REQUIERE_CAMBIOS") return "Requiere cambios";
  return "Borrador";
}

function extractApiErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "No se pudo guardar la habilidad. Intenta nuevamente.";
  }
  const payload = error.response?.data as
    | { message?: string | string[]; error?: string }
    | undefined;
  if (Array.isArray(payload?.message) && payload.message.length > 0) {
    return payload.message.join(" ");
  }
  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }
  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  return `No se pudo guardar la habilidad (${error.response?.status ?? "sin respuesta"}).`;
}

export function SkillWizardPageShell({ mode, skillId, initialService }: SkillWizardPageShellProps) {
  const router = useRouter();
  const authUser = useAuthStore((s) => s.user);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [coverImageUploading, setCoverImageUploading] = useState(false);
  const [coverImageError, setCoverImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [coverImageFileToCrop, setCoverImageFileToCrop] = useState<File | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [data, setData] = useState<SkillWizardFormData>(
    initialService ? fromServiceToWizardData(initialService) : EMPTY_SKILL_FORM_DATA,
  );
  const [errors, setErrors] = useState<SkillWizardErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof SkillWizardFormData, boolean>>>({});

  const heading = mode === "edit" ? "Editar habilidad" : "Nueva habilidad";
  const currentStatus = initialService?.status;

  const sendsToReviewAfterSubmit =
    mode === "create" ||
    initialService?.status === "BORRADOR" ||
    initialService?.status === "REQUIERE_CAMBIOS";
  const featuredSlotsAvailable = useMemo(() => {
    const max = authUser?.featuredActiveMax ?? 0;
    const used = authUser?.featuredActiveCount ?? 0;
    const currentBoost = initialService?.isFeatured ? 1 : 0;
    return Math.max(0, max - used + currentBoost);
  }, [authUser?.featuredActiveCount, authUser?.featuredActiveMax, initialService?.isFeatured]);
  const canEnableFeatured = featuredSlotsAvailable > 0;

  const previewService = useMemo<ServicePublic>(() => {
    const priceNum = data.price ? Number(data.price) : null;
    const listNum =
      data.promoEnabled && data.listPrice.trim() ? Number(data.listPrice) : null;
    let previousPrice: number | null = null;
    let flashDealEndsAt: string | null = null;
    if (
      data.promoEnabled &&
      listNum != null &&
      priceNum != null &&
      Number.isFinite(listNum) &&
      Number.isFinite(priceNum) &&
      listNum > priceNum
    ) {
      previousPrice = listNum;
    }
    if (data.promoEnabled && previousPrice != null && data.promoEndsAtLocal.trim()) {
      try {
        const iso = datetimeLocalToIso(data.promoEndsAtLocal.trim());
        const t = new Date(iso).getTime();
        if (Number.isFinite(t) && t > Date.now() + 60_000) {
          flashDealEndsAt = iso;
        }
      } catch {
        /* ignore */
      }
    }
    const nextStatus =
      mode === "create"
        ? "EN_REVISION"
        : initialService?.status === "BORRADOR" || initialService?.status === "REQUIERE_CAMBIOS"
          ? "EN_REVISION"
          : (initialService?.status ?? "EN_REVISION");
    return {
      id: initialService?.id ?? "preview",
      title: data.title || "Tu habilidad aquí",
      description: data.description || "Describe qué recibirá el comprador.",
      price: priceNum,
      currency: "PEN",
      coverImageUrl: data.coverImageUrl ?? initialService?.coverImageUrl ?? null,
      isFeatured: data.featuredEnabled && canEnableFeatured,
      status: nextStatus,
      isActive: false,
      viewCount: initialService?.viewCount ?? 0,
      tags: data.tags,
      category: data.category || "other",
      deliveryMode: data.deliveryMode || "digital",
      deliveryTime: data.deliveryTime || "A coordinar",
      revisionsIncluded: data.revisionsIncluded || "0",
      profileId: initialService?.profileId ?? "",
      userId: initialService?.userId ?? "",
      createdAt: initialService?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: initialService?.profile,
      previousPrice,
      badge: initialService?.badge,
      weeklyHires: initialService?.weeklyHires,
      etaHours: initialService?.etaHours,
      distanceKm: initialService?.distanceKm,
      flashDealEndsAt,
      remainingSlots: initialService?.remainingSlots,
      soldRatio: initialService?.soldRatio,
      testimonial: initialService?.testimonial,
    };
  }, [canEnableFeatured, data, initialService, mode]);

  const onPromoToggle = useCallback((enabled: boolean) => {
    setData((prev) => ({
      ...prev,
      promoEnabled: enabled,
      ...(enabled ? {} : { listPrice: "", promoEndsAtLocal: "" }),
    }));
    setErrors((prev) => ({
      ...prev,
      listPrice: undefined,
      promoEndsAtLocal: undefined,
    }));
  }, []);

  const onPromoPreset = useCallback((msFromNow: number) => {
    const { local } = promoEndFromNowMs(msFromNow);
    setData((prev) => ({
      ...prev,
      promoEnabled: true,
      promoEndsAtLocal: local,
    }));
  }, []);

  const onFieldChange = <K extends keyof SkillWizardFormData>(
    field: K,
    value: SkillWizardFormData[K],
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, { ...data, [field]: value }) }));
    }
  };

  const handleCoverImagePick = async (file: File) => {
    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;

    setCoverImageError(null);
    if (!ALLOWED.includes(file.type)) {
      setCoverImageError(
        "Para la portada usa JPG, PNG o WebP (las fotos HEIC de iPhone a veces no se abren en el navegador).",
      );
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setCoverImageError("La imagen pesa más de 5 MB.");
      return;
    }
    setCoverImageFileToCrop(file);
  };

  const handleCroppedCoverImageUpload = async (file: File) => {
    setCoverImageUploading(true);
    try {
      const safeName =
        file.name.replace(/[^\w.\-]/g, "_").slice(0, 120) || "cover-image.jpg";
      const { uploadUrl, publicUrl, key } = await presignUpload(
        "service_cover",
        safeName,
        file.type,
      );
      await putFileToPresignedUrl(uploadUrl, file, file.type);
      setData((prev) => ({
        ...prev,
        coverImageUrl: publicUrl,
        coverImageKey: key,
        coverImageName: null,
      }));
      if (touched.coverImageUrl) {
        setErrors((prev) => ({ ...prev, coverImageUrl: undefined }));
      }
      setCoverImageFileToCrop(null);
    } catch (error) {
      setCoverImageError(
        error instanceof Error ? error.message : "No se pudo subir la imagen.",
      );
    } finally {
      setCoverImageUploading(false);
    }
  };

  const onFieldBlur = (field: keyof SkillWizardFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, data) }));
  };

  const goBack = () => {
    if (step === 0) return;
    setDirection("back");
    setStep((prev) => prev - 1);
  };

  const goNext = () => {
    if (step === 1 && coverImageFileToCrop) {
      setCoverImageError("Primero aplica o cancela el recorte de portada para continuar.");
      return;
    }
    const stepErrors = validateStep(step, data);
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    if (Object.values(stepErrors).some(Boolean)) return;
    setDirection("forward");
    setStep((prev) => Math.min(prev + 1, SKILL_WIZARD_STEPS.length - 1));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!canPublish(data)) {
      const promoE = validatePromoFields(data);
      const merged = {
        ...errors,
        title: validateField("title", data),
        category: validateField("category", data),
        description: validateField("description", data),
        deliveryMode: validateField("deliveryMode", data),
        price: validateField("price", data),
        deliveryTime: validateField("deliveryTime", data),
        listPrice: promoE.listPrice,
        promoEndsAtLocal: promoE.promoEndsAtLocal,
      };
      setErrors(merged);
      return;
    }
    setSaving(true);
    const promoPayload =
      data.promoEnabled && data.listPrice.trim() && data.promoEndsAtLocal.trim()
        ? {
            listPrice: Number(data.listPrice.trim()),
            promoEndsAt: datetimeLocalToIso(data.promoEndsAtLocal.trim()),
          }
        : { listPrice: null as null, promoEndsAt: null as null };
    const payload: SkillFormDraft = {
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      tags: data.tags,
      deliveryMode: data.deliveryMode,
      price: Number(data.price),
      ...promoPayload,
      deliveryTime: data.deliveryTime,
      revisionsIncluded: data.revisionsIncluded,
      coverImageUrl: data.coverImageUrl,
      isFeatured: data.featuredEnabled && canEnableFeatured,
      status: "BORRADOR",
    };
    try {
      if (sendsToReviewAfterSubmit && authUser?.emailVerified === false) {
        setSubmitError(
          "Verifica tu correo para enviar a revisión. Revisa el correo que te enviamos o pulsa «Reenviar correo» en la barra superior.",
        );
        return;
      }
      if (mode === "edit" && skillId) {
        const { status: _status, ...fieldsOnly } = payload;
        await updateSkillService(skillId, fieldsOnly);
        if (sendsToReviewAfterSubmit) {
          await publishSkill(skillId);
        }
      } else {
        const created = await createSkillService(payload);
        await publishSkill(created.id);
      }
      router.push(
        sendsToReviewAfterSubmit
          ? "/cuenta/publicaciones?toast=review-submitted"
          : "/cuenta/publicaciones?toast=changes-saved",
      );
    } catch (error) {
      setSubmitError(extractApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{heading}</h1>
        {mode === "edit" && currentStatus ? (
          <div
            role="status"
            className={`rounded-2xl border-2 px-4 py-3 sm:px-5 ${editStatusBannerClass(currentStatus)}`}
          >
            <p className="text-sm font-bold text-foreground">Estado: {statusLabel(currentStatus)}</p>
            {currentStatus === "ACTIVA" ? (
              <p className="mt-1 text-xs leading-relaxed text-muted">Visible públicamente en el marketplace.</p>
            ) : null}
            {currentStatus === "PAUSADA" ? (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Oculta temporalmente; conservas datos y estadísticas.
              </p>
            ) : null}
            {currentStatus === "BORRADOR" ? (
              <p className="mt-1 text-xs leading-relaxed text-muted">Guardada en tu cuenta; no es visible públicamente.</p>
            ) : null}
            {currentStatus === "EN_REVISION" ? (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                El equipo está revisando los cambios antes de publicar.
              </p>
            ) : null}
            {currentStatus === "REQUIERE_CAMBIOS" ? (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Revisa las observaciones en «Mis publicaciones» y vuelve a enviar cuando esté listo.
              </p>
            ) : null}
          </div>
        ) : null}
      </header>

      <SkillWizardProgress currentStep={step} />

      <div
        className={`rounded-3xl border-2 border-border bg-surface p-4 shadow-md transition-all sm:p-6 md:p-8 ${
          direction === "forward" ? "animate-in slide-in-from-right-3" : "animate-in slide-in-from-left-3"
        }`}
      >
        {step === 0 ? (
          <SkillBasicStep
            data={data}
            errors={errors}
            onFieldChange={onFieldChange}
            onFieldBlur={onFieldBlur}
          />
        ) : null}
        {step === 1 ? (
          <SkillDetailsStep
            data={data}
            errors={errors}
            onFieldChange={onFieldChange}
            onFieldBlur={onFieldBlur}
            onPickCoverImage={handleCoverImagePick}
            onRemoveCoverImage={() => {
              setCoverImageError(null);
              setCoverImageFileToCrop(null);
              setData((prev) => ({
                ...prev,
                coverImageUrl: null,
                coverImageKey: null,
                coverImageName: null,
              }));
            }}
            coverImageError={coverImageError}
            coverImageUploading={coverImageUploading}
            pendingCropFile={coverImageFileToCrop}
            onCancelCrop={() => {
              setCoverImageError(null);
              setCoverImageFileToCrop(null);
            }}
            onConfirmCroppedCover={handleCroppedCoverImageUpload}
            onPromoToggle={onPromoToggle}
            onPromoPreset={onPromoPreset}
            featuredSlotsAvailable={featuredSlotsAvailable}
            onFeaturedToggle={(enabled) => onFieldChange("featuredEnabled", enabled)}
          />
        ) : null}
        {step === 2 ? <SkillPreviewStep data={data} previewService={previewService} /> : null}
      </div>

      {step === 2 ? (
        <p className="rounded-2xl border-2 border-border bg-surface-elevated/30 px-4 py-3 text-xs leading-relaxed text-muted shadow-sm sm:px-5 sm:py-4 sm:text-sm">
          {sendsToReviewAfterSubmit
            ? "Al enviar, la ficha pasa a revisión del equipo antes de aparecer en Explorar."
            : "Los cambios se guardan en tu publicación actual."}
        </p>
      ) : null}
      {submitError ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-accent-red">{submitError}</p>
          {submitError.includes("destacadas") ? (
            <p className="text-sm text-muted">
              <Link
                href="/cuenta/referidos"
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Abrir «Mis referidos»
              </Link>{" "}
              para conseguir más cupos de destacadas.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          className="rounded-full border-border px-6 font-semibold text-foreground"
          isDisabled={step === 0 || saving}
          onPress={goBack}
        >
          Atrás
        </Button>
        {step < SKILL_WIZARD_STEPS.length - 1 ? (
          <Button
            variant="primary"
            className="rounded-full bg-primary px-6 font-semibold text-white hover:opacity-95"
            onPress={goNext}
          >
            Continuar
          </Button>
        ) : (
          <Button
            variant="primary"
            className="rounded-full bg-primary px-6 font-semibold text-white hover:opacity-95"
            isDisabled={saving || !canPublish(data)}
            onPress={handleSubmit}
          >
            {sendsToReviewAfterSubmit ? "Enviar a revisión" : "Guardar cambios"}
          </Button>
        )}
      </div>
    </div>
  );
}

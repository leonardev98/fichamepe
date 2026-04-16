"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { UseOverlayStateReturn } from "@heroui/react";
import { Modal } from "@heroui/react/modal";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { FieldError } from "@heroui/react/field-error";
import { Eye, EyeOff, X } from "lucide-react";
import { parseApiErrorMessage, registerAccount } from "@/lib/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { GoogleMark } from "@/components/auth/GoogleMark";
import {
  buildGoogleOAuthStartUrl,
  GOOGLE_OAUTH_MISSING_API_URL_MESSAGE,
} from "@/lib/google-oauth";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Indica al menos 2 caracteres"),
    email: z.string().min(1, "Requerido").email("Correo inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    referralCode: z.string().max(16, "Máximo 16 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

type RegisterModalProps = {
  state: UseOverlayStateReturn;
  initialRole: "client" | "freelancer" | null;
  initialReferralCode?: string | null;
  onClosed: () => void;
  onSwitchToLogin: () => void;
};

export function RegisterModal({
  state,
  initialRole,
  initialReferralCode,
  onClosed,
  onSwitchToLogin,
}: RegisterModalProps) {
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
    },
  });

  useEffect(() => {
    if (!state.isOpen) {
      onClosed();
    }
  }, [state.isOpen, onClosed]);

  useEffect(() => {
    if (!state.isOpen) return;
    const ref = initialReferralCode?.trim() ? initialReferralCode.trim().toUpperCase() : "";
    reset({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      referralCode: ref,
    });
  }, [state.isOpen, initialRole, initialReferralCode, reset]);

  const referralCode = watch("referralCode");
  const googleOAuthHref = useMemo(
    () =>
      buildGoogleOAuthStartUrl({
        from: "/",
        referral: referralCode?.trim() || undefined,
        role: initialRole ?? undefined,
      }),
    [referralCode, initialRole],
  );

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await registerAccount({
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        ...(initialRole ? { role: initialRole } : {}),
        ...(data.referralCode?.trim()
          ? { referralCode: data.referralCode.trim().toUpperCase() }
          : {}),
      });
      loginStore(res.accessToken, res.user);
      void import("@/stores/favoritesStore").then(({ useFavoritesStore }) => {
        void useFavoritesStore.getState().syncFromApi();
      });
      if (res.user.emailVerified === false) {
        window.alert(
          "Te enviamos un correo con un enlace para verificar tu cuenta. Cuando lo confirmes podrás publicar y conversar.",
        );
      }
      reset();
      state.close();
      router.replace("/");
    } catch (e: unknown) {
      setFormError("root", {
        message: parseApiErrorMessage(e, "No pudimos crear la cuenta."),
      });
    }
  };

  const pillInputClass =
    "h-12 w-full rounded-full border border-[#E5E7EB] bg-white px-5 text-[15px] text-[#1A1A2E] shadow-none placeholder:text-[#9CA3AF] focus-visible:ring-2 focus-visible:ring-[#6C63FF]/35";

  return (
    <Modal state={state}>
      <Modal.Trigger className="sr-only" aria-label="Abrir registro">
        Abrir
      </Modal.Trigger>
      <Modal.Backdrop
        isDismissable
        className="bg-[#1A1A2E]/50 backdrop-blur-[3px]"
      >
        <Modal.Container placement="center" size="lg" scroll="inside">
          <Modal.Dialog className="w-full !max-w-[min(calc(100vw-12px),560px)] !p-0 sm:!max-w-[560px] rounded-3xl border border-[#E5E7EB] bg-white shadow-2xl shadow-[#1A1A2E]/10 outline-none">
            <Modal.Header className="relative px-5 pb-1 pt-8 text-center sm:px-10 sm:pt-10">
              <button
                type="button"
                aria-label="Cerrar"
                className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A1A2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/35 sm:right-4 sm:top-4"
                onClick={() => state.close()}
              >
                <X className="size-5" strokeWidth={2} aria-hidden />
              </button>
              <Modal.Heading className="text-xl font-semibold tracking-tight text-[#1A1A2E] sm:text-2xl">
                Crea tu cuenta
              </Modal.Heading>
              <p className="mx-auto mt-2 max-w-[min(100%,380px)] text-sm leading-snug text-[#6B7280] sm:text-[15px]">
                Completa tus datos para empezar en fichame.pe.
              </p>
            </Modal.Header>

            <Modal.Body className="px-5 pb-6 pt-3 sm:px-10 sm:pb-8 sm:pt-4">
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="register-modal-fullName"
                    className="text-left text-sm font-medium text-[#374151]"
                  >
                    Nombre completo
                  </Label>
                  <Input
                    id="register-modal-fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Tu nombre y apellido"
                    className={pillInputClass}
                    {...register("fullName")}
                    aria-invalid={errors.fullName ? true : undefined}
                  />
                  {errors.fullName?.message ? (
                    <FieldError className="text-sm text-red-600">
                      {errors.fullName.message}
                    </FieldError>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="register-modal-email"
                    className="text-left text-sm font-medium text-[#374151]"
                  >
                    Correo electrónico
                  </Label>
                  <Input
                    id="register-modal-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Ingresa tu correo"
                    className={pillInputClass}
                    {...register("email")}
                    aria-invalid={errors.email ? true : undefined}
                  />
                  {errors.email?.message ? (
                    <FieldError className="text-sm text-red-600">
                      {errors.email.message}
                    </FieldError>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="register-modal-referralCode"
                    className="text-left text-sm font-medium text-[#374151]"
                  >
                    Código de referido{" "}
                    <span className="font-normal text-[#9CA3AF]">(opcional)</span>
                  </Label>
                  <Input
                    id="register-modal-referralCode"
                    type="text"
                    autoComplete="off"
                    placeholder="Ej. ABC12XYZ89"
                    className={pillInputClass}
                    {...register("referralCode")}
                    aria-invalid={errors.referralCode ? true : undefined}
                  />
                  {errors.referralCode?.message ? (
                    <FieldError className="text-sm text-red-600">
                      {errors.referralCode.message}
                    </FieldError>
                  ) : null}
                  <p className="text-xs leading-snug text-[#9CA3AF]">
                    Si alguien te invitó a fichame.pe, pega su código aquí. Así le regalas un cupo
                    extra de publicaciones.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="register-modal-password"
                    className="text-left text-sm font-medium text-[#374151]"
                  >
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-modal-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
                      className={`${pillInputClass} pr-12`}
                      {...register("password")}
                      aria-invalid={errors.password ? true : undefined}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] transition-colors hover:text-[#374151]"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" aria-hidden />
                      ) : (
                        <Eye className="size-5" aria-hidden />
                      )}
                    </button>
                  </div>
                  {errors.password?.message ? (
                    <FieldError className="text-sm text-red-600">
                      {errors.password.message}
                    </FieldError>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="register-modal-confirmPassword"
                    className="text-left text-sm font-medium text-[#374151]"
                  >
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-modal-confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repite tu contraseña"
                      className={`${pillInputClass} pr-12`}
                      {...register("confirmPassword")}
                      aria-invalid={errors.confirmPassword ? true : undefined}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] transition-colors hover:text-[#374151]"
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      aria-pressed={showConfirmPassword}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-5" aria-hidden />
                      ) : (
                        <Eye className="size-5" aria-hidden />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword?.message ? (
                    <FieldError className="text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </FieldError>
                  ) : null}
                </div>

                {errors.root?.message ? (
                  <p className="text-center text-sm text-red-600" role="alert">
                    {errors.root.message}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  variant="primary"
                  className="h-12 w-full rounded-full bg-[#6C63FF] text-[15px] font-semibold text-white shadow-sm hover:opacity-[0.96]"
                  isDisabled={isSubmitting}
                >
                  {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
                </Button>
              </form>

              <div className="relative my-5 sm:my-6">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden
                >
                  <span className="w-full border-t border-[#E5E7EB]" />
                </div>
                <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                  <span className="bg-white px-3">O continúa con</span>
                </div>
              </div>

              {googleOAuthHref ? (
                <a
                  href={googleOAuthHref}
                  className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-[15px] font-medium text-[#1A1A2E] no-underline hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]/35"
                >
                  <GoogleMark className="size-5 shrink-0" aria-hidden />
                  Continuar con Google
                </a>
              ) : (
                <button
                  type="button"
                  className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-4 text-[15px] font-medium text-[#9CA3AF]"
                  onClick={() =>
                    window.alert(GOOGLE_OAUTH_MISSING_API_URL_MESSAGE)
                  }
                >
                  <GoogleMark className="size-5 shrink-0 opacity-60" aria-hidden />
                  Continuar con Google
                </button>
              )}

              <p className="mt-5 text-center text-sm text-[#6B7280] sm:mt-6 sm:text-[15px]">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  className="font-semibold text-[#6C63FF] underline-offset-2 hover:underline"
                  onClick={() => onSwitchToLogin()}
                >
                  Iniciar sesión
                </button>
              </p>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

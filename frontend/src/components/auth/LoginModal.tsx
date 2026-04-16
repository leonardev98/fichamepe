"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { UseOverlayStateReturn } from "@heroui/react";
import { Modal } from "@heroui/react/modal";
import { Button } from "@heroui/react/button";
import { Checkbox } from "@heroui/react/checkbox";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { FieldError } from "@heroui/react/field-error";
import { Eye, EyeOff, X } from "lucide-react";
import { fetchAuthMe, parseApiErrorMessage, postLogin } from "@/lib/api/auth.api";
import { resolvePostLoginHref } from "@/lib/post-login-redirect";
import { useAuthModals } from "@/components/auth/auth-modals-context";
import { GoogleMark } from "@/components/auth/GoogleMark";
import { useAuthStore } from "@/store/auth.store";
import {
  buildGoogleOAuthStartUrl,
  GOOGLE_OAUTH_MISSING_API_URL_MESSAGE,
} from "@/lib/google-oauth";

const loginSchema = z.object({
  email: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginForm = z.infer<typeof loginSchema>;

type LoginModalProps = {
  state: UseOverlayStateReturn;
};

export function LoginModal({ state }: LoginModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openRegister, openForgotPassword } = useAuthModals();
  const loginStore = useAuthStore((s) => s.login);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const googleOAuthHref = useMemo(() => {
    const from = searchParams.get("from");
    return buildGoogleOAuthStartUrl({
      from:
        typeof from === "string" && from.startsWith("/") ? from : "/",
    });
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    reset,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const { accessToken } = await postLogin(data.email, data.password);
      setAccessToken(accessToken);
      const user = await fetchAuthMe();
      loginStore(accessToken, user);
      reset();
      state.close();
      const from = searchParams.get("from");
      router.replace(resolvePostLoginHref(user.role, from));
    } catch (e: unknown) {
      setFormError("root", {
        message: parseApiErrorMessage(
          e,
          "No pudimos iniciar sesión. Revisa tus datos.",
        ),
      });
    }
  };

  const pillInputClass =
    "h-12 w-full rounded-full border border-[#E5E7EB] bg-white px-5 text-[15px] text-[#1A1A2E] shadow-none placeholder:text-[#9CA3AF] focus-visible:ring-2 focus-visible:ring-[#6C63FF]/35";

  return (
    <Modal state={state}>
      <Modal.Trigger className="sr-only" aria-label="Abrir login">
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
                Inicia sesión en tu cuenta
              </Modal.Heading>
              <p className="mx-auto mt-2 max-w-[min(100%,360px)] text-sm leading-snug text-[#6B7280] sm:text-[15px]">
                ¡Bienvenido de nuevo! Ingresa tus datos para iniciar sesión.
              </p>
            </Modal.Header>

            <Modal.Body className="px-5 pb-6 pt-3 sm:px-10 sm:pb-8 sm:pt-4">
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="login-modal-email"
                    className="text-left text-sm font-medium text-[#374151]"
                  >
                    Correo electrónico
                  </Label>
                  <Input
                    id="login-modal-email"
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
                    htmlFor="login-modal-password"
                    className="text-left text-sm font-medium text-[#374151]"
                  >
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-modal-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Ingresa tu contraseña"
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

                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <Checkbox
                    isSelected={rememberMe}
                    onChange={setRememberMe}
                    className="gap-2 text-sm text-[#374151]"
                  >
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Content>Recordarme</Checkbox.Content>
                  </Checkbox>
                  <button
                    type="button"
                    className="text-sm font-medium text-[#6C63FF] underline decoration-[#6C63FF]/40 underline-offset-2 transition-colors hover:decoration-[#6C63FF]"
                    onClick={() => openForgotPassword()}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
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
                  {isSubmitting ? "Entrando…" : "Iniciar sesión"}
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
                ¿Eres nuevo?{" "}
                <button
                  type="button"
                  className="font-semibold text-[#6C63FF] underline-offset-2 hover:underline"
                  onClick={() => openRegister()}
                >
                  Crea una cuenta
                </button>
              </p>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

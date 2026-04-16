"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@heroui/react/button";
import { useAuthModals } from "@/components/auth/auth-modals-context";
import {
  fetchAuthMe,
  parseApiErrorMessage,
  postLogin,
} from "@/lib/api/auth.api";
import { resolvePostLoginHref } from "@/lib/post-login-redirect";
import { useAuthStore } from "@/store/auth.store";
import { GoogleMark } from "@/components/auth/GoogleMark";
import {
  buildGoogleOAuthStartUrl,
  GOOGLE_OAUTH_MISSING_API_URL_MESSAGE,
} from "@/lib/google-oauth";

const loginSchema = z.object({
  email: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleError = searchParams.get("error") === "google";
  const { openRegister, openForgotPassword } = useAuthModals();
  const login = useAuthStore((s) => s.login);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

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
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const loginRes = await postLogin(data.email, data.password);
      setAccessToken(loginRes.accessToken);
      const user = await fetchAuthMe();
      login(loginRes.accessToken, user);
      void import("@/stores/favoritesStore").then(({ useFavoritesStore }) => {
        void useFavoritesStore.getState().syncFromApi();
      });
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

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
      >
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex flex-col items-center gap-1 text-center no-underline"
        >
          <span className="text-2xl font-semibold tracking-tight">
            <span className="text-primary">fichame</span>
            <span className="text-accent">.pe</span>
          </span>
          <span className="text-sm text-muted">Inicia sesión en tu cuenta</span>
        </Link>

        <div className="rounded-2xl border border-border bg-surface/90 p-8 shadow-xl backdrop-blur-sm">
          <h1 className="mb-6 text-xl font-semibold text-foreground">
            Inicio de sesión
          </h1>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-muted">
                Correo
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-foreground outline-none ring-primary/40 placeholder:text-muted/70 focus:ring-2"
                placeholder="tu@correo.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-muted"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-foreground outline-none ring-primary/40 focus:ring-2"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-medium text-accent underline-offset-2 hover:underline"
                  onClick={() => openForgotPassword()}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {errors.root && (
              <p className="text-sm text-red-400">{errors.root.message}</p>
            )}

            {googleError ? (
              <p className="text-sm text-red-400" role="alert">
                No pudimos iniciar sesión con Google. Si ya tienes cuenta con
                contraseña, usa el formulario de arriba o restablece tu contraseña.
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              className="mt-2 w-full bg-primary font-semibold text-white hover:opacity-95"
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Entrando…" : "Continuar"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide text-muted">
              <span className="bg-surface/90 px-3">O continúa con</span>
            </div>
          </div>

          {googleOAuthHref ? (
            <a
              href={googleOAuthHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-3 font-medium text-foreground no-underline hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <GoogleMark className="size-5 shrink-0" aria-hidden />
              Continuar con Google
            </a>
          ) : (
            <button
              type="button"
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-3 font-medium text-muted opacity-70"
              onClick={() =>
                window.alert(GOOGLE_OAUTH_MISSING_API_URL_MESSAGE)
              }
            >
              <GoogleMark className="size-5 shrink-0 opacity-60" aria-hidden />
              Continuar con Google
            </button>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              className="font-medium text-accent underline-offset-2 hover:underline"
              onClick={() => openRegister()}
            >
              Regístrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
      >
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>
      <p className="relative text-sm text-muted">Cargando…</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}

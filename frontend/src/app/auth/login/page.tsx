"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@heroui/react/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type { AuthUser } from "@/types/auth";

const loginSchema = z.object({
  email: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
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
      const { data: loginRes } = await api.post<{ accessToken: string }>(
        "/auth/login",
        {
          email: data.email.trim().toLowerCase(),
          password: data.password,
        },
      );
      setAccessToken(loginRes.accessToken);
      const { data: user } = await api.get<AuthUser>("/auth/me");
      login(loginRes.accessToken, user);
      if (user.role === "client") {
        router.replace("/explorar");
      } else if (user.role === "freelancer") {
        router.replace("/dashboard");
      } else {
        router.replace("/explorar");
      }
    } catch (e: unknown) {
      const raw =
        typeof e === "object" &&
        e !== null &&
        "response" in e &&
        (e as { response?: { data?: { message?: unknown } } }).response?.data
          ?.message;
      const msg = Array.isArray(raw)
        ? raw.join(", ")
        : typeof raw === "string"
          ? raw
          : "No pudimos iniciar sesión. Revisa tus datos.";
      setFormError("root", { message: msg });
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
            <span className="text-primary">fícháme</span>
            <span className="text-accent">.pe</span>
          </span>
          <span className="text-sm text-muted">Inicia sesión en tu cuenta</span>
        </Link>

        <div className="rounded-2xl border border-border bg-surface/90 p-8 shadow-xl backdrop-blur-sm">
          <h1 className="mb-6 text-xl font-semibold text-foreground">Entrar</h1>

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
            </div>

            {errors.root && (
              <p className="text-sm text-red-400">{errors.root.message}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="mt-2 w-full bg-primary font-semibold text-white hover:opacity-95"
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            ¿No tienes cuenta?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

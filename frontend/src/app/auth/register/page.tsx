"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@heroui/react/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type { AuthUser } from "@/types/auth";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Indica al menos 2 caracteres"),
    email: z.string().min(1, "Requerido").email("Correo inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    role: z.enum(["client", "freelancer"], {
      message: "Elige una opción",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function roleCardClass(selected: boolean) {
  return `flex cursor-pointer flex-col rounded-2xl border p-5 text-left transition-all ${
    selected
      ? "border-primary bg-primary/15 ring-2 ring-primary/50"
      : "border-border bg-surface-elevated/50 hover:border-primary/35 hover:bg-surface-elevated/80"
  }`;
}

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const { data: res } = await api.post<{
        accessToken: string;
        user: AuthUser;
      }>("/auth/register", {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role,
      });
      login(res.accessToken, res.user);
      router.replace("/onboarding");
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
          : "No pudimos crear la cuenta.";
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

      <div className="relative w-full max-w-lg">
        <Link
          href="/"
          className="mb-8 flex flex-col items-center gap-1 text-center no-underline"
        >
          <span className="text-2xl font-semibold tracking-tight">
            <span className="text-primary">fícháme</span>
            <span className="text-accent">.pe</span>
          </span>
          <span className="text-sm text-muted">Crea tu cuenta</span>
        </Link>

        <div className="rounded-2xl border border-border bg-surface/90 p-8 shadow-xl backdrop-blur-sm">
          <h1 className="mb-6 text-xl font-semibold text-foreground">Registro</h1>

          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-muted">
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-foreground outline-none ring-primary/40 focus:ring-2"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-sm text-red-400">{errors.fullName.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-muted">
                Correo
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-foreground outline-none ring-primary/40 focus:ring-2"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-muted">
                ¿Cómo quieres usar fícháme.pe?
              </p>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      className={roleCardClass(field.value === "client")}
                      onClick={() => field.onChange("client")}
                    >
                      <span className="text-2xl" aria-hidden>
                        🧑‍💼
                      </span>
                      <span className="mt-2 font-semibold text-foreground">
                        Quiero contratar talento
                      </span>
                      <span className="mt-1 text-xs text-muted">Cuenta cliente</span>
                    </button>
                    <button
                      type="button"
                      className={roleCardClass(field.value === "freelancer")}
                      onClick={() => field.onChange("freelancer")}
                    >
                      <span className="text-2xl" aria-hidden>
                        💼
                      </span>
                      <span className="mt-2 font-semibold text-foreground">
                        Quiero que me contraten
                      </span>
                      <span className="mt-1 text-xs text-muted">Cuenta freelancer</span>
                    </button>
                  </div>
                )}
              />
              {errors.role && (
                <p className="mt-2 text-sm text-red-400">{errors.role.message}</p>
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
                autoComplete="new-password"
                className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-foreground outline-none ring-primary/40 focus:ring-2"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-muted"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-foreground outline-none ring-primary/40 focus:ring-2"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {errors.root && (
              <p className="text-sm text-red-400">{errors.root.message}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="mt-1 w-full bg-primary font-semibold text-white hover:opacity-95"
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

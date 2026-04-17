"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { fetchAuthMe, parseApiErrorMessage } from "@/lib/api/auth.api";
import {
  isNotFoundError,
  patchCurrentUser,
  patchProfileByUserId,
  postProfile,
  presignAvatarUpload,
  putFileToPresignedUrl,
} from "@/lib/api/user-profile.api";
import { useResendVerificationEmail } from "@/hooks/use-resend-verification-email";
import { useAuthStore } from "@/store/auth.store";
import type { AuthUser } from "@/types/auth";

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp";

function displayNameFromForm(fullName: string, email: string): string {
  const t = fullName.trim();
  if (t.length) return t;
  const local = email.split("@")[0]?.trim();
  return local && local.length ? local : "Usuario";
}

export function EditProfileForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const { pending: resendPending, feedback: resendFeedback, resend, clearFeedback: clearResendFeedback } =
    useResendVerificationEmail();

  const resetFromUser = useCallback((u: AuthUser) => {
    setFullName(u.fullName ?? "");
    setEmail(u.email);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setSavedOk(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    resetFromUser(user);
  }, [user, resetFromUser]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onPickFile = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      setError("Elige un archivo de imagen (JPEG, PNG o WebP).");
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSavedOk(false);
    setSubmitting(true);
    try {
      let publicUrl: string | undefined;
      if (file) {
        const safeName = file.name.replace(/[^\w.\-]/g, "_").slice(0, 120) || "avatar.jpg";
        const { uploadUrl, publicUrl: pub } = await presignAvatarUpload(safeName, file.type);
        await putFileToPresignedUrl(uploadUrl, file, file.type);
        publicUrl = pub;
      }

      const emailChanged = email.trim().toLowerCase() !== user.email.toLowerCase();
      const nameChanged = (fullName.trim() || null) !== (user.fullName?.trim() || null);
      if (emailChanged || nameChanged) {
        await patchCurrentUser(user.id, {
          ...(emailChanged ? { email: email.trim().toLowerCase() } : {}),
          ...(nameChanged ? { fullName: fullName.trim() } : {}),
        });
      }

      const displayName = displayNameFromForm(fullName, email);
      const profilePatch: { displayName: string; avatarUrl?: string | null } = {
        displayName,
      };
      if (publicUrl !== undefined) {
        profilePatch.avatarUrl = publicUrl;
      }
      try {
        await patchProfileByUserId(user.id, profilePatch);
      } catch (err) {
        if (isNotFoundError(err)) {
          await postProfile({
            displayName,
            ...(publicUrl !== undefined ? { avatarUrl: publicUrl } : {}),
          });
        } else {
          throw err;
        }
      }

      const fresh = await fetchAuthMe();
      setUser(fresh);
      resetFromUser(fresh);
      setSavedOk(true);
      router.refresh();
    } catch (err: unknown) {
      setError(parseApiErrorMessage(err, "No pudimos guardar los cambios."));
    } finally {
      setSubmitting(false);
    }
  };

  const avatarPreview = previewUrl ?? user?.avatarUrl ?? null;

  if (!user) {
    return (
      <p className="text-sm text-muted">
        Inicia sesión para editar tu perfil.
      </p>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
      <div className="border-b border-border pb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Editar perfil
        </h1>
        <p className="mt-2 text-sm text-muted">
          Actualiza tu nombre, correo y foto. La imagen se sube a tu almacenamiento seguro.
        </p>
      </div>

      <form id={formId} className="mt-6 flex flex-col gap-5" onSubmit={onSubmit}>
        <div className="flex flex-col items-center gap-3">
          <div className="relative size-24 overflow-hidden rounded-full border-2 border-border bg-primary/5">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt=""
                fill
                unoptimized={avatarPreview.startsWith("blob:")}
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-2xl font-bold text-primary">
                {(fullName || email).slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_IMAGES}
            className="sr-only"
            onChange={onFileChange}
          />
          <Button type="button" variant="outline" className="rounded-full" onPress={onPickFile}>
            {user.avatarUrl || file ? "Cambiar foto" : "Añadir foto"}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${formId}-name`} className="text-sm font-medium text-foreground">
            Nombre
          </Label>
          <Input
            id={`${formId}-name`}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-12 w-full rounded-full border border-border bg-white px-5 text-[15px] shadow-none"
            placeholder="Tu nombre"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`${formId}-email`} className="text-sm font-medium text-foreground">
            Correo
          </Label>
          <Input
            id={`${formId}-email`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-full border border-border bg-white px-5 text-[15px] shadow-none"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div
          id="verificacion-correo"
          className="scroll-mt-24 rounded-2xl border border-border bg-surface-elevated/80 p-4 sm:p-5"
        >
          <h2 className="text-sm font-semibold text-foreground">Verificación del correo</h2>
          {user.emailVerified === false ? (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2 text-sm text-muted">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>
                  Tu correo aún no está verificado. Revisa tu bandeja (y spam) o reenvía el enlace de confirmación.
                </span>
              </p>
              <Button
                type="button"
                variant="primary"
                className="shrink-0 rounded-full bg-gradient-to-r from-primary to-primary-light font-semibold text-white"
                isPending={resendPending}
                onPress={() => {
                  clearResendFeedback();
                  void resend();
                }}
              >
                Reenviar correo de verificación
              </Button>
            </div>
          ) : (
            <p className="mt-3 flex items-start gap-2 text-sm text-muted">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              <span>Tu correo está verificado. Puedes publicar y usar conversaciones sin restricciones.</span>
            </p>
          )}
          {user.emailVerified === false && resendFeedback ? (
            <p className="mt-2 text-sm text-muted">{resendFeedback}</p>
          ) : null}
        </div>

        {error ? <p className="text-center text-sm text-accent-red">{error}</p> : null}
        {savedOk ? (
          <p className="text-center text-sm font-medium text-primary" role="status">
            Cambios guardados correctamente.
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/explorar"
            className={`inline-flex h-10 items-center justify-center rounded-full border border-primary bg-transparent px-5 text-sm font-semibold text-primary transition hover:bg-primary/5 ${
              submitting ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Volver a explorar
          </Link>
          <Button
            type="submit"
            variant="primary"
            className="rounded-full bg-gradient-to-r from-primary to-primary-light font-semibold text-white"
            isDisabled={submitting}
          >
            {submitting ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
}

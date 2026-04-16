"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "@heroui/react/button";
import { Checkbox } from "@heroui/react/checkbox";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { Modal } from "@heroui/react/modal";
import { parseApiErrorMessage } from "@/lib/api/auth.api";
import { patchCurrentUser } from "@/lib/api/user-profile.api";
import { useAuthStore } from "@/store/auth.store";

type DangerModal = "deactivate" | "delete" | null;

export default function CuentaConfiguracionPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [modal, setModal] = useState<DangerModal>(null);
  const [understoodDeactivate, setUnderstoodDeactivate] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailNorm = user?.email?.trim().toLowerCase() ?? "";
  const deleteEmailOk = useMemo(
    () => deleteConfirmEmail.trim().toLowerCase() === emailNorm && emailNorm.length > 0,
    [deleteConfirmEmail, emailNorm],
  );

  const closeModal = () => {
    setModal(null);
    setUnderstoodDeactivate(false);
    setDeleteConfirmEmail("");
    setError(null);
  };

  const runDeactivate = async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await patchCurrentUser(user.id, { isActive: false });
      logout();
      router.replace("/");
    } catch (e) {
      setError(parseApiErrorMessage(e, "No pudimos desactivar la cuenta. Intenta de nuevo."));
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-surface-elevated px-6 py-12 text-center">
        <p className="text-sm text-muted">Inicia sesión para ver la configuración de tu cuenta.</p>
        <Link
          href="/auth/login?from=/cuenta/configuracion"
          className="mt-4 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white no-underline transition hover:opacity-95"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Configuración</h2>
        <p className="mt-1 text-sm text-muted">
          Seguridad de la cuenta y opciones sensibles. Los cambios aquí afectan todo tu acceso a fichame.pe.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-sm font-semibold text-foreground">Preferencias</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Para editar tu nombre, correo o foto, usa{" "}
          <Link href="/cuenta/perfil" className="font-medium text-primary underline-offset-2 hover:underline">
            Editar perfil
          </Link>
          .
        </p>
      </section>

      <section className="rounded-2xl border border-accent-red/20 bg-gradient-to-br from-accent-red/[0.04] via-white to-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-red/10 text-accent-red">
            <AlertTriangle className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Zona de peligro</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Estas acciones limitan o cortan tu acceso. Si tienes publicaciones activas, dejarán de mostrarse
              públicamente mientras la cuenta esté deshabilitada.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-border bg-white/90 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <ShieldOff className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
                <div>
                  <p className="font-semibold text-foreground">Desactivar cuenta</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    No podrás iniciar sesión hasta que soporte reactive tu cuenta. Tus datos se conservan en el
                    sistema.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="shrink-0 rounded-full border-accent-red/45 font-semibold text-accent-red hover:bg-accent-red/5"
                onPress={() => setModal("deactivate")}
              >
                Desactivar
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white/90 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <Trash2 className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
                <div>
                  <p className="font-semibold text-foreground">Eliminar cuenta</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    Deshabilita la cuenta de forma definitiva en la app. Para un borrado completo de datos
                    personales (RGPD), escríbenos a soporte tras cerrar la cuenta.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="shrink-0 rounded-full border-border font-semibold text-foreground hover:bg-surface-elevated"
                onPress={() => setModal("delete")}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Modal isOpen={modal === "deactivate"} onOpenChange={(open) => !open && closeModal()}>
        <Modal.Trigger className="sr-only" aria-label="Abrir desactivar cuenta">
          Abrir
        </Modal.Trigger>
        <Modal.Backdrop isDismissable className="bg-primary-dark/40 backdrop-blur-[2px]">
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog className="rounded-2xl border border-border bg-white p-0 shadow-xl">
              <Modal.Header className="border-b border-border px-5 py-4">
                <Modal.Heading className="text-lg font-bold text-foreground">
                  ¿Desactivar tu cuenta?
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="space-y-4 px-5 py-4">
                <p className="text-sm leading-relaxed text-muted">
                  Cerraremos tu sesión y no podrás volver a entrar con este correo hasta que el equipo de soporte
                  reactive la cuenta. Tus publicaciones dejarán de mostrarse al público.
                </p>
                <Checkbox
                  isSelected={understoodDeactivate}
                  onChange={setUnderstoodDeactivate}
                  className="items-start gap-3 text-sm text-foreground"
                >
                  <Checkbox.Control className="mt-0.5">
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>Entiendo y quiero continuar</Checkbox.Content>
                </Checkbox>
                {error ? <p className="text-sm font-medium text-accent-red">{error}</p> : null}
              </Modal.Body>
              <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
                <Button variant="outline" className="rounded-full px-5" onPress={closeModal} isDisabled={busy}>
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  className="rounded-full bg-accent-red px-5 font-semibold text-white hover:opacity-95"
                  isDisabled={!understoodDeactivate || busy}
                  onPress={() => void runDeactivate()}
                >
                  {busy ? "Procesando…" : "Desactivar cuenta"}
                </Button>
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal isOpen={modal === "delete"} onOpenChange={(open) => !open && closeModal()}>
        <Modal.Trigger className="sr-only" aria-label="Abrir eliminar cuenta">
          Abrir
        </Modal.Trigger>
        <Modal.Backdrop isDismissable className="bg-primary-dark/40 backdrop-blur-[2px]">
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog className="rounded-2xl border border-border bg-white p-0 shadow-xl">
              <Modal.Header className="border-b border-border px-5 py-4">
                <Modal.Heading className="text-lg font-bold text-foreground">
                  Eliminar cuenta
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="space-y-4 px-5 py-4">
                <p className="text-sm leading-relaxed text-muted">
                  Para confirmar, escribe tu correo exactamente como aparece en tu cuenta. Esta acción deshabilita
                  el acceso de la misma forma que desactivar; el borrado legal completo de datos se gestiona aparte
                  con soporte.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="delete-email-confirm" className="text-sm font-medium text-foreground">
                    Tu correo
                  </Label>
                  <Input
                    id="delete-email-confirm"
                    type="email"
                    autoComplete="off"
                    placeholder={user.email}
                    value={deleteConfirmEmail}
                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    className="rounded-xl border border-border"
                  />
                </div>
                {error ? <p className="text-sm font-medium text-accent-red">{error}</p> : null}
              </Modal.Body>
              <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
                <Button variant="outline" className="rounded-full px-5" onPress={closeModal} isDisabled={busy}>
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  className="rounded-full bg-accent-red px-5 font-semibold text-white hover:opacity-95"
                  isDisabled={!deleteEmailOk || busy}
                  onPress={() => void runDeactivate()}
                >
                  {busy ? "Procesando…" : "Confirmar eliminación"}
                </Button>
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}

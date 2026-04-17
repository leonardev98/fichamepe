"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ClipboardList, LogIn } from "lucide-react";
import { Button } from "@heroui/react/button";
import { Input } from "@heroui/react/input";
import { TextArea } from "@heroui/react/textarea";
import { parseApiErrorMessage } from "@/lib/api/auth.api";
import {
  fetchMyClientRequests,
  resubmitClientRequest,
  updateClientRequest,
} from "@/lib/api/client-requests.api";
import { useAuthStore } from "@/store/auth.store";
import type { MyClientRequestRow } from "@/types/client-request.types";

type SolicitudTab = "EN_REVISION" | "REQUIERE_CAMBIOS" | "OPEN";

const TABS: Array<{ key: SolicitudTab; label: string }> = [
  { key: "EN_REVISION", label: "En revisión" },
  { key: "REQUIERE_CAMBIOS", label: "Correcciones pendientes" },
  { key: "OPEN", label: "Abiertas" },
];

export function CuentaSolicitudesClient() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [tab, setTab] = useState<SolicitudTab>("EN_REVISION");
  const [rows, setRows] = useState<MyClientRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [budget, setBudget] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setLoadError(false);
    try {
      const list = await fetchMyClientRequests(tab);
      setRows(list);
    } catch {
      setRows([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, tab]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const editing = useMemo(() => rows.find((r) => r.id === editId) ?? null, [rows, editId]);

  const openEdit = (row: MyClientRequestRow) => {
    setEditId(row.id);
    setTitle(row.title);
    setDetail(row.detail ?? "");
    setBudget(row.budget);
    setFormMsg(null);
  };

  const saveAndResubmit = async () => {
    if (!editId) return;
    const t = title.trim();
    const b = budget.trim();
    if (!t || !b) {
      setFormMsg("Completa título y presupuesto.");
      return;
    }
    setFormBusy(true);
    setFormMsg(null);
    try {
      await updateClientRequest(editId, {
        title: t,
        detail: detail.trim() || undefined,
        budget: b,
      });
      await resubmitClientRequest(editId);
      setFormMsg("Cambios guardados y enviados a revisión.");
      setEditId(null);
      await reload();
    } catch (e: unknown) {
      setFormMsg(parseApiErrorMessage(e, "No pudimos reenviar la solicitud."));
    } finally {
      setFormBusy(false);
    }
  };

  return (
    <div className="w-full">
      <header className="mb-6 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Marketplace</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Mis solicitudes
        </h2>
        <p className="mt-2 text-sm text-muted sm:text-[15px]">
          Las solicitudes nuevas pasan por revisión antes de publicarse. Aquí ves el estado y puedes
          corregir si el equipo te devolvió observaciones.
        </p>
      </header>

      {!isAuthenticated ? (
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/[0.08] via-white to-primary-light/[0.06] px-6 py-14 text-center shadow-sm sm:px-12">
          <div className="relative mx-auto flex max-w-lg flex-col items-center gap-5">
            <div className="flex size-20 items-center justify-center rounded-full border border-primary/25 bg-white shadow-md shadow-primary/10">
              <LogIn className="size-9 text-primary" strokeWidth={1.75} aria-hidden />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Inicia sesión para ver tus solicitudes
            </h3>
            <Link
              href="/auth/login?from=/cuenta/solicitudes"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white no-underline shadow-md shadow-primary/25 transition hover:opacity-95"
            >
              Iniciar sesión
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-border bg-surface-elevated px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">No pudimos cargar tus solicitudes</p>
          <Button
            variant="primary"
            className="mt-6 rounded-full bg-primary px-6 font-semibold text-white"
            onPress={() => void reload()}
          >
            Reintentar
          </Button>
        </div>
      ) : (
        <>
          <div
            className="mb-6 inline-flex flex-wrap gap-1 rounded-full border border-border bg-white p-1"
            role="tablist"
            aria-label="Estado de solicitudes"
          >
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  tab === key
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:bg-primary/5 hover:text-foreground"
                }`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-surface-elevated" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white px-6 py-12 text-center">
              <ClipboardList className="mx-auto size-10 text-primary/60" aria-hidden />
              <p className="mt-3 text-sm font-medium text-foreground">No hay solicitudes en esta pestaña</p>
              <p className="mt-1 text-sm text-muted">
                {tab === "OPEN"
                  ? "Cuando una solicitud sea aprobada, aparecerá aquí con enlace a la ficha pública."
                  : tab === "EN_REVISION"
                    ? "Al enviar una nueva solicitud desde /solicitar, quedará en revisión."
                    : "Si el equipo te pide cambios, las solicitudes aparecerán aquí."}
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="rounded-2xl border border-border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground">{row.title}</p>
                      <p className="mt-1 text-sm text-muted">{row.budget}</p>
                      {row.moderationComment && tab === "REQUIERE_CAMBIOS" ? (
                        <div className="mt-3 rounded-xl border border-accent/25 bg-accent/5 px-3 py-2 text-sm text-foreground">
                          <span className="font-semibold text-accent">Observaciones: </span>
                          {row.moderationComment}
                        </div>
                      ) : null}
                    </div>
                    {tab === "OPEN" ? (
                      <Link
                        href={`/solicitar/${row.id}`}
                        className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white no-underline transition hover:opacity-95"
                      >
                        Ver ficha pública
                      </Link>
                    ) : tab === "REQUIERE_CAMBIOS" ? (
                      <Button
                        variant="outline"
                        className="shrink-0 rounded-full border-primary/35 font-semibold text-primary"
                        onPress={() => openEdit(row)}
                      >
                        Editar y reenviar
                      </Button>
                    ) : (
                      <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        En cola de revisión
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {editId && editing ? (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
              <div
                className="w-full max-w-lg rounded-2xl border border-border bg-white p-5 shadow-xl"
                role="dialog"
                aria-labelledby="edit-solicitud-title"
              >
                <h3 id="edit-solicitud-title" className="text-lg font-bold text-foreground">
                  Corregir solicitud
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Ajusta el contenido según las observaciones y reenvía a revisión.
                </p>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted">Título</p>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted">Detalle</p>
                    <TextArea
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                      rows={5}
                      className="w-full min-h-[100px]"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-muted">Presupuesto</p>
                    <Input value={budget} onChange={(e) => setBudget(e.target.value)} />
                  </div>
                </div>
                {formMsg ? <p className="mt-3 text-sm text-primary">{formMsg}</p> : null}
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    className="rounded-full border-border"
                    onPress={() => {
                      setEditId(null);
                      setFormMsg(null);
                    }}
                    isDisabled={formBusy}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="rounded-full bg-primary font-semibold text-white"
                    onPress={() => void saveAndResubmit()}
                    isDisabled={formBusy}
                    isPending={formBusy}
                  >
                    Reenviar a revisión
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, MessageCircle, Share2 } from "lucide-react";
import { ReportContentModal } from "@/components/moderation/ReportContentModal";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { useAuthModals } from "@/components/auth/auth-modals-context";
import { useAuthStore } from "@/store/auth.store";
import { useConversationsStore } from "@/stores/conversationsStore";
import { parseApiErrorMessage } from "@/lib/api/auth.api";

type ServiceDetailActionsProps = {
  service: {
    id: string;
    title: string;
    userId: string;
    coverImageUrl?: string | null;
    price?: number | null;
    previousPrice?: number | null;
    category?: string;
    tags?: string[];
    deliveryTime?: string;
    profile?: {
      displayName: string;
      avatarUrl: string | null;
    };
  };
};

export function ServiceDetailActions({ service }: ServiceDetailActionsProps) {
  const router = useRouter();
  const { openLogin } = useAuthModals();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const openOrCreateConversationFromService = useConversationsStore(
    (state) => state.openOrCreateConversationFromService,
  );
  const [isCopied, setIsCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const participantName = service.profile?.displayName ?? "Freelancer";
  const isOwnService = user?.id === service.userId;

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return `/servicios/${service.id}`;
    return window.location.href;
  }, [service.id]);

  const handleContact = async () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (user?.emailVerified === false) {
      window.alert(
        "Verifica tu correo para poder escribir al freelancer. Puedes reenviar el correo desde la barra amarilla arriba de la página.",
      );
      return;
    }
    try {
      await openOrCreateConversationFromService({
        serviceId: service.id,
        serviceTitle: service.title,
        serviceCoverImageUrl: service.coverImageUrl ?? null,
        servicePrice: service.price ?? null,
        servicePreviousPrice: service.previousPrice ?? null,
        serviceCategory: service.tags?.[0] ?? service.category ?? null,
        serviceDeliveryTime: service.deliveryTime ?? null,
        participant: {
          id: service.userId,
          fullName: participantName,
          avatarUrl: service.profile?.avatarUrl ?? null,
        },
      });
      router.push("/conversaciones?vista=consultas");
    } catch (e: unknown) {
      window.alert(
        parseApiErrorMessage(e, "No pudimos abrir la conversación. Intenta de nuevo."),
      );
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: service.title,
          text: `Te recomiendo este servicio en fichame.pe: ${service.title}`,
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1800);
    } catch {
      // Evita romper la UI si el usuario cancela el share modal nativo.
    }
  };

  const openReportModal = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    setReportSuccess(null);
    setReportOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleContact}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
        >
          <MessageCircle className="size-4" aria-hidden />
          Contactar
        </button>
        <FavoriteButton serviceId={service.id} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
        >
          {isCopied ? <Check className="size-3.5" aria-hidden /> : <Share2 className="size-3.5" aria-hidden />}
          {isCopied ? "Copiado" : "Recomendar"}
        </button>
        {isOwnService ? (
          <span className="inline-flex items-center justify-center rounded-xl border border-border/60 bg-surface-elevated/50 px-3 py-2 text-xs text-muted">
            Tu publicación
          </span>
        ) : (
          <button
            type="button"
            onClick={openReportModal}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition hover:border-accent-red/40 hover:text-accent-red"
          >
            <AlertTriangle className="size-3.5" aria-hidden />
            Reportar
          </button>
        )}
      </div>

      <p className="mt-3 text-xs text-muted">
        Al contactar, se abrirá una conversación directa con {participantName}.
      </p>
      {reportSuccess ? (
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-success">
          <Check className="size-3.5" aria-hidden />
          {reportSuccess}
        </p>
      ) : null}

      <ReportContentModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="service"
        targetId={service.id}
        title="Reportar publicación"
        subtitle="Cuéntanos qué ocurrió para revisar este anuncio."
        onSubmitted={() =>
          setReportSuccess("Gracias. Tu reporte fue enviado al equipo de revisión.")
        }
      />
    </>
  );
}

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { NotificacionesClient } from "@/app/notificaciones/NotificacionesClient";

export default function NotificacionesPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="text-3xl font-extrabold text-foreground">Notificaciones</h1>
        <div className="mt-6">
          <NotificacionesClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}

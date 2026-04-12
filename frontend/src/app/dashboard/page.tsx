import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <p className="mt-2 text-muted">
        Panel del freelancer. Aquí irá tu resumen y proyectos.
      </p>
      <Link
        href="/explorar"
        className="mt-8 text-sm font-medium text-accent underline-offset-2 hover:underline"
      >
        Ir a explorar
      </Link>
    </div>
  );
}

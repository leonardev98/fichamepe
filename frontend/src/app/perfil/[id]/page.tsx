import { Navbar } from "@/components/layout/Navbar";

export default async function PerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-semibold text-foreground">Perfil</h1>
        <p className="mt-2 text-sm text-muted">
          Vista de perfil en construcción (id: {id}).
        </p>
      </main>
    </div>
  );
}

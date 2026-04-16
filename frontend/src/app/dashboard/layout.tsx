import type { ReactNode } from "react";
import { DashboardAuthGate } from "@/components/dashboard/DashboardAuthGate";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardAuthGate>
      <DashboardShell>{children}</DashboardShell>
    </DashboardAuthGate>
  );
}


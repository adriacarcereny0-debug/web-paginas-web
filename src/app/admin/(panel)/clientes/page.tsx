import { Suspense } from "react";
import { LeadsManager } from "@/components/admin/LeadsManager";
import { TableSkeleton } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default function ClientesPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <LeadsManager
        title="Clientes"
        description="Leads con el estado “Cliente”: proyectos ya cerrados."
        fixedStatus="cliente"
      />
    </Suspense>
  );
}

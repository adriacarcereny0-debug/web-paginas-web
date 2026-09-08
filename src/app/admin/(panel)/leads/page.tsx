import { Suspense } from "react";
import { LeadsManager } from "@/components/admin/LeadsManager";
import { TableSkeleton } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default function LeadsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <LeadsManager title="Leads" description="Todas las personas que han contactado o han creado un presupuesto." />
    </Suspense>
  );
}

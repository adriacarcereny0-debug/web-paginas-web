import { Suspense } from "react";
import { QuotesManager } from "@/components/admin/QuotesManager";
import { TableSkeleton } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default function PresupuestosPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <QuotesManager />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel de administración", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const site = getContent("site");

  return (
    <AdminShell user={{ name: session.name, email: session.email }} brandName={site.brandName} initials={site.brandInitials}>
      {children}
    </AdminShell>
  );
}

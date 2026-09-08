import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SettingsManager } from "@/components/admin/SettingsManager";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return <SettingsManager user={{ name: session.name, email: session.email }} />;
}

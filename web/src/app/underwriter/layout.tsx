import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PortalNav } from "@/components/portal-nav";
import { PortalShell } from "@/components/portal-shell";

export default async function UnderwriterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "UNDERWRITER") {
    redirect("/login");
  }

  return (
    <PortalShell
      portalLabel="Underwriter portal"
      organizationName={session.user.organizationName}
      userName={session.user.name}
      userEmail={session.user.email}
      nav={
        <PortalNav
          items={[
            { href: "/underwriter", label: "Overview", active: true },
            { href: "/underwriter", label: "Vendors (soon)" },
            { href: "/underwriter", label: "Policies (soon)" },
          ]}
        />
      }
    >
      {children}
    </PortalShell>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PortalNav } from "@/components/portal-nav";
import { PortalShell } from "@/components/portal-shell";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") {
    redirect("/login");
  }

  return (
    <PortalShell
      portalLabel="Vendor portal"
      organizationName={session.user.organizationName}
      userName={session.user.name}
      userEmail={session.user.email}
      nav={
        <PortalNav
          items={[
            { href: "/vendor", label: "Overview", active: true },
            { href: "/vendor", label: "AI products (soon)" },
            { href: "/vendor", label: "Qualification (soon)" },
          ]}
        />
      }
    >
      {children}
    </PortalShell>
  );
}

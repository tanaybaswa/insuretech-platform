import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  statusLabel,
  UNDERWRITER_VISIBLE,
} from "@/lib/qualification/types";

export default async function UnderwriterQualificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "UNDERWRITER") {
    redirect("/login");
  }

  const cases = await prisma.qualificationCase.findMany({
    where: { status: { in: UNDERWRITER_VISIBLE } },
    include: {
      productVersion: {
        include: {
          product: { include: { organization: true } },
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight">Qualifications</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Shared cases submitted by vendors. Open a case to review the same evidence
        pack the vendor maintains.
      </p>

      {cases.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--muted)]">
          No submitted qualifications yet.
        </p>
      ) : (
        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
              <th className="py-2 font-medium">Vendor</th>
              <th className="py-2 font-medium">Product</th>
              <th className="py-2 font-medium">Version</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-b border-[var(--border)]">
                <td className="py-3">
                  {c.productVersion.product.organization.name}
                </td>
                <td className="py-3 font-medium">
                  {c.productVersion.product.name}
                </td>
                <td className="py-3 font-mono text-[13px]">
                  {c.productVersion.version}
                </td>
                <td className="py-3">{statusLabel(c.status)}</td>
                <td className="py-3 text-right">
                  <Link
                    href={`/underwriter/qualifications/${c.id}`}
                    className="underline-offset-2 hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

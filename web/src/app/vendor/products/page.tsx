import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { statusLabel } from "@/lib/qualification/types";

export default async function VendorProductsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") {
    redirect("/login");
  }

  const products = await prisma.aiProduct.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      versions: {
        include: { qualificationCase: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight">AI products</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Each version has one shared qualification case with underwriters.
          </p>
        </div>
        <Link
          href="/vendor/products/new"
          className="inline-flex h-10 items-center rounded bg-[var(--accent)] px-4 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--muted)]">
          No products yet. Create one to start qualification.
        </p>
      ) : (
        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
              <th className="py-2 font-medium">Product</th>
              <th className="py-2 font-medium">Latest version</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const latest = product.versions[0];
              return (
                <tr key={product.id} className="border-b border-[var(--border)]">
                  <td className="py-3 font-medium">{product.name}</td>
                  <td className="py-3 font-mono text-[13px]">
                    {latest?.version ?? "—"}
                  </td>
                  <td className="py-3">
                    {latest?.qualificationCase
                      ? statusLabel(latest.qualificationCase.status)
                      : "—"}
                  </td>
                  <td className="py-3 text-right">
                    {latest ? (
                      <Link
                        href={`/vendor/products/${product.id}/versions/${latest.id}`}
                        className="underline-offset-2 hover:underline"
                      >
                        Open
                      </Link>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

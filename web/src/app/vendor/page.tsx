import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function VendorHomePage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight">Overview</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
        Register versioned AI products, complete the qualification questionnaire,
        and upload evidence. Underwriters review the same shared case record.
      </p>

      <section className="mt-10 border-t border-[var(--border)] pt-6">
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
          Organization
        </h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--muted)]">Name</dt>
            <dd className="mt-1 font-medium">{session?.user.organizationName}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Role</dt>
            <dd className="mt-1 font-medium">Vendor</dd>
          </div>
        </dl>
      </section>

      <div className="mt-8">
        <Link
          href="/vendor/products"
          className="inline-flex h-10 items-center rounded bg-[var(--accent)] px-4 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Go to AI products
        </Link>
      </div>
    </div>
  );
}

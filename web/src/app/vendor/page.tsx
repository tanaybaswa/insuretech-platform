import { auth } from "@/lib/auth";

export default async function VendorHomePage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight">Overview</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
        Register insurable AI products, submit qualification evidence, and
        connect monitoring in later phases. Phase 0 establishes your portal
        access.
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
          <div>
            <dt className="text-[var(--muted)]">Signed in as</dt>
            <dd className="mt-1 font-medium">{session?.user.email}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Phase</dt>
            <dd className="mt-1 font-mono text-[13px]">0 — Foundation</dd>
          </div>
        </dl>
      </section>

      <section className="mt-10 border-t border-[var(--border)] pt-6">
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
          Coming next
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-[var(--ink)]">
          <li>Phase 1 — Register versioned AI products and submit evidence</li>
          <li>Phase 2 — See policies bound to your products</li>
          <li>Phase 3 — Connect observation / monitoring hooks</li>
        </ul>
      </section>
    </div>
  );
}

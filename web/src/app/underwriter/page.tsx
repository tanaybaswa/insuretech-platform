import { auth } from "@/lib/auth";

export default async function UnderwriterHomePage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight">Overview</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
        Review pre-qualified AI vendors, bind monitorable policy terms, and
        observe insured usage through VizCo — without integrating each vendor
        yourself. Phase 0 establishes your portal access.
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
            <dd className="mt-1 font-medium">Underwriter</dd>
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
          <li>Phase 1 — Vendor directory and qualification status</li>
          <li>Phase 2 — Policy terms model for monitorable coverage</li>
          <li>Phase 3 — Aggregated observation and out-of-policy events</li>
        </ul>
      </section>
    </div>
  );
}

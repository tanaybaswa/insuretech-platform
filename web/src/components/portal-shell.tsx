import { logoutAction } from "@/app/login/actions";

type PortalShellProps = {
  portalLabel: string;
  organizationName: string;
  userName: string;
  userEmail: string;
  children: React.ReactNode;
  nav: React.ReactNode;
};

export function PortalShell({
  portalLabel,
  organizationName,
  userName,
  userEmail,
  children,
  nav,
}: PortalShellProps) {
  return (
    <div className="min-h-screen">
      <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6">
        <div className="flex items-center gap-6">
          <span className="text-[17px] font-semibold tracking-tight">VizCo</span>
          <span className="text-sm text-[var(--muted)]">{portalLabel}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <div className="font-medium text-[var(--ink)]">{organizationName}</div>
            <div className="text-[var(--muted)]">
              {userName} · {userEmail}
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--ink)] hover:bg-[var(--bg)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-[1120px] gap-10 px-6 py-8">
        <aside className="w-[220px] shrink-0">{nav}</aside>
        <main className="min-w-0 flex-1 animate-[fade_120ms_ease-out]">
          {children}
        </main>
      </div>
    </div>
  );
}

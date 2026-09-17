import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-[400px] rounded border border-[var(--border)] bg-[var(--surface)] p-8">
        <BrandMark href="/login" />
        <h1 className="mt-6 text-[28px] font-semibold tracking-tight text-[var(--ink)]">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Vendor and underwriter portals share one login. Access follows your
          organization role.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
        <div className="mt-8 border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
          <p className="font-medium text-[var(--ink)]">Phase 0 demo accounts</p>
          <p className="mt-2 font-mono">
            vendor@acme.ai / password123
          </p>
          <p className="mt-1 font-mono">
            underwriter@harborins.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}

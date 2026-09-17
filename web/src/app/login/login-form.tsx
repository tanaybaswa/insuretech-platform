"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-[var(--ink)]">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="h-10 rounded border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--accent)] focus:outline focus:outline-2 focus:outline-[var(--accent)]"
          placeholder="you@company.com"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-[var(--ink)]">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="h-10 rounded border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:border-[var(--accent)] focus:outline focus:outline-2 focus:outline-[var(--accent)]"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 h-10 rounded bg-[var(--accent)] px-4 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

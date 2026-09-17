import { createProductAction } from "@/lib/qualification/actions";

export default function NewProductPage() {
  return (
    <div className="max-w-[480px]">
      <h1 className="text-[28px] font-semibold tracking-tight">New AI product</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Creates the product, first version, and a draft qualification case.
      </p>

      <form action={createProductAction} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Product name</span>
          <input
            name="name"
            required
            placeholder="ACME MRI Diagnostic"
            className="h-10 rounded border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:outline focus:outline-2 focus:outline-[var(--accent)]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Category</span>
          <input
            name="category"
            placeholder="Medical imaging"
            className="h-10 rounded border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:outline focus:outline-2 focus:outline-[var(--accent)]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Description</span>
          <textarea
            name="description"
            rows={3}
            className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:outline focus:outline-2 focus:outline-[var(--accent)]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Version</span>
          <input
            name="version"
            defaultValue="v2"
            required
            className="h-10 rounded border border-[var(--border)] bg-[var(--surface)] px-3 font-mono outline-none focus:outline focus:outline-2 focus:outline-[var(--accent)]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Release notes</span>
          <textarea
            name="releaseNotes"
            rows={2}
            className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:outline focus:outline-2 focus:outline-[var(--accent)]"
          />
        </label>
        <button
          type="submit"
          className="mt-2 h-10 rounded bg-[var(--accent)] px-4 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Create and continue
        </button>
      </form>
    </div>
  );
}

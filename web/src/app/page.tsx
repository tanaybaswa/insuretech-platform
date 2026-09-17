export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
        Insuretech Platform
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900">
        Next.js shell is running
      </h1>
      <p className="mt-3 max-w-md text-center text-lg text-zinc-600">
        Environment sanity check. If you can see this page, the Cloud Agent
        preview and Next.js app are wired up.
      </p>
    </main>
  );
}

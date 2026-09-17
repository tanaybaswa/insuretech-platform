import Link from "next/link";

export function PortalNav({
  items,
}: {
  items: { href: string; label: string; active?: boolean }[];
}) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`relative rounded px-3 py-2 text-sm ${
            item.active
              ? "bg-[var(--surface)] font-medium text-[var(--ink)] shadow-[inset_2px_0_0_0_var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

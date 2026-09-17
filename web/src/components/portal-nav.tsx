"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PortalNav({
  items,
}: {
  items: { href: string; label: string; match?: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const match = item.match ?? item.href;
        const active =
          match === "/vendor" || match === "/underwriter"
            ? pathname === match
            : pathname === match || pathname.startsWith(`${match}/`);

        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            className={`relative rounded px-3 py-2 text-sm ${
              active
                ? "bg-[var(--surface)] font-medium text-[var(--ink)] shadow-[inset_2px_0_0_0_var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

import Link from "next/link";

export function BrandMark({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="text-[17px] font-semibold tracking-tight text-[var(--ink)]"
    >
      VizCo
    </Link>
  );
}

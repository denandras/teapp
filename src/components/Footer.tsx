"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";


export default function Footer() {
  const pathname = usePathname();

  // Hide the footer on full-screen flows only. Brewing is reached from the nav bar.
  if (pathname === "/onboarding") return null;

  return (
    <footer
      className="relative pt-6 pb-32 sm:pb-6 mt-14"
      style={{
        backgroundColor: "var(--card)",
      }}
    >
      <span aria-hidden className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: "var(--border)" }} />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* desktop: two halves that leave room for the notch */}
        <div className="hidden sm:flex items-center justify-between gap-44">
          <Link href="/" className="flex items-center gap-2">
            <Leaf size={16} style={{ color: "var(--accent)" }} />
            <span className="font-serif font-bold" style={{ color: "var(--accent)" }}>
              Teapp
            </span>
            <span className="text-xs" style={{ color: "var(--muted)" }}>
              &copy; {new Date().getFullYear()} Andr&aacute;s D&eacute;nes
            </span>
          </Link>

          <LegalLinks />
        </div>

        {/* mobile: one legal line under the leaf */}
        <div className="sm:hidden flex flex-col items-center pt-11">
          <LegalLinks />
        </div>
      </div>
    </footer>
  );
}

function LegalLinks() {
  const cls = "transition-colors hover:text-accent";
  const style = { color: "var(--muted)" } as const;
  return (
    <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm">
      <Link href="/terms" className={cls} style={style}>
        Terms
      </Link>
      <Link href="/privacy" className={cls} style={style}>
        Privacy
      </Link>
      <Link href="/cookies" className={cls} style={style}>
        Cookies
      </Link>
      <a href="mailto:contact@andrasdenes.com" className={cls} style={style}>
        Contact
      </a>
    </nav>
  );
}

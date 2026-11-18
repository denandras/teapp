"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";
import BrewLauncher from "@/components/experience/BrewLauncher";

export default function Footer() {
  const pathname = usePathname();

  // Hide the footer where it would duplicate the page's own content: onboarding is
  // a full-screen flow, and /experience is itself the brew experience (its footer
  // button would just link back to the page you are on).
  if (pathname === "/onboarding" || pathname === "/experience") return null;

  return (
    <footer
      className="relative pt-6 pb-32 sm:pb-6 mt-14"
      style={{
        backgroundColor: "var(--card)",
      }}
    >
      {/* The top rule is two segments so the notch can interrupt it. */}
      <span
        aria-hidden
        className="absolute top-0 h-px"
        style={{ left: 0, right: "calc(50% + 78px)", backgroundColor: "var(--border)" }}
      />
      <span
        aria-hidden
        className="absolute top-0 h-px"
        style={{ left: "calc(50% + 78px)", right: 0, backgroundColor: "var(--border)" }}
      />

      <BrewLauncher />

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

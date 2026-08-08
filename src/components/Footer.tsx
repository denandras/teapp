"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="border-t py-6 mt-6 pb-24 sm:pb-6"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Leaf size={16} className="text-accent" />
          <span className="font-serif font-bold" style={{ color: "var(--accent)" }}>
            Teapp
          </span>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            &copy; {new Date().getFullYear()} Andr&aacute;s D&eacute;nes
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm">
          <Link href="/terms" className="transition-colors hover:text-accent" style={{ color: "var(--muted)" }}>
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-accent" style={{ color: "var(--muted)" }}>
            Privacy
          </Link>
          <Link href="/cookies" className="transition-colors hover:text-accent" style={{ color: "var(--muted)" }}>
            Cookies
          </Link>
          <a
            href="mailto:contact@andrasdenes.com"
            className="transition-colors hover:text-accent"
            style={{ color: "var(--muted)" }}
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
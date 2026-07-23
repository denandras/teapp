"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, LayoutGrid, Database, Settings, Plus, BookOpen } from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/database", label: "Database", icon: Database },
    { href: "/wiki", label: "Wiki", icon: BookOpen },
    { href: "/add", label: "Add Tea", icon: Plus },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop: top bar */}
      <nav className="hidden sm:sticky sm:top-0 sm:z-50 sm:h-16 sm:flex sm:items-center sm:px-6 sm:gap-2 sm:border-b"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Coffee size={24} className="text-accent" />
          <span className="font-serif text-xl font-bold text-accent">Teapp</span>
        </Link>
        <div className="flex items-center gap-1 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
                style={active ? { backgroundColor: "var(--accent)", color: "#fff" } : { color: "var(--muted)" }}>
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile: bottom nav bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-around border-t px-2"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}
              className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-0 flex-1"
              style={active ? { color: "var(--accent)" } : { color: "var(--muted)" }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
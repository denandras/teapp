"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, LayoutGrid, Database, Settings, Plus, BookOpen, Shield, Coffee } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
};

export default function NavBar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const isAdminUser = !!profile?.is_admin;

  // Hide nav entirely on onboarding page (full-screen experience)
  if (pathname === "/onboarding") return null;

  const before: NavItem[] = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/database", label: "Database", icon: Database },
  ];
  // Brew is the one action a brewing app is opened for, so it sits in the middle of
  // the navigation rather than behind a footer ornament.
  const brew: NavItem = { href: "/experience", label: "Brew", icon: Coffee };
  const after: NavItem[] = [
    { href: "/wiki", label: "Wiki", icon: BookOpen },
    { href: "/add", label: "Add Tea", icon: Plus },
    ...(isAdminUser ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  const links: NavItem[] = [...before, brew, ...after];

  return (
    <>
      {/* Desktop: top bar, with Brew held in the centre */}
      <nav className="hidden sm:sticky sm:top-0 sm:z-50 sm:h-16 sm:flex sm:items-center sm:px-6 sm:gap-2 sm:border-b"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Leaf size={24} className="text-accent" />
          <span className="font-serif text-xl font-bold text-accent">Teapp</span>
        </Link>
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-1 justify-end">
            {before.map((link) => (
              <NavLink key={link.href} link={link} active={pathname === link.href} />
            ))}
          </div>
          <Link
            href={brew.href}
            title={brew.label}
            aria-label={brew.label}
            aria-current={pathname === brew.href ? "page" : undefined}
            className="flex items-center gap-2 px-4 py-2 mx-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            <Coffee size={16} className="shrink-0" />
            <span>Brew</span>
          </Link>
          <div className="flex items-center gap-1 flex-1 justify-start">
            {after.map((link) => (
              <NavLink key={link.href} link={link} active={pathname === link.href} />
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile: bottom nav bar — structure matches andrasdenes.com, Brew in the middle */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t pb-[env(safe-area-inset-bottom,0px)]"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.3)",
        }}>
        <div
          className="grid h-14 w-full items-center"
          style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}
        >
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            const isBrew = link.href === brew.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                aria-current={active ? "page" : undefined}
                className="flex h-full items-center justify-center transition-colors"
                style={isBrew ? {} : active ? { color: "var(--accent)" } : { color: "var(--muted)" }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  {isBrew ? (
                    <span
                      className="flex items-center justify-center rounded-full -mt-5"
                      style={{ width: 44, height: 44, backgroundColor: "var(--accent)", color: "#fff" }}
                    >
                      <Icon size={22} strokeWidth={2} />
                    </span>
                  ) : (
                    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  )}
                  <span
                    className="text-[10px] font-medium truncate"
                    style={isBrew ? { color: "var(--accent)" } : undefined}
                  >
                    {link.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function NavLink({ link, active }: { link: NavItem; active: boolean }) {
  const Icon = link.icon;
  return (
    <Link
      href={link.href}
      title={link.label}
      aria-label={link.label}
      aria-current={active ? "page" : undefined}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
      style={active ? { backgroundColor: "var(--accent)", color: "#fff" } : { color: "var(--muted)" }}
    >
      <Icon size={16} className="shrink-0" />
      <span className="hidden lg:inline">{link.label}</span>
    </Link>
  );
}

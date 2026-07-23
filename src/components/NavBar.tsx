"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, LayoutGrid, Database, Settings, Plus, BookOpen, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function NavBar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/database", label: "Database", icon: Database },
    { href: "/wiki", label: "Wiki", icon: BookOpen },
    { href: "/add", label: "Add Tea", icon: Plus },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav
      className="sticky top-0 z-50 h-16 flex items-center px-4 sm:px-6 lg:px-8 gap-2 border-b"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      <Link href="/" className="flex items-center gap-2 mr-6">
        <Coffee size={24} className="text-accent" />
        <span className="font-serif text-xl font-bold text-accent">Teapp</span>
      </Link>
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                active ? "bg-accent text-white" : "hover:bg-accent/10 text-muted hover:text-accent"
              }`}
              style={active ? { backgroundColor: "var(--accent)", color: "#fff" } : {}}
            >
              <Icon size={16} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
      {user && (
        <div className="flex items-center gap-3 ml-auto pl-4">
          <span className="text-xs text-muted hidden sm:inline truncate max-w-[160px]">
            {user.email}
          </span>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-red-500/10 text-muted hover:text-red-400"
            title="Sign out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      )}
    </nav>
  );
}
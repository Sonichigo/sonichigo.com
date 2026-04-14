"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/posts", label: "POSTS" },
  { href: "/talks", label: "TALKS" },
  { href: "/travels", label: "TRAVELS" },
  { href: "/about", label: "ABOUT" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 backdrop-blur-md border-b" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg) 85%, transparent)", zIndex: 1000 }}>
      <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={() => setMenuOpen(false)}
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--accent)", color: "#000" }}
          >
            AP
          </span>
          <span className="text-sm font-medium hidden sm:inline" style={{ color: "var(--text-primary)" }}>
            Animesh Pathak
          </span>
          <span className="text-sm font-medium sm:hidden" style={{ color: "var(--text-primary)" }}>
            @sonichigo
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname.startsWith(item.href) ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-sm font-mono"
            style={{ color: "var(--accent)" }}
            aria-label="Toggle menu"
          >
            {menuOpen ? "[×]" : "[≡]"}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-6 py-4 space-y-3"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link block text-base ${pathname.startsWith(item.href) ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

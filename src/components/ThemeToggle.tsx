"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
      style={{
        background: isDark ? "var(--accent-orange-dim)" : "var(--accent-dim)",
        border: isDark ? "1px solid var(--accent-orange)" : "1px solid var(--accent)",
      }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="text-lg font-mono transition-transform duration-300" style={{ color: isDark ? "var(--accent-orange)" : "var(--accent)" }}>
        {isDark ? "☀" : "☾"}
      </span>
    </button>
  );
}

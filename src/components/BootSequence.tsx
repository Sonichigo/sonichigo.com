"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const LINES = [
  { text: "BIOS v2.4.1", status: "OK" },
  { text: "Loading kernel modules", status: "OK" },
  { text: "Initializing network stack", status: "OK" },
  { text: "Mounting /dev/sda1 → /", status: "OK" },
  { text: "Starting system services", status: "OK" },
  { text: "Loading profile: sonichigo", status: "OK" },
  { text: ":: SYSTEM.INIT() ::", status: null },
  { text: "Welcome, Animesh Pathak", status: null },
];

const LINE_DELAY = 260;   // ms between each line appearing
const HOLD       = 500;   // ms to hold after the last line lands
const TOTAL_MS   = LINE_DELAY * (LINES.length - 1) + HOLD;
const FADE       = 500;   // ms fade-out duration

// module-level flag survives Strict Mode's mount→unmount→remount cycle
let bootRan = false;

const SEEN_KEY = "boot-seen";

// sessionStorage throws when storage is blocked (Safari private browsing,
// some embedded webviews). A visitor we can't remember should still get a
// working site — they just see the boot again.
function hasBooted() {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberBoot() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // no-op
  }
}

export function BootSequence() {
  const pathname = usePathname();
  const [active,  setActive]  = useState(false);
  const [fading,  setFading]  = useState(false);
  const [done,    setDone]    = useState(false);

  useEffect(() => {
    if (bootRan) return;
    bootRan = true;
    // only the landing page boots; deep links (/posts, /posts/*, /talks, …)
    // must render immediately
    if (pathname !== "/") return;
    // once per tab session — a reload or a second visit within the session is
    // someone who has already seen it
    if (hasBooted()) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Recorded before the animation starts rather than after it finishes, so
    // reloading part-way through doesn't replay it.
    rememberBoot();
    setActive(true);
    // no cleanup — these timers must always fire
    setTimeout(() => setFading(true), TOTAL_MS);
    setTimeout(() => setDone(true), TOTAL_MS + FADE);
  }, []);

  // Let any interaction dismiss it, so the overlay is never a wait the
  // visitor can't get out of.
  useEffect(() => {
    if (!active || done) return;
    const skip = () => setDone(true);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [active, done]);

  // This component lives in the root layout, so it survives client-side
  // navigation. Gating on pathname here (not just in the effect above) tears
  // the overlay down in the same render as the route change — otherwise a
  // click during the fade window carries a black screen onto /posts.
  if (!active || done || pathname !== "/") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fading ? 0 : 1,
        transition: fading ? `opacity ${FADE}ms ease` : "none",
        pointerEvents: fading ? "none" : "auto",
      }}
      aria-hidden="true"
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          width: "100%",
          maxWidth: "560px",
          padding: "2rem",
          fontSize: "0.8rem",
          lineHeight: "2",
        }}
      >
        {LINES.map((line, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              opacity: 0,
              animation: `boot-line 0.15s ease-out ${i * LINE_DELAY}ms forwards`,
            }}
          >
            <span
              style={{
                color: i > 0 ? "#10b981" : "#a3a3a3",
                fontWeight: i > 0 ? 600 : 400,
              }}
            >
              {line.text}
            </span>
            {line.status && (
              <span style={{ color: "#10b981" }}>[ {line.status} ]</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

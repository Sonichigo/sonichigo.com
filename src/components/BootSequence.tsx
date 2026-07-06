"use client";

import { useState, useEffect } from "react";

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

const LINE_DELAY = 600;   // ms between each line appearing
const TOTAL_MS   = 5000; // hard 30s minimum before fade starts
const FADE       = 800;   // ms fade-out duration

// module-level flag survives Strict Mode's mount→unmount→remount cycle
let bootRan = false;

export function BootSequence() {
  const [active,  setActive]  = useState(false);
  const [fading,  setFading]  = useState(false);
  const [done,    setDone]    = useState(false);

  useEffect(() => {
    if (bootRan) return;
    bootRan = true;
    setActive(true);
    // no cleanup — these timers must always fire
    setTimeout(() => setFading(true), TOTAL_MS);
    setTimeout(() => setDone(true), TOTAL_MS + FADE);
  }, []);

  if (!active || done) return null;

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
        pointerEvents: fading ? "none" : "all",
      }}
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

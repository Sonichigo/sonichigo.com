"use client";

import { useState, useEffect, useRef } from "react";

const LINES = [
  { text: "Loading profile: sonichigo", status: "OK" },
  { text: ":: SYSTEM.INIT() ::", status: null },
  { text: "Welcome, Animesh Pathak", status: null },
];

const LINE_DELAY = 160;  // ms between each line appearing
const HOLD       = 450;  // ms to hold after last line before fading
const FADE       = 450;  // ms fade-out duration

export function BootSequence() {
  const [active, setActive] = useState(false);
  const [done,   setDone]   = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    // ran.current persists across Strict Mode remounts; prevents double-execution
    if (ran.current) return;
    ran.current = true;
    if (sessionStorage.getItem("boot-done")) return;
    sessionStorage.setItem("boot-done", "1");
    setActive(true);
  }, []);

  if (!active || done) return null;

  const fadeDelay = LINES.length * LINE_DELAY + HOLD;

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
        animation: `boot-fade-out ${FADE}ms ease ${fadeDelay}ms forwards`,
      }}
      onAnimationEnd={() => setDone(true)}
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

"use client";

import { useState, useEffect } from "react";
import type { Talk } from "@/lib/types";

export default function TalksPage() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/talks")
      .then((r) => r.json())
      .then((data) => {
        setTalks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Compute region stats
  const regions = talks.reduce<Record<string, number>>((acc, t) => {
    if (t.location) {
      acc[t.location] = (acc[t.location] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedRegions = Object.entries(regions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const uniqueCities = new Set(talks.map((t) => t.location).filter(Boolean)).size;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="page-title">Sessions & Talks</h1>
      <p className="page-subtitle">
        Technical presentations on cloud native technologies, eBPF, DevOps, and
        developer experience.
      </p>

      {/* Stats */}
      {!loading && talks.length > 0 && (
        <div className="mb-10">
          <div className="flex gap-6 mb-6 text-xs font-mono" style={{ color: "var(--text-tertiary)" }}>
            <span>
              <span style={{ color: "var(--accent-green)" }}>{talks.length}</span> talks
            </span>
            <span>
              <span style={{ color: "var(--accent-orange)" }}>{uniqueCities}</span> cities
            </span>
          </div>

          {/* Region bars */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "var(--text-tertiary)" }}>
              Regions
            </h3>
            {sortedRegions.map(([region, count]) => {
              const pct = (count / talks.length) * 100;
              return (
                <div key={region} className="flex items-center gap-3 text-xs">
                  <span className="w-40 truncate" style={{ color: "var(--text-secondary)" }}>
                    {region}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%`, background: "var(--accent)" }}
                    />
                  </div>
                  <span className="w-10 text-right" style={{ color: "var(--text-tertiary)" }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="text-xs uppercase tracking-[0.2em] mb-6" style={{ color: "var(--text-tertiary)" }}>
        Talk list →
      </div>

      {/* Talks List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-md animate-pulse" style={{ background: "var(--bg-secondary)" }} />
          ))}
        </div>
      ) : (
        <div className="space-y-0">
          {talks.map((talk, i) => (
            <div
              key={talk.id || i}
              className="group border-t py-4"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                <span className="mono-date shrink-0 w-28">
                  {new Date(talk.date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {talk.title}
                  </h3>
                  <div className="flex items-center gap-0 mt-1 text-xs flex-wrap" style={{ color: "var(--text-secondary)" }}>
                    <span>{talk.event_name}</span>
                    {talk.location && (
                      <span className="dot-separator">{talk.location}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {talk.event_url && (
                      <a
                        href={talk.event_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline underline-offset-4"
                        style={{ color: "var(--accent)" }}
                      >
                        Event ↗
                      </a>
                    )}
                    {talk.video_url && (
                      <a
                        href={talk.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline underline-offset-4"
                        style={{ color: "var(--accent)" }}
                      >
                        Video ↗
                      </a>
                    )}
                  </div>
                </div>
                <span
                  className={`shrink-0 hidden sm:inline ${
                    talk.type === 'speaker' ? 'tag-pill' :
                    talk.type === 'workshop' ? 'tag-pill-green' :
                    talk.type === 'panelist' ? 'tag-pill-orange' :
                    'tag-pill'
                  }`}
                >
                  {talk.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && talks.length === 0 && (
        <p className="text-sm py-12 text-center" style={{ color: "var(--text-tertiary)" }}>
          Talks data will appear once the database is connected.
        </p>
      )}
    </div>
  );
}

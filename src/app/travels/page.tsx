"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Travel } from "@/lib/types";

// Import WorldMap with SSR disabled (Leaflet requires window)
const WorldMap = dynamic(() => import("@/components/WorldMap").then((mod) => mod.WorldMap), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-lg"
      style={{
        height: "500px",
        backgroundColor: "#404040",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-tertiary)",
        fontSize: "14px",
      }}
    >
      Loading map...
    </div>
  ),
});

export default function TravelsPage() {
  const [travels, setTravels] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/travels")
      .then((r) => r.json())
      .then((data) => {
        setTravels(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const countries = travels.reduce<Record<string, Travel[]>>((acc, t) => {
    acc[t.country] = acc[t.country] || [];
    acc[t.country].push(t);
    return acc;
  }, {});

  const uniqueCountries = Object.keys(countries).length;
  const uniqueCities = new Set(travels.map((t) => t.city)).size;

  return (
    <div className="section-container">
      <h1 className="page-title">Places</h1>
      <p className="page-subtitle">
        Cities and countries I have travelled to — for conferences, meetups, and
        exploration.
      </p>

      {!loading && travels.length > 0 && (
        <>
          {/* Stats */}
          <div className="flex gap-6 mb-8 text-xs font-mono" style={{ color: "var(--text-tertiary)" }}>
            <span>
              <span style={{ color: "var(--accent)" }}>{uniqueCountries}</span>{" "}
              countries
            </span>
            <span>
              <span style={{ color: "var(--accent)" }}>{uniqueCities}</span>{" "}
              cities
            </span>
            <span>
              <span style={{ color: "var(--accent)" }}>{travels.length}</span>{" "}
              visits
            </span>
          </div>

          {/* World Map */}
          <div
            className="rounded-lg border overflow-hidden mb-12"
            style={{ borderColor: "var(--border)", background: "#404040" }}
          >
            <div className="p-2">
              <WorldMap
                locations={travels
                  .filter((t) => t.latitude && t.longitude)
                  .map((t) => ({
                    city: t.city,
                    country: t.country,
                    latitude: Number(t.latitude),
                    longitude: Number(t.longitude),
                    purpose: t.purpose || undefined,
                    notes: t.notes || undefined,
                  }))}
              />
            </div>
            <div
              className="px-4 py-2 text-xs font-mono border-t flex justify-between"
              style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}
            >
              <span>hover to explore</span>
              <span>{uniqueCities} pins</span>
            </div>
          </div>

          {/* Country groups */}
          <div className="space-y-8">
            {Object.entries(countries)
              .sort(([, a], [, b]) => b.length - a.length)
              .map(([country, cities]) => (
                <div key={country}>
                  <div className="flex items-center gap-3 mb-3">
                    <h3
                      className="text-xs uppercase tracking-[0.2em]"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {country}
                    </h3>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                    >
                      {cities.length}
                    </span>
                  </div>
                  <div className="space-y-0">
                    {cities.map((t, i) => (
                      <div
                        key={i}
                        className="border-t py-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {t.city}
                        </span>
                        <div className="flex items-center gap-2 flex-1">
                          {t.purpose && <span className="tag-pill">{t.purpose}</span>}
                        </div>
                        {t.notes && (
                          <span className="text-xs truncate max-w-[200px]" style={{ color: "var(--text-tertiary)" }}>
                            {t.notes}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {loading && (
        <div className="space-y-4">
          <div className="h-64 rounded-lg animate-pulse" style={{ background: "var(--bg-secondary)" }} />
          <div className="h-16 rounded-md animate-pulse" style={{ background: "var(--bg-secondary)" }} />
          <div className="h-16 rounded-md animate-pulse" style={{ background: "var(--bg-secondary)" }} />
        </div>
      )}

      {!loading && travels.length === 0 && (
        <p className="text-sm py-12 text-center" style={{ color: "var(--text-tertiary)" }}>
          Travel data will appear once the database is connected.
        </p>
      )}
    </div>
  );
}

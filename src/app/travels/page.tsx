"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Travel, Talk } from "@/lib/types";

// Import WorldMap with SSR disabled (Leaflet requires window)
const WorldMap = dynamic(() => import("@/components/WorldMap").then((mod) => mod.WorldMap), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-lg"
      style={{
        height: "500px",
        backgroundColor: "#1a1f2e",
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
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/travels").then((r) => r.json()),
      fetch("/api/talks").then((r) => r.json()),
    ])
      .then(([travelsData, talksData]) => {
        setTravels(travelsData);
        setTalks(talksData);
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

  // Group talks by location (city, country)
  const talksByLocation = useMemo(() => {
    const grouped: Record<string, Talk[]> = {};
    talks.forEach((talk) => {
      if (talk.location) {
        const locationKey = talk.location.toLowerCase().trim();
        if (!grouped[locationKey]) {
          grouped[locationKey] = [];
        }
        grouped[locationKey].push(talk);
      }
    });
    return grouped;
  }, [talks]);

  // Merge travels with talks for map display
  const mapLocations = useMemo(() => {
    return travels
      .filter((t) => t.latitude && t.longitude)
      .map((t) => {
        const locationKey = `${t.city}, ${t.country}`.toLowerCase().trim();
        const locationTalks = talksByLocation[locationKey] || [];

        return {
          city: t.city,
          country: t.country,
          latitude: Number(t.latitude),
          longitude: Number(t.longitude),
          purpose: t.purpose || undefined,
          notes: t.notes || undefined,
          talks: locationTalks.map((talk) => ({
            title: talk.title,
            event_name: talk.event_name,
            date: talk.date || undefined,
            image_url: talk.image_url || undefined,
            event_url: talk.event_url || undefined,
            video_url: talk.video_url || undefined,
          })),
        };
      });
  }, [travels, talksByLocation]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
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
              <span style={{ color: "var(--accent-green)" }}>{uniqueCountries}</span>{" "}
              countries
            </span>
            <span>
              <span style={{ color: "var(--accent-orange)" }}>{uniqueCities}</span>{" "}
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
            style={{ borderColor: "#ff6b35", background: "linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)", boxShadow: "0 0 30px rgba(255, 107, 53, 0.2)" }}
          >
            <div className="p-2">
              <WorldMap locations={mapLocations} />
            </div>
            <div
              className="px-4 py-2 text-xs font-mono border-t flex justify-between"
              style={{ borderColor: "#ff6b35", color: "#ff6b35" }}
            >
              <span>click pins to see talks & travels</span>
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
                          {t.purpose && (
                            <span className={t.purpose === 'conference' || t.purpose === 'meetup' ? 'tag-pill-orange' : 'tag-pill'}>
                              {t.purpose}
                            </span>
                          )}
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

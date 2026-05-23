"use client";

import { useState, useEffect } from "react";
import type { Talk } from "@/lib/types";

export default function TalksPage() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    fetch("/api/talks")
      .then((r) => r.json())
      .then((data) => {
        setTalks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Categorize talks
  const upcomingTalks = talks.filter(
    (talk) => talk.date && new Date(talk.date + "T00:00:00") >= today
  );
  const pastTalks = talks.filter(
    (talk) => talk.date && new Date(talk.date + "T00:00:00") < today
  );

  // Apply filter
  const filteredTalks =
    filter === "upcoming"
      ? upcomingTalks
      : filter === "past"
      ? pastTalks
      : talks;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="page-title">Sessions & Talks</h1>
      <p className="page-subtitle">
        Technical presentations on cloud native technologies, eBPF, DevOps, and
        developer experience.
      </p>

      {/* Stats & Filters */}
      {!loading && talks.length > 0 && (
        <div className="mb-8">
          <div className="flex gap-6 mb-6 text-xs font-mono" style={{ color: "var(--text-tertiary)" }}>
            <span>
              <span style={{ color: "var(--accent-green)" }}>{talks.length}</span> total talks
            </span>
            <span>
              <span style={{ color: "var(--accent-orange)" }}>{upcomingTalks.length}</span> upcoming
            </span>
            <span>
              <span style={{ color: "var(--accent)" }}>{pastTalks.length}</span> past
            </span>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "upcoming", "past"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-2 rounded-md font-mono uppercase tracking-wider transition-all border ${
                  filter === f ? "font-bold" : ""
                }`}
                style={{
                  borderColor: filter === f ? "var(--accent)" : "var(--border)",
                  background:
                    filter === f ? "var(--accent-dim)" : "var(--bg-secondary)",
                  color: filter === f ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Talks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-lg animate-pulse"
              style={{ background: "var(--bg-secondary)" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTalks.map((talk, i) => {
            const talkDate = talk.date ? new Date(talk.date + "T00:00:00") : null;
            const isUpcoming = talkDate && talkDate >= today;

            return (
              <div
                key={talk.id || i}
                className="card-base group p-5 flex flex-col gap-3 hover:shadow-lg transition-all"
              >
                {/* Header with date and status */}
                <div className="flex items-start justify-between gap-3">
                  <span className="mono-date text-xs">
                    {talkDate
                      ? talkDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "TBD"}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold shrink-0 ${
                      isUpcoming ? "badge-upcoming" : "badge-past"
                    }`}
                    style={{
                      background: isUpcoming
                        ? "var(--accent-green-dim)"
                        : "var(--bg-secondary)",
                      color: isUpcoming
                        ? "var(--accent-green)"
                        : "var(--text-tertiary)",
                    }}
                  >
                    {isUpcoming ? "Upcoming" : "Past"}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-base font-semibold leading-snug"
                  style={{ color: "var(--text-primary)" }}
                >
                  {talk.title}
                </h3>

                {/* Description */}
                {talk.description && (
                  <p
                    className="text-sm leading-relaxed line-clamp-3 flex-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {talk.description}
                  </p>
                )}

                {/* Event & Location */}
                <div
                  className="text-xs space-y-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Event:</span>
                    <span>{talk.event_name}</span>
                  </div>
                  {talk.location && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Location:</span>
                      <span>{talk.location}</span>
                    </div>
                  )}
                </div>

                {/* Type badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`${
                      talk.type === "speaker"
                        ? "tag-pill"
                        : talk.type === "workshop"
                        ? "tag-pill-green"
                        : talk.type === "panelist"
                        ? "tag-pill-orange"
                        : "tag-pill"
                    }`}
                  >
                    {talk.type}
                  </span>
                </div>

                {/* Links */}
                <div className="flex gap-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  {talk.event_url && (
                    <a
                      href={talk.event_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline underline-offset-4 font-medium"
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
                      className="text-xs hover:underline underline-offset-4 font-medium"
                      style={{ color: "var(--accent)" }}
                    >
                      Video ↗
                    </a>
                  )}
                  {talk.slides_url && (
                    <a
                      href={talk.slides_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline underline-offset-4 font-medium"
                      style={{ color: "var(--accent)" }}
                    >
                      Slides ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredTalks.length === 0 && (
        <p
          className="text-sm py-12 text-center"
          style={{ color: "var(--text-tertiary)" }}
        >
          {filter === "all"
            ? "Talks data will appear once the database is connected."
            : `No ${filter} talks found.`}
        </p>
      )}
    </div>
  );
}

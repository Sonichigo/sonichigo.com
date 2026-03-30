"use client";

import { useState, useEffect } from "react";
import type { Post } from "@/lib/types";

const POSTS_PER_PAGE = 20;

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sources = ["all", ...Array.from(new Set(posts.map((p) => p.source)))];

  const filtered = posts.filter((post) => {
    const matchesSearch =
      search === "" ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      (post.excerpt || "").toLowerCase().includes(search.toLowerCase());
    const matchesSource =
      sourceFilter === "all" || post.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sourceFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const startIdx = (currentPage - 1) * POSTS_PER_PAGE;
  const endIdx = startIdx + POSTS_PER_PAGE;
  const paginatedPosts = filtered.slice(startIdx, endIdx);

  return (
    <div className="section-container">
      <h1 className="page-title">Writing</h1>
      <p className="page-subtitle">
        Thoughts, tutorials, and deep-dives into DevOps, cloud-native, testing,
        and developer experience.
      </p>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-md text-sm border outline-none font-mono transition-colors"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        />
        <div className="flex gap-2 flex-wrap">
          {sources.map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`text-xs px-3 py-2 rounded-md font-mono uppercase tracking-wider transition-all border ${
                sourceFilter === src ? "font-bold" : ""
              }`}
              style={{
                borderColor:
                  sourceFilter === src ? "var(--accent)" : "var(--border)",
                background:
                  sourceFilter === src
                    ? "var(--accent-dim)"
                    : "var(--bg-secondary)",
                color:
                  sourceFilter === src
                    ? "var(--accent)"
                    : "var(--text-secondary)",
              }}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono" style={{ color: "var(--text-tertiary)" }}>
          {filtered.length} post{filtered.length !== 1 ? "s" : ""}
          {filtered.length > POSTS_PER_PAGE && (
            <span className="ml-2">
              (page {currentPage} of {totalPages})
            </span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-md animate-pulse"
              style={{ background: "var(--bg-secondary)" }}
            />
          ))}
        </div>
      ) : (
        <>
          <ul className="space-y-0">
            {paginatedPosts.map((post, i) => {
            const isExternal = !post.url.includes("sonichigo.hashnode.dev");
            const domain = isExternal
              ? (() => {
                  try { return new URL(post.url).hostname.replace("www.", ""); }
                  catch { return ""; }
                })()
              : null;

            return (
              <li
                key={post.url + i}
                className="group border-t py-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="mono-date shrink-0 w-28">
                  {post.published_at
                    ? new Date(post.published_at + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
                <div className="flex-1 min-w-0">
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm group-hover:underline underline-offset-4 transition-colors inline-flex items-baseline gap-1.5 flex-wrap"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span className="break-words">{post.title}</span>
                    {isExternal && domain && (
                      <span className="text-xs shrink-0" style={{ color: "var(--text-tertiary)" }}>
                        ↗ {domain}
                      </span>
                    )}
                  </a>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag-pill">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="source-badge shrink-0 hidden sm:inline">
                  {post.source}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all border disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            >
              ← Prev
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and adjacent pages
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1;

                if (!showPage) {
                  // Show ellipsis
                  if (page === 2 || page === totalPages - 1) {
                    return (
                      <span
                        key={page}
                        className="px-2 py-2 text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-md text-xs font-mono transition-all border ${
                      currentPage === page ? "font-bold" : ""
                    }`}
                    style={{
                      borderColor:
                        currentPage === page ? "var(--accent)" : "var(--border)",
                      background:
                        currentPage === page
                          ? "var(--accent-dim)"
                          : "var(--bg-secondary)",
                      color:
                        currentPage === page
                          ? "var(--accent)"
                          : "var(--text-secondary)",
                    }}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all border disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            >
              Next →
            </button>
          </div>
        )}
      </>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-sm py-12 text-center" style={{ color: "var(--text-tertiary)" }}>
          No posts found matching your criteria.
        </p>
      )}
    </div>
  );
}

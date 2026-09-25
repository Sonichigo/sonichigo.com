"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import type { Post } from "@/lib/types";

const POSTS_PER_PAGE = 20;
const MAX_VISIBLE_TAGS = 3;

function formatDate(published: string) {
  if (!published) return null;
  const date = new Date(published + "T00:00:00");
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function externalDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

export default function PostsClient({ posts: rawPosts }: { posts: Post[] }) {
  // Frontmatter tag lists are hand-maintained and contain repeats, which would
  // both render twice and collide as React keys.
  const posts = useMemo(
    () => rawPosts.map((p) => ({ ...p, tags: [...new Set(p.tags ?? [])] })),
    [rawPosts]
  );

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const listTopRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  // Suppresses the scroll-into-view on first paint and on filter changes,
  // which should stay put rather than yanking the viewport.
  const pageChangedByUser = useRef(false);
  const hydrated = useRef(false);

  const sources = useMemo(
    () => ["all", ...Array.from(new Set(posts.map((p) => p.source)))],
    [posts]
  );

  // Restore state from the URL after mount. Doing this in an effect rather
  // than in useState keeps the server-rendered markup and the hydration render
  // identical — search params are not available during static prerender.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const src = params.get("source");
    const tag = params.get("tag");
    const page = Number(params.get("page"));
    if (q) setSearch(q);
    if (src) setSourceFilter(src);
    if (tag) setTagFilter(tag);
    if (Number.isInteger(page) && page > 1) setCurrentPage(page);
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesSearch =
        needle === "" ||
        post.title.toLowerCase().includes(needle) ||
        (post.excerpt || "").toLowerCase().includes(needle) ||
        (post.tags || []).some((t) => t.toLowerCase().includes(needle));
      const matchesSource =
        sourceFilter === "all" || post.source === sourceFilter;
      const matchesTag = !tagFilter || (post.tags || []).includes(tagFilter);
      return matchesSearch && matchesSource && matchesTag;
    });
  }, [posts, search, sourceFilter, tagFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  // Guards against a stale ?page= from the URL pointing past the last page.
  const page = Math.min(currentPage, totalPages);
  const startIdx = (page - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filtered.slice(startIdx, startIdx + POSTS_PER_PAGE);

  // Mirror state back into the URL so a filtered view is shareable and the
  // browser Back button undoes a filter instead of leaving the page. Writes the
  // clamped `page`, not `currentPage`, so the URL never advertises a page that
  // the current filters don't have.
  useEffect(() => {
    if (!hydrated.current) return;
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (sourceFilter !== "all") params.set("source", sourceFilter);
    if (tagFilter) params.set("tag", tagFilter);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname
    );
  }, [search, sourceFilter, tagFilter, page]);

  // Declared after the sync effect so that on mount the sync bails once, letting
  // the restore effect's state land before the URL gets rewritten from defaults.
  useEffect(() => {
    hydrated.current = true;
  }, []);

  // Paging from the bottom of a long list otherwise drops you mid-list with no
  // sign anything happened.
  useEffect(() => {
    if (!pageChangedByUser.current) return;
    pageChangedByUser.current = false;
    listTopRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [page]);

  function goToPage(next: number) {
    if (next === page) return;
    pageChangedByUser.current = true;
    setCurrentPage(next);
  }

  // Changing a filter resets to page 1 here rather than in an effect on
  // [search, sourceFilter, tagFilter] — that effect also fired on mount and
  // wiped a restored ?page=.
  function applyFilter(fn: () => void) {
    fn();
    setCurrentPage(1);
  }

  const hasFilters = search !== "" || sourceFilter !== "all" || tagFilter !== null;

  function clearFilters() {
    applyFilter(() => {
      setSearch("");
      setSourceFilter("all");
      setTagFilter(null);
    });
    searchRef.current?.focus();
  }

  return (
    <>
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input
            ref={searchRef}
            type="search"
            aria-label="Search posts by title, excerpt, or tag"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => applyFilter(() => setSearch(e.target.value))}
            className="w-full pl-3 pr-9 py-2 rounded-md text-sm border font-mono transition-colors"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                applyFilter(() => setSearch(""));
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded text-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              ×
            </button>
          )}
        </div>
        <div
          className="flex gap-2 flex-wrap"
          role="group"
          aria-label="Filter by source"
        >
          {sources.map((src) => {
            const isActive = sourceFilter === src;
            return (
              <button
                key={src}
                onClick={() => applyFilter(() => setSourceFilter(src))}
                aria-pressed={isActive}
                className={`text-xs px-3 py-2 rounded-md font-mono uppercase tracking-wider transition-all border ${
                  isActive ? "font-bold" : ""
                }`}
                style={{
                  borderColor: isActive ? "var(--accent)" : "var(--border)",
                  background: isActive
                    ? "var(--accent-dim)"
                    : "var(--bg-secondary)",
                  color: isActive
                    ? "var(--accent-strong)"
                    : "var(--text-secondary)",
                }}
              >
                {src === "all" ? "All sources" : src}
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={listTopRef}
        className="flex items-center justify-between gap-3 mb-4 scroll-mt-20 flex-wrap"
      >
        <p
          className="text-xs font-mono"
          aria-live="polite"
          style={{ color: "var(--text-tertiary)" }}
        >
          <span style={{ color: "var(--accent-green-strong)" }}>
            {filtered.length}
          </span>{" "}
          post{filtered.length !== 1 ? "s" : ""}
          {totalPages > 1 && (
            <span className="ml-2">
              (page {page} of {totalPages})
            </span>
          )}
        </p>

        {/* Active tag filter is not visible in the source row, so surface it. */}
        <div className="flex items-center gap-2 flex-wrap">
          {tagFilter && (
            <button
              onClick={() => applyFilter(() => setTagFilter(null))}
              className="tag-pill-button"
              aria-label={`Remove tag filter: ${tagFilter}`}
            >
              {tagFilter} ×
            </button>
          )}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-mono underline underline-offset-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            No posts match those filters.
          </p>
          <button
            onClick={clearFilters}
            className="text-xs px-3 py-2 rounded-md font-mono uppercase tracking-wider border transition-all"
            style={{
              borderColor: "var(--accent)",
              background: "var(--accent-dim)",
              color: "var(--accent-strong)",
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <ul
            className="border-t"
            style={{ borderColor: "var(--border)" }}
          >
            {paginatedPosts.map((post) => {
              const isLocal = post.source === "sonichigo.com";
              const displayDate = formatDate(post.published_at);
              const extraTags = (post.tags?.length ?? 0) - MAX_VISIBLE_TAGS;

              const titleLink = (
                <>
                  <span className="break-words">{post.title}</span>
                  {!isLocal && (
                    <>
                      <span
                        className="text-xs shrink-0"
                        aria-hidden="true"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        ↗
                      </span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </>
                  )}
                </>
              );

              // The anchor is stretched over the whole row via ::after so the
              // entire 60px band is a hit target, not just the title text.
              const linkClass =
                "text-sm group-hover:underline underline-offset-4 transition-colors inline-flex items-baseline gap-1.5 flex-wrap " +
                "after:absolute after:inset-0 after:content-['']";
              const linkStyle = { color: "var(--text-primary)" };

              return (
                <li
                  key={post.url}
                  className="post-row group relative border-b py-3 px-2 -mx-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  {displayDate ? (
                    <time
                      dateTime={post.published_at}
                      className="mono-date shrink-0 w-28"
                    >
                      {displayDate}
                    </time>
                  ) : (
                    <span className="mono-date shrink-0 w-28">—</span>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      {isLocal ? (
                        <Link
                          href={post.url}
                          className={linkClass}
                          style={linkStyle}
                        >
                          {titleLink}
                        </Link>
                      ) : (
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkClass}
                          style={linkStyle}
                        >
                          {titleLink}
                        </a>
                      )}
                      {post.is_featured && (
                        <span className="badge-featured shrink-0">
                          Featured
                        </span>
                      )}
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-1.5 flex-wrap relative">
                        {post.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => applyFilter(() => setTagFilter(tag))}
                            className="tag-pill-button"
                            aria-label={`Filter by tag: ${tag}`}
                          >
                            {tag}
                          </button>
                        ))}
                        {extraTags > 0 && (
                          <span
                            className="text-xs px-1 py-0.5"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            +{extraTags}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <span className="source-badge shrink-0 hidden sm:inline">
                    {isLocal ? post.source : externalDomain(post.url)}
                  </span>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-2 mt-8"
              aria-label="Pagination"
            >
              <button
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all border disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              >
                ← Prev
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                  const showPage =
                    n === 1 || n === totalPages || Math.abs(n - page) <= 1;

                  if (!showPage) {
                    if (n === 2 || n === totalPages - 1) {
                      return (
                        <span
                          key={n}
                          aria-hidden="true"
                          className="px-2 py-2 text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  const isCurrent = n === page;
                  return (
                    <button
                      key={n}
                      onClick={() => goToPage(n)}
                      aria-label={`Page ${n}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`px-3 py-2 rounded-md text-xs font-mono transition-all border ${
                        isCurrent ? "font-bold" : ""
                      }`}
                      style={{
                        borderColor: isCurrent
                          ? "var(--accent)"
                          : "var(--border)",
                        background: isCurrent
                          ? "var(--accent-dim)"
                          : "var(--bg-secondary)",
                        color: isCurrent
                          ? "var(--accent-strong)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all border disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              >
                Next →
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}

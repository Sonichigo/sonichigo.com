"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  content: string;
  keyTakeaways?: string[];
}

interface Heading {
  text: string;
  level: number;
  id: string;
}

function toId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function childrenText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children
      .map((child) => {
        if (typeof child === "string") return child;
        if (typeof child === "object" && child !== null) {
          const el = child as React.ReactElement<{ children?: React.ReactNode }>;
          return el.props?.children ? childrenText(el.props.children) : "";
        }
        return "";
      })
      .join("");
  }
  return "";
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  for (const line of content.split("\n")) {
    const m = line.match(/^(#{1,4})\s+(.+)/);
    if (m) {
      const text = m[2].trim();
      headings.push({ level: m[1].length, text, id: toId(text) });
    }
  }
  return headings;
}

function readTime(content: string): number {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

function HeadingWithId({
  level,
  children,
  ...props
}: {
  level: 1 | 2 | 3 | 4;
  children?: React.ReactNode;
  [key: string]: unknown;
}) {
  const id = toId(childrenText(children));
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
  return (
    <Tag id={id} style={{ color: "var(--text-primary)" }} {...props}>
      {children}
    </Tag>
  );
}

export default function PostContent({ post }: { post: Post | null }) {
  const [activeId, setActiveId] = useState<string>("");
  const [scrollPct, setScrollPct] = useState(0);
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  const headings = post ? extractHeadings(post.content) : [];

  useEffect(() => {
    if (!post) return;
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const pct = Math.min(
        100,
        Math.max(0, Math.round(((window.innerHeight - top) / height) * 100))
      );
      setScrollPct(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [post]);

  useEffect(() => {
    if (!headings.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveId(e.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.slug]);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Post Not Found
        </h1>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          The post you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/posts"
          className="inline-block px-6 py-3 rounded-md font-medium transition-colors"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          ← Back to Posts
        </Link>
      </div>
    );
  }

  const mins = readTime(post.content);
  const category = post.tags?.[0] ?? null;
  const shortTitle =
    post.title.length > 45 ? post.title.slice(0, 45) + "…" : post.title;
  const postUrl = `https://sonichigo.com/posts/${post.slug}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-6 pb-24 flex gap-14 items-start">
        {/* ── Sidebar TOC ── */}
        {headings.length > 0 && (
          <aside
            className="hidden lg:flex flex-col w-52 shrink-0 sticky top-8 gap-8"
            style={{ maxHeight: "calc(100vh - 4rem)", overflowY: "auto" }}
          >
            {/* Back link */}
            <Link
              href="/posts"
              className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide hover:underline underline-offset-4 transition-colors"
              style={{ color: "var(--accent)" }}
            >
              ← BACK
            </Link>

            {/* Table of Contents */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  On this page
                </span>
                <span
                  className="text-xs font-mono"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {scrollPct}%
                </span>
              </div>
              <nav>
                <ul className="space-y-0.5">
                  {headings.map(({ id, text, level }) => (
                    <li key={id} style={{ paddingLeft: `${(level - 1) * 10}px` }}>
                      <a
                        href={`#${id}`}
                        className="block text-xs py-1 leading-snug transition-colors"
                        style={{
                          color:
                            activeId === id
                              ? "var(--accent)"
                              : "var(--text-tertiary)",
                          fontWeight: activeId === id ? "600" : "400",
                        }}
                      >
                        {text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Share */}
            <div>
              <span
                className="text-xs font-semibold tracking-widest uppercase block mb-3"
                style={{ color: "var(--text-tertiary)" }}
              >
                Share
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  title={copied ? "Copied!" : "Copy link"}
                  className="w-8 h-8 flex items-center justify-center rounded-full border transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    color: copied ? "var(--accent-green)" : "var(--text-secondary)",
                  }}
                >
                  {copied ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on X"
                  className="w-8 h-8 flex items-center justify-center rounded-full border transition-colors hover:border-current"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on LinkedIn"
                  className="w-8 h-8 flex items-center justify-center rounded-full border transition-colors hover:border-current"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </aside>
        )}

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 max-w-3xl pt-8">
          {/* Mobile back link — hidden on lg where sidebar is visible */}
          <Link
            href="/posts"
            className="lg:hidden inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide hover:underline underline-offset-4 transition-colors mb-6"
            style={{ color: "var(--accent)" }}
          >
            ← BACK
          </Link>

          {/* Breadcrumb */}
          <nav className="text-xs mb-6" style={{ color: "var(--text-tertiary)" }}>
            <Link
              href="/posts"
              className="hover:underline underline-offset-2"
              style={{ color: "var(--text-tertiary)" }}
            >
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span style={{ color: "var(--text-secondary)" }}>{shortTitle}</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            {/* Category · date · read time */}
            <div
              className="flex items-center gap-2 text-xs mb-5 font-semibold tracking-widest uppercase"
              style={{ color: "var(--text-tertiary)" }}
            >
              {category && (
                <>
                  <span style={{ color: "var(--accent)" }}>{category}</span>
                  <span>·</span>
                </>
              )}
              <time>
                {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <span>·</span>
              <span>{mins} min read</span>
            </div>

            <h1
              className="text-4xl sm:text-5xl font-bold mb-5 leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {post.title}
            </h1>

            {post.excerpt && (
              <p
                className="text-lg leading-relaxed italic"
                style={{ color: "var(--text-secondary)" }}
              >
                {post.excerpt}
              </p>
            )}

            {/* Tags — visible on mobile only (sidebar is hidden) */}
            {post.tags.length > 0 && (
              <div className="mt-5 flex items-center gap-2 flex-wrap lg:hidden">
                {post.tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <hr className="mt-8" style={{ borderColor: "var(--border)" }} />
          </header>

          {/* Key Takeaways callout */}
          {post.keyTakeaways && post.keyTakeaways.length > 0 && (
            <div
              className="mb-10 rounded-xl p-6 border"
              style={{
                background: "var(--accent-green-dim)",
                borderColor: "var(--accent-green)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ color: "var(--accent-green)" }}
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: "var(--accent-green)" }}
                >
                  Key Takeaways
                </span>
              </div>
              <ul className="space-y-3">
                {post.keyTakeaways.map((item, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm leading-relaxed"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span
                      className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: "var(--accent-green)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article body */}
          <article
            ref={articleRef}
            className="prose prose-lg max-w-none"
            style={{ color: "var(--text-primary)" }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, children, ...props }) => (
                  <HeadingWithId level={1} {...props}>{children}</HeadingWithId>
                ),
                h2: ({ node, children, ...props }) => (
                  <HeadingWithId level={2} {...props}>{children}</HeadingWithId>
                ),
                h3: ({ node, children, ...props }) => (
                  <HeadingWithId level={3} {...props}>{children}</HeadingWithId>
                ),
                h4: ({ node, children, ...props }) => (
                  <HeadingWithId level={4} {...props}>{children}</HeadingWithId>
                ),
                p: ({ node, ...props }) => (
                  <p style={{ color: "var(--text-secondary)" }} {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a
                    style={{ color: "var(--accent)" }}
                    className="hover:underline"
                    {...props}
                  />
                ),
                code: ({ node, ...props }) => (
                  <code
                    style={{
                      background: "var(--bg-secondary)",
                      color: "var(--accent)",
                      padding: "0.2em 0.4em",
                      borderRadius: "0.25rem",
                      fontSize: "0.875em",
                    }}
                    {...props}
                  />
                ),
                pre: ({ node, ...props }) => (
                  <pre
                    style={{
                      background: "var(--bg-secondary)",
                      padding: "1.5rem",
                      borderRadius: "0.5rem",
                      overflow: "auto",
                    }}
                    {...props}
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    style={{
                      borderLeft: "4px solid var(--accent)",
                      paddingLeft: "1rem",
                      color: "var(--text-secondary)",
                      fontStyle: "italic",
                    }}
                    {...props}
                  />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </article>

          {/* Footer */}
          <footer
            className="mt-16 pt-8 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-sm hover:underline underline-offset-4"
              style={{ color: "var(--accent)" }}
            >
              ← Back to all posts
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}

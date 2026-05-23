"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
}

export default function PostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      fetch(`/api/editor/posts/${slug}`)
        .then((r) => {
          if (!r.ok) throw new Error("Post not found");
          return r.json();
        })
        .then((data) => {
          setPost(data);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="h-8 w-3/4 mb-4 rounded animate-pulse" style={{ background: "var(--bg-secondary)" }} />
        <div className="h-4 w-1/2 mb-8 rounded animate-pulse" style={{ background: "var(--bg-secondary)" }} />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 rounded animate-pulse" style={{ background: "var(--bg-secondary)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Post Not Found
        </h1>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          The post you're looking for doesn't exist.
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Back link */}
      <Link
        href="/posts"
        className="inline-flex items-center gap-2 text-sm mb-8 hover:underline underline-offset-4"
        style={{ color: "var(--accent)" }}
      >
        ← Back to posts
      </Link>

      {/* Header */}
      <header className="mb-8 pb-8 border-b" style={{ borderColor: "var(--border)" }}>
        <h1
          className="text-3xl sm:text-4xl font-bold mb-4 leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
          <time className="font-mono">
            {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          {post.tags && post.tags.length > 0 && (
            <>
              <span>•</span>
              <div className="flex gap-2 flex-wrap">
                {post.tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {post.excerpt && (
          <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {post.excerpt}
          </p>
        )}
      </header>

      {/* Content */}
      <article
        className="prose prose-lg max-w-none"
        style={{
          color: "var(--text-primary)",
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 style={{ color: "var(--text-primary)" }} {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 style={{ color: "var(--text-primary)" }} {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 style={{ color: "var(--text-primary)" }} {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 style={{ color: "var(--text-primary)" }} {...props} />
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
                  borderLeft: `4px solid var(--accent)`,
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
      <footer className="mt-12 pt-8 border-t" style={{ borderColor: "var(--border)" }}>
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm hover:underline underline-offset-4"
          style={{ color: "var(--accent)" }}
        >
          ← Back to all posts
        </Link>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Post, GitHubRepo } from "@/lib/types";
import {
  fetchPostsCached,
  fetchReposCached,
  fetchProfileCached,
  preloadImageWithFallback,
} from "@/lib/data-fetcher";

interface HomeContentProps {
  initialPosts: Post[];
  initialRepos: GitHubRepo[];
  initialProfile: any;
}

export default function HomeContent({
  initialPosts,
  initialRepos,
  initialProfile,
}: HomeContentProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [repos, setRepos] = useState<GitHubRepo[]>(initialRepos);
  const [profile, setProfile] = useState<any>(initialProfile);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    initialProfile?.avatar_url || "/profile.png"
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);

      try {
        // Load from IndexedDB cache
        const [cachedPosts, cachedRepos, cachedProfile] = await Promise.all([
          fetchPostsCached(),
          fetchReposCached(),
          fetchProfileCached(),
        ]);

        if (!mounted) return;

        // Update state with cached data
        if (cachedPosts.length > 0) setPosts(cachedPosts);
        if (cachedRepos.length > 0) setRepos(cachedRepos);
        if (cachedProfile) setProfile(cachedProfile);

        // Handle avatar with fallback
        const finalAvatarUrl = await preloadImageWithFallback(
          cachedProfile?.avatar_url,
          "/profile.png"
        );
        if (mounted) setAvatarUrl(finalAvatarUrl);

        // Note: Markdown backups are saved via /api/backup endpoint
        // This happens automatically when data is cached
      } catch (error) {
        console.error("Error loading cached data:", error);
        // Keep using initial server-rendered data on error
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const displayPosts = posts.slice(0, 6);
  const displayRepos = repos.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Hero */}
      <section className="pt-8 pb-16">
        <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-8 mb-8">
          {/* Left — text */}
          <div className="flex-1">
            <p
              className="text-xs mb-4 tracking-widest"
              style={{ color: "var(--text-tertiary)" }}
            >
              01100100 01100101 01110110 01110010 01100101 01101100
            </p>
            <br />
            <p
              className="text-xs uppercase tracking-[0.3em] mb-4 system-init"
              style={{ color: "var(--accent-green)" }}
            >
              :: system.init() ::
            </p>
            <br />
            <div
              className="text-xs mb-6 tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              [ DevRel · OSS · eBPF · Cloud Native · Writer ]
            </div>
          </div>

          {/* Right — profile picture */}
          <div className="shrink-0">
            <div
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden"
              style={{
                border: "2px solid var(--accent)",
                boxShadow: "0 0 20px var(--accent-dim)",
              }}
            >
              <img
                src={avatarUrl}
                alt="Animesh Pathak"
                width={128}
                height={128}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Final fallback if both fail
                  (e.target as HTMLImageElement).src = "/profile.png";
                }}
              />
            </div>
          </div>
        </div>

        <h1
          className="text-xl sm:text-xl font-normal leading-relaxed mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          Developer Relations Engineer at{" "}
          <a
            href="https://harness.io"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 decoration-[var(--accent)] decoration-1"
          >
            Harness
          </a>
          , working at the intersection of database DevOps, APIs, testing, and
          open-source innovation.
        </h1>

        <p
          className="text-sm leading-relaxed max-w-2xl mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          I help developers and communities understand modern tooling through
          hands-on demos, real-world architecture, and clear storytelling. I
          turn complex systems into practical, usable knowledge — from eBPF
          tracing to CI/CD pipelines.
        </p>

        {/* Badges / Credentials */}
        <div className="flex flex-wrap gap-3 mb-8">
          <a
            href="https://www.credly.com/users/sonichigo"
            target="_blank"
            rel="noopener noreferrer"
            className="card-base flex items-center gap-3 py-3 px-4"
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: "var(--accent-green-dim)",
                color: "var(--accent-green)",
              }}
            >
              C
            </span>
            <div>
              <span
                className="text-xs font-medium block"
                style={{ color: "var(--text-primary)" }}
              >
                Certifications
              </span>
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                View on Credly ↗
              </span>
            </div>
          </a>
          <a
            href="https://mvp.microsoft.com/en-US/studentambassadors/profile/59065088-ce32-4e1c-a69a-3e04e526fa16"
            target="_blank"
            rel="noopener noreferrer"
            className="card-base flex items-center gap-3 py-3 px-4"
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: "var(--accent-green-dim)",
                color: "var(--accent-green)",
              }}
            >
              M
            </span>
            <div>
              <span
                className="text-xs font-medium block"
                style={{ color: "var(--text-primary)" }}
              >
                Gold MLSA
              </span>
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Microsoft Learn Student Ambassador ↗
              </span>
            </div>
          </a>
        </div>

        <div className="flex gap-4 text-sm">
          <Link
            href="/about"
            className="px-4 py-2 rounded-md transition-colors font-medium"
            style={{
              background: "var(--accent)",
              color: "#fff",
            }}
          >
            About Me
          </Link>
          <Link
            href="/posts"
            className="px-4 py-2 rounded-md border transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            Read Latest Posts
          </Link>
        </div>
      </section>

      {/* Featured Writing */}
      {displayPosts.length > 0 && (
        <section className="pb-16">
          <h2
            className="text-xs uppercase tracking-[0.2em] mb-6"
            style={{ color: "var(--text-tertiary)" }}
          >
            // featured writing
          </h2>

          <ul className="space-y-0">
            {displayPosts.map((post, i) => {
              const isExternal = !post.url.includes("sonichigo.hashnode.dev");
              const domain = isExternal
                ? new URL(post.url).hostname.replace("www.", "")
                : null;

              return (
                <li
                  key={post.url}
                  className="group border-t py-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"
                  style={{
                    borderColor: "var(--border)",
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <span className="mono-date shrink-0 w-28">
                    {post.published_at
                      ? new Date(post.published_at + "T00:00:00").toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : ""}
                  </span>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm group-hover:underline underline-offset-4 transition-colors flex items-baseline gap-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {post.title}
                    {isExternal && (
                      <span
                        className="text-xs shrink-0"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        ↗ {domain}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          <Link
            href="/posts"
            className="inline-block mt-6 text-xs uppercase tracking-[0.2em] hover:underline underline-offset-4"
            style={{ color: "var(--accent)" }}
          >
            View all posts
          </Link>
        </section>
      )}

      {/* GitHub Repos */}
      {displayRepos.length > 0 && (
        <section className="pb-16">
          <h2
            className="text-xs uppercase tracking-[0.2em] mb-6"
            style={{ color: "var(--text-tertiary)" }}
          >
            // open source
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayRepos.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-base group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {repo.name}
                  </span>
                  {repo.stars > 0 && (
                    <span
                      className="text-xs shrink-0"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      ★ {repo.stars}
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {repo.description}
                  </p>
                )}
                {repo.language && (
                  <span className="tag-pill-green mt-3 inline-block">{repo.language}</span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

"use client";

import type { Post, GitHubRepo } from "./types";
import { getFromCache, saveToCache, STORES } from "./indexeddb";

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const GITHUB_USERNAME = "Sonichigo";

/**
 * Fetch data with IndexedDB caching
 * Falls back to network if cache miss, then updates cache
 */
async function fetchWithCache<T>(
  cacheKey: string,
  storeName: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  // Try to get from cache first
  const cached = await getFromCache<T>(storeName, cacheKey);
  if (cached) {
    console.log(`Cache hit for ${cacheKey}`);
    return cached;
  }

  // Cache miss - fetch from network
  console.log(`Cache miss for ${cacheKey}, fetching...`);
  const data = await fetcher();

  // Save to cache for next time (don't await to avoid blocking)
  saveToCache(storeName, cacheKey, data, ttl).catch((err) =>
    console.error("Failed to cache data:", err)
  );

  return data;
}

/**
 * Fetch posts from RSS with caching
 */
export async function fetchPostsCached(): Promise<Post[]> {
  return fetchWithCache(
    "all_posts",
    STORES.POSTS,
    async () => {
      const res = await fetch("/api/rss");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    }
  );
}

/**
 * Fetch GitHub repos with caching
 */
export async function fetchReposCached(): Promise<GitHubRepo[]> {
  return fetchWithCache(
    "github_repos",
    STORES.REPOS,
    async () => {
      const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "sonichigo-portfolio",
      };

      const res = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12&type=owner`,
        { headers }
      );

      if (!res.ok) return [];

      const data = await res.json();

      return data
        .filter((repo: any) => !repo.fork && !repo.archived)
        .map((repo: any) => ({
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          stars: repo.stargazers_count,
          language: repo.language,
          updated_at: repo.updated_at,
        }));
    }
  );
}

/**
 * Fetch GitHub profile with caching
 */
export async function fetchProfileCached(): Promise<any> {
  return fetchWithCache(
    "github_profile",
    STORES.PROFILE,
    async () => {
      const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "sonichigo-portfolio",
      };

      const res = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}`,
        { headers }
      );

      if (!res.ok) return null;
      return res.json();
    }
  );
}

/**
 * Save data to markdown file (optional backup)
 * Stores data in localStorage as markdown for easy export
 */
export async function saveToMarkdownBackup(
  type: "posts" | "repos" | "profile",
  data: any
) {
  try {
    // Save to API endpoint that generates markdown
    const res = await fetch("/api/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });

    if (!res.ok) {
      console.warn("Failed to save markdown backup:", await res.text());
    } else {
      console.log(`Successfully saved ${type} markdown backup`);
    }
  } catch (error) {
    console.error("Error saving markdown backup:", error);
  }
}

/**
 * Get avatar URL with fallback logic
 * 1. Try local public image first
 * 2. Fallback to GitHub avatar
 */
export function getAvatarUrl(githubProfile: any | null): string {
  const localAvatar = "/profile.png";
  const githubAvatar = githubProfile?.avatar_url;

  // Local avatar is primary, GitHub is fallback
  return localAvatar;
}

/**
 * Preload image and fallback if needed
 */
export function preloadImageWithFallback(
  primaryUrl: string | null,
  fallbackUrl: string
): Promise<string> {
  return new Promise((resolve) => {
    if (!primaryUrl) {
      console.log("No primary URL provided, using fallback:", fallbackUrl);
      resolve(fallbackUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      console.log("Successfully loaded primary image:", primaryUrl);
      resolve(primaryUrl);
    };
    img.onerror = () => {
      console.warn("Failed to load primary image, using fallback:", primaryUrl);
      resolve(fallbackUrl);
    };

    // Set a timeout to fallback after 5 seconds
    setTimeout(() => {
      if (img.complete === false) {
        console.warn("Image loading timed out, using fallback");
        resolve(fallbackUrl);
      }
    }, 5000);

    img.src = primaryUrl;
  });
}

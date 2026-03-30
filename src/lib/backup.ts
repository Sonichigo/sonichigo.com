/**
 * Markdown file backup utilities
 * Stores cached data as markdown files for easy version control and backup
 */

import type { Post, GitHubRepo } from "./types";

export interface BackupMetadata {
  timestamp: string;
  source: string;
  count: number;
}

/**
 * Generate markdown backup for posts
 */
export function generatePostsMarkdown(posts: Post[]): string {
  const timestamp = new Date().toISOString();
  const lines: string[] = [];

  lines.push("# Posts Backup");
  lines.push("");
  lines.push(`**Last Updated:** ${timestamp}`);
  lines.push(`**Total Posts:** ${posts.length}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  posts.forEach((post, i) => {
    lines.push(`## ${i + 1}. ${post.title}`);
    lines.push("");
    lines.push(`- **URL:** ${post.url}`);
    lines.push(`- **Source:** ${post.source}`);
    lines.push(`- **Published:** ${post.published_at}`);
    lines.push(`- **Featured:** ${post.is_featured ? "Yes" : "No"}`);
    if (post.tags.length > 0) {
      lines.push(`- **Tags:** ${post.tags.join(", ")}`);
    }
    if (post.excerpt) {
      lines.push("");
      lines.push(`> ${post.excerpt}`);
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  });

  return lines.join("\n");
}

/**
 * Generate markdown backup for repos
 */
export function generateReposMarkdown(repos: GitHubRepo[]): string {
  const timestamp = new Date().toISOString();
  const lines: string[] = [];

  lines.push("# GitHub Repositories Backup");
  lines.push("");
  lines.push(`**Last Updated:** ${timestamp}`);
  lines.push(`**Total Repos:** ${repos.length}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  repos.forEach((repo, i) => {
    lines.push(`## ${i + 1}. ${repo.name}`);
    lines.push("");
    lines.push(`- **URL:** ${repo.url}`);
    lines.push(`- **Stars:** ⭐ ${repo.stars}`);
    if (repo.language) {
      lines.push(`- **Language:** ${repo.language}`);
    }
    lines.push(`- **Last Updated:** ${repo.updated_at}`);
    if (repo.description) {
      lines.push("");
      lines.push(`> ${repo.description}`);
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  });

  return lines.join("\n");
}

/**
 * Generate markdown backup for profile
 */
export function generateProfileMarkdown(profile: any): string {
  const timestamp = new Date().toISOString();
  const lines: string[] = [];

  lines.push("# GitHub Profile Backup");
  lines.push("");
  lines.push(`**Last Updated:** ${timestamp}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  if (profile) {
    lines.push(`## ${profile.name || profile.login}`);
    lines.push("");
    if (profile.bio) {
      lines.push(`> ${profile.bio}`);
      lines.push("");
    }
    lines.push(`- **Username:** @${profile.login}`);
    lines.push(`- **URL:** ${profile.html_url}`);
    lines.push(`- **Avatar:** ${profile.avatar_url}`);
    lines.push(`- **Public Repos:** ${profile.public_repos}`);
    lines.push(`- **Followers:** ${profile.followers}`);
    lines.push(`- **Following:** ${profile.following}`);
    if (profile.location) {
      lines.push(`- **Location:** ${profile.location}`);
    }
    if (profile.company) {
      lines.push(`- **Company:** ${profile.company}`);
    }
    if (profile.blog) {
      lines.push(`- **Website:** ${profile.blog}`);
    }
    if (profile.twitter_username) {
      lines.push(`- **Twitter:** @${profile.twitter_username}`);
    }
  } else {
    lines.push("*No profile data available*");
  }

  lines.push("");

  return lines.join("\n");
}

/**
 * Save backup to local storage as downloadable
 * Returns the markdown content for client-side download
 */
export async function saveBackupToFile(
  type: "posts" | "repos" | "profile",
  data: any
): Promise<{ content: string; filename: string }> {
  let content: string;
  let filename: string;

  const dateStr = new Date().toISOString().split("T")[0];

  switch (type) {
    case "posts":
      content = generatePostsMarkdown(data);
      filename = `posts-backup-${dateStr}.md`;
      break;
    case "repos":
      content = generateReposMarkdown(data);
      filename = `repos-backup-${dateStr}.md`;
      break;
    case "profile":
      content = generateProfileMarkdown(data);
      filename = `profile-backup-${dateStr}.md`;
      break;
  }

  return { content, filename };
}

/**
 * Trigger browser download of markdown file
 */
export function downloadMarkdown(content: string, filename: string) {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

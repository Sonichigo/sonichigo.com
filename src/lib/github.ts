import type { GitHubRepo } from "./types";

const GITHUB_USERNAME = "Sonichigo";

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "sonichigo-portfolio",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12&type=owner`,
      { headers, next: { revalidate: 3600 } }
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
  } catch (err) {
    console.error("Failed to fetch GitHub repos:", err);
    return [];
  }
}

export async function fetchGitHubProfile() {
  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "sonichigo-portfolio",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

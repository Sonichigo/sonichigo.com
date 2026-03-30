import { fetchAllPosts } from "@/lib/rss";
import { fetchGitHubRepos, fetchGitHubProfile } from "@/lib/github";
import HomeContent from "@/components/HomeContent";

export const revalidate = 3600;

export default async function HomePage() {
  // Fetch initial data server-side for SEO and first paint
  const [posts, repos, profile] = await Promise.allSettled([
    fetchAllPosts(),
    fetchGitHubRepos(),
    fetchGitHubProfile(),
  ]);

  const allPosts = posts.status === "fulfilled" ? posts.value : [];
  const allRepos = repos.status === "fulfilled" ? repos.value : [];
  const ghProfile = profile.status === "fulfilled" ? profile.value : null;

  // Pass server-rendered data to client component
  // Client will enhance with IndexedDB caching
  return (
    <HomeContent
      initialPosts={allPosts}
      initialRepos={allRepos}
      initialProfile={ghProfile}
    />
  );
}

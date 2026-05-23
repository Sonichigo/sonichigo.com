import "@/lib/init"; // Initialize app configuration
import { fetchGitHubRepos, fetchGitHubProfile } from "@/lib/github";
import HomeContent from "@/components/HomeContent";

export const revalidate = 3600;

export default async function HomePage() {
  // Fetch initial data server-side for SEO and first paint
  const [repos, profile] = await Promise.allSettled([
    fetchGitHubRepos(),
    fetchGitHubProfile(),
  ]);

  const allRepos = repos.status === "fulfilled" ? repos.value : [];
  const ghProfile = profile.status === "fulfilled" ? profile.value : null;

  // Pass server-rendered data to client component
  // Client will enhance with IndexedDB caching
  return (
    <HomeContent
      initialRepos={allRepos}
      initialProfile={ghProfile}
    />
  );
}

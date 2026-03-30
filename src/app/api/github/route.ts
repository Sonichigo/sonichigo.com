import { NextResponse } from "next/server";
import { fetchGitHubRepos } from "@/lib/github";

export const revalidate = 3600;

export async function GET() {
  const repos = await fetchGitHubRepos();
  return NextResponse.json(repos);
}

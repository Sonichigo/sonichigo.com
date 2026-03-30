import type { Post } from "./types";

interface RssFeedSource {
  name: string;
  url: string;
  altUrls?: string[];
  sourceLabel: string;
  authorPageUrl?: string;
  skipAuthorFilter?: boolean;
}

const RSS_SOURCES: RssFeedSource[] = [
  {
    name: "Hashnode",
    url: "https://sonichigo.hashnode.dev/rss.xml",
    altUrls: ["https://sonichigo.hashnode.dev/rss.xml"],
    sourceLabel: "hashnode",
    skipAuthorFilter: true,
  },
  {
    name: "Keploy",
    url: "https://keploy.io/blog/rss.xml",
    altUrls: [
      "https://keploy.io/blog/community/rss.xml",
      "https://keploy.io/blog/technology/rss.xml",
    ],
    sourceLabel: "keploy",
    authorPageUrl: "https://keploy.io/blog/authors/Animesh%20Pathak",
  },
  {
    name: "Harness",
    url: "https://www.harness.io/blog/rss.xml",
    sourceLabel: "harness",
  },
];

// Exact URLs to exclude from results (category pages that sneak in)
const BLOCKED_URLS = new Set([
  "https://keploy.io/blog/technology",
  "https://keploy.io/blog/community",
  "https://keploy.io/blog/technology/",
  "https://keploy.io/blog/community/",
]);

const AUTHOR_NAMES = ["animesh", "sonichigo", "animesh pathak"];

// Maximum pages to scrape from Keploy author page
const KEPLOY_MAX_PAGES = 10; // Adjust if you have more than 50 posts (10 per page)

// Harness: static fallback (Webflow site, can't scrape or filter RSS by author)
const HARNESS_POSTS: Post[] = [
  {
    id: 0, title: "From Chaos to Control Vol 1 — Captain Canary Comic",
    url: "https://www.harness.io/blog/from-chaos-to-control-vol-1",
    source: "harness", published_at: "2026-03-01",
    excerpt: "Introducing the Database DevOps comic series.", tags: ["database", "devops"], image_url: null, is_featured: false,
  },
  {
    id: 1, title: "From Concept to Reality: The Journey Behind Harness Database DevOps",
    url: "https://www.harness.io/blog/from-concept-to-reality-the-journey-behind-harness-database-devops",
    source: "harness", published_at: "2026-02-23",
    excerpt: "How research and developer empathy shaped Database DevOps.", tags: ["database", "devops"], image_url: null, is_featured: true,
  },
  {
    id: 2, title: "Harness Database DevOps Now Supports Google AlloyDB",
    url: "https://www.harness.io/blog/harness-database-devops-now-supports-google-alloydb",
    source: "harness", published_at: "2026-02-23",
    excerpt: "AlloyDB support for automated PostgreSQL delivery.", tags: ["database", "alloydb"], image_url: null, is_featured: false,
  },
  {
    id: 3, title: "Database DevOps: Lessons Learned from Manual Migration Hell",
    url: "https://www.harness.io/blog/database-devops-lessons-learned-from-manual-migration-hell",
    source: "harness", published_at: "2026-01-23",
    excerpt: "Harness DB DevOps enhances Liquibase workflows.", tags: ["database", "liquibase"], image_url: null, is_featured: false,
  },
];

interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  creator?: string;
  categories?: string[];
}

// ── Fetch RSS and filter by author name ──
async function fetchRssFeed(source: RssFeedSource): Promise<Post[]> {
  const urlsToTry = [source.url, ...(source.altUrls || [])];

  for (const feedUrl of urlsToTry) {
    try {
      const res = await fetch(feedUrl, {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; sonichigo-portfolio/1.0)",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
      });
      if (!res.ok) continue;

      const xml = await res.text();
      if (!xml.includes("<item>") && !xml.includes("<entry>")) continue;

      const items = parseRssXml(xml);
      if (items.length === 0) continue;

      const filtered = items.filter((item) => {
        if (source.skipAuthorFilter) return true;
        const creator = (item.creator || "").toLowerCase();
        return AUTHOR_NAMES.some((name) => creator.includes(name));
      });

      const posts = filtered.map((item, i) => ({
        id: i,
        title: item.title || "Untitled",
        url: item.link || "",
        source: source.sourceLabel,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString().split("T")[0] : "",
        excerpt: truncate(item.contentSnippet || stripHtml(item.content || ""), 200),
        tags: item.categories || [],
        image_url: null,
        is_featured: false,
      }));

      if (posts.length > 0) return posts;
    } catch (err) {
      console.error(`Failed to fetch RSS from ${feedUrl}:`, err);
    }
  }
  return [];
}

// ── Hashnode GraphQL API fallback ──
async function fetchHashnodePosts(): Promise<Post[]> {
  try {
    const res = await fetch("https://gql.hashnode.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
      body: JSON.stringify({
        query: `{
          publication(host: "sonichigo.hashnode.dev") {
            posts(first: 20) {
              edges { node { title brief url publishedAt tags { name } coverImage { url } } }
            }
          }
        }`,
      }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const edges = json?.data?.publication?.posts?.edges || [];

    return edges.map((edge: any, i: number) => ({
      id: i,
      title: edge.node.title,
      url: edge.node.url,
      source: "hashnode",
      published_at: edge.node.publishedAt ? new Date(edge.node.publishedAt).toISOString().split("T")[0] : "",
      excerpt: truncate(edge.node.brief || "", 200),
      tags: (edge.node.tags || []).map((t: any) => t.name),
      image_url: edge.node.coverImage?.url || null,
      is_featured: false,
    }));
  } catch (err) {
    console.error("Failed to fetch Hashnode GraphQL:", err);
    return [];
  }
}

// ── Scrape single page of Keploy author page ──
async function scrapeAuthorPageSingle(url: string): Promise<Post[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; sonichigo-portfolio/1.0)" },
    });
    if (!res.ok) return [];

    const html = await res.text();

    // First, extract all <time dateTime="..."> tags with their positions
    const timeMap = new Map<number, string>(); // position -> ISO date
    const timeRegex = /<time[^>]+dateTime=["']([^"']+)["']/gi;
    let timeMatch;
    while ((timeMatch = timeRegex.exec(html)) !== null) {
      const dateStr = timeMatch[1];
      try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          timeMap.set(timeMatch.index, d.toISOString().split("T")[0]);
        }
      } catch { /* ignore */ }
    }

    // Now extract posts from links with aria-label
    const posts: Post[] = [];
    const seen = new Set<string>();
    // Match <a> tags that have both aria-label and href attributes
    const linkRegex = /<a[^>]*aria-label=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    let linkMatch;

    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const title = stripHtml(linkMatch[1]).trim();
      let href = linkMatch[2];
      const linkPos = linkMatch.index;

      if (!title || title.length < 10) continue;

      // Skip category pages and non-blog links
      if (
        !href.includes("/blog/") ||
        href.includes("/authors/") ||
        href.includes("/tag/") ||
        /\/blog\/(technology|community)\/?$/i.test(href)
      ) continue;

      // Make absolute URL
      if (href.startsWith("/")) {
        const base = new URL(url);
        href = `${base.origin}${href}`;
      }

      if (seen.has(href)) continue;
      seen.add(href);

      // Find the closest <time> tag (within 2000 chars before or after this link)
      let publishedAt = "";
      let closestDistance = Infinity;
      for (const [timePos, date] of timeMap) {
        const distance = Math.abs(timePos - linkPos);
        if (distance < 2000 && distance < closestDistance) {
          closestDistance = distance;
          publishedAt = date;
        }
      }

      posts.push({
        id: posts.length,
        title,
        url: href,
        source: "keploy",
        published_at: publishedAt,
        excerpt: "",
        tags: [],
        image_url: null,
        is_featured: false,
      });
    }

    return posts;
  } catch (err) {
    console.error(`Failed to scrape page ${url}:`, err);
    return [];
  }
}

// ── Scrape Keploy author page with pagination ──
async function scrapeAuthorPage(source: RssFeedSource): Promise<Post[]> {
  if (!source.authorPageUrl) return [];

  const allPosts: Post[] = [];
  const maxPages = source.sourceLabel === "keploy" ? KEPLOY_MAX_PAGES : 1;

  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? source.authorPageUrl : `${source.authorPageUrl}?page=${page}`;
    const pagePosts = await scrapeAuthorPageSingle(url);

    if (pagePosts.length === 0) {
      // No more posts on this page, stop pagination
      break;
    }

    allPosts.push(...pagePosts);
  }

  if (allPosts.length > 0) {
    console.log(`✓ Scraped ${allPosts.length} posts from ${source.name} (${Math.ceil(allPosts.length / 10)} pages)`);
  }

  return allPosts;
}

// ── XML parsing helpers ──
function parseRssXml(xml: string): RssItem[] {
  const items: RssItem[] = [];
  let match;

  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      title: extractTag(block, "title"),
      link: extractTag(block, "link") || extractLinkTag(block),
      pubDate: extractTag(block, "pubDate") || extractTag(block, "published"),
      contentSnippet: truncate(stripHtml(extractTag(block, "description") || ""), 300),
      content: extractTag(block, "content:encoded") || extractTag(block, "description"),
      creator: extractTag(block, "dc:creator") || extractTag(block, "author"),
      categories: extractAllTags(block, "category"),
    });
  }

  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      title: extractTag(block, "title"),
      link: extractAtomLink(block),
      pubDate: extractTag(block, "published") || extractTag(block, "updated"),
      contentSnippet: truncate(stripHtml(extractTag(block, "summary") || ""), 300),
      content: extractTag(block, "content"),
      creator: extractTag(block, "author"),
      categories: extractAllTags(block, "category"),
    });
  }

  return items;
}

function extractTag(xml: string, tag: string): string | undefined {
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
  const m1 = cdataRegex.exec(xml);
  if (m1) return m1[1].trim();
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m2 = regex.exec(xml);
  return m2 ? m2[1].trim() : undefined;
}

function extractLinkTag(xml: string): string | undefined {
  const m = /<link[^>]*>([^<]+)<\/link>/i.exec(xml);
  if (m) return m[1].trim();
  const bare = /<link>\s*(https?:\/\/[^\s<]+)/i.exec(xml);
  return bare ? bare[1].trim() : undefined;
}

function extractAtomLink(xml: string): string | undefined {
  const m = /<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i.exec(xml);
  return m ? m[1].trim() : undefined;
}

function extractAllTags(xml: string, tag: string): string[] {
  const results: string[] = [];
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "gi");
  let match;
  while ((match = regex.exec(xml)) !== null) results.push(match[1].trim());
  return results;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len).replace(/\s+\S*$/, "") + "…";
}

// ══════════════════════════════════════
// Main
// ══════════════════════════════════════
export async function fetchAllPosts(): Promise<Post[]> {
  const allPosts: Post[] = [];

  for (const source of RSS_SOURCES) {
    let posts: Post[] = [];

    if (source.sourceLabel === "hashnode") {
      posts = await fetchRssFeed(source);
      if (posts.length === 0) {
        console.log("Hashnode RSS empty, falling back to GraphQL API");
        posts = await fetchHashnodePosts();
      }
    } else if (source.sourceLabel === "harness") {
      // Harness: static list (Webflow site, no usable RSS author field)
      posts = [...HARNESS_POSTS];
    } else if (source.sourceLabel === "keploy") {
      // Keploy: scrape author page with pagination (gets all posts!)
      posts = await scrapeAuthorPage(source);
    } else {
      // Other sources: try RSS author filter first
      posts = await fetchRssFeed(source);
    }

    allPosts.push(...posts);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allPosts.filter((post) => {
    const normalized = post.url.replace(/\/$/, "").toLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });

  // Remove blocked URLs (e.g. Keploy category pages)
  const cleaned = unique.filter((post) => !BLOCKED_URLS.has(post.url));

  // Sort by date descending (latest first)
  cleaned.sort((a, b) => {
    const dateA = a.published_at || "";
    const dateB = b.published_at || "";
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB.localeCompare(dateA);
  });

  return cleaned;
}
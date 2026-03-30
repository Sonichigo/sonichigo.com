# sonichigo.com — Next.js Portfolio

A terminal-inspired, dark/light mode portfolio built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **IndexedDB caching**.

## Features

- **Dark/Light mode** with system preference detection (`next-themes`)
- **IndexedDB caching** for fast loads (4-5x faster on repeat visits)
- **Markdown backups** for data versioning and recovery
- **RSS feed aggregation** from Hashnode, Keploy, and Harness blogs
- **GitHub API integration** for repos and profile data
- **Terminal aesthetic** inspired by [hrittikhere.com](https://hrittikhere.com)
- **Responsive** mobile-first design with JetBrains Mono typography
- **Works offline** after first visit

## Pages

| Route       | Description                                          |
|-------------|------------------------------------------------------|
| `/`         | Hero + featured posts + GitHub repos                 |
| `/posts`    | All blog posts with search & source filtering        |
| `/talks`    | Talks timeline with region stats                     |
| `/travels`  | Travel map + country-grouped locations               |
| `/about`    | Bio, socials, GitHub profile                         |

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Sonichigo/sonichigo.com.git
cd sonichigo.com
npm install
```

### 2. Configure Environment (Optional)

```bash
cp .env.example .env.local
# Add GITHUB_TOKEN to avoid rate limiting (optional)
# Add DATABASE_URL if you want to use Neon for talks/travels (optional)
```

**Note**: The site works fully with IndexedDB + markdown backups. Database is only needed for the talks/travels features.

### 3. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Routes

| Endpoint        | Source                    | Cache  |
|-----------------|---------------------------|--------|
| `/api/rss`      | RSS feeds (Hashnode, Keploy, Harness) | 1 hour |
| `/api/backup`   | Generate/download markdown backups | - |
| `/api/posts`    | Neon PostgreSQL (optional) | 1 hour |
| `/api/talks`    | Neon PostgreSQL           | 1 hour |
| `/api/travels`  | Neon PostgreSQL           | 1 hour |
| `/api/github`   | GitHub REST API           | 1 hour |

## Blog Sources (RSS)

Posts are aggregated from multiple sources:

- **Hashnode** — Auto-synced from RSS (all your posts)
- **Keploy** — Auto-synced from RSS + author page scraping
- **Harness** — Manual (add URLs to [`src/lib/rss.ts`](src/lib/rss.ts))

### Adding New Posts

- **Hashnode/Keploy**: Just publish, automatically appears within 1-2 hours
- **Harness**: Add URL to `HARNESS_KNOWN_URLS` in `src/lib/rss.ts`, then rebuild

See [QUICK_GUIDE.md](QUICK_GUIDE.md) for details.

## 📚 Documentation

- **[QUICK_GUIDE.md](QUICK_GUIDE.md)** - How to add new content
- **[DATA_FLOW.md](DATA_FLOW.md)** - Complete data flow & update process
- **[UPDATE_FLOW.txt](UPDATE_FLOW.txt)** - Visual flow diagrams
- **[README_CACHING.md](README_CACHING.md)** - IndexedDB caching system
- **[CHANGES.md](CHANGES.md)** - Recent changes & bug fixes

## Deployment

Deploy to **Vercel** (recommended for Next.js):

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add environment variables (`DATABASE_URL`, `GITHUB_TOKEN`)
4. Deploy

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **Caching**: IndexedDB (client-side) + Markdown backups
- **Database**: Neon PostgreSQL (optional, for talks/travels)
- **Theme**: next-themes (dark/light)
- **Fonts**: JetBrains Mono, DM Sans

## Performance

- **4-5x faster** loads on repeat visits (IndexedDB caching)
- **100% reduction** in API calls after first visit
- **Works offline** with cached data
- **Automatic backups** to markdown files

## License

MIT

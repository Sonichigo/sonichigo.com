// Run: node src/db/seed.mjs
// Requires DATABASE_URL env var pointing to your Neon database

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local from project root
config({ path: join(__dirname, "../../.env.local") });

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log(":: Running schema...");
  const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await sql.query(stmt + ";");
  }

  console.log(":: Seeding talks...");
  const talks = [
    {
      title: "Breaking Language Barriers with Azure OpenAI and Nextjs",
      event_name: "DevRelKaigi 2025",
      date: "2025-10-04",
      location: "Tokyo, Japan",
      type: "speaker",
      event_url: "https://www.meetup.com/reactplay-bengaluru/events/307690438/",
      image_url: "/images/events/reactplay-meetup-may.jpeg",
    },
    {
      title: "Breaking Language Barriers with Azure OpenAI and Nextjs",
      event_name: "ReactPlay Meetup May",
      date: "2025-05-17",
      location: "Bengaluru, India",
      type: "speaker",
      event_url: "https://www.meetup.com/reactplay-bengaluru/events/307690438/",
      image_url: "/images/events/reactplay-meetup-may.jpeg",
    },
    {
      title: "Introduction to CNCF and CNCG Noida",
      event_name: "CNCG Noida Meetup April",
      date: "2025-04-19",
      location: "Noida, India",
      type: "speaker",
      event_url: "https://www.linkedin.com/posts/sonichigo_kubeinloop-activity-7320314496596553731",
      image_url: "/images/events/cncg-noida-april25.jpeg",
    },
    {
      title: "Breaking Language Barriers with Azure OpenAI and Nextjs",
      event_name: "React n Roll Meetup April",
      date: "2025-04-12",
      location: "Bengaluru, India",
      type: "speaker",
      event_url: "https://www.meetup.com/techinsider-bangalore/events/306842947/",
      image_url: "/images/events/reactnroll-april25.jpeg",
    },
    {
      title: "Testing in production with eBPF",
      event_name: "CNCF Hooghly March 2025",
      date: "2025-04-08",
      location: "Hooghly, India",
      type: "speaker",
      event_url: "https://community.cncf.io/events/details/cncf-cloud-native-hooghly-presents-kubekulture/",
      image_url: "/images/events/cncf-hooghly-feb.jpeg",
    },
    {
      title: "Improving Developer Productivity with DevPod",
      event_name: "CNCF Chennai Feb 2025",
      date: "2025-02-22",
      location: "Chennai, India",
      type: "speaker",
      event_url: "https://community.cncf.io/events/details/cncf-cloud-native-chennai-presents-cloud-native-chennai-feb-2025-meetup",
      image_url: "/images/events/cncf-chennai-feb-2025.jpeg",
    },
    {
      title: "SEO for DevRel, and the Impact It Creates on the Business",
      event_name: "DevRelCon India 2024",
      date: "2024-12-06",
      location: "Bengaluru, India",
      type: "speaker",
      event_url: "https://blr24.devrelcon.dev/",
      image_url: "/images/events/devrelcon.jpeg",
    },
    {
      title: "How to Generate Test-Cases and Data Mocks for Microservices at Kernel Using eBPF",
      event_name: "Open Source Summit EU 2024",
      date: "2024-09-17",
      location: "Vienna, Austria",
      type: "speaker",
      event_url: "https://www.youtube.com/watch?v=VoV2eyTiFyY",
      video_url: "https://www.youtube.com/watch?v=VoV2eyTiFyY",
      image_url: "/images/events/oss-eu-2024.png",
    },
    {
      title: "Ship Features Faster with AI Based Testing Using Keploy",
      event_name: "API World 2024",
      date: "2024-11-13",
      location: "Virtual",
      type: "speaker",
      event_url: "https://apiworld2024.sched.com/event/1kita/",
      image_url: "/images/events/apiworld-2024.png",
    },
    {
      title: "Building Microservices with DevPod and Keploy",
      event_name: "Platform Meetup July 2024",
      date: "2024-07-09",
      location: "Bengaluru, India",
      type: "speaker",
      event_url: "https://www.loft.sh/blog/platform-bengaluru-meetup-recap",
    },
    {
      title: "Improving Developer Productivity with DevPod",
      event_name: "GirlScript Summer of Code",
      date: "2024-06-26",
      location: "Virtual",
      type: "speaker",
      event_url: "https://www.youtube.com/watch?v=1DP6WDTsL8s",
      video_url: "https://www.youtube.com/watch?v=1DP6WDTsL8s",
    },
    {
      title: "Understanding eBPF Tracing",
      event_name: "DevOpsDays Bangalore 2023",
      date: "2023-12-13",
      location: "Bengaluru, India",
      type: "speaker",
      event_url: "https://www.youtube.com/watch?v=Q7-fDN3ZOuc",
      video_url: "https://www.youtube.com/watch?v=Q7-fDN3ZOuc",
      image_url: "/images/events/devopsdays-23-blr.png",
    },
    {
      title: "Infuse Security Into your SDLC",
      event_name: "DevSecCon 2022",
      date: "2022-06-15",
      location: "Virtual",
      type: "speaker",
      event_url: "https://www.youtube.com/watch?v=SiDQJqRsUDE",
      video_url: "https://www.youtube.com/watch?v=SiDQJqRsUDE",
      image_url: "/images/events/devseccon-22.jpeg",
    },
  ];

  for (const t of talks) {
    await sql`
      INSERT INTO talks (title, event_name, date, location, type, event_url, video_url, image_url)
      VALUES (${t.title}, ${t.event_name}, ${t.date}, ${t.location}, ${t.type},
              ${t.event_url}, ${t.video_url || null}, ${t.image_url || null})
      ON CONFLICT DO NOTHING
    `;
  }

  console.log(":: Seeding travels...");
  const travels = [
    { city: "Vienna", country: "Austria", latitude: 48.2082, longitude: 16.3738, purpose: "conference", notes: "Open Source Summit EU 2024" },
    { city: "bratislava", country: "Slovakia", latitude: 48.15, longitude: 17.1067, purpose: "vacation", notes: "Day Trip 2024" },
    { city: "Bengaluru", country: "India", latitude: 12.9716, longitude: 77.5946, purpose: "conference", notes: "DevRelCon, DevOpsDays, ReactPlay, Platform Meetup" },
    { city: "Chennai", country: "India", latitude: 13.0827, longitude: 80.2707, purpose: "meetup", notes: "CNCF Chennai Feb 2025" },
    { city: "Noida", country: "India", latitude: 28.5355, longitude: 77.3910, purpose: "meetup", notes: "CNCG Noida April 2025" },
    { city: "Hooghly", country: "India", latitude: 22.9086, longitude: 88.3960, purpose: "meetup", notes: "CNCF Hooghly March 2025" },
    { city: "Tokyo", country: "Japan", latitude: 35.6895, longitude: 139.6917, purpose: "vacation", notes: "DevRelCon Kaigi 2025" },
    { city: "Kyoto", country: "Japan", latitude: 35.0116, longitude: 135.7681, purpose: "vacation", notes: "Japan Trip 2025" },
    { city: "Osaka", country: "Japan", latitude: 34.6937, longitude: 135.5023, purpose: "vacation", notes: "Japan Trip 2025" },
    { city: "Singapore", country: "Singapore", latitude: 1.3521, longitude: 103.8198, purpose: "vacation", notes: "Singapore Trip 2025" },
    { city: "Dubai", country: "UAE", latitude: 25.2048, longitude: 55.2708, purpose: "vacation", notes: "UAE Trip 2025" },
    { city: "Abu Dhabi", country: "UAE", latitude: 24.4539, longitude: 54.3773, purpose: "vacation", notes: "UAE Trip 2024" },
    { city: "Kuala Lumpur", country: "Malaysia", latitude: 3.1390, longitude: 101.6869, purpose: "vacation", notes: "Malaysia Trip 2023" },
    { city: "Langkawi", country: "Malaysia", latitude: 6.3159, longitude: 99.8372, purpose: "vacation", notes: "Malaysia Trip 2024" },
    { city: "Kuala Lumpur", country: "Malaysia", latitude: 3.1390, longitude: 101.6869, purpose: "vacation", notes: "Malaysia Family Trip 2025" },
  ];

  for (const tr of travels) {
    await sql`
      INSERT INTO travels (city, country, latitude, longitude, purpose, notes)
      VALUES (${tr.city}, ${tr.country}, ${tr.latitude}, ${tr.longitude}, ${tr.purpose}, ${tr.notes})
      ON CONFLICT DO NOTHING
    `;
  }

  console.log(":: Seeding posts...");
  const posts = [
    {
      title: "Building a Node-Level Security Monitoring Pipeline in k8s",
      url: "https://sonichigo.hashnode.dev/building-a-node-level-security-monitoring-pipeline",
      source: "hashnode",
      published_at: "2025-05-11",
      excerpt: "Combining eBPF kprobes with Linux tools in a DaemonSet for end-to-end observability.",
      tags: ["kubernetes", "ebpf", "security"],
      is_featured: true,
    },
    {
      title: "How diffChangelog and Snapshots Work Together",
      url: "https://sonichigo.hashnode.dev/how-diffchangelog-and-snapshots-work-together",
      source: "hashnode",
      published_at: "2026-02-12",
      excerpt: "Schema drift, diffChangelog, and snapshot-based comparison for database DevOps.",
      tags: ["database", "devops", "liquibase"],
      is_featured: true,
    },
    {
      title: "Observability for Databases in CI/CD",
      url: "https://sonichigo.hashnode.dev/observability-for-databases-in-cicd",
      source: "hashnode",
      published_at: "2025-09-08",
      excerpt: "Why observability matters for databases and how to embed it into delivery workflows.",
      tags: ["database", "cicd", "observability"],
      is_featured: true,
    },
    {
      title: "How to Effectively Vet Your Supply Chain",
      url: "https://sonichigo.hashnode.dev/how-to-effectively-vet-your-supply-chain-for-optimal-performance",
      source: "hashnode",
      published_at: "2025-05-15",
      excerpt: "Using SafeDep's vet tool for policy-driven supply chain protection.",
      tags: ["security", "supply-chain", "open-source"],
    },
    {
      title: "The Marvelous Rise of AI Test Case Generation",
      url: "https://sonichigo.hashnode.dev/the-marvelous-rise-of-ai-test-case-generation",
      source: "hashnode",
      published_at: "2024-12-17",
      excerpt: "How AI is transforming test case generation for modern applications.",
      tags: ["ai", "testing", "automation"],
    },
    {
      title: "How GitHub Codespaces Enhances Developer Productivity",
      url: "https://sonichigo.hashnode.dev/how-github-codespaces-enhances-developer-productivity",
      source: "hashnode",
      published_at: "2024-12-16",
      excerpt: "Leveraging GitHub Codespaces for faster development workflows.",
      tags: ["github", "devtools", "productivity"],
    },
  ];

  for (const p of posts) {
    await sql`
      INSERT INTO posts (title, url, source, published_at, excerpt, tags, is_featured)
      VALUES (${p.title}, ${p.url}, ${p.source}, ${p.published_at}, ${p.excerpt},
              ${p.tags}, ${p.is_featured || false})
      ON CONFLICT (url) DO NOTHING
    `;
  }

  console.log(":: Seed complete!");
}

seed().catch(console.error);

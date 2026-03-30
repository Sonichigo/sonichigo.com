import { promises as fs } from "fs";
import path from "path";
import type { Talk, Travel } from "./types";

/**
 * Parse markdown files for talks and travels data
 */

const DATA_DIR = path.join(process.cwd(), "data");

/**
 * Extract metadata from markdown list format
 */
function parseMetadata(lines: string[]): Record<string, string> {
  const metadata: Record<string, string> = {};

  for (const line of lines) {
    const match = line.match(/^-\s+\*\*([^:]+):\*\*\s+(.+)$/);
    if (match) {
      const key = match[1].toLowerCase().replace(/\s+/g, "_");
      metadata[key] = match[2].trim();
    }
  }

  return metadata;
}

/**
 * Parse talks from markdown file
 */
export async function parseTalksMarkdown(): Promise<Talk[]> {
  try {
    const filepath = path.join(DATA_DIR, "talks.md");
    const content = await fs.readFile(filepath, "utf-8");

    const talks: Talk[] = [];
    const sections = content.split(/^## /m).filter((s) => s.trim());

    for (const section of sections) {
      const lines = section.split("\n");
      const title = lines[0].trim();

      // Skip example entries and non-talk sections
      if (
        title.toLowerCase().includes("example") ||
        title.toLowerCase().includes("format") ||
        title === "Talks & Events" ||
        !title
      ) {
        continue;
      }

      // Extract metadata lines
      const metadataLines = lines.filter((l) => l.startsWith("- **"));
      const metadata = parseMetadata(metadataLines);

      // Extract description (everything after metadata, before ---)
      const descStartIdx = lines.findIndex((l) => l.startsWith("- **")) + metadataLines.length;
      const descEndIdx = lines.findIndex((l, i) => i > descStartIdx && l.trim() === "---");
      const description = lines
        .slice(descStartIdx, descEndIdx > 0 ? descEndIdx : undefined)
        .join("\n")
        .trim();

      talks.push({
        id: talks.length + 1,
        title: title.replace(/^\[|\]$/g, ""),
        description: description || null,
        event_name: metadata.event || "",
        event_url: metadata.event_url || null,
        date: metadata.date || null,
        location: metadata.location || null,
        type: (metadata.type as any) || "speaker",
        image_url: metadata.image_url || null,
        video_url: metadata.video_url || null,
        slides_url: metadata.slides_url || null,
      });
    }

    return talks;
  } catch (error) {
    console.error("Error parsing talks markdown:", error);
    return [];
  }
}

/**
 * Parse travels from markdown file
 */
export async function parseTravelsMarkdown(): Promise<Travel[]> {
  try {
    const filepath = path.join(DATA_DIR, "travels.md");
    const content = await fs.readFile(filepath, "utf-8");

    const travels: Travel[] = [];
    const sections = content.split(/^## /m).filter((s) => s.trim());

    for (const section of sections) {
      const lines = section.split("\n");
      const title = lines[0].trim();

      // Skip example entries and non-travel sections
      if (
        title.toLowerCase().includes("example") ||
        title.toLowerCase().includes("format") ||
        title === "Travels" ||
        !title
      ) {
        continue;
      }

      // Parse city, country from title
      const [city, country] = title.split(",").map((s) => s.trim());

      // Extract metadata lines
      const metadataLines = lines.filter((l) => l.startsWith("- **"));
      const metadata = parseMetadata(metadataLines);

      // Extract notes (everything after metadata, before ---)
      const notesStartIdx = lines.findIndex((l) => l.startsWith("- **")) + metadataLines.length;
      const notesEndIdx = lines.findIndex((l, i) => i > notesStartIdx && l.trim() === "---");
      const notes = lines
        .slice(notesStartIdx, notesEndIdx > 0 ? notesEndIdx : undefined)
        .join("\n")
        .trim();

      travels.push({
        id: travels.length + 1,
        city: city || title,
        country: country || "",
        latitude: metadata.latitude ? parseFloat(metadata.latitude) : null,
        longitude: metadata.longitude ? parseFloat(metadata.longitude) : null,
        visited_date: metadata.date || null,
        purpose: (metadata.purpose as any) || "other",
        notes: notes || null,
        image_url: metadata.image_url || null,
      });
    }

    return travels;
  } catch (error) {
    console.error("Error parsing travels markdown:", error);
    return [];
  }
}

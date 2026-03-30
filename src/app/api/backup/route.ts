import { NextRequest, NextResponse } from "next/server";
import {
  generatePostsMarkdown,
  generateReposMarkdown,
  generateProfileMarkdown,
} from "@/lib/backup";
import { promises as fs } from "fs";
import path from "path";

const BACKUP_DIR = path.join(process.cwd(), "backups");

/**
 * POST: Save data as markdown backup
 */
export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    let markdown: string;
    let filename: string;
    const dateStr = new Date().toISOString().split("T")[0];

    switch (type) {
      case "posts":
        markdown = generatePostsMarkdown(data);
        filename = `posts-backup-${dateStr}.md`;
        break;

      case "repos":
        markdown = generateReposMarkdown(data);
        filename = `repos-backup-${dateStr}.md`;
        break;

      case "profile":
        markdown = generateProfileMarkdown(data);
        filename = `profile-backup-${dateStr}.md`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid backup type" },
          { status: 400 }
        );
    }

    // Ensure backup directory exists
    try {
      await fs.mkdir(BACKUP_DIR, { recursive: true });
    } catch (err) {
      // Directory might already exist, that's fine
    }

    // Write markdown file
    const filepath = path.join(BACKUP_DIR, filename);
    await fs.writeFile(filepath, markdown, "utf-8");

    return NextResponse.json({
      success: true,
      filename,
      size: markdown.length,
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Backup failed", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET: Download a specific backup file or list available backups
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (filename) {
      // Download specific file
      const filepath = path.join(BACKUP_DIR, filename);

      try {
        const content = await fs.readFile(filepath, "utf-8");
        return new NextResponse(content, {
          headers: {
            "Content-Type": "text/markdown",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      } catch {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
    } else {
      // List all backup files
      try {
        const files = await fs.readdir(BACKUP_DIR);
        const backups = files
          .filter((f) => f.endsWith(".md"))
          .map((f) => ({
            filename: f,
            url: `/api/backup?filename=${encodeURIComponent(f)}`,
          }));

        return NextResponse.json({ backups });
      } catch {
        return NextResponse.json({ backups: [] });
      }
    }
  } catch (error) {
    console.error("Backup fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch backups" },
      { status: 500 }
    );
  }
}

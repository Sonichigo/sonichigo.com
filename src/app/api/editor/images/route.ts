import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const IMAGES_DIR = path.join(process.cwd(), "public", "assets", "img", "blog-data");
const ALLOWED = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"]);

export async function GET() {
  try {
    const files = await fs.readdir(IMAGES_DIR);
    const images = files
      .filter((f) => ALLOWED.has(path.extname(f).toLowerCase()))
      .map((f) => ({ name: f, url: `/assets/img/blog-data/${f}` }));
    return NextResponse.json(images);
  } catch {
    return NextResponse.json([]);
  }
}

import { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import PostContent from "./PostContent";

const POSTS_DIR = path.join(process.cwd(), "data", "posts");

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  description?: string;
  keywords?: string[];
  tags: string[];
  content: string;
  tldr?: string[];
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString().split("T")[0],
      excerpt: data.excerpt || "",
      description: data.description || data.excerpt || "",
      keywords: data.keywords || [],
      tags: data.tags || [],
      content,
      tldr: data.tldr || [],
    };
  } catch (error) {
    console.error("Error reading post:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const ogImage = `/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent((post.description || post.excerpt).slice(0, 150))}&type=post`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `https://sonichigo.com/posts/${params.slug}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@sonichigo",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://sonichigo.com/posts/${params.slug}`,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return <PostContent post={post} />;
}

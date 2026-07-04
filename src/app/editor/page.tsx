"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  content: string;
}

interface BlogImage {
  name: string;
  url: string;
}

export default function EditorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [showImagePicker, setShowImagePicker] = useState(false);
  const [images, setImages] = useState<BlogImage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("editor_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadPosts();
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/editor/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (response.ok) {
      sessionStorage.setItem("editor_authenticated", "true");
      setIsAuthenticated(true);
      setAuthError("");
      loadPosts();
    } else {
      setAuthError("Invalid password");
    }
  };

  const loadPosts = async () => {
    try {
      const response = await fetch("/api/editor/posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  };

  const loadImages = async () => {
    try {
      const response = await fetch("/api/editor/images");
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Failed to load images:", error);
    }
  };

  const handleSelectPost = async (slug: string) => {
    try {
      const response = await fetch(`/api/editor/posts/${slug}`);
      const post = await response.json();
      setSelectedPost(slug);
      setIsNewPost(false);
      setTitle(post.title);
      setDate(post.date);
      setExcerpt(post.excerpt);
      setTags(post.tags.join(", "));
      setContent(post.content);
    } catch (error) {
      console.error("Failed to load post:", error);
    }
  };

  const handleNewPost = () => {
    setIsNewPost(true);
    setSelectedPost(null);
    setTitle("");
    setDate(new Date().toISOString().split("T")[0]);
    setExcerpt("");
    setTags("");
    setContent("");
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    const postData = {
      title,
      date,
      excerpt,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      content,
    };
    try {
      const url = selectedPost ? `/api/editor/posts/${selectedPost}` : "/api/editor/posts";
      const response = await fetch(url, {
        method: selectedPost ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      if (response.ok) {
        const result = await response.json();
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
        if (isNewPost) {
          setSelectedPost(result.slug);
          setIsNewPost(false);
        }
        loadPosts();
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Failed to save post:", error);
      setSaveStatus("error");
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const response = await fetch(`/api/editor/posts/${selectedPost}`, {
        method: "DELETE",
      });
      if (response.ok) {
        handleNewPost();
        loadPosts();
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const openImagePicker = async () => {
    if (images.length === 0) await loadImages();
    setShowImagePicker(true);
  };

  const insertImage = (img: BlogImage) => {
    const textarea = textareaRef.current;
    const markdown = `![${img.name}](${img.url})`;
    if (!textarea) {
      setContent((c) => c + "\n" + markdown);
    } else {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const next = content.slice(0, start) + markdown + content.slice(end);
      setContent(next);
      // restore cursor after inserted text
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + markdown.length, start + markdown.length);
      });
    }
    setShowImagePicker(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-md">
          <div className="card-base p-8">
            <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
              Editor Login
            </h1>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border outline-none font-mono"
                  style={{
                    background: "var(--bg-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Enter password"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-sm" style={{ color: "var(--accent-orange)" }}>
                  {authError}
                </p>
              )}
              <button
                type="submit"
                className="w-full px-4 py-2 rounded-md font-medium transition-colors"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="border-b px-6 py-4 flex flex-col gap-3" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Post Editor
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleNewPost}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors border"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              + New Post
            </button>
            {selectedPost && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ background: "var(--accent-orange-dim)", color: "var(--accent-orange)" }}
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                background: saveStatus === "saved" ? "var(--accent-green)" : "var(--accent)",
                color: "#fff",
              }}
            >
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Deployment Notice */}
        <div
          className="px-4 py-2 rounded-md text-xs flex items-start gap-2"
          style={{
            background: "var(--accent-green-dim)",
            border: "1px solid var(--accent-green)",
            color: "var(--text-secondary)",
          }}
        >
          <span style={{ color: "var(--accent-green)", fontWeight: "bold" }}>ℹ️</span>
          <div>
            <strong style={{ color: "var(--accent-green)" }}>Local Editor</strong>: Posts are saved to{" "}
            <code style={{ background: "var(--bg-secondary)", padding: "0.125rem 0.25rem", borderRadius: "0.25rem", fontFamily: "monospace" }}>
              data/posts/
            </code>
            . To publish: <strong>commit and push to GitHub</strong> - Vercel will auto-deploy.
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r overflow-y-auto" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
          <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--text-tertiary)" }}>
              Posts ({posts.length})
            </h2>
          </div>
          <div className="p-2">
            {posts.map((post) => (
              <button
                key={post.slug}
                onClick={() => handleSelectPost(post.slug)}
                className="w-full text-left px-3 py-2 rounded-md text-sm mb-1 transition-colors"
                style={{
                  background: selectedPost === post.slug ? "var(--accent-dim)" : "transparent",
                  color: selectedPost === post.slug ? "var(--accent)" : "var(--text-primary)",
                }}
              >
                <div className="font-medium truncate">{post.title}</div>
                <div className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  {new Date(post.date).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Metadata */}
          <div className="border-b p-4 space-y-3" style={{ borderColor: "var(--border)" }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full px-3 py-2 text-lg font-bold rounded-md border outline-none"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            <div className="flex gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-md border outline-none font-mono"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (comma separated)"
                className="flex-1 px-3 py-1.5 text-sm rounded-md border outline-none font-mono"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short excerpt"
              className="w-full px-3 py-1.5 text-sm rounded-md border outline-none"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Tabs + toolbar */}
          <div className="border-b flex items-center justify-between pr-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex">
              <button
                onClick={() => setActiveTab("edit")}
                className="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
                style={{
                  borderColor: activeTab === "edit" ? "var(--accent)" : "transparent",
                  color: activeTab === "edit" ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
                style={{
                  borderColor: activeTab === "preview" ? "var(--accent)" : "transparent",
                  color: activeTab === "preview" ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                Preview
              </button>
            </div>

            {activeTab === "edit" && (
              <button
                onClick={openImagePicker}
                title="Insert image"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Image
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto relative">
            {activeTab === "edit" ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content in Markdown..."
                className="w-full h-full p-6 resize-none outline-none font-mono text-sm leading-relaxed"
                style={{ background: "var(--bg)", color: "var(--text-primary)" }}
              />
            ) : (
              <div className="p-6 prose prose-sm max-w-none" style={{ color: "var(--text-primary)" }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content || "*No content yet*"}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image picker modal */}
      {showImagePicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowImagePicker(false)}
        >
          <div
            className="rounded-xl border w-full max-w-lg max-h-[70vh] flex flex-col"
            style={{ background: "var(--bg)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Insert Image
              </span>
              <button
                onClick={() => setShowImagePicker(false)}
                style={{ color: "var(--text-tertiary)" }}
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-4">
              {images.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: "var(--text-tertiary)" }}>
                  No images found in <code>public/assets/img/blog-data/</code>
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img) => (
                    <button
                      key={img.url}
                      onClick={() => insertImage(img)}
                      className="rounded-lg border overflow-hidden flex flex-col transition-colors hover:border-current"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-24 object-cover"
                        style={{ background: "var(--bg-secondary)" }}
                      />
                      <span
                        className="text-xs px-2 py-1 truncate w-full text-left"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {img.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}>
              Drop images into <code>public/assets/img/blog-data/</code> to add them here.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

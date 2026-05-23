"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const auth = sessionStorage.getItem("editor_authenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadPosts();
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple authentication - in production, use proper auth
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
      const url = selectedPost
        ? `/api/editor/posts/${selectedPost}`
        : "/api/editor/posts";

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
              style={{
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              + New Post
            </button>
            {selectedPost && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  background: "var(--accent-orange-dim)",
                  color: "var(--accent-orange)",
                }}
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
            color: "var(--text-secondary)"
          }}
        >
          <span style={{ color: "var(--accent-green)", fontWeight: "bold" }}>ℹ️</span>
          <div>
            <strong style={{ color: "var(--accent-green)" }}>Local Editor</strong>: Posts are saved to <code style={{ background: "var(--bg-secondary)", padding: "0.125rem 0.25rem", borderRadius: "0.25rem", fontFamily: "monospace" }}>data/posts/</code>.
            To publish: <strong>commit and push to GitHub</strong> - Vercel will auto-deploy.
            <a href="/DEPLOYMENT.md" target="_blank" className="underline ml-1" style={{ color: "var(--accent-green)" }}>Learn more</a>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className="w-64 border-r overflow-y-auto"
          style={{
            borderColor: "var(--border)",
            background: "var(--bg-secondary)",
          }}
        >
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
                className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 transition-colors ${
                  selectedPost === post.slug ? "font-medium" : ""
                }`}
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
              style={{
                background: "var(--bg-secondary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
            <div className="flex gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-md border outline-none font-mono"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (comma separated)"
                className="flex-1 px-3 py-1.5 text-sm rounded-md border outline-none font-mono"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short excerpt"
              className="w-full px-3 py-1.5 text-sm rounded-md border outline-none"
              style={{
                background: "var(--bg-secondary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Tabs */}
          <div className="border-b flex" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "edit" ? "font-bold" : ""
              }`}
              style={{
                borderColor: activeTab === "edit" ? "var(--accent)" : "transparent",
                color: activeTab === "edit" ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "preview" ? "font-bold" : ""
              }`}
              style={{
                borderColor: activeTab === "preview" ? "var(--accent)" : "transparent",
                color: activeTab === "preview" ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              Preview
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "edit" ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content in Markdown..."
                className="w-full h-full p-6 resize-none outline-none font-mono text-sm leading-relaxed"
                style={{
                  background: "var(--bg)",
                  color: "var(--text-primary)",
                }}
              />
            ) : (
              <div
                className="p-6 prose prose-sm max-w-none"
                style={{ color: "var(--text-primary)" }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content || "*No content yet*"}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

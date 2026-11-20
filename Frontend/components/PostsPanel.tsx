"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { api, errorMessage, PAGE_SIZE } from "@/lib/api";
import { ApiEnvelope, Meta, Post } from "@/lib/types";

interface AuthorFilter {
  id: string;
  name: string;
}

export default function PostsPanel() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // null shows the public feed; a value shows that author's posts
  const [author, setAuthor] = useState<AuthorFilter | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 0, limit: PAGE_SIZE, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const sentinel = useRef<HTMLDivElement | null>(null);

  const hasMore = posts.length < meta.total;

  // Fetches one page. Replace clears the list (used when the view changes).
  const fetchPage = useCallback(async (filter: AuthorFilter | null, page: number, replace: boolean) => {
    setLoading(true);
    try {
      const url = filter ? `/posts/user/${encodeURIComponent(filter.id)}` : "/posts";
      const { data } = await api.get<ApiEnvelope<Post[]>>(url, { params: { page, limit: PAGE_SIZE } });
      const pageMeta = data.meta ?? { page, limit: PAGE_SIZE, total: 0 };
      setMeta(pageMeta);
      setPosts((prev) => {
        if (replace) return data.result;
        // Skip duplicates in case new posts shifted the list while scrolling
        const seen = new Set(prev.map((p) => p._id));
        return [...prev, ...data.result.filter((p) => !seen.has(p._id))];
      });
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Start again from page 1 whenever the view changes
  useEffect(() => {
    fetchPage(author, 1, true);
  }, [author, fetchPage]);

  // Infinite scroll: when the bottom marker is visible, load the next page
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          fetchPage(author, meta.page + 1, false);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, author, meta.page, fetchPage]);

  const publish = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post("/posts", { title, body });
      setTitle("");
      setBody("");
      setNotice("Post published");
      setError("");
      // New posts appear at the top of the feed
      await fetchPage(author, 1, true);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const showAuthor = (post: Post) => {
    if (!post.user || !post.author) return;
    setNotice("");
    setAuthor({ id: post.user, name: post.author });
  };

  return (
    <section>
      <div className="card">
        <h2>Write a post</h2>
        <form onSubmit={publish} className="stack">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required maxLength={200} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" required maxLength={5000} />
          <button type="submit">Publish</button>
        </form>
      </div>

      <div className="row">
        <h2>{author ? `Posts by ${author.name}` : "All posts"}</h2>
        {author && (
          <button type="button" onClick={() => setAuthor(null)}>
            Show all posts
          </button>
        )}
      </div>

      {posts.length === 0 && !error && !loading && <p>{author ? "This user has no posts yet." : "No posts yet."}</p>}
      {posts.map((post) => (
        <article key={post._id} className="card">
          <strong>{post.title}</strong>
          <p className="pre">{post.body}</p>
          <small>
            by{" "}
            {post.user && post.author ? (
              <button type="button" className="link" onClick={() => showAuthor(post)}>
                {post.author}
              </button>
            ) : (
              "unknown"
            )}{" "}
            · {new Date(post.createdAt).toLocaleString()}
          </small>
        </article>
      ))}

      {/* Bottom marker: scrolling here loads the next page */}
      <div ref={sentinel} className="sentinel" />
      {loading && <p className="muted">Loading more posts…</p>}
      {!loading && hasMore && (
        <div className="row">
          <button type="button" onClick={() => fetchPage(author, meta.page + 1, false)}>
            Load more
          </button>
        </div>
      )}
      {!hasMore && posts.length > 0 && <p className="muted">You have reached the end.</p>}

      {notice && <p className="ok">{notice}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}

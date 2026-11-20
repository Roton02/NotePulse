"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, errorMessage, PAGE_SIZE } from "@/lib/api";
import { ApiEnvelope, Meta, Post } from "@/lib/types";
import Pager from "./Pager";

export default function PostsPanel() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [userId, setUserId] = useState("");
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: PAGE_SIZE, total: 0 });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(
    async (id: string, page: number) => {
      try {
        const { data } = await api.get<ApiEnvelope<Post[]>>(`/posts/user/${encodeURIComponent(id)}`, {
          params: { page, limit: PAGE_SIZE },
        });
        setPosts(data.result);
        if (data.meta) setMeta(data.meta);
        setError("");
      } catch (err) {
        setPosts([]);
        setError(errorMessage(err));
      }
    },
    []
  );

  useEffect(() => {
    if (viewUserId) load(viewUserId, 1);
  }, [viewUserId, load]);

  const publish = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post("/posts", { title, body });
      setTitle("");
      setBody("");
      setNotice("Post published");
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const showPosts = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNotice("");
    setViewUserId(userId.trim());
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

      <div className="card">
        <h2>Posts by user</h2>
        <form onSubmit={showPosts} className="row">
          <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" required />
          <button type="submit">Show posts</button>
        </form>
      </div>

      {viewUserId && (
        <>
          {posts.length === 0 && !error && <p>No posts for this user.</p>}
          {posts.map((post) => (
            <article key={post._id} className="card">
              <strong>{post.title}</strong>
              <p className="pre">{post.body}</p>
              <small>
                by {post.author ?? "unknown"} on {new Date(post.createdAt).toLocaleString()}
              </small>
            </article>
          ))}
          {posts.length > 0 && (
            <Pager page={meta.page} total={meta.total} onChange={(page) => load(viewUserId, page)} />
          )}
        </>
      )}

      {notice && <p className="ok">{notice}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}

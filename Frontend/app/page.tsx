"use client";

import { useEffect, useState } from "react";
import AdminPanel from "@/components/AdminPanel";
import AuthForm from "@/components/AuthForm";
import NotesPanel from "@/components/NotesPanel";
import PostsPanel from "@/components/PostsPanel";
import { api, tokenStore } from "@/lib/api";
import { ApiEnvelope, User } from "@/lib/types";

type Tab = "notes" | "posts" | "admin";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("notes");

  // Restore the session from a saved token, if the server still accepts it
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setChecking(false);
      return;
    }
    api
      .get<ApiEnvelope<User>>("/auth/me")
      .then(({ data }) => setUser(data.result))
      .catch(() => tokenStore.set(null))
      .finally(() => setChecking(false));
  }, []);

  const logout = () => {
    tokenStore.set(null);
    setUser(null);
    setTab("notes");
  };

  if (checking) {
    return (
      <main>
        <p>Loading…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main>
        <h1>NotePulse</h1>
        <AuthForm onLoggedIn={setUser} />
      </main>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <main>
      <header>
        <h1>NotePulse</h1>
        <span>
          {user.name} ({user.role})
        </span>
        <button type="button" onClick={logout}>
          Log out
        </button>
      </header>

      <nav className="tabs">
        <button type="button" className={tab === "notes" ? "active" : ""} onClick={() => setTab("notes")}>
          My notes
        </button>
        <button type="button" className={tab === "posts" ? "active" : ""} onClick={() => setTab("posts")}>
          Posts
        </button>
        {isAdmin && (
          <button type="button" className={tab === "admin" ? "active" : ""} onClick={() => setTab("admin")}>
            Admin
          </button>
        )}
      </nav>

      {tab === "notes" && <NotesPanel />}
      {tab === "posts" && <PostsPanel />}
      {tab === "admin" && isAdmin && <AdminPanel currentUserId={user._id} />}
    </main>
  );
}

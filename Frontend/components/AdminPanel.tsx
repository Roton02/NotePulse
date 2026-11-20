"use client";

import { useState } from "react";
import UsersSection from "./admin/UsersSection";
import NotesSection from "./admin/NotesSection";
import GroupsSection from "./admin/GroupsSection";

type Section = "users" | "notes" | "groups";

const SECTIONS: { key: Section; label: string }[] = [
  { key: "users", label: "Users" },
  { key: "notes", label: "All notes" },
  { key: "groups", label: "Interest groups" },
];

export default function AdminPanel({ currentUserId }: { currentUserId: string }) {
  const [section, setSection] = useState<Section>("users");

  return (
    <div className="admin">
      <nav className="admin-sidebar" aria-label="Admin sections">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={section === s.key ? "active" : ""}
            aria-current={section === s.key ? "page" : undefined}
            onClick={() => setSection(s.key)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="admin-content">
        {section === "users" && <UsersSection currentUserId={currentUserId} />}
        {section === "notes" && <NotesSection />}
        {section === "groups" && <GroupsSection />}
      </div>
    </div>
  );
}

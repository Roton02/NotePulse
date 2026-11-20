"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { usePagedList } from "@/lib/usePagedList";
import { User } from "@/lib/types";
import Pager from "@/components/Pager";
import UserForm from "./UserForm";

export default function UsersSection({ currentUserId }: { currentUserId: string }) {
  const { items, meta, loading, error, load, reload } = usePagedList<User>("/users");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const saved = (message: string) => {
    setNotice(message);
    setActionError("");
    closeForm();
    reload();
  };

  const remove = async (user: User) => {
    if (!window.confirm(`Delete ${user.email}? Their notes and posts stay in the database.`)) return;
    try {
      await api.delete(`/users/${user._id}`);
      setNotice("User deleted");
      setActionError("");
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  };

  return (
    <section>
      <div className="section-head">
        <h2>Users ({meta.total})</h2>
        {!formOpen && (
          <button type="button" onClick={openNew}>
            Add user
          </button>
        )}
      </div>

      {formOpen && <UserForm editing={editing} onSaved={saved} onCancel={closeForm} />}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Interests</th>
              <th>Joined</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {items.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td className="truncate" title={user.email}>
                  {user.email}
                </td>
                <td>
                  <span className={`badge ${user.role}`}>{user.role}</span>
                </td>
                <td>{(user.interests || []).join(", ") || "—"}</td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</td>
                <td className="actions">
                  <button type="button" onClick={() => openEdit(user)}>
                    Edit
                  </button>
                  <button type="button" disabled={user._id === currentUserId} onClick={() => remove(user)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  No users.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={meta.page} total={meta.total} onChange={load} />

      {notice && <p className="ok">{notice}</p>}
      {(error || actionError) && <p className="error">{error || actionError}</p>}
    </section>
  );
}

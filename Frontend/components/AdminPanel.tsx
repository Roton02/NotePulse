"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, errorMessage, PAGE_SIZE } from "@/lib/api";
import { ApiEnvelope, Group, Meta, Note, User } from "@/lib/types";
import Pager from "./Pager";

const emptyMeta: Meta = { page: 1, limit: PAGE_SIZE, total: 0 };

const parseList = (text: string) =>
  text.split(",").map((s) => s.trim()).filter(Boolean);

export default function AdminPanel({ currentUserId }: { currentUserId: string }) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [usersMeta, setUsersMeta] = useState<Meta>(emptyMeta);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "user", interests: "" });

  // All notes
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [notesMeta, setNotesMeta] = useState<Meta>(emptyMeta);

  // Interest groups
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsMeta, setGroupsMeta] = useState<Meta>(emptyMeta);

  const loadUsers = useCallback(async (page: number) => {
    try {
      const { data } = await api.get<ApiEnvelope<User[]>>("/users", { params: { page, limit: PAGE_SIZE } });
      setUsers(data.result);
      if (data.meta) setUsersMeta(data.meta);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  const loadNotes = useCallback(async (page: number) => {
    try {
      const { data } = await api.get<ApiEnvelope<Note[]>>("/notes/all", { params: { page, limit: PAGE_SIZE } });
      setAllNotes(data.result);
      if (data.meta) setNotesMeta(data.meta);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  const loadGroups = useCallback(async (page: number) => {
    try {
      const { data } = await api.get<ApiEnvelope<Group[]>>("/users/interests", { params: { page, limit: PAGE_SIZE } });
      setGroups(data.result);
      if (data.meta) setGroupsMeta(data.meta);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    loadUsers(1);
    loadNotes(1);
    loadGroups(1);
  }, [loadUsers, loadNotes, loadGroups]);

  const resetUserForm = () => {
    setEditingUser(null);
    setUserForm({ name: "", email: "", password: "", role: "user", interests: "" });
  };

  const startEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      interests: (user.interests || []).join(", "),
    });
  };

  const saveUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Send only what was filled in. An empty password keeps the current one.
        const body: Record<string, unknown> = { role: userForm.role };
        if (userForm.name) body.name = userForm.name;
        if (userForm.email) body.email = userForm.email;
        if (userForm.password) body.password = userForm.password;
        if (userForm.interests) body.interests = parseList(userForm.interests);
        await api.patch(`/users/${editingUser._id}`, body);
        setNotice("User updated");
      } else {
        await api.post("/users", {
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role,
          interests: parseList(userForm.interests),
        });
        setNotice("User created");
      }
      resetUserForm();
      setError("");
      await Promise.all([loadUsers(usersMeta.page), loadGroups(groupsMeta.page)]);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const removeUser = async (user: User) => {
    if (!window.confirm(`Delete ${user.email}?`)) return;
    try {
      await api.delete(`/users/${user._id}`);
      setNotice("User deleted");
      setError("");
      await Promise.all([loadUsers(usersMeta.page), loadGroups(groupsMeta.page)]);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <section>
      <h2>Users</h2>
      <div className="card">
        <h3>{editingUser ? `Edit ${editingUser.email}` : "Create user"}</h3>
        <form onSubmit={saveUser} className="stack">
          <input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} placeholder="Name" required={!editingUser} />
          <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="Email" required={!editingUser} />
          <input
            type="password"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            placeholder={editingUser ? "New password (leave blank to keep)" : "Password (8+ characters)"}
            required={!editingUser}
          />
          <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <input value={userForm.interests} onChange={(e) => setUserForm({ ...userForm, interests: e.target.value })} placeholder="Interests, comma separated" />
          <div className="row">
            <button type="submit">{editingUser ? "Save changes" : "Create user"}</button>
            {editingUser && (
              <button type="button" onClick={resetUserForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {users.map((user) => (
        <article key={user._id} className="card">
          <strong>
            {user.name} ({user.role})
          </strong>
          <small>
            {user.email} · id {user._id}
          </small>
          <p>Interests: {(user.interests || []).join(", ") || "none"}</p>
          <div className="row">
            <button type="button" onClick={() => startEditUser(user)}>
              Edit
            </button>
            <button type="button" disabled={user._id === currentUserId} onClick={() => removeUser(user)}>
              Delete
            </button>
          </div>
        </article>
      ))}
      <Pager page={usersMeta.page} total={usersMeta.total} onChange={loadUsers} />

      <h2>All notes</h2>
      {allNotes.length === 0 && <p>No notes.</p>}
      {allNotes.map((note) => (
        <article key={note._id} className="card">
          <strong>{note.title}</strong>
          <p className="pre">{note.content}</p>
          <small>
            Owner:{" "}
            {typeof note.owner === "object" ? `${note.owner.name} <${note.owner.email}>` : note.owner} ·{" "}
            {new Date(note.createdAt).toLocaleString()}
          </small>
        </article>
      ))}
      <Pager page={notesMeta.page} total={notesMeta.total} onChange={loadNotes} />

      <h2>Users by interest</h2>
      {groups.length === 0 && <p>No interests yet.</p>}
      {groups.map((group) => (
        <article key={group.interest} className="card">
          <strong>
            {group.interest} ({group.count})
          </strong>
          <p>{group.users.map((u) => u.name).join(", ")}</p>
        </article>
      ))}
      <Pager page={groupsMeta.page} total={groupsMeta.total} onChange={loadGroups} />

      {notice && <p className="ok">{notice}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}

"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, errorMessage, PAGE_SIZE } from "@/lib/api";
import { ApiEnvelope, Meta, Note } from "@/lib/types";
import Pager from "./Pager";

export default function NotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: PAGE_SIZE, total: 0 });
  const [editing, setEditing] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (page: number) => {
    try {
      const { data } = await api.get<ApiEnvelope<Note[]>>("/notes", { params: { page, limit: PAGE_SIZE } });
      setNotes(data.result);
      if (data.meta) setMeta(data.meta);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const reset = () => {
    setEditing(null);
    setTitle("");
    setContent("");
  };

  const startEdit = (note: Note) => {
    setEditing(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.patch(`/notes/${editing._id}`, { title, content });
        setNotice("Note updated");
      } else {
        await api.post("/notes", { title, content });
        setNotice("Note created");
      }
      reset();
      await load(meta.page);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const remove = async (note: Note) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api.delete(`/notes/${note._id}`);
      setNotice("Note deleted");
      await load(meta.page);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <section>
      <div className="card">
        <h2>{editing ? "Edit note" : "New note"}</h2>
        <form onSubmit={save} className="stack">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required maxLength={200} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" maxLength={10000} />
          <div className="row">
            <button type="submit">{editing ? "Save changes" : "Create note"}</button>
            {editing && (
              <button type="button" onClick={reset}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h2>My notes</h2>
      {notes.length === 0 && <p>No notes yet.</p>}
      {notes.map((note) => (
        <article key={note._id} className="card">
          <strong>{note.title}</strong>
          <p className="pre">{note.content}</p>
          <small>Updated {new Date(note.updatedAt).toLocaleString()}</small>
          <div className="row">
            <button type="button" onClick={() => startEdit(note)}>
              Edit
            </button>
            <button type="button" onClick={() => remove(note)}>
              Delete
            </button>
          </div>
        </article>
      ))}
      <Pager page={meta.page} total={meta.total} onChange={load} />

      {notice && <p className="ok">{notice}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}

"use client";

import { usePagedList } from "@/lib/usePagedList";
import { Note } from "@/lib/types";
import Pager from "@/components/Pager";

export default function NotesSection() {
  const { items, meta, loading, error, load } = usePagedList<Note>("/notes/all");

  return (
    <section>
      <div className="section-head">
        <h2>All notes ({meta.total})</h2>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Content</th>
              <th>Owner</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((note) => (
              <tr key={note._id}>
                <td>{note.title}</td>
                <td className="truncate" title={note.content}>
                  {note.content || "—"}
                </td>
                <td>
                  {typeof note.owner === "object" ? (
                    <>
                      {note.owner.name}
                      <br />
                      <small className="muted">{note.owner.email}</small>
                    </>
                  ) : (
                    <small className="muted">{note.owner}</small>
                  )}
                </td>
                <td>{new Date(note.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No notes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager page={meta.page} total={meta.total} onChange={load} />
      {error && <p className="error">{error}</p>}
    </section>
  );
}

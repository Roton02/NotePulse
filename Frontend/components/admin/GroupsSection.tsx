"use client";

import { usePagedList } from "@/lib/usePagedList";
import { Group } from "@/lib/types";
import Pager from "@/components/Pager";

export default function GroupsSection() {
  const { items, meta, loading, error, load } = usePagedList<Group>("/users/interests");

  return (
    <section>
      <div className="section-head">
        <h2>Interest groups ({meta.total})</h2>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Interest</th>
              <th>Users</th>
              <th>Members</th>
            </tr>
          </thead>
          <tbody>
            {items.map((group) => (
              <tr key={group.interest}>
                <td>
                  <strong>{group.interest}</strong>
                </td>
                <td>{group.count}</td>
                <td>{group.users.map((u) => u.name).join(", ")}</td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={3} className="muted">
                  No interests yet.
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

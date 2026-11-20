"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { ApiEnvelope, User } from "@/lib/types";

interface UserFormProps {
  editing: User | null;
  onSaved: (message: string) => void;
  onCancel: () => void;
}

export default function UserForm({ editing, onSaved, onCancel }: UserFormProps) {
  const [form, setForm] = useState({
    name: editing?.name ?? "",
    email: editing?.email ?? "",
    password: "",
    role: editing?.role ?? "user",
  });
  // Fixed choices from the server. When editing, a user's older free-text interests are
  // shown too, so they can be unchecked.
  const [options, setOptions] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[]>(editing?.interests ?? []);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<ApiEnvelope<string[]>>("/auth/interests")
      .then(({ data }) => {
        const extra = (editing?.interests ?? []).filter((i) => !data.result.includes(i));
        setOptions([...data.result, ...extra]);
      })
      .catch(() => setOptions(editing?.interests ?? []));
  }, [editing]);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value });

  const toggle = (interest: string) =>
    setChosen((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (editing) {
        // Send only what was filled in. An empty password keeps the current one.
        const body: Record<string, unknown> = { role: form.role, interests: chosen };
        if (form.name) body.name = form.name;
        if (form.email) body.email = form.email;
        if (form.password) body.password = form.password;
        await api.patch(`/users/${editing._id}`, body);
        onSaved("User updated");
      } else {
        await api.post("/users", {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          interests: chosen,
        });
        onSaved("User created");
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card user-form">
      <h3>{editing ? `Edit ${editing.email}` : "Add a user"}</h3>
      <div className="form-grid">
        <label>
          Name
          <input value={form.name} onChange={set("name")} required={!editing} />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={set("email")} required={!editing} />
        </label>
        <label>
          {editing ? "New password (optional)" : "Password (8+ characters)"}
          <input
            type="password"
            value={form.password}
            onChange={set("password")}
            required={!editing}
            minLength={editing ? undefined : 8}
          />
        </label>
        <label>
          Role
          <select value={form.role} onChange={set("role")}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <fieldset className="interests span-2">
          <legend>Interests</legend>
          <div className="chips">
            {options.map((interest) => (
              <label key={interest} className={chosen.includes(interest) ? "chip on" : "chip"}>
                <input type="checkbox" checked={chosen.includes(interest)} onChange={() => toggle(interest)} />
                {interest}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="row">
        <button type="submit" disabled={busy}>
          {editing ? "Save changes" : "Create user"}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

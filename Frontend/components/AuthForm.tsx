"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, errorMessage, tokenStore } from "@/lib/api";
import { ApiEnvelope, User } from "@/lib/types";

interface AuthResult {
  user: User;
  token: string;
}

export default function AuthForm({ onLoggedIn }: { onLoggedIn: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // The interest options come from the server, so the form always matches the backend
  const [options, setOptions] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);

  useEffect(() => {
    api
      .get<ApiEnvelope<string[]>>("/auth/interests")
      .then(({ data }) => setOptions(data.result))
      .catch(() => setOptions([]));
  }, []);

  const toggle = (interest: string) =>
    setChosen((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const body =
        mode === "login"
          ? { email: form.get("email"), password: form.get("password") }
          : {
              name: form.get("name"),
              email: form.get("email"),
              password: form.get("password"),
              interests: chosen,
            };
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post<ApiEnvelope<AuthResult>>(path, body);
      tokenStore.set(data.result.token);
      onLoggedIn(data.result.user);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card narrow">
      <h2>{mode === "login" ? "Log in" : "Create account"}</h2>
      <form onSubmit={submit} className="stack">
        {mode === "register" && <input name="name" placeholder="Name" required />}
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required minLength={mode === "register" ? 8 : 1} />

        {mode === "register" && (
          <fieldset className="interests">
            <legend>Your interests (pick any)</legend>
            <div className="chips">
              {options.map((interest) => (
                <label key={interest} className={chosen.includes(interest) ? "chip on" : "chip"}>
                  <input type="checkbox" checked={chosen.includes(interest)} onChange={() => toggle(interest)} />
                  {interest}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <button type="submit" disabled={busy}>
          {mode === "login" ? "Log in" : "Register"}
        </button>
      </form>
      <button type="button" className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "No account? Register" : "Have an account? Log in"}
      </button>
      {error && <p className="error">{error}</p>}
    </section>
  );
}

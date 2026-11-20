export type Role = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  interests: string[];
  createdAt?: string;
}

export interface Note {
  _id: string;
  owner: string | { _id: string; name: string; email: string };
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  // Author's user id (present on feed and author listings)
  user?: string;
  title: string;
  body: string;
  // Author's name, or null if the author account was deleted
  author: string | null;
  createdAt: string;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
}

// One row of the admin "users by interest" view
export interface Group {
  interest: string;
  count: number;
  users: { _id: string; name: string; email: string }[];
}

// Every backend response has this shape
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  meta: Meta | null;
  result: T;
}

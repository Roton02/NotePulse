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
  title: string;
  body: string;
  author: string | null;
  createdAt: string;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
}

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

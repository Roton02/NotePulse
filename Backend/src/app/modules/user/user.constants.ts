// The only interests a user can choose. Keeping this fixed keeps the interest groups clean.
export const INTERESTS = [
  "chess",
  "reading",
  "music",
  "sports",
  "travel",
  "cooking",
  "gaming",
  "art",
  "coding",
  "movies",
] as const;

export type Interest = (typeof INTERESTS)[number];

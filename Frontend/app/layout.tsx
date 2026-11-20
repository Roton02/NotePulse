import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "NotePulse",
  description: "Secure note-taking with posts and admin tools",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

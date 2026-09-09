import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tony Consults Platform",
  description: "A digital systems studio for web, audio, automotive and practical technology.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

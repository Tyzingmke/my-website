import type { Metadata } from "next";
import "./globals.css";
import { PlatformTransition } from "@/components/PlatformTransition";

export const metadata: Metadata = {
  title: "Tony Consults Platform",
  description: "A digital systems studio for web, audio, automotive and practical technology.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PlatformTransition>{children}</PlatformTransition></body></html>;
}

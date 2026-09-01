import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A private note",
  description: "",
  robots: { index: false, follow: false, nocache: true },
};

export default function NicheLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

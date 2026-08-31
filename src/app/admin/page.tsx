import type { Metadata } from "next";
import { AdminStudio } from "@/components/admin/AdminStudio";
import "./studio.css";

export const metadata: Metadata = {
  title: "Studio",
  description: "Private Tony Consults content and operations studio.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return <AdminStudio />;
}

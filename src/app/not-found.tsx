import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="not-found">
      <p className="eyebrow">404 / Wrong turn</p>
      <h1>This page has<br />moved on.</h1>
      <Link className="button button-acid" href="/"><ArrowLeft size={18} />Back home</Link>
    </section>
  );
}

import Link from "next/link";
import { Mail } from "lucide-react";
import { profile } from "@/data/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <div>
          <strong>{profile.brand}</strong>
          <p className="muted">Static websites, catalogues and portfolios built for practical growth.</p>
        </div>
        <Link className="button" href={`mailto:${profile.email}`}>
          <Mail size={16} /> {profile.email}
        </Link>
      </div>
    </footer>
  );
}

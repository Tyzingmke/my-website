import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { nav, profile } from "@/data/site";

export function Header() {
  return (
    <header className="nav">
      <div className="shell nav-inner">
        <Link className="brand" href="/">
          {profile.brand}
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="button dark" href="/contact/">
            Start <ArrowUpRight size={16} />
          </Link>
        </nav>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const quotes = [
  "Make it clear enough to use and strong enough to last.",
  "Good systems make the next action obvious.",
  "A useful thing should keep working after the excitement passes.",
  "Start with the real problem. Build from there.",
];

export function PlatformTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [moving, setMoving] = useState(false);
  const quote = quotes[Math.abs(pathname.split("").reduce((value, char) => value + char.charCodeAt(0), 0)) % quotes.length];

  useEffect(() => { const timer = window.setTimeout(() => setVisible(false), 680); return () => window.clearTimeout(timer); }, []);
  useEffect(() => {
    const begin = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!target || target.target || event.metaKey || event.ctrlKey || target.origin !== window.location.origin || target.hash || target.pathname === window.location.pathname) return;
      setMoving(true);
    };
    document.addEventListener("click", begin);
    return () => document.removeEventListener("click", begin);
  }, []);

  return <><div className={`platform-transition ${visible || moving ? "show" : ""}`} aria-hidden="true"><div><span>TC</span><p>{quote}</p><i /></div></div>{children}</>;
}

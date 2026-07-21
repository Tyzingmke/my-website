"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, House, Layers3, Mail, Menu, UserRound, X } from "lucide-react";
import { nav, profile } from "@/data/site";

const dockIcons = {
  "/": House,
  "/work/": BriefcaseBusiness,
  "/services/": Layers3,
  "/about/": UserRound,
  "/contact/": Mail,
};

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const home = pathname === "/";

  useEffect(() => {
    const closeWhenDocked = (event: Event) => {
      if ((event as CustomEvent<{ docked: boolean }>).detail.docked) setOpen(false);
    };
    window.addEventListener("header-dock-change", closeWhenDocked);
    return () => window.removeEventListener("header-dock-change", closeWhenDocked);
  }, []);

  return (
    <header className={home ? "site-header site-header-home" : "site-header"} data-site-header data-home-header={home ? "" : undefined}>
      <div className="topbar-shell" data-header-top>
        <Link className="header-brand" href="/" aria-label="Antony Mburu home" onClick={() => setOpen(false)}>
          <strong>ANTONY</strong><span>MBURU</span>
        </Link>

        <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={20} /> : <Menu size={20} />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>

        <nav className={open ? "header-nav is-open" : "header-nav"} id="site-menu" aria-label="Primary navigation">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.replace(/\/$/, ""));
            return <Link className={active ? "is-active" : ""} href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</Link>;
          })}
        </nav>

        <Link className="header-contact" href="/contact/" onClick={() => setOpen(false)}>
          Let&apos;s talk <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="home-dock-shell" data-header-dock aria-hidden="true">
          <Link className="dock-brand" href="/" aria-label="Antony Mburu home">
            <strong>ANTONY</strong><span>MBURU</span>
          </Link>
          <p className="dock-intro">Website design and practical static web systems for businesses ready to look credible online.</p>
          <nav className="dock-nav" aria-label="Side navigation">
            {nav.map((item) => {
              const Icon = dockIcons[item.href as keyof typeof dockIcons];
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.replace(/\/$/, ""));
              return <Link className={active ? "is-active" : ""} href={item.href} key={item.href} onClick={() => setOpen(false)}>{Icon ? <Icon size={16} /> : null}<span>{item.label}</span></Link>;
            })}
          </nav>
          <div className="dock-tools" aria-label="Working tools">
            <div className="dock-tools-track">
              {["NEXT.JS", "GSAP", "GITHUB", "HTML", "CSS", "FIGMA", "NEXT.JS", "GSAP", "GITHUB", "HTML", "CSS", "FIGMA"].map((tool, index) => <span key={`${tool}-${index}`}>{tool}</span>)}
            </div>
          </div>
          <a className="dock-email" href={`mailto:${profile.email}`}><Mail size={15} /><span>{profile.email}</span></a>
          <Link className="dock-cta" href="/contact/">Start a project <ArrowUpRight size={16} /></Link>
        </div>
    </header>
  );
}

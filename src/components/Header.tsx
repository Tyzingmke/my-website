"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, Handshake, House, Layers3, Mail, Menu, UserRound, X } from "lucide-react";
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
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const closeTimer = useRef<number | null>(null);
  const home = pathname === "/";

  const closeMenu = useCallback((animate = false) => {
    if (animate && closingRef.current) return;
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (!animate) {
      closingRef.current = false;
      setClosing(false);
      setOpen(false);
      return;
    }
    closingRef.current = true;
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      closingRef.current = false;
      closeTimer.current = null;
    }, 230);
  }, []);

  useEffect(() => {
    const closeWhenDocked = (event: Event) => {
      if ((event as CustomEvent<{ docked: boolean }>).detail.docked) closeMenu(true);
    };
    window.addEventListener("header-dock-change", closeWhenDocked);
    return () => {
      window.removeEventListener("header-dock-change", closeWhenDocked);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, [closeMenu]);

  useEffect(() => {
    if (!open) return;
    const startY = window.scrollY;
    const closeOnScroll = () => {
      if (Math.abs(window.scrollY - startY) > 8) closeMenu(true);
    };
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, [closeMenu, open]);

  const toggleMenu = () => {
    if (open) {
      closeMenu(true);
      return;
    }
    closingRef.current = false;
    setClosing(false);
    setOpen(true);
  };

  return (
    <header className={home ? "site-header site-header-home" : "site-header"} data-site-header data-home-header={home ? "" : undefined}>
      <div className="topbar-shell" data-header-top>
        <Link className="header-brand" data-header-transfer="brand" href="/" aria-label="Antony Mburu home" onClick={() => closeMenu()}>
          <strong>ANTONY</strong><span>MBURU</span>
        </Link>

        <button className="menu-toggle" data-menu-toggle type="button" aria-expanded={open} aria-controls="site-menu" onClick={toggleMenu}>
          {open ? <X size={20} /> : <Menu size={20} />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>

        <nav className={open ? `header-nav is-open${closing ? " is-closing" : ""}` : "header-nav"} id="site-menu" aria-label="Primary navigation">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.replace(/\/$/, ""));
            return <Link className={active ? "is-active" : ""} data-header-transfer={item.href} href={item.href} key={item.href} onClick={() => closeMenu()}>{item.label}</Link>;
          })}
        </nav>

        <Link className="header-contact" href="/contact/" onClick={() => closeMenu()}>
          Let&apos;s talk <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="home-dock-shell" data-header-dock aria-hidden="true">
          <Link className="dock-brand" data-dock-transfer="brand" href="/" aria-label="Antony Mburu home">
            <strong>ANTONY</strong><span>MBURU</span>
          </Link>
          <p className="dock-intro">Website design and practical static web systems for businesses ready to look credible online.</p>
          <nav className="dock-nav" aria-label="Side navigation">
            {nav.map((item) => {
              const Icon = dockIcons[item.href as keyof typeof dockIcons];
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.replace(/\/$/, ""));
              return (
                <Link className={active ? "is-active" : ""} data-dock-transfer={item.href} href={item.href} key={item.href} onClick={() => closeMenu()}>
                  {Icon ? <Icon size={16} /> : null}
                  <span className="dock-label-full">{item.label}</span>
                  <span className="dock-label-short">{item.shortLabel}</span>
                </Link>
              );
            })}
          </nav>
          <div className="dock-tools" aria-label="Working tools">
            <div className="dock-tools-track">
              {["NEXT.JS", "GSAP", "GITHUB", "HTML", "CSS", "FIGMA", "NEXT.JS", "GSAP", "GITHUB", "HTML", "CSS", "FIGMA"].map((tool, index) => <span key={`${tool}-${index}`}>{tool}</span>)}
            </div>
          </div>
          <a className="dock-email" href={`mailto:${profile.email}`}><Mail size={15} /><span>{profile.email}</span></a>
          <div className="dock-actions">
            <Link className="dock-action dock-action-primary" data-dock-action="book" href="/contact/" title="Book a call">
              <CalendarDays size={15} /><span>Book a call</span>
            </Link>
            <a className="dock-action" data-dock-action="hire" href={`mailto:${profile.email}?subject=Project enquiry`} title="Hire Antony">
              <Handshake size={15} /><span>Hire me</span>
            </a>
          </div>
        </div>
    </header>
  );
}

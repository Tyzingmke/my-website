"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, Handshake, House, Layers3, Mail, Menu, Moon, Sun, UserRound, X } from "lucide-react";
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
  const topbarRef = useRef<HTMLDivElement>(null);
  const home = pathname === "/";

  const applyTheme = useCallback((nextTheme: "light" | "dark", persist = true) => {
    const root = document.documentElement;
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute("content", nextTheme === "dark" ? "#1d1e2c" : "#f4ecd6");
    if (persist) {
      try {
        localStorage.setItem("antony-theme", nextTheme);
      } catch {
        // The active theme still works when browser storage is unavailable.
      }
    }
    window.dispatchEvent(new CustomEvent("site-theme-change", { detail: { theme: nextTheme } }));
  }, []);

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
    const preference = matchMedia("(prefers-color-scheme: dark)");
    const onPreferenceChange = (event: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem("antony-theme")) return;
      } catch {
        // Follow the system preference if storage cannot be read.
      }
      applyTheme(event.matches ? "dark" : "light", false);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "antony-theme" && (event.newValue === "light" || event.newValue === "dark")) {
        applyTheme(event.newValue, false);
      }
    };
    if (typeof preference.addEventListener === "function") {
      preference.addEventListener("change", onPreferenceChange);
    } else {
      preference.addListener(onPreferenceChange);
    }
    window.addEventListener("storage", onStorage);
    return () => {
      if (typeof preference.removeEventListener === "function") {
        preference.removeEventListener("change", onPreferenceChange);
      } else {
        preference.removeListener(onPreferenceChange);
      }
      window.removeEventListener("storage", onStorage);
    };
  }, [applyTheme]);

  useEffect(() => {
    if (!open) return;
    const startY = window.scrollY;
    const closeOnScroll = () => {
      if (Math.abs(window.scrollY - startY) > 8) closeMenu(true);
    };
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, [closeMenu, open]);

  useEffect(() => {
    closeMenu(false);
  }, [closeMenu, pathname]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!topbarRef.current?.contains(event.target as Node)) closeMenu(true);
    };
    const closeWithKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu(true);
    };
    const closeOnResize = () => {
      if (window.innerWidth > 900) closeMenu(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithKeyboard);
    window.addEventListener("resize", closeOnResize, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithKeyboard);
      window.removeEventListener("resize", closeOnResize);
    };
  }, [closeMenu, open]);

  useEffect(() => {
    const resetMenu = () => closeMenu(false);
    window.addEventListener("pagehide", resetMenu);
    window.addEventListener("pageshow", resetMenu);
    return () => {
      window.removeEventListener("pagehide", resetMenu);
      window.removeEventListener("pageshow", resetMenu);
    };
  }, [closeMenu]);

  const toggleMenu = () => {
    if (open) {
      closeMenu(true);
      return;
    }
    closingRef.current = false;
    setClosing(false);
    setOpen(true);
  };

  const toggleTheme = () => applyTheme(
    document.documentElement.dataset.theme === "dark" ? "light" : "dark",
  );

  const themeButton = (placement: "top" | "dock") => (
    <button
      className={`theme-toggle theme-toggle-${placement}`}
      data-dock-theme={placement === "dock" ? "" : undefined}
      type="button"
      aria-label="Toggle color theme"
      title="Toggle color theme"
      onClick={toggleTheme}
    >
      <Sun className="theme-icon theme-icon-sun" size={16} aria-hidden="true" />
      <Moon className="theme-icon theme-icon-moon" size={16} aria-hidden="true" />
    </button>
  );

  return (
    <header className={home ? "site-header site-header-home" : "site-header"} data-site-header data-home-header={home ? "" : undefined}>
      <div className="topbar-shell" data-header-top ref={topbarRef}>
        <Link className="header-brand" data-header-transfer="brand" href="/" aria-label="Antony Mburu home" onClick={() => closeMenu()}>
          <strong>ANTONY</strong><span>MBURU</span>
        </Link>

        {themeButton("top")}

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
          {themeButton("dock")}
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

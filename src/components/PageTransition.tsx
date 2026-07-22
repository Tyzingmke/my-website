"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

const transitionQuotes: Record<string, string> = {
  "/": "Good ideas deserve a clear home.",
  "/work/": "Useful work should speak plainly.",
  "/services/": "Clarity turns plans into progress.",
  "/about/": "Every system starts with curiosity.",
  "/contact/": "A useful conversation starts here.",
};

const quoteForPath = (path: string) => transitionQuotes[path.endsWith("/") ? path : `${path}/`] ?? "Build clearly. Move with purpose.";

export function PageTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const previousPath = useRef(pathname);
  const transitionActive = useRef(false);
  const transitionFrame = useRef(0);
  const previousOverflow = useRef("");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const lockPage = () => {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.dataset.pageTransition = "active";
  };

  const finishTransition = () => {
    transitionActive.current = false;
    delete document.documentElement.dataset.pageTransition;
    if (document.documentElement.dataset.homeIntro !== "playing") {
      document.body.style.overflow = previousOverflow.current;
    }
  };

  useEffect(() => {
    const handleInternalLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
        || transitionActive.current
      ) return;

      const target = event.target as Element | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

      const routePathname = basePath && destination.pathname.startsWith(`${basePath}/`)
        ? destination.pathname.slice(basePath.length)
        : destination.pathname;
      const routeHref = `${routePathname || "/"}${destination.search}${destination.hash}`;

      event.preventDefault();
      event.stopPropagation();

      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(routeHref);
        return;
      }

      transitionActive.current = true;
      transitionFrame.current = requestAnimationFrame(() => {
        transitionFrame.current = 0;
        const overlay = overlayRef.current;
        const left = leftRef.current;
        const right = rightRef.current;
        const loader = loaderRef.current;
        const quote = quoteRef.current;
        const tiles = Array.from(overlay?.querySelectorAll<HTMLElement>("[data-page-transition-tile]") ?? [])
          .filter((tile) => getComputedStyle(tile).display !== "none");
        const trails = tiles.flatMap((tile) => Array.from(tile.querySelectorAll<HTMLElement>("[data-page-transition-trail]")));
        if (!overlay || !left || !right || !loader || !quote) {
          transitionActive.current = false;
          router.push(routeHref);
          return;
        }

        quote.textContent = quoteForPath(routePathname || "/");
        lockPage();
        gsap.killTweensOf([overlay, left, right, loader, quote, ...tiles, ...trails]);
        gsap.set(overlay, { autoAlpha: 1, pointerEvents: "auto" });
        gsap.set(left, { xPercent: -101 });
        gsap.set(right, { xPercent: 101 });
        gsap.set(loader, { autoAlpha: 0, scale: 0.74, rotation: 0 });
        gsap.set(quote, { autoAlpha: 0, y: 14 });
        gsap.set(tiles, { scaleY: 0, transformOrigin: (index) => index % 2 ? "center bottom" : "center top" });
        gsap.set(trails, { autoAlpha: 0, yPercent: -180 });

        gsap.timeline({
          defaults: { ease: "power4.inOut" },
          onComplete: () => router.push(routeHref),
        })
          .to([left, right], { xPercent: 0, duration: 0.46 }, 0)
          .to(tiles, { scaleY: 1, duration: 0.4, stagger: { each: 0.016, from: "start" }, ease: "power3.inOut" }, 0.03)
          .to(trails, { autoAlpha: 0.9, yPercent: 520, duration: 0.54, stagger: { each: 0.014, from: "start" }, ease: "power2.inOut" }, 0.08)
          .to(loader, { autoAlpha: 1, scale: 1, rotation: 270, duration: 0.58, ease: "power3.out" }, 0.2)
          .to(quote, { autoAlpha: 1, y: 0, duration: 0.34, ease: "power2.out" }, 0.27);
      });
    };

    document.addEventListener("click", handleInternalLink, true);
    return () => {
      document.removeEventListener("click", handleInternalLink, true);
      if (transitionFrame.current) cancelAnimationFrame(transitionFrame.current);
    };
  }, [router]);

  useLayoutEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    const overlay = overlayRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const loader = loaderRef.current;
    const quote = quoteRef.current;
    const tiles = Array.from(overlay?.querySelectorAll<HTMLElement>("[data-page-transition-tile]") ?? [])
      .filter((tile) => getComputedStyle(tile).display !== "none");
    const trails = tiles.flatMap((tile) => Array.from(tile.querySelectorAll<HTMLElement>("[data-page-transition-trail]")));
    if (!overlay || !left || !right || !loader || !quote) return;

    quote.textContent = quoteForPath(pathname || "/");

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
      finishTransition();
      return;
    }

    const reveal = () => {
      gsap.timeline({
        defaults: { ease: "power4.inOut" },
        onComplete: () => {
          gsap.set(overlay, { autoAlpha: 0, pointerEvents: "none" });
          finishTransition();
        },
      })
        .to(loader, { rotation: "+=210", duration: 0.48, ease: "power2.inOut" }, 0)
        .to(quote, { autoAlpha: 0, y: -10, duration: 0.24, ease: "power2.in" }, 0)
        .to(trails, { yPercent: -180, autoAlpha: 0, duration: 0.42, stagger: { each: 0.012, from: "end" } }, 0.06)
        .to(tiles, { scaleY: 0, duration: 0.38, stagger: { each: 0.012, from: "end" }, ease: "power3.inOut" }, 0.12)
        .to(left, { xPercent: -101, duration: 0.58 }, 0.25)
        .to(right, { xPercent: 101, duration: 0.58 }, 0.25)
        .to(loader, { autoAlpha: 0, scale: 0.82, duration: 0.28 }, 0.26);
    };

    if (transitionActive.current) {
      window.setTimeout(reveal, 150);
      return;
    }

    transitionActive.current = true;
    lockPage();
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: "auto" });
    gsap.set(left, { xPercent: -101 });
    gsap.set(right, { xPercent: 101 });
    gsap.set(loader, { autoAlpha: 1, scale: 0.82, rotation: 0 });
    gsap.set(quote, { autoAlpha: 0, y: 14 });
    gsap.set(tiles, { scaleY: 0, transformOrigin: (index) => index % 2 ? "center bottom" : "center top" });
    gsap.set(trails, { autoAlpha: 0, yPercent: -180 });
    gsap.timeline({ defaults: { ease: "power4.inOut" }, onComplete: reveal })
      .to([left, right], { xPercent: 0, duration: 0.34 }, 0)
      .to(tiles, { scaleY: 1, duration: 0.3, stagger: { each: 0.01, from: "start" } }, 0.02)
      .to(trails, { autoAlpha: 0.9, yPercent: 520, duration: 0.5, stagger: { each: 0.012, from: "start" } }, 0.06)
      .to(loader, { rotation: 160, scale: 1, duration: 0.4 }, 0.08)
      .to(quote, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.16);
  }, [pathname]);

  return (
    <div className="page-transition" ref={overlayRef} aria-live="polite" aria-label="Loading page">
      <div className="page-transition-panel page-transition-left" ref={leftRef} />
      <div className="page-transition-panel page-transition-right" ref={rightRef} />
      <div className="page-transition-tiles" aria-hidden="true">
        {Array.from({ length: 48 }, (_, index) => <span data-page-transition-tile key={index}><i data-page-transition-trail /></span>)}
      </div>
      <div className="page-transition-loader" ref={loaderRef} aria-hidden="true">
        <span>AM</span>
      </div>
      <p className="page-transition-quote" ref={quoteRef}>Build clearly. Move with purpose.</p>
    </div>
  );
}

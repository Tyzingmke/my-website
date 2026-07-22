"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

export function PageTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const previousPath = useRef(pathname);
  const transitionActive = useRef(false);
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

      const overlay = overlayRef.current;
      const left = leftRef.current;
      const right = rightRef.current;
      const loader = loaderRef.current;
      const tiles = Array.from(overlay?.querySelectorAll<HTMLElement>("[data-page-transition-tile]") ?? []);
      if (!overlay || !left || !right || !loader || matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(routeHref);
        return;
      }

      transitionActive.current = true;
      lockPage();
      gsap.killTweensOf([overlay, left, right, loader, ...tiles]);
      gsap.set(overlay, { autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(left, { xPercent: -101 });
      gsap.set(right, { xPercent: 101 });
      gsap.set(loader, { autoAlpha: 0, scale: 0.74, rotation: 0 });
      gsap.set(tiles, { scaleY: 0, transformOrigin: (index) => index % 2 ? "center bottom" : "center top" });

      gsap.timeline({
        defaults: { ease: "power4.inOut" },
        onComplete: () => router.push(routeHref),
      })
        .to([left, right], { xPercent: 0, duration: 0.46 }, 0)
        .to(tiles, { scaleY: 1, duration: 0.34, stagger: { each: 0.012, grid: [5, 6], from: "start" }, ease: "power3.inOut" }, 0.04)
        .to(loader, { autoAlpha: 1, scale: 1, rotation: 270, duration: 0.58, ease: "power3.out" }, 0.2);
    };

    document.addEventListener("click", handleInternalLink, true);
    return () => document.removeEventListener("click", handleInternalLink, true);
  }, [router]);

  useLayoutEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    const overlay = overlayRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const loader = loaderRef.current;
    const tiles = Array.from(overlay?.querySelectorAll<HTMLElement>("[data-page-transition-tile]") ?? []);
    if (!overlay || !left || !right || !loader) return;

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
        .to(tiles, { scaleY: 0, duration: 0.38, stagger: { each: 0.012, grid: [5, 6], from: "end" }, ease: "power3.inOut" }, 0.12)
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
    gsap.set(tiles, { scaleY: 0, transformOrigin: (index) => index % 2 ? "center bottom" : "center top" });
    gsap.timeline({ defaults: { ease: "power4.inOut" }, onComplete: reveal })
      .to([left, right], { xPercent: 0, duration: 0.34 }, 0)
      .to(tiles, { scaleY: 1, duration: 0.3, stagger: { each: 0.01, grid: [5, 6], from: "start" } }, 0.02)
      .to(loader, { rotation: 160, scale: 1, duration: 0.4 }, 0.08);
  }, [pathname]);

  return (
    <div className="page-transition" ref={overlayRef} aria-live="polite" aria-label="Loading page">
      <div className="page-transition-panel page-transition-left" ref={leftRef} />
      <div className="page-transition-panel page-transition-right" ref={rightRef} />
      <div className="page-transition-tiles" aria-hidden="true">
        {Array.from({ length: 30 }, (_, index) => <span data-page-transition-tile key={index} />)}
      </div>
      <div className="page-transition-loader" ref={loaderRef} aria-hidden="true">
        <span>AM</span>
      </div>
    </div>
  );
}

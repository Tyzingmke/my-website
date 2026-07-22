"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { isReloadNavigation, readStoredScroll, writeStoredScroll } from "@/lib/scrollMemory";

const revealAfter = 420;

export function ScrollExperience() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);
  const frame = useRef(0);
  const initialEffect = useRef(true);

  const savePosition = useCallback(() => {
    writeStoredScroll(pathname, window.scrollY);
  }, [pathname]);

  useEffect(() => {
    const reload = initialEffect.current && isReloadNavigation();
    initialEffect.current = false;
    const restoredY = reload ? readStoredScroll(pathname) : window.scrollY;
    lastY.current = Math.max(restoredY, window.scrollY);
    setVisible(lastY.current > revealAfter && reload);

    const update = () => {
      frame.current = 0;
      const currentY = window.scrollY;
      const delta = currentY - lastY.current;

      if (currentY <= revealAfter) setVisible(false);
      else if (delta > 3) setVisible(true);
      else if (delta < -3) setVisible(false);

      lastY.current = currentY;
      writeStoredScroll(pathname, currentY);
    };
    const onScroll = () => {
      if (!frame.current) frame.current = requestAnimationFrame(update);
    };
    const onRestored = (event: Event) => {
      const restored = (event as CustomEvent<{ y: number }>).detail?.y ?? window.scrollY;
      lastY.current = restored;
      setVisible(restored > revealAfter);
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      const restored = readStoredScroll(pathname);
      window.scrollTo(0, restored);
      lastY.current = restored;
      setVisible(restored > revealAfter);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll-memory-restored", onRestored);
    window.addEventListener("pagehide", savePosition);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", savePosition);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll-memory-restored", onRestored);
      window.removeEventListener("pagehide", savePosition);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", savePosition);
    };
  }, [pathname, savePosition]);

  const returnToTop = () => {
    setVisible(false);
    lastY.current = 0;
    writeStoredScroll(pathname, 0);
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <button
      className={visible ? "scroll-to-top is-visible" : "scroll-to-top"}
      type="button"
      aria-label="Return to the top"
      title="Return to the top"
      tabIndex={visible ? 0 : -1}
      onClick={returnToTop}
    >
      <ArrowUp size={19} strokeWidth={2.2} />
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const splashQuotes = [
  "Clear design earns trust before the first click.",
  "Fast pages make good first impressions feel effortless.",
  "A strong website should feel calm, sharp and ready.",
  "Useful digital systems begin with clarity, not noise.",
];

const FIRST_LOAD_KEY = "tony-first-load-screen-seen";

const waitForWindowLoad = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") {
      resolve();
      return;
    }
    window.addEventListener("load", () => resolve(), { once: true });
  });

const waitForFonts = () =>
  new Promise<void>((resolve) => {
    if (!("fonts" in document)) {
      resolve();
      return;
    }
    document.fonts.ready.then(() => resolve()).catch(() => resolve());
  });

const waitForImages = () =>
  Promise.allSettled(
    Array.from(document.images).map((image) => {
      if (image.complete) return Promise.resolve();
      return image.decode().catch(() => undefined);
    }),
  ).then(() => undefined);

export function FirstLoadScreen() {
  const pathname = usePathname();
  const [active, setActive] = useState(() => typeof document !== "undefined" && document.documentElement.dataset.firstLoadScreen === "playing");
  const [progress, setProgress] = useState(() => typeof document !== "undefined" && document.documentElement.dataset.firstLoadScreen === "playing" ? 6 : 0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (pathname !== "/") {
      document.documentElement.dataset.firstLoadScreen = "ready";
      return;
    }

    let seen = false;
    try {
      seen = sessionStorage.getItem(FIRST_LOAD_KEY) === "true";
    } catch {
      seen = false;
    }

    if (seen) {
      document.documentElement.dataset.firstLoadScreen = "ready";
      return;
    }

    let cancelled = false;
    let frame = 0;
    let quoteTimer = 0;
    let hideTimer = 0;
    let targetProgress = 12;
    let resolved = false;
    const root = document.documentElement;

    const updateProgress = () => {
      setProgress((current) => {
        const next = current + (targetProgress - current) * 0.12;
        const settled = Math.abs(targetProgress - next) < 0.35 ? targetProgress : next;
        return Math.min(100, settled);
      });
      if (!cancelled && (!resolved || targetProgress > 99)) frame = window.requestAnimationFrame(updateProgress);
    };

    const complete = () => {
      if (cancelled) return;
      resolved = true;
      targetProgress = 100;
      hideTimer = window.setTimeout(() => {
        if (cancelled) return;
        try {
          sessionStorage.setItem(FIRST_LOAD_KEY, "true");
        } catch {
          // Ignore storage write failures and continue.
        }
        root.dataset.firstLoadScreen = "ready";
        setActive(false);
        window.dispatchEvent(new Event("site-first-load-complete"));
      }, 420);
    };

    setActive(true);
    root.dataset.firstLoadScreen = "playing";
    frame = window.requestAnimationFrame(updateProgress);
    quoteTimer = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % splashQuotes.length);
    }, 1800);

    window.setTimeout(() => {
      targetProgress = 28;
    }, 120);
    window.setTimeout(() => {
      targetProgress = 54;
    }, 420);
    window.setTimeout(() => {
      targetProgress = 76;
    }, 780);
    window.setTimeout(() => {
      targetProgress = 92;
    }, 1120);

    Promise.all([
      waitForWindowLoad(),
      waitForFonts(),
      waitForImages(),
      new Promise<void>((resolve) => window.setTimeout(resolve, 1500)),
    ]).then(complete);

    return () => {
      cancelled = true;
      if (frame) window.cancelAnimationFrame(frame);
      if (quoteTimer) window.clearInterval(quoteTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
      if (root.dataset.firstLoadScreen === "playing") root.dataset.firstLoadScreen = "ready";
    };
  }, [pathname]);

  if (!active || pathname !== "/") return null;

  return (
    <div className="first-load-screen" aria-live="polite" aria-label="Preparing homepage">
      <div className="first-load-panel">
        <span className="first-load-brand">Tony Consults</span>
        <p className="first-load-quote">{splashQuotes[quoteIndex]}</p>
        <div className="first-load-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0.06, progress / 100)})` }} />
        </div>
        <div className="first-load-meta">
          <strong>{Math.round(progress)}%</strong>
          <span>Preparing your first view</span>
        </div>
      </div>
    </div>
  );
}

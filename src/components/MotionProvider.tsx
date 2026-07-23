"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isReloadNavigation, readStoredScroll } from "@/lib/scrollMemory";

export function MotionProvider() {
  const pathname = usePathname();
  const introPlayed = useRef(pathname !== "/");
  const previousPath = useRef(pathname);
  const returnVisit = useRef(0);
  const initialEffect = useRef(true);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = matchMedia("(min-width: 961px) and (pointer: fine)").matches;
    const mobileMotion = matchMedia("(max-width: 900px)").matches;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const cores = navigator.hardwareConcurrency ?? 4;
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const liteMotion = !reduced && (
      memory <= 2
      || cores <= 2
      || connection?.saveData === true
      || connection?.effectiveType === "2g"
      || connection?.effectiveType === "slow-2g"
    );
    const lightweightMotion = mobileMotion || liteMotion;
    const richMotion = !reduced && !liteMotion && desktop && memory >= 4;
    const root = document.documentElement;
    root.dataset.motion = reduced ? "reduced" : liteMotion ? "lite" : richMotion ? "rich" : "standard";
    const initialRun = initialEffect.current;
    initialEffect.current = false;
    const reloadScrollY = initialRun && isReloadNavigation() ? Math.max(readStoredScroll(pathname), window.scrollY) : 0;
    const restoringReload = reloadScrollY > 4;
    if (restoringReload && pathname === "/") introPlayed.current = true;
    const returningHome = pathname === "/" && introPlayed.current && previousPath.current !== "/";
    const playHomeIntro = pathname === "/" && (!introPlayed.current || previousPath.current !== "/") && !restoringReload;
    const returnGreetings = [
      {
        opening: "You're back.",
        followUp: "Well, I'm still Tony, your dev.",
      },
      {
        opening: "Ah, nice. You've come back.",
        followUp: "I hope you were pleased. I'm still Tony.",
      },
      {
        opening: "Back for another look?",
        followUp: "Good. Tony's still here, building.",
      },
      {
        opening: "You know your way around now.",
        followUp: "I'm still Tony. Let's make something useful.",
      },
    ];
    const returnGreeting = returnGreetings[returnVisit.current % returnGreetings.length];
    root.dataset.homeIntro = playHomeIntro ? "playing" : "ready";

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    let markRouteTimer = 0;
    let introUnlockTimer = 0;
    let restoreFrame = 0;
    let removeHeroPointer: (() => void) | null = null;
    let introTouchLocked = false;
    const previousScrollRestoration = history.scrollRestoration;
    const previousBodyOverflow = playHomeIntro ? "" : document.body.style.overflow;
    const preventIntroTouchScroll = (event: TouchEvent) => event.preventDefault();
    const releaseIntroTouchLock = () => {
      if (!introTouchLocked) return;
      document.removeEventListener("touchmove", preventIntroTouchScroll);
      introTouchLocked = false;
    };
    const completeHomeIntro = () => {
      if (root.dataset.homeIntro === "ready") return;
      releaseIntroTouchLock();
      document.body.style.overflow = previousBodyOverflow;
      root.dataset.homeIntro = "ready";
      lenis?.start();
      window.dispatchEvent(new Event("home-intro-complete"));
    };

    if (playHomeIntro) {
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
      if (mobileMotion) {
        document.addEventListener("touchmove", preventIntroTouchScroll, { passive: false });
        introTouchLocked = true;
      }
      introUnlockTimer = window.setTimeout(completeHomeIntro, 9000);
    }
    markRouteTimer = window.setTimeout(() => {
      if (playHomeIntro) {
        introPlayed.current = true;
        if (returningHome) returnVisit.current += 1;
      }
      previousPath.current = pathname;
    }, 0);

    if (richMotion) {
      lenis = new Lenis({
        duration: 0.72,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1,
        anchors: true,
      });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      if (playHomeIntro) lenis.stop();
    }

    if (restoringReload) {
      history.scrollRestoration = "manual";
      restoreFrame = requestAnimationFrame(() => {
        restoreFrame = requestAnimationFrame(() => {
          if (lenis) lenis.scrollTo(reloadScrollY, { immediate: true, force: true });
          else window.scrollTo(0, reloadScrollY);
          window.dispatchEvent(new CustomEvent("scroll-memory-restored", { detail: { y: reloadScrollY } }));
          ScrollTrigger.refresh();
        });
      });
    }

    const context = gsap.context(() => {
      const hero = document.querySelector<HTMLElement>("[data-home-hero]");
      const heroMapPath = hero?.querySelector<SVGPathElement>(".hero-map-background path") ?? null;
      const intro = document.querySelector<HTMLElement>("[data-intro-greeting]");
      const introPrimary = document.querySelector<HTMLElement>("[data-intro-primary]");
      const introLead = document.querySelector<HTMLElement>("[data-intro-lead]");
      const introTony = introPrimary?.querySelector<HTMLElement>("strong") ?? null;
      const introAlias = document.querySelector<HTMLElement>("[data-intro-alias]");
      const introAntony = document.querySelector<HTMLElement>("[data-intro-antony]");
      const heroName = document.querySelector<HTMLElement>("[data-hero-name]");
      let introTokens: HTMLElement[] = [];

      if (heroMapPath) {
        const mapLength = heroMapPath.getTotalLength();
        if (reduced) {
          gsap.set(heroMapPath, {
            strokeDasharray: `${mapLength} ${mapLength}`,
            strokeDashoffset: mapLength,
            opacity: 0.12,
          });
          gsap.to(heroMapPath, { strokeDashoffset: 0, opacity: 0.42, duration: 4.2, ease: "none" });
        } else {
          gsap.set(heroMapPath, {
            strokeDasharray: `${mapLength} ${mapLength}`,
            strokeDashoffset: mapLength,
            opacity: 0.08,
          });
          gsap.timeline({ repeat: -1, repeatDelay: 0.7 })
            .to(heroMapPath, { strokeDashoffset: 0, opacity: 0.62, duration: lightweightMotion ? 6.4 : 8.4, ease: "power1.inOut" })
            .to(heroMapPath, { opacity: 0.28, duration: 1.25, ease: "sine.inOut" })
            .to(heroMapPath, { opacity: 0.08, duration: 0.85, ease: "sine.in" })
            .set(heroMapPath, { strokeDashoffset: mapLength });
        }
      }

      if (intro && introPrimary && introLead && introTony && introAlias) {
        const tokenLabels = returningHome ? returnGreeting.opening.split(/\s+/) : ["Hi", ",", "I'm"];
        const fragment = document.createDocumentFragment();
        tokenLabels.forEach((label, index) => {
          const token = document.createElement("span");
          token.className = "intro-token";
          if ((!returningHome && index === 0) || (returningHome && index === tokenLabels.length - 1)) token.classList.add("intro-token-tight");
          token.textContent = label;
          fragment.append(token);
        });
        introLead.replaceChildren(fragment);
        introTokens = Array.from(introLead.querySelectorAll<HTMLElement>(".intro-token"));
        introTony.textContent = returningHome ? "" : "TONY.";
        introAlias.textContent = returningHome ? returnGreeting.followUp : "or you can call me";
        intro.toggleAttribute("data-returning", returningHome);
        introPrimary.toggleAttribute("data-returning", returningHome);
      }

      if (hero && intro && introPrimary && introTony && introAlias && introAntony && heroName && playHomeIntro && !reduced && window.scrollY < 80) {
        const source = introAntony.getBoundingClientRect();
        const target = heroName.getBoundingClientRect();
        const shiftX = target.left + target.width / 2 - (source.left + source.width / 2);
        const shiftY = target.top + target.height / 2 - (source.top + source.height / 2);
        const scale = target.width / Math.max(source.width, 1);

        gsap.set(heroName, { autoAlpha: 0 });
        gsap.set("[data-hero-content], [data-hero-card], [data-hero-image='sharp']", { autoAlpha: 0 });
        gsap.set("[data-hero-image='sharp']", { scale: lightweightMotion ? 0.97 : 0.95, yPercent: lightweightMotion ? 3 : 6 });
        if (lightweightMotion) {
          gsap.set("[data-hero-image='soft']", { display: "none" });
          gsap.set(intro, { backdropFilter: "none" });
        } else {
          gsap.set("[data-hero-image='soft']", { autoAlpha: 0.72, scale: 0.91, yPercent: 8 });
        }
        gsap.set([introAlias, introAntony], { autoAlpha: 0 });
        gsap.set([...introTokens, introTony], { autoAlpha: 0 });

        const tokenPatterns = [
          [{ x: 0, y: 28, rotation: 0 }, { x: 0, y: -18, rotation: 0 }, { x: 0, y: 24, rotation: 0 }],
          [{ x: -16, y: 18, rotation: -2 }, { x: 8, y: 24, rotation: 1 }, { x: 14, y: -14, rotation: 2 }],
          [{ x: 10, y: -22, rotation: 1 }, { x: -10, y: 20, rotation: -1 }, { x: 0, y: 26, rotation: 0 }],
        ];
        const tokenPattern = tokenPatterns[(returningHome ? returnVisit.current + 1 : 0) % tokenPatterns.length];
        const tonyRevealAt = Math.min(0.9, 0.34 + introTokens.length * 0.11);

        const timings = lightweightMotion
          ? { primaryOut: 1.55, aliasIn: 1.66, aliasOut: 2.72, antonyIn: 2.64, curtain: 2.6, nameMove: 3.12, nameHide: 3.78, nameSwap: 3.82, introHide: 3.92, image: 2.68, content: 3.5, cards: 3.56, header: 3.36 }
          : { primaryOut: 2.38, aliasIn: 2.52, aliasOut: 4.86, antonyIn: 4.78, curtain: 4.72, nameMove: 5.34, nameHide: 6.38, nameSwap: 6.42, introHide: 6.52, image: 4.82, content: 6.16, cards: 6.24, header: 5.92 };
        const introTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        introTimeline
          .fromTo(intro, { autoAlpha: 0 }, { autoAlpha: 1, duration: lightweightMotion ? 0.2 : 0.32 })
          .fromTo(
            introTokens,
            {
              autoAlpha: 0,
              x: (index) => tokenPattern[index % tokenPattern.length].x,
              y: (index) => tokenPattern[index % tokenPattern.length].y,
              rotation: (index) => tokenPattern[index % tokenPattern.length].rotation,
              filter: lightweightMotion ? "blur(0px)" : "blur(4px)",
            },
            { autoAlpha: 1, x: 0, y: 0, rotation: 0, filter: "blur(0px)", duration: lightweightMotion ? 0.32 : 0.48, stagger: lightweightMotion ? 0.07 : 0.11 },
            0.1,
          )
          .fromTo(introTony, { autoAlpha: 0, scale: 0.94, filter: lightweightMotion ? "blur(0px)" : "blur(9px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: lightweightMotion ? 0.38 : 0.52 }, tonyRevealAt)
          .to(introPrimary, { autoAlpha: 0, y: lightweightMotion ? -12 : -24, scale: 0.96, duration: lightweightMotion ? 0.26 : 0.38 }, timings.primaryOut)
          .fromTo(introAlias, { autoAlpha: 0, y: lightweightMotion ? 8 : 16 }, { autoAlpha: 1, y: 0, duration: lightweightMotion ? 0.28 : 0.42 }, timings.aliasIn)
          .to(introAlias, { autoAlpha: 0, x: lightweightMotion ? -8 : -18, duration: lightweightMotion ? 0.24 : 0.34 }, timings.aliasOut)
          .fromTo(
            introAntony,
            { autoAlpha: 0, y: lightweightMotion ? 8 : 18, scale: 0.9, filter: lightweightMotion ? "blur(0px)" : "blur(7px)" },
            { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: lightweightMotion ? 0.34 : 0.54 },
            timings.antonyIn,
          )
          .to(intro, { backgroundColor: "rgba(215, 214, 207, 0)", backdropFilter: "blur(0px)", duration: lightweightMotion ? 0.72 : 1.1 }, timings.curtain)
          .to(introAntony, { x: shiftX, y: shiftY, scale, duration: lightweightMotion ? 0.72 : 1.14, ease: "power4.inOut" }, timings.nameMove)
          .to(introAntony, { autoAlpha: 0, duration: 0.12 }, timings.nameHide)
          .set(heroName, { autoAlpha: 1 }, timings.nameSwap)
          .set(intro, { autoAlpha: 0, visibility: "hidden" }, timings.introHide)
          .to("[data-hero-image='soft']", { autoAlpha: 0, scale: 1, yPercent: 0, duration: lightweightMotion ? 0.01 : 1.16 }, timings.image)
          .to("[data-hero-image='sharp']", { autoAlpha: 1, scale: 1, yPercent: 0, duration: lightweightMotion ? 0.72 : 1.16 }, timings.image)
          .fromTo("[data-hero-content]", { autoAlpha: 0, y: lightweightMotion ? 12 : 22 }, { autoAlpha: 1, y: 0, duration: lightweightMotion ? 0.4 : 0.62 }, timings.content)
          .fromTo("[data-hero-card]", { autoAlpha: 0, y: lightweightMotion ? 10 : 18, rotate: lightweightMotion ? 0 : -2 }, { autoAlpha: 1, y: 0, rotate: 0, duration: lightweightMotion ? 0.38 : 0.58, stagger: lightweightMotion ? 0.04 : 0.09 }, timings.cards)
          .fromTo(".site-header", { autoAlpha: 0, y: lightweightMotion ? -8 : -14 }, { autoAlpha: 1, y: 0, duration: lightweightMotion ? 0.4 : 0.62 }, timings.header)
          .eventCallback("onComplete", () => {
            window.clearTimeout(introUnlockTimer);
            completeHomeIntro();
          });

        if (!reduced) {
          gsap.fromTo(
            "[data-hero-name]",
            { yPercent: 0, autoAlpha: 1 },
            {
              yPercent: -8,
              autoAlpha: 0.42,
              ease: "none",
              immediateRender: false,
              scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
            },
          );
          gsap.to("[data-hero-portrait]", {
            autoAlpha: 0.08,
            scale: 0.985,
            filter: richMotion ? "blur(11px)" : "blur(0px)",
            ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom 42%", scrub: true },
          });
        }
      } else if (hero && intro && introPrimary && introTony && introAlias && introAntony && playHomeIntro && reduced && window.scrollY < 80) {
        gsap.set("[data-hero-image='soft']", { display: "none" });
        gsap.set("[data-hero-image='sharp'], [data-hero-content], [data-hero-card], .site-header", { autoAlpha: 1 });
        gsap.set(intro, { display: "grid", autoAlpha: 1 });
        gsap.set([...introTokens, introTony, introPrimary], { autoAlpha: 1 });
        gsap.set([introAlias, introAntony], { autoAlpha: 0 });
        gsap.timeline({
          defaults: { ease: "none" },
          onComplete: () => {
            gsap.set(intro, { display: "none" });
            window.clearTimeout(introUnlockTimer);
            completeHomeIntro();
          },
        })
          .to(introPrimary, { autoAlpha: 0, duration: 0.2 }, 1.2)
          .to(introAlias, { autoAlpha: 1, duration: 0.18 }, 1.22)
          .to(introAlias, { autoAlpha: 0, duration: 0.18 }, 2.32)
          .to(introAntony, { autoAlpha: 1, duration: 0.18 }, 2.34)
          .to(intro, { autoAlpha: 0, duration: 0.24 }, 3.16);
      } else {
        const softHero = document.querySelector<HTMLElement>("[data-hero-image='soft']");
        const visibleTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-hero-image='sharp'], [data-hero-content], [data-hero-card], .site-header"));
        if (intro) gsap.set(intro, { display: "none" });
        if (softHero) gsap.set(softHero, { display: "none" });
        if (visibleTargets.length) gsap.set(visibleTargets, { autoAlpha: 1 });
        window.clearTimeout(introUnlockTimer);
        completeHomeIntro();
      }

      if (hero && desktop && !reduced) {
        const portrait = document.querySelector<HTMLElement>("[data-hero-portrait]");
        const ambient = document.querySelector<HTMLElement>("[data-hero-ambient]");
        const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-hero-card]"));
        if (portrait) {
          const motionScale = liteMotion ? 0.58 : 1;
          const responseDuration = liteMotion ? 0.46 : 0.8;
          gsap.set(portrait, { xPercent: -50 });
          const portraitX = gsap.quickTo(portrait, "x", { duration: responseDuration, ease: "power3.out" });
          const portraitY = gsap.quickTo(portrait, "y", { duration: responseDuration, ease: "power3.out" });
          const ambientX = ambient ? gsap.quickTo(ambient, "x", { duration: liteMotion ? 0.62 : 1.15, ease: "power3.out" }) : null;
          const ambientY = ambient ? gsap.quickTo(ambient, "y", { duration: liteMotion ? 0.62 : 1.15, ease: "power3.out" }) : null;
          const cardMotion = cards.map((card) => ({
            depth: Number(card.dataset.parallaxDepth ?? 1),
            x: gsap.quickTo(card, "x", { duration: liteMotion ? 0.42 : 0.72, ease: "power3.out" }),
            y: gsap.quickTo(card, "y", { duration: liteMotion ? 0.42 : 0.72, ease: "power3.out" }),
          }));

          const move = (event: PointerEvent) => {
            const bounds = hero.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
            const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
            portraitX(x * 42 * motionScale);
            portraitY(y * 13 * motionScale);
            ambientX?.(x * -10 * motionScale);
            ambientY?.(y * -7 * motionScale);
            cardMotion.forEach((motion) => {
              motion.x(x * 8 * motion.depth * motionScale);
              motion.y(y * 6 * motion.depth * motionScale);
            });
          };
          const reset = () => {
            portraitX(0);
            portraitY(0);
            ambientX?.(0);
            ambientY?.(0);
            cardMotion.forEach((motion) => {
              motion.x(0);
              motion.y(0);
            });
          };

          hero.addEventListener("pointermove", move, { passive: true });
          hero.addEventListener("pointerleave", reset);
          removeHeroPointer = () => {
            hero.removeEventListener("pointermove", move);
            hero.removeEventListener("pointerleave", reset);
          };
        }
      }

      const siteHeader = document.querySelector<HTMLElement>("[data-site-header]");
      const topbar = document.querySelector<HTMLElement>("[data-header-top]");
      const dock = document.querySelector<HTMLElement>("[data-header-dock]");
      const dockTrigger = hero ?? document.querySelector<HTMLElement>("main");
      const dockMedia = gsap.matchMedia();
      if (siteHeader && topbar && dock && dockTrigger && !reduced) {
        const heroActionItems = Array.from(document.querySelectorAll<HTMLElement>("[data-hero-action]"));
        const dockActionItems = Array.from(dock.querySelectorAll<HTMLElement>("[data-dock-action]"));
        const headerTransferItems = Array.from(topbar.querySelectorAll<HTMLElement>("[data-header-transfer]"));
        const dockTransferItems = Array.from(dock.querySelectorAll<HTMLElement>("[data-dock-transfer]"));
        const dockRevealItems = [".dock-intro", ".dock-tools", ".dock-email"]
          .map((selector) => dock.querySelector<HTMLElement>(selector))
          .filter((item): item is HTMLElement => Boolean(item));
        const addActionTransfer = (
          timeline: gsap.core.Timeline,
          targetAt: (index: number) => { centerX: number; centerY: number; width: number },
        ) => {
          if (!hero || heroActionItems.length === 0 || heroActionItems.length !== dockActionItems.length) return null;

          const layer = document.createElement("div");
          layer.setAttribute("aria-hidden", "true");
          layer.dataset.actionTransferLayer = "";
          Object.assign(layer.style, {
            position: "fixed",
            inset: "0",
            zIndex: "101",
            pointerEvents: "none",
            contain: "strict",
          });
          document.body.append(layer);

          const sourceRects = heroActionItems.map((item) => item.getBoundingClientRect());
          const transferItems = heroActionItems.map((item, index) => {
            const clone = item.cloneNode(true) as HTMLElement;
            const rect = sourceRects[index];
            clone.removeAttribute("data-hero-action");
            clone.setAttribute("tabindex", "-1");
            Object.assign(clone.style, {
              position: "absolute",
              left: `${rect.left}px`,
              top: `${rect.top}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              margin: "0",
              whiteSpace: "nowrap",
              border: "1px solid rgba(17, 19, 15, 0.2)",
              boxShadow: liteMotion ? "none" : "0 12px 28px rgba(17, 19, 15, 0.14)",
              transformOrigin: "center center",
            });
            layer.append(clone);
            return clone;
          });

          gsap.set(transferItems, { autoAlpha: 0 });
          timeline
            .to(heroActionItems, { autoAlpha: 0, duration: 0.1, ease: "none" }, 0.05)
            .to(transferItems, { autoAlpha: 1, duration: 0.1, ease: "none" }, 0.05)
            .to(transferItems, {
              x: (index) => {
                const source = sourceRects[index];
                const sourceCenter = source.left + source.width / 2;
                return (targetAt(index).centerX - sourceCenter) * 0.48;
              },
              y: (index) => {
                const source = sourceRects[index];
                return window.innerHeight * 0.7 - (source.top + source.height / 2);
              },
              scale: (index) => {
                const finalScale = targetAt(index).width / Math.max(sourceRects[index].width, 1);
                return 1 - (1 - finalScale) * 0.48;
              },
              ease: "none",
              duration: 0.47,
            }, 0.08)
            .to(transferItems, {
              x: (index) => {
                const source = sourceRects[index];
                return targetAt(index).centerX - (source.left + source.width / 2);
              },
              y: (index) => {
                const source = sourceRects[index];
                return targetAt(index).centerY - (source.top + source.height / 2);
              },
              scale: (index) => targetAt(index).width / Math.max(sourceRects[index].width, 1),
              ease: "none",
              duration: 0.33,
            }, 0.55)
            .to(transferItems, { autoAlpha: 0, duration: 0.12, ease: "none" }, 0.84)
            .to(dockActionItems, { autoAlpha: 1, duration: 0.14, stagger: 0.02, ease: "none" }, 0.82);

          return layer;
        };
        const addHeaderTransfer = (
          timeline: gsap.core.Timeline,
          targetAt: (index: number) => { left: number; top: number; width: number; height: number; backgroundColor: string },
          sourceItems = headerTransferItems,
          targetItems = dockTransferItems,
        ) => {
          if (sourceItems.length === 0 || sourceItems.length !== targetItems.length) return null;

          const layer = document.createElement("div");
          layer.setAttribute("aria-hidden", "true");
          layer.dataset.headerTransferLayer = "";
          Object.assign(layer.style, {
            position: "fixed",
            inset: "0",
            zIndex: "102",
            pointerEvents: "none",
            contain: "strict",
          });
          document.body.append(layer);

          const sourceRects = sourceItems.map((item) => item.getBoundingClientRect());
          const transferItems = sourceItems.map((item, index) => {
            const clone = item.cloneNode(true) as HTMLElement;
            const rect = sourceRects[index];
            const styles = getComputedStyle(item);
            clone.removeAttribute("data-header-transfer");
            clone.setAttribute("tabindex", "-1");
            Object.assign(clone.style, {
              position: "absolute",
              left: `${rect.left}px`,
              top: `${rect.top}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: styles.gap,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              margin: "0",
              padding: styles.padding,
              boxSizing: "border-box",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              borderRadius: "3px",
              backgroundColor: "rgba(17, 19, 15, 0.98)",
              color: styles.color,
              fontFamily: styles.fontFamily,
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
              lineHeight: styles.lineHeight,
              whiteSpace: "nowrap",
              boxShadow: liteMotion ? "none" : "0 8px 20px rgba(17, 19, 15, 0.12)",
              transformOrigin: "top left",
              willChange: "transform, background-color",
            });
            layer.append(clone);
            return clone;
          });

          const brandText = transferItems[0]?.querySelectorAll<HTMLElement>("strong, span") ?? [];
          gsap.set(sourceItems, { autoAlpha: 1 });
          gsap.set(targetItems, { autoAlpha: 0 });
          gsap.set(transferItems, { autoAlpha: 0 });
          gsap.set(brandText, { color: "#ffffff" });

          timeline
            .set(transferItems, { autoAlpha: 1 }, 0.04)
            .set(sourceItems, { autoAlpha: 0 }, 0.045)
            .to(transferItems, {
              x: (index) => targetAt(index).left - sourceRects[index].left,
              y: (index) => targetAt(index).top - sourceRects[index].top,
              scaleX: (index) => targetAt(index).width / Math.max(sourceRects[index].width, 1),
              scaleY: (index) => targetAt(index).height / Math.max(sourceRects[index].height, 1),
              backgroundColor: (index) => targetAt(index).backgroundColor,
              borderColor: "rgba(255, 255, 255, 0.52)",
              boxShadow: liteMotion ? "none" : "0 8px 22px rgba(17, 19, 15, 0.08)",
              ease: "none",
              duration: 0.855,
            }, 0.045)
            .to(transferItems, { color: "#11130f", duration: 0.15, ease: "none" }, 0.75)
            .to(brandText, { color: "#11130f", duration: 0.15, ease: "none" }, 0.75)
            .set(targetItems, { autoAlpha: 1 }, 0.9)
            .set(transferItems, { autoAlpha: 0 }, 0.905);

          return layer;
        };
        const addMobileNavTransfer = (
          timeline: gsap.core.Timeline,
          menuToggle: HTMLElement,
          targetItems: HTMLElement[],
          targetAt: (index: number) => { left: number; top: number; width: number; height: number; backgroundColor: string },
        ) => {
          if (targetItems.length === 0) return null;

          const layer = document.createElement("div");
          layer.setAttribute("aria-hidden", "true");
          layer.dataset.mobileNavTransferLayer = "";
          Object.assign(layer.style, {
            position: "fixed",
            inset: "0",
            zIndex: "102",
            pointerEvents: "none",
            contain: "strict",
          });
          document.body.append(layer);
          const source = menuToggle.getBoundingClientRect();
          const transferItems = targetItems.map((item) => {
            const clone = item.cloneNode(true) as HTMLElement;
            clone.removeAttribute("data-dock-transfer");
            clone.setAttribute("tabindex", "-1");
            clone.querySelectorAll<HTMLElement>(".dock-label-full").forEach((label) => label.remove());
            Object.assign(clone.style, {
              position: "absolute",
              left: `${source.left}px`,
              top: `${source.top}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: `${source.width}px`,
              height: `${source.height}px`,
              margin: "0",
              padding: "0",
              boxSizing: "border-box",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              borderRadius: "3px",
              backgroundColor: "rgba(17, 19, 15, 0.98)",
              color: "#ffffff",
              boxShadow: liteMotion ? "none" : "0 8px 20px rgba(17, 19, 15, 0.12)",
              flexDirection: "column",
              gap: "2px",
              fontSize: "8px",
              transformOrigin: "top left",
              willChange: "transform, background-color",
            });
            layer.append(clone);
            return clone;
          });

          gsap.set(targetItems, { autoAlpha: 0 });
          gsap.set(transferItems, { autoAlpha: 0 });
          timeline
            .set(transferItems, { autoAlpha: 1 }, 0.05)
            .set(menuToggle, { autoAlpha: 0 }, 0.055)
            .to(transferItems, {
              x: (index) => targetAt(index).left - source.left,
              y: (index) => targetAt(index).top - source.top,
              scaleX: (index) => targetAt(index).width / Math.max(source.width, 1),
              scaleY: (index) => targetAt(index).height / Math.max(source.height, 1),
              backgroundColor: (index) => targetAt(index).backgroundColor,
              borderColor: "rgba(255, 255, 255, 0.52)",
              ease: "none",
              duration: 0.845,
              stagger: 0.006,
            }, 0.055)
            .to(transferItems, { color: "#11130f", duration: 0.15, ease: "none" }, 0.75)
            .set(targetItems, { autoAlpha: 1 }, 0.9)
            .set(transferItems, { autoAlpha: 0 }, 0.905);

          return layer;
        };
        let dockedState: boolean | null = null;
        const setDockState = (docked: boolean) => {
          if (dockedState === docked) return;
          dockedState = docked;
          topbar.toggleAttribute("inert", docked);
          dock.toggleAttribute("inert", !docked);
          topbar.setAttribute("aria-hidden", String(docked));
          dock.setAttribute("aria-hidden", String(!docked));
          dock.style.pointerEvents = docked ? "auto" : "none";
          siteHeader.classList.toggle("is-docked", docked);
          window.dispatchEvent(new CustomEvent("header-dock-change", { detail: { docked } }));
        };
        setDockState(false);

        const themes = [
          { selector: ".home-hero", surface: "rgba(220, 220, 214, 0.84)" },
          { selector: ".home-about", surface: "rgba(233, 236, 210, 0.86)" },
          { selector: ".home-work", surface: "rgba(228, 228, 222, 0.88)" },
          { selector: ".home-services", surface: "rgba(224, 228, 231, 0.87)" },
          { selector: ".home-promise", surface: "rgba(220, 227, 232, 0.87)" },
        ];
        const applyTheme = (theme: (typeof themes)[number]) => {
          gsap.to(siteHeader, {
            "--dock-surface": theme.surface,
            duration: 0.32,
            overwrite: "auto",
          });
        };
        if (hero) {
          themes.forEach((theme, index) => {
            const section = document.querySelector<HTMLElement>(theme.selector);
            if (!section) return;
            ScrollTrigger.create({
              trigger: section,
              start: "top 56%",
              end: "bottom 56%",
              onEnter: () => applyTheme(theme),
              onEnterBack: () => applyTheme(theme),
              onLeaveBack: () => applyTheme(themes[Math.max(0, index - 1)]),
            });
          });
        }

        dockMedia.add("(min-width: 901px)", () => {
          if (liteMotion) {
            const sourceHeader = siteHeader.getBoundingClientRect();
            gsap.set(siteHeader, {
              top: 14,
              left: 14,
              width: 238,
              height: () => window.innerHeight - 28,
            });
            gsap.set(topbar, {
              top: sourceHeader.top - 14,
              left: sourceHeader.left - 14,
              right: "auto",
              bottom: "auto",
              width: sourceHeader.width,
              height: sourceHeader.height,
            });
          }
          gsap.set(dock, {
            autoAlpha: 1,
            pointerEvents: "none",
            transformPerspective: 1000,
            backgroundColor: "rgba(226, 226, 220, 0)",
            borderColor: "rgba(255, 255, 255, 0)",
            boxShadow: "0 18px 46px rgba(17, 19, 15, 0)",
            backdropFilter: "none",
          });
          gsap.set(dockRevealItems, {
            autoAlpha: 0,
            x: (index) => liteMotion ? 58 - index * 5 : 150 - index * 12,
            y: (index) => liteMotion ? -30 + index * 7 : -96 + index * 18,
            scale: liteMotion ? 0.84 : 0.56,
            rotationY: liteMotion ? 0 : -34,
            rotationZ: (index) => liteMotion ? (index % 2 ? 1.5 : -1.5) : (index % 2 ? 5 : -5),
            transformOrigin: "left center",
            filter: liteMotion ? "blur(0px)" : "blur(7px)",
          });
          gsap.set(dockActionItems, { autoAlpha: 0 });

          const dockTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: dockTrigger,
              start: "top top",
              end: () => hero ? "bottom 34%" : "+=520",
              scrub: true,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                setDockState(self.progress > 0.86);
                siteHeader.style.pointerEvents = self.progress > 0.04 && self.progress < 0.86 ? "none" : "auto";
              },
            },
          });

          if (!liteMotion) {
            dockTimeline.to(siteHeader, {
              top: 14,
              left: 14,
              width: 238,
              height: () => window.innerHeight - 28,
              ease: "none",
              duration: 1,
            }, 0);
          }
          dockTimeline
            .to(topbar, {
              backgroundColor: "rgba(17, 19, 15, 0)",
              borderColor: "rgba(255, 255, 255, 0)",
              boxShadow: "0 10px 28px rgba(17, 19, 15, 0)",
              backdropFilter: "blur(0px)",
              duration: 0.28,
              ease: "none",
            }, 0.02)
            .to(".header-contact", { backgroundColor: "rgba(232, 255, 30, 0)", borderColor: "rgba(255, 255, 255, 0)", duration: 0.24, ease: "none" }, 0.03)
            .to(".header-brand", { borderColor: "rgba(255, 255, 255, 0)", duration: 0.24, ease: "none" }, 0.03)
            .to(".header-contact", {
              autoAlpha: 0,
              x: 42,
              duration: 0.36,
              ease: "none",
            }, 0.22)
            .set(topbar, { autoAlpha: 0 }, 0.92)
            .to(dock, {
              backgroundColor: liteMotion ? "rgba(226, 226, 220, 0.86)" : "rgba(226, 226, 220, 0.38)",
              borderColor: "rgba(255, 255, 255, 0.42)",
              boxShadow: liteMotion ? "0 10px 26px rgba(17, 19, 15, 0.1)" : "0 18px 46px rgba(17, 19, 15, 0.12)",
              backdropFilter: liteMotion ? "none" : "blur(16px) saturate(0.84)",
              duration: 0.24,
              ease: "none",
            }, 0.7)
            .to(dockRevealItems, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotationY: 0,
              rotationZ: 0,
              filter: "blur(0px)",
              ease: "none",
              stagger: 0.018,
              duration: 0.28,
            }, 0.68);

          const headerTransferLayer = addHeaderTransfer(dockTimeline, (index) => {
            if (index === 0) {
              return { left: 23, top: 23, width: 220, height: 54, backgroundColor: "#e8ff1e" };
            }
            const target = dockTransferItems[index];
            return {
              left: 23,
              top: window.innerHeight / 2 - 116 + (index - 1) * 44,
              width: 220,
              height: 39,
              backgroundColor: target?.classList.contains("is-active") ? "#e8ff1e" : "rgba(220, 220, 214, 0.9)",
            };
          });

          const transferLayer = addActionTransfer(dockTimeline, (index) => ({
            centerX: 23 + 54 + index * 113,
            centerY: window.innerHeight - 49,
            width: 108,
          }));
          if (!transferLayer) {
            dockTimeline.to(dockActionItems, { autoAlpha: 1, duration: 0.18, stagger: 0.02, ease: "none" }, 0.78);
          }

          return () => {
            headerTransferLayer?.remove();
            transferLayer?.remove();
            siteHeader.style.pointerEvents = "";
            dockedState = null;
            setDockState(false);
          };
        });

        dockMedia.add("(max-width: 900px)", () => {
          const mobileItems = Array.from(dock.querySelectorAll<HTMLElement>(".dock-nav a"));
          const mobileBrand = dock.querySelector<HTMLElement>(".dock-brand");
          const menuToggle = topbar.querySelector<HTMLElement>("[data-menu-toggle]");
          gsap.set(dock, {
            autoAlpha: 1,
            pointerEvents: "none",
            transformPerspective: 900,
            backgroundColor: "rgba(226, 226, 220, 0)",
            borderColor: "rgba(255, 255, 255, 0)",
            boxShadow: "0 14px 36px rgba(17, 19, 15, 0)",
            backdropFilter: "none",
          });
          gsap.set(dockActionItems, { autoAlpha: 0 });

          const railHeight = () => Math.min(360, window.innerHeight - 150);
          const railTop = () => Math.max(84, (window.innerHeight - railHeight()) / 2);

          const mobileDock = gsap.timeline({
            scrollTrigger: {
              trigger: dockTrigger,
              start: "top top",
              end: () => hero ? "bottom 42%" : "+=460",
              scrub: true,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                setDockState(self.progress > 0.88);
                siteHeader.style.pointerEvents = self.progress > 0.04 && self.progress < 0.88 ? "none" : "auto";
              },
            },
          });

          if (liteMotion) {
            mobileDock.set(siteHeader, {
              top: railTop,
              left: () => window.innerWidth - 88,
              width: 78,
              height: railHeight,
            }, 0.66);
          } else {
            mobileDock.to(siteHeader, {
              top: railTop,
              left: () => window.innerWidth - 88,
              width: 78,
              height: railHeight,
              ease: "none",
              duration: 1,
            }, 0);
          }
          mobileDock
            .to(topbar, {
              backgroundColor: "rgba(17, 19, 15, 0)",
              borderColor: "rgba(255, 255, 255, 0)",
              boxShadow: "0 10px 28px rgba(17, 19, 15, 0)",
              backdropFilter: "blur(0px)",
              duration: 0.26,
              ease: "none",
            }, 0.02)
            .to(".header-brand", { borderColor: "rgba(255, 255, 255, 0)", duration: 0.22, ease: "none" }, 0.03)
            .set(topbar, { autoAlpha: 0 }, 0.92)
            .to(dock, {
              backgroundColor: "rgba(226, 226, 220, 0.86)",
              borderColor: "rgba(255, 255, 255, 0.46)",
              boxShadow: "0 14px 36px rgba(17, 19, 15, 0.14)",
              backdropFilter: "none",
              duration: 0.24,
              ease: "none",
            }, 0.7);

          const mobileBrandLayer = mobileBrand && headerTransferItems[0]
            ? addHeaderTransfer(
              mobileDock,
              () => ({ left: window.innerWidth - 82, top: railTop() + 5, width: 70, height: 46, backgroundColor: "#e8ff1e" }),
              [headerTransferItems[0]],
              [mobileBrand],
            )
            : null;
          const mobileNavLayer = menuToggle
            ? addMobileNavTransfer(mobileDock, menuToggle, mobileItems, (index) => {
              const navTop = railTop() + 55;
              const navHeight = railHeight() - 106;
              const rowHeight = (navHeight - 16) / 5;
              return {
                left: window.innerWidth - 82,
                top: navTop + index * (rowHeight + 4),
                width: 70,
                height: rowHeight,
                backgroundColor: mobileItems[index]?.classList.contains("is-active") ? "#e8ff1e" : "rgba(220, 220, 214, 0.9)",
              };
            })
            : null;

          const transferLayer = addActionTransfer(mobileDock, (index) => ({
            centerX: window.innerWidth - 67 + index * 36,
            centerY: railTop() + railHeight() - 27,
            width: 33,
          }));
          if (!transferLayer) {
            mobileDock.to(dockActionItems, { autoAlpha: 1, duration: 0.18, stagger: 0.02, ease: "none" }, 0.78);
          }

          return () => {
            mobileBrandLayer?.remove();
            mobileNavLayer?.remove();
            transferLayer?.remove();
            siteHeader.style.pointerEvents = "";
            dockedState = null;
            setDockState(false);
          };
        });
      }

      if (siteHeader && topbar && dock && dockTrigger && reduced) {
        const initialHeader = siteHeader.getBoundingClientRect();
        const compactDock = mobileMotion;
        const railHeight = () => Math.min(360, window.innerHeight - 150);
        const railTop = () => Math.max(84, (window.innerHeight - railHeight()) / 2);
        const setAccessibilityState = (docked: boolean) => {
          topbar.toggleAttribute("inert", docked);
          dock.toggleAttribute("inert", !docked);
          topbar.setAttribute("aria-hidden", String(docked));
          dock.setAttribute("aria-hidden", String(!docked));
          dock.style.pointerEvents = docked ? "auto" : "none";
          siteHeader.classList.toggle("is-docked", docked);
          window.dispatchEvent(new CustomEvent("header-dock-change", { detail: { docked } }));
        };
        const showDock = () => {
          setAccessibilityState(true);
          gsap.killTweensOf([siteHeader, topbar, dock]);
          gsap.to(siteHeader, {
            top: compactDock ? railTop() : 14,
            left: compactDock ? window.innerWidth - 88 : 14,
            width: compactDock ? 78 : 238,
            height: compactDock ? railHeight() : window.innerHeight - 28,
            duration: 0.28,
            ease: "power2.out",
          });
          gsap.to(topbar, { autoAlpha: 0, duration: 0.1, ease: "none" });
          gsap.fromTo(
            dock,
            { autoAlpha: 0, backgroundColor: "rgba(226, 226, 220, 0)" },
            { autoAlpha: 1, backgroundColor: "rgba(226, 226, 220, 0.9)", duration: 0.2, delay: 0.08, ease: "none" },
          );
        };
        const showTopbar = () => {
          setAccessibilityState(false);
          gsap.killTweensOf([siteHeader, topbar, dock]);
          gsap.to(dock, { autoAlpha: 0, duration: 0.1, ease: "none" });
          gsap.to(siteHeader, {
            top: initialHeader.top,
            left: initialHeader.left,
            width: initialHeader.width,
            height: initialHeader.height,
            duration: 0.25,
            ease: "power2.out",
          });
          gsap.to(topbar, { autoAlpha: 1, duration: 0.16, delay: 0.08, ease: "none" });
        };
        setAccessibilityState(false);
        gsap.set(dock, { autoAlpha: 0, pointerEvents: "none" });
        ScrollTrigger.create({
          trigger: dockTrigger,
          start: "bottom 80%",
          onEnter: showDock,
          onLeaveBack: showTopbar,
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: lightweightMotion ? 18 : 38 },
          {
            autoAlpha: 1,
            y: 0,
            duration: reduced ? 0 : lightweightMotion ? 0.42 : 0.68,
            ease: "power3.out",
            scrollTrigger: reduced ? undefined : {
              trigger: element,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      const aboutPortrait = document.querySelector<HTMLElement>("[data-about-portrait]");
      if (aboutPortrait && !reduced) {
        gsap.fromTo(
          aboutPortrait,
          { yPercent: 4, rotation: -0.7 },
          {
            yPercent: -5,
            rotation: 0.7,
            ease: "none",
            scrollTrigger: {
              trigger: ".about-hero",
              start: "top top",
              end: "bottom top",
              scrub: 0.65,
            },
          },
        );
      }

      const journeyPortrait = document.querySelector<HTMLElement>("[data-journey-portrait]");
      if (journeyPortrait && !reduced) {
        gsap.fromTo(
          journeyPortrait,
          { y: 0, xPercent: -50, rotation: -1.2 },
          {
            y: () => Math.max((document.querySelector<HTMLElement>("[data-journey-map]")?.offsetHeight ?? 2400) * 0.53, 620),
            xPercent: -50,
            rotation: 1.2,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-journey-map]",
              start: "top 74%",
              end: "bottom 30%",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      const journeyPath = document.querySelector<SVGPathElement>("[data-journey-path]");
      if (journeyPath && !reduced) {
        const length = journeyPath.getTotalLength();
        gsap.set(journeyPath, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(journeyPath, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-journey-map]",
            start: "top 72%",
            end: "bottom 72%",
            scrub: true,
          },
        });
      }

      const media = gsap.matchMedia();
      media.add("(min-width: 961px) and (prefers-reduced-motion: no-preference)", () => {
        const track = document.querySelector<HTMLElement>("[data-project-track]");
        const section = document.querySelector<HTMLElement>("[data-project-rail]");
        const pin = document.querySelector<HTMLElement>("[data-project-pin]");
        if (!track || !section || !pin) return;
        const distance = () => Math.max(track.scrollWidth - innerWidth + innerWidth * 0.08, 0);
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin,
            scrub: 0.55,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        return () => tween.kill();
      });

      media.add("(max-width: 960px) and (prefers-reduced-motion: no-preference)", () => {
        const track = document.querySelector<HTMLElement>("[data-project-track]");
        const section = document.querySelector<HTMLElement>("[data-project-rail]");
        const pin = document.querySelector<HTMLElement>("[data-project-pin]");
        if (!track || !section || !pin) return;
        const distance = () => Math.max(track.scrollWidth - innerWidth + 92, 0);
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin,
            scrub: 0.42,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        return () => tween.kill();
      });

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const track = document.querySelector<HTMLElement>("[data-home-project-track]");
        const section = document.querySelector<HTMLElement>("[data-home-project-rail]");
        if (!track || !section) return;
        const distance = () => {
          const edgeClearance = innerWidth <= 960 ? 100 : innerWidth * 0.08;
          return Math.max(track.scrollWidth - innerWidth + edgeClearance, 0);
        };
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
        return () => tween.kill();
      });

      const promiseSection = document.querySelector<HTMLElement>("[data-promise-reveal]");
      const promisePixels = Array.from(document.querySelectorAll<HTMLElement>("[data-promise-pixel]"));
      const promiseCover = promiseSection?.querySelector<HTMLElement>(".promise-pixel-cover") ?? null;
      const promiseImage = promiseSection?.querySelector<HTMLElement>("[data-promise-identity] img") ?? null;
      const promiseName = promiseSection?.querySelector<HTMLElement>("[data-promise-name]") ?? null;

      media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        if (liteMotion) return;
        if (!promiseSection || !promisePixels.length || !promiseImage || !promiseName) return;
        const timers = new Map<HTMLElement, number>();
        const imageX = gsap.quickTo(promiseImage, "x", { duration: 0.62, ease: "power3.out" });
        const imageY = gsap.quickTo(promiseImage, "y", { duration: 0.62, ease: "power3.out" });
        const nameX = gsap.quickTo(promiseName, "x", { duration: 0.7, ease: "power3.out" });
        let latestEvent: PointerEvent | null = null;
        let frame = 0;

        const revealPixels = () => {
          frame = 0;
          if (!latestEvent) return;
          const rect = promiseSection.getBoundingClientRect();
          const localX = latestEvent.clientX - rect.left;
          const localY = latestEvent.clientY - rect.top;
          const columns = 14;
          const rows = 8;
          const cellWidth = rect.width / columns;
          const cellHeight = rect.height / rows;
          const radius = Math.max(150, Math.min(rect.width, rect.height) * 0.29);

          promisePixels.forEach((pixel, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);
            const dx = column * cellWidth + cellWidth / 2 - localX;
            const dy = row * cellHeight + cellHeight / 2 - localY;
            const distance = Math.hypot(dx, dy);
            if (distance > radius) return;
            const existingTimer = timers.get(pixel);
            if (existingTimer) window.clearTimeout(existingTimer);
            pixel.style.transitionDuration = "95ms";
            pixel.style.opacity = "0";
            const timer = window.setTimeout(() => {
              pixel.style.transitionDuration = "560ms";
              pixel.style.opacity = "1";
              timers.delete(pixel);
            }, 260 + (distance / radius) * 240);
            timers.set(pixel, timer);
          });

          const normalizedX = localX / Math.max(rect.width, 1) - 0.5;
          const normalizedY = localY / Math.max(rect.height, 1) - 0.5;
          imageX(normalizedX * 34);
          imageY(normalizedY * 22);
          nameX(normalizedX * -22);
        };

        const onPointerMove = (event: PointerEvent) => {
          latestEvent = event;
          if (!frame) frame = requestAnimationFrame(revealPixels);
        };
        const onPointerLeave = () => {
          latestEvent = null;
          if (frame) cancelAnimationFrame(frame);
          frame = 0;
          promisePixels.forEach((pixel) => {
            const timer = timers.get(pixel);
            if (timer) window.clearTimeout(timer);
            pixel.style.transitionDuration = "480ms";
            pixel.style.opacity = "1";
          });
          timers.clear();
          imageX(0);
          imageY(0);
          nameX(0);
        };

        promiseSection.addEventListener("pointermove", onPointerMove);
        promiseSection.addEventListener("pointerleave", onPointerLeave);
        return () => {
          promiseSection.removeEventListener("pointermove", onPointerMove);
          promiseSection.removeEventListener("pointerleave", onPointerLeave);
          onPointerLeave();
        };
      });

      media.add("(hover: none) and (prefers-reduced-motion: no-preference)", () => {
        if (!promiseSection || !promiseCover || !promiseImage) return;
        const pixelTween = gsap.fromTo(
          promiseCover,
          { autoAlpha: 1 },
          {
            autoAlpha: 0.08,
            ease: "none",
            scrollTrigger: {
              trigger: promiseSection,
              start: "top 84%",
              end: "center 46%",
              scrub: 0.55,
            },
          },
        );
        const imageTween = gsap.fromTo(
          promiseImage,
          { yPercent: 5 },
          {
            yPercent: -4,
            ease: "none",
            scrollTrigger: {
              trigger: promiseSection,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.65,
            },
          },
        );
        return () => {
          pixelTween.kill();
          imageTween.kill();
        };
      });

      if (liteMotion && !mobileMotion && promiseSection && promiseCover && promiseImage) {
        gsap.fromTo(
          promiseCover,
          { autoAlpha: 1 },
          {
            autoAlpha: 0.08,
            ease: "none",
            scrollTrigger: {
              trigger: promiseSection,
              start: "top 84%",
              end: "center 46%",
              scrub: 0.4,
            },
          },
        );
        gsap.fromTo(
          promiseImage,
          { yPercent: 3 },
          {
            yPercent: -3,
            ease: "none",
            scrollTrigger: {
              trigger: promiseSection,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.45,
            },
          },
        );
      }
    }, document.body);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      context.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      window.clearTimeout(markRouteTimer);
      window.clearTimeout(introUnlockTimer);
      releaseIntroTouchLock();
      if (restoreFrame) cancelAnimationFrame(restoreFrame);
      if (restoringReload) history.scrollRestoration = previousScrollRestoration;
      removeHeroPointer?.();
      if (root.dataset.pageTransition !== "active") document.body.style.overflow = previousBodyOverflow;
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, [pathname]);

  return <div className="page-progress" aria-hidden="true" />;
}

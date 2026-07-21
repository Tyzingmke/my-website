"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function MotionProvider() {
  const pathname = usePathname();
  const introPlayed = useRef(pathname !== "/");
  const previousPath = useRef(pathname);
  const returnVisit = useRef(0);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = matchMedia("(min-width: 961px) and (pointer: fine)").matches;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    const richMotion = !reduced && desktop && memory >= 4;
    const root = document.documentElement;
    root.dataset.motion = reduced ? "reduced" : richMotion ? "rich" : "standard";
    const returningHome = pathname === "/" && introPlayed.current && previousPath.current !== "/";
    const playHomeIntro = pathname === "/" && (!introPlayed.current || previousPath.current !== "/");
    const returnGreetings = [
      "Hope you still remember me. I'm ",
      "Back already? Good choice. I'm ",
      "You found the way home. I'm ",
      "Still here, still building. I'm ",
    ];
    root.dataset.homeIntro = playHomeIntro ? "playing" : "ready";

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    let markRouteTimer = 0;
    let removeHeroPointer: (() => void) | null = null;
    const previousBodyOverflow = playHomeIntro ? "" : document.body.style.overflow;

    if (playHomeIntro) {
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
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

    const context = gsap.context(() => {
      const hero = document.querySelector<HTMLElement>("[data-home-hero]");
      const intro = document.querySelector<HTMLElement>("[data-intro-greeting]");
      const introPrimary = document.querySelector<HTMLElement>("[data-intro-primary]");
      const introLead = document.querySelector<HTMLElement>("[data-intro-lead]");
      const introAlias = document.querySelector<HTMLElement>("[data-intro-alias]");
      const introAntony = document.querySelector<HTMLElement>("[data-intro-antony]");
      const heroName = document.querySelector<HTMLElement>("[data-hero-name]");

      if (introPrimary && introLead) {
        introLead.textContent = returningHome
          ? returnGreetings[returnVisit.current % returnGreetings.length]
          : "Hi, I'm ";
        introPrimary.toggleAttribute("data-returning", returningHome);
      }

      if (hero && intro && introPrimary && introAlias && introAntony && heroName && playHomeIntro && !reduced && window.scrollY < 80) {
        const source = introAntony.getBoundingClientRect();
        const target = heroName.getBoundingClientRect();
        const shiftX = target.left + target.width / 2 - (source.left + source.width / 2);
        const shiftY = target.top + target.height / 2 - (source.top + source.height / 2);
        const scale = target.width / Math.max(source.width, 1);

        gsap.set(heroName, { autoAlpha: 0 });
        gsap.set("[data-hero-content], [data-hero-card], [data-hero-image='sharp']", { autoAlpha: 0 });
        gsap.set("[data-hero-image='sharp']", { scale: 0.95, yPercent: 6 });
        gsap.set("[data-hero-image='soft']", { autoAlpha: 0.72, scale: 0.91, yPercent: 8 });
        gsap.set([introAlias, introAntony], { autoAlpha: 0 });

        const introTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        introTimeline
          .fromTo(intro, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.44 })
          .to(introPrimary, { autoAlpha: 0, y: -24, scale: 0.96, duration: 0.38 }, 2.38)
          .fromTo(introAlias, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.42 }, 2.52)
          .to(introAlias, { autoAlpha: 0, x: -18, duration: 0.34 }, 4.86)
          .fromTo(
            introAntony,
            { autoAlpha: 0, y: 18, scale: 0.9, filter: "blur(7px)" },
            { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.54 },
            4.78,
          )
          .to(intro, { backgroundColor: "rgba(215, 214, 207, 0)", backdropFilter: "blur(0px)", duration: 1.1 }, 4.72)
          .to(introAntony, { x: shiftX, y: shiftY, scale, duration: 1.14, ease: "power4.inOut" }, 5.34)
          .to(introAntony, { autoAlpha: 0, duration: 0.14 }, 6.38)
          .set(heroName, { autoAlpha: 1 }, 6.42)
          .set(intro, { autoAlpha: 0, visibility: "hidden" }, 6.52)
          .to("[data-hero-image='soft']", { autoAlpha: 0, scale: 1, yPercent: 0, duration: 1.16 }, 4.82)
          .to("[data-hero-image='sharp']", { autoAlpha: 1, scale: 1, yPercent: 0, duration: 1.16 }, 4.82)
          .fromTo("[data-hero-content]", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.62 }, 6.16)
          .fromTo("[data-hero-card]", { autoAlpha: 0, y: 18, rotate: -2 }, { autoAlpha: 1, y: 0, rotate: 0, duration: 0.58, stagger: 0.09 }, 6.24)
          .fromTo(".site-header", { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.62 }, 5.92)
          .eventCallback("onComplete", () => {
            document.body.style.overflow = previousBodyOverflow;
            root.dataset.homeIntro = "ready";
            lenis?.start();
            window.dispatchEvent(new Event("home-intro-complete"));
          });

        if (richMotion) {
          gsap.to("[data-hero-name]", {
            yPercent: -8,
            opacity: 0.42,
            ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
          });
          gsap.to("[data-hero-portrait]", {
            autoAlpha: 0.08,
            scale: 0.985,
            filter: "blur(11px)",
            ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom 42%", scrub: true },
          });
        }
      } else {
        gsap.set("[data-intro-greeting]", { display: "none" });
        gsap.set("[data-hero-image='soft']", { display: "none" });
        gsap.set("[data-hero-image='sharp'], [data-hero-content], [data-hero-card], .site-header", { autoAlpha: 1 });
        root.dataset.homeIntro = "ready";
      }

      if (hero && richMotion) {
        const portrait = document.querySelector<HTMLElement>("[data-hero-portrait]");
        const ambient = document.querySelector<HTMLElement>("[data-hero-ambient]");
        const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-hero-card]"));
        if (portrait) {
          gsap.set(portrait, { xPercent: -50 });
          const portraitX = gsap.quickTo(portrait, "x", { duration: 0.8, ease: "power3.out" });
          const portraitY = gsap.quickTo(portrait, "y", { duration: 0.8, ease: "power3.out" });
          const ambientX = ambient ? gsap.quickTo(ambient, "x", { duration: 1.15, ease: "power3.out" }) : null;
          const ambientY = ambient ? gsap.quickTo(ambient, "y", { duration: 1.15, ease: "power3.out" }) : null;
          const cardMotion = cards.map((card) => ({
            depth: Number(card.dataset.parallaxDepth ?? 1),
            x: gsap.quickTo(card, "x", { duration: 0.72, ease: "power3.out" }),
            y: gsap.quickTo(card, "y", { duration: 0.72, ease: "power3.out" }),
          }));

          const move = (event: PointerEvent) => {
            const bounds = hero.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
            const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
            portraitX(x * 15);
            portraitY(y * 9);
            ambientX?.(x * -10);
            ambientY?.(y * -7);
            cardMotion.forEach((motion) => {
              motion.x(x * 8 * motion.depth);
              motion.y(y * 6 * motion.depth);
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
        const dockItems = Array.from(dock.children) as HTMLElement[];
        const topbarItems = Array.from(topbar.children) as HTMLElement[];
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
          gsap.set(dock, {
            autoAlpha: 1,
            pointerEvents: "none",
            transformPerspective: 1000,
            backgroundColor: "rgba(226, 226, 220, 0)",
            borderColor: "rgba(255, 255, 255, 0)",
            boxShadow: "0 18px 46px rgba(17, 19, 15, 0)",
            backdropFilter: "blur(0px) saturate(1)",
          });
          gsap.set(dockItems, {
            autoAlpha: 0,
            x: (index) => 150 - index * 12,
            y: (index) => -96 + index * 18,
            scale: 0.56,
            rotationY: -34,
            rotationZ: (index) => index % 2 ? 5 : -5,
            transformOrigin: "left center",
            filter: "blur(7px)",
          });

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

          dockTimeline
            .to(siteHeader, {
              top: 14,
              left: 14,
              width: 238,
              height: () => window.innerHeight - 28,
              ease: "none",
              duration: 1,
            }, 0)
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
            .to(".header-nav a", {
              backgroundColor: "rgba(17, 19, 15, 0.74)",
              boxShadow: "0 6px 16px rgba(17, 19, 15, 0.12)",
              duration: 0.2,
              ease: "none",
            }, 0.1)
            .to(topbarItems, {
              x: (index) => index === 0 ? 0 : index === 1 ? -120 : -260,
              y: (index) => index * 18,
              scale: (index) => index === 0 ? 0.96 : index === 1 ? 0.82 : 0.65,
              rotationY: (index) => index === 0 ? 0 : index === 1 ? 12 : 24,
              rotationZ: (index) => index % 2 ? -5 : 5,
              transformOrigin: "left center",
              ease: "none",
              stagger: 0.025,
              duration: 0.76,
            }, 0.06)
            .to(topbarItems, {
              autoAlpha: 0,
              filter: "blur(3px)",
              duration: 0.22,
              ease: "none",
            }, 0.6)
            .set(topbar, { autoAlpha: 0 }, 0.82)
            .to(dock, {
              backgroundColor: "rgba(226, 226, 220, 0.38)",
              borderColor: "rgba(255, 255, 255, 0.42)",
              boxShadow: "0 18px 46px rgba(17, 19, 15, 0.12)",
              backdropFilter: "blur(16px) saturate(0.84)",
              duration: 0.24,
              ease: "none",
            }, 0.74)
            .to(dockItems, {
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
            }, 0.62);

          return () => {
            siteHeader.style.pointerEvents = "";
            dockedState = null;
            setDockState(false);
          };
        });

        dockMedia.add("(max-width: 900px)", () => {
          const mobileItems = Array.from(dock.querySelectorAll<HTMLElement>(".dock-nav a"));
          const mobileBrand = dock.querySelector<HTMLElement>(".dock-brand");
          gsap.set(dock, {
            autoAlpha: 1,
            pointerEvents: "none",
            transformPerspective: 900,
            backgroundColor: "rgba(226, 226, 220, 0)",
            borderColor: "rgba(255, 255, 255, 0)",
            boxShadow: "0 14px 36px rgba(17, 19, 15, 0)",
            backdropFilter: "blur(0px) saturate(1)",
          });
          gsap.set(mobileItems, {
            autoAlpha: 0,
            x: 30,
            y: (index) => -88 + index * 12,
            scale: 0.58,
            rotationY: -28,
            filter: "blur(0px)",
          });
          if (mobileBrand) gsap.set(mobileBrand, { autoAlpha: 0, y: -34, scale: 0.68, filter: "blur(0px)" });

          const railHeight = () => Math.min(310, window.innerHeight - 168);
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

          mobileDock
            .to(siteHeader, {
              top: railTop,
              left: () => window.innerWidth - 68,
              width: 58,
              height: railHeight,
              ease: "none",
              duration: 1,
            }, 0)
            .to(topbar, {
              backgroundColor: "rgba(17, 19, 15, 0)",
              borderColor: "rgba(255, 255, 255, 0)",
              boxShadow: "0 10px 28px rgba(17, 19, 15, 0)",
              backdropFilter: "blur(0px)",
              duration: 0.26,
              ease: "none",
            }, 0.02)
            .to(".header-brand", { borderColor: "rgba(255, 255, 255, 0)", duration: 0.22, ease: "none" }, 0.03)
            .to(topbarItems, {
              y: -34,
              scale: 0.72,
              rotationX: 24,
              ease: "none",
              stagger: 0.03,
              duration: 0.76,
            }, 0.06)
            .to(topbarItems, {
              autoAlpha: 0,
              filter: "blur(3px)",
              duration: 0.22,
              ease: "none",
            }, 0.6)
            .set(topbar, { autoAlpha: 0 }, 0.82)
            .to(dock, {
              backgroundColor: "rgba(226, 226, 220, 0.44)",
              borderColor: "rgba(255, 255, 255, 0.46)",
              boxShadow: "0 14px 36px rgba(17, 19, 15, 0.14)",
              backdropFilter: "blur(16px) saturate(0.84)",
              duration: 0.24,
              ease: "none",
            }, 0.74)
            .to(mobileBrand, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.26,
              ease: "none",
            }, 0.52)
            .to(mobileItems, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotationY: 0,
              filter: "blur(0px)",
              ease: "none",
              stagger: 0.018,
              duration: 0.28,
            }, 0.52);

          return () => {
            siteHeader.style.pointerEvents = "";
            dockedState = null;
            setDockState(false);
          };
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 38 },
          {
            autoAlpha: 1,
            y: 0,
            duration: reduced ? 0 : 0.68,
            ease: "power3.out",
            scrollTrigger: reduced ? undefined : {
              trigger: element,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

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
        if (!track || !section) return;
        const distance = () => Math.max(track.scrollWidth - innerWidth + innerWidth * 0.08, 0);
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: "[data-project-pin]",
            scrub: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      });
    }, document.body);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      context.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      window.clearTimeout(markRouteTimer);
      removeHeroPointer?.();
      if (root.dataset.pageTransition !== "active") document.body.style.overflow = previousBodyOverflow;
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, [pathname]);

  return <div className="page-progress" aria-hidden="true" />;
}

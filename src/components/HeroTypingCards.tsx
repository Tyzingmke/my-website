"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  HandHeart,
  LayoutTemplate,
  Megaphone,
  MessageSquareText,
  PanelsTopLeft,
  RefreshCw,
  Rocket,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
  UserRound,
} from "lucide-react";

const projectTypes = [
  { label: "Business websites", icon: Building2 },
  { label: "Portfolio websites", icon: PanelsTopLeft },
  { label: "Product catalogues", icon: ShoppingBag },
  { label: "Church and NGO sites", icon: HandHeart },
  { label: "Landing pages", icon: Megaphone },
  { label: "Professional profiles", icon: UserRound },
  { label: "Event websites", icon: CalendarDays },
  { label: "Website redesigns", icon: RefreshCw },
];

const outcomes = [
  { label: "Clear enquiry journeys", icon: MessageSquareText },
  { label: "Credible first impressions", icon: BadgeCheck },
  { label: "Mobile-first systems", icon: Smartphone },
  { label: "Search-ready foundations", icon: Search },
  { label: "Fast, focused launches", icon: Rocket },
];

const proofPoints = [
  { label: "Purpose before polish", icon: Sparkles },
  { label: "Clear page structure", icon: LayoutTemplate },
  { label: "Launch-ready delivery", icon: Rocket },
];

function useRotatingType(items: { label: string }[], offset: number) {
  const [value, setValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(items[0].label);
      return;
    }

    let wordIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timer = 0;
    let cancelled = false;

    const schedule = (delay: number) => {
      timer = window.setTimeout(step, delay);
    };

    const step = () => {
      if (cancelled) return;
      const word = items[wordIndex].label;

      if (!deleting) {
        characterIndex += 1;
        setValue(word.slice(0, characterIndex));
        if (characterIndex === word.length) {
          deleting = true;
          schedule(1750);
          return;
        }
        schedule(68);
        return;
      }

      characterIndex -= 1;
      setValue(word.slice(0, characterIndex));
      if (characterIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % items.length;
        setActiveIndex(wordIndex);
        schedule(430);
        return;
      }
      schedule(34);
    };

    const begin = () => schedule(offset);
    const introPlaying = document.documentElement.dataset.homeIntro === "playing";
    if (introPlaying) {
      window.addEventListener("home-intro-complete", begin, { once: true });
    } else {
      begin();
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("home-intro-complete", begin);
    };
  }, [items, offset]);

  return { value, activeIndex };
}

export function HeroTypingCards() {
  const project = useRotatingType(projectTypes, 260);
  const outcome = useRotatingType(outcomes, 1380);
  const proof = useRotatingType(proofPoints, 860);
  const ProjectIcon = projectTypes[project.activeIndex].icon;
  const OutcomeIcon = outcomes[outcome.activeIndex].icon;
  const ProofIcon = proofPoints[proof.activeIndex].icon;

  return (
    <>
      <div className="hero-card hero-card-status" data-hero-card data-parallax-depth="1.1">
        <span className="typing-card-icon" key={project.activeIndex}><ProjectIcon size={22} /></span>
        <div className="typing-card-copy">
          <small>Available for</small>
          <strong className="typing-line" aria-hidden="true">{project.value}<i /></strong>
          <span className="sr-only">Available for business websites, portfolios, catalogues and redesigns.</span>
        </div>
      </div>

      <div className="hero-card hero-card-proof" data-hero-card data-parallax-depth="0.85">
        <span className="typing-card-icon" key={proof.activeIndex}><ProofIcon size={22} /></span>
        <div className="typing-card-copy">
          <small>Working principle</small>
          <strong className="typing-line" aria-hidden="true">{proof.value}<i /></strong>
          <span className="sr-only">Purpose before polish, clear structure and launch-ready delivery.</span>
        </div>
      </div>

      <div className="hero-card hero-card-focus" data-hero-card data-parallax-depth="1.35">
        <small>Designing for</small>
        <span className="typing-focus-line">
          <span className="typing-card-icon" key={outcome.activeIndex}><OutcomeIcon size={21} /></span>
          <strong className="typing-line" aria-hidden="true">{outcome.value}<i /></strong>
        </span>
        <span className="sr-only">Designing for clear enquiry journeys and credible first impressions.</span>
      </div>
    </>
  );
}

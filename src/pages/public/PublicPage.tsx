import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
const details: Record<string, [string, string, string]> = {
  "/about": ["About", "A practice with more than one instrument.", "Development, sound, automotive work and cybersecurity are connected here by attention to detail."],
  "/portfolio": ["Portfolio", "Work with a point of view.", "Projects will become live portfolio records when the content slice ships."],
  "/services": ["Services", "Start at the right level.", "Choose a scoped engagement for an idea, a launch, an audio system or technical support."],
  "/blog": ["Journal", "Notes from the work.", "A publication space for Tony Consults and hosted contributors is part of the content phase."],
  "/marketplace": ["Marketplace", "Useful files, delivered properly.", "The secure digital product and gated-download workflow follows the core access layer."],
  "/contact": ["Contact", "Tell me what needs to work.", "Support tickets and reliable expected-reply states arrive with the support module."],
};
export function PublicPage() { const location = useLocation(); const [label, title, detail] = details[location.pathname] ?? details["/about"]; return <main className="public-page"><p className="eyebrow">Tony Consults / {label}</p><h1>{title}</h1><p>{detail}</p><Link className="button primary" to="/login">Open workspace <ArrowRight size={17} /></Link></main>; }

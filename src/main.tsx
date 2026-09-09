import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const duration = 10 * 24 * 60 * 60 * 1000;
const storageKey = "tony-consults-module-update-deadline";

function getDeadline() {
  const saved = window.localStorage.getItem(storageKey);
  if (saved && Number(saved) > Date.now()) return Number(saved);
  const deadline = Date.now() + duration;
  window.localStorage.setItem(storageKey, String(deadline));
  return deadline;
}

function format(remaining: number) {
  const total = Math.max(0, Math.floor(remaining / 1000));
  return { days: Math.floor(total / 86_400), hours: Math.floor((total % 86_400) / 3_600), minutes: Math.floor((total % 3_600) / 60), seconds: total % 60 };
}

function MaintenancePage() {
  const [deadline] = useState(getDeadline);
  const [time, setTime] = useState(() => format(deadline - Date.now()));
  useEffect(() => { const interval = window.setInterval(() => setTime(format(deadline - Date.now())), 1_000); return () => window.clearInterval(interval); }, [deadline]);
  const units: [string, number][] = [["Days", time.days], ["Hours", time.hours], ["Minutes", time.minutes], ["Seconds", time.seconds]];
  return <main className="maintenance-page"><section className="maintenance-card"><div className="brand"><span>TC</span><div><b>Tony Consults</b><small>Module maintenance</small></div></div><p className="eyebrow">A short pause, with purpose</p><h1>We are currently updating our modules and pages.</h1><p className="intro">The platform is offline while we rebuild the details that make it more useful. Thank you for your patience.</p><div className="countdown" aria-label="Time remaining until the update completes">{units.map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}</div><p className="note">Expected maintenance window: ten days from your first visit.</p></section></main>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><MaintenancePage /></StrictMode>);

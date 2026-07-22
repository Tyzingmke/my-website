"use client";

import { useEffect, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";

type ConsentChoice = "all" | "necessary";

const consentCookie = "antony_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasChoice = document.cookie
      .split(";")
      .some((entry) => entry.trim().startsWith(`${consentCookie}=`));
    setVisible(!hasChoice);
  }, []);

  const saveChoice = (choice: ConsentChoice) => {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${consentCookie}=${choice}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
    setVisible(false);
    window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: { choice } }));
  };

  if (!visible) return null;

  return (
    <aside className="cookie-consent" aria-labelledby="cookie-consent-title" aria-live="polite">
      <div className="cookie-consent-icon" aria-hidden="true"><ShieldCheck size={19} /></div>
      <div>
        <p className="cookie-consent-kicker">Privacy choice</p>
        <h2 id="cookie-consent-title">Your visit, your choice.</h2>
        <p>This portfolio stores only your consent preference. Optional analytics remain off unless you allow them.</p>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" onClick={() => saveChoice("necessary")}><ShieldCheck size={15} />Necessary only</button>
        <button className="cookie-consent-accept" type="button" onClick={() => saveChoice("all")}><Check size={15} />Accept all</button>
      </div>
    </aside>
  );
}

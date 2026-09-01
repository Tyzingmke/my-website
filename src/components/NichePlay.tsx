"use client";

import { FormEvent, useEffect, useState } from "react";
import { HeartHandshake, SmilePlus } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useNicheAccessToken } from "@/components/NicheAccess";
import styles from "@/app/niche/niche.module.css";

const feelings = ["Happy", "Okay", "Need a hug", "Need cheering up", "Quiet day"];

export function NichePlay() {
  const token = useNicheAccessToken();
  const [feeling, setFeeling] = useState(feelings[0]);
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const [question, setQuestion] = useState("Wanna hug?");
  const [yesResponse, setYesResponse] = useState("Yay, so when do we meet?");
  const [noResponse, setNoResponse] = useState("Wacha kukimbilia no.");
  const [answer, setAnswer] = useState("");
  const [noCount, setNoCount] = useState(0);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    void supabase.from("cms_documents").select("published_body").eq("kind", "site_settings").eq("slug", "site-theme").eq("status", "published").limit(1).then(({ data }) => {
      const settings = data?.[0]?.published_body ?? {};
      if (typeof settings.nichePlayQuestion === "string" && settings.nichePlayQuestion.trim()) setQuestion(settings.nichePlayQuestion.trim());
      if (typeof settings.nichePlayYesResponse === "string" && settings.nichePlayYesResponse.trim()) setYesResponse(settings.nichePlayYesResponse.trim());
      if (typeof settings.nichePlayNoResponse === "string" && settings.nichePlayNoResponse.trim()) setNoResponse(settings.nichePlayNoResponse.trim());
    });
  }, []);

  const shareFeeling = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const supabase = getSupabaseBrowserClient(); if (!supabase) return;
    const extra = note.trim() ? ` ${note.trim()}` : "";
    const { data } = await supabase.functions.invoke("niche-chat", { body: { action: "send", token, room: "shared", name: "Mood update", message: `Feeling: ${feeling}.${extra}` } });
    if (data?.ok) { setNote(""); setNotice("Mood update sent to the messenger."); } else setNotice(data?.error ?? "Mood update could not be sent.");
  };
  const tryNo = () => { setNoCount((count) => count + 1); setAnswer(noCount > 1 ? "Hiyo no inakimbia sana. Jaribu tena pole pole." : noResponse); };

  return <section className={styles.play} aria-labelledby="play-title"><header><p>Play corner</p><h1 id="play-title">A little joy check.</h1><span>Share a feeling, then play along.</span></header><div className={styles.playGrid}><form className={styles.feelingCard} onSubmit={shareFeeling}><SmilePlus /><h2>How are you feeling?</h2><p>Choose a mood so the other person can know when a little care would help.</p><div>{feelings.map((item) => <button className={feeling === item ? styles.activeMood : ""} type="button" key={item} onClick={() => setFeeling(item)}>{item}</button>)}</div><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={240} placeholder="Add a small note (optional)" /><button className={styles.playSubmit} type="submit">Share feeling</button>{notice ? <small role="status">{notice}</small> : null}</form><article className={styles.questionCard}><HeartHandshake /><p>One playful question</p><h2>{question}</h2>{answer ? <strong>{answer}</strong> : null}<div className={styles.questionButtons}><button type="button" onClick={() => setAnswer(yesResponse)}>Yes</button><button className={styles.noButton} type="button" onClick={tryNo} style={{ transform: `translate(${(noCount % 3) * 34 - 24}px, ${noCount % 2 ? -18 : 16}px)` }}>No</button></div></article></div></section>;
}

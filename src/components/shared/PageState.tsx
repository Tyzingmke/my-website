import { AlertCircle, LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading workspace" }: { label?: string }) { return <div className="page-state"><LoaderCircle className="spin" size={22} />{label}</div>; }
export function ErrorState({ message }: { message: string }) { return <div className="page-state error"><AlertCircle size={22} />{message}</div>; }
export function EmptyState({ title, detail, action }: { title: string; detail: string; action: string }) { return <section className="empty-state"><p className="eyebrow">Ready when you are</p><h2>{title}</h2><p>{detail}</p><button>{action}</button></section>; }

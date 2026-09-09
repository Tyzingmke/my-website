import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() { return <main className="simple-page"><Link href="/" className="back-link"><ArrowLeft size={16}/> Tony Consults</Link><section className="auth-card"><KeyRound size={26}/><p className="platform-eyebrow">Secure account access</p><h1>Welcome back.</h1><p>Use your email to receive a secure sign-in link. Your role decides which workspace opens next.</p><LoginForm /><small><ShieldCheck size={14}/> Email authentication is connected to your Supabase project.</small></section></main>; }

import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";

export default function LoginPage() { return <main className="simple-page"><Link href="/" className="back-link"><ArrowLeft size={16}/> Tony Consults</Link><section className="auth-card"><KeyRound size={26}/><p className="platform-eyebrow">Secure account access</p><h1>Welcome back.</h1><p>Sign-in, verified email, phone verification and MFA are handled by Supabase Auth.</p><label>Email<input type="email" placeholder="you@example.com" /></label><button>Continue with email</button><small><ShieldCheck size={14}/> Your role decides which workspace opens next.</small></section></main>; }

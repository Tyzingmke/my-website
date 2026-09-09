import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { signIn, signUp } from "@/features/auth/api";

const schema = z.object({ displayName: z.string().min(2).optional(), email: z.string().email("Enter a valid email address."), password: z.string().min(8, "Use at least eight characters.") });
type FormData = z.infer<typeof schema>;
export function AuthPage({ registerMode = false }: { registerMode?: boolean }) {
  const navigate = useNavigate(); const location = useLocation(); const [message, setMessage] = useState("");
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { displayName: "", email: "", password: "" } });
  async function submit(values: FormData) { try { setMessage(""); if (registerMode) await signUp(values.email, values.password, values.displayName ?? ""); else await signIn(values.email, values.password); navigate(location.state?.from ?? "/dashboard/client"); } catch (error) { setMessage(error instanceof Error ? error.message : "Sign-in could not be completed."); } }
  return <main className="auth-page"><Link className="wordmark" to="/"><span>TC</span><b>Tony Consults</b></Link><section className="auth-card"><LockKeyhole size={22} /><p className="eyebrow">Secure workspace</p><h1>{registerMode ? "Create your account." : "Welcome back."}</h1><p>{registerMode ? "Start with your email and password. Additional verification is introduced by role." : "Sign in to open the workspace assigned to your role."}</p><form onSubmit={form.handleSubmit(submit)}>{registerMode && <label>Name<input {...form.register("displayName")} placeholder="Your name" /></label>}<label>Email<input {...form.register("email")} type="email" autoComplete="email" placeholder="you@example.com" /></label><label>Password<input {...form.register("password")} type="password" autoComplete={registerMode ? "new-password" : "current-password"} placeholder="At least 8 characters" /></label>{Object.values(form.formState.errors).map((error) => <small className="form-error" key={error.message}>{error.message}</small>)}{message && <small className="form-error">{message}</small>}<button className="button primary" type="submit">{registerMode ? "Create account" : "Sign in"}<ArrowRight size={17} /></button></form><p className="auth-switch">{registerMode ? "Already have an account?" : "New here?"} <Link to={registerMode ? "/login" : "/register"}>{registerMode ? "Sign in" : "Create an account"}</Link></p></section></main>;
}

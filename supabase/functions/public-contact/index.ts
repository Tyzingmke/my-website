import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2.112.4/cors";

const workspaceId = "7ec3d48f-4435-4fd8-9651-2e0739c8cdd3";
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return json({ ok: true });
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);
  const origin = request.headers.get("Origin");
  if (origin && !["https://www.tonyconsults.co.ke", "https://tonyconsults.co.ke", "http://localhost:3000"].includes(origin)) return json({ ok: false, error: "Origin not allowed." }, 403);
  const body = await request.json().catch(() => null) as { name?: string; email?: string; phone?: string; company?: string; message?: string; website?: string } | null;
  if (body?.website || !body?.name?.trim() || !/^\S+@\S+\.\S+$/.test(body?.email ?? "") || !body?.message?.trim()) return json({ ok: false, error: "Please enter your name, email and a short project message." }, 400);
  const service = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { error } = await service.from("form_submissions").insert({ workspace_id: workspaceId, form_key: "contact", payload: { name: body.name.trim().slice(0, 120), email: body.email.trim().toLowerCase().slice(0, 180), phone: body.phone?.trim().slice(0, 40) ?? "", company: body.company?.trim().slice(0, 120) ?? "", message: body.message.trim().slice(0, 3000) }, source_url: origin ?? "public-contact" });
  return error ? json({ ok: false, error: "Your message could not be sent. Please use WhatsApp or email instead." }, 500) : json({ ok: true });
});

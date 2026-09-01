import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2.112.4/cors";

const workspaceId = "7ec3d48f-4435-4fd8-9651-2e0739c8cdd3";

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return json({ ok: true });
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);
  const answer = String((await request.json().catch(() => ({}))).answer ?? "");
  if (!answer.trim() || answer.length > 120) return json({ ok: false, error: "A one-word answer is needed." }, 400);
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) return json({ ok: false, error: "Private access is unavailable right now." }, 503);
  const service = createClient(url, serviceKey);
  const { data, error } = await service.from("workspaces").select("settings").eq("id", workspaceId).maybeSingle();
  if (error) return json({ ok: false, error: "Private access is unavailable right now." }, 503);
  const expectedHash = typeof data?.settings?.niche_password_hash === "string" ? data.settings.niche_password_hash : "";
  if (!expectedHash) return json({ ok: false, error: "This page is being prepared." }, 503);
  if (await sha256(answer) !== expectedHash) return json({ ok: false, error: "A little closer. The answer is one word." }, 401);
  const token = createToken();
  const { error: sessionError } = await service.from("niche_chat_sessions").insert({ token_hash: await sha256(token), expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString() });
  if (sessionError) return json({ ok: false, error: "Private access is being prepared." }, 503);
  return json({ ok: true, token });
});

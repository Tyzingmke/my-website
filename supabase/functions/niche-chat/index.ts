import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2.112.4/cors";

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), (byte) => byte.toString(16).padStart(2, "0")).join("");

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return json({ ok: true });
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);
  const body = await request.json().catch(() => ({})) as { action?: string; token?: string; id?: string; name?: string; message?: string };
  if (!body.token || body.token.length > 200) return json({ ok: false, error: "Private access is required." }, 401);
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) return json({ ok: false, error: "The chat is unavailable right now." }, 503);
  const service = createClient(url, serviceKey);
  const { data: session } = await service.from("niche_chat_sessions").select("id, expires_at").eq("token_hash", await hash(body.token)).maybeSingle();
  if (!session || new Date(session.expires_at).getTime() < Date.now()) return json({ ok: false, error: "This private session has expired." }, 401);
  if (body.action === "list") {
    const { data, error } = await service.from("niche_chat_messages").select("id, session_id, author_name, message, created_at").is("deleted_at", null).order("created_at", { ascending: true }).limit(200);
    if (error) return json({ ok: false, error: "Messages could not be loaded." }, 500);
    return json({ ok: true, messages: (data ?? []).map((item) => ({ ...item, mine: item.session_id === session.id })) });
  }
  if (body.action === "send") {
    const name = String(body.name ?? "").trim().slice(0, 40);
    const message = String(body.message ?? "").trim().slice(0, 1000);
    if (!name || !message) return json({ ok: false, error: "A name and note are required." }, 400);
    const { data, error } = await service.from("niche_chat_messages").insert({ session_id: session.id, author_name: name, message }).select("id, session_id, author_name, message, created_at").single();
    if (error) return json({ ok: false, error: "The note could not be sent." }, 500);
    return json({ ok: true, message: { ...data, mine: true } });
  }
  if (body.action === "delete") {
    const { error } = await service.from("niche_chat_messages").update({ deleted_at: new Date().toISOString() }).eq("id", body.id ?? "").eq("session_id", session.id).is("deleted_at", null);
    if (error) return json({ ok: false, error: "The note could not be deleted." }, 500);
    return json({ ok: true });
  }
  return json({ ok: false, error: "Unknown chat action." }, 400);
});

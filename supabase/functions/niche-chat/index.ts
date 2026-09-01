import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2.112.4/cors";

const bucket = "niche-messenger";
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "audio/webm", "audio/ogg", "audio/mpeg", "audio/mp4"]);
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), (byte) => byte.toString(16).padStart(2, "0")).join("");
const roomFor = (value: unknown) => value === "shared" || value === "personal" ? value : null;
const safeName = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(-80) || "attachment";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return json({ ok: true });
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);
  const body = await request.json().catch(() => ({})) as { action?: string; token?: string; id?: string; name?: string; message?: string; room?: string; filename?: string; fileType?: string; fileSize?: number; attachment?: { path?: string; name?: string; type?: string } };
  if (!body.token || body.token.length > 200) return json({ ok: false, error: "Private access is required." }, 401);
  const room = roomFor(body.room);
  if (!room) return json({ ok: false, error: "Choose a valid private room." }, 400);
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) return json({ ok: false, error: "The chat is unavailable right now." }, 503);
  const service = createClient(url, serviceKey);
  const { data: session } = await service.from("niche_chat_sessions").select("id, expires_at").eq("token_hash", await hash(body.token)).maybeSingle();
  if (!session || new Date(session.expires_at).getTime() < Date.now()) return json({ ok: false, error: "This private session has expired." }, 401);
  if (body.action === "upload-url") {
    const type = String(body.fileType ?? ""); const size = Number(body.fileSize ?? 0);
    if (!allowedTypes.has(type) || !Number.isFinite(size) || size < 1 || size > 10 * 1024 * 1024) return json({ ok: false, error: "Use a supported image or audio file under 10 MB." }, 400);
    const path = `${session.id}/${room}/${crypto.randomUUID()}-${safeName(String(body.filename ?? "attachment"))}`;
    const { data, error } = await service.storage.from(bucket).createSignedUploadUrl(path);
    if (error || !data) return json({ ok: false, error: "The upload link could not be created." }, 500);
    return json({ ok: true, path, uploadToken: data.token });
  }
  if (body.action === "list") {
    const { data, error } = await service.from("niche_chat_messages").select("id, session_id, author_name, message, attachment_path, attachment_name, attachment_type, created_at").eq("room", room).is("deleted_at", null).order("created_at", { ascending: true }).limit(200);
    if (error) return json({ ok: false, error: "Messages could not be loaded." }, 500);
    const messages = await Promise.all((data ?? []).map(async (item) => {
      const attachment = item.attachment_path ? await service.storage.from(bucket).createSignedUrl(item.attachment_path, 60 * 30) : null;
      return { id: item.id, author_name: item.author_name, message: item.message, created_at: item.created_at, mine: item.session_id === session.id, attachment: item.attachment_path ? { path: item.attachment_path, name: item.attachment_name, type: item.attachment_type, url: attachment?.data?.signedUrl ?? "" } : null };
    }));
    return json({ ok: true, messages });
  }
  if (body.action === "send") {
    const name = String(body.name ?? "").trim().slice(0, 40); const message = String(body.message ?? "").trim().slice(0, 1000);
    const attachment = body.attachment?.path && body.attachment?.name && body.attachment?.type ? { path: body.attachment.path, name: String(body.attachment.name).slice(0, 160), type: body.attachment.type } : null;
    if (!name || (!message && !attachment)) return json({ ok: false, error: "Write a message or attach a file." }, 400);
    if (attachment && (!allowedTypes.has(attachment.type) || !attachment.path.startsWith(`${session.id}/${room}/`))) return json({ ok: false, error: "This attachment is not available for this room." }, 400);
    const { error } = await service.from("niche_chat_messages").insert({ session_id: session.id, room, author_name: name, message, attachment_path: attachment?.path ?? null, attachment_name: attachment?.name ?? null, attachment_type: attachment?.type ?? null });
    if (error) return json({ ok: false, error: "The message could not be sent." }, 500);
    return json({ ok: true });
  }
  if (body.action === "delete") {
    const { data: existing } = await service.from("niche_chat_messages").select("attachment_path").eq("id", body.id ?? "").eq("room", room).eq("session_id", session.id).is("deleted_at", null).maybeSingle();
    const { error } = await service.from("niche_chat_messages").update({ deleted_at: new Date().toISOString() }).eq("id", body.id ?? "").eq("room", room).eq("session_id", session.id).is("deleted_at", null);
    if (error) return json({ ok: false, error: "The message could not be deleted." }, 500);
    if (existing?.attachment_path) await service.storage.from(bucket).remove([existing.attachment_path]);
    return json({ ok: true });
  }
  return json({ ok: false, error: "Unknown chat action." }, 400);
});

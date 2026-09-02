import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2.112.4/cors";

const reply = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return reply({ ok: true });
  if (request.method !== "POST") return reply({ ok: false, error: "Method not allowed." }, 405);
  const authorization = request.headers.get("Authorization");
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!authorization || !url || !key || !serviceKey) return reply({ ok: false, error: "Private invitation service is unavailable." }, 503);
  const auth = createClient(url, key, { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return reply({ ok: false, error: "Sign in is required." }, 401);
  const body = await request.json().catch(() => null) as { email?: string; spaceId?: string; displayName?: string } | null;
  if (!body?.email || !body.spaceId) return reply({ ok: false, error: "An email and private space are required." }, 400);
  const service = createClient(url, serviceKey);
  const { data: owner } = await service.from("universe_members").select("space_id").eq("space_id", body.spaceId).eq("user_id", user.id).eq("role", "owner").maybeSingle();
  if (!owner) return reply({ ok: false, error: "Only the space owner can invite a partner." }, 403);
  const { data: invitation, error: invitationError } = await service.auth.admin.inviteUserByEmail(body.email.trim().toLowerCase(), { redirectTo: "https://www.tonyconsults.co.ke/us/" });
  if (invitationError || !invitation.user) return reply({ ok: false, error: invitationError?.message ?? "Could not create invitation." }, 400);
  const { error: membershipError } = await service.from("universe_members").upsert({ space_id: body.spaceId, user_id: invitation.user.id, role: "partner", shell: "romantic", display_name: body.displayName?.trim() || "Stargazer" }, { onConflict: "space_id,user_id" });
  if (membershipError) return reply({ ok: false, error: membershipError.message }, 400);
  await service.from("universe_audit_events").insert({ space_id: body.spaceId, actor_id: user.id, action: "partner.invited", metadata: { email: body.email.trim().toLowerCase() } });
  return reply({ ok: true });
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2.112.4/cors";

type SaveDocumentInput = {
  action: "save-document";
  id: string;
  version: number;
  title: string;
  slug: string;
  draft_body: Record<string, unknown>;
  publish?: boolean;
};

type DeleteSubmissionInput = {
  action: "delete-submission";
  id: string;
};

type StudioInput = SaveDocumentInput | DeleteSubmissionInput;

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

function may(membership: { role: string; capabilities: string[] } | null, capability: string) {
  return membership?.role === "owner" || membership?.role === "admin" || membership?.capabilities.includes(capability);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return json({ ok: true });
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization) return json({ ok: false, error: "Sign in is required." }, 401);
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !publishableKey || !serviceKey) return json({ ok: false, error: "CMS server credentials are not available." }, 503);

  const authClient = createClient(url, publishableKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await authClient.auth.getUser();
  if (userError || !userData.user) return json({ ok: false, error: "Your session is not valid." }, 401);

  const service = createClient(url, serviceKey);
  const { data: membership } = await service
    .from("workspace_memberships")
    .select("workspace_id, role, capabilities")
    .eq("user_id", userData.user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  if (!membership) return json({ ok: false, error: "You do not have permission to access this workspace." }, 403);

  const body = await request.json().catch(() => null) as StudioInput | null;
  if (body?.action === "delete-submission") {
    if (!may(membership, "form.manage")) return json({ ok: false, error: "You do not have permission to delete enquiries." }, 403);
    if (!body.id) return json({ ok: false, error: "An enquiry is required." }, 400);
    const { data: submission, error } = await service
      .from("form_submissions")
      .delete()
      .eq("id", body.id)
      .eq("workspace_id", membership.workspace_id)
      .select("id")
      .maybeSingle();
    if (error) return json({ ok: false, error: error.message }, 400);
    if (!submission) return json({ ok: false, error: "This enquiry no longer exists." }, 404);
    await service.from("audit_events").insert({
      workspace_id: membership.workspace_id,
      actor_id: userData.user.id,
      action: "submission.deleted",
      entity_type: "form_submission",
      entity_id: body.id,
      metadata: { form_key: "contact" },
    });
    return json({ ok: true });
  }

  if (body?.action !== "save-document" || !body.id || !body.title?.trim() || !body.slug?.trim()) return json({ ok: false, error: "A document, title and URL slug are required." }, 400);
  if (!may(membership, "page.edit")) return json({ ok: false, error: "You do not have permission to edit this workspace." }, 403);
  if (body.publish && !may(membership, "page.publish")) return json({ ok: false, error: "Your role can save drafts but cannot publish." }, 403);

  const update = {
    title: body.title.trim(),
    slug: body.slug.trim(),
    draft_body: body.draft_body,
    updated_by: userData.user.id,
    ...(body.publish ? { status: "published", published_body: body.draft_body, published_at: new Date().toISOString(), published_by: userData.user.id } : {}),
  };
  const { data: document, error } = await service
    .from("cms_documents")
    .update(update)
    .eq("id", body.id)
    .eq("workspace_id", membership.workspace_id)
    .eq("version", body.version)
    .select("id, workspace_id, kind, slug, title, status, schema_version, draft_body, published_body, version, updated_at, published_at")
    .maybeSingle();
  if (error) return json({ ok: false, error: error.message }, 400);
  if (!document) return json({ ok: false, error: "This page changed elsewhere. Reload it before saving." }, 409);

  await service.from("audit_events").insert({
    workspace_id: membership.workspace_id,
    actor_id: userData.user.id,
    action: body.publish ? "document.published" : "document.saved",
    entity_type: "cms_document",
    entity_id: body.id,
    metadata: { slug: document.slug, title: document.title },
  });
  return json({ ok: true, document });
});

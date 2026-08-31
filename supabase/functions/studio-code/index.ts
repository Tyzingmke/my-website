import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.112.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2.112.4/cors";

const repository = "Tyzingmke/my-website";
const branch = "main";
const allowedFiles = new Set([
  "src/app/page.tsx", "src/app/about/page.tsx", "src/app/work/page.tsx", "src/app/services/page.tsx", "src/app/contact/page.tsx", "src/app/website-design-kenya/page.tsx", "src/app/guides/website-cost-kenya/page.tsx",
  "src/components/PageTransition.tsx", "src/components/MotionProvider.tsx", "src/components/FirstLoadScreen.tsx", "src/components/ScrollExperience.tsx",
  "src/components/Header.tsx", "src/components/Footer.tsx", "src/components/AppFrame.tsx", "src/components/admin/AdminStudio.tsx",
  "src/app/globals.css", "src/app/admin/studio.css", "src/data/site.ts", "src/app/layout.tsx",
]);

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const decode = (value: string) => new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\n/g, "")), (character) => character.charCodeAt(0)));
const encode = (value: string) => btoa(String.fromCharCode(...new TextEncoder().encode(value)));

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return json({ ok: true });
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);
  const authorization = request.headers.get("Authorization");
  if (!authorization) return json({ ok: false, error: "Sign in is required." }, 401);
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return json({ ok: false, error: "Your session is not valid." }, 401);
  const { data: memberships } = await supabase.from("workspace_memberships").select("role, capabilities").eq("user_id", userData.user.id).eq("status", "active").limit(1);
  const membership = memberships?.[0];
  if (!membership || (membership.role !== "owner" && !membership.capabilities.includes("integration.manage"))) return json({ ok: false, error: "You do not have permission to edit source code." }, 403);

  const body = await request.json().catch(() => null) as { action?: string; path?: string; content?: string; sha?: string; message?: string } | null;
  if (!body?.path || !allowedFiles.has(body.path)) return json({ ok: false, error: "That source file is not available in Studio." }, 400);
  const token = Deno.env.get("GITHUB_TONY_CONSULTS_TOKEN");
  if (!token) return json({ ok: false, error: "The secure GitHub publishing token has not been configured yet." }, 503);
  const endpoint = `https://api.github.com/repos/${repository}/contents/${body.path}`;
  const headers = { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" };

  if (body.action === "read") {
    const response = await fetch(`${endpoint}?ref=${branch}`, { headers });
    if (!response.ok) return json({ ok: false, error: `GitHub could not load this file (${response.status}).` }, response.status);
    const file = await response.json() as { content?: string; sha?: string; encoding?: string };
    if (!file.content || !file.sha || file.encoding !== "base64") return json({ ok: false, error: "GitHub returned an unsupported file format." }, 502);
    return json({ ok: true, content: decode(file.content), sha: file.sha });
  }

  if (body.action === "write") {
    if (typeof body.content !== "string" || !body.sha) return json({ ok: false, error: "Content and the current file revision are required." }, 400);
    const response = await fetch(endpoint, { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ message: body.message?.slice(0, 160) || `Update ${body.path} from Studio`, content: encode(body.content), sha: body.sha, branch }) });
    if (!response.ok) return json({ ok: false, error: `GitHub rejected this change (${response.status}). Reload the file and resolve any conflicting update.` }, response.status);
    const result = await response.json() as { content?: { sha?: string } };
    return json({ ok: true, sha: result.content?.sha ?? body.sha });
  }

  return json({ ok: false, error: "Unknown code operation." }, 400);
});

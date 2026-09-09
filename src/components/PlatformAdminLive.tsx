"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleAlert, LoaderCircle, LogOut, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type LiveState = { mode: "loading" } | { mode: "signed-out" } | { mode: "setup"; email: string } | { mode: "ready"; workspace: string; role: string; tickets: number; content: number; products: number; orders: number } | { mode: "error"; message: string };

export function PlatformAdminLive() {
  const [state, setState] = useState<LiveState>({ mode: "loading" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!supabase) { setState({ mode: "error", message: "Supabase environment variables are not configured." }); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState({ mode: "signed-out" }); return; }
      const { data: membership, error } = await supabase.from("platform_memberships").select("workspace_id, role, platform_workspaces(name)").eq("user_id", user.id).eq("status", "active").limit(1).maybeSingle();
      if (error) { setState({ mode: "error", message: error.message }); return; }
      if (!membership) { setState({ mode: "setup", email: user.email ?? "your account" }); return; }
      const workspaceId = membership.workspace_id;
      const [tickets, content, products, orders] = await Promise.all([
        supabase.from("platform_tickets").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).in("status", ["new", "open"]),
        supabase.from("platform_content").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "published"),
        supabase.from("platform_products").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "published"),
        supabase.from("platform_orders").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "paid"),
      ]);
      const workspace = membership.platform_workspaces as unknown as { name: string } | null;
      setState({ mode: "ready", workspace: workspace?.name ?? "Workspace", role: membership.role, tickets: tickets.count ?? 0, content: content.count ?? 0, products: products.count ?? 0, orders: orders.count ?? 0 });
    };
    void load();
  }, []);

  async function createWorkspace() {
    if (!supabase) return;
    setCreating(true);
    const { error } = await supabase.rpc("platform_bootstrap_workspace", { workspace_name: "Tony Consults", workspace_slug: "tony-consults" });
    if (error) { setState({ mode: "error", message: error.message }); setCreating(false); return; }
    window.location.reload();
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.assign("/login/");
  }

  if (state.mode === "loading") return <section className="admin-live loading"><LoaderCircle className="spin" /> Connecting to your workspace</section>;
  if (state.mode === "signed-out") return <section className="admin-live"><CircleAlert /><div><b>Sign in to open the real workspace.</b><p>This screen only reveals data allowed by your Supabase role.</p></div><Link href="/login/">Sign in <ArrowUpRight size={15}/></Link></section>;
  if (state.mode === "setup") return <section className="admin-live"><Plus /><div><b>Create your Tony Consults workspace.</b><p>{state.email} is verified, but has not yet been made a workspace owner.</p></div><button onClick={() => void createWorkspace()} disabled={creating}>{creating ? "Creating…" : "Create workspace"}</button></section>;
  if (state.mode === "error") return <section className="admin-live"><CircleAlert /><div><b>Workspace connection needs attention.</b><p>{state.message}</p></div></section>;
  return <section className="admin-data"><div className="admin-live ready"><CheckCircle2 /><div><b>{state.workspace} is connected.</b><p>{state.role} access. Counts below come from live workspace records.</p></div><button onClick={() => void signOut()}><LogOut size={14} /> Log out</button></div><div className="admin-stats"><article><span>Open tickets</span><strong>{state.tickets}</strong><small>New and open client requests</small></article><article><span>Published content</span><strong>{state.content}</strong><small>Records visible to visitors</small></article><article><span>Active products</span><strong>{state.products}</strong><small>Published marketplace entries</small></article><article><span>Paid orders</span><strong>{state.orders}</strong><small>Recorded order confirmations</small></article></div><section className="admin-empty-state"><p className="platform-eyebrow">Live workspace</p><h2>Start with the work in front of you.</h2><p>Content, products, tickets, orders and audit events now have separate database records and role-aware access. Populate them through the next workspace tools rather than relying on placeholder cards.</p></section></section>;
}

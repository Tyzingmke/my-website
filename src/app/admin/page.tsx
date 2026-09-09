import Link from "next/link";
import { ArrowUpRight, Bell, ChartNoAxesCombined, ChevronDown, FileText, LayoutDashboard, Package, Settings, TicketCheck, UsersRound } from "lucide-react";
import { PlatformAdminLive } from "@/components/PlatformAdminLive";

const nav = [[LayoutDashboard, "Overview"], [FileText, "Content"], [Package, "Marketplace"], [TicketCheck, "Tickets"], [UsersRound, "People"], [ChartNoAxesCombined, "Insights"], [Settings, "Settings"]];

export default function AdminPage() { return <main className="admin-shell"><aside className="admin-side"><Link href="/" className="admin-brand"><span>TC</span><b>Tony Consults</b><small>Platform admin</small></Link><nav>{nav.map(([Icon, label], index) => <button className={index === 0 ? "active" : ""} key={label as string}><Icon size={18}/><span>{label as string}</span></button>)}</nav><div className="admin-user"><span>TC</span><div><b>Workspace account</b><small>Role-aware access</small></div><ChevronDown size={16}/></div></aside><section className="admin-main"><header><div><p>Workspace / Overview</p><h1>Platform overview.</h1></div><div><button aria-label="Notifications"><Bell size={18}/><i/></button><Link href="/">View public site <ArrowUpRight size={16}/></Link></div></header><PlatformAdminLive/><footer>Platform foundation · Supabase Auth and Postgres · Static app delivered through GitHub Pages</footer></section></main>; }

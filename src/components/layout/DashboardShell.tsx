import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Bell, LayoutDashboard, LogOut, Menu, Package, Settings, Ticket, Users } from "lucide-react";
import type { Role } from "@/features/auth/api";
import { signOut } from "@/features/auth/api";
import { useUiStore } from "@/stores/uiStore";

const menu: Record<Role, [string, string, typeof LayoutDashboard][]> = {
  admin: [["Overview", "/dashboard/admin", LayoutDashboard], ["Users", "/dashboard/admin/users", Users], ["Tickets", "/dashboard/admin/tickets", Ticket], ["Orders", "/dashboard/admin/orders", Package], ["Themes", "/dashboard/admin/themes", Settings]],
  staff: [["Overview", "/dashboard/staff", LayoutDashboard], ["Tickets", "/dashboard/staff/tickets", Ticket]],
  seller: [["Overview", "/dashboard/seller", LayoutDashboard], ["Products", "/dashboard/seller/products", Package]],
  blogger: [["Overview", "/dashboard/blogger", LayoutDashboard], ["Posts", "/dashboard/blogger/posts", Package]],
  client: [["Overview", "/dashboard/client", LayoutDashboard], ["Tickets", "/dashboard/client/tickets", Ticket]],
};

export function DashboardShell({ role, children }: { role: Role; children: ReactNode }) {
  const location = useLocation(); const { sidebarOpen, setSidebarOpen } = useUiStore();
  return <div className="dashboard-shell"><aside className={sidebarOpen ? "dash-sidebar open" : "dash-sidebar"}><Link className="wordmark" to="/"><span>TC</span><b>Tony Consults</b></Link><p className="eyebrow">{role} workspace</p><nav>{menu[role].map(([label, path, Icon]) => <Link key={path} className={location.pathname === path ? "active" : ""} to={path} onClick={() => setSidebarOpen(false)}><Icon size={17} />{label}</Link>)}</nav><button className="logout" onClick={() => void signOut()}><LogOut size={16} />Log out</button></aside><main className="dash-main"><header><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Open navigation"><Menu size={18} /></button><div><p className="eyebrow">Tony Consults / {role}</p><h1>Good work starts here.</h1></div><button className="icon-button" aria-label="Notifications"><Bell size={18} /></button></header>{children}</main></div>;
}

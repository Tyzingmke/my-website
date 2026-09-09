import type { Role } from "@/features/auth/api";
import { EmptyState } from "@/components/shared/PageState";

const copy: Record<Role, [string, string, string]> = {
  admin: ["Control the platform with real access rules.", "The core users, roles and permissions slice is live. Content, orders and tickets are next modules, each with its own RLS policies.", "Manage people"],
  staff: ["Keep client work moving.", "Your ticket and operations dashboard will appear as soon as the support module is connected.", "View tickets"],
  seller: ["Prepare your first digital product.", "Secure product files and payment-confirmed downloads are part of the marketplace slice.", "Add product"],
  blogger: ["Write in your own space.", "Posts and approved themes will appear when the content module is enabled.", "Create post"],
  client: ["Your work has a home here.", "Tickets, orders and your profile will appear as they are created for your account.", "Open support"],
};
export function DashboardOverview({ role }: { role: Role }) { const [title, detail, action] = copy[role]; return <section className="dashboard-content"><div className="stat-grid"><article><span>Role</span><strong>{role}</strong><small>Resolved from your profile</small></article><article><span>Access</span><strong>Active</strong><small>Protected by RLS</small></article><article><span>Next module</span><strong>Content</strong><small>Built on the same shell</small></article></div><EmptyState title={title} detail={detail} action={action} /></section>; }

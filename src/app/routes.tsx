import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleGuard } from "@/features/auth/RoleGuard";
import type { Role } from "@/features/auth/api";
import { pageTransition } from "@/lib/motion";
import { Home } from "@/pages/public/Home";
import { PublicPage } from "@/pages/public/PublicPage";
import { AuthPage } from "@/pages/auth/AuthPage";
import { DashboardOverview } from "@/pages/dashboard/DashboardOverview";

function DashboardRoute({ role }: { role: Role }) { return <RoleGuard allow={[role]}><DashboardShell role={role}><DashboardOverview role={role} /></DashboardShell></RoleGuard>; }
function RouteMotion() { const location = useLocation(); return <AnimatePresence mode="wait"><motion.div key={location.pathname} {...pageTransition}><Routes location={location}><Route element={<SiteShell />}><Route path="/" element={<Home />} /><Route path="/about" element={<PublicPage />} /><Route path="/portfolio" element={<PublicPage />} /><Route path="/services" element={<PublicPage />} /><Route path="/blog" element={<PublicPage />} /><Route path="/marketplace" element={<PublicPage />} /><Route path="/contact" element={<PublicPage />} /></Route><Route path="/login" element={<AuthPage />} /><Route path="/register" element={<AuthPage registerMode />} /><Route path="/dashboard/admin/*" element={<DashboardRoute role="admin" />} /><Route path="/dashboard/staff/*" element={<DashboardRoute role="staff" />} /><Route path="/dashboard/seller/*" element={<DashboardRoute role="seller" />} /><Route path="/dashboard/blogger/*" element={<DashboardRoute role="blogger" />} /><Route path="/dashboard/client/*" element={<DashboardRoute role="client" />} /><Route path="*" element={<PublicPage />} /></Routes></motion.div></AnimatePresence>; }
export function AppRoutes() { return <RouteMotion />; }

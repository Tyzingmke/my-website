import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { Role } from "@/features/auth/api";
import { getProfile } from "@/features/auth/api";
import { useAuth } from "@/features/auth/AuthProvider";
import { ErrorState, LoadingState } from "@/components/shared/PageState";

export function RoleGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { session, loading } = useAuth(); const location = useLocation();
  const profile = useQuery({ queryKey: ["profile", session?.user.id], queryFn: () => getProfile(session!.user.id), enabled: !!session });
  if (loading || profile.isLoading) return <LoadingState label="Checking your workspace access" />;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (profile.isError) return <ErrorState message={profile.error.message} />;
  if (!profile.data || !allow.includes(profile.data.role_id)) return <Navigate to={`/dashboard/${profile.data?.role_id ?? "client"}`} replace />;
  return <>{children}</>;
}

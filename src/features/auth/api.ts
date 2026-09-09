import { requireSupabase } from "@/lib/supabase";

export type Role = "admin" | "staff" | "seller" | "blogger" | "client";
export type Profile = { id: string; role_id: Role; display_name: string | null; avatar_url: string | null };

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await requireSupabase().from("tc_profiles").select("id, role_id, display_name, avatar_url").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email: string, password: string, displayName: string) {
  const { error } = await requireSupabase().auth.signUp({ email, password, options: { data: { display_name: displayName } } });
  if (error) throw error;
}

export async function signOut() { const { error } = await requireSupabase().auth.signOut(); if (error) throw error; }

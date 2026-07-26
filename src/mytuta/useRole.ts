import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "student" | "teacher";

interface StoredProfile {
  name?: string;
  userType?: Role;
  [k: string]: unknown;
}

function readProfile(): StoredProfile {
  try {
    return JSON.parse(localStorage.getItem("userProfile") || "{}");
  } catch {
    return {};
  }
}

export function getRole(): Role {
  return readProfile().userType === "teacher" ? "teacher" : "student";
}

export function setStoredRole(role: Role) {
  const p = readProfile();
  p.userType = role;
  localStorage.setItem("userProfile", JSON.stringify(p));
  window.dispatchEvent(new Event("mytuta-role"));
}

export function getInitials(): string {
  const name = (readProfile().name || "").trim();
  if (!name) return "?";
  const parts = name.split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

/** Hydrate local role from profiles.user_type (source of truth for RLS). */
export async function hydrateRoleFromDb(): Promise<Role | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, first_name, last_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) return null;
  const role: Role = profile.user_type === "teacher" ? "teacher" : "student";
  const name =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() ||
    (user.user_metadata?.full_name as string | undefined) ||
    readProfile().name ||
    "";
  const p = readProfile();
  p.userType = role;
  if (name) p.name = name;
  localStorage.setItem("userProfile", JSON.stringify(p));
  window.dispatchEvent(new Event("mytuta-role"));
  return role;
}

/** Live role from signup/profile. No in-app student↔teacher switch. */
export function useRole(): [Role] {
  const [role, setR] = useState<Role>(getRole);
  useEffect(() => {
    const handler = () => setR(getRole());
    window.addEventListener("mytuta-role", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("mytuta-role", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return [role];
}

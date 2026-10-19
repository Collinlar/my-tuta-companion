import { useEffect, useState } from "react";
import { AuthService } from "@/services/authService";
import { getRole, type Role } from "@/mytuta/useRole";

export interface AuthState {
  authed: boolean;
  role: Role;
  /** Where a signed-in user's "go to the app" action should land. */
  homePath: string;
  /** True until the first session check resolves. */
  loading: boolean;
}

/**
 * Live auth state for public pages (marketing header, pricing). Reads the
 * current Supabase session and stays in sync with sign in / sign out, so a
 * signed-in visitor never sees a "Sign in" call to action.
 */
export function useAuthState(): AuthState {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>(getRole);

  useEffect(() => {
    let active = true;
    void AuthService.isAuthenticated().then((a) => {
      if (!active) return;
      setAuthed(a);
      setRole(getRole());
      setLoading(false);
    });

    const { data: listener } = AuthService.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        setAuthed(session !== null);
        setRole(getRole());
      }
    });
    const onRole = () => setRole(getRole());
    window.addEventListener("mytuta-role", onRole);

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
      window.removeEventListener("mytuta-role", onRole);
    };
  }, []);

  return { authed, role, homePath: role === "teacher" ? "/teacher/home" : "/student/home", loading };
}

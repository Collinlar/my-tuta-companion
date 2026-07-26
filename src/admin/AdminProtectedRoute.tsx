import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { a } from "./theme";

/**
 * Gates the /admin/* tree on BOTH authentication and active admin membership
 * (server-checked via current_user_is_admin()). Unlike the app's ProtectedRoute
 * this is an authorization guard: a signed-in student/teacher who is not an
 * admin is redirected away rather than shown the panel.
 */
export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "ok" | "denied" | "anon">("checking");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (!cancelled) setState("anon"); return; }
      const { data, error } = await supabase.rpc("current_user_is_admin");
      if (cancelled) return;
      setState(!error && data === true ? "ok" : "denied");
    })();
    return () => { cancelled = true; };
  }, []);

  if (state === "checking") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: a.bg, color: a.muted, fontFamily: "'Hanken Grotesque', sans-serif", fontSize: 14 }}>
        Checking access…
      </div>
    );
  }
  if (state === "anon") return <Navigate to="/signin" replace />;
  if (state === "denied") return <Navigate to="/" replace />;
  return <>{children}</>;
}

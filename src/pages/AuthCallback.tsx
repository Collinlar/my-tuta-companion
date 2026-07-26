import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { c, font } from "@/mytuta/theme";
import { setStoredRole } from "@/mytuta/useRole";

/**
 * Landing point after an OAuth redirect (Google sign-in). The Supabase
 * client auto-exchanges the URL's auth code for a session on load, so by
 * the time this effect runs, getSession() already reflects the signed-in
 * user. From here we route the same way email sign-up/sign-in do: straight
 * to onboarding if it isn't finished yet, otherwise to the role's home.
 */
export default function AuthCallback() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        nav("/signin", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.onboarding_completed) {
        const requestedType = params.get("type");
        const type = requestedType === "teacher" ? "teacher" : requestedType === "student" ? "student" : profile?.user_type === "teacher" ? "teacher" : "student";
        nav(`/onboarding?type=${type}`, { replace: true });
        return;
      }

      const role = profile.user_type === "teacher" ? "teacher" : "student";
      setStoredRole(role);
      window.dispatchEvent(new Event("mytuta-role"));
      nav(role === "teacher" ? "/teacher/home" : "/student/home", { replace: true });
    })();
  }, [nav, params]);

  return (
    <div style={{ minHeight: "100vh", background: c.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.body, color: c.muted, fontSize: 14.5 }}>
      Finishing sign-in…
    </div>
  );
}

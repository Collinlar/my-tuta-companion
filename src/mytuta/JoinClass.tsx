import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { c, font } from "./theme";

/**
 * Public landing for a shared class invite link (/join/:code). If the visitor
 * is signed in, joins immediately and sends them to Assignments. If not, the
 * code is stashed in localStorage and Assignments auto-consumes it after the
 * usual sign-in / sign-up flow (see Assignments.tsx's pendingJoinCode check).
 */
export default function JoinClass() {
  const nav = useNavigate();
  const { code } = useParams();
  const ran = useRef(false);
  const [message, setMessage] = useState("Joining your class…");

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      if (!code) { nav("/", { replace: true }); return; }
      if (code) localStorage.setItem("pendingJoinCode", code);

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMessage("Sign in to join this class…");
        nav(`/signin`, { replace: true });
        return;
      }

      const { data: joined, error } = await supabase.rpc("join_class", { p_code: code });
      if (error || !joined || (joined as { class_id: string }[]).length === 0) {
        setMessage(error?.message || "That class code did not work. Ask your teacher for a new link.");
        return;
      }
      localStorage.removeItem("pendingJoinCode");
      nav("/student/assignments", { replace: true });
    })();
  }, [code, nav]);

  return (
    <div style={{ minHeight: "100vh", background: c.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, fontFamily: font.body, color: c.muted, fontSize: 14.5 }}>
      {message}
    </div>
  );
}

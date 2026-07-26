import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { c, font } from "@/mytuta/theme";
import { getRole } from "@/mytuta/useRole";
import { loopWords } from "@/mytuta/data/constants";
import { useLayout } from "@/mytuta/layout";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const L = useLayout();

  const handleGoogle = async () => {
    setError(null);
    setOauthLoading(true);
    const { error } = await AuthService.signInWithGoogle();
    if (error) {
      setError(error.message || "Google sign-in did not start. Try again.");
      setOauthLoading(false);
    }
    // On success the browser is redirected to Google; nothing more to do here.
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { user, error } = await AuthService.signIn({ email, password });
      if (error) { setError(error.message || "That did not sign you in. Check your email and password."); setIsLoading(false); return; }
      if (user) {
        toast({ title: "Welcome back", description: "Taking you to your learning." });
        window.dispatchEvent(new Event("mytuta-role"));
        navigate(getRole() === "teacher" ? "/teacher/home" : "/student/home");
      }
    } catch {
      setError("We could not reach our servers. Check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", background: c.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: L.mobile ? 16 : 40, fontFamily: font.body, color: c.ink }}>
      <div style={{ width: "100%", maxWidth: 940, display: "grid", gridTemplateColumns: L.gAuth, border: `1px solid ${c.border}`, borderRadius: L.mobile ? 18 : 24, overflow: "hidden", boxShadow: "0 30px 70px rgba(30,40,32,.12)", background: c.surface }}>
        {!L.mobile && (
          <div style={{ background: "linear-gradient(160deg,#2e9e6b,#1f7d53)", padding: "48px 44px", color: "#fff", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 24 }}>mytuta<span style={{ color: "#bfe0cf" }}>.</span></div>
            <div style={{ marginTop: "auto" }}>
              <h1 style={{ fontSize: 34, lineHeight: 1.1, color: "#fff", marginBottom: 16 }}>Welcome back.</h1>
              <p style={{ fontSize: 15.5, lineHeight: 1.6, opacity: 0.92 }}>Pick up your mastery paths, finish an assignment, or start something new.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 26 }}>
                {loopWords.map((w) => (
                  <span key={w} style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 20, padding: "6px 13px", fontSize: 12.5, fontWeight: 600 }}>{w}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: L.mobile ? "28px 20px" : "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {L.mobile && (
            <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, marginBottom: 18 }}>mytuta<span style={{ color: c.green }}>.</span></div>
          )}
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#9a927f", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>Sign in</div>
          <h2 style={{ fontSize: 24, marginBottom: 22 }}>Continue learning</h2>

          {error && (
            <div style={{ background: c.redTint, border: "1px solid #f0c7b6", color: c.red, borderRadius: 10, padding: "11px 13px", fontSize: 13.5, marginBottom: 16 }}>{error}</div>
          )}

          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#9a927f", fontWeight: 600, marginBottom: 6 }}>Email</div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required disabled={isLoading} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#9a927f", fontWeight: 600, marginBottom: 6 }}>Password</div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required disabled={isLoading} style={inputStyle} />
            </div>
            <div style={{ textAlign: "right", marginBottom: 18 }}>
              <button type="button" onClick={() => navigate("/forgot-password")} style={{ background: "none", border: "none", fontSize: 13, color: c.green, fontWeight: 600, cursor: "pointer" }}>Forgot password?</button>
            </div>
            <button type="submit" disabled={isLoading} style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 14, borderRadius: 12, cursor: isLoading ? "default" : "pointer", opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? "Signing you in…" : "Sign in"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
            <span style={{ flex: 1, height: 1, background: c.border }} />
            <span style={{ fontSize: 12, color: "#9a927f" }}>or</span>
            <span style={{ flex: 1, height: 1, background: c.border }} />
          </div>

          <button
            type="button"
            onClick={() => void handleGoogle()}
            disabled={oauthLoading || isLoading}
            style={{ width: "100%", background: "#fff", border: `1px solid ${c.border}`, color: c.ink, fontWeight: 600, fontSize: 14.5, padding: 13, borderRadius: 12, cursor: oauthLoading ? "default" : "pointer", opacity: oauthLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
          >
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: c.paper, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: c.soft }}>G</span>
            {oauthLoading ? "Redirecting to Google…" : "Continue with Google"}
          </button>

          <div style={{ textAlign: "center", fontSize: 13, color: "#9a927f", marginTop: 16 }}>
            New to mytuta? <span onClick={() => navigate("/signup")} style={{ color: c.green, fontWeight: 600, cursor: "pointer" }}>Create an account</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = { width: "100%", border: `1px solid ${c.border}`, borderRadius: 11, padding: "12px 14px", fontSize: 15, background: "#fff", color: c.ink, outline: "none", fontFamily: font.body } as const;

export default SignIn;

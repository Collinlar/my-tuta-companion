import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { c, font } from "@/mytuta/theme";
import { loopWords } from "@/mytuta/data/constants";

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const userType = (searchParams.get("type") as "student" | "teacher") || "student";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogle = async () => {
    setError(null);
    setOauthLoading(true);
    const { error } = await AuthService.signInWithGoogle(userType);
    if (error) {
      setError(error.message || "Google sign-in did not start. Try again.");
      setOauthLoading(false);
    }
    // On success the browser is redirected to Google; nothing more to do here.
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError("Your password needs at least 6 characters"); return; }
    if (password !== confirmPassword) { setError("Those passwords do not match. Check and try again."); return; }

    setIsLoading(true);
    try {
      const { user, error } = await AuthService.signUp({ email, password, firstName, lastName, userType });
      if (error) { setError(error.message || "That did not go through. Check your details and try again."); setIsLoading(false); return; }
      if (user) {
        toast({ title: "Account created", description: "Let's set up your learning." });
        navigate(`/onboarding?type=${userType}`);
      }
    } catch {
      setError("We could not reach our servers. Check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: c.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, fontFamily: font.body, color: c.ink }}>
      <div style={{ width: "100%", maxWidth: 940, display: "grid", gridTemplateColumns: "1fr 1fr", border: `1px solid ${c.border}`, borderRadius: 24, overflow: "hidden", boxShadow: "0 30px 70px rgba(30,40,32,.12)", background: c.surface }}>
        {/* Left panel */}
        <div style={{ background: "linear-gradient(160deg,#2e9e6b,#1f7d53)", padding: "48px 44px", color: "#fff", display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 24 }}>mytuta<span style={{ color: "#bfe0cf" }}>.</span></div>
          <div style={{ marginTop: "auto" }}>
            <h1 style={{ fontSize: 34, lineHeight: 1.1, color: "#fff", marginBottom: 16 }}>STEM finally makes sense.</h1>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, opacity: 0.92 }}>Understand difficult concepts, solve problems with guidance and master STEM through practice and real application.</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 26 }}>
              {loopWords.map((w) => (
                <span key={w} style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 20, padding: "6px 13px", fontSize: 12.5, fontWeight: 600 }}>{w}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div style={{ padding: "44px 44px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#9a927f", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>Get started</div>
          <h2 style={{ fontSize: 24, marginBottom: 18 }}>Create your account</h2>

          {/* Role toggle */}
          <div style={{ display: "inline-flex", background: "#efe9dc", borderRadius: 12, padding: 4, marginBottom: 20 }}>
            {(["student", "teacher"] as const).map((r) => {
              const on = userType === r;
              return (
                <button key={r} type="button" onClick={() => navigate(`/signup?type=${r}`)} style={{ border: "none", background: on ? "#fff" : "transparent", color: on ? c.greenDark : c.muted, fontWeight: 600, fontSize: 13, padding: "8px 16px", borderRadius: 9, cursor: "pointer", boxShadow: on ? "0 1px 4px rgba(30,40,32,.1)" : "none" }}>
                  I am a {r}
                </button>
              );
            })}
          </div>

          {error && (
            <div style={{ background: c.redTint, border: "1px solid #f0c7b6", color: c.red, borderRadius: 10, padding: "11px 13px", fontSize: 13.5, marginBottom: 16 }}>{error}</div>
          )}

          <form onSubmit={handleSignUp}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <Field label="First name" value={firstName} onChange={setFirstName} placeholder="Ama" disabled={isLoading} />
              <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Owusu" disabled={isLoading} />
            </div>
            <div style={{ marginBottom: 12 }}><Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" disabled={isLoading} /></div>
            <div style={{ marginBottom: 12 }}><Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 6 characters" disabled={isLoading} /></div>
            <div style={{ marginBottom: 22 }}><Field label="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Type it again" disabled={isLoading} /></div>
            <button type="submit" disabled={isLoading} style={{ width: "100%", background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 15, padding: 14, borderRadius: 12, cursor: isLoading ? "default" : "pointer", opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? "Creating your account…" : "Create my account"}
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
            {oauthLoading ? "Redirecting to Google…" : `Continue with Google as a ${userType}`}
          </button>

          <div style={{ textAlign: "center", fontSize: 13, color: "#9a927f", marginTop: 16 }}>
            Already have an account? <span onClick={() => navigate("/signin")} style={{ color: c.green, fontWeight: 600, cursor: "pointer" }}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function Field({ label, value, onChange, placeholder, type = "text", disabled }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; disabled?: boolean }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12, color: "#9a927f", fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        disabled={disabled}
        style={{ width: "100%", border: `1px solid ${c.border}`, borderRadius: 11, padding: "12px 14px", fontSize: 15, background: "#fff", color: c.ink, outline: "none", fontFamily: font.body }}
      />
    </label>
  );
}

export default SignUp;

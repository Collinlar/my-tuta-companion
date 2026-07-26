import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, font } from "./theme";
import { Loading } from "./ui";
import { useLayout, pageBox } from "./layout";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/services/authService";
import { useProfile, useSubscription } from "./data/queries";
import { useDeleteAccount } from "./data/mutations";

export default function Settings() {
  const L = useLayout();
  const nav = useNavigate();
  const { toast } = useToast();
  const { data: profile, isLoading } = useProfile();
  const { data: sub } = useSubscription();
  const deleteAccount = useDeleteAccount();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);

  const signOut = async () => {
    await AuthService.signOut();
    nav("/signin");
  };

  const doDelete = async () => {
    try {
      await deleteAccount.mutateAsync();
      toast({ title: "Account deleted", description: "Your mytuta account and data have been removed." });
      nav("/");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not delete your account just now.";
      toast({ title: "Deletion failed", description: msg, variant: "destructive" });
    }
  };

  if (isLoading || !profile) return <Loading label="Loading settings…" />;

  return (
    <div style={pageBox(L.pad, 700)}>
      <div style={{ fontFamily: font.display, fontSize: 26, marginBottom: 4 }}>Settings</div>
      <div style={{ color: c.muted, fontSize: 14.5, marginBottom: 28 }}>Account and privacy.</div>

      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "18px 20px", marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Account</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{profile.email}</div>
        <div style={{ fontSize: 13, color: c.muted }}>{profile.userType === "teacher" ? "Teacher" : "Student"} account</div>
      </div>

      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "18px 20px", marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Subscription</div>
        {sub && sub.status === "active" ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{sub.plan === "teacher_pro" ? "Teacher Pro" : "Student Plus"}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: c.greenDark, background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, padding: "2px 9px", borderRadius: 20 }}>Active</span>
              {sub.founding && sub.plan === "teacher_pro" && <span style={{ fontSize: 11, fontWeight: 600, color: c.amber, background: c.amberTint, border: `1px solid ${c.amberBorder}`, padding: "2px 9px", borderRadius: 20 }}>Founding</span>}
            </div>
            <div style={{ fontSize: 13, color: c.muted, marginBottom: 14 }}>
              {sub.monthlyCredits} credits a month{sub.currentPeriodEnd ? ` · renews ${new Date(sub.currentPeriodEnd).toLocaleDateString(undefined, { day: "numeric", month: "short" })}` : ""}. You also get 10% bonus credits on top-ups.
            </div>
            <button type="button" onClick={() => setCancelOpen(true)} style={{ background: "none", border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 13, padding: "9px 16px", borderRadius: 10, cursor: "pointer" }}>Cancel subscription</button>
            {cancelOpen && (
              <div style={{ marginTop: 12, background: c.paper, border: `1px solid ${c.border}`, borderRadius: 11, padding: "12px 14px" }}>
                <div style={{ fontSize: 13, color: c.ink, lineHeight: 1.55, marginBottom: 10 }}>To stop future billing, cancel from your Paystack email receipt or contact support. Your credits stay until the period ends.</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => nav("/contact")} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 12.5, padding: "8px 14px", borderRadius: 9, cursor: "pointer" }}>Contact support</button>
                  <button type="button" onClick={() => setCancelOpen(false)} style={{ background: "none", border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 12.5, padding: "8px 14px", borderRadius: 9, cursor: "pointer" }}>Keep it</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 13.5, color: c.ink, lineHeight: 1.55, marginBottom: 12 }}>
              {sub?.status === "past_due" ? "Your subscription payment did not go through. Resubscribe to restore your monthly allowance." : "Subscribe for a generous monthly credit allowance plus premium features and a 10% top-up bonus."}
            </div>
            <button type="button" onClick={() => nav("/pricing")} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13.5, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>See plans</button>
          </>
        )}
      </div>

      <button type="button" onClick={signOut} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14, padding: "12px 20px", borderRadius: 11, cursor: "pointer", marginBottom: 40 }}>Sign out</button>

      <div style={{ border: `1px solid #f0c7b6`, background: "#fff0eb", borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#c05a2e", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Danger zone</div>
        <div style={{ fontSize: 14, color: c.ink, lineHeight: 1.55, marginBottom: 16 }}>
          Deleting your account permanently removes your profile, mastery paths, progress, classes and everything else tied to it. This cannot be undone.
        </div>

        {!confirming ? (
          <button type="button" onClick={() => setConfirming(true)} style={{ background: "none", border: "1px solid #c05a2e", color: "#c05a2e", fontWeight: 600, fontSize: 13.5, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>Delete my account</button>
        ) : (
          <div>
            <div style={{ fontSize: 13, color: c.soft, marginBottom: 10 }}>Type <strong>DELETE</strong> to confirm.</div>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{ width: "100%", boxSizing: "border-box", border: "1px solid #f0c7b6", borderRadius: 10, padding: "10px 12px", fontSize: 14, marginBottom: 12, outline: "none", fontFamily: font.body }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                disabled={confirmText !== "DELETE" || deleteAccount.isPending}
                onClick={doDelete}
                style={{ background: "#c05a2e", color: "#fff", border: "none", fontWeight: 600, fontSize: 13.5, padding: "10px 18px", borderRadius: 10, cursor: "pointer", opacity: confirmText !== "DELETE" || deleteAccount.isPending ? 0.5 : 1 }}
              >{deleteAccount.isPending ? "Deleting…" : "Yes, permanently delete"}</button>
              <button type="button" onClick={() => { setConfirming(false); setConfirmText(""); }} style={{ background: "none", border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 13.5, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

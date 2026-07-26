import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { c, font } from "@/mytuta/theme";
import { creditBundles, type CreditBundle } from "@/mytuta/credits/bundles";
import { buyBundle, subscribePlan } from "@/mytuta/credits/paystack";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Tier {
  name: string; price: string; period?: string; body: string;
  features: string[]; cta: string; to: string; featured?: boolean;
  plan?: "student_plus" | "teacher_pro";
}

const learnerTiers: Tier[] = [
  {
    name: "Student Free", price: "GHS 0", period: "forever",
    body: "Join classes, complete assignments and access saved learning.",
    features: ["30 welcome credits for 14 days", "Join classes and take assignments", "Free Mastery Checks and challenges", "Basic progress", "Buy credits any time"],
    cta: "Start free", to: "/signup?type=student",
  },
  {
    name: "Student Plus", price: "GHS 100", period: "per month",
    body: "A generous monthly learning allowance for active learners.",
    features: ["400 Tuta Credits every month", "Full Mastery Path creation", "Expanded Step Coach", "Personalised revision", "Premium Mastery Checks", "Selected assessments and challenges", "10% bonus on credit top-ups", "No expiry while subscribed"],
    cta: "Go Plus", to: "/signup?type=student", featured: true, plan: "student_plus",
  },
];

const teacherTiers: Tier[] = [
  {
    name: "Teacher Free", price: "GHS 0", period: "forever",
    body: "Validate the full teaching loop on a small scale.",
    features: ["30 welcome credits for 14 days", "One class", "Basic assignments and results", "Limited experience storage", "Buy credits any time"],
    cta: "Start free", to: "/signup?type=teacher",
  },
  {
    name: "Teacher Pro", price: "GHS 150", period: "per month · founding",
    body: "Create regularly throughout the month with a generous allowance.",
    features: ["900 Tuta Credits every month", "Multiple classes", "Full Learning Experience creation", "Assessments and interventions", "Misconception insights", "Practical activity generation", "Teacher analytics and exports", "10% bonus on credit top-ups"],
    cta: "Go Pro", to: "/signup?type=teacher", featured: true, plan: "teacher_pro",
  },
];

const Pricing = () => {
  const nav = useNavigate();
  const { toast } = useToast();

  const buy = async (b: CreditBundle) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      nav(`/signup?type=student&bundle=${b.id}`);
      return;
    }
    try {
      const res = await buyBundle(b);
      if (res === "unconfigured") {
        toast({ title: "Payments not enabled yet", description: "Mobile money and card checkout go live once Paystack is set up.", variant: "destructive" });
      } else if (res === "success") {
        toast({ title: "Credits added", description: `${b.credits} Tuta Credits are now in your wallet.` });
        nav("/wallet");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "That payment did not go through.";
      toast({ title: "Payment failed", description: msg, variant: "destructive" });
    }
  };

  const goTier = async (t: Tier) => {
    if (!t.plan) { nav(t.to); return; }
    const { data } = await supabase.auth.getSession();
    if (!data.session) { nav(t.to); return; }
    try {
      const res = await subscribePlan(t.plan);
      if (res === "unconfigured") {
        toast({ title: "Subscriptions not enabled yet", description: "Monthly plans go live once Paystack plans are set up.", variant: "destructive" });
      } else if (res === "success") {
        toast({ title: "Subscription starting", description: "Your credits appear once the first payment is confirmed." });
        nav("/settings");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "That did not go through.";
      toast({ title: "Could not subscribe", description: msg, variant: "destructive" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: c.paper, color: c.ink, fontFamily: font.body }}>
      <Helmet><title>Pricing — mytuta</title></Helmet>
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(246,243,236,.85)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "15px 32px", display: "flex", alignItems: "center", gap: 30 }}>
          <a onClick={() => nav("/")} style={{ fontFamily: font.display, fontWeight: 700, fontSize: 22, color: "#1c2620", cursor: "pointer" }}>mytuta<span style={{ color: c.green }}>.</span></a>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
            <a onClick={() => nav("/signin")} style={{ fontSize: 14.5, color: "#3a4350", fontWeight: 500, cursor: "pointer" }}>Sign in</a>
            <button onClick={() => nav("/signup")} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, padding: "11px 18px", borderRadius: 11, cursor: "pointer" }}>Start free</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1160, margin: "0 auto", padding: "56px 32px 80px" }}>
        <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 44px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: c.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 12 }}>Pricing</div>
          <h1 style={{ fontSize: 40, lineHeight: 1.1, marginBottom: 14 }}>Use free, buy credits, or subscribe</h1>
          <p style={{ fontSize: 16.5, color: c.soft, lineHeight: 1.55 }}>Learning access is free. Tuta Credits power AI creation, guided solving and premium experiences. Pay with mobile money or card.</p>
          <div style={{ display: "inline-block", marginTop: 16, background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, color: c.greenDark, fontWeight: 600, fontSize: 13.5, padding: "8px 16px", borderRadius: 20 }}>30 free Tuta Credits, valid 14 days. No card required.</div>
        </div>

        {/* Credit bundles */}
        <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 16 }}>Credit bundles</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 14 }}>
          {creditBundles.map((b) => (
            <div key={b.id} style={{ background: b.featured ? c.greenTint : c.surface, border: `1px solid ${b.featured ? c.greenTintBorder : c.border2}`, borderRadius: 18, padding: "22px 20px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: 600, fontSize: 15.5, marginBottom: 2 }}>{b.name}</div>
              <div style={{ fontSize: 12.5, color: c.muted, marginBottom: 14, lineHeight: 1.45, minHeight: 34 }}>{b.positioning}</div>
              <div style={{ fontFamily: font.display, fontSize: 26, color: c.green, lineHeight: 1 }}>{b.credits}</div>
              <div style={{ fontSize: 12, color: c.faint, marginBottom: 14 }}>credits · GHS {b.priceGhs}</div>
              <button onClick={() => void buy(b)} style={{ marginTop: "auto", background: b.featured ? c.green : "#fff", color: b.featured ? "#fff" : c.greenDark, border: b.featured ? "none" : `1px solid ${c.greenTintBorder}`, fontWeight: 600, fontSize: 14, padding: 12, borderRadius: 11, cursor: "pointer" }}>Buy {b.name}</button>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: c.muted, marginBottom: 10 }}>Need more? <a onClick={() => nav("/contact")} style={{ color: c.green, fontWeight: 600, cursor: "pointer" }}>Contact us for a custom bundle ›</a></div>

        {/* What credits can do */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "8px 0 48px" }}>
          <ExampleCard title="What 50 credits can do" items={["About 5 complete student Mastery Paths, or", "About 20 guided Solve sessions, or", "A mix of learning, practice and assessments"]} />
          <ExampleCard title="For teachers" items={["About 4 complete Learning Experiences, or", "About 10 assessments and practice activities, or", "A mix of creation and intervention tools"]} />
        </div>

        {/* Plans */}
        <TierGroup title="Student plans" tiers={learnerTiers} onTier={goTier} />
        <div style={{ height: 44 }} />
        <TierGroup title="Teacher plans" tiers={teacherTiers} onTier={goTier} />
        <div style={{ fontSize: 12.5, color: c.faint, marginTop: 12 }}>Founding Teacher Pro keeps GHS 150/month; the standard price is GHS 200/month.</div>

        <div style={{ textAlign: "center", fontSize: 13.5, color: c.muted, marginTop: 44 }}>
          Schools, tutors and sponsored programmes can arrange custom credit pools. <a onClick={() => nav("/contact")} style={{ color: c.green, fontWeight: 600, cursor: "pointer" }}>Talk to us ›</a>
        </div>
      </main>
    </div>
  );
};

function ExampleCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: "18px 20px" }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: c.ink, marginBottom: 10 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map((it) => (
          <div key={it} style={{ display: "flex", gap: 9, fontSize: 13, color: c.soft, lineHeight: 1.45 }}>
            <span style={{ color: c.green, fontWeight: 700, flex: "none" }}>·</span>{it}
          </div>
        ))}
      </div>
    </div>
  );
}

function TierGroup({ title, tiers, onTier }: { title: string; tiers: Tier[]; onTier: (t: Tier) => void }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 16 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }}>
        {tiers.map((t) => (
          <div key={t.name} style={{ background: t.featured ? c.greenTint : c.surface, border: `1px solid ${t.featured ? c.greenTintBorder : c.border2}`, borderRadius: 20, padding: 26, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ fontWeight: 600, fontSize: 17 }}>{t.name}</div>
              {t.featured && <span style={{ fontSize: 10.5, fontWeight: 600, color: c.greenDark, background: "#fff", border: `1px solid ${c.greenTintBorder}`, padding: "2px 8px", borderRadius: 20 }}>Most value</span>}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
              <span style={{ fontFamily: font.display, fontSize: 28, color: c.green, lineHeight: 1 }}>{t.price}</span>
              {t.period && <span style={{ fontSize: 13, color: c.faint }}>{t.period}</span>}
            </div>
            <div style={{ fontSize: 13.5, color: c.soft, lineHeight: 1.55, marginBottom: 18 }}>{t.body}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22, flex: 1 }}>
              {t.features.map((f) => (
                <div key={f} style={{ display: "flex", gap: 10, fontSize: 13.5, color: c.ink, lineHeight: 1.4 }}>
                  <span style={{ color: c.green, fontWeight: 700, flex: "none" }}>✓</span>{f}
                </div>
              ))}
            </div>
            <button onClick={() => void onTier(t)} style={{ background: t.featured ? c.green : "#fff", color: t.featured ? "#fff" : c.greenDark, border: t.featured ? "none" : `1px solid ${c.greenTintBorder}`, fontWeight: 600, fontSize: 14.5, padding: 13, borderRadius: 12, cursor: "pointer" }}>{t.cta}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pricing;

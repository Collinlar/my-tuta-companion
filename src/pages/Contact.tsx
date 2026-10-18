import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { c, font } from "@/mytuta/theme";
import { MarketingShell } from "./marketing/chrome";

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", border: `1.5px solid #d9d1c0`, borderRadius: 12,
  padding: "13px 14px", fontSize: 16, fontFamily: "inherit", color: c.ink, background: "#fff", outline: "none",
};

function Field({ label, name, type = "text", placeholder, required }: { label: string; name: string; type?: string; placeholder: string; required?: boolean }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: c.soft, marginBottom: 6 }}>{label}</div>
      <input name={name} type={type} placeholder={placeholder} required={required} style={inputStyle} />
    </label>
  );
}

export default function Contact() {
  const nav = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const firstName = (fd.get("firstName") as string) || "";
    const lastName = (fd.get("lastName") as string) || "";
    const email = (fd.get("email") as string) || "";
    const subject = (fd.get("subject") as string) || "Message from mytuta.org";
    const message = (fd.get("message") as string) || "";
    const body = `Name: ${firstName} ${lastName}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`;
    window.location.href = `mailto:team@mytuta.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <MarketingShell>
      <Helmet>
        <title>Contact mytuta | Talk to us</title>
        <meta name="description" content="Questions about mytuta, schools or partnerships? Email team@mytuta.org or send us a message. We reply within a day. Based in Accra, Ghana." />
      </Helmet>

      {/* Hero */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(56px,8vw,112px) clamp(20px,4vw,48px) clamp(28px,4vw,48px)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#7d7564", marginBottom: 20 }}>Contact</div>
        <h1 style={{ fontFamily: font.display, fontWeight: 800, fontSize: "clamp(48px,8vw,112px)", lineHeight: .95, letterSpacing: "-.045em", color: c.ink }}>Talk to us.</h1>
        <p style={{ fontSize: "clamp(17px,1.6vw,22px)", lineHeight: 1.5, color: c.soft, maxWidth: 600, marginTop: 28, textWrap: "pretty" }}>Whether you are a student, a teacher or a school, we would love to hear from you. We reply within a day.</p>
      </section>

      {/* Two-column: details + form */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,4vw,48px) clamp(64px,8vw,112px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 28, alignItems: "start" }}>
          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <a href="mailto:team@mytuta.org" style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 20, padding: 26, display: "block" }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: c.faint, marginBottom: 8 }}>Email us</div>
              <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 26, letterSpacing: "-.02em", color: c.greenDark }}>team@mytuta.org</div>
              <div style={{ fontSize: 15, color: c.soft, marginTop: 8 }}>For anything: help, feedback or questions. We reply within a day.</div>
            </a>
            <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 20, padding: 26 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: c.faint, marginBottom: 8 }}>Schools and partnerships</div>
              <div style={{ fontSize: 16, color: c.ink, lineHeight: 1.55 }}>Bringing mytuta to a school or running a programme? Email us and we will set up a call to plan it with you.</div>
            </div>
            <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 20, padding: 26 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: c.faint, marginBottom: 8 }}>Based in</div>
              <div style={{ fontSize: 16, color: c.ink }}>Accra, Ghana. Built for STEM classrooms across Africa.</div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 24, padding: "clamp(24px,3vw,36px)", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 24, letterSpacing: "-.02em" }}>Send a message</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="First name" name="firstName" placeholder="Ama" required />
              <Field label="Last name" name="lastName" placeholder="Owusu" required />
            </div>
            <Field label="Email" name="email" type="email" placeholder="you@example.com" required />
            <Field label="Subject" name="subject" placeholder="What is this about?" required />
            <label style={{ display: "block" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.soft, marginBottom: 6 }}>Message</div>
              <textarea name="message" rows={5} placeholder="Tell us a little more…" required style={{ ...inputStyle, resize: "vertical" }} />
            </label>
            <button type="submit" style={{ background: c.green, color: "#fff", border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 16, padding: 15, borderRadius: 14, cursor: "pointer", marginTop: 4 }}>Send your message</button>
            <div style={{ fontSize: 13, color: c.faint, textAlign: "center" }}>This opens your email app with the message ready to send.</div>
          </form>
        </div>
      </section>
    </MarketingShell>
  );
}

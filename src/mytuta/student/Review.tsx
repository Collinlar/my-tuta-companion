import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, font } from "../theme";
import { Loading, EmptyState } from "../ui";
import { recallRatings } from "../data/constants";
import { useDueRecallCards } from "../data/queries";
import { useRateRecallCard } from "../data/mutations";
import { recordEvent } from "../intelligence/data";

type View = "intro" | "session" | "done";

export default function Review() {
  const nav = useNavigate();
  const { data: cards, isLoading } = useDueRecallCards();
  const rateCard = useRateRecallCard();

  const [view, setView] = useState<View>("intro");
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState<Record<string, number>>({ Again: 0, Hard: 0, Good: 0, Easy: 0 });

  if (isLoading) return <Loading label="Gathering what's due…" />;

  const due = cards || [];

  if (view === "intro" || due.length === 0) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 40px 72px", animation: "fadeup .3s ease" }}>
        <div style={{ fontFamily: font.display, fontSize: 26, marginBottom: 4 }}>Review</div>
        <div style={{ color: c.muted, fontSize: 14.5, marginBottom: 26 }}>
          Every recall card you've met, due today or earlier, pulled from every concept in one place.
        </div>
        {due.length === 0 ? (
          <EmptyState title="Nothing due right now" body="Cards come back for review after you meet them in a Recall stage. Keep learning and they'll show up here when they're due." />
        ) : (
          <div style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 16, padding: "22px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.greenDark, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 9 }}>Ready when you are</div>
            <div style={{ fontSize: 14, color: c.ink, lineHeight: 1.6, marginBottom: 18 }}>
              {due.length} card{due.length === 1 ? "" : "s"} due, from {new Set(due.map((d) => d.conceptName)).size} concept{new Set(due.map((d) => d.conceptName)).size === 1 ? "" : "s"}. Reveal each one, then rate how well you remembered it.
            </div>
            <button
              type="button"
              onClick={() => { setIdx(0); setFlipped(false); setTally({ Again: 0, Hard: 0, Good: 0, Easy: 0 }); setView("session"); }}
              style={{ background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 14.5, padding: "13px 22px", borderRadius: 12, cursor: "pointer" }}
            >Start review</button>
          </div>
        )}
      </div>
    );
  }

  if (view === "session") {
    const card = due[Math.min(idx, due.length - 1)];

    const rate = (label: string) => {
      if (!flipped) return;
      rateCard.mutate({ cardId: card.id, rating: label, priorIntervalDays: card.intervalDays });
      setTally((t) => ({ ...t, [label]: (t[label] || 0) + 1 }));
      if (idx + 1 >= due.length) {
        void recordEvent("revision_completed", { meta: { reviewed: due.length } });
        setView("done");
        return;
      }
      setIdx(idx + 1);
      setFlipped(false);
    };

    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 40px 72px", animation: "fadeup .3s ease" }}>
        <button type="button" onClick={() => setView("intro")} style={{ background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 }}>← Review</button>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color: c.green, background: c.greenTint, padding: "4px 11px", borderRadius: 20, marginBottom: 16 }}>{card.conceptName}</span>
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          style={{
            width: "100%", background: "linear-gradient(160deg,#fffdf8,#f6f3ec)", border: `1px solid ${c.border}`,
            borderRadius: 18, padding: "44px 30px", textAlign: "center", marginBottom: 16, cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 16 }}>
            Card {idx + 1} of {due.length}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.35, marginBottom: 8, color: c.ink }}>
            {flipped ? card.back : card.front}
          </div>
          <div style={{ fontSize: 13, color: flipped ? c.green : c.placeholder }}>
            {flipped ? "How well did you remember? Rate below." : "Tap to reveal the answer"}
          </div>
        </button>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9 }}>
          {recallRatings.map((r) => (
            <button
              key={r.label}
              type="button"
              disabled={!flipped}
              onClick={() => rate(r.label)}
              style={{
                background: c.surface, border: `1px solid ${r.bd}`, color: r.fg, fontWeight: 600, fontSize: 13,
                padding: 12, borderRadius: 11, cursor: flipped ? "pointer" : "not-allowed", opacity: flipped ? 1 : 0.45,
              }}
            >{r.label}</button>
          ))}
        </div>
      </div>
    );
  }

  // done
  const total = due.length;
  const solid = (tally.Good || 0) + (tally.Easy || 0);
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "44px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: c.green, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10 }}>Review complete</div>
      <h1 style={{ fontSize: 27, lineHeight: 1.15, marginBottom: 8 }}>{total} card{total === 1 ? "" : "s"} reviewed</h1>
      <p style={{ fontSize: 15, color: c.muted, marginBottom: 24 }}>{solid} of {total} felt solid. The rest will come back sooner so you see them again before they slip.</p>
      <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: "18px 20px", marginBottom: 22, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {recallRatings.map((r) => (
          <div key={r.label} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: font.display, fontSize: 22, color: r.fg }}>{tally[r.label] || 0}</div>
            <div style={{ fontSize: 11, color: c.faint, marginTop: 3 }}>{r.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" onClick={() => nav("/student/progress")} style={{ flex: 1, background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 14.5, padding: 14, borderRadius: 12, cursor: "pointer" }}>Back to Progress</button>
        <button type="button" onClick={() => nav("/student/learn")} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14.5, padding: "14px 22px", borderRadius: 12, cursor: "pointer" }}>Continue learning</button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, filter } from "../theme";
import { Loading, EmptyState } from "../ui";
import { expFilters } from "../data/constants";
import { useExperiences } from "../data/queries";

export default function Experiences() {
  const nav = useNavigate();
  const { data: experiences, isLoading } = useExperiences();
  const [filterIdx, setFilterIdx] = useState(0);

  if (isLoading) return <Loading label="Loading your experiences…" />;
  const list = experiences || [];

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "34px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <p style={{ fontSize: 14, color: c.muted }}>Complete STEM learning experiences you have created or drafted.</p>
        <button onClick={() => nav("/teacher/experiences/new")} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>＋ New experience</button>
      </div>
      {list.length === 0 ? (
        <EmptyState title="No experiences yet" body="Create your first STEM learning experience and mytuta drafts the full mastery loop for you to edit." actionLabel="Create experience" onAction={() => nav("/teacher/experiences/new")} />
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            {expFilters.map((f, i) => (
              <button key={f} onClick={() => setFilterIdx(i)} style={filter(filterIdx === i)}>{f}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {list.map((e) => (
              <button key={e.id} onClick={() => nav(`/teacher/experiences/${e.id}/edit`)} style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, overflow: "hidden", cursor: "pointer" }}>
                <div style={{ height: 72, background: e.cover, display: "flex", alignItems: "flex-end", padding: "11px 14px" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(0,0,0,.2)", padding: "3px 9px", borderRadius: 20 }}>{e.subject}</span>
                </div>
                <div style={{ padding: "16px 17px" }}>
                  <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3, marginBottom: 7 }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: c.faint, marginBottom: 12 }}>{e.stages} stages · {e.status}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {e.tags.map((t) => (
                      <span key={t} style={{ fontSize: 11, color: c.soft, background: c.paper, border: `1px solid ${c.border2}`, padding: "3px 9px", borderRadius: 20 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect } from "react";
import { c, font } from "./theme";
import { Loading, EmptyState } from "./ui";
import { useNotifications } from "./data/queries";
import { useMarkNotificationsRead } from "./data/mutations";

const KIND_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  assignment: { icon: "▤", color: "#2e9e6b", bg: "#eaf5ef" },
  assessment: { icon: "◉", color: "#3f8fc4", bg: "#eaf1f7" },
  challenge: { icon: "⬡", color: "#6b5aa8", bg: "#f0edf7" },
  submission: { icon: "✓", color: "#2e9e6b", bg: "#eaf5ef" },
  join: { icon: "◫", color: "#c47a17", bg: "#fff7e9" },
  share: { icon: "⤴", color: "#3f8fc4", bg: "#eaf1f7" },
  feedback: { icon: "✦", color: "#6b5aa8", bg: "#f0edf7" },
  deadline: { icon: "⏱", color: "#c05a2e", bg: "#fff0eb" },
  recall: { icon: "◔", color: "#2e9e6b", bg: "#eaf5ef" },
  credits: { icon: "◆", color: "#c47a17", bg: "#fff7e9" },
};

function timeAgo(iso: string): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const list = notifications || [];
  const unreadIds = list.filter((n) => !n.read).map((n) => n.id);

  // Mark everything visible as read once the list has loaded.
  useEffect(() => {
    if (unreadIds.length > 0) {
      const t = setTimeout(() => markRead.mutate(unreadIds), 800);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length]);

  if (isLoading) return <Loading label="Loading notifications…" />;
  if (list.length === 0) {
    return <EmptyState title="Nothing yet" body="Assignment updates, deadlines, feedback and challenge invitations will appear here." />;
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 40px 72px", animation: "fadeup .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ fontFamily: font.display, fontSize: 26 }}>Notifications</div>
        {unreadIds.length > 0 && (
          <button type="button" onClick={() => markRead.mutate(unreadIds)} style={{ background: "none", border: "none", color: c.green, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Mark all as read</button>
        )}
      </div>
      <div style={{ color: c.muted, fontSize: 14.5, marginBottom: 26 }}>Assignments, assessments, challenges and class activity.</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {list.map((n) => {
          const meta = KIND_ICON[n.kind] || { icon: "◔", color: "#8a8270", bg: "#f6f3ec" };
          return (
            <div key={n.id} style={{ background: n.read ? c.surface : "#fffdf8", border: `1px solid ${n.read ? c.border2 : c.greenTintBorder}`, borderRadius: 13, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 13 }}>
              <div style={{ width: 34, height: 34, flex: "none", borderRadius: 9, background: meta.bg, color: meta.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{meta.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</span>
                  {!n.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.green, flex: "none" }} />}
                </div>
                <div style={{ fontSize: 13, color: c.soft, lineHeight: 1.5, marginTop: 3 }}>{n.body}</div>
              </div>
              <span style={{ fontSize: 11.5, color: c.faint, flex: "none", whiteSpace: "nowrap" }}>{timeAgo(n.createdAt)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

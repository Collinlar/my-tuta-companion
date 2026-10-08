import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { c, font, level } from "../theme";
import { Loading, EmptyState } from "../ui";
import { useLayout, pageBox } from "../layout";
import { useToast } from "@/hooks/use-toast";
import { classNewFields } from "../data/constants";
import { useClasses, useClassStudents, useClassChallenges, useClassSettings, type ClassSettingsVM } from "../data/queries";
import { useCreateClass, useAddRosterStudents, useUpdateClassSettings } from "../data/mutations";

type View = "list" | "detail" | "new" | "settings";

const settingToggles: { key: keyof Omit<ClassSettingsVM, "assessmentRules">; label: string; help: string }[] = [
  { key: "aiAssistance", label: "AI assistance", help: "Let students use AI help (Solve, explain another way) in this class." },
  { key: "allowChallenges", label: "Challenges", help: "Show class and catalog challenges to this class." },
  { key: "allowSharing", label: "Sharing", help: "Let students share solved questions with you." },
  { key: "notifyOnSubmission", label: "Submission notifications", help: "Notify you when a student submits an assessment or challenge." },
];

export default function Classes() {
  const L = useLayout();
  const nav = useNavigate();
  const { toast } = useToast();
  const { data: classes, isLoading } = useClasses();
  const createClass = useCreateClass();
  const addRoster = useAddRosterStudents();
  const updateSettings = useUpdateClassSettings();
  const [view, setView] = useState<View>("list");
  const [sel, setSel] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [rosterOpen, setRosterOpen] = useState(false);
  const [rosterText, setRosterText] = useState("");
  const [settingsDraft, setSettingsDraft] = useState<ClassSettingsVM | null>(null);

  const { data: students } = useClassStudents((view === "detail" || view === "settings") && sel ? sel : undefined);
  const { data: classChallenges } = useClassChallenges(view === "detail" && sel ? sel : undefined);
  const { data: settings } = useClassSettings(view === "settings" && sel ? sel : undefined);

  useEffect(() => {
    if (view === "settings" && settings) setSettingsDraft(settings);
  }, [view, settings]);

  const copyInvite = (code: string) => {
    const url = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(url).then(
      () => toast({ title: "Invite link copied", description: url }),
      () => toast({ title: "Copy failed", description: url, variant: "destructive" }),
    );
  };

  const addStudents = async (classId: string) => {
    const names = rosterText.split(/\r?\n/);
    try {
      const n = await addRoster.mutateAsync({ classId, names });
      toast({ title: n ? `${n} student${n === 1 ? "" : "s"} added` : "Nothing to add", description: n ? "They appear on the roster as placeholders until they join with the code." : undefined });
      setRosterText("");
      setRosterOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not add those students.";
      toast({ title: "Add failed", description: msg, variant: "destructive" });
    }
  };

  const saveSettings = async (classId: string) => {
    if (!settingsDraft) return;
    try {
      await updateSettings.mutateAsync({ classId, settings: settingsDraft });
      toast({ title: "Settings saved" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save settings.";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    }
  };

  if (isLoading) return <Loading label="Loading your classes…" />;
  const list = classes || [];
  const current = list.find((cl) => cl.id === sel) || list[0];

  if (view === "list") {
    return (
      <div style={pageBox(L.pad, 1020)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: c.muted }}>Manage your classes and assign learning experiences.</p>
          <button onClick={() => { setForm({}); setView("new"); }} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>＋ New class</button>
        </div>
        {list.length === 0 ? (
          <EmptyState title="No classes yet" body="Create a class, then share the join code with your students." actionLabel="New class" onAction={() => setView("new")} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: L.g2, gap: 14 }}>
            {list.map((cl) => (
              <button key={cl.id} onClick={() => { setSel(cl.id); setView("detail"); }} style={{ textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 16, padding: 20, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ width: 42, height: 42, flex: "none", borderRadius: 11, background: cl.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>{cl.mark}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15.5 }}>{cl.name}</div>
                    <div style={{ fontSize: 12, color: c.faint }}>{cl.students} students · code {cl.code}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  {cl.stats.map((st) => (
                    <div key={st.l}>
                      <div style={{ fontFamily: font.display, fontSize: 19, color: c.green }}>{st.v}</div>
                      <div style={{ fontSize: 11, color: c.faint }}>{st.l}</div>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "detail" && current) {
    return (
      <div style={pageBox(L.pad, 1020)}>
        <button onClick={() => setView("list")} style={backBtn}>← All classes</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: font.display, fontSize: 24 }}>{current.name}</div>
            <div style={{ fontSize: 13, color: c.faint, marginTop: 2 }}>{current.students} students · code {current.code}</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setView("settings")} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 13, padding: "10px 16px", borderRadius: 10, cursor: "pointer" }}>Settings</button>
            <button onClick={() => nav(`/teacher/classes/${current.id}/challenge/new`)} style={{ background: c.surface, border: `1px solid ${c.plumBorder}`, color: c.plum, fontWeight: 600, fontSize: 13, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>＋ Class challenge</button>
            <button onClick={() => nav(`/teacher/experiences?assignTo=${current.id}`)} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}>Assign experience</button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          <button onClick={() => copyInvite(current.code)} style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, color: c.greenDark, fontWeight: 600, fontSize: 12.5, padding: "8px 14px", borderRadius: 9, cursor: "pointer" }}>Copy invite link</button>
          <button onClick={() => setRosterOpen((o) => !o)} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 12.5, padding: "8px 14px", borderRadius: 9, cursor: "pointer" }}>{rosterOpen ? "Close" : "Add students"}</button>
        </div>
        {rosterOpen && (
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: "16px 18px", marginBottom: 22 }}>
            <div style={{ fontSize: 12.5, color: c.soft, marginBottom: 10 }}>Paste one student name per line. They join the roster as placeholders until each signs up and enters the class code.</div>
            <textarea
              value={rosterText}
              onChange={(e) => setRosterText(e.target.value)}
              placeholder={"Ama Owusu\nKofi Mensah\nAdwoa Boateng"}
              rows={5}
              style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: `1px solid ${c.border}`, borderRadius: 11, padding: "12px 14px", fontSize: 14, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body, marginBottom: 12 }}
            />
            <button disabled={addRoster.isPending || !rosterText.trim()} onClick={() => void addStudents(current.id)} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 13.5, padding: "10px 18px", borderRadius: 10, cursor: "pointer", opacity: addRoster.isPending || !rosterText.trim() ? 0.6 : 1 }}>{addRoster.isPending ? "Adding…" : "Add to roster"}</button>
          </div>
        )}
        <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 }}>Where students stand</div>
        <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, overflowX: "auto", marginBottom: 24 }}>
          <div style={{ minWidth: L.mobile ? 520 : undefined }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.3fr 1fr 1fr", padding: "12px 18px", fontSize: 11, fontWeight: 600, color: c.faint, textTransform: "uppercase", letterSpacing: ".04em", borderBottom: `1px solid ${c.divider}` }}>
              <span>Student</span><span>Current concept</span><span>Stage</span><span style={{ textAlign: "right" }}>Mastery</span>
            </div>
            {(students || []).length === 0 && <div style={{ padding: "16px 18px", fontSize: 13, color: c.muted }}>No students on the roster yet. Share the join code {current.code}.</div>}
            {(students || []).map((s) => (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.3fr 1fr 1fr", alignItems: "center", padding: "13px 18px", borderBottom: `1px solid ${c.paper}`, fontSize: 13.5 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 28, height: 28, flex: "none", borderRadius: "50%", background: s.color, color: "#fff", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.mark}</span>{s.name}
                </span>
                <span style={{ color: "#6b6456" }}>{s.concept}</span>
                <span style={{ color: "#6b6456" }}>{s.stage}</span>
                <span style={{ textAlign: "right", fontWeight: 600, color: level(s.level)[0] }}>{s.level}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 12 }}>Class challenges</div>
        {(classChallenges || []).length === 0 ? (
          <div style={{ background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 12, padding: "14px 15px", fontSize: 13, color: c.muted }}>No challenges for this class yet. Create one to give students something applied to work on.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {(classChallenges || []).map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => nav(`/teacher/classes/${current.id}/challenge/${ch.id}/edit`)}
                style={{ width: "100%", textAlign: "left", background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: ch.fg, background: ch.bg, padding: "4px 10px", borderRadius: 20 }}>{ch.type}</span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{ch.title}</span>
                <span style={{ fontSize: 12, color: c.faint }}>{ch.submitted} submitted</span>
                <span style={{ fontSize: 12, color: c.faint }}>Edit ›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "settings" && current) {
    return (
      <div style={pageBox(L.pad, 680)}>
        <button onClick={() => setView("detail")} style={backBtn}>← {current.name}</button>
        <div style={{ fontFamily: font.display, fontSize: 24, marginBottom: 4 }}>Class settings</div>
        <div style={{ fontSize: 13.5, color: c.muted, marginBottom: 24 }}>Control how {current.name} works for your students.</div>

        {!settingsDraft ? (
          <Loading label="Loading settings…" />
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {settingToggles.map((t) => {
                const on = settingsDraft[t.key];
                return (
                  <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 14, background: c.surface, border: `1px solid ${c.border2}`, borderRadius: 14, padding: "15px 18px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: c.ink }}>{t.label}</div>
                      <div style={{ fontSize: 12.5, color: c.muted, lineHeight: 1.5, marginTop: 2 }}>{t.help}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettingsDraft({ ...settingsDraft, [t.key]: !on })}
                      style={{ flex: "none", width: 46, height: 26, borderRadius: 13, border: "none", background: on ? c.green : "#d8d1c2", position: "relative", cursor: "pointer", transition: "background .15s" }}
                    >
                      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: c.faint, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 8 }}>Assessment rules</div>
            <textarea
              value={settingsDraft.assessmentRules}
              onChange={(e) => setSettingsDraft({ ...settingsDraft, assessmentRules: e.target.value })}
              placeholder="e.g. Mock exams are timed and closed-book. One retake allowed."
              rows={3}
              style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: `1px solid ${c.border}`, borderRadius: 11, padding: "12px 14px", fontSize: 14, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body, marginBottom: 22 }}
            />

            <button disabled={updateSettings.isPending} onClick={() => void saveSettings(current.id)} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14.5, padding: "13px 24px", borderRadius: 12, cursor: "pointer", opacity: updateSettings.isPending ? 0.7 : 1 }}>{updateSettings.isPending ? "Saving…" : "Save settings"}</button>
          </>
        )}
      </div>
    );
  }

  // new
  return (
    <div style={pageBox(L.pad, 1020)}>
      <button onClick={() => setView("list")} style={backBtn}>← All classes</button>
      <h1 style={{ fontSize: 24, marginBottom: 6 }}>New class</h1>
      <p style={{ fontSize: 14, color: c.muted, marginBottom: 24 }}>Set up a class, then share the join code with your students.</p>
      <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 24, maxWidth: 520 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          {classNewFields.map((f) => (
            <div key={f}>
              <div style={{ fontSize: 12, color: c.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 7 }}>{f}</div>
              <input value={form[f] || ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} placeholder={`Enter ${f.toLowerCase()}…`} style={{ width: "100%", border: `1px solid ${c.border}`, borderRadius: 11, padding: "13px 14px", fontSize: 14, background: "#fff", color: c.ink, outline: "none", fontFamily: font.body }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            disabled={createClass.isPending || !form["Class name"]}
            onClick={async () => {
              try {
                await createClass.mutateAsync({ name: form["Class name"] || "New class", subject: form["Subject"], year_group: form["Year group"] });
                setView("list");
              } catch (e) {
                const msg = e instanceof Error ? e.message : "Could not create this class.";
                toast({ title: "Create failed", description: msg, variant: "destructive" });
              }
            }}
            style={{ flex: 1, background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14.5, padding: 13, borderRadius: 11, cursor: "pointer", opacity: createClass.isPending || !form["Class name"] ? 0.6 : 1 }}
          >{createClass.isPending ? "Creating…" : "Create class"}</button>
          <button onClick={() => setView("list")} style={{ background: "none", border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14.5, padding: "13px 22px", borderRadius: 11, cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const backBtn = { background: "none", border: "none", color: c.faint, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 14 } as const;

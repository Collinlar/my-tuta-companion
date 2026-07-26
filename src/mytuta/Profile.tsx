import { useEffect, useRef, useState } from "react";
import { c, font, chip } from "./theme";
import { Loading } from "./ui";
import { useLayout, pageBox } from "./layout";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "./data/queries";
import { useUpdateProfile, useUploadAvatar } from "./data/mutations";
import { getInitials } from "./useRole";
import { studentSteps, teacherSteps } from "./data/onboarding";

const studentStageOptions = studentSteps[0].options;
const studentSubjectOptions = studentSteps[1].options.filter((_, i) => !studentSteps[1].soon?.includes(i));
const studentGoalOptions = studentSteps[2].options;
const teacherStageOptions = ["Lower secondary", "Upper secondary"];
const teacherSubjectOptions = teacherSteps[0].options.filter((o) => !teacherStageOptions.includes(o));

export default function Profile() {
  const L = useLayout();
  const { toast } = useToast();
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const fileRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [parentContact, setParentContact] = useState("");
  const [teachingExperience, setTeachingExperience] = useState("");

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setBio(profile.bio);
    setSchool(profile.school);
    setGrade(profile.grade);
    setSubjects(profile.subjects);
    setGoals(profile.goals);
    setParentContact(profile.parentContact);
    setTeachingExperience(profile.teachingExperience);
  }, [profile]);

  if (isLoading || !profile) return <Loading label="Loading your profile…" />;

  const isTeacher = profile.userType === "teacher";
  const stageOptions = isTeacher ? teacherStageOptions : studentStageOptions;
  const subjectOptions = isTeacher ? teacherSubjectOptions : studentSubjectOptions;

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Not an image", description: "Choose a JPG, PNG or WebP file.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Keep photos under 3MB.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    try {
      await uploadAvatar.mutateAsync(file);
      toast({ title: "Photo updated" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not upload your photo just now.";
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    } finally {
      e.target.value = "";
    }
  };

  const save = async () => {
    try {
      await update.mutateAsync({
        firstName, lastName, bio, school, grade, subjects,
        goals: isTeacher ? undefined : goals,
        parentContact: isTeacher ? undefined : parentContact,
        teachingExperience: isTeacher ? teachingExperience : undefined,
      });
      toast({ title: "Profile saved" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save your profile just now.";
      toast({ title: "Could not save", description: msg, variant: "destructive" });
    }
  };

  return (
    <div style={pageBox(L.pad, 700)}>
      <div style={{ fontFamily: font.display, fontSize: 26, marginBottom: 4 }}>Your profile</div>
      <div style={{ color: c.muted, fontSize: 14.5, marginBottom: 22 }}>{profile.email} · {isTeacher ? "Teacher" : "Student"}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="Your photo" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: `1px solid ${c.border2}` }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: c.greenTint, color: c.greenDark, fontWeight: 700, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>{getInitials()}</div>
        )}
        <div>
          <button type="button" disabled={uploadAvatar.isPending} onClick={() => fileRef.current?.click()} style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 13.5, padding: "9px 16px", borderRadius: 10, cursor: "pointer", opacity: uploadAvatar.isPending ? 0.7 : 1 }}>
            {uploadAvatar.isPending ? "Uploading…" : "Change photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickAvatar} style={{ display: "none" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: L.g2, gap: 14, marginBottom: 14 }}>
        <Field label="First name" value={firstName} onChange={setFirstName} placeholder="Ama" />
        <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Owusu" />
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={labelStyle}>Bio</div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Tell us a little about yourself…"
          style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: `1px solid ${c.border}`, borderRadius: 11, padding: "12px 14px", fontSize: 15, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: L.g2, gap: 14, marginBottom: 22 }}>
        <Field label="School" value={school} onChange={setSchool} placeholder="Your school name" />
        {isTeacher ? (
          <Field label="Teaching experience" value={teachingExperience} onChange={setTeachingExperience} placeholder="e.g. 5 years" />
        ) : (
          <Field label="Parent or guardian contact" value={parentContact} onChange={setParentContact} placeholder="Phone or email" />
        )}
      </div>

      <div style={labelStyle}>{isTeacher ? "Teaching stage" : "Learning stage"}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
        {stageOptions.map((o) => (
          <button key={o} type="button" onClick={() => setGrade(o)} style={chip(grade === o)}>{o}</button>
        ))}
      </div>

      <div style={labelStyle}>{isTeacher ? "Subjects you teach" : "Subjects you study"}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
        {subjectOptions.map((o) => (
          <button key={o} type="button" onClick={() => toggle(subjects, setSubjects, o)} style={chip(subjects.includes(o))}>{o}</button>
        ))}
      </div>

      {!isTeacher && (
        <>
          <div style={labelStyle}>Your goals</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
            {studentGoalOptions.map((o) => (
              <button key={o} type="button" onClick={() => toggle(goals, setGoals, o)} style={chip(goals.includes(o))}>{o}</button>
            ))}
          </div>
        </>
      )}

      <button type="button" disabled={update.isPending} onClick={save} style={{ background: c.green, color: "#fff", border: "none", fontWeight: 600, fontSize: 14.5, padding: "13px 24px", borderRadius: 12, cursor: "pointer", opacity: update.isPending ? 0.7 : 1 }}>
        {update.isPending ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label style={{ display: "block" }}>
      <div style={labelStyle}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${c.border}`, borderRadius: 11, padding: "12px 14px", fontSize: 15, color: c.ink, background: "#fff", outline: "none", fontFamily: font.body }}
      />
    </label>
  );
}

const labelStyle = { fontSize: 12, color: c.faint, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: ".04em", marginBottom: 7 };

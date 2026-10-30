import { useMemo, useState } from "react";
import { a, card, badgeTone, input, ghostBtn, primaryBtn } from "./theme";
import { useAdminClusters, useAdminConcepts, type AdminCluster } from "./data/queries";
import { useUpsertCluster, useDeleteCluster, useSetClusterMembers } from "./data/mutations";
import { PageHeader, Loading, ErrorNote, ActionModal } from "./ui";

interface ClusterForm { id: string | null; slug: string; name: string; subject: string; description: string }
const EMPTY: ClusterForm = { id: null, slug: "", name: "", subject: "", description: "" };

// A readable slug from a name, used to pre-fill the slug when creating.
function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function Clusters() {
  const { data: clusters, isLoading, error } = useAdminClusters();
  const [form, setForm] = useState<ClusterForm | null>(null);
  const [del, setDel] = useState<AdminCluster | null>(null);
  const [membersFor, setMembersFor] = useState<AdminCluster | null>(null);

  const upsert = useUpsertCluster();
  const remove = useDeleteCluster();

  const set = (k: keyof ClusterForm, v: string) => setForm((p) => (p ? { ...p, [k]: v } : p));

  return (
    <>
      <PageHeader title="Clusters" subtitle="Group related concepts so a learner's cross-concept depth reads as one connected skill."
        right={<button type="button" onClick={() => setForm({ ...EMPTY })} style={primaryBtn()}>+ New cluster</button>} />
      <div style={{ padding: 30 }}>
        {isLoading ? <Loading label="Loading clusters…" /> : error || !clusters ? <ErrorNote message="Could not load clusters." /> : (
          <>
            {clusters.length === 0 && (
              <div style={{ ...card, padding: "20px 18px", fontSize: 13.5, color: a.faint }}>
                No clusters yet. Create one, then add the concepts that belong together.
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 14 }}>
              {clusters.map((cl) => (
                <div key={cl.id} style={{ ...card, padding: "18px 20px", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 15.5, color: a.ink }}>{cl.name}</div>
                    <span style={{ fontSize: 12, color: a.faint, flex: "none" }}>{cl.subject || "—"}</span>
                  </div>
                  <div style={{ fontSize: 12, color: a.faint, marginTop: 2, marginBottom: 10 }}>{cl.slug}</div>
                  {cl.description && <div style={{ fontSize: 13, color: a.muted, lineHeight: 1.55, marginBottom: 12 }}>{cl.description}</div>}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
                    {cl.members.length === 0
                      ? <span style={{ fontSize: 12.5, color: a.faint }}>No concepts yet.</span>
                      : cl.members.map((m) => <span key={m.id} style={badgeTone("neutral")}>{m.name}</span>)}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                    <button type="button" onClick={() => setMembersFor(cl)} style={{ ...ghostBtn(), fontSize: 12.5, color: "#1D9E75", fontWeight: 600 }}>
                      Members ({cl.members.length})
                    </button>
                    <button type="button" onClick={() => setForm({ id: cl.id, slug: cl.slug, name: cl.name, subject: cl.subject || "", description: cl.description || "" })} style={{ ...ghostBtn(), fontSize: 12.5 }}>Edit</button>
                    <button type="button" onClick={() => setDel(cl)} style={{ ...ghostBtn(), fontSize: 12.5, color: a.red, marginLeft: "auto" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {form && (
        <ActionModal
          title={form.id ? "Edit cluster" : "New cluster"}
          confirmLabel={form.id ? "Save cluster" : "Create cluster"}
          busy={upsert.isPending}
          onClose={() => setForm(null)}
          onConfirm={(reason) => {
            const slug = form.slug.trim() || slugify(form.name);
            void upsert.mutateAsync({ id: form.id, slug, name: form.name.trim(), subject: form.subject.trim(), description: form.description.trim(), reason })
              .then(() => setForm(null));
          }}
          extra={
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Name"><input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Algebraic Reasoning" style={input} /></Field>
              <Field label="Slug"><input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder={form.name ? slugify(form.name) : "algebraic-reasoning"} style={input} /></Field>
              <Field label="Subject"><input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Mathematics" style={input} /></Field>
              <div />
              <div style={{ gridColumn: "1 / -1" }}><Field label="Description"><input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What ties these concepts together" style={input} /></Field></div>
            </div>
          } />
      )}

      {del && (
        <ActionModal
          title={`Delete ${del.name}?`}
          description="This removes the cluster and its concept membership. The concepts themselves and learners' mastery are untouched."
          confirmLabel="Delete cluster"
          danger
          busy={remove.isPending}
          onClose={() => setDel(null)}
          onConfirm={(reason) => { void remove.mutateAsync({ id: del.id, reason }).then(() => setDel(null)); }}
        />
      )}

      {membersFor && (
        <MembersModal cluster={membersFor} onClose={() => setMembersFor(null)} />
      )}
    </>
  );
}

function MembersModal({ cluster, onClose }: { cluster: AdminCluster; onClose: () => void }) {
  const { data, isLoading } = useAdminConcepts("", "", "", 500, 0);
  const save = useSetClusterMembers();
  const [sel, setSel] = useState<Set<string>>(() => new Set(cluster.members.map((m) => m.id)));
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const all = data?.rows || [];
    const needle = q.trim().toLowerCase();
    const filtered = needle ? all.filter((c) => c.name.toLowerCase().includes(needle) || (c.subject || "").toLowerCase().includes(needle)) : all;
    // Selected first, then alphabetical, so the current membership is easy to see.
    return [...filtered].sort((x, y) => (sel.has(y.id) ? 1 : 0) - (sel.has(x.id) ? 1 : 0) || x.name.localeCompare(y.name));
  }, [data, q, sel]);

  const toggle = (id: string) => setSel((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <ActionModal
      title={`Concepts in ${cluster.name}`}
      description="A cluster reaches a depth only when every concept in it is secure at that depth, so keep it to concepts that truly belong together."
      confirmLabel={`Save ${sel.size} concept${sel.size === 1 ? "" : "s"}`}
      busy={save.isPending}
      onClose={onClose}
      onConfirm={(reason) => { void save.mutateAsync({ clusterId: cluster.id, conceptIds: [...sel], reason }).then(onClose); }}
      extra={
        <div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search concepts" style={{ ...input, marginBottom: 10 }} />
          <div style={{ maxHeight: 280, overflowY: "auto", border: `1px solid ${a.border}`, borderRadius: 10 }}>
            {isLoading ? <div style={{ padding: 14, fontSize: 13, color: a.faint }}>Loading concepts…</div>
              : rows.length === 0 ? <div style={{ padding: 14, fontSize: 13, color: a.faint }}>No concepts match.</div>
              : rows.map((cpt) => (
                <label key={cpt.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: `1px solid ${a.border2}`, cursor: "pointer", fontSize: 13.5 }}>
                  <input type="checkbox" checked={sel.has(cpt.id)} onChange={() => toggle(cpt.id)} style={{ width: 16, height: 16, flex: "none" }} />
                  <span style={{ fontWeight: 500, color: a.ink }}>{cpt.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: 12, color: a.faint }}>{cpt.subject || "—"}</span>
                </label>
              ))}
          </div>
        </div>
      } />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ fontSize: 12, fontWeight: 600, color: a.muted, display: "block", marginBottom: 6 }}>{label}</label>{children}</div>;
}

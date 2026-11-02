// Applies the queued Mastery Depth migrations (0007-0013) in order, straight to
// Postgres over the connection string you paste when prompted. No psql needed.
//
// Why not the Supabase SQL editor: several migrations define plpgsql functions
// with DML, and the web editor mangles those bodies. A direct Postgres
// connection (which this uses) runs them verbatim.
//
// One-time setup, then run, from the project root (C:\Users\dell\tuta-study-buddy):
//   npm install pg --no-save
//   node supabase/apply_mastery_depth.mjs
//
// Every migration is idempotent (CREATE OR REPLACE / IF NOT EXISTS /
// ADD COLUMN IF NOT EXISTS), so it is safe to run even if some were already
// applied. Each file runs in its own transaction and rolls back on error.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

let Client;
try {
  ({ Client } = (await import("pg")).default);
} catch {
  console.error("\nThe 'pg' package is not installed. First run:\n  npm install pg --no-save\n");
  process.exit(1);
}

const HERE = dirname(fileURLToPath(import.meta.url));
const FILES = [
  "20270000000005_mastery_depth_retention_fractions.sql",
  "20270000000006_teacher_depth_summary.sql",
  "20270000000007_admin_concept_depth.sql",
  "20270000000008_mastery_depth_clusters.sql",
  "20270000000009_admin_depth_analytics.sql",
  "20270000000010_retention_ease_factor.sql",
  "20270000000011_nba_section32_reorder.sql",
  "20270000000012_admin_cluster_crud.sql",
  "20270000000013_nba_relevant_lab.sql",
  "20270000000014_nba_relevant_lab_fix.sql",
  "20270000000015_concept_competency_spine.sql",
  "20270000000016_admin_competency_crud.sql",
  "20270000000017_knowledge_blocks.sql",
  "20270000000018_admin_knowledge_blocks.sql",
  "20270000000019_depth_evidence_block_source.sql",
  "20270000000020_knowledge_block_review.sql",
  "20270000000021_foundation_evidence.sql",
  "20270000000022_competency_pilot_drafts.sql",
  "20270000000023_block_authoring_contract.sql",
  "20270000000024_block_learning_runtime.sql",
  "20270000000025_competency_depth_completion.sql",
  "20270000000026_block_runtime_contract.sql",
  "20270000000027_depth_journey_drafts.sql",
  "20270000000028_teacher_block_insights.sql",
  "20270000000029_example_selection_drafts.sql",
  "20270000000030_publish_competency_depth.sql",
  "20270000000031_foundation_structure_completion.sql",
  "20270000000032_block_reinforcement.sql",
  "20270000000033_curriculum_mappings.sql",
  "20270000000034_class_competency_analytics.sql",
  "20270000000035_media_support_contract.sql",
];

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a.trim()); }));
}

const conn = process.env.DATABASE_URL || (await ask("Paste your Supabase connection string (with the password filled in), then press Enter:\n> "));
if (!conn) { console.error("No connection string given."); process.exit(1); }

const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log("Connected.\n");
  for (const f of FILES) {
    const sql = readFileSync(join(HERE, "migrations", f), "utf8");
    process.stdout.write(`>> applying ${f} ... `);
    // One client.query of the whole file runs it as a single implicit
    // transaction: any error rolls the whole file back.
    await client.query(sql);
    console.log("ok");
  }
  console.log("\nDone: all Mastery Depth migrations applied.");
} catch (err) {
  console.error("\nFAILED:", err.message);
  console.error("Nothing from the failing file was committed. Fix and re-run.");
  process.exitCode = 1;
} finally {
  await client.end();
}

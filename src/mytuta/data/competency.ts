// Concept Competency Framework — pure model shared by admin authoring and (in
// later phases) the student Foundation experience. No I/O here.

import type { Depth } from "./depth";

/** The nine concept types (PRD 7). The primary type selects which Knowledge
 * Block template a concept's Foundation uses in Phase 1. */
export const CONCEPT_TYPES = [
  "structural", "process", "procedural", "quantitative", "principle",
  "classification", "systems", "causal", "representational",
] as const;
export type ConceptType = (typeof CONCEPT_TYPES)[number];

export const CONCEPT_TYPE_LABEL: Record<ConceptType, string> = {
  structural: "Structural",
  process: "Process",
  procedural: "Procedural",
  quantitative: "Quantitative",
  principle: "Principle",
  classification: "Classification",
  systems: "Systems",
  causal: "Causal",
  representational: "Representational",
};

// One-line guide shown next to each type when the academic team picks one.
export const CONCEPT_TYPE_HINT: Record<ConceptType, string> = {
  structural: "Parts and how they fit together. Solar System, Atom, Plant Cell.",
  process: "A sequence that transforms inputs to outputs. Photosynthesis, Water Cycle.",
  procedural: "A method or set of steps. Solving equations, Balancing equations.",
  quantitative: "A measurable quantity with a formula. Density, Speed, Pressure.",
  principle: "A law or rule that holds across cases. Conservation of Energy, Newton's Laws.",
  classification: "Sorting things by criteria. Types of Rocks, Classification of Animals.",
  systems: "Interacting parts with feedback. Ecosystem, Electrical Circuit.",
  causal: "Cause, mechanism and effect. Greenhouse Effect, Disease Transmission.",
  representational: "A notation or representation to read and use. Graphs, Scientific Notation.",
};

export function isConceptType(v: string | null | undefined): v is ConceptType {
  return !!v && (CONCEPT_TYPES as readonly string[]).includes(v);
}

/** How a competency is proven. Maps to depth_evidence source types where they
 * already exist, so completeness (Phase 2) reads from one evidence stream. */
export const EVIDENCE_TYPES = [
  "quick_check", "worked_example", "application", "misconception", "recall", "mastery_check",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export interface Competency {
  id: string;
  concept_id: string;
  depth: Depth;
  competency_key: string;
  description: string;
  required: boolean;
  sequence: number;
  evidence_type: string | null;
  review_status: string;
  version: number;
}

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { learningContent, suggestedBlock, type BlockProgress } from "../mytuta/data/blockRuntime";
import type { KnowledgeBlock } from "../mytuta/data/blocks";
import { blockContentSchema } from "../mytuta/data/blockValidation";
import KnowledgeBlocks from "../mytuta/student/KnowledgeBlocks";
import ReviewedBlockTask from "../mytuta/student/ReviewedBlockTask";
import PrerequisiteRepair from "../mytuta/student/PrerequisiteRepair";
import KnowledgeBlockVisual from "../mytuta/student/KnowledgeBlockVisual";

const check = { prompt: "What is density?", options: ["Mass per volume", "Mass alone"], correctIndex: 0, explanation: "Use both mass and volume." };
const block: KnowledgeBlock = { id: "b", concept_id: "c", depth: "foundation", block_type: "definition", title: "Density", required: true, sequence: 0, objective: "Define density", estimated_time: null, review_status: "published", version: 1, content: { body: "Mass divided by volume.", quickCheck: check } };
const progress: BlockProgress = { id: "b", version: 1, covered: false, state: "needs_review", gaps: [] };

describe("adaptive block runtime", () => {
  it("pairs a selected alternative with its own check without changing the authored base", () => {
    const selected = { ...progress, selectedExample: { key: "simple", body: "Two grams in one cubic centimetre.", category: "recognition" as const, difficulty: 1, support: "guided" as const, quickCheck: { ...check, prompt: "Density of this sample?" } } };
    expect(learningContent(block, selected).quickCheck?.prompt).toBe("Density of this sample?");
    expect(block.content?.quickCheck?.prompt).toBe("What is density?");
  });
  it("routes to a weak eligible block before untouched content and skips pending review", () => {
    const blocks = [block, { ...block, id: "weak" }, { ...block, id: "pending" }];
    expect(suggestedBlock(blocks, { weak: { ...progress, id: "weak" } })).toBe(1);
    expect(suggestedBlock(blocks, { weak: { ...progress, id: "weak", gaps: [{ kind: "skill", key: "division", label: "Division" }] }, b: { ...progress, state: "in_progress", response: { id: "r", status: "pending", text: "Submitted", feedback: null } } })).toBe(2);
  });
  it("restores a needs-review state and does not count it as understood", () => {
    render(<KnowledgeBlocks conceptName="Density" blocks={[block]} progress={{ b: progress }} onNext={vi.fn()} />);
    expect(screen.getByText(/Your Foundation/)).toHaveTextContent("0/1 understood");
    expect(screen.queryByRole("button", { name: /Finish understanding/ })).not.toBeInTheDocument();
  });
  it("does not override a negative server decision with the locally predicted answer", async () => {
    render(<KnowledgeBlocks conceptName="Density" blocks={[block]} onBlockUnderstood={vi.fn().mockResolvedValue(false)} onNext={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /A. Mass per volume/ }));
    await waitFor(() => expect(screen.getByText(/Your Foundation/)).toHaveTextContent("0/1 understood"));
    expect(screen.queryByRole("button", { name: /Finish understanding/ })).not.toBeInTheDocument();
  });
  it("requires valid example keys and valid repair checks", () => {
    const example = { key: "same", body: "Example", category: "recognition", difficulty: 1, support: "guided", quickCheck: check };
    expect(blockContentSchema.safeParse({ body: "Teach", examples: [example, example] }).success).toBe(false);
    expect(blockContentSchema.safeParse({ body: "Teach", prerequisites: [{ kind: "skill", key: "division", label: "Division", check: { ...check, correctIndex: 8 } }] }).success).toBe(false);
  });
});
describe("review and prerequisite repair", () => {
  it("does not allow continuing a reviewed task after a failed submission", async () => {
    render(<ReviewedBlockTask task={{ prompt: "Explain your method", rubric: ["Justify the method"] }} onSubmit={vi.fn().mockRejectedValue(new Error("offline"))} onContinue={vi.fn()} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I will compare both samples using the same volume and measured mass." } });
    fireEvent.click(screen.getByRole("button", { name: "Submit for review" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("could not be submitted");
    expect(screen.queryByRole("button", { name: /Continue to the next/ })).not.toBeInTheDocument();
  });
  it("shows a successfully submitted response as pending, rather than passed", async () => {
    render(<ReviewedBlockTask task={{ prompt: "Explain your method", rubric: ["Justify the method"] }} onSubmit={vi.fn().mockResolvedValue("response")} onContinue={vi.fn()} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I will compare both samples using the same volume and measured mass." } });
    fireEvent.click(screen.getByRole("button", { name: "Submit for review" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Awaiting review");
    expect(screen.queryByText("This response has passed review.")).not.toBeInTheDocument();
  });
  it("uses an assessment result for prerequisite repair", async () => {
    const repair = vi.fn().mockResolvedValue(false);
    render(<PrerequisiteRepair gap={{ kind: "skill", key: "division", label: "Division", refresher: "Divide into equal groups.", check }} onRepair={repair} />);
    fireEvent.click(screen.getByRole("button", { name: "Mass alone" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Not quite");
    expect(repair).toHaveBeenCalledWith(1);
  });
});
describe("interactive representations", () => {
  it("updates the density calculation when a learner changes mass", () => {
    render(<KnowledgeBlockVisual visual="density_mass_volume" />);
    fireEvent.change(screen.getByRole("slider", { name: "Explore mass" }), { target: { value: "40" } });
    expect(screen.getByRole("status")).toHaveTextContent("4.00 g/cm³");
  });
  it("identifies ice giants when a learner selects Neptune", () => {
    render(<KnowledgeBlockVisual visual="solar_system" />);
    fireEvent.click(screen.getByRole("button", { name: "Neptune" }));
    expect(screen.getByText(/Neptune is planet 8/)).toHaveTextContent("an ice giant");
  });
});

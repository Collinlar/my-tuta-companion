import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import KnowledgeBlocks from "../mytuta/student/KnowledgeBlocks";
import type { KnowledgeBlock } from "../mytuta/data/blocks";
import { blockContentSchema } from "../mytuta/data/blockValidation";
import KnowledgeBlockVisual from "../mytuta/student/KnowledgeBlockVisual";

const block: KnowledgeBlock = {
  id: "block", concept_id: "density", depth: "foundation", block_type: "definition",
  title: "Density", objective: "Compare mass per unit volume", required: true, sequence: 0,
  estimated_time: "2 min", review_status: "published", content: {
    body: "Density is mass per unit volume.",
    quickCheck: { prompt: "Which describes density?", options: ["Mass per volume", "Volume alone"], correctIndex: 0, explanation: "Both mass and volume matter." },
  },
};

describe("Foundation block evidence", () => {
  it("records a failed check without granting coverage and offers retry", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    render(<KnowledgeBlocks conceptName="Density" blocks={[block]} onBlockUnderstood={save} onNext={vi.fn()} />);
    expect(screen.queryByText("Mark understood and continue")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /B. Volume alone/ }));
    await waitFor(() => expect(save).toHaveBeenCalledWith("block", false, 1));
    expect(await screen.findByRole("button", { name: "Try the check again" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Finish understanding/ })).not.toBeInTheDocument();
  });

  it("waits for durable evidence before allowing completion", async () => {
    let resolve!: () => void;
    const save = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    render(<KnowledgeBlocks conceptName="Density" blocks={[block]} onBlockUnderstood={save} onNext={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /A. Mass per volume/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Saving");
    expect(screen.queryByRole("button", { name: /Finish understanding/ })).not.toBeInTheDocument();
    resolve();
    expect(await screen.findByRole("button", { name: /Finish understanding/ })).toBeEnabled();
  });

  it("keeps a failed save incomplete and allows another attempt", async () => {
    render(<KnowledgeBlocks conceptName="Density" blocks={[block]} onBlockUnderstood={vi.fn().mockRejectedValue(new Error("offline"))} onNext={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /A. Mass per volume/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("could not be saved");
    expect(screen.getByRole("button", { name: /A. Mass per volume/ })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /Finish understanding/ })).not.toBeInTheDocument();
  });

  it("restores coverage arriving after mount and counts only required blocks", async () => {
    const optional = { ...block, id: "optional", required: false };
    const props = { conceptName: "Density", blocks: [block, optional], onNext: vi.fn() };
    const { rerender } = render(<KnowledgeBlocks {...props} />);
    expect(screen.getByText(/Your Foundation/)).toHaveTextContent("0/1 understood");
    rerender(<KnowledgeBlocks {...props} covered={new Set(["block"])} />);
    await waitFor(() => expect(screen.getByText(/Your Foundation/)).toHaveTextContent("1/1 understood"));
  });

  it("defers a block when its prerequisites are not secure", () => {
    render(<KnowledgeBlocks conceptName="Density" blocks={[block]} prerequisiteGaps={{ block: [{ kind: "skill", key: "division", label: "Division", refresher: "Practise equal groups first." }] }} onNext={vi.fn()} />);
    expect(screen.getByText("Division")).toBeInTheDocument();
    expect(screen.getByText("Practise equal groups first.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /A. Mass per volume/ })).not.toBeInTheDocument();
  });
});

describe("block content validation", () => {
  it("rejects empty teaching content and out-of-range correct answers", () => {
    expect(blockContentSchema.safeParse({ body: " " }).success).toBe(false);
    expect(blockContentSchema.safeParse({ ...block.content, quickCheck: { ...block.content!.quickCheck, correctIndex: 9 } }).success).toBe(false);
  });
});

describe("pilot diagrams", () => {
  it("provides an accessible mass-volume graph with labelled units", () => {
    render(<KnowledgeBlockVisual visual="density_mass_volume" />);
    expect(screen.getByRole("img", { name: /material A reaches 30 grams/ })).toBeInTheDocument();
    expect(screen.getByText("Volume (cm³)")).toBeInTheDocument();
    expect(screen.getByText("Mass (g)")).toBeInTheDocument();
  });
  it("identifies the planets and explicitly warns that the model is not to scale", () => {
    render(<KnowledgeBlockVisual visual="solar_system" />);
    expect(screen.getByRole("img", { name: /Mercury, Venus, Earth, Mars/ })).toBeInTheDocument();
    expect(screen.getByText("Neptune")).toBeInTheDocument();
    expect(screen.getByText(/Order only: sizes and distances are not to scale/)).toBeInTheDocument();
  });
});

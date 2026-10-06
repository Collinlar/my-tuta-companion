import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

import { supabase } from "@/integrations/supabase/client";
import { renderHook } from "@testing-library/react";
import { useMisconceptionTracker } from "../hooks/useMisconceptionTracker";

const mockAuth = supabase.auth.getUser as ReturnType<typeof vi.fn>;
const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

function chainFor(data: unknown, insertData?: unknown) {
  const resolved = { data: null as unknown, error: null };
  const chain: Record<string, unknown> & { then?: unknown } = {};
  const methods = ["select","eq","ilike","maybeSingle","insert","update","is"];
  for (const m of methods) chain[m] = vi.fn(() => chain);
  // Make the chain itself thenable so `await chain` works as a terminal call
  chain.then = (resolve: (v: unknown) => void) => { resolve(resolved); };
  (chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({ data, error: null });
  (chain.insert as ReturnType<typeof vi.fn>).mockResolvedValue({ data: insertData ?? data, error: null });
  return chain;
}

describe("useMisconceptionTracker", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns matched=false when mistakeCategory is null", async () => {
    mockAuth.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const { result } = renderHook(() => useMisconceptionTracker());
    const outcome = await result.current.trackWrongAnswer("concept-1", null);
    expect(outcome.matched).toBe(false);
    expect(outcome.misconceptionId).toBeNull();
  });

  it("returns matched=false when no misconception matches", async () => {
    mockAuth.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFrom.mockReturnValue(chainFor(null));
    const { result } = renderHook(() => useMisconceptionTracker());
    const outcome = await result.current.trackWrongAnswer("concept-1", "unrecognised-category");
    expect(outcome.matched).toBe(false);
  });

  it("returns matched=true and inserts resolution when misconception is found", async () => {
    mockAuth.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const misRow = { id: "mis-1", intervention_content: { opening: "Let us revisit..." }, teacher_guidance: "Show worked example", error_pattern: "sign error" };
    const resolutionChain = chainFor(null);

    mockFrom.mockImplementation((table: string) => {
      if (table === "misconceptions") return chainFor(misRow);
      if (table === "misconception_resolutions") return resolutionChain;
      return chainFor(null);
    });

    const { result } = renderHook(() => useMisconceptionTracker());
    const outcome = await result.current.trackWrongAnswer("concept-1", "sign error");

    expect(outcome.matched).toBe(true);
    expect(outcome.misconceptionId).toBe("mis-1");
    expect(outcome.interventionContent).toEqual({ opening: "Let us revisit..." });
    expect(resolutionChain.insert).toHaveBeenCalled();
  });

  it("increments occurrence_count instead of inserting when resolution already exists", async () => {
    mockAuth.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const misRow = { id: "mis-1", intervention_content: null, teacher_guidance: null, error_pattern: "sign error" };
    const existingResolution = { id: "res-1", occurrence_count: 2 };
    const resolutionChain = chainFor(existingResolution);

    mockFrom.mockImplementation((table: string) => {
      if (table === "misconceptions") return chainFor(misRow);
      if (table === "misconception_resolutions") return resolutionChain;
      return chainFor(null);
    });

    const { result } = renderHook(() => useMisconceptionTracker());
    await result.current.trackWrongAnswer("concept-1", "sign error");

    expect(resolutionChain.insert).not.toHaveBeenCalled();
    expect(resolutionChain.update).toHaveBeenCalled();
  });
});

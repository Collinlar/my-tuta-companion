import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    rpc: vi.fn(),
    from: vi.fn(),
  },
}));
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const real = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...real,
    useQueryClient: vi.fn().mockReturnValue({ invalidateQueries: vi.fn() }),
    useMutation: vi.fn().mockImplementation(({ mutationFn }: { mutationFn: (...args: unknown[]) => unknown }) => ({
      mutateAsync: mutationFn,
      isPending: false,
    })),
  };
});

import { supabase } from "@/integrations/supabase/client";
import { renderHook } from "@testing-library/react";
import { useSpendCredits } from "../mytuta/data/mutations";

const mockRpc = supabase.rpc as ReturnType<typeof vi.fn>;

describe("useSpendCredits", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns ok=true and positive cost when balance is sufficient", async () => {
    mockRpc.mockResolvedValue({
      data: { ok: true, cost: 5, balance_after: 45, txn_id: "txn-abc" },
      error: null,
    });
    const { result } = renderHook(() => useSpendCredits());
    const res = await result.current.mutateAsync("mastery_path");
    expect(res.ok).toBe(true);
    expect(res.cost).toBe(5);
    expect(res.txnId).toBe("txn-abc");
    expect(mockRpc).toHaveBeenCalledWith("spend_credits", { p_action_key: "mastery_path" });
  });

  it("returns ok=false and needed amount when balance is insufficient", async () => {
    mockRpc.mockResolvedValue({
      data: { ok: false, cost: 5, balance: 2, needed: 3 },
      error: null,
    });
    const { result } = renderHook(() => useSpendCredits());
    const res = await result.current.mutateAsync("mastery_path");
    expect(res.ok).toBe(false);
    expect(res.balance).toBe(2);
    expect(res.needed).toBe(3);
  });

  it("throws when Supabase returns an error", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: "DB error" } });
    const { result } = renderHook(() => useSpendCredits());
    await expect(result.current.mutateAsync("mastery_path")).rejects.toMatchObject({ message: "DB error" });
  });
});

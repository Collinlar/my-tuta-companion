import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { c, font } from "../theme";
import { useToast } from "@/hooks/use-toast";
import { useActionCosts, useWalletSummary } from "../data/queries";
import { useSpendCredits, useRefundCredits } from "../data/mutations";

const SKIP_KEY = "mytuta_skip_1credit_confirm";

export interface GateOptions {
  actionKey: string;
  /** Modal heading, e.g. "Create complete Mastery Path?" */
  title: string;
  /** One line describing what will be created. */
  description: string;
  /** The real (AI) work. Runs only after credits are successfully spent. May throw. */
  action: () => Promise<void> | void;
}

interface GateContext {
  /** Returns true if the action ran (credits spent + action completed). */
  run: (opts: GateOptions) => Promise<boolean>;
}

const Ctx = createContext<GateContext | null>(null);

export function useCreditGate(): GateContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCreditGate must be used within CreditGateProvider");
  return ctx;
}

export function CreditGateProvider({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const { toast } = useToast();
  const { data: costs } = useActionCosts();
  const { data: wallet } = useWalletSummary();
  const spend = useSpendCredits();
  const refund = useRefundCredits();

  const [confirm, setConfirm] = useState<GateOptions | null>(null);
  const [low, setLow] = useState<{ cost: number; balance: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const resolver = useRef<((ran: boolean) => void) | null>(null);

  const settle = (ran: boolean) => {
    resolver.current?.(ran);
    resolver.current = null;
  };

  // Spend, then run the action. Refund on failure.
  const execute = useCallback(async (opts: GateOptions) => {
    setBusy(true);
    try {
      const res = await spend.mutateAsync(opts.actionKey);
      if (!res.ok) {
        setConfirm(null);
        setLow({ cost: res.cost, balance: res.balance ?? 0 });
        setBusy(false);
        return; // resolver settled when the low-credit modal closes
      }
      try {
        await opts.action();
        setConfirm(null);
        setBusy(false);
        settle(true);
      } catch (e) {
        if (res.txnId) refund.mutate(res.txnId);
        setConfirm(null);
        setBusy(false);
        const msg = e instanceof Error ? e.message : "That did not finish. Your credits were returned.";
        toast({ title: "Generation failed", description: msg, variant: "destructive" });
        settle(false);
      }
    } catch (e) {
      setConfirm(null);
      setBusy(false);
      const msg = e instanceof Error ? e.message : "Could not start that just now.";
      toast({ title: "Try again", description: msg, variant: "destructive" });
      settle(false);
    }
  }, [spend, refund, toast]);

  const run = useCallback((opts: GateOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      const cost = costs?.[opts.actionKey]?.cost ?? 0;
      const skip1 = localStorage.getItem(SKIP_KEY) === "1";
      if (cost === 1 && skip1) {
        void execute(opts);
      } else {
        setConfirm(opts);
      }
    });
  }, [costs, execute]);

  const cost = confirm ? (costs?.[confirm.actionKey]?.cost ?? 0) : 0;
  const balance = wallet?.total ?? 0;

  return (
    <Ctx.Provider value={{ run }}>
      {children}

      {confirm && (
        <Backdrop onClose={() => { setConfirm(null); settle(false); }}>
          <div style={{ fontFamily: font.display, fontSize: 20, marginBottom: 8 }}>{confirm.title}</div>
          <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.6, marginBottom: 18 }}>{confirm.description}</p>
          <div style={{ background: c.greenTint, border: `1px solid ${c.greenTintBorder}`, borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
            <Row label="Cost" value={`${cost} Tuta Credit${cost === 1 ? "" : "s"}`} />
            <Row label="Balance now" value={`${balance}`} />
            <Row label="Balance after" value={`${Math.max(0, balance - cost)}`} strong />
          </div>
          {cost === 1 && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: c.soft, marginBottom: 16, cursor: "pointer" }}>
              <input type="checkbox" onChange={(e) => localStorage.setItem(SKIP_KEY, e.target.checked ? "1" : "0")} />
              Do not ask again for actions costing 1 credit
            </label>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" disabled={busy} onClick={() => void execute(confirm)} style={primary(busy)}>{busy ? "Creating…" : `Use ${cost} credit${cost === 1 ? "" : "s"}`}</button>
            <button type="button" disabled={busy} onClick={() => { setConfirm(null); settle(false); }} style={ghost}>Cancel</button>
          </div>
        </Backdrop>
      )}

      {low && (
        <Backdrop onClose={() => { setLow(null); settle(false); }}>
          <div style={{ fontFamily: font.display, fontSize: 20, marginBottom: 8 }}>Not enough credits</div>
          <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.6, marginBottom: 18 }}>
            You need {low.cost} credit{low.cost === 1 ? "" : "s"} for this. Your balance is {low.balance}.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button type="button" onClick={() => { setLow(null); settle(false); nav("/pricing"); }} style={primary(false)}>Buy credits</button>
            <button type="button" onClick={() => { setLow(null); settle(false); nav("/pricing"); }} style={ghost}>See subscription plans</button>
            <button type="button" onClick={() => { setLow(null); settle(false); }} style={ghost}>Cancel</button>
          </div>
        </Backdrop>
      )}
    </Ctx.Provider>
  );
}

function Backdrop({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(30,40,32,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 50, animation: "fadein .15s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 18, padding: "26px 26px", boxShadow: "0 24px 60px rgba(30,40,32,.22)", fontFamily: font.body, color: c.ink }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "3px 0", color: strong ? c.greenDark : c.soft, fontWeight: strong ? 700 : 500 }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

const primary = (busy: boolean): React.CSSProperties => ({ flex: 1, background: c.green, color: "#fff", border: "none", fontWeight: 700, fontSize: 14.5, padding: 13, borderRadius: 12, cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 });
const ghost: React.CSSProperties = { background: c.surface, border: `1px solid ${c.border}`, color: c.soft, fontWeight: 600, fontSize: 14.5, padding: "13px 20px", borderRadius: 12, cursor: "pointer" };

/**
 * mytuta monitoring client — Phase 7: Production Hardening
 *
 * Two-tier approach:
 *   1. If VITE_SENTRY_DSN is set, ship errors to Sentry (install @sentry/react
 *      and call Sentry.init() in main.tsx to activate).
 *   2. Fallback: write to Supabase frontend_error_log / rpc_error_log via RPC.
 *
 * All calls are fire-and-forget. Monitoring must never throw or block the user.
 */

import { supabase } from "@/integrations/supabase/client";

const RELEASE = import.meta.env.VITE_APP_RELEASE as string | undefined;
const SLOW_RPC_THRESHOLD_MS = 3_000;

// ── Frontend error reporting ──────────────────────────────────────────────────

export function captureException(
  error: Error | unknown,
  context?: { component?: string; route?: string }
): void {
  const msg    = error instanceof Error ? error.message : String(error);
  const stack  = error instanceof Error ? (error.stack ?? null) : null;
  const route  = context?.route ?? (typeof window !== "undefined" ? window.location.pathname : null);
  const comp   = context?.component ?? null;

  // Sentry path — activated when @sentry/react is installed and DSN is set.
  const win = typeof window !== "undefined" ? (window as Window & { Sentry?: { captureException: (e: unknown, o?: object) => void } }) : null;
  if (win?.Sentry) {
    win.Sentry.captureException(error, { extra: { component: comp, route } });
    return;
  }

  // Supabase fallback — silently swallow any write failure.
  void supabase.rpc("log_frontend_error", {
    p_message:   msg,
    p_stack:     stack,
    p_component: comp,
    p_route:     route,
    p_release:   RELEASE ?? null,
  }).catch(() => { /* intentionally silent */ });
}

// ── RPC call wrapper with timing + error logging ──────────────────────────────

type RpcResult<T> = { data: T | null; error: { message: string; code?: string } | null };

export async function trackedRpc<T>(
  rpcName: string,
  call: () => Promise<RpcResult<T>>
): Promise<RpcResult<T>> {
  const start = Date.now();
  try {
    const result = await call();
    const ms = Date.now() - start;

    if (result.error || ms > SLOW_RPC_THRESHOLD_MS) {
      void supabase.rpc("log_rpc_error", {
        p_rpc_name:    rpcName,
        p_error_code:  result.error?.code ?? null,
        p_error_msg:   result.error?.message ?? null,
        p_duration_ms: ms,
        p_context:     { slow: ms > SLOW_RPC_THRESHOLD_MS },
      }).catch(() => { /* intentionally silent */ });
    }

    return result;
  } catch (err) {
    const ms = Date.now() - start;
    void supabase.rpc("log_rpc_error", {
      p_rpc_name:    rpcName,
      p_error_code:  "EXCEPTION",
      p_error_msg:   err instanceof Error ? err.message : String(err),
      p_duration_ms: ms,
      p_context:     {},
    }).catch(() => { /* intentionally silent */ });

    throw err;
  }
}

// ── Global uncaught error handler ─────────────────────────────────────────────
// Called once from main.tsx. Captures unhandled promise rejections and JS errors
// that escape all React error boundaries.

let _installed = false;

export function installGlobalErrorHandlers(): void {
  if (_installed || typeof window === "undefined") return;
  _installed = true;

  window.addEventListener("unhandledrejection", (event) => {
    captureException(event.reason, { component: "unhandledrejection" });
  });

  window.onerror = (message, _source, _line, _col, error) => {
    captureException(error ?? new Error(String(message)), { component: "window.onerror" });
    return false; // let browser default handling continue
  };
}

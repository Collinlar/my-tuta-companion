import type { CSSProperties } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/** Shared responsive layout tokens for mytuta screens (inline-style era). */
export function useLayout() {
  const mobile = useIsMobile();
  return {
    mobile,
    /** Standard page padding. Extra bottom space on mobile for the bottom nav. */
    pad: mobile ? "20px 16px 96px" : "34px 40px 72px",
    padTall: mobile ? "28px 16px 96px" : "44px 40px 72px",
    padCompact: mobile ? "16px 16px 96px" : "34px 40px 72px",
    sectionX: mobile ? 16 : 32,
    heroTitle: mobile ? 34 : 52,
    g2: mobile ? "1fr" : "1fr 1fr",
    g3: mobile ? "1fr" : "repeat(3, 1fr)",
    g4: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
    gStats: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
    gSide: mobile ? "1fr" : "1.15fr .85fr",
    gAuth: mobile ? "1fr" : "1fr 1fr",
    gHero: mobile ? "1fr" : "1.05fr .95fr",
    max: (desktop: number) => (mobile ? "100%" as const : desktop),
  };
}

/** Static page shell style — pass pad from useLayout(). */
export function pageBox(pad: string, maxWidth: number | string = 820): CSSProperties {
  return {
    maxWidth,
    width: "100%",
    margin: "0 auto",
    padding: pad,
    animation: "fadeup .3s ease",
    boxSizing: "border-box",
  };
}

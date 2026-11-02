/** A spoken fallback for simple inline mathematics. */
export function explanationTranscript(text: string): string {
  return text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 divided by $2")
    .replace(/\\rho\b/g, "density").replace(/\\times\b/g, "times")
    .replace(/\^2\b/g, " squared ").replace(/\^3\b/g, " cubed ")
    .replace(/\\text\{([^}]+)\}/g, "$1").replace(/[$\\{}]/g, " ").replace(/\s+/g, " ").trim();
}

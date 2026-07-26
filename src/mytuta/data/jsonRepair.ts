// LLM JSON frequently contains raw LaTeX backslashes (\(, \frac, \$) and
// literal newlines/tabs inside string values — both illegal in JSON. Repair
// *inside strings only*: double any backslash that isn't a valid JSON escape,
// and escape stray control characters. Structural whitespace is left alone.
const BSL = String.fromCharCode(92); // a single backslash

export function sanitizeLlmJson(raw: string): string {
  let out = "";
  let inStr = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const code = ch.charCodeAt(0);
    if (!inStr) {
      out += ch;
      if (ch === '"') inStr = true;
      continue;
    }
    if (ch === BSL) {
      const next = raw[i + 1];
      const valid = !!next && ('"' + BSL + "/bfnrtu").indexOf(next) >= 0;
      if (valid) { out += ch + next; i++; } else { out += BSL + BSL; }
    } else if (ch === '"') {
      out += ch; inStr = false;
    } else if (code === 10) { out += BSL + "n"; }
    else if (code === 13) { out += BSL + "r"; }
    else if (code === 9) { out += BSL + "t"; }
    else if (code < 0x20) { out += " "; }
    else { out += ch; }
  }
  return out;
}

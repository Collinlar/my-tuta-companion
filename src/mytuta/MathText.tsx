import { useMemo, type CSSProperties } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function tryKatex(expr: string, displayMode: boolean): string {
  try {
    return katex.renderToString(expr.trim(), { throwOnError: false, displayMode, output: "html" });
  } catch {
    return escapeHtml(displayMode ? `$$${expr}$$` : `$${expr}$`);
  }
}

function renderInline(segment: string): string {
  const inlineRe = /\$([^$\n]+?)\$/g;
  let out = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = inlineRe.exec(segment))) {
    out += escapeHtml(segment.slice(lastIndex, match.index));
    out += tryKatex(match[1], false);
    lastIndex = match.index + match[0].length;
  }
  out += escapeHtml(segment.slice(lastIndex));
  return out;
}

/** Renders `$...$`/`$$...$$` delimited math via KaTeX; everything else is
 * HTML-escaped plain text. Never throws on bad AI output — unparseable
 * expressions fall back to their raw delimited text. */
// AI content sometimes uses TeX/MathJax delimiters (\( \), \[ \]) instead of
// the $-delimiters we ask for. Normalize them so KaTeX renders either way.
function normalizeDelimiters(input: string): string {
  return input
    .replace(/\\\[|\\\]/g, () => "$$")
    .replace(/\\\(|\\\)/g, () => "$");
}

function renderMathText(raw: string): string {
  if (!raw) return "";
  const input = normalizeDelimiters(raw);
  const blockRe = /\$\$([\s\S]+?)\$\$/g;
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(input))) {
    result += renderInline(input.slice(lastIndex, match.index));
    result += tryKatex(match[1], true);
    lastIndex = match.index + match[0].length;
  }
  result += renderInline(input.slice(lastIndex));
  return result;
}

/** Drop-in replacement for rendering an AI-generated string that may contain
 * inline `$x^2$` or block `$$...$$` math. Renders as an inline `<span>` so it
 * composes inside existing paragraph/div layouts unchanged. */
export function MathText({ text, style }: { text: string; style?: CSSProperties }) {
  const html = useMemo(() => renderMathText(text || ""), [text]);
  // eslint-disable-next-line react/no-danger
  return <span style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}

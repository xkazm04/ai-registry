/**
 * Pure text helpers for the social-card writer (og-image.mjs).
 *
 * These two functions carry the only logic in that tool that is neither a raster
 * operation nor an argument parse: how a title becomes lines, and how a caller's
 * string becomes safe inside the SVG the card is composed from. They lived inline in
 * og-image.mjs, which resolves `sharp` at module scope and exits when required
 * arguments are missing - so importing it to check either one runs the whole tool.
 * Split out, they are builtins-only, side-effect-free and directly testable
 * (tests/test_og-text.mjs).
 *
 * No imports on purpose: this module must stay loadable with nothing installed.
 */

/**
 * Greedy word wrap at `maxChars` characters per line.
 *
 * A word longer than `maxChars` gets a line to itself rather than being split or
 * dropped - a card renders a too-long word overflowing, which a designer can see,
 * where a silently truncated one looks correct and is wrong. Runs of whitespace
 * collapse, and empty input yields no lines at all (never one empty line, which
 * would push every following line down by a full leading).
 *
 * The empty words are filtered rather than assumed away: `" a b ".split(/\s+/)` opens
 * and closes with `""`, and a trailing one appended a space to the LAST line - a line
 * that is then one character over its own budget and prints with a hanging space. A
 * title pasted from anywhere carries that whitespace.
 */
export function wrapText(text, maxChars) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = (line ? line + ' ' : '') + w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Escape a string for use as SVG text content or an attribute value.
 *
 * `&` is replaced FIRST, so the ampersands this function introduces are not escaped
 * again - the reverse order turns `<` into `&amp;lt;` and prints the entity. A title
 * with an ampersand in it is the common case ("Design & Build"), and an unescaped one
 * makes the SVG unparseable, which sharp reports as a composite failure rather than as
 * bad input.
 */
export const svgEscape = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

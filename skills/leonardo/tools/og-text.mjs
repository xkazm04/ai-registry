/**
 * Pure helpers for the social-card writer (og-image.mjs): wrap, escape, and the SVG builder.
 *
 * These functions carry the only logic in that tool that is neither a raster
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

/**
 * Build the 1200x630-style card SVG from caller options - a pure function, so the
 * markup can be checked without `sharp`.
 *
 * Why it lives here: the template used to be a literal inside og-image.mjs and
 * interpolated `--bg/--ink/--accent/--font-display/--font-body` straight from argv.
 * Only the text content went through `svgEscape`, so a CSS font stack such as
 * `"Space Grotesk", sans-serif` closed `font-family="..."` early, the SVG was
 * malformed, and sharp reported a composite failure instead of bad input. Every
 * interpolated value is escaped here, attributes included; there is no unescaped
 * path left to forget.
 *
 * Returns `{ svg, titleLines, taglineLines }` - the lines are what og-image.mjs
 * reports back in its JSON.
 */
export function buildCardSvg(opts) {
  const {
    title, tagline = '', width = 1200, height = 630,
    bg = '#0a0a12', ink = '#f0f0f5', accent = '#06b6d4',
    fontDisplay = 'Fraunces, Georgia, serif',
    fontBody = 'Inter, system-ui, sans-serif',
    hasLogo = false,
  } = opts;
  const PAD = 80;
  const LOGO_SIZE = 120;
  const ACCENT_BAR_H = 6;
  const TITLE_SIZE = 96;
  const TITLE_LH = 104;
  const TAGLINE_SIZE = 34;
  const TAGLINE_LH = 44;

  // Title wraps at ~22 chars per line for the chosen size.
  const titleLines = wrapText(title, 22).slice(0, 2);
  const taglineLines = tagline ? wrapText(tagline, 56).slice(0, 2) : [];
  const titleStartY = hasLogo ? PAD + LOGO_SIZE + 70 : PAD + 60;
  const taglineStartY = titleStartY + titleLines.length * TITLE_LH + 36;

  const W = svgEscape(width), H = svgEscape(height);
  const eBg = svgEscape(bg), eInk = svgEscape(ink), eAccent = svgEscape(accent);
  const eDisplay = svgEscape(fontDisplay), eBody = svgEscape(fontBody);

  const svg = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${eBg}" stop-opacity="0"/>
      <stop offset="1" stop-color="${eBg}" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${eBg}"/>
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <!-- Accent bar -->
  <rect x="${PAD}" y="${height - PAD - ACCENT_BAR_H}" width="220" height="${ACCENT_BAR_H}" fill="${eAccent}"/>
  <!-- Title -->
  ${titleLines.map((l, i) => `<text x="${PAD}" y="${titleStartY + i * TITLE_LH}" font-family="${eDisplay}" font-size="${TITLE_SIZE}" font-weight="700" fill="${eInk}" letter-spacing="-2">${svgEscape(l)}</text>`).join('\n  ')}
  <!-- Tagline -->
  ${taglineLines.map((l, i) => `<text x="${PAD}" y="${taglineStartY + i * TAGLINE_LH}" font-family="${eBody}" font-size="${TAGLINE_SIZE}" font-weight="400" fill="${eInk}" opacity="0.75">${svgEscape(l)}</text>`).join('\n  ')}
</svg>`;
  return { svg, titleLines, taglineLines };
}

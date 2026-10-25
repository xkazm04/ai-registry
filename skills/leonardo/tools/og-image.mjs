#!/usr/bin/env node

/**
 * Generate a 1200x630 Open Graph social-share card.
 *
 * Composes: background color + optional bg illustration + brand logo (left) +
 * product title + tagline + thin accent rule. Pure node/sharp, no AI cost.
 *
 *   node og-image.mjs \
 *     --title "Ai Bookkeeper" \
 *     --tagline "Double-entry that adds up." \
 *     --bg "#f4e6c9" \
 *     --ink "#0e0f0c" \
 *     --accent "#0b6e4f" \
 *     --logo path/to/logo.png \
 *     --bg-illustration path/to/hero-bg.png   # optional, low-opacity wash
 *     --output path/out.png \
 *     [--font-display "Fraunces, Georgia, serif"]  # CSS font stack for the title
 *     [--font-body "Inter, system-ui, sans-serif"] # CSS font stack for the tagline
 *                                              # (rendered by sharp's SVG engine, so
 *                                              # only installed system fonts resolve;
 *                                              # quotes in a stack are escaped for you)
 *
 * Notes:
 *  - Width/height default to 1200x630 (the OG / Twitter standard).
 *  - All text is rasterized via SVG <text> with a serif/sans fallback chain.
 *  - The output is a PNG. Most social previews accept PNG; some prefer JPEG.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
// Pure and builtins-only, so they can be tested without resolving sharp - importing
// THIS file to check a wrap or an escape would run the whole tool. See tests/.
import { buildCardSvg } from './og-text.mjs';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) { args[key] = next; i++; }
      else { args[key] = true; }
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const required = ['title', 'output'];
for (const r of required) if (!args[r]) {
  console.error(`Missing --${r}. Usage: og-image.mjs --title "..." --output path.png [--tagline "..."] [--bg "#hex"] [--ink "#hex"] [--accent "#hex"] [--logo PATH] [--bg-illustration PATH] [--width 1200] [--height 630]`);
  process.exit(1);
}

const W       = parseInt(args.width  || '1200', 10);
const H       = parseInt(args.height || '630',  10);
const title   = args.title;
const tagline = args.tagline || '';
const bg      = args.bg     || '#0a0a12';
const ink     = args.ink    || '#f0f0f5';
const accent  = args.accent || '#06b6d4';
const fontDisplay = args['font-display'] || 'Fraunces, Georgia, serif';
const fontBody    = args['font-body']    || 'Inter, system-ui, sans-serif';
const logoPath = args.logo ? resolve(args.logo) : null;
const bgPath   = args['bg-illustration'] ? resolve(args['bg-illustration']) : null;
const outPath  = resolve(args.output);

// Resolve sharp from any node_modules tree.
let sharp;
const candidates = [
  resolve(process.cwd(), 'node_modules/sharp'),
  resolve(outPath, '../../../node_modules/sharp'),
  resolve(outPath, '../../../../node_modules/sharp'),
];
for (const c of candidates) {
  try { sharp = createRequire(c + '/').apply(null, [c]); break; } catch {}
}
if (!sharp) {
  try { sharp = (await import('sharp')).default; } catch {}
}
if (!sharp) {
  console.error(JSON.stringify({ error: 'sharp not found' }));
  process.exit(1);
}

const PAD = 80;
const LOGO_SIZE = 120;

// The card markup is built (and every interpolated value escaped) in og-text.mjs.
const { svg, titleLines, taglineLines } = buildCardSvg({
  title, tagline, width: W, height: H, bg, ink, accent, fontDisplay, fontBody,
  hasLogo: Boolean(logoPath),
});

let composer = sharp({
  create: { width: W, height: H, channels: 4, background: bg },
});

const layers = [];

// Background illustration (low-opacity wash, top-right region).
if (bgPath) {
  try {
    const bgIllustration = await sharp(bgPath)
      .resize({ width: Math.round(W * 0.55), height: H, fit: 'cover', position: 'right' })
      .composite([{
        input: Buffer.from(`<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="black" fill-opacity="0.78"/></svg>`),
        blend: 'dest-in',
      }])
      .png()
      .toBuffer();
    layers.push({ input: bgIllustration, left: Math.round(W * 0.45), top: 0, blend: 'over' });
  } catch (e) {
    process.stderr.write(`[og] bg illustration failed: ${e.message}\n`);
  }
}

// SVG text + accent layer.
layers.push({ input: Buffer.from(svg), left: 0, top: 0 });

// Logo top-left.
if (logoPath) {
  try {
    const logoBuf = await sharp(logoPath).resize(LOGO_SIZE, LOGO_SIZE, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } }).png().toBuffer();
    layers.push({ input: logoBuf, left: PAD, top: PAD });
  } catch (e) {
    process.stderr.write(`[og] logo composite failed: ${e.message}\n`);
  }
}

const result = await composer.composite(layers).png().toBuffer();
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, result);

console.log(JSON.stringify({
  success: true,
  output: outPath,
  dimensions: { width: W, height: H },
  titleLines,
  taglineLines,
  sizeBytes: result.length,
}, null, 2));

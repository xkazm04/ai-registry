// Pure half of capture-variants: argument parsing, file naming, blank detection.

export function parseArgs(argv) {
  const out = { widths: [1280, 390], settle: 1800, tabs: [] };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--url') { out.url = v; i++; }
    else if (k === '--section') { out.section = v; i++; }
    else if (k === '--tabs') { out.tabs = String(v || '').split(',').map((s) => s.trim()).filter(Boolean); i++; }
    else if (k === '--out') { out.out = v; i++; }
    else if (k === '--widths') { out.widths = String(v || '').split(',').map(Number).filter((n) => n > 0); i++; }
    else if (k === '--settle') { out.settle = Number(v); i++; }
    else return { error: `unknown argument: ${k}` };
  }
  if (!out.url) return { error: 'missing --url' };
  if (!out.section || !/^[a-z0-9-]+$/.test(out.section)) return { error: 'missing or invalid --section (kebab-case)' };
  if (out.tabs.length < 2) return { error: '--tabs needs at least two keys, current first' };
  if (!out.out) return { error: 'missing --out' };
  if (!out.widths.length) return { error: 'invalid --widths' };
  if (!(out.settle >= 0)) return { error: 'invalid --settle' };
  return out;
}

export function captureName(section, tab, width, motion) {
  return `${section}-${tab}-${width}-${motion === 'reduce' ? 'reduced' : 'motion'}.png`;
}

/**
 * A capture is BLANK when its downscaled luminance barely varies: a section stuck at
 * opacity 0, an empty frame, an unpainted canvas. `rgba` is a flat RGBA byte array.
 * Returns the luminance spread (max - min over the 2nd..98th percentile) and the verdict.
 */
export function blankScore(rgba, threshold = 12) {
  const lum = [];
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    lum.push(0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2]);
  }
  if (!lum.length) return { spread: 0, blank: true };
  lum.sort((a, b) => a - b);
  const at = (p) => lum[Math.min(lum.length - 1, Math.floor(p * (lum.length - 1)))];
  const spread = Math.round(at(0.98) - at(0.02));
  return { spread, blank: spread < threshold };
}

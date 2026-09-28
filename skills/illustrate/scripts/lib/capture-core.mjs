// Pure half of capture-variants: argument parsing, file naming, blank detection.

export function parseArgs(argv) {
  const out = { widths: [1280, 390], settle: 1800, tabs: [], limits: {}, balance: {}, hide: [] };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === '--url') { out.url = v; i++; }
    else if (k === '--section') { out.section = v; i++; }
    else if (k === '--tabs') { out.tabs = String(v || '').split(',').map((s) => s.trim()).filter(Boolean); i++; }
    else if (k === '--out') { out.out = v; i++; }
    else if (k === '--widths') { out.widths = String(v || '').split(',').map(Number).filter((n) => n > 0); i++; }
    else if (k === '--settle') { out.settle = Number(v); i++; }
    else if (k === '--hide') { out.hide = String(v || '').split(',').map((x) => x.trim()).filter(Boolean); i++; }
    else if (k === '--max-words') { out.limits.maxWords = Number(v); i++; }
    else if (k === '--max-run') { out.limits.maxRun = Number(v); i++; }
    else if (k === '--max-ratio') { out.limits.maxRatio = Number(v); i++; }
    else if (k === '--max-empty') { out.balance.maxEmpty = Number(v); i++; }
    else if (k === '--min-label') { out.balance.minLabelDesktop = Number(v); i++; }
    else if (k === '--min-section-words') { out.balance.minSectionWords = Number(v); i++; }
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

/**
 * Words label and key the picture; they do not narrate it. A variant's art is
 * TEXT-HEAVY when it holds more words than a label-and-key layer needs, when any
 * single run of text is a sentence rather than a label or a short caption, or when
 * text covers too much of the art.
 * History: 1.1 set 30 words / 6-word runs / 6% after round one's owner verdict (kept
 * variants held 92 and 131 words with 16-19 word runs). Round three under that budget
 * produced art the owner could not read at all - "huge illustrations representing very
 * little, cutting all text". 1.2 widens the ceiling to fit meaningful labels and a
 * short key, and adds the floor-side checks below (balanceVerdict).
 */
export const TEXT_LIMITS = { maxWords: 40, maxRun: 8, maxRatio: 0.1 };

export function textVerdict({ words, longestRun, textRatio }, limits = TEXT_LIMITS) {
  const reasons = [];
  if (words > limits.maxWords) reasons.push(`${words} words > ${limits.maxWords}`);
  if (longestRun > limits.maxRun) reasons.push(`a ${longestRun}-word run > ${limits.maxRun} (a sentence, not a label)`);
  if (textRatio > limits.maxRatio) reasons.push(`text covers ${Math.round(textRatio * 100)}% of the art > ${Math.round(limits.maxRatio * 100)}%`);
  return { heavy: reasons.length > 0, reasons };
}

/**
 * The floor side of the balance. A picture can fail by saying too little as surely as
 * by saying too much:
 * - SPARSE: most of the art is empty. The art was sized to the space available, not
 *   to what it shows. Measured as the share of empty cells in a downscaled capture of
 *   the art (see emptyRatio). Calibrated 2026-09-25 on the three illustrations the
 *   owner accepted (23-33% empty at 1280px across two runs); the rejected round's captures were not
 *   kept, so 45% is provisional - tighten it against the next rejected capture.
 * - TINY-LABELS: a label renders smaller than a reader can use. The accepted art sets
 *   labels at 14-19px (rendered font size) on desktop.
 * - TEXT-THIN: the whole section (heading, lede and art) holds too few words to state
 *   what the product does here. The owner's accepted sections hold 16-24.
 */
export const BALANCE_LIMITS = { maxEmpty: 0.45, minLabelDesktop: 12, minLabelPhone: 10, minSectionWords: 14 };

export function balanceVerdict({ empty, minLabelPx, sectionWords, width }, limits = BALANCE_LIMITS) {
  const reasons = [];
  if (typeof empty === 'number' && empty > limits.maxEmpty) {
    reasons.push(`SPARSE: ${Math.round(empty * 100)}% of the art is empty > ${Math.round(limits.maxEmpty * 100)}%`);
  }
  const floor = width >= 1024 ? limits.minLabelDesktop : limits.minLabelPhone;
  if (typeof minLabelPx === 'number' && minLabelPx < floor) {
    reasons.push(`TINY-LABELS: smallest label ${minLabelPx}px < ${floor}px`);
  }
  if (typeof sectionWords === 'number' && sectionWords < limits.minSectionWords) {
    reasons.push(`TEXT-THIN: ${sectionWords} words in the whole section < ${limits.minSectionWords}`);
  }
  return { failed: reasons.length > 0, reasons };
}

/**
 * Share of empty cells in a downscaled RGBA capture (`w` x `h`). A cell is empty when
 * its luminance barely varies - background, a flat panel, a blank frame. Anti-aliased
 * strokes and text make a cell non-empty, so thin line art counts as content.
 */
export function emptyRatio(rgba, w, h, cell = 8, threshold = 10) {
  let empty = 0;
  let total = 0;
  for (let cy = 0; cy + cell <= h; cy += cell) {
    for (let cx = 0; cx + cell <= w; cx += cell) {
      let min = 255;
      let max = 0;
      for (let y = cy; y < cy + cell; y++) {
        for (let x = cx; x < cx + cell; x++) {
          const i = (y * w + x) * 4;
          const l = 0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2];
          if (l < min) min = l;
          if (l > max) max = l;
        }
      }
      total++;
      if (max - min < threshold) empty++;
    }
  }
  return total ? empty / total : 1;
}

/** Words and longest run in one text node's content. Unit-tested: a regex slip here
 * silently miscounts every capture. */
export function countWords(text) {
  const t = String(text).trim();
  return t ? t.split(/\s+/).length : 0;
}

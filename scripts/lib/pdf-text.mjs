/**
 * pdf-text.mjs — extract readable text from a PDF buffer. Zero dependencies:
 * Node's zlib does the only decoding that is not string work.
 *
 * WHY THIS EXISTS. `fetch(...).text()` on a PDF returns the container's bytes
 * decoded as UTF-8. Nothing throws. An HTML-to-text pass finds no tags and
 * hands the bytes straight through, and a whitespace word count then reports a
 * five-figure number over compressed streams. The instrument says "13029 words"
 * and exits 0 for a document it did not read — the failure mode a research
 * instrument must never have (`failure-not-empty-success`). So: detect PDFs,
 * and either extract them or say plainly that we could not.
 *
 * WHAT IT DOES. Inflates every FlateDecode stream, then walks the content
 * streams for text-showing operators (Tj/TJ). The part that is not optional is
 * FONT AWARENESS: a display or bold face in a modern PDF is a subsetted font
 * whose codes are glyph indices, so a naive reader returns mojibake for exactly
 * the runs a document emphasises — headings, pull quotes, the numbers a vendor
 * report is mined for. Each /Tf is resolved to its font object's /ToUnicode
 * CMap and codes are mapped through it.
 *
 * WHAT IT DOES NOT DO. Objects inside /ObjStm compressed object streams are not
 * indexed, so a PDF that stores its page tree there yields no pages; the caller
 * gets a low/zero word count and must treat that as an instrument failure, not
 * as a thin source. There is no layout model: reading order follows content
 * order, and multi-column pages interleave. Encrypted PDFs are not handled.
 *
 * CORRUPT TEXT (`corruption` in the result). A font with no /ToUnicode table, or
 * a wrong one, maps every code: nothing is "unmapped", and the output is either
 * control bytes (deleted by the final cleanup, so the region silently vanishes)
 * or printable letters in the wrong places (passes any non-text-character
 * check). So the reader judges the DECODED text by letter statistics, BEFORE the
 * cleanup, per font on each page as well as page-wide and per font across the
 * document (extraction-yield-bands, "Corrupt is the band teams do not build"):
 * a high share of control/replacement/private-use glyphs, or a Latin vowel share
 * or common-letter share below any natural floor, condemns a segment. A segment is judged only above a
 * floor (MIN_GLYPHS, MIN_LETTERS, and for a font MIN_FONT_SHARE of its page), so
 * a stray acronym in an odd face does not flag a clean page. Text with too few
 * Latin letters to judge is `unknown`, never `clean`. The thresholds are this
 * reader's own, not a standard. Limit: the two shares catch a substitution that
 * moves frequent letters onto rare ones; one that happens to keep both at a
 * natural rate still reads clean (more likely in short runs and in languages near
 * the floors, such as Czech), so `clean` means "not condemned", not "proved".
 */
import zlib from 'node:zlib';

const MIN_GLYPHS = 20;      // non-space glyphs before a segment is judged at all
const MIN_LETTERS = 20;     // Latin letters before the vowel share is read
const MIN_FONT_SHARE = 0.05; // a font's share of its page's glyphs before it is judged alone
const BAD_SHARE = 0.3;      // control/replacement/private-use glyphs that condemn a segment
const VOWEL_FLOOR = 0.2;    // natural Latin-script prose sits at roughly 0.3-0.5
// e a i o n r s t carry 0.50-0.70 of the letters in English, German, French, Czech, Polish,
// Finnish prose, code and URLs (measured 2026-11-11). A substitution that lands common
// consonants on vowels (t->u, h->i, n->o) keeps a natural vowel share but loses this profile.
const COMMON = /^[eaionrstEAIONRST]/;
const COMMON_FLOOR = 0.35;
// Not glyphs: UTF-16 BOMs inside hex strings and marked-content language tags (same as the cleanup).
const NOISE = /þÿ|ÿþ|﻿|￾|en-US|敘ⵕ/g;
const MARKUP = /<\s*\/?\s*[A-Za-z][\w:.-]*\s*\/?\s*>/g;
const IDENT = /\p{Ll}\p{Lu}/u;
const ACRONYM = /^\p{Lu}{1,5}$/u;
const LANG_TAG = /^\s*[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})+\s*$/;
const BAD = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f�-]/u;
const LATIN = /\p{Script=Latin}/u;
const VOWEL = /^[aeiouAEIOU]/;

/** Letter statistics of one decoded segment, measured before any cleanup. */
export function judgeSegment(raw) {
  const clean = raw.replace(NOISE, '');
  const glyphs = [...clean].filter((c) => !/\s/.test(c));
  // Letter statistics read prose, not identifiers: a markup element name, a camelCase name or a
  // short all-caps acronym drops its vowels on purpose (`<Ccy>`, `CdtTrfTxInf`, `IBAN`), and a
  // page of them is not a broken map. They still count as glyphs, and control glyphs as bad.
  const prose = clean.replace(MARKUP, ' ').split(/\s+/)
    .filter((w) => !IDENT.test(w) && !ACRONYM.test(w.replace(/[^\p{L}]/gu, ''))).join(' ');
  let bad = 0, latin = 0, vowels = 0, common = 0;
  for (const c of glyphs) if (BAD.test(c)) bad++;
  for (const c of prose) {
    if (LATIN.test(c)) {
      latin++;
      const base = c.normalize('NFD');
      if (VOWEL.test(base)) vowels++;
      if (COMMON.test(base)) common++;
    }
  }
  const n = glyphs.length;
  const stats = {
    glyphs: n, letters: latin,
    vowelShare: latin ? +(vowels / latin).toFixed(3) : null,
    commonShare: latin ? +(common / latin).toFixed(3) : null,
    badShare: n ? +(bad / n).toFixed(3) : 0,
  };
  if (n < MIN_GLYPHS) return { verdict: 'small', ...stats };
  if (bad / n > BAD_SHARE) return { verdict: 'corrupt', reason: 'control-glyphs', ...stats };
  if (latin < MIN_LETTERS) return { verdict: 'unknown', ...stats };
  if (vowels / latin < VOWEL_FLOOR) return { verdict: 'corrupt', reason: 'vowel-share', ...stats };
  if (common / latin < COMMON_FLOOR) return { verdict: 'corrupt', reason: 'letter-profile', ...stats };
  return { verdict: 'clean', ...stats };
}

/** True when the buffer is a PDF, by magic bytes rather than by file extension. */
export function isPdf(buf) {
  return Buffer.isBuffer(buf) && buf.length > 4 && buf.subarray(0, 5).toString('latin1') === '%PDF-';
}

const ESC = { n: '\n', r: '\r', t: '\t', b: '', f: '' };

/**
 * @param {Buffer} raw
 * @returns {{ text: string, pages: number, objects: number, fonts: number, corruption: {
 *   verdict: 'clean'|'corrupt'|'unknown', share: number, unknownShare: number,
 *   corrupt: Array<{ scope: 'font'|'page'|'document-font', page: number|null, font: string|null,
 *     glyphs: number, letters: number, vowelShare: number|null, commonShare: number|null,
 *     badShare: number, reason: 'control-glyphs'|'vowel-share'|'letter-profile' }> } }}
 */
export function pdfToText(raw) {
  const s = raw.toString('latin1');

  // ---- index plain indirect objects (not those inside /ObjStm) -------------
  const objs = new Map();
  const objRe = /(?:^|[\r\n>\s])(\d+)\s+0\s+obj\b/g;
  let m;
  while ((m = objRe.exec(s))) {
    const start = objRe.lastIndex;
    const end = s.indexOf('endobj', start);
    if (end !== -1) objs.set(+m[1], { start, end });
  }

  const objText = (n) => {
    const o = objs.get(n);
    return o ? s.slice(o.start, o.end) : '';
  };

  const objStream = (n) => {
    const o = objs.get(n);
    if (!o) return null;
    const body = s.slice(o.start, o.end);
    const si = body.indexOf('stream');
    if (si === -1) return null;
    let d = o.start + si + 6;
    if (raw[d] === 0x0d) d++;
    if (raw[d] === 0x0a) d++;
    const e = s.indexOf('endstream', d);
    if (e === -1) return null;
    const chunk = raw.subarray(d, e);
    try { return zlib.inflateSync(chunk); } catch { /* not zlib-wrapped */ }
    try { return zlib.inflateRawSync(chunk); } catch { /* not raw deflate */ }
    return /\/FlateDecode/.test(body) ? null : chunk;
  };

  // ---- ToUnicode CMaps ----------------------------------------------------
  const hexToStr = (h) => {
    let out = '';
    for (let k = 0; k + 4 <= h.length; k += 4) out += String.fromCharCode(parseInt(h.slice(k, k + 4), 16));
    return out.replace(/￿/g, '');
  };

  const parseCMap = (buf) => {
    const t = buf.toString('latin1');
    const map = new Map();
    for (const blk of t.match(/beginbfchar([\s\S]*?)endbfchar/g) || []) {
      for (const p of blk.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) map.set(parseInt(p[1], 16), hexToStr(p[2]));
    }
    // A bfrange destination has two forms (PDF 32000 9.10.3): one string whose LAST unit
    // increments across the range - which may be several units long, a ligature like <00660066>,
    // so parsing it as one integer truncates it to its final char - or an array holding one
    // string per code. Reading only the first form, as one integer, dropped every array range
    // and turned every multi-unit range into its last letter.
    for (const blk of t.match(/beginbfrange([\s\S]*?)endbfrange/g) || []) {
      for (const p of blk.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(?:<([0-9A-Fa-f]+)>|\[([^\]]*)\])/g)) {
        const lo = parseInt(p[1], 16), hi = parseInt(p[2], 16);
        if (p[4] !== undefined) {
          const dsts = [...p[4].matchAll(/<([0-9A-Fa-f]*)>/g)].map((d) => hexToStr(d[1]));
          for (let c = lo; c <= hi && c - lo < dsts.length; c++) map.set(c, dsts[c - lo]);
          continue;
        }
        const head = hexToStr(p[3].slice(0, -4));
        const last = parseInt(p[3].slice(-4), 16);
        for (let c = lo; c <= hi && c - lo < 65536; c++) map.set(c, head + String.fromCharCode(last + (c - lo)));
      }
    }
    return map;
  };

  const fontCache = new Map();
  const fontInfo = (num) => {
    if (fontCache.has(num)) return fontCache.get(num);
    const ft = objText(num);
    let map = null;
    const tu = ft.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
    if (tu) {
      const b = objStream(+tu[1]);
      if (b) map = parseCMap(b);
    }
    const info = {
      map,
      twoByte: /\/Subtype\s*\/Type0|\/Encoding\s*\/Identity-H/.test(ft),
      base: (ft.match(/\/BaseFont\s*\/([^\s/<>[\]()]+)/) || [])[1] ?? null,
    };
    fontCache.set(num, info);
    return info;
  };

  // ---- pages --------------------------------------------------------------
  // A page's fonts live in its resource dictionary, and that dictionary reaches the page in
  // one of three shapes: inline, as an indirect object (`/Resources 12 0 R`, what pdfTeX and
  // many other producers write), or inherited from an ancestor /Pages node when the page
  // declares none. The /Font entry inside it can itself be indirect. Reading only the inline
  // shape left every other page with no fonts, so no /ToUnicode map was ever applied and a
  // subset font's codes came out as control bytes - stripped below, i.e. the words vanished.
  const resourcesOf = (pageText) => {
    let t = pageText;
    for (let depth = 0; depth < 32; depth++) {
      const ref = t.match(/\/Resources\s+(\d+)\s+0\s+R/);
      if (ref) return objText(+ref[1]);
      const at = t.indexOf('/Resources');
      if (at !== -1) return t.slice(at);
      const parent = t.match(/\/Parent\s+(\d+)\s+0\s+R/);
      if (!parent) return '';
      t = objText(+parent[1]);
    }
    return '';
  };
  const fontDictOf = (res) => {
    const ref = res.match(/\/Font\s+(\d+)\s+0\s+R/);
    if (ref) return objText(+ref[1]);
    const inline = res.match(/\/Font\s*<<([^>]*)>>/);
    return inline ? inline[1] : '';
  };

  const pages = [];
  for (const [num] of objs) {
    const t = objText(num);
    if (!/\/Type\s*\/Page(?![a-zA-Z])/.test(t)) continue;
    const fonts = new Map();
    for (const f of fontDictOf(resourcesOf(t)).matchAll(/\/([A-Za-z0-9_]+)\s+(\d+)\s+0\s+R/g)) fonts.set(f[1], +f[2]);
    const contents = [];
    const c1 = t.match(/\/Contents\s+(\d+)\s+0\s+R/);
    const c2 = t.match(/\/Contents\s*\[([^\]]*)\]/);
    if (c1) contents.push(+c1[1]);
    else if (c2) for (const r of c2[1].matchAll(/(\d+)\s+0\s+R/g)) contents.push(+r[1]);
    if (contents.length) pages.push({ fonts, contents });
  }

  // ---- content streams ----------------------------------------------------
  const decodeLiteral = (str) => str
    .replace(/\\([0-7]{1,3})/g, (x, o) => String.fromCharCode(parseInt(o, 8)))
    .replace(/\\([\s\S])/g, (x, c) => (c in ESC ? ESC[c] : c));

  const mapCodes = (codes, info) => {
    if (!info || !info.map) return codes.map((c) => String.fromCharCode(c)).join('');
    let out = '';
    for (const c of codes) out += info.map.has(c) ? info.map.get(c) : String.fromCharCode(c);
    return out;
  };

  const litCodes = (str, info) => {
    const dec = decodeLiteral(str);
    const codes = [];
    if (info && info.twoByte) for (let k = 0; k + 1 < dec.length; k += 2) codes.push((dec.charCodeAt(k) << 8) | dec.charCodeAt(k + 1));
    else for (let k = 0; k < dec.length; k++) codes.push(dec.charCodeAt(k));
    return codes;
  };

  const hexCodes = (h, info) => {
    const clean = h.replace(/[^0-9A-Fa-f]/g, '');
    const step = info && info.twoByte ? 4 : 2;
    const codes = [];
    for (let k = 0; k + step <= clean.length; k += step) codes.push(parseInt(clean.slice(k, k + step), 16));
    return codes;
  };

  // Every operator that ends a line has to be a token here, or the next line's first word is
  // glued to this line's last one and the word count silently drops. `T*` cannot be written
  // `\bT\*\b`: `*` is not a word character, so a trailing \b never matches before a space.
  // The `'` and `"` operators move to the next line BEFORE showing their string, so they are
  // captured as a suffix of the string token (groups 2-3) rather than as tokens of their own.
  // `Tm` sets the text matrix outright: a new baseline (its last operand, f) is a new line,
  // the same baseline is a new word.
  const TOK = /\/([A-Za-z0-9_]+)\s+[\d.]+\s+Tf|\((?:\\[\s\S]|[^\\()])*\)(?:\s*(['"]))?|<[0-9A-Fa-f\s]*>(?:\s*(['"]))?|-?[\d.]+|\bT[Dd]\b|\bT\*|\bTm\b|\bET\b/g;

  const out = [];
  // Raw decoded text per page, per font, before the cleanup below can delete the evidence.
  // A font resolved to an object is one identity across pages; an unresolved name is not.
  const segments = [];
  const docFonts = new Map();
  for (const [pageIdx, page] of pages.entries()) {
    let buf = Buffer.alloc(0);
    for (const c of page.contents) {
      const b = objStream(c);
      if (b) buf = Buffer.concat([buf, b, Buffer.from('\n')]);
    }
    if (!buf.length) continue;
    const content = buf.toString('latin1');
    const pageNo = pageIdx + 1;
    const byFont = new Map();
    let fontKey = '(none)';
    let fontLabel = null;
    let info = null;
    let text = '';
    let tok;
    let lastNum = null;
    let lineY = null;
    let lastEnd = 0;
    let runNo = 0;
    const breakLine = () => { if (text && !/\n$/.test(text)) text += '\n'; };
    TOK.lastIndex = 0;
    while ((tok = TOK.exec(content))) {
      const t = tok[0];
      if (tok[1] !== undefined) {
        const num = page.fonts.get(tok[1]);
        info = num !== undefined ? fontInfo(num) : null;
        fontKey = num !== undefined ? `obj ${num}` : `page ${pageNo} /${tok[1]}`;
        fontLabel = `/${tok[1]}${info && info.base ? ` (${info.base})` : ''}`;
      }
      else if (t[0] === '(' || t[0] === '<') {
        if (tok[2] !== undefined || tok[3] !== undefined) breakLine();
        const body = t.slice(1, t.lastIndexOf(t[0] === '(' ? ')' : '>'));
        const run = mapCodes(t[0] === '(' ? litCodes(body, info) : hexCodes(body, info), info);
        // The segment keeps the whitespace the operators put between this font's runs, so a
        // kerned word stays one token; a run after another font's run starts a new token.
        const gap = text.slice(lastEnd);
        text += run;
        lastEnd = text.length;
        runNo++;
        // A whole run that is a language tag is a marked-content /Lang operand, not a glyph run
        // (`cs-CZ` repeated on every line drags a Czech page's vowel share under the floor).
        if (!LANG_TAG.test(run)) {
          const seg = byFont.get(fontKey) ?? { label: fontLabel, raw: '', lastRun: -1 };
          seg.raw += (seg.lastRun === runNo - 1 ? gap : ` ${gap}`) + run;
          seg.lastRun = runNo;
          byFont.set(fontKey, seg);
        }
      }
      // a large negative kern is an inter-word gap the operator does not spell
      else if (/^-?[\d.]+$/.test(t)) { lastNum = parseFloat(t); if (lastNum < -120 && !/\s$/.test(text)) text += ' '; }
      else if (t === 'Tm') {
        if (lineY !== null && lastNum !== lineY) breakLine();
        else if (text && !/\s$/.test(text)) text += ' ';
        lineY = lastNum;
      }
      else breakLine();
    }
    out.push(text);
    segments.push({ page: pageNo, raw: [...byFont.values()].map((f) => f.raw).join(' '), byFont });
    for (const [key, seg] of byFont) {
      const d = docFonts.get(key) ?? { label: seg.label, raw: '', pages: new Set() };
      d.raw += ` ${seg.raw}`;
      d.pages.add(pageNo);
      docFonts.set(key, d);
    }
  }

  const corruption = judgeCorruption(segments, docFonts);

  let text = out.join('\n\n');
  // PDF marked content leaks language tags into the stream; they are not words.
  text = text
    // U+FEFF/U+FFFE arrive as the two latin1 chars of a UTF-16 BOM inside hex strings
    .replace(/þÿ|ÿþ/g, '')
    .replace(/﻿|￾|�/g, '')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
    .replace(/en-US|敘ⵕ/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { text, pages: pages.length, objects: objs.size, fonts: fontCache.size, corruption };
}

/**
 * The corrupt band from raw per-page, per-font segments. Order: page-wide first (it covers
 * pages whose fonts are each too small to judge), then each font on its page above the floor,
 * then each font across the document (a face too thin on every page to judge alone).
 * `share` is the fraction of the document's glyphs in condemned fonts or pages; `unknownShare`
 * the fraction in segments with no letters to judge. The verdict is `clean` only when the
 * glyphs judged clean are the majority and nothing was condemned.
 */
function judgeCorruption(segments, docFonts) {
  const corrupt = [];
  const condemned = new Set();     // `${page}|${fontKey}` whose glyphs count toward `share`
  const condemnedPages = new Set();
  const glyphsOf = (raw) => [...raw.replace(NOISE, '')].filter((c) => !/\s/.test(c)).length;
  let total = 0, cleanGlyphs = 0, unknownGlyphs = 0;
  const entry = (scope, page, font, j) => ({
    scope, page, font, glyphs: j.glyphs, letters: j.letters,
    vowelShare: j.vowelShare, commonShare: j.commonShare, badShare: j.badShare, reason: j.reason,
  });

  for (const seg of segments) {
    const pageGlyphs = glyphsOf(seg.raw);
    total += pageGlyphs;
    const pj = judgeSegment(seg.raw);
    if (pj.verdict === 'corrupt') { corrupt.push(entry('page', seg.page, null, pj)); condemnedPages.add(seg.page); }
    for (const [key, f] of seg.byFont) {
      const j = judgeSegment(f.raw);
      const share = pageGlyphs ? j.glyphs / pageGlyphs : 0;
      if (j.verdict === 'corrupt' && share >= MIN_FONT_SHARE) {
        corrupt.push(entry('font', seg.page, f.label ?? key, j));
        condemned.add(`${seg.page}|${key}`);
      }
      // Below the floor a font borrows its page's verdict for the clean/unknown tally.
      const v = j.verdict === 'small' || (j.verdict === 'corrupt' && share < MIN_FONT_SHARE) ? pj.verdict : j.verdict;
      if (v === 'clean') cleanGlyphs += j.glyphs;
      else if (v === 'unknown' || v === 'small') unknownGlyphs += j.glyphs;
    }
  }
  for (const [key, d] of docFonts) {
    if ([...d.pages].every((p) => condemned.has(`${p}|${key}`) || condemnedPages.has(p))) continue;
    const j = judgeSegment(d.raw);
    if (j.verdict === 'corrupt' && total && j.glyphs / total >= MIN_FONT_SHARE) {
      corrupt.push(entry('document-font', null, d.label ?? key, j));
      for (const p of d.pages) condemned.add(`${p}|${key}`);
    }
  }

  let bad = 0;
  for (const seg of segments) {
    if (condemnedPages.has(seg.page)) { bad += glyphsOf(seg.raw); continue; }
    for (const [key, f] of seg.byFont) if (condemned.has(`${seg.page}|${key}`)) bad += glyphsOf(f.raw);
  }
  const verdict = corrupt.length ? 'corrupt' : total && cleanGlyphs / total > 0.5 ? 'clean' : 'unknown';
  return {
    verdict,
    share: total ? +(bad / total).toFixed(3) : 0,
    unknownShare: total ? +(unknownGlyphs / total).toFixed(3) : 0,
    corrupt,
  };
}

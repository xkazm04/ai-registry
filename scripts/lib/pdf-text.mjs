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
 */
import zlib from 'node:zlib';

/** True when the buffer is a PDF, by magic bytes rather than by file extension. */
export function isPdf(buf) {
  return Buffer.isBuffer(buf) && buf.length > 4 && buf.subarray(0, 5).toString('latin1') === '%PDF-';
}

const ESC = { n: '\n', r: '\r', t: '\t', b: '', f: '' };

/**
 * @param {Buffer} raw
 * @returns {{ text: string, pages: number, objects: number, fonts: number }}
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
    for (const blk of t.match(/beginbfrange([\s\S]*?)endbfrange/g) || []) {
      for (const p of blk.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
        const lo = parseInt(p[1], 16), hi = parseInt(p[2], 16), dst = parseInt(p[3], 16);
        for (let c = lo; c <= hi && c - lo < 65536; c++) map.set(c, String.fromCharCode(dst + (c - lo)));
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
    const info = { map, twoByte: /\/Subtype\s*\/Type0|\/Encoding\s*\/Identity-H/.test(ft) };
    fontCache.set(num, info);
    return info;
  };

  // ---- pages --------------------------------------------------------------
  const pages = [];
  for (const [num] of objs) {
    const t = objText(num);
    if (!/\/Type\s*\/Page(?![a-zA-Z])/.test(t)) continue;
    const fonts = new Map();
    const fd = t.match(/\/Font\s*<<([^>]*)>>/);
    if (fd) for (const f of fd[1].matchAll(/\/([A-Za-z0-9_]+)\s+(\d+)\s+0\s+R/g)) fonts.set(f[1], +f[2]);
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

  const TOK = /\/([A-Za-z0-9_]+)\s+[\d.]+\s+Tf|\((?:\\[\s\S]|[^\\()])*\)|<[0-9A-Fa-f\s]*>|-?[\d.]+|\bT[Dd*]\b|\bET\b/g;

  const out = [];
  for (const page of pages) {
    let buf = Buffer.alloc(0);
    for (const c of page.contents) {
      const b = objStream(c);
      if (b) buf = Buffer.concat([buf, b, Buffer.from('\n')]);
    }
    if (!buf.length) continue;
    const content = buf.toString('latin1');
    let info = null;
    let text = '';
    let tok;
    TOK.lastIndex = 0;
    while ((tok = TOK.exec(content))) {
      const t = tok[0];
      if (tok[1] !== undefined) info = page.fonts.has(tok[1]) ? fontInfo(page.fonts.get(tok[1])) : null;
      else if (t[0] === '(') text += mapCodes(litCodes(t.slice(1, -1), info), info);
      else if (t[0] === '<') text += mapCodes(hexCodes(t.slice(1, -1), info), info);
      // a large negative kern is an inter-word gap the operator does not spell
      else if (/^-?[\d.]+$/.test(t)) { if (parseFloat(t) < -120 && !/\s$/.test(text)) text += ' '; }
      else if (!/\n$/.test(text)) text += '\n';
    }
    out.push(text);
  }

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

  return { text, pages: pages.length, objects: objs.size, fonts: fontCache.size };
}

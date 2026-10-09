// A dependency-free markdown parser for the council report: CommonMark blocks and
// inlines plus the GFM pieces a report.md uses (tables, strikethrough, task items,
// literal autolinks), producing the mdast shape `markdown.mjs` emits from.
//
// Why not a package: this skill runs inside ANY consuming repo - Node or Python, with
// or without node_modules - so the instrument may import builtins only. Why mdast: the
// emitter was designed and approved over remark's tree, and keeping the node shapes
// (paragraph, heading, list/listItem with `spread`, table/tableRow/tableCell, strong,
// emphasis, delete, inlineCode, code, link, image, html, break) lets it stay unchanged.
//
// Scope, stated rather than implied: no reference-style links or definitions, no
// footnotes, no HTML entity table beyond the common names below. Anything the parser
// does not recognise stays TEXT, and every text node is escaped by the emitter - the
// failure mode of an unsupported construct is literal characters, never markup.

const ASCII_PUNCT = /[!-/:-@[-`{-~]/;
const PUNCT = /[\p{P}\p{S}]/u;
const WS = /\s/u;
const ATTENTION = ['*', '_', '~'];

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', reg: '®', trade: '™',
  mdash: '—', ndash: '–', hellip: '…', laquo: '«', raquo: '»', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  bull: '•', middot: '·', times: '×', divide: '÷', plusmn: '±', minus: '−', deg: '°', micro: 'µ', para: '¶',
  sect: '§', larr: '←', rarr: '→', uarr: '↑', darr: '↓', harr: '↔', rArr: '⇒', lArr: '⇐', hArr: '⇔',
  le: '≤', ge: '≥', ne: '≠', asymp: '≈', infin: '∞', check: '✓', cross: '✗', star: '☆', dagger: '†',
  euro: '€', pound: '£', yen: '¥', cent: '¢', shy: '­', zwj: '‍', zwnj: '‌', thinsp: ' ',
  ensp: ' ', emsp: ' ', frac12: '½', frac14: '¼', frac34: '¾', sup2: '²', sup3: '³', alpha: 'α',
  beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', lambda: 'λ', mu: 'μ', pi: 'π', sigma: 'σ', Sigma: 'Σ',
  omega: 'ω', Omega: 'Ω', prime: '′', Prime: '″', sum: '∑', radic: '√', part: '∂', isin: '∈', empty: '∅',
};

function decodeEntity(raw) {
  const body = raw.slice(1, -1);
  if (body[0] === '#') {
    const n = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
    if (!Number.isFinite(n)) return null;
    if (n === 0 || n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff)) return '�';
    return String.fromCodePoint(n);
  }
  return Object.prototype.hasOwnProperty.call(ENTITIES, body) ? ENTITIES[body] : null;
}

const ENTITY_RE = /^&(?:#[xX][0-9a-fA-F]{1,6}|#[0-9]{1,7}|[A-Za-z][A-Za-z0-9]{1,31});/;

/** Backslash escapes and entities resolved - for a link destination, title or code info. */
function unescapeString(s) {
  return s.replace(/\\([!-/:-@[-`{-~])|&(?:#[xX][0-9a-fA-F]{1,6}|#[0-9]{1,7}|[A-Za-z][A-Za-z0-9]{1,31});/g, (m, p) =>
    p !== undefined ? p : (decodeEntity(m) ?? m),
  );
}

/* ------------------------------------------------------------------- blocks */

/**
 * A lazy continuation line is carried with this prefix. It is what keeps a lazy line from
 * opening anything - a table, a setext underline, a list - when the container's content is
 * parsed again one level down, exactly as CommonMark forbids. It is stripped as paragraph text.
 */
const LAZY = '\u0001';
const isBlank = (l) => /^[ \t]*$/.test(l);
const indentOf = (l) => l.length - l.replace(/^ +/, '').length;
const stripIndent = (l, n) => {
  let k = 0;
  while (k < n && l[k] === ' ') k += 1;
  return l.slice(k);
};
/** Leading tabs become spaces on a four-column stop, so indentation can be counted. */
function expandTabs(line) {
  if (!line.includes('\t')) return line;
  const lead = /^[ \t]*/.exec(line)[0];
  let col = 0;
  for (const c of lead) col = c === '\t' ? col + 4 - (col % 4) : col + 1;
  return ' '.repeat(col) + line.slice(lead.length);
}

const ATX_RE = /^ {0,3}(#{1,6})(?=[ \t]|$)(.*)$/;
const HR_RE = /^ {0,3}(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})$/;
const FENCE_RE = /^( {0,3})(`{3,}|~{3,})(.*)$/;
const QUOTE_RE = /^ {0,3}> ?/;
const SETEXT_RE = /^ {0,3}(=+|-+)[ \t]*$/;
const BLOCK_TAGS = new Set(
  ('address article aside base basefont blockquote body caption center col colgroup dd details dialog dir div dl dt ' +
    'fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hr html iframe legend li link ' +
    'main menu menuitem nav noframes ol optgroup option p param search section summary table tbody td tfoot th thead ' +
    'title tr track ul').split(' '),
);
const ATTR = String.raw`(?:\s+[A-Za-z_:][\w.:-]*(?:\s*=\s*(?:[^\s"'=<>\x60]+|'[^']*'|"[^"]*"))?)`;
const OPEN_TAG = String.raw`<[A-Za-z][A-Za-z0-9-]*${ATTR}*\s*\/?>`;
const CLOSE_TAG = String.raw`<\/[A-Za-z][A-Za-z0-9-]*\s*>`;
const HTML7_RE = new RegExp(`^ {0,3}(?:${OPEN_TAG}|${CLOSE_TAG})[ \\t]*$`);

function fenceOpen(line) {
  const m = FENCE_RE.exec(line);
  if (!m) return null;
  if (m[2][0] === '`' && m[3].includes('`')) return null;
  return { indent: m[1].length, char: m[2][0], len: m[2].length, info: m[3].trim() };
}

/** Which kind of HTML block a line opens, or 0. Types 1-6 may interrupt a paragraph; 7 may not. */
function htmlStart(line) {
  const s = line.replace(/^ {0,3}/, '');
  if (s[0] !== '<' || indentOf(line) > 3) return 0;
  if (/^<(?:script|pre|style|textarea)(?:[\s>]|$)/i.test(s)) return 1;
  if (s.startsWith('<!--')) return 2;
  if (s.startsWith('<?')) return 3;
  if (/^<![A-Za-z]/.test(s)) return 4;
  if (s.startsWith('<![CDATA[')) return 5;
  const t = /^<\/?([A-Za-z][A-Za-z0-9-]*)(?:[\s>]|\/>|$)/.exec(s);
  if (t && BLOCK_TAGS.has(t[1].toLowerCase())) return 6;
  if (HTML7_RE.test(line)) return 7;
  return 0;
}
const HTML_END = {
  1: /<\/(?:script|pre|style|textarea)>/i,
  2: /-->/,
  3: /\?>/,
  4: />/,
  5: /\]\]>/,
};

/** A list marker on this line: `{ ordered, char, start, indent, contentIndent, rest }` or null. */
function listMarker(line) {
  const m = /^( {0,3})([-+*]|(\d{1,9})([.)]))(?=[ \t]|$)/.exec(line);
  if (!m) return null;
  const markerEnd = m[0].length;
  const after = line.slice(markerEnd);
  const spaces = /^ */.exec(after)[0].length;
  const blank = isBlank(after);
  const pad = blank ? 1 : spaces >= 5 ? 1 : spaces;
  return {
    ordered: !!m[3],
    char: m[3] ? m[4] : m[2],
    start: m[3] ? Number(m[3]) : null,
    indent: m[1].length,
    contentIndent: markerEnd + pad,
    rest: blank ? '' : after.slice(pad),
    blank,
  };
}

/** Split a GFM table row into raw cell strings (`\|` stays escaped here). */
function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells = [];
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && s[i + 1] === '|') {
      cur += '\\|';
      i += 1;
    } else if (s[i] === '|') {
      cells.push(cur);
      cur = '';
    } else cur += s[i];
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

function tableAt(lines, i) {
  const head = lines[i];
  const delim = lines[i + 1];
  if (head == null || delim == null || indentOf(head) > 3 || indentOf(delim) > 3) return null;
  if (head.startsWith(LAZY) || delim.startsWith(LAZY)) return null;
  if (!/^ {0,3}\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/.test(delim)) return null;
  if (!head.includes('|') && !delim.includes('|')) return null;
  const headCells = splitRow(head);
  const delimCells = splitRow(delim);
  if (headCells.length !== delimCells.length) return null;
  const align = delimCells.map((c) => {
    const l = c.startsWith(':');
    const r = c.endsWith(':');
    return l && r ? 'center' : l ? 'left' : r ? 'right' : null;
  });
  return { headCells, align };
}

const cellNode = (raw) => ({ type: 'tableCell', children: parseInline(raw.replace(/\\\|/g, '|')) });

/** True when the line would start a block that ends an open paragraph. */
function interruptsParagraph(line, lines, i) {
  if (ATX_RE.test(line) || HR_RE.test(line) || QUOTE_RE.test(line) || fenceOpen(line)) return true;
  const h = htmlStart(line);
  if (h >= 1 && h <= 6) return true;
  const lm = listMarker(line);
  if (lm && !lm.blank && (!lm.ordered || lm.start === 1)) return true;
  if (lines && tableAt(lines, i)) return true;
  return false;
}

/**
 * True when a line that failed its container's indentation starts a block of its own
 * at the outer level, so it cannot be a lazy continuation of the paragraph inside.
 */
const startsOuterBlock = (line) => interruptsParagraph(line) || !!listMarker(line) || htmlStart(line) === 7;

/** Paragraph text from its raw lines: the lazy mark and each line's leading whitespace dropped. */
const paraText = (lines) => lines.map((l) => l.replace(/^\u0001?[ \t]*/, '')).join('\n');

/**
 * Parse a container's gathered lines (a list item's or a blockquote's), where every line
 * that MIGHT be a lazy continuation was taken optimistically. A lazy line is legal only as
 * the continuation of an open paragraph; the first one that landed anywhere else (after a
 * heading, a table, inside a fence) is where the container really ended, so the lines are
 * cut there and parsed again. One parse in the common case, linear in the lines.
 * Returns the children and the index of the first line NOT taken (or null when all were).
 */
function parseContainer(buf) {
  let cut = null;
  for (;;) {
    const nodes = parseBlocks(buf);
    if (nodes.invalidAt === undefined) return { nodes, cut };
    cut = nodes.invalidAt;
    buf.length = cut;
  }
}

/**
 * Parse block lines into mdast children. Each child carries `_blankBefore` until the caller
 * strips it. When a lazy line lands anywhere but inside a paragraph, parsing stops and the
 * returned array carries `invalidAt`, that line's index - see `parseContainer`.
 */
function parseBlocks(lines) {
  const out = [];
  const invalid = (at) => {
    out.invalidAt = at;
    return out;
  };
  let para = null;
  let blankSeen = false;
  const push = (node) => {
    node._blankBefore = blankSeen;
    blankSeen = false;
    out.push(node);
  };
  const flush = () => {
    if (!para) return;
    const text = paraText(para.lines).replace(/[ \t]+$/, '');
    const node = { type: 'paragraph', children: parseInline(text) };
    node._blankBefore = para.blankBefore;
    out.push(node);
    para = null;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) {
      flush();
      blankSeen = true;
      i += 1;
      continue;
    }
    if (para) {
      const sx = SETEXT_RE.exec(line);
      if (sx) {
        const text = paraText(para.lines).trim();
        const node = { type: 'heading', depth: sx[1][0] === '=' ? 1 : 2, children: parseInline(text) };
        node._blankBefore = para.blankBefore;
        out.push(node);
        para = null;
        i += 1;
        continue;
      }
      if (indentOf(line) >= 4 || !interruptsParagraph(line, lines, i)) {
        para.lines.push(line);
        i += 1;
        continue;
      }
      flush();
    }

    if (indentOf(line) >= 4) {
      const buf = [];
      let j = i;
      while (j < lines.length && (isBlank(lines[j]) || indentOf(lines[j]) >= 4)) {
        buf.push(stripIndent(lines[j], 4));
        j += 1;
      }
      while (buf.length && isBlank(buf[buf.length - 1])) {
        buf.pop();
        j -= 1;
      }
      push({ type: 'code', lang: null, meta: null, value: buf.join('\n'), _indented: true });
      i = j;
      continue;
    }

    const fence = fenceOpen(line);
    if (fence) {
      const close = new RegExp(`^ {0,3}${fence.char === '`' ? '`' : '~'}{${fence.len},}[ \\t]*$`);
      const buf = [];
      let j = i + 1;
      while (j < lines.length && !close.test(lines[j])) {
        if (lines[j].startsWith(LAZY)) return invalid(j);
        buf.push(stripIndent(lines[j], fence.indent));
        j += 1;
      }
      const info = unescapeString(fence.info);
      const sp = info.search(/[ \t]/);
      push({
        type: 'code',
        lang: info ? (sp < 0 ? info : info.slice(0, sp)) : null,
        meta: sp < 0 ? null : info.slice(sp).trim() || null,
        value: buf.join('\n'),
      });
      i = j + 1;
      continue;
    }

    const atx = ATX_RE.exec(line);
    if (atx) {
      const text = atx[2].replace(/(?:^|[ \t]+)#+[ \t]*$/, '').trim();
      push({ type: 'heading', depth: atx[1].length, children: parseInline(text) });
      i += 1;
      continue;
    }

    if (HR_RE.test(line)) {
      push({ type: 'thematicBreak' });
      i += 1;
      continue;
    }

    if (QUOTE_RE.test(line)) {
      const buf = [];
      let j = i;
      while (j < lines.length) {
        const l = lines[j];
        const q = QUOTE_RE.exec(l);
        if (q) buf.push(l.slice(q[0].length));
        else if (!isBlank(l) && !isBlank(buf[buf.length - 1]) && !startsOuterBlock(l)) buf.push(l.startsWith(LAZY) ? l : LAZY + l);
        else break;
        j += 1;
      }
      const { nodes, cut } = parseContainer(buf);
      push({ type: 'blockquote', children: finish(nodes) });
      i = cut === null ? j : i + cut;
      continue;
    }

    const html = htmlStart(line);
    if (html) {
      const buf = [];
      let j = i;
      if (html <= 5) {
        while (j < lines.length) {
          if (lines[j].startsWith(LAZY)) return invalid(j);
          buf.push(lines[j]);
          j += 1;
          if (HTML_END[html].test(lines[j - 1])) break;
        }
      } else {
        while (j < lines.length && !isBlank(lines[j])) {
          if (lines[j].startsWith(LAZY)) return invalid(j);
          buf.push(lines[j]);
          j += 1;
        }
      }
      push({ type: 'html', value: buf.join('\n') });
      i = j;
      continue;
    }

    const table = tableAt(lines, i);
    if (table) {
      const rows = [{ type: 'tableRow', children: table.headCells.map(cellNode) }];
      let j = i + 2;
      // A row ends at a blank line, a lazy line, or any line that opens another block.
      while (
        j < lines.length &&
        !isBlank(lines[j]) &&
        !lines[j].startsWith(LAZY) &&
        !startsOuterBlock(lines[j]) &&
        indentOf(lines[j]) < 4
      ) {
        rows.push({ type: 'tableRow', children: splitRow(lines[j]).map(cellNode) });
        j += 1;
      }
      push({ type: 'table', align: table.align, children: rows });
      i = j;
      continue;
    }

    const lm = listMarker(line);
    // Straight after indented code a list starts only where it could interrupt a
    // paragraph (micromark's rule; the remark tree the emitter was approved on has it).
    const prev = out[out.length - 1];
    const afterIndentedCode = !blankSeen && prev?.type === 'code' && prev._indented;
    if (lm && !(afterIndentedCode && (lm.blank || (lm.ordered && lm.start !== 1)))) {
      const j = parseList(lines, i, lm, push);
      i = j;
      continue;
    }

    // A lazy line may continue a paragraph; it may never begin one.
    if (line.startsWith(LAZY)) return invalid(i);
    para = { lines: [line], blankBefore: blankSeen };
    blankSeen = false;
    i += 1;
  }
  flush();
  return out;
}

/** Whether a later marker continues the same list. */
const sameList = (a, b) => a.ordered === b.ordered && a.char === b.char;

function parseList(lines, i, first, push) {
  const items = [];
  let listSpread = false;
  let j = i;
  let marker = first;
  while (marker) {
    const buf = [marker.rest];
    let k = j + 1;
    // An item may begin with at most one blank line.
    if (marker.blank && k < lines.length && isBlank(lines[k])) {
      // empty item
    } else {
      while (k < lines.length) {
        const l = lines[k];
        if (isBlank(l)) {
          buf.push('');
          k += 1;
          continue;
        }
        if (indentOf(l) >= marker.contentIndent) {
          buf.push(stripIndent(l, marker.contentIndent));
          k += 1;
          continue;
        }
        // Possibly a lazy continuation of a paragraph still open in this item; taken
        // optimistically and checked by parseContainer.
        if (!isBlank(buf[buf.length - 1]) && !startsOuterBlock(l)) {
          buf.push(l.startsWith(LAZY) ? l : LAZY + l);
          k += 1;
          continue;
        }
        break;
      }
    }
    let trailing = 0;
    while (buf.length > 1 && isBlank(buf[buf.length - 1])) {
      buf.pop();
      trailing += 1;
    }
    const { nodes: children, cut } = parseContainer(buf);
    if (cut !== null) {
      k = j + cut; // buf[n] is line j + n: an item's lines are taken one per source line
      trailing = 0;
    }
    const spread = children.some((c, n) => n > 0 && c._blankBefore);
    let checked = null;
    const firstChild = children[0];
    if (firstChild && firstChild.type === 'paragraph' && firstChild.children[0]?.type === 'text') {
      const t = /^\[([ xX])\](?=[ \t])[ \t]*/.exec(firstChild.children[0].value);
      if (t && firstChild.children[0].value.length > t[0].length) {
        checked = t[1] !== ' ';
        firstChild.children[0].value = firstChild.children[0].value.slice(t[0].length);
      }
    }
    items.push({ type: 'listItem', spread, checked, children: finish(children) });
    // The next item of the same list, possibly after blank lines.
    const next = k < lines.length ? listMarker(lines[k]) : null;
    if (next && sameList(next, first) && !HR_RE.test(lines[k])) {
      if (trailing) listSpread = true;
      j = k;
      marker = next;
    } else {
      j = k - trailing;
      marker = null;
    }
  }
  push({
    type: 'list',
    ordered: first.ordered,
    start: first.ordered ? first.start : null,
    spread: listSpread,
    children: items,
  });
  return j;
}

function finish(nodes) {
  for (const n of nodes) {
    delete n._blankBefore;
    delete n._indented;
  }
  return nodes;
}

/* ------------------------------------------------------------------ inlines */

const classify = (c) => (c === undefined || c === '' || WS.test(c) ? 1 : PUNCT.test(c) ? 2 : 0);
/** Characters an extended autolink may follow (GFM, as micromark implements it). */
const AUTOLINK_PREV = (c) => c === undefined || WS.test(c) || '(*_[]~'.includes(c);
const TRAIL = '!"\'),.:;<?]_~*';

function trimUrl(s) {
  let out = s;
  for (;;) {
    const last = out[out.length - 1];
    const ent = /&[A-Za-z0-9]+;$/.exec(out);
    if (ent) {
      out = out.slice(0, ent.index);
      continue;
    }
    if (last === ')') {
      const open = (out.match(/\(/g) || []).length;
      const close = (out.match(/\)/g) || []).length;
      if (close > open) {
        out = out.slice(0, -1);
        continue;
      }
      break;
    }
    if (last && TRAIL.includes(last)) {
      out = out.slice(0, -1);
      continue;
    }
    break;
  }
  return out;
}

function literalAutolink(src, pos) {
  const rest = src.slice(pos);
  let m = /^(?:https?:\/\/)[A-Za-z0-9\u0080-￿_-][^\s<]*/i.exec(rest) || /^www\.[A-Za-z0-9\u0080-￿_-][^\s<]*/i.exec(rest);
  if (m) {
    const text = trimUrl(m[0]);
    const body = text.replace(/^(?:https?:\/\/)/i, '');
    const domain = body.split(/[/?#]/)[0];
    if (!domain || /_[^.]*\.[^.]*$|_[^.]*$/.test(domain.split(':')[0].split('.').slice(-2).join('.'))) return null;
    if (/^www\./i.test(text) && !/^www\.[^.]/i.test(text)) return null;
    const url = /^www\./i.test(text) ? `http://${text}` : text;
    return { len: text.length, node: { type: 'link', title: null, url, children: [{ type: 'text', value: text }] } };
  }
  m = /^[A-Za-z0-9.+_-]+@[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+/.exec(rest);
  if (m) {
    let text = m[0];
    while (/[._-]$/.test(text)) text = text.slice(0, -1);
    if (!/@.+\..+/.test(text) || !/[A-Za-z]$/.test(text)) return null;
    return { len: text.length, node: { type: 'link', title: null, url: `mailto:${text}`, children: [{ type: 'text', value: text }] } };
  }
  return null;
}

/** Parse `(dest "title")` right after a `]`. Returns `{ end, url, title }` or null. */
function inlineLinkTail(src, pos) {
  if (src[pos] !== '(') return null;
  let p = pos + 1;
  const skipWs = () => {
    while (p < src.length && /[ \t\n]/.test(src[p])) p += 1;
  };
  skipWs();
  let url = '';
  if (src[p] === '<') {
    const end = src.slice(p + 1).search(/[<>\n]/);
    if (end < 0 || src[p + 1 + end] !== '>') return null;
    url = src.slice(p + 1, p + 1 + end);
    p = p + 2 + end;
  } else {
    let depth = 0;
    const start = p;
    while (p < src.length) {
      const c = src[p];
      if (c === '\\' && ASCII_PUNCT.test(src[p + 1] ?? '')) {
        p += 2;
        continue;
      }
      if (/[\s\x00-\x1f]/.test(c)) break;
      if (c === '(') depth += 1;
      if (c === ')') {
        if (depth === 0) break;
        depth -= 1;
      }
      p += 1;
    }
    if (depth !== 0) return null;
    url = src.slice(start, p);
  }
  const beforeTitle = p;
  skipWs();
  let title = null;
  if (p > beforeTitle && (src[p] === '"' || src[p] === "'" || src[p] === '(')) {
    const close = src[p] === '(' ? ')' : src[p];
    let q = p + 1;
    while (q < src.length && src[q] !== close) q += src[q] === '\\' ? 2 : 1;
    if (q >= src.length) return null;
    title = unescapeString(src.slice(p + 1, q));
    p = q + 1;
    skipWs();
  }
  if (src[p] !== ')') return null;
  return { end: p + 1, url: unescapeString(url), title };
}

/** Plain text of an inline subtree, for an image's alt. */
const plain = (nodes) =>
  nodes.map((n) => (n.type === 'text' || n.type === 'inlineCode' ? n.value : n.alt ?? (n.children ? plain(n.children) : ''))).join('');

/** Parse inline markdown into mdast phrasing nodes. */
export function parseInline(src) {
  const items = [];
  const delims = [];
  const brackets = [];
  let pos = 0;
  let textBuf = '';

  const flushText = () => {
    if (textBuf) {
      items.push({ type: 'text', value: textBuf });
      textBuf = '';
    }
  };
  const pushNode = (node) => {
    flushText();
    items.push(node);
    return node;
  };

  while (pos < src.length) {
    const c = src[pos];

    if (c === '\\') {
      const n = src[pos + 1];
      if (n === '\n') {
        pushNode({ type: 'break' });
        pos += 2;
        while (src[pos] === ' ' || src[pos] === '\t') pos += 1;
        continue;
      }
      if (n !== undefined && ASCII_PUNCT.test(n)) {
        textBuf += n;
        pos += 2;
        continue;
      }
      textBuf += '\\';
      pos += 1;
      continue;
    }

    if (c === '`') {
      let n = 0;
      while (src[pos + n] === '`') n += 1;
      const run = '`'.repeat(n);
      let search = pos + n;
      let found = -1;
      while (search < src.length) {
        const at = src.indexOf(run, search);
        if (at < 0) break;
        let len = 0;
        while (src[at + len] === '`') len += 1;
        if (len === n) {
          found = at;
          break;
        }
        search = at + len;
      }
      if (found < 0) {
        textBuf += run;
        pos += n;
        continue;
      }
      let value = src.slice(pos + n, found).replace(/\n/g, ' ');
      if (/[^ ]/.test(value) && value.startsWith(' ') && value.endsWith(' ')) value = value.slice(1, -1);
      pushNode({ type: 'inlineCode', value });
      pos = found + n;
      continue;
    }

    if (c === '*' || c === '_' || c === '~') {
      let n = 0;
      while (src[pos + n] === c) n += 1;
      const before = classify(src[pos - 1]);
      const after = classify(src[pos + n]);
      if (c === '~' && n > 2) {
        textBuf += src.slice(pos, pos + n);
        pos += n;
        continue;
      }
      let canOpen;
      let canClose;
      if (c === '~') {
        canOpen = !after || (after === 2 && !!before);
        canClose = !before || (before === 2 && !!after);
      } else {
        const open = !after || (after === 2 && !!before) || ATTENTION.includes(src[pos + n]);
        const close = !before || (before === 2 && !!after) || ATTENTION.includes(src[pos - 1]);
        canOpen = c === '*' ? open : open && (!!before || !close);
        canClose = c === '*' ? close : close && (!!after || !open);
      }
      const node = pushNode({ type: 'text', value: src.slice(pos, pos + n) });
      delims.push({ node, char: c, count: n, orig: n, canOpen, canClose });
      pos += n;
      continue;
    }

    if (c === '[' || (c === '!' && src[pos + 1] === '[')) {
      const image = c === '!';
      const node = pushNode({ type: 'text', value: image ? '![' : '[' });
      brackets.push({ node, image, active: true, delimBottom: delims.length });
      pos += image ? 2 : 1;
      continue;
    }

    if (c === ']') {
      const opener = brackets.pop();
      if (!opener) {
        textBuf += ']';
        pos += 1;
        continue;
      }
      const tail = opener.active ? inlineLinkTail(src, pos + 1) : null;
      if (!tail) {
        textBuf += ']';
        pos += 1;
        continue;
      }
      flushText();
      processEmphasis(items, delims, opener.delimBottom);
      const at = items.indexOf(opener.node);
      const children = items.splice(at + 1);
      items.pop();
      if (opener.image) items.push({ type: 'image', title: tail.title, url: tail.url, alt: plain(children) });
      else {
        items.push({ type: 'link', title: tail.title, url: tail.url, children: merge(children) });
        for (const b of brackets) if (!b.image) b.active = false;
      }
      pos = tail.end;
      continue;
    }

    if (c === '<') {
      const rest = src.slice(pos);
      let m = /^<([A-Za-z][A-Za-z0-9+.-]{1,31}:[^\s<>]*)>/.exec(rest);
      if (m) {
        pushNode({ type: 'link', title: null, url: m[1], children: [{ type: 'text', value: m[1] }] });
        pos += m[0].length;
        continue;
      }
      m = /^<([A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*)>/.exec(rest);
      if (m) {
        pushNode({ type: 'link', title: null, url: `mailto:${m[1]}`, children: [{ type: 'text', value: m[1] }] });
        pos += m[0].length;
        continue;
      }
      m =
        new RegExp(`^(?:${OPEN_TAG}|${CLOSE_TAG})`).exec(rest) ||
        /^<!--(?:>|->|[\s\S]*?-->)/.exec(rest) ||
        /^<\?[\s\S]*?\?>/.exec(rest) ||
        /^<![A-Za-z][^>]*>/.exec(rest) ||
        /^<!\[CDATA\[[\s\S]*?\]\]>/.exec(rest);
      if (m) {
        pushNode({ type: 'html', value: m[0] });
        pos += m[0].length;
        continue;
      }
      textBuf += '<';
      pos += 1;
      continue;
    }

    if (c === '&') {
      const m = ENTITY_RE.exec(src.slice(pos));
      const decoded = m ? decodeEntity(m[0]) : null;
      if (decoded != null) {
        textBuf += decoded;
        pos += m[0].length;
        continue;
      }
      textBuf += '&';
      pos += 1;
      continue;
    }

    if (c === '\n') {
      const hard = / {2,}$/.test(textBuf);
      textBuf = textBuf.replace(/[ \t]+$/, '');
      if (hard) pushNode({ type: 'break' });
      else textBuf += '\n';
      pos += 1;
      while (src[pos] === ' ' || src[pos] === '\t') pos += 1;
      continue;
    }

    if (AUTOLINK_PREV(src[pos - 1]) && /[A-Za-z0-9.+_-]/.test(c)) {
      const lit = literalAutolink(src, pos);
      if (lit) {
        pushNode(lit.node);
        pos += lit.len;
        continue;
      }
    }

    textBuf += c;
    pos += 1;
  }
  flushText();
  processEmphasis(items, delims, 0);
  return merge(items);
}

/** CommonMark's "process emphasis", with GFM strikethrough (`~`, same-size runs) beside it. */
function processEmphasis(items, delims, bottom) {
  let ci = bottom;
  while (ci < delims.length) {
    const closer = delims[ci];
    if (!closer.canClose) {
      ci += 1;
      continue;
    }
    let found = -1;
    for (let oi = ci - 1; oi >= bottom; oi--) {
      const o = delims[oi];
      if (o.char !== closer.char || !o.canOpen) continue;
      if (closer.char === '~') {
        if (o.count === closer.count) {
          found = oi;
          break;
        }
        continue;
      }
      const odd = (o.canClose || closer.canOpen) && (o.orig + closer.orig) % 3 === 0 && !(o.orig % 3 === 0 && closer.orig % 3 === 0);
      if (!odd) {
        found = oi;
        break;
      }
    }
    if (found < 0) {
      if (!closer.canOpen) delims.splice(ci, 1);
      else ci += 1;
      continue;
    }
    const opener = delims[found];
    const use = closer.char === '~' ? closer.count : closer.count >= 2 && opener.count >= 2 ? 2 : 1;
    const type = closer.char === '~' ? 'delete' : use === 2 ? 'strong' : 'emphasis';
    opener.count -= use;
    closer.count -= use;
    opener.node.value = opener.node.value.slice(0, opener.count);
    closer.node.value = closer.node.value.slice(use);
    const a = items.indexOf(opener.node);
    const b = items.indexOf(closer.node);
    const inner = items.splice(a + 1, b - a - 1);
    items.splice(a + 1, 0, { type, children: merge(inner) });
    delims.splice(found + 1, ci - found - 1);
    ci = found + 1;
    if (opener.count === 0) {
      items.splice(items.indexOf(opener.node), 1);
      delims.splice(found, 1);
      ci -= 1;
    }
    if (closer.count === 0) {
      items.splice(items.indexOf(closer.node), 1);
      delims.splice(ci, 1);
    }
  }
  delims.length = bottom;
}

/** Adjacent text nodes joined and empty ones dropped, as remark's tree has them. */
function merge(nodes) {
  const out = [];
  for (const n of nodes) {
    if (n.type === 'text') {
      if (!n.value) continue;
      const last = out[out.length - 1];
      if (last && last.type === 'text') {
        out[out.length - 1] = { type: 'text', value: last.value + n.value };
        continue;
      }
      out.push({ type: 'text', value: n.value });
      continue;
    }
    out.push(n);
  }
  return out;
}

/** Parse a markdown document into an mdast root. */
export function parseMarkdown(md) {
  // U+0001 is the parser's own lazy-line mark, so a document may not carry one in.
  const src = String(md ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000\u0001]/g, '�');
  return { type: 'root', children: finish(parseBlocks(src.split('\n').map(expandTabs))) };
}

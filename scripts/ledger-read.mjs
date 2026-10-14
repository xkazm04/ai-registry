#!/usr/bin/env node
/**
 * ledger-read - an agent-facing read surface over the registry's shared markdown ledgers.
 *
 * Why this exists. The shared ledgers (librarian/applied.md, the intake SCORECARD.md and
 * LESSONS.md, librarian/sources/index.md, librarian/harvest/queue.md) are hundreds of
 * thousands of words, and single table rows run to thousands of words. Skills ask them
 * questions with grep, tail and sed, and one `tail` can hand a session several thousand
 * words it did not ask for. This script answers the same questions with a bounded reply:
 *
 *   1. SELECT before reading: by key and column (`--where`, `--since`, `--last`), and
 *      PROJECT only the columns asked for (`--fields`).
 *   2. BUDGET the reply in tokens (estimated as chars/4 of the output, stated in the
 *      output). The budget is enforced on the FINAL rendered string - the one printed -
 *      never on summed per-item estimates.
 *   3. PAGE with a stateless cursor bound to row identity: the next row's content hash
 *      (plus an ordinal among identical rows), a UTF-8 byte offset inside that row, the
 *      hash of the last row in the original selection, and a hash of the query. A row
 *      appended mid-walk does not shift pages; a changed or removed anchor row is REFUSED
 *      (exit 2), never silently skipped.
 *   4. SPLIT a single oversize row across pages at byte offsets, each partial field
 *      carrying its byte range and `truncated: true`, the row carrying `complete`.
 *   5. SAY what it left out: rows dropped by each filter, columns not selected, fields cut
 *      at the page edge, and whether there is more (`has_more`, `cursor`).
 *
 * Table model (the ledgers are not clean GFM, and this is the policy, stated once):
 *   - A table block is a run of lines starting with `|` (outside code fences). It is
 *     headered when its second line is a delimiter row (`| --- | --- |`).
 *   - Cells split on unescaped `|` (GFM; backticks do not protect a pipe). `\|` reads `|`.
 *   - A row with MORE cells than the header keeps the surplus inside its last column, as
 *     the raw text it was; a row with FEWER leaves the rest empty. Both are `ragged`.
 *   - A headerless block (rows appended under a paragraph, as the scorecard does) belongs
 *     to the WIDEST headered table above it (nearest on a tie).
 *   - `rows` reads the main table: every table whose header equals the widest header
 *     (ties: most rows), plus its headerless rows. `--table N` picks another (`schema`).
 *   - Every row carries `_line`, `_section` (its `## ` heading) and `_id`.
 *   - `sections` reads `## ` headings (outside fences) as rows {heading, body}; a section
 *     ends at the next `# ` or `## `. `prose --after-table` reads the paragraphs after the
 *     last table line.
 *
 * Usage:
 *   node scripts/ledger-read.mjs schema   <file>
 *   node scripts/ledger-read.mjs rows     <file> [--where col~regex|col=value|col!~regex|*~regex]...
 *                                         [--since YYYY-MM-DD] [--last N] [--fields a,b]
 *                                         [--table N] [--max-tokens N] [--cursor C] [--json]
 *   node scripts/ledger-read.mjs sections <file> [--match regex] [--since YYYY-MM-DD] [--last N]
 *                                         [--fields heading,body] [--max-tokens N] [--cursor C] [--json]
 *   node scripts/ledger-read.mjs prose    <file> --after-table [--last-paragraphs N]
 *                                         [--max-tokens N] [--cursor C] [--json]
 *
 * Exit codes (scripts/lib/exit-codes.mjs): 0 answered (an empty match is an answer);
 * 2 could not run - usage error, unknown column, budget too small, or a cursor refused
 * because its anchor row changed, vanished, or belongs to another query.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';

export const DEFAULT_MAX_TOKENS = 2000;
const MIN_SPLIT_BYTES = 256; // a page edge only starts a partial row when this much of it fits

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
export const estimateTokens = (s) => Math.ceil(s.length / 4);

class Fatal extends Error {}

// ---------------------------------------------------------------- parsing

const isFence = (l) => /^\s*(```|~~~)/.test(l);
const isDelimiter = (l) => /^\s*\|?[\s:|-]*-{3,}[\s:|-]*$/.test(l) && l.includes('|');

/** Split a table line into raw cell pieces on unescaped pipes (GFM). */
function splitRaw(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const pieces = [];
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && s[i + 1] === '|') { cur += '\\|'; i++; continue; }
    if (s[i] === '|') { pieces.push(cur); cur = ''; continue; }
    cur += s[i];
  }
  pieces.push(cur);
  return pieces;
}
const cell = (raw) => raw.trim().replace(/\\\|/g, '|');

/** Parse a markdown file into lines, tables, sections and the after-table prose. */
export function parseLedger(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const tables = [];
  const sections = [];
  let inFence = false;
  let section = '';
  let block = null; // current table block
  let lastTableLine = -1;
  let curSection = null;
  const closeSection = (endIdx) => {
    if (!curSection) return;
    const body = lines.slice(curSection.start + 1, endIdx).join('\n').replace(/^\n+/, '').replace(/\n+$/, '');
    sections.push({ line: curSection.start + 1, heading: curSection.heading, body });
    curSection = null;
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (isFence(l)) { inFence = !inFence; block = null; continue; }
    if (inFence) continue;
    if (/^#{1,2} /.test(l)) {
      closeSection(i);
      if (l.startsWith('## ')) { section = l.slice(3).trim(); curSection = { start: i, heading: l.slice(3).trim() }; }
      else section = '';
    }
    if (l.trimStart().startsWith('|')) {
      lastTableLine = i;
      if (!block) {
        const headered = i + 1 < lines.length && isDelimiter(lines[i + 1]);
        block = { line: i + 1, headered, columns: null, rows: [] };
        tables.push(block);
        if (headered) {
          block.columns = splitRaw(l).map(cell);
          i++; lastTableLine = i; // consume the delimiter row
          continue;
        }
      }
      if (isDelimiter(l)) continue; // a stray delimiter row inside a block is not a row
      block.rows.push({ line: i + 1, raw: l, section });
    } else {
      block = null;
    }
  }
  closeSection(lines.length);

  // Headerless blocks inherit the widest headered table above them (nearest on a tie).
  const headered = tables.filter((t) => t.headered);
  for (const t of tables) {
    if (t.headered) continue;
    let best = null;
    for (const h of headered) {
      if (h.line > t.line) break;
      if (!best || h.columns.length >= best.columns.length) best = h;
    }
    t.inherits = best;
  }

  // Prose after the last table line.
  const tail = lines.slice(lastTableLine + 1);
  const paragraphs = [];
  let para = null;
  tail.forEach((l, k) => {
    if (l.trim() === '') { para = null; return; }
    if (!para) { para = { line: lastTableLine + 2 + k, lines: [] }; paragraphs.push(para); }
    para.lines.push(l);
  });
  return {
    lines,
    tables,
    sections,
    paragraphs: lastTableLine < 0 ? [] : paragraphs.map((p) => ({ line: p.line, text: p.lines.join('\n') })),
  };
}

/** Group headered tables into header signatures; the main one is the widest (then most rows). */
export function tableGroups(parsed) {
  const groups = [];
  for (const t of parsed.tables) {
    const owner = t.headered ? t : t.inherits;
    if (!owner) continue;
    const sig = JSON.stringify(owner.columns);
    let g = groups.find((x) => x.sig === sig);
    if (!g) { g = { sig, columns: owner.columns, firstLine: owner.line, tables: [], rows: [] }; groups.push(g); }
    g.tables.push(t);
    g.rows.push(...t.rows);
  }
  groups.sort((a, b) => a.firstLine - b.firstLine);
  groups.forEach((g, i) => { g.index = i; g.rows.sort((a, b) => a.line - b.line); });
  const main = [...groups].sort((a, b) => b.columns.length - a.columns.length || b.rows.length - a.rows.length)[0] || null;
  const orphans = parsed.tables.filter((t) => !t.headered && !t.inherits).reduce((n, t) => n + t.rows.length, 0);
  return { groups, main, orphans };
}

/** Turn raw table rows into records with stable identities. */
function materializeRows(rows, columns) {
  const seen = new Map();
  return rows.map((r) => {
    const pieces = splitRaw(r.raw);
    const n = columns.length;
    let values;
    if (pieces.length > n) values = [...pieces.slice(0, n - 1).map(cell), cell(pieces.slice(n - 1).join('|'))];
    else values = columns.map((_, k) => (k < pieces.length ? cell(pieces[k]) : ''));
    const h = sha(r.raw).slice(0, 12);
    const ord = (seen.get(h) || 0) + 1;
    seen.set(h, ord);
    return {
      id: ord > 1 ? `${h}.${ord}` : h,
      line: r.line,
      section: r.section,
      ragged: pieces.length !== n,
      values: Object.fromEntries(columns.map((c, k) => [c, values[k]])),
    };
  });
}

function identify(items, keyOf) {
  const seen = new Map();
  for (const it of items) {
    const h = sha(keyOf(it)).slice(0, 12);
    const ord = (seen.get(h) || 0) + 1;
    seen.set(h, ord);
    it.id = ord > 1 ? `${h}.${ord}` : h;
  }
  return items;
}

// ---------------------------------------------------------------- arguments

function parseArgs(argv) {
  const a = { cmd: argv[0], file: argv[1], where: [], json: false };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const need = () => { if (i + 1 >= argv.length) throw new Fatal(`${k} needs a value`); return argv[++i]; };
    if (k === '--where') a.where.push(need());
    else if (k === '--since') a.since = need();
    else if (k === '--last') a.last = need();
    else if (k === '--fields') a.fields = need();
    else if (k === '--table') a.table = need();
    else if (k === '--max-tokens') a.maxTokens = need();
    else if (k === '--cursor') a.cursor = need();
    else if (k === '--match') a.match = need();
    else if (k === '--last-paragraphs') a.lastParagraphs = need();
    else if (k === '--after-table') a.afterTable = true;
    else if (k === '--json') a.json = true;
    else throw new Fatal(`unknown option ${k}`);
  }
  const posInt = (v, name) => {
    if (v === undefined) return undefined;
    if (!/^\d+$/.test(v) || Number(v) < 1) throw new Fatal(`${name} must be a positive integer`);
    return Number(v);
  };
  a.last = posInt(a.last, '--last');
  a.lastParagraphs = posInt(a.lastParagraphs, '--last-paragraphs');
  a.maxTokens = a.maxTokens === undefined ? DEFAULT_MAX_TOKENS : posInt(a.maxTokens, '--max-tokens');
  if (a.table !== undefined && !/^\d+$/.test(a.table)) throw new Fatal('--table must be an index from `schema`');
  if (a.since !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(a.since)) throw new Fatal('--since must be YYYY-MM-DD');
  return a;
}

function parseWhere(spec, columns) {
  const m = /^(.+?)(!~|~|=)(.*)$/s.exec(spec);
  if (!m) throw new Fatal(`--where "${spec}" must be col~regex, col!~regex, col=value or *~regex`);
  const [, name, op, rhs] = m;
  let col = null;
  if (name !== '*') {
    col = columns.find((c) => c.toLowerCase() === name.trim().toLowerCase());
    if (!col) throw new Fatal(`unknown column "${name}"; columns: ${columns.join(', ')}`);
  }
  let re = null;
  if (op !== '=') {
    try { re = new RegExp(rhs); } catch (e) { throw new Fatal(`--where regex: ${e.message}`); }
  }
  const test = (v) => (op === '=' ? v === rhs.trim() : re.test(v));
  return {
    label: `--where ${spec}`,
    keep: (rec) => {
      const vals = col ? [rec[col]] : Object.values(rec);
      const hit = vals.some((v) => test(v ?? ''));
      return op === '!~' ? !vals.some((v) => re.test(v ?? '')) : hit;
    },
  };
}

// ---------------------------------------------------------------- selection

/** Build the item list for a command, apply filters, report what each one dropped. */
function select(args, parsed) {
  let items;
  let columns;
  let unit;
  if (args.cmd === 'rows') {
    const { groups, main } = tableGroups(parsed);
    const g = args.table !== undefined ? groups[Number(args.table)] : main;
    if (!g) throw new Fatal(args.table !== undefined ? `no table ${args.table}; run schema` : 'no markdown table in this file');
    columns = g.columns;
    const recs = materializeRows(g.rows, columns);
    items = recs.map((r) => ({ id: r.id, line: r.line, ragged: r.ragged, rec: { ...r.values, _line: String(r.line), _section: r.section, _id: r.id } }));
    unit = 'rows';
  } else if (args.cmd === 'sections') {
    columns = ['heading', 'body'];
    items = identify(parsed.sections.map((s) => ({ line: s.line, rec: { heading: s.heading, body: s.body, _line: String(s.line) } })), (it) => `${it.rec.heading}\n${it.rec.body}`);
    items.forEach((it) => { it.rec._id = it.id; });
    unit = 'sections';
  } else if (args.cmd === 'prose') {
    if (!args.afterTable) throw new Fatal('prose needs --after-table');
    columns = ['text'];
    items = identify(parsed.paragraphs.map((p) => ({ line: p.line, rec: { text: p.text, _line: String(p.line) } })), (it) => it.rec.text);
    items.forEach((it) => { it.rec._id = it.id; });
    unit = 'paragraphs';
  } else {
    throw new Fatal(`unknown command ${args.cmd}`);
  }
  const allNames = [...columns, '_line', '_section', '_id'];
  const filters = [];
  if (args.cmd === 'rows') for (const w of args.where) filters.push(parseWhere(w, allNames));
  else if (args.where.length) throw new Fatal('--where applies to rows; sections take --match');
  if (args.match !== undefined) {
    if (args.cmd !== 'sections') throw new Fatal('--match applies to sections');
    let re; try { re = new RegExp(args.match); } catch (e) { throw new Fatal(`--match: ${e.message}`); }
    filters.push({ label: `--match ${args.match}`, keep: (rec) => re.test(rec.heading) });
  }
  if (args.since !== undefined) {
    if (args.cmd === 'prose') throw new Fatal('--since applies to rows and sections');
    const dateOf = args.cmd === 'rows'
      ? (() => { const c = columns.find((x) => /^date$/i.test(x)); if (!c) throw new Fatal('--since needs a Date column'); return (rec) => (/^(\d{4}-\d{2}-\d{2})/.exec(rec[c]) || [])[1]; })()
      : (rec) => (/(\d{4}-\d{2}-\d{2})/.exec(rec.heading) || [])[1];
    filters.push({ label: `--since ${args.since} (undated rows count here too)`, keep: (rec) => { const d = dateOf(rec); return !!d && d >= args.since; } });
  }
  const omitted = [];
  const total = items.length;
  for (const f of filters) {
    const before = items.length;
    items = items.filter((it) => f.keep(it.rec));
    if (before - items.length) omitted.push({ reason: f.label, count: before - items.length });
  }
  const matched = items.length;

  let fields = columns;
  if (args.fields) {
    fields = args.fields.split(',').map((x) => x.trim()).filter(Boolean).map((name) => {
      const hit = allNames.find((c) => c.toLowerCase() === name.toLowerCase());
      if (!hit) throw new Fatal(`unknown field "${name}"; fields: ${allNames.join(', ')}`);
      return hit;
    });
  }
  const notSelected = columns.filter((c) => !fields.includes(c));
  return { items, columns, fields, notSelected, omitted, total, matched, unit, filtersOnly: items };
}

// ---------------------------------------------------------------- paging

function queryHash(args) {
  return sha(JSON.stringify([args.cmd, args.file.replace(/\\/g, '/'), args.where, args.since, args.last, args.fields, args.table, args.match, args.afterTable, args.lastParagraphs])).slice(0, 10);
}
const encodeCursor = (c) => Buffer.from(JSON.stringify(c)).toString('base64url');
function decodeCursor(s) {
  try { const c = JSON.parse(Buffer.from(s, 'base64url').toString('utf8')); if (c.v !== 1) throw 0; return c; }
  catch { throw new Fatal('cursor is not a ledger-read cursor'); }
}

/** One item as byte-addressable fields. */
function bodyOf(item, fields) {
  let off = 0;
  const parts = fields.map((name) => {
    const buf = Buffer.from(item.rec[name] ?? '', 'utf8');
    const p = { name, buf, start: off, end: off + buf.length };
    off += buf.length;
    return p;
  });
  return { parts, total: off };
}

/** Snap a global byte cut back onto a UTF-8 character boundary. */
function snap(body, c) {
  const p = body.parts.find((x) => c > x.start && c < x.end);
  if (!p) return c;
  let k = c - p.start;
  while (k > 0 && (p.buf[k] & 0xc0) === 0x80) k--;
  return p.start + k;
}

/** The fields of one item restricted to the global byte window [s, e). */
function slice(item, body, s, e) {
  const out = [];
  for (const p of body.parts) {
    const empty = p.start === p.end;
    const inside = empty ? (p.start >= s && (p.start < e || (p.start === e && e === body.total))) : (p.end > s && p.start < e);
    if (!inside) continue;
    const a = Math.max(s, p.start);
    const b = Math.min(e, p.end);
    const whole = a === p.start && b === p.end;
    out.push({ name: p.name, text: p.buf.subarray(a - p.start, b - p.start).toString('utf8'), whole, from: a - p.start, to: b - p.start, of: p.buf.length });
  }
  return { id: item.id, line: item.line, ragged: !!item.ragged, complete: s === 0 && e === body.total, start: s, end: e, total: body.total, fields: out };
}

const MULTILINE = new Set(['body', 'text']);

function renderText(page, meta) {
  const out = [];
  out.push(`# ledger-read ${meta.cmd} ${meta.file}`);
  out.push(`matched: ${meta.matched} of ${meta.total} ${meta.unit}${meta.selected !== meta.matched ? ` | selected: ${meta.selected}` : ''} | shown: ${page.length}${meta.continued ? ' (continued from cursor)' : ''}`);
  for (const it of page) {
    const tags = [it.complete ? 'complete' : `partial bytes ${it.start}-${it.end} of ${it.total}`];
    if (it.ragged) tags.push('ragged');
    out.push(`-- ${meta.unit === 'rows' ? 'row' : meta.unit === 'sections' ? 'section' : 'paragraph'} ${it.id} line ${it.line} [${tags.join(', ')}]`);
    for (const f of it.fields) {
      const range = f.whole ? '' : ` [bytes ${f.from}-${f.to} of ${f.of}, truncated]`;
      const multi = MULTILINE.has(f.name) || f.text.includes('\n');
      if (multi) out.push(`${f.name}${range} (${Buffer.byteLength(f.text)} bytes):\n${f.text}`);
      else out.push(`${f.name}${range}: ${f.text}`);
    }
  }
  const om = meta.omitted.map((o) => `${o.count} ${o.reason}`);
  if (meta.notSelected.length) om.push(`columns not selected: ${meta.notSelected.join(', ')}`);
  out.push(`omitted: ${om.length ? om.join('; ') : 'nothing'}`);
  out.push(`has_more: ${meta.has_more}${meta.has_more ? ` | remaining: ${meta.remaining} ${meta.unit}` : ''}`);
  out.push(`cursor: ${meta.cursor || 'none'}`);
  out.push(`tokens_estimated: ${meta.tokens_estimated} (chars/4 of this output) | budget: ${meta.budget}`);
  return out.join('\n') + '\n';
}

function renderJson(page, meta) {
  const items = page.map((it) => {
    const fields = {};
    const truncated = [];
    for (const f of it.fields) {
      if (f.whole) fields[f.name] = f.text;
      else { fields[f.name] = { text: f.text, start: f.from, end: f.to, total: f.of, truncated: true }; truncated.push(f.name); }
    }
    const o = { id: it.id, line: it.line, complete: it.complete, truncated, fields };
    if (!it.complete) o.bytes = { start: it.start, end: it.end, total: it.total };
    if (it.ragged) o.ragged = true;
    return o;
  });
  const omitted = [...meta.omitted];
  if (meta.notSelected.length) omitted.push({ reason: 'columns not selected', columns: meta.notSelected });
  return JSON.stringify({
    tool: 'ledger-read', cmd: meta.cmd, file: meta.file, unit: meta.unit,
    total: meta.total, matched: meta.matched, selected: meta.selected, shown: page.length,
    continued: meta.continued, items, omitted, has_more: meta.has_more,
    remaining: meta.remaining, cursor: meta.cursor || null,
    tokens_estimated: meta.tokens_estimated, token_estimator: 'chars/4', budget: meta.budget,
  }) + '\n';
}

/** Render with a self-consistent tokens_estimated; returns the final string. */
function renderFinal(render, page, meta) {
  let est = 0;
  for (let k = 0; k < 6; k++) {
    const s = render(page, { ...meta, tokens_estimated: est });
    const e2 = estimateTokens(s);
    if (e2 === est) return s;
    est = e2;
  }
  return render(page, { ...meta, tokens_estimated: est });
}

/** Execute a parsed query against file text. Returns { output, data } or throws Fatal. */
export function runQuery(argv, text) {
  const args = parseArgs(argv);
  if (args.cmd === 'schema') return { output: schemaText(args, parseLedger(text)) };
  if (!args.file) throw new Fatal('usage: ledger-read <rows|sections|prose|schema> <file> ...');
  const parsed = parseLedger(text);
  const sel = select(args, parsed);
  const q = queryHash(args);
  const omitted = [...sel.omitted];

  // The walk: either the fresh selection (after --last), or anchor..end from a cursor.
  let walk;
  let startOffset = 0;
  let continued = false;
  if (args.cursor) {
    const c = decodeCursor(args.cursor);
    if (c.q !== q) throw new Fatal('cursor refused: it belongs to a different query (same command, file, filters and fields are required)');
    const ia = sel.filtersOnly.findIndex((it) => it.id === c.a);
    if (ia < 0) throw new Fatal(`cursor refused: anchor row ${c.a} changed or was removed since the first page; re-run the query without --cursor`);
    const ie = sel.filtersOnly.findIndex((it) => it.id === c.e);
    if (ie < 0 || ie < ia) throw new Fatal(`cursor refused: the selection's last row ${c.e} changed or was removed; re-run the query without --cursor`);
    walk = sel.filtersOnly.slice(ia, ie + 1);
    startOffset = c.o;
    continued = true;
    if (ia > 0) omitted.push({ reason: 'before the cursor (earlier pages)', count: ia });
    const tail = sel.filtersOnly.length - 1 - ie;
    if (tail > 0) omitted.push({ reason: 'matched after the walk began (outside this walk)', count: tail });
  } else {
    walk = sel.items;
    const lastN = args.cmd === 'prose' && args.lastParagraphs !== undefined ? args.lastParagraphs : args.last;
    const lastFlag = args.cmd === 'prose' && args.lastParagraphs !== undefined ? '--last-paragraphs' : '--last';
    if (lastN !== undefined && walk.length > lastN) {
      omitted.push({ reason: `before ${lastFlag} ${lastN}`, count: walk.length - lastN });
      walk = walk.slice(-lastN);
    }
  }
  const endId = walk.length ? walk[walk.length - 1].id : null;
  const render = args.json ? renderJson : renderText;
  const budget = args.maxTokens;
  const meta0 = { cmd: args.cmd, file: args.file.replace(/\\/g, '/'), unit: sel.unit, total: sel.total, matched: sel.matched, selected: continued ? walk.length : walk.length, continued, notSelected: sel.notSelected, budget };

  const bodies = walk.map((it) => bodyOf(it, sel.fields));
  const page = [];
  /** Page state after taking `page`, where `next` = {i, o} is where the walk resumes. */
  const metaFor = (next) => {
    const has_more = next.i < walk.length;
    const remaining = has_more ? walk.length - next.i : 0;
    const cursor = has_more ? encodeCursor({ v: 1, q, a: walk[next.i].id, o: next.o, e: endId }) : null;
    const om = [...omitted];
    if (has_more) om.push({ reason: `not shown or not finished: past the token budget (use the cursor)`, count: remaining });
    return { ...meta0, omitted: om, has_more, remaining, cursor };
  };
  const fits = (pg, next) => estimateTokens(renderFinal(render, pg, metaFor(next))) <= budget;

  if (!fits([], { i: 0, o: startOffset }) && !fits([], { i: walk.length, o: 0 })) {
    throw new Fatal(`budget too small: the reply envelope alone exceeds ${budget} tokens`);
  }
  let i = 0;
  let o = startOffset;
  while (i < walk.length) {
    const body = bodies[i];
    const whole = slice(walk[i], body, o, body.total);
    if (fits([...page, whole], { i: i + 1, o: 0 })) { page.push(whole); i++; o = 0; continue; }
    // The rest of this item does not fit: take the largest prefix that does.
    // Binary search over raw cuts; snap() is monotone, so fit(snap(c)) is monotone in c.
    let lo = o; let hi = body.total; // fit at lo is "no progress"; the whole rest (hi) does not fit
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      const c = snap(body, mid);
      if (c > o && fits([...page, slice(walk[i], body, o, c)], { i, o: c })) lo = mid; else hi = mid;
    }
    const cut = lo > o ? snap(body, lo) : o;
    const progress = cut - o;
    if (progress <= 0 || (page.length > 0 && progress < MIN_SPLIT_BYTES)) {
      if (page.length === 0) throw new Fatal(`budget too small: not one byte of the next ${sel.unit.replace(/s$/, '')} fits in ${budget} tokens`);
      break;
    }
    page.push(slice(walk[i], body, o, cut));
    o = cut;
    break;
  }
  const meta = metaFor({ i, o });
  const output = renderFinal(render, page, meta);
  const tokens = estimateTokens(output);
  if (tokens > budget) throw new Fatal(`internal: rendered ${tokens} tokens over a budget of ${budget}`);
  return { output, page, meta: { ...meta, tokens_estimated: tokens } };
}

function schemaText(args, parsed) {
  const { groups, main, orphans } = tableGroups(parsed);
  const out = [`# ledger-read schema ${args.file}`];
  for (const g of groups) {
    out.push(`table ${g.index}${g === main ? ' (main: rows reads this)' : ''}: ${g.rows.length} rows from line ${g.firstLine}; columns: ${g.columns.join(' | ')}`);
  }
  if (orphans) out.push(`headerless rows with no header above (unread): ${orphans}`);
  out.push(`sections (## headings): ${parsed.sections.length}`);
  out.push(`paragraphs after the last table: ${parsed.paragraphs.length}`);
  return out.join('\n') + '\n';
}

function main(argv) {
  try {
    if (!argv.length || argv[0] === '-h') {
      process.stdout.write('usage: node scripts/ledger-read.mjs <rows|sections|prose|schema> <file> [options]; see the header of this file\n');
      return EXIT.OK;
    }
    const file = argv[1];
    if (!file || !fs.existsSync(file)) throw new Fatal(`no such file: ${file}`);
    const { output } = runQuery(argv, fs.readFileSync(file, 'utf8'));
    process.stdout.write(output);
    return EXIT.OK;
  } catch (e) {
    if (e instanceof Fatal) { process.stderr.write(`ledger-read: ${e.message}\n`); return EXIT.FATAL; }
    throw e;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  process.exitCode = main(process.argv.slice(2));
}

#!/usr/bin/env node
/**
 * check-anchors — verify every `path:line "quote"` anchor in a report against a tree.
 *
 * WHY
 * Every worker brief in this registry says "re-open every line you cite", and every
 * director step says "open one cited line". Both are manual, and the second is a
 * sample. A quote bound to its address is checkable by a script, so the director can
 * check every anchor instead of one, and a worker's report stops being testimony.
 * The shape is borrowed from a delegated log reducer whose receipts are admitted only
 * when every quotation is a byte-exact substring of the archived source (intake
 * 2026-09-16); the corpus states the rule as summary-evidence-gate's quote-only form.
 *
 * ANCHOR GRAMMAR (anywhere in the report, one per match)
 *   path/to/file.ext:LINE                  unquoted  — existence only, counted apart
 *   path/to/file.ext:LINE-LINE             unquoted range
 *   path/to/file.ext:LINE "quote"          quoted    — the quote must occur inside the
 *   path/to/file.ext:LINE-LINE "quote"                 line range, whitespace-normalized
 * Backticks around the anchor are allowed. A path containing `://` is a URL and skipped.
 *
 * VERDICT PER ANCHOR (closed set)
 *   held           quote found inside the range
 *   unquoted       no quote — the file and line exist, and that is NOT evidence
 *   quote-moved    quote exists in the file but outside the range (drift; line reported)
 *   quote-absent   quote nowhere in the file (fabricated, paraphrased, or the tree moved)
 *   past-eof       line beyond the file's length
 *   missing-file   path does not resolve inside the root
 *   outside-root   canonical path escapes the root (a symlink out of the tree)
 *
 * ASSERTS ITSELF FIRST. Before reading the report it checks that a known-good and a
 * known-bad quote against its own source produce `held` and `quote-absent`; if not,
 * it exits FATAL rather than reporting a clean sheet from a broken instrument.
 *
 * EXIT  0 every quoted anchor held (unquoted anchors are reported, not failed)
 *       1 at least one anchor did not hold
 *       2 the instrument could not run (missing report or root, self-check failed)
 *
 * Usage: node scripts/check-anchors.mjs <report.md> --root <tree> [--json] [--strict]
 *   --strict  also fail on unquoted anchors (a report contract that requires quotes)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT } from './lib/exit-codes.mjs';

const ANCHOR_RE =
  /`?((?:[A-Za-z0-9_.\-]+[\\/])*[A-Za-z0-9_.\-]+\.[A-Za-z0-9]{1,8}):(\d{1,7})(?:-(\d{1,7}))?`?(?:[ \t]+"([^"\n]{1,600})")?/g;

const norm = (s) => s.replace(/\s+/g, ' ').trim();

export function parseAnchors(text) {
  const out = [];
  for (const m of text.matchAll(ANCHOR_RE)) {
    const [, file, l1, l2, quote] = m;
    // A URL's path segment looks like an anchor; look back to the token's start for `://`.
    const before = text.slice(0, m.index);
    const token = before.slice(before.search(/[^\s`(\[]*$/));
    if (file.includes('://') || token.includes('://')) continue;
    const start = Number(l1);
    const end = l2 ? Number(l2) : start;
    if (end < start || start < 1) continue;
    out.push({ file: file.replace(/\\/g, '/'), start, end, quote: quote ?? null, index: m.index });
  }
  return out;
}

export function checkAnchor(anchor, root) {
  const abs = path.resolve(root, anchor.file);
  let canonical;
  try {
    canonical = fs.realpathSync(abs);
  } catch {
    return { ...anchor, verdict: 'missing-file' };
  }
  const canonicalRoot = fs.realpathSync(root);
  if (!canonical.startsWith(canonicalRoot + path.sep) && canonical !== canonicalRoot) {
    return { ...anchor, verdict: 'outside-root' };
  }
  const lines = fs.readFileSync(canonical, 'utf8').split(/\r?\n/);
  if (anchor.start > lines.length) return { ...anchor, verdict: 'past-eof', fileLines: lines.length };
  if (anchor.quote === null) return { ...anchor, verdict: 'unquoted' };
  const q = norm(anchor.quote);
  const range = norm(lines.slice(anchor.start - 1, Math.min(anchor.end, lines.length)).join('\n'));
  if (range.includes(q)) return { ...anchor, verdict: 'held' };
  // Search the whole file to distinguish drift from absence: single lines first so the
  // reported line is exact, then a sliding window for quotes that span lines.
  for (let i = 0; i < lines.length; i += 1) {
    if (norm(lines[i]).includes(q)) return { ...anchor, verdict: 'quote-moved', foundAt: i + 1 };
  }
  const span = Math.max(1, anchor.end - anchor.start + 1) + 2;
  for (let i = 0; i < lines.length; i += 1) {
    if (norm(lines.slice(i, i + span).join('\n')).includes(q)) {
      return { ...anchor, verdict: 'quote-moved', foundAt: i + 1 };
    }
  }
  return { ...anchor, verdict: 'quote-absent' };
}

export function checkReport(reportText, root) {
  const anchors = parseAnchors(reportText);
  const results = anchors.map((a) => checkAnchor(a, root));
  const counts = {};
  for (const r of results) counts[r.verdict] = (counts[r.verdict] ?? 0) + 1;
  return { anchors: results, counts, total: results.length };
}

function selfCheck() {
  const self = fileURLToPath(import.meta.url);
  const root = path.dirname(self);
  const base = path.basename(self);
  const good = checkAnchor({ file: base, start: 1, end: 1, quote: '#!/usr/bin/env node' }, root);
  // Built by concatenation so the known-bad quote is not itself a literal in this file.
  const bad = checkAnchor({ file: base, start: 1, end: 1, quote: ['zz-not-in', 'the-instrument-zz'].join(' ') }, root);
  return good.verdict === 'held' && bad.verdict === 'quote-absent';
}

function main(argv) {
  const args = argv.slice(2);
  const json = args.includes('--json');
  const strict = args.includes('--strict');
  const rootIdx = args.indexOf('--root');
  const report = args.find((a, i) => !a.startsWith('--') && i !== rootIdx + 1);
  const root = rootIdx >= 0 ? args[rootIdx + 1] : null;
  if (!report || !root) {
    console.error('usage: check-anchors.mjs <report.md> --root <tree> [--json] [--strict]');
    return EXIT.FATAL;
  }
  if (!fs.existsSync(report) || !fs.existsSync(root)) {
    console.error(`check-anchors: report or root does not exist (${report}, ${root})`);
    return EXIT.FATAL;
  }
  if (!selfCheck()) {
    console.error('check-anchors: self-check failed; the instrument cannot tell held from absent');
    return EXIT.FATAL;
  }
  const result = checkReport(fs.readFileSync(report, 'utf8'), root);
  const failing = result.anchors.filter((a) => !['held', 'unquoted'].includes(a.verdict) || (strict && a.verdict === 'unquoted'));
  if (json) {
    console.log(JSON.stringify({ report, root, strict, ...result, failing: failing.length }, null, 2));
  } else {
    const c = result.counts;
    console.log(
      `anchors=${result.total} held=${c.held ?? 0} unquoted=${c.unquoted ?? 0} moved=${c['quote-moved'] ?? 0} ` +
        `absent=${c['quote-absent'] ?? 0} past-eof=${c['past-eof'] ?? 0} missing-file=${c['missing-file'] ?? 0} ` +
        `outside-root=${c['outside-root'] ?? 0}`,
    );
    for (const a of failing) {
      const where = a.foundAt ? ` (found at line ${a.foundAt})` : a.fileLines ? ` (file has ${a.fileLines} lines)` : '';
      console.log(`  ${a.verdict.padEnd(13)} ${a.file}:${a.start}${a.end !== a.start ? `-${a.end}` : ''}${where}` +
        (a.quote ? `  "${a.quote.slice(0, 60)}${a.quote.length > 60 ? '…' : ''}"` : ''));
    }
    if (result.total === 0) console.log('  (no anchors found — a report with no anchors is not a verified report)');
  }
  return failing.length ? EXIT.VIOLATIONS : EXIT.OK;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv));
}

#!/usr/bin/env node
/**
 * check-citation-dates — the free half of citation verification.
 *
 * A citation is a compound object: an identifier that ADDRESSES a document, and
 * attributes that describe its STANDING (venue, year, imprint). Those two halves
 * fabricate at very different rates, and almost every citation gate checks the
 * cheap half. Measured over a machine-generated research corpus: of the
 * resolvable identifiers, none were invented; of the venue-and-year attributes
 * attached to those same identifiers, well under half verified and a substantial
 * minority were fabricated outright. Identity was clean. Standing was not.
 *
 * The dominant fabrication is a real, resolving identifier wearing a plausible
 * prestigious venue and an EARLIER year than the document could possibly have.
 * Where an identifier encodes its own issuance date, that is not suspicious —
 * it is arithmetically impossible, and it needs no network call, no known set
 * and no authority to detect. This checker is that arithmetic, and nothing more.
 *
 * WHAT IT DOES NOT DO, stated so a green run is not over-read: it cannot catch a
 * fabricated attribute that stays CONSISTENT with the identifier's date. It
 * reports the impossible subset only. A clean run means "no citation contradicts
 * itself", never "the bibliography is verified".
 *
 * THE INSTRUMENT IS ASSERTED BEFORE THE RESULT: a root that cannot be read, or a
 * walked population of zero files, is FATAL (exit 2) — never a green zero. Run
 * `--self-test` to watch the detector go red on seeded fixtures before trusting
 * a clean report; a gate nobody has proved red is indistinguishable from a gate
 * that cannot fire. Zero dependencies on purpose.
 *
 * Exit codes:  0 pass · 1 impossible citation found · 2 could-not-run
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Conventions whose identifier encodes its own issuance date.
 * `decode` returns {year, month} or null when the identifier is out of scheme.
 */
const CONVENTIONS = [
  {
    name: 'arxiv-post-2007',
    // 0704.0001 onward: YYMM.NNNN (4 digits) or YYMM.NNNNN (5 digits since 1501)
    re: /(?:arxiv\.org\/(?:abs|pdf|html|format)\/|arXiv:)(\d{2})(\d{2})\.(\d{4,5})/gi,
    decode(m) {
      const yy = Number(m[1]);
      const mm = Number(m[2]);
      if (mm < 1 || mm > 12) return null;          // not a month → not this scheme
      const year = 2000 + yy;
      if (year < 2007 || year > 2099) return null; // scheme began 2007-04
      if (year === 2007 && mm < 4) return null;
      return { year, month: mm };
    },
  },
  {
    // Czech statute citations: `č. N/RRRR Sb.` — RRRR is the enactment year, so
    // the identifier carries its own date exactly the way a preprint id does.
    // OFF by default, and measured: over 761 legislative documents it flagged
    // 114 citations of which all but one were correct prose. A statute's nearby
    // years are PROCESS dates — submitted, read, signed — and a bill submitted
    // one year and enacted the next makes "earlier year, later identifier" the
    // normal case, not the impossible one. Kept as an opt-in because the class
    // is real here (a real-but-wrong statute number passes any membership gate),
    // but do not wire it to a verdict: at this precision it would cry wolf.
    name: 'cz-statute',
    optional: true,
    re: /č\.\s*(\d{1,4})\s*\/\s*(\d{4})\s*Sb\./g,
    decode(m) {
      const year = Number(m[2]);
      if (year < 1918 || year > 2099) return null;
      return { year, month: null };
    },
  },
];

const YEAR_RE = /\b(?:19|20)\d{2}\b/g;
const CONTEXT_CHARS = 160;

/**
 * Any identifier-shaped run, used ONLY as a context boundary. A reference list
 * packs many citations onto one line, so a plain proximity window attributes a
 * neighbour's year to this identifier: measured over two corpora, that heuristic
 * produced a ~100% false-positive rate, every hit an adjacent bibliography row.
 * A year counts as CLAIMED here only if no other citation stands between it and
 * this one — the year has to be bound to this reference, not merely near it.
 */
const ANY_CITATION_RE = /(?:arxiv\.org\/(?:abs|pdf|html|format)\/|arXiv:|doi\.org\/|doi:)\S+/gi;

function walk(root, out = []) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && /\.(md|mdx|json|txt)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

/**
 * Years bound to THIS citation: within the same line, inside the proximity
 * window, and with no other citation standing between the year and this one.
 */
function claimedYearsNear(text, start, end, neighbours) {
  const lineStart = text.lastIndexOf('\n', start) + 1;
  let lineEnd = text.indexOf('\n', end);
  if (lineEnd === -1) lineEnd = text.length;

  // Nearest other citation on either side becomes a hard boundary.
  let leftBound = lineStart;
  let rightBound = lineEnd;
  for (const n of neighbours) {
    if (n.end <= start && n.end > leftBound) leftBound = n.end;
    if (n.start >= end && n.start < rightBound) rightBound = n.start;
  }
  const from = Math.max(leftBound, start - CONTEXT_CHARS);
  const to = Math.min(rightBound, end + CONTEXT_CHARS);

  // Entry separators bound it further: a reference list packs entries onto one
  // line, and an entry's trailing parenthetical belongs to ITS identifier, not
  // to the next one along.
  const left = trimAtSeparator(text.slice(from, start), 'left');
  const right = trimAtSeparator(text.slice(end, to), 'right');

  const years = [];
  for (const chunk of [left, right]) {
    for (const m of chunk.matchAll(YEAR_RE)) years.push(Number(m[0]));
  }
  return years;
}

const SEPARATORS = ['·', ';', '|', ' - ', ' — ', ' – '];

/** Keep only the fragment on this side of the nearest citation-entry separator. */
function trimAtSeparator(chunk, side) {
  for (const sep of SEPARATORS) {
    if (side === 'left') {
      const i = chunk.lastIndexOf(sep);
      if (i !== -1) chunk = chunk.slice(i + sep.length);
    } else {
      const i = chunk.indexOf(sep);
      if (i !== -1) chunk = chunk.slice(0, i);
    }
  }
  return chunk;
}

function scanText(text, file, findings, census, conventions = CONVENTIONS.filter((c) => !c.optional)) {
  // The boundary set must know EVERY citation shape, not just the ones being
  // decoded: a neighbouring citation of another convention carries its own year,
  // and if it is not a boundary that year leaks onto this identifier. Measured:
  // omitting the statute shape here produced 1797 findings, ~all of them an
  // adjacent statute's own enactment year.
  const neighbours = [];
  for (const re of [ANY_CITATION_RE, ...CONVENTIONS.map((c) => c.re)]) {
    for (const m of text.matchAll(re)) {
      neighbours.push({ start: m.index, end: m.index + m[0].length });
    }
  }
  for (const conv of conventions) {
    for (const m of text.matchAll(conv.re)) {
      const decoded = conv.decode(m);
      if (!decoded) continue;
      census.identifiers++;
      const start = m.index;
      const end = start + m[0].length;
      const others = neighbours.filter((n) => n.end <= start || n.start >= end);
      const years = claimedYearsNear(text, start, end, others);
      if (!years.length) { census.noClaim++; continue; }
      census.withClaim++;
      const impossible = years.filter((y) => y < decoded.year);
      if (impossible.length) {
        const line = text.slice(0, start).split('\n').length;
        // One citation often appears twice on a line (bare form + link target).
        // Count the CITATION, not the match: dedupe on file, line and digits.
        const key = `${file}:${line}:${m[1]}${m[2]}.${m[3]}`;
        if (census.seen.has(key)) continue;
        census.seen.add(key);
        findings.push({
          file,
          line,
          identifier: m[0],
          identifierDate: decoded.month ? `${decoded.year}-${String(decoded.month).padStart(2, '0')}` : `${decoded.year}`,
          claimedYears: [...new Set(impossible)].sort(),
          context: text.slice(Math.max(0, start - 90), end + 70).replace(/\s+/g, ' ').trim(),
        });
      } else {
        census.consistent++;
      }
    }
  }
}

/* ---- seeded-failure self-test: prove it red before trusting a green ---- */
const FIXTURES = [
  { name: 'impossible-year-before-identifier', text: 'See CoolNet (NeurIPS 2024), https://arxiv.org/abs/2505.21577 for details.', expectRed: true },
  { name: 'impossible-bare-form', text: 'As shown in arXiv:2501.04227 (ICLR 2023).', expectRed: true },
  { name: 'legitimate-later-venue', text: 'https://arxiv.org/abs/2303.11366 appeared at a 2023 conference.', expectRed: false },
  { name: 'same-year-consistent', text: 'https://arxiv.org/pdf/2404.04251 (2024)', expectRed: false },
  { name: 'no-claimed-year', text: 'https://arxiv.org/abs/2510.17853 (a citation-checking paper)', expectRed: false },
  { name: 'out-of-scheme-ignored', text: 'https://arxiv.org/abs/2599.00001 (1999)', expectRed: false },
  // The false-positive class a plain proximity window produced on every corpus tried.
  { name: 'neighbour-year-does-not-leak', text: 'Sources: arXiv:2504.18333 (taxonomy) · Landis & Koch 1977 · Feinstein 1990', expectRed: false },
  { name: 'bibliography-row-neighbours', text: '- Ganguli et al. (2023). "Red Teaming" [arXiv:2209.07858] - Finin et al. (1994). "KQML" [doi:10.1/x]', expectRed: false },
  { name: 'impossible-survives-neighbour-bounding', text: 'CoolNet (NeurIPS 2024) arXiv:2505.21577 · Other 1999 [doi:10.2/y]', expectRed: true },
];

function selfTest() {
  let failed = 0;
  for (const f of FIXTURES) {
    const findings = [];
    const census = { identifiers: 0, withClaim: 0, consistent: 0, noClaim: 0, seen: new Set() };
    scanText(f.text, '<fixture>', findings, census);
    const red = findings.length > 0;
    const ok = red === f.expectRed;
    if (!ok) failed++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${f.name} — expected ${f.expectRed ? 'red' : 'green'}, got ${red ? 'red' : 'green'}`);
  }
  console.log(failed
    ? `\nself-test FAILED: ${failed}/${FIXTURES.length} fixture(s) — the detector does not do what it claims.`
    : `\nself-test passed: ${FIXTURES.length}/${FIXTURES.length}. The detector fires on seeded impossibilities and stays quiet otherwise.`);
  return failed ? 2 : 0;
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--self-test')) process.exit(selfTest());

  const asJson = argv.includes('--json');
  const convFlag = argv.indexOf('--convention');
  const conventions = convFlag !== -1 && argv[convFlag + 1]
    ? CONVENTIONS.filter((c) => c.name === argv[convFlag + 1])
    : CONVENTIONS.filter((c) => !c.optional);
  if (conventions.length === 0) {
    console.error(`check-citation-dates: FATAL — no convention named "${argv[convFlag + 1]}". Known: ${CONVENTIONS.map((c) => c.name).join(', ')}`);
    process.exit(2);
  }
  const pathFlag = argv.indexOf('--path');
  const root = pathFlag !== -1 && argv[pathFlag + 1] ? argv[pathFlag + 1] : 'knowledge';

  if (!fs.existsSync(root)) {
    console.error(`check-citation-dates: FATAL — root "${root}" does not exist. Cannot check.`);
    process.exit(2);
  }
  let files;
  try {
    files = walk(root);
  } catch (err) {
    console.error(`check-citation-dates: FATAL — cannot walk "${root}": ${err.message}`);
    process.exit(2);
  }
  if (files.length === 0) {
    console.error(`check-citation-dates: FATAL — walked 0 files under "${root}". A moved directory or a bad glob, never a clean corpus.`);
    process.exit(2);
  }

  const findings = [];
  const census = { files: files.length, identifiers: 0, withClaim: 0, consistent: 0, noClaim: 0, seen: new Set() };
  for (const file of files) {
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
    scanText(text, path.relative(process.cwd(), file), findings, census, conventions);
  }

  if (asJson) {
    const { seen, ...counts } = census;
    console.log(JSON.stringify({ census: counts, findings }, null, 2));
    process.exit(findings.length ? 1 : 0);
  }

  console.log(`check-citation-dates — ${census.files} file(s) under "${root}"`);
  console.log(`  ${census.identifiers} date-encoded identifier(s) · ${census.withClaim} carrying a nearby year · ${census.noClaim} bare`);
  if (census.identifiers === 0) {
    console.log('\n  No citations of a date-encoded convention were found. That is a fact about');
    console.log('  this corpus, not a verification result — nothing was checked.');
    process.exit(0);
  }
  for (const f of findings) {
    console.log(`\n  IMPOSSIBLE  ${f.file}:${f.line}`);
    console.log(`    identifier ${f.identifier} encodes ${f.identifierDate}`);
    console.log(`    but a year of ${f.claimedYears.join(', ')} is claimed beside it`);
    console.log(`    ${f.context}`);
  }
  console.log(findings.length
    ? `\n${findings.length} citation(s) contradict their own identifier's date.`
    : `\n${census.consistent} citation(s) with a claimed year, none contradicting its identifier.`);
  console.log('NOT checked here: an attribute that is wrong but consistent with the identifier —');
  console.log('that needs an external lookup. This is the impossible subset only.');
  process.exit(findings.length ? 1 : 0);
}

main();

// init.mjs - count the catalog's conventions and propose a contract. Builtins only.
//
// Count, never guess. A measured catalog in the fleet was genuinely mixed, and two
// agents each generalized from their own sample. So --init counts every string in
// scope and prints the counts beside each proposed choice; the human declares.

import { spellingHits, caseShape, collectProperNouns, maskText, roleOf } from './rules.mjs';
import { contractFor } from './contract.mjs';

const bump = (map, k) => map.set(k, (map.get(k) || 0) + 1);
const top = (map, n = 5) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([w, c]) => `${w} x${c}`).join(', ');
const count = (s, re) => (s.match(re) || []).length;

export function countConventions(records, contract = contractFor()) {
  const properNouns = collectProperNouns(records);
  const usWords = new Map(); const ukWords = new Map();
  const c = {
    strings: records.length, fragments: 0, usSpelling: 0, ukSpelling: 0,
    emDash: 0, enDash: 0, spacedEnDash: 0, hyphenDash: 0, curlyDouble: 0, straightDouble: 0, curlyApostrophe: 0, straightApostrophe: 0,
    ellipsisChar: 0, threeDots: 0, headingStrings: 0, headingsJudged: 0, titleCaseHeadings: 0, exclamations: 0,
  };
  for (const r of records) {
    if (r.kind === 'fragment') c.fragments += 1;
    const t = r.text;
    const masked = maskText(t, contract.terms.accept);
    for (const h of spellingHits(masked, 'US')) { c.usSpelling += 1; bump(usWords, h.word.toLowerCase()); }
    for (const h of spellingHits(masked, 'UK')) { c.ukSpelling += 1; bump(ukWords, h.word.toLowerCase()); }
    c.emDash += count(t, /—/g);
    c.enDash += count(t, /–/g);
    c.spacedEnDash += count(t, / – /g);
    c.hyphenDash += count(t, /(?<=[\p{L},]) - (?=\p{L})/gu);
    c.curlyDouble += count(t, /[“”]/g);
    c.straightDouble += count(t, /"/g);
    c.curlyApostrophe += count(t, /(?<=\p{L})’(?=\p{L})/gu);
    c.straightApostrophe += count(t, /(?<=\p{L})'(?=\p{L})/gu);
    c.ellipsisChar += count(t, /…/g);
    c.threeDots += count(t, /(?<!\.)\.\.\.(?!\.)/g);
    c.exclamations += count(t, /!(?=\s|$)/g);
    const role = roleOf(r, contract);
    if (role.heading) {
      c.headingStrings += 1;
      const shape = caseShape(t, { accept: contract.terms.accept, properNouns });
      if (!shape.allCaps && shape.words >= 3 && shape.significant > 0) {
        c.headingsJudged += 1;
        if (shape.capitalized === shape.significant) c.titleCaseHeadings += 1;
      }
    }
  }
  c.usTop = top(usWords);
  c.ukTop = top(ukWords);
  return c;
}

export function proposeContract(counts, sources) {
  const notes = [];
  const variant = counts.usSpelling >= counts.ukSpelling ? 'US' : 'UK';
  const minor = Math.min(counts.usSpelling, counts.ukSpelling);
  notes.push(`spelling: US forms ${counts.usSpelling} (${counts.usTop || 'none'}); UK forms ${counts.ukSpelling} (${counts.ukTop || 'none'}).`);
  if (minor > 0) notes.push(`spelling is MIXED: the ${minor} minority-variant forms become the first sweep once a variant is declared. No evidence either variant performs better; choose by audience and record the reason in docs/i18n/style-en.md.`);
  if (counts.usSpelling + counts.ukSpelling === 0) notes.push('spelling: no variant-marked words found; the proposed variant is a default, not a measurement - decide by audience.');

  const emDash = counts.emDash === 0 ? 'ban' : 'density';
  notes.push(`dashes: em ${counts.emDash}, en ${counts.enDash} (spaced ${counts.spacedEnDash}), hyphen-as-dash ${counts.hyphenDash}. ${counts.emDash === 0 ? 'Zero em dashes: holding a ban costs nothing today.' : 'Proposed "density" (warn on dash-joined strings); "ban" is a legitimate house ruling, but it starts with every existing em dash in the baseline.'}`);

  const quotes = counts.curlyDouble === 0 && counts.straightDouble === 0 ? 'any' : counts.curlyDouble >= counts.straightDouble ? 'curly' : 'straight';
  notes.push(`quotes: curly double ${counts.curlyDouble}, straight double ${counts.straightDouble}; apostrophes curly ${counts.curlyApostrophe}, straight ${counts.straightApostrophe}.`);

  const ellipsis = counts.ellipsisChar === 0 && counts.threeDots === 0 ? 'any' : counts.ellipsisChar >= counts.threeDots ? 'char' : 'dots';
  notes.push(`ellipsis: character ${counts.ellipsisChar}, three dots ${counts.threeDots}.`);

  const share = counts.headingsJudged ? counts.titleCaseHeadings / counts.headingsJudged : 0;
  const style = counts.headingsJudged === 0 ? 'any' : share > 0.5 ? 'title' : 'sentence';
  notes.push(`case: ${counts.titleCaseHeadings} of ${counts.headingsJudged} judgeable heading-class strings are Title Case (${Math.round(share * 100)}%; ${counts.headingStrings} heading-class strings in total, short and all-caps ones not judged). Check case.headingKeys matches this repo's key names before trusting the share.`);
  notes.push(`coverage: ${counts.strings} strings counted (${counts.fragments} fragments); exclamation marks ${counts.exclamations}.`);

  return {
    _notes: notes,
    variant,
    sources,
    exclude: [],
    dash: { emDash },
    quotes,
    ellipsis,
    case: { style },
    terms: { accept: [], reject: [] },
    rules: {},
    baseline: '.ai/copy-baseline.json',
  };
}

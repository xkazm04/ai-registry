// veto.mjs - the deterministic veto layer in front of model-produced review findings. Builtins only.
//
// Technique: copy-quality-gates/anchored-model-review, "The deterministic veto layer". A model's
// false positives recur in recognizable shapes, and a recurring false positive is cheaper to veto
// by rule than to re-litigate per run (one open grammar checker ships 306 filter rules whose only
// job is suppressing its neural checks' false positives). Each veto has an identifier and a reason,
// and every suppression is counted and returned - a filter that drops findings silently is a
// reviewer nobody can calibrate.
//
// Input: findings shaped as references/review-checklist.md specifies -
//   { key, span, rule (or id), mqm?, severity?, fix?, reason?, file?, line?, index? }
// Output: { given, kept: [finding + { anchor, unitText }], suppressed: [{ veto, reason, finding }], counts }

import { RULES, guardFor, ruleById } from './rules.mjs';
import { locateSpan, occurrences, uniqueSpan } from './span.mjs';
import { keyClassOf } from './contract.mjs';

// Claim words whose "fix" is a neighbour from the same group: the empty claim renamed, not removed
// (EN-SYNONYM-SWAP). Groups are narrow on purpose - a word with an ordinary second sense ("key",
// "critical", "enable") is left out, because a veto that fires on a legitimate fix hides a real finding.
export const SYNONYM_GROUPS = [
  ['seamless', 'seamlessly', 'effortless', 'effortlessly', 'frictionless', 'painless', 'hassle-free'],
  ['robust', 'powerful', 'rock-solid', 'sturdy', 'bulletproof'],
  ['cutting-edge', 'cutting edge', 'state-of-the-art', 'leading-edge', 'groundbreaking', 'next-generation', 'next-gen', 'innovative'],
  ['unlock', 'unlocks', 'unleash', 'unleashes', 'tap into'],
  ['elevate', 'elevates', 'supercharge', 'supercharges', 'turbocharge', 'amplify', 'amplifies'],
  ['empower', 'empowers', 'equip', 'equips'],
  ['revolutionize', 'revolutionise', 'revolutionizes', 'revolutionises', 'reinvent', 'reinvents', 'disrupt', 'disrupts'],
  ['leverage', 'leverages', 'harness', 'harnesses', 'utilize', 'utilise', 'utilizes', 'utilises'],
  ['simply', 'just', 'easily', 'effortlessly'],
  ['crucial', 'pivotal', 'vital', 'instrumental'],
  ['game-changer', 'game changer', 'game-changing', 'breakthrough'],
  ['unique', 'one-of-a-kind', 'unparalleled', 'unmatched', 'unrivaled', 'unrivalled', 'second to none'],
];

const hasWord = (text, w) => new RegExp(`(?<![\\p{L}\\p{N}])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[- ]/g, '[- ]')}(?![\\p{L}\\p{N}])`, 'iu').test(text);

const AUTHORSHIP = /\b(?:AI[- ]?(?:written|generated|authored)|(?:written|generated|authored) by (?:an? )?(?:AI|LLM|model|machine|bot|ChatGPT|GPT)|(?:sounds?|reads?|feels?|looks?)(?: like it was| as if| like)? (?:AI|machine|LLM|model|bot|ChatGPT)[- ]?(?:generated|written)?|(?:sounds?|reads?|feels?|looks?) (?:machine[- ])?generated|(?:machine|LLM|model|GPT|ChatGPT)[- ](?:generated|written)|ChatGPT|AI detector|detector score|perplexity|burstiness|\d+\s?% (?:AI|human))\b/i;

const SKELETON = /\{\{[^{}]*\}\}|\{[^{}]*\}|<\/?[A-Za-z][\w-]*\s*\/?>|%(?:\d+\$)?[sdif@]/g;
const skeletonOf = (s) => (String(s).match(SKELETON) || []).sort().join('\u0000');

const textOf = (f) => [f.reason, f.note, f.message, f.fix, f.mqm, f.why].filter((x) => typeof x === 'string').join(' \u0001 ');

/**
 * The veto rules, applied in order; the first that matches suppresses the finding.
 * test(f, env) returns a reason string (suppress) or a falsy value (pass).
 */
export const VETOES = [
  { id: 'V-SHAPE', why: 'a finding without key, span and rule id is not a finding', test: (f) => (!f.key || !f.span || !f.rule) && `missing ${['key', 'span', 'rule'].filter((k) => !f[k]).join(', ')}` },
  { id: 'V-UNKNOWN-RULE', why: 'the cited rule id is not in the catalog', test: (f, env) => !env.ruleIds.has(f.rule) && `${f.rule} is not a rule of the checker or the english subject` },
  { id: 'V-AUTHORSHIP', why: 'a finding names a text property, never a writer or a detector score', test: (f) => { const m = AUTHORSHIP.exec(textOf(f)); return m && `alleges authorship or cites a detector ("${m[0]}")`; } },
  { id: 'V-UNKNOWN-UNIT', why: 'the key does not name a string in scope', test: (f, env) => env.unit.error === 'unknown' && `no string with key ${f.key}${f.file ? ` in ${f.file}` : ''}` },
  { id: 'V-UNIT-AMBIGUOUS', why: 'the key names several strings holding this span; give file and line', test: (f, env) => env.unit.error === 'ambiguous' && `key ${f.key} names ${env.unit.count} strings containing the span` },
  { id: 'V-LOCKED-UNIT', why: 'the contract marks this key locked or preserved', test: (f, env) => { const c = keyClassOf(f.key, env.contract); return c && `key is ${c} (contract keys.${c})`; } },
  { id: 'V-SPAN-NOT-VERBATIM', why: 'the quoted span does not occur in the string', test: (f, env) => env.where.error === 'absent' && 'span does not occur verbatim in the string' },
  { id: 'V-SPAN-AMBIGUOUS', why: 'the span occurs more than once and no offset says which', test: (f, env) => env.where.error === 'ambiguous' && `span occurs ${env.where.count} times; quote a span that occurs once` },
  {
    id: 'V-ACCEPTED-TERM', why: 'the span is a name the contract accepts',
    test: (f, env) => (env.contract?.terms?.accept || []).find((t) => {
      const at = env.unitText.toLowerCase().indexOf(t.toLowerCase());
      for (let i = at; i !== -1; i = env.unitText.toLowerCase().indexOf(t.toLowerCase(), i + 1)) if (env.where.index >= i && env.where.index + f.span.length <= i + t.length) return true;
      return false;
    }) && 'span lies inside an accepted term (terms.accept)',
  },
  { id: 'V-SKELETON', why: 'the fix changes placeholders or tags', test: (f) => typeof f.fix === 'string' && skeletonOf(f.span) !== skeletonOf(f.fix) && 'fix does not keep the span\'s placeholders and tags byte-identical' },
  { id: 'V-NOOP-FIX', why: 'the fix equals the span', test: (f) => typeof f.fix === 'string' && f.fix.trim() === f.span.trim() && 'fix is identical to the span' },
  {
    id: 'V-SYNONYM-SWAP', why: 'the fix renames the flagged claim instead of removing it (EN-SYNONYM-SWAP)',
    test: (f) => {
      if (typeof f.fix !== 'string') return false;
      for (const group of SYNONYM_GROUPS) {
        const flagged = group.find((w) => hasWord(f.span, w));
        if (!flagged) continue;
        const swapped = group.find((w) => hasWord(f.fix, w));
        if (swapped) return `"${flagged}" replaced by "${swapped}" from the same claim group`;
      }
      return false;
    },
  },
  {
    id: 'V-RULE-GUARD', why: 'the span sits where a recorded guard of the cited rule says the pattern is native',
    test: (f, env) => {
      const rule = ruleById(f.rule);
      if (!rule) return false;
      const g = guardFor(rule, env.unitText, env.where.index, f.span.length);
      return g && `${f.rule} guard: ${g.reason}`;
    },
  },
];

/**
 * A unit resolver over extracted records: finds the one string a finding's key (plus optional
 * file and line) names, preferring the one that holds the span.
 */
export function unitResolver(records) {
  const byKey = new Map();
  for (const r of records) { if (!byKey.has(r.key)) byKey.set(r.key, []); byKey.get(r.key).push(r); }
  return (f) => {
    const cands = (byKey.get(f.key) || []).filter((r) => (!f.file || r.file === f.file) && (f.line == null || r.line === Number(f.line)));
    if (!cands.length) return { error: 'unknown' };
    if (cands.length === 1) return { record: cands[0] };
    const holding = cands.filter((r) => f.span && (r.text.includes(f.span) || r.raw.includes(f.span)));
    if (holding.length === 1) return { record: holding[0] };
    if (holding.length === 0) return { record: cands[0] };
    return { error: 'ambiguous', count: holding.length };
  };
}

/**
 * Apply the veto layer. env: { resolveUnit(f) -> { record } | { error, count }, ruleIds: Set,
 * contract? }. Pure: never mutates the input findings.
 */
export function applyVeto(findings, { resolveUnit, ruleIds, contract = null } = {}) {
  const ids = ruleIds instanceof Set ? ruleIds : new Set(ruleIds || RULES.map((r) => r.id));
  const kept = []; const suppressed = []; const counts = {};
  for (const input of findings) {
    const f = { ...input, rule: input.rule ?? input.id };
    const unit = f.key && resolveUnit ? resolveUnit(f) : { error: 'unknown' };
    const rec = unit.record;
    // the rendered text is what the reviewer was shown; a span quoted from the raw message is accepted too
    let unitText = rec ? rec.text : '';
    let where = { error: 'absent', count: 0 };
    if (rec && f.span) {
      const offset = Number.isInteger(f.index) && rec.text.startsWith(f.span, f.index) ? { index: f.index } : null;
      where = offset || locateSpan(rec.text, f.span);
      if (where.error === 'absent' && occurrences(rec.raw, f.span)) { unitText = rec.raw; where = locateSpan(rec.raw, f.span); }
    }
    const env = { ruleIds: ids, contract, unit, unitText, where };
    let hit = null;
    for (const v of VETOES) {
      const reason = v.test(f, env);
      if (reason) { hit = { veto: v.id, reason }; break; }
    }
    if (hit) {
      suppressed.push({ ...hit, finding: input });
      counts[hit.veto] = (counts[hit.veto] || 0) + 1;
    } else {
      kept.push({ ...input, rule: f.rule, file: rec.file, line: rec.line, anchor: uniqueSpan(unitText, where.index, f.span.length).span });
    }
  }
  return { given: findings.length, kept, suppressed, counts };
}

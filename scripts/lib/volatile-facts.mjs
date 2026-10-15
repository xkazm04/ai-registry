/**
 * volatile-facts — which documents state the kind of fact that goes stale, and how long
 * since anyone touched them.
 *
 * check-currency answers "has this application's clock run out". It cannot see two things
 * that a measured pass on 2026-10-14 turned up:
 *
 *   - a golden path or technique carries NO clock at all, yet states "63 days", "two to
 *     three weeks", "two or more years" - windows and thresholds a platform changes;
 *   - an application whose `refresh_by` is still ahead can already be wrong ("~0.1x" for
 *     a cache-read price one vendor has since split by model), because a clock measures
 *     age, not whether the fact moved.
 *
 * So this module counts the claims that depend on the outside world's current state:
 * quantities with a unit (durations, multipliers, money, percentages, size and volume
 * thresholds) and bare years. It is a LOCATOR, not a verdict. A count says "read this
 * file's numbers against their sources"; it never says a number is wrong. A methodology
 * document full of measured results of its own will score high and be fine.
 *
 * Deterministic and offline on purpose: /deepen's scan step takes computed inputs, and an
 * input that needs a network or a model is not one a scheduled run can trust.
 */

const NUM_WORDS = '(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|sixty|ninety)';
const NUM = `(?:\\d[\\d,]*(?:\\.\\d+)?|${NUM_WORDS})`;
const RANGE = `${NUM}(?:\\s*(?:-|–|—|to|or)\\s*(?:more\\s+)?${NUM})?`;

/**
 * How much each kind says "an outside party set this and can change it". A duration,
 * a multiplier or a price is how a platform states a rule; a percentage or a year is
 * usually a file reporting its own measurement or its own date. Weighted, not dropped:
 * a measured percentage can still be a stale benchmark.
 */
const WEIGHT = { duration: 2, multiplier: 2, money: 2, volume: 1, percent: 0.5, year: 0.5 };

/** Each kind has a regex over PROSE (code fences and frontmatter are stripped first). */
const KINDS = [
  // "63 days", "two to three weeks", "two or more years", "10 minutes"
  ['duration', new RegExp(`\\b${RANGE}[\\s-]+(?:calendar\\s+|business\\s+)?(?:seconds?|minutes?|hours?|days?|weeks?|months?|years?)\\b`, 'gi')],
  // "0.1x", "~0.25×", "1.25x", "3x"
  ['multiplier', /(?<![\w.])~?\d+(?:\.\d+)?\s?[x×](?![a-z0-9])/gi],
  // "$5,000", "$0.10"
  ['money', /\$\s?\d[\d,]*(?:\.\d+)?/g],
  // "17%", "0.003 %"
  ['percent', /\b\d+(?:\.\d+)?\s?%/g],
  // "1,000 conversions", "100k tokens", "26 parameters", "700 clicks"
  // Digits only: "one row" and "two conversion" are prose, "1,000 conversions" is a threshold.
  ['volume', new RegExp(`\\b\\d[\\d,]*(?:\\.\\d+)?\\s?[kKmM]?\\s+(?:tokens?|requests?|conversions?|clicks?|events?|rows?|calls?|parameters?|samples?|users?|MB|GB|KB)\\b`, 'gi')],
  // a year is a dated claim: "2026", "since 2024"
  ['year', /\b20[12]\d\b/g],
];

/**
 * Strip what is not a claim: frontmatter, fenced code, inline code, link targets.
 * Every removed character becomes a space and every newline survives, so an index into the
 * result is an index into the original and a line number computed here is the file's line.
 */
export function proseOf(markdown) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return markdown
    .replace(/^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/, blank)
    .replace(/```[\s\S]*?```/g, blank)
    .replace(/~~~[\s\S]*?~~~/g, blank)
    .replace(/`[^`\n]*`/g, blank)
    .replace(/\]\([^)]*\)/g, (m) => `]${blank(m).slice(1)}`);
}

/**
 * Count the volatile facts in one document.
 * @returns {{ count: number, weighted: number, byKind: Record<string, number>, examples: string[], facts: {kind: string, text: string, line: number}[], words: number }}
 */
export function scanVolatile(markdown) {
  const text = proseOf(markdown);
  const byKind = {};
  const seen = new Set();
  const examples = [];
  const facts = [];
  let count = 0;
  let weighted = 0;
  for (const [kind, re] of KINDS) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      // The same span can match two kinds ("2 years" is a duration and holds a year-ish
      // number); count each character span once, first kind wins.
      const key = `${m.index}`;
      if (seen.has(key)) continue;
      seen.add(key);
      byKind[kind] = (byKind[kind] ?? 0) + 1;
      count += 1;
      weighted += WEIGHT[kind];
      if (examples.length < 6 && kind !== 'year') examples.push(m[0].trim().replace(/\s+/g, ' '));
      if (facts.length < 400) {
        const line = text.slice(0, m.index).split('\n').length;
        facts.push({ kind, text: m[0].trim().replace(/\s+/g, ' '), line });
      }
    }
  }
  return { count, weighted, byKind, examples, facts, words: (text.match(/\S+/g) ?? []).length };
}

/**
 * Attention score: weighted volatile facts, scaled by how long the file has been untouched.
 * Age is a multiplier, not an addend, so an untouched file with three numbers does not
 * outrank a fresh file with sixty, and a file with no numbers scores zero at any age.
 */
export function volatileScore({ weighted, ageDays }) {
  const age = Number.isFinite(ageDays) ? Math.max(0, ageDays) : 0;
  return Math.round(weighted * (1 + age / 180) * 10) / 10;
}

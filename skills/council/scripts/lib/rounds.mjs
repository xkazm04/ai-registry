// rounds - the next round number for one subject in one mode, computed from the run
// directories a previous Director left, so the count is the same whoever counts.
//
// A run directory is named `<YYYY-MM-DD>-<slug>-r<n>` for the full council and
// `<YYYY-MM-DD>-<slug>-lite-r<n>` for a lite pass. **Rounds are counted PER MODE**: a lite
// pass is a fraction of a council's cost and does not burn one of the council's three
// rounds, and a lite round 4 is `stalled` exactly as a full one is. The supersede chain is
// per mode too - a full round never supersedes a lite one, because a single-pass opinion
// is not the verdict a blind council replaces.
//
// The name alone is ambiguous in one case: a full run of slug `foo-lite` and a lite run of
// slug `foo` are both `<date>-foo-lite-r<n>`. When a directory carries a readable
// `started.json`, its `subject.slug` and `mode` decide; the name is the fallback.

import { MODES, ROUND_CAP } from './aggregate.mjs';

const DATE = '\\d{4}-\\d{2}-\\d{2}';
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The run directory name for a round - the run_id, which the door requires to match. */
export function runDirName(date, slug, mode, roundNo) {
  return `${date}-${slug}-${mode === 'lite' ? 'lite-' : ''}r${roundNo}`;
}

/**
 * @param {Array<{name: string, started?: object|null}>} entries  existing run directories
 * @param {string} slug
 * @param {'full'|'lite'} mode
 * @returns {{mode, round_no, supersedes_run_id, stalled, prior_rounds}}
 */
export function nextRound(entries, slug, mode = 'full') {
  if (!MODES.includes(mode)) throw new Error(`mode must be one of ${MODES.join(', ')}`);
  if (typeof slug !== 'string' || !slug) throw new Error('a slug is required');
  const pattern = new RegExp(`^${DATE}-${esc(slug)}-${mode === 'lite' ? 'lite-' : ''}r(\\d+)$`);
  const rounds = [];
  for (const e of Array.isArray(entries) ? entries : []) {
    const name = typeof e === 'string' ? e : e?.name;
    const started = typeof e === 'object' ? e?.started : null;
    if (typeof name !== 'string') continue;
    const m = pattern.exec(name);
    if (!m) continue;
    if (started && typeof started === 'object') {
      // The run's own identity beats its name.
      if (started.subject?.slug && started.subject.slug !== slug) continue;
      if ((started.mode ?? 'full') !== mode) continue;
    }
    rounds.push({ n: Number(m[1]), name });
  }
  rounds.sort((a, b) => a.n - b.n || a.name.localeCompare(b.name));
  const last = rounds.at(-1) ?? null;
  const roundNo = (last?.n ?? 0) + 1;
  return {
    mode,
    round_no: roundNo,
    supersedes_run_id: last?.name ?? null,
    stalled: roundNo > ROUND_CAP,
    prior_rounds: rounds.map((r) => r.name),
  };
}

/**
 * currency-clock — the one place an application's expiry is computed.
 *
 * Two tools answer "has this application's clock run out": check-currency (the report) and
 * librarian-scan (which scores it into a bundle's attention points). Each carried its own
 * reading. check-currency derives `expiresOn = verified_on + WINDOW_DAYS[stack]` when an
 * application has no `refresh_by`; librarian-scan scored only an explicit `refresh_by`, on
 * the stated ground that the table lived elsewhere and duplicating it was worse. So the two
 * disagreed by exactly the applications that rely on the derivation: on 2026-10-25 the
 * currency report counted 20 at risk and the librarian 19, the missing one being
 * software-engineering/supply-chain/next--update-automation-review (a derived clock, 30 days
 * left). A bundle's priority was understated by whatever the table alone knew.
 *
 * Both now import `clockOf`, so the policy cannot drift between them again. Tune the windows
 * here; a document that knows better carries its own `refresh_by`.
 *
 * It also holds the one rule for a CONTRIBUTOR REPORT's age (`reportState`, `partitionReports`):
 * a `usage/` or `signals/` file describes the `windowDays` that ended at its `generatedAt`,
 * and once that window no longer reaches the date a reader measures against, its counts are
 * history, not current. build-catalog measures against the catalog's evidence date;
 * check-currency and librarian-scan against their (injectable) clock. Same rule, three readers.
 */
import { reportAge } from './telemetry.mjs';

/**
 * How long a citation against each stack stays plausible without a re-check.
 *
 * These are FLOORS, not measurements. The reasoning is how fast the surface underneath a
 * citation moves: a UI framework and its ecosystem churn fastest, a systems runtime is
 * slower and its breaking changes are louder, and the SQL surface a document is likely to
 * cite barely moves at all. `process` gets NO clock - a methodology does not expire on a
 * vendor's release schedule, and giving it one would generate noise that trains people to
 * ignore the report.
 *
 * Tune these here, in one place. A document that knows better carries its own `refresh_by`.
 */
export const WINDOW_DAYS = {
  react: 183,
  // A server-rendering web framework on an active security patch line. Half the react
  // window, and the reason is not churn but exposure: a citation against this stack is
  // routinely a claim about a default that a PATCH release can retire (supply-chain /
  // update-automation-review, "When the dependency is the framework"). This clock
  // protects the fleet, not the prose.
  next: 90,
  node: 183,
  rust: 274,
  sql: 365,
  process: null,
  // The external-reconcile lane's two non-runtime stacks (docs/reconcile-brief.md,
  // "Instrument changes the extension needs"). A `spec` application is realized by a
  // clause in a pinned specification edition and a `data` one by a pinned dataset
  // snapshot; neither has a runtime to drift against, so both take `process`'s null
  // clock. The pin is the currency statement, and it is in the document's prose.
  //
  // Null rather than absent, and the distinction is load-bearing: an ABSENT stack falls
  // to DEFAULT_WINDOW_DAYS below, and - worse - reads as runtime-bearing everywhere
  // check-currency tests `WINDOW_DAYS[stack] !== null`, because `undefined !== null`. A
  // stack left undeclared here would report every one of its applications as drift-blind
  // for want of a `verified_against` the lane forbids it to carry.
  spec: null,
  data: null,
};
export const DEFAULT_WINDOW_DAYS = 183;

export const DAY = 86400000;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export const addDays = (iso, days) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY);

/**
 * The clock of one application, from its frontmatter.
 *
 * `fm` is any object with optional string `stack`, `verified_on`, `refresh_by`. `today` is
 * an ISO date (UTC). Returns `{ stack, window, expiresOn, clockSource, daysLeft }`:
 *   - `refresh_by` present: it IS the expiry (`clockSource: 'refresh_by'`), beating derivation.
 *   - else `verified_on` and a non-null window: `verified_on + window` (`'derived'`).
 *   - else no clock (`'none'`, `expiresOn` and `daysLeft` null). `process`, `spec`, `data`
 *     land here by design.
 * `daysLeft` is negative once expired. A frontmatter reader may hand back an array for an
 * empty key; only a non-empty string counts as a value, and a `verified_on` that is not an
 * ISO day derives nothing rather than throwing out of a scan.
 */
export function clockOf(fm, today) {
  const str = (v) => (typeof v === 'string' && v !== '' ? v : null);
  const stack = str(fm.stack) ?? 'unknown';
  const window = stack in WINDOW_DAYS ? WINDOW_DAYS[stack] : DEFAULT_WINDOW_DAYS;
  const verifiedOn = str(fm.verified_on);
  const refreshBy = str(fm.refresh_by);

  let expiresOn = null;
  let clockSource = 'none';
  if (refreshBy) {
    expiresOn = refreshBy;
    clockSource = 'refresh_by';
  } else if (verifiedOn && ISO_DAY.test(verifiedOn) && window !== null) {
    expiresOn = addDays(verifiedOn, window);
    clockSource = 'derived';
  }
  return {
    stack,
    window,
    expiresOn,
    clockSource,
    daysLeft: expiresOn ? daysBetween(today, expiresOn) : null,
  };
}

/**
 * Is one contributor report (`usage/<c>.json`, `signals/<c>.json`) still current at `asOf`?
 *
 * `ageDays` is WHOLE days elapsed, floored (lib/telemetry.mjs reportAge, the same reading
 * telemetry-report prints), and the report is `current` while `ageDays <= windowDays`. So the
 * boundary is inclusive: a 30-day report exactly 30 days old is current, one 31 whole days old
 * is stale. A report dated after `asOf` (`ageDays < 0`, clock skew) is not older than its
 * window, so it is current; it is never silently re-dated.
 *
 * A report that cannot be dated (no parseable `generatedAt`), has no positive integer
 * `windowDays`, or is measured against no parseable `asOf`, is `stale` with whatever age is
 * known: an unwitnessed number reads as unknown, never as current.
 *
 * Returns `{ state: 'current'|'stale', ageDays: number|null }`.
 */
export function reportState(generatedAt, windowDays, asOf) {
  if (typeof asOf !== 'string' || !Number.isFinite(Date.parse(asOf))) return { state: 'stale', ageDays: null };
  const window = Number.isInteger(windowDays) && windowDays > 0 ? windowDays : null;
  const { status, ageDays } = reportAge(generatedAt, asOf, window ?? 0);
  const current = window !== null && (status === 'within-window' || status === 'future');
  return { state: current ? 'current' : 'stale', ageDays };
}

/**
 * Split parsed contributor documents by `reportState` at `asOf`. Order is preserved.
 * Returns `{ current, stale, ages }`, where `ages` is one row per document:
 * `{ contributor, generatedAt, windowDays, state, ageDays }`.
 */
export function partitionReports(docs, asOf) {
  const current = [];
  const stale = [];
  const ages = [];
  for (const doc of docs) {
    const { state, ageDays } = reportState(doc?.generatedAt, doc?.windowDays, asOf);
    (state === 'current' ? current : stale).push(doc);
    ages.push({ contributor: doc?.contributor ?? null, generatedAt: doc?.generatedAt ?? null, windowDays: doc?.windowDays ?? null, state, ageDays });
  }
  return { current, stale, ages };
}

/** One line per contributor for a human report: `wolf 26d current (window 30d)`. */
export const describeAge = (a) =>
  `${a.contributor ?? '(unnamed)'} ${a.ageDays === null ? 'age unknown' : `${a.ageDays}d`} ${a.state} (window ${a.windowDays ?? '?'}d${a.generatedAt ? `, generatedAt ${a.generatedAt}` : ''})`;

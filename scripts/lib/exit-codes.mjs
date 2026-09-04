/**
 * exit-codes — the one declaration of what this repo's scripts mean by their exit status.
 *
 * Every script here is called by something that receives an integer and nothing else:
 * a hook, a CI step, a skill's procedure, another script. That integer is a closed
 * vocabulary over the same outcomes the scripts already name in prose, and until this
 * file existed the mapping lived beside each `process.exit(...)` call site.
 *
 * It drifted exactly where you would predict. Codes 0/1/2 held a consistent convention
 * across ~30 scripts because three values fit in one author's head; code 3 - the first
 * value added by a later script - acquired three mutually incompatible meanings, with
 * no declaration anywhere to notice against:
 *
 *   - run-board.mjs        3 = CONTENDED  (transient; the caller should wait and retry)
 *   - research-ingest.mjs  3 = source too thin (permanent; retrying can never help)
 *   - upstream-check.mjs   3 = rows are due (not a failure at all; a positive finding)
 *
 * A caller that retries on 3 loops forever on a thin source and treats due upstream rows
 * as an error. Those three are recorded in KNOWN_COLLISIONS below rather than silently
 * renumbered: changing a live code would break callers mid-flight, and the point of the
 * declaration is that the NEXT meaning cannot be added without a decision.
 *
 * The contract, in one line each:
 *
 *   OK        0  the instrument ran and found nothing to report
 *   VIOLATIONS 1 the instrument ran and found what it looks for
 *   FATAL     2  the instrument COULD NOT RUN - usage error, missing input, broken
 *                precondition. Distinct from 1 by law: reporting nothing is not the
 *                same as finding nothing (failure-not-empty-success).
 *   CONTENDED 3  a live sibling holds the resource; waiting is meaningful
 *
 * Adding a meaning means adding a name here. That is the whole mechanism.
 */

/** The declared vocabulary. Frozen: a caller may read it, nobody may extend it in place. */
export const EXIT = Object.freeze({
  OK: 0,
  VIOLATIONS: 1,
  FATAL: 2,
  CONTENDED: 3,
});

/** What each code means, for the audit's report and for anyone reading a CI log. */
export const MEANINGS = Object.freeze({
  0: 'the instrument ran and found nothing to report',
  1: 'the instrument ran and found what it looks for',
  2: 'the instrument could not run (usage error, missing input, broken precondition)',
  3: 'a live sibling holds the resource; waiting is meaningful',
});

/**
 * Meanings that already ship on a code owned by something else. These are debt, not
 * design. Each entry is a site the audit will not fail on and a reader can count.
 * Removing one means renumbering a live code and telling its callers.
 */
export const KNOWN_COLLISIONS = Object.freeze([
  {
    script: 'research-ingest.mjs',
    code: 3,
    means: 'source too thin to mine (permanent - retrying cannot help)',
    conflictsWith: 'CONTENDED, which is transient and invites a retry',
  },
  {
    script: 'upstream-check.mjs',
    code: 3,
    means: 'upstream rows are due (a positive finding, opt-in via --exit-code)',
    conflictsWith: 'CONTENDED, and with the premise that non-zero means trouble',
  },
]);

/** Name for a code, for error messages. Returns null for an undeclared value. */
export function nameOf(code) {
  const hit = Object.entries(EXIT).find(([, v]) => v === code);
  return hit ? hit[0] : null;
}

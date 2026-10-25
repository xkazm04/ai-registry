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
 * Two more were found later, both permanent-until-something-changes outcomes:
 * agent-cost-band.mjs (not enough data) and transcript-mirror.mjs (capture paused at its
 * budget, reached through a computed exit value that the literal scan could not see).
 *
 * A caller that retries on 3 loops forever on a thin source and treats due upstream rows
 * as an error. Those are recorded in KNOWN_COLLISIONS below rather than silently
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
  {
    script: 'agent-cost-band.mjs',
    code: 3,
    means: 'not enough data to estimate the band (permanent until more sessions exist - an immediate retry cannot help)',
    conflictsWith: 'CONTENDED, which is transient and invites a retry',
  },
  {
    script: 'transcript-mirror.mjs',
    code: 3,
    means: 'capture paused at the byte budget (reached through a computed exit value, not a literal)',
    conflictsWith: 'CONTENDED: nothing is held by a sibling, so waiting does not help. Its LOCKED error is a different thing and exits 1; renumbering it onto 3 is a separate decision',
  },
]);

/** Name for a code, for error messages. Returns null for an undeclared value. */
export function nameOf(code) {
  const hit = Object.entries(EXIT).find(([, v]) => v === code);
  return hit ? hit[0] : null;
}

/**
 * Opt-in crash door: a script that dies on an UNCAUGHT throw or rejection leaves through
 * Node's own exit code, 1 - which this vocabulary (and gate.mjs, which prints it as
 * "VIOLATIONS") reads as "ran and found what it looks for". A TypeError in a checker is
 * the opposite: the instrument could not finish, and AGENTS.md holds that an incomplete
 * check is not a content verdict. Probe, 2026-10-25: a JSON.parse throw, a rejected
 * await and `undefined.map`, each in a script that imported this file, all exited 1.
 *
 * Call it as the first statement of a script's own entry (or of its main(), when the
 * file also exports functions a test imports - installing process handlers inside a
 * test runner would hijack its failure reporting). It is deliberately NOT an import side
 * effect: only the two events below are handled, so an explicit `process.exit(1)` and
 * `process.exitCode = 1` are untouched, and no `exit` listener is registered.
 *
 * It cannot see a failure that happens while the script's own imports are still being
 * evaluated (a missing sibling module, a syntax error in a lib): the call sits after the
 * import statements by construction. Those still exit 1 through Node.
 *
 * Idempotent: a second call from the same process is a no-op.
 */
const CRASH_DOOR = Symbol.for('ai-registry.crashDoor');

export function installCrashDoor(script = process.argv[1]) {
  if (process[CRASH_DOOR]) return;
  process[CRASH_DOOR] = true;
  const name = String(script ?? 'script').split(/[\\/]/).pop();
  const door = (reason) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error && reason.stack ? reason.stack : '';
    try {
      process.stderr.write(`FATAL: ${name} crashed: ${message.split('\n')[0]}\n${stack ? `${stack}\n` : ''}`);
    } finally {
      process.exit(EXIT.FATAL);
    }
  };
  process.on('uncaughtException', door);
  process.on('unhandledRejection', door);
}

import { EXIT } from './exit-codes.mjs';

// A checker that did not finish cannot establish that its input is defective.
export function classifyCheckResult(result) {
  if (result.error) return { code: EXIT.FATAL, reason: result.error.message };
  if (result.signal) return { code: EXIT.FATAL, reason: `terminated by ${result.signal}` };
  if (result.status === EXIT.OK) return { code: EXIT.OK, reason: null };
  if (result.status === EXIT.VIOLATIONS) return { code: EXIT.VIOLATIONS, reason: 'violations reported' };
  return { code: EXIT.FATAL, reason: `checker did not complete normally (exit ${result.status})` };
}

// A checker that walked nothing has not checked anything. Seven gates here once read an
// empty population (0 bundles, 0 subjects, 0 anchors, 0 files, no fleet bridge) as a
// clean result, each because it had to remember the floor on its own; this is the floor,
// written once. It returns the FATAL verdict rather than exiting, so the caller keeps
// control of its own output and exit door.
export function requirePopulation(count, what, { min = 1 } = {}) {
  if (Number.isFinite(count) && count >= min) return { code: EXIT.OK, reason: null };
  return {
    code: EXIT.FATAL,
    reason: `walked ${Number.isFinite(count) ? count : 'no'} ${what} (floor ${min}) - reporting nothing is not finding nothing`,
  };
}

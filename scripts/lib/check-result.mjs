import { EXIT } from './exit-codes.mjs';

// A checker that did not finish cannot establish that its input is defective.
export function classifyCheckResult(result) {
  if (result.error) return { code: EXIT.FATAL, reason: result.error.message };
  if (result.signal) return { code: EXIT.FATAL, reason: `terminated by ${result.signal}` };
  if (result.status === EXIT.OK) return { code: EXIT.OK, reason: null };
  if (result.status === EXIT.VIOLATIONS) return { code: EXIT.VIOLATIONS, reason: 'violations reported' };
  return { code: EXIT.FATAL, reason: `checker did not complete normally (exit ${result.status})` };
}

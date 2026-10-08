#!/usr/bin/env node
/**
 * overflow - StopFailure hook: when a local session stops on a rate limit, ship queued briefs
 * to cloud sessions instead of letting the work wait for the quota window.
 *
 *   stdin: {"hook_event_name":"StopFailure","error":"rate_limit","session_id":"...","cwd":"..."}
 *
 * Why it exists: the cloud-session credit is a separate budget from the local plan's quota, so
 * a rate-limited local session is exactly when cloud capacity is free. It acts only on
 * `StopFailure` + `rate_limit`; ships `queued` items oldest first, at most AUTO_CAP_PER_DAY (6)
 * overflow dispatches per local calendar date so a looping hook cannot drain the credit; a
 * refused item (e.g. its repo is ahead of origin) is marked `refused` and costs nothing.
 * Every acting invocation appends one decision line to .ai/cloud-queue/overflow.log.jsonl.
 *
 * A hook must never break the session: this script catches everything and ALWAYS exits 0.
 */
function finish() { process.exit(0); }
process.on('uncaughtException', finish);
process.on('unhandledRejection', finish);

let input = '';
try {
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { input += c; });
  process.stdin.on('end', async () => {
    // imported lazily so even a broken lib cannot make the hook exit non-zero
    try { const { runOverflow } = await import('./lib/core.mjs'); runOverflow({ input }); } catch { /* never fail the hook */ }
    finish();
  });
  process.stdin.on('error', finish);
} catch {
  finish();
}

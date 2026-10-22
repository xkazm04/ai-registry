---
layer: application
type: application
subject: agent-browser-control
technique: agent-actionable-errors
stack: node
status: forged
verified_on: 2026-10-22
applied: task
ab_verdict: better
---

# gstack `browse` — one rewrite door, keyed on action names

The gstack tree (pinned at commit `514fbfdc9799376edfd2536f60659501a48ead64`;
`package.json` declares no Node version, only a Bun engine, so no
`verified_against` is stated) routes every failed command through one function
before the result leaves the daemon: `browse/src/server.ts:933 "function wrapError(err: any): string"`,
called at `browse/src/server.ts:1326 "let errorMsg = wrapError(err);"`. The door
exists, which is the technique's structural half. This document records what the
door does to the errors a real driver produces, measured by replay.

## What was measured

Thirteen failures were recorded from a real Chromium on Playwright 1.62.1 (seven
element waits on different actions, three strict-mode violations, three navigations)
and replayed through the function unchanged (arm A) and through a patched copy
(arm B), with one predicate: the message carries no driver call log or ANSI codes,
and, for an element wait or an ambiguity, names `snapshot`.

| arm | actionable | what failed |
|---|---|---|
| A: as shipped | **7 / 13** | `check`, `press`, `type`, `selectOption` and `waitForSelector` timeouts became "Operation timed out: locator.check: Timeout 800ms exceeded." with no next command; a navigation refused outright (not a timeout) passed through with its call log and ANSI escapes |
| B: keyed on the failure class | **13 / 13** | one pattern for "an action waiting on a locator or selector", and a stripped pass-through that keeps the net error code |

**Floor:** the three rewrites that already worked (click/fill timeout, navigation
timeout, ambiguity) return byte-identical text in both arms, and a tool-authored
multi-line usage error passes through unchanged. Both held.

## What the tree shows about the technique

- **The rewrite is keyed on the driver call's name, not on the failure's class.**
  `browse/src/server.ts:937 "msg.includes('locator.click') || msg.includes('locator.fill') || msg.includes('locator.hover')"`
  enumerates three actions of a dozen that wait on a locator. Every unlisted action
  falls to the generic branch, which the technique's own text forbids: a bare
  timeout that does not say which kind or what to run. The pattern list was a bet
  on the actions the author tried first, and the bet lost on the sibling actions.
- **Pass-through is where the driver's internals leak.**
  `browse/src/server.ts:949 "// Pass through other errors"` returns the message whole,
  so a navigation that fails with a network error arrives with a multi-line call log
  in terminal colour codes. The class (a network error code) is in the first line;
  everything after it is cost.
- **No test pinned any of it.** `grep -rn wrapError browse/test` returned nothing at
  this commit, so a driver upgrade that rewords a marker would have degraded every
  rewrite to pass-through silently. The pin is a test over recorded real errors,
  because the rewrite table is a bet on the driver's wording and only the wording
  can falsify it.

## The change

Task branch `intake/pin-wraperror` (one commit, 4 files, +139 / -23, patch in
`librarian/handoffs/2026-10-22-gstack-wraperror-task.patch`): `wrapError` moves
verbatim to a side-effect-free module (the server module cannot be imported in a
test), the element-wait branch matches the class rather than three action names, a
non-timeout `page.goto` failure keeps the net error and drops the call log, and the
pass-through strips the call log and ANSI codes. The new test file and the recorded
fixture run green (11 of 11 with the existing error-handling tests); the same test
file against the verbatim move fails 2 of 3, so the control was red. Not pushed; no
PR; the operator decides whether a test-only-plus-small-fix change goes upstream.

## What this realization cannot do

It does not touch the unknown-reference message, which is raised before the door
at `browse/src/tab-session.ts:94 "Ref ${selector} not found. Run 'snapshot' to get fresh refs."`
(correct, and it names the next command), and the tree carries no message that
restores the former role and accessible name of a stale element, so that part of
the technique's first canonical case is unmeasured here. The replay used one
browser build and one driver version; a different driver's wording is exactly the
drift the pin exists to catch, not one it has already caught. The full free suite
was not run, and a bundle build of the server failed to resolve a driver-internal
module in this checkout, so only the new and existing error-handling tests ran.

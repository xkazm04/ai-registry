---
layer: application
type: application
subject: engine-integration-safety
technique: crash-truncated-batch-resume
stack: node
status: forged
verified_on: 2026-10-01
verified_against: node@24
applied: code
ab_verdict: better
---

# The grouped boot that starved the tests behind its crasher

Realized in `src/lib/test-gate-runner/batchAutomation.ts` in the PoF repo, the module that
runs every automation gate of a drain pass inside ONE headless editor launch. `node@24` is
witnessed by the tree's `@types/node` pin (`^24.13.3`) and the machine that ran the proof
(v24.14.0). Pre-change behaviour is the tree at `88f1b080`; post-change is `9a64fd4b`.

## What the tree did before

The structured report the editor writes at its own end is the preferred source of per-test
verdicts. When it is missing, the module falls back to scoping the combined log per test.
A test with no result of its own in that log was mapped to the same state as a test nobody
had registered: status deferred, reason "planned", plus a note offering a scaffold.

The log reader already had the marker: `src/lib/ue-automation/abslog.ts:28 "const FATAL_RE = /Fatal error/i;"`.
It was consulted for a single-test run, where the same crash became a failure
(`src/lib/test-gate-runner/batchAutomation.ts:57 "if (f.listedTestSet && !f.completed && !f.fatal)"`).
The batch path never consulted it. So the two paths disagreed about one input, a log with an
enumeration line and a fatal marker: the single path said "failed", the batch path said "planned".

The consequences compound because of how the drain is built. Every pass re-collects all
deferred rows and sends them to one grouped launch (`src/lib/test-gate-runner/drain.ts:80 "export function collectDeferred"`).
A crash at position 3 of 6 therefore left positions 3-6 deferred, the next pass re-ran them with
the crasher first, and the editor died at the same place again. The tests behind it never ran,
and each carried the scaffold note (`src/lib/ue-test-scaffold/generate.ts:141 "planned — scaffold available"`),
an invitation to author a duplicate of a test that exists.

The launch's own end was also invisible to the caller. The watchdog wrapper keeps only whether
it fired (`src/lib/test-gate-runner/spawnExecutor.ts:62 "child.on('exit', () => { clearTimeout(timer); finish(false); });"`),
so a crash and a clean finish return the same shape. The log, not the exit status, has to carry
the cut, which is the technique's step 1.

## What the change does

- `src/lib/ue-automation/abslog.ts:136 "export function readInterruption"` reads a fatal marker as
  a crash and the watchdog as a hang. The exit code is never consulted.
- `src/lib/ue-automation/abslog.ts:150 "export function testRunningAtCut("` finds the culprit: the
  nearest line before the cut that names exactly one requested test, accepted only if that test
  has no result of its own.
- `src/lib/test-gate-runner/batchAutomation.ts:196 "function interruptedVerdict("` keeps the
  deferred status and changes the reason and destination: "not reached", no scaffold note.
- `src/lib/test-gate-runner/batchAutomation.ts:291 "resumes >= maxResumes || !progressed"` is the
  resume loop with its crash-loop breaker; the cap
  (`src/lib/test-gate-runner/batchAutomation.ts:176 "DEFAULT_MAX_RESUMES = 3"`) is 3.

## The paired proof

`src/__tests__/lib/test-gate-runner/crashTruncatedBatch.test.ts` models the editor with an
injected spawn that writes the log and report an editor would leave. Same input on both arms:
six tests, a deterministic crasher at position three, three drain passes.

| | tests with a real verdict | existing tests labelled "planned" | launches |
| --- | --- | --- | --- |
| A, before | 2 of 6 | 4 | 3 |
| B, after | 5 of 6 | 0 | 4 |

The target moved and the cost is one extra launch over three passes. The floor held: a clean
batch still costs exactly one launch (asserted); a genuinely unregistered name still reads
"planned" with the scaffold note on one launch (asserted); the 528 tests in the surrounding
suites (runner, log reader, scaffolder, harness) pass, typecheck and lint are clean.
`ab_verdict: better` is therefore read against two declared numbers, not one.

## What this realization cannot do

- **The editor is simulated.** The log vocabulary (`Fatal error`, a start line naming the test,
  `Result={Success} Name={...}`) is borrowed from the tree's existing fixtures. There is no real
  engine crash log anywhere in the tree to anchor it on, so the proof establishes the
  classification and resume logic, not the engine's real log format. Whether a real crash writes
  a start line that names exactly one requested test is unmeasured; if it does not, the culprit
  is unidentified and the resume simply does not exclude it, which the progress guard then
  bounds. The instrument that would settle it is one captured real crash log from a deliberately
  crashing test.
- **The suspect does not persist.** A crasher stays `deferred`, but the count of how often it has
  died lives nowhere, so step 8 (act on a repeat, not on a first sighting) is not enforced; every
  pass spends one launch re-confirming a known crasher alone.
- **A teardown fault with no report is read as a cut.** Pinned by a test: the unregistered name
  costs one bounded resume and ends correctly labelled. The proper fix is a batch end sentinel
  the editor itself emits, which the tree does not have.
- **The exit code is still discarded.** A launch ended from outside, with neither a fatal marker
  nor a watchdog, is invisible to this path and still reads as the zero-match it always did.

---
layer: application
type: application
subject: automated-screening-fairness-gates
technique: defense-in-depth-recheck-at-the-apply-boundary
stack: node
status: forged
verified_on: 2026-10-31
verified_against: node@24
---

# Re-asserting the fairness invariant at the TypeScript apply boundary

The decision is computed in Python (`pipeline/jobfit/automation.py`, `evaluate_entry`)
and applied in TypeScript (`app/_lib/automation-pass.ts`). Between them is a JSON
contract, and until `app/_lib/automation-fairness.ts` existed the apply side executed a
Python `action: "reject"` verbatim. Its header states the failure that motivated it:
"any Python regression that emitted a reject for an early-career candidate, an unscored
entry, or a score at/above the reject floor would be auto-applied, silently violating the
fairness guarantee".

## The re-derivation

`app/_lib/automation-fairness.ts:52` — `assertAutoRejectFair(entry)` — re-derives the
sole legitimate reject path from the entry snapshot the pass already holds, checking four
things in order and returning `{allowed:false, reason}` for each failure:

1. **missing entry** → refused, with the reason "entry not found for fairness re-check —
   auto-reject refused (fail closed)". A decision for an id that was never sent is not
   permission.
2. **fairness-protected archetype** → refused, and the reason distinguishes the two
   cases, because they are different defects: an early-career archetype that is shielded
   by membership, versus an unknown or renamed archetype shielded by failing closed. It
   asks the live registry (`const live = readLiveArchetypes()`, then
   `live.isFairnessProtected(entry.archetype)` and `live.isKnown(...)`,
   `automation-fairness.ts:56-61`), the same reader the screening wave guards its
   auto-reject with (`app/_lib/screen-wave.ts:164`, `:234`). The live reader
   (`app/_lib/archetype-live.ts:75-82`) is a union: the bundled gate, the runtime
   registry file an operator can edit, and fail-closed for an id neither knows.
3. **unscored entry** (`score === null || score <= 0`, `:63-69`) → refused: "an absent /
   null / 0 score means matching has not produced a genuine result ... `evaluate_entry`
   holds it for matching rather than reading it as 0 and rejecting, so we must too."
4. **score at or above the floor** (`:70-72`) → refused as not an auto-reject at all.

Only after all four does it return `{allowed: true}`. Nothing is read from the request
except the entry id used to look the candidate up (`automation-pass.ts:452`, `:632`);
the caller cannot assert its own clearance.

## The mirrored constant, and how it is kept safe

`automation-fairness.ts:32` declares `BAU_REJECT_SCORE = 40` as a mirror of Python's
`POLICY["bau_reject_score"]`, with the direction of safety written next to it
(`:27-30`): "This is a backstop CEILING — a reject at/above it is refused — so it must
stay >= the Python floor. Both are 40 today; if the Python floor ever rises, raise this
with it or this backstop will spuriously downgrade legitimate Python rejects." The
TypeScript side pins the value (`automation-fairness.test.ts:96-100`,
`assert.equal(BAU_REJECT_SCORE, 40)`). The Python side has no direct `== 40` assertion:
`test_automation.py` pins the floor indirectly, through a golden digest over the scores
`(None, 0, 35, 39, 40, 60, 80)` (`:273-291`), which moves if the floor does. That is
weaker than the technique's "pin from both sides", and it is the only reason the mirror
is tolerable.

## Downgrade, never drop, never apply

`automation-pass.ts:27-35` is the comment for "THE single encoding of the
fairness-backstop downgrade"; the function it describes, `applyFairnessVerdict`, sits
at `:101-120`, with other helpers between the two. The dry-run preview (`:632-633`) and
the commit path (`applyPassDecisions`, exported at `:383`, checking at `:452` and
`:461`) share it. On a refused verdict it downgrades the decision to `hold`, sets
`outcome = "fairness_blocked"`, rewrites the reason, appends a deduplicated alert, bumps
`summary.held`, and returns true. The comment says the `preview` flag "selects only the
'would be refused' vs 'refused' wording ... every other byte is identical across the two
callers". That is not quite so: the structured `reasonCode` differs too
(`preview ? "fairnessWouldRefuse" : "fairnessRefused"`, `:110`). The parity holds for
behaviour, and the wording differs in two fields, not one.

The repo then goes past the standard's floor. A fairness-cleared reject is not applied
either: it is queued as a held `rejection_review` for a human click, "unconditionally"
(`:400`, `:457`, and the preview at `:634-641`), so `summary.rejected` stays 0 in every
committed run. The comment names the bug that produced the rule: the preview used to
forecast `rejected += 1`, so "the recruiter was shown N rejections and got 0 rejections
+ N approval cards". A cleared reject the recruiter leaves unticked in the approval step
is held back as declined and not queued (`:464-467`, `:486-498`).

## The refusal is an event

The downgrade appends `FAIRNESS_GATE_BLOCKED_REJECT` (`= "fairness_gate_blocked_reject"`),
defined once at `app/_lib/decision-attribution.ts:201` and re-exported under an alias by
`automation-pass.ts:21` (`export const FAIRNESS_BLOCKED_REJECT_ALERT =
FAIRNESS_GATE_BLOCKED_REJECT;`), "sourced from the shared AUTOMATION_ALERT_KINDS set ...
so the writer and the attribution map can never key it differently". The decision
outcome `fairness_blocked` (`decision-attribution.ts:221`) lets the audit surface
attribute the resulting hold to the automation's refusal rather than to whoever
triggered the pass. Alerts are deduplicated per workspace, entry, kind and business day
(`hasEventToday`, `app/_lib/db/pipeline.ts:3495-3501`), now through
`recordDecisionAlerts` (`automation-pass.ts:348-377`), and the dry run applies the same
gate as a pure read so it forecasts exactly the number of alerts a commit would write
(`:646-650`).

## Deviations

- **Not in the long-horizon record.** The refusal is written as a `pipeline_events` alert
  row (`automation-pass.ts:374`) and in the run's decision list. The pass makes no
  `sealDecision*` call, so the refusal never enters the tamper-evident decision-record
  chain, which is the store with a disclosed retention. There is no dedicated export.
- **The event does not name what the technique asks it to.** The write passes no actor,
  so the proposer is null (rendered honestly as unknown, never as a person). The four
  refusing rules share one kind and are told apart only in prose
  (`AutoRejectVerdict = { allowed: false; reason: string }`, `automation-fairness.ts:43`),
  and the score, confidence and policy in force are not on the event.

  Re-checked 2026-10-31 at kp@6edf5d7e6: the first two halves of this deviation are
  resolved. Since `304efa7d3` (2026-10-14) the blocked-reject event is written with the
  actor `FAIRNESS_PROPOSER = "auto:policy-pass"` (`automation-pass.ts:25`, used at `:374`),
  and the verdict carries a stable `rule` id (`AutoRejectRule`, `automation-fairness.ts:41`:
  `entry-missing`, `protected-cohort`, `unknown-archetype`, `unscored`, `at-or-above-floor`)
  that `applyFairnessVerdict` persists in the decision's `reasonParams` beside
  `proposed: "reject"` (`:113`). The score, confidence and policy in force are still not
  on the event.
- **The unscored check fails open on values the type forbids.** `score === null || score
  <= 0` lets `undefined`, `NaN` and `0.5` through to the floor comparison, and a missing
  key is exactly what a contract drift produces. Python holds all three (`int(None or 0)`
  and `int(0.5)` are both 0). `typeof score !== "number" || !Number.isFinite(score) ||
  score < 1` would fail closed on every one.
- **Routine refusals.** Python relabels a null or unregistered archetype as `bau` (see the
  fail-closed application), so this backstop refuses such proposals as a matter of
  course, and "a non-zero count here means an upstream regression" (`:16-19`) no longer
  holds.

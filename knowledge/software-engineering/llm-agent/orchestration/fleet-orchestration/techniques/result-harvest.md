---
layer: technique
type: technique
subject: fleet-orchestration
technique: result-harvest
status: forged
laws: [failure-not-empty-success, count-carries-predicate, one-validation-door]
shared_with: []
use_when: [deciding whether a run finished or only looks finished, a session says done but its drop point is empty, choosing a deadline or quorum to close a wave, an unattended headless run exits cleanly without its declared result]
---

# Result harvest

Harvest is the phase that makes a fleet run a *computation* instead of a
crowd: the orchestrator collects each session's result, classifies every
member of the dispatch roster into a terminal account, and composes the
run-level answer. The defining commitment is **accountability over
optimism** — a harvest never reports what came back without also reporting
what did not, because the most expensive fleet failure is the run that looks
complete while a third of it silently never happened
([failure ≠ empty success](../../../../_laws.md#failure-not-empty-success)).

## The result contract

Harvest is only as good as what sessions hand it, so the result is a
contract set at dispatch, not a scavenger hunt run afterwards:

- **A declared drop point.** Each session's task states where its result
  goes — a structured document at an agreed path in its write set, a record
  appended to a run ledger, a final structured event on its output stream.
  The orchestrator reads declared drop points; it does not grep transcripts
  and hope. Scraping a session's free-form output for its conclusion is the
  harvest-layer equivalent of parsing logs for state: it works until the
  phrasing drifts.
- **A validated shape.** Results pass one validation door on ingestion —
  schema-checked, size-bounded, attributed to the session identity and run
  identity they claim ([one door](../../../../_laws.md#one-validation-door)). A
  malformed result is itself a finding: it is classified as such, kept for
  diagnosis, and never silently coerced into the aggregate.
- **Failure is a result.** The contract gives sessions a way to report "I
  could not do this, and here is why" as first-class output. A session that
  can only succeed or vanish forces the harvest to infer every failure,
  and a report and an independently corroborated observation carry different
  provenance; neither is automatically more accurate.
- **Keep declared reports separate from synthesis.** A session's
  summary in the aggregate is the completion it actually declared through
  the contract, or a clearly attributed summary of it. Synthesizing a summary from the session's last
  observed state ("it went quiet after editing three files, so: done?")
  launders inference into the place reserved for reports, and the aggregate
  loses the one distinction the whole accounting exists to preserve.

## Roster accounting: every member ends somewhere

The dispatch roster (see [parallel-dispatch](./parallel-dispatch.md)) is the
harvest's checklist. For each member, exactly one terminal account:

- **completion claimed, result ingested** — the report passed shape validation;
  acceptance is a separate held/failed/unverified verdict against the artifact.
- **completion claimed, result missing** — the session says it finished, but the
  drop point is empty or unreadable. A distinct class, because it indicts
  the contract or the session's compliance, not the work.
- **failed, reported** — the session's own account of why.
- **lost** — the fleet's inference (sweeper or recovery), with which
  inference path attached.
- **timed out / cut off** — the straggler policy fired; whatever partial
  output existed at the cut is preserved and labeled partial.
- **never started** — queued but not admitted before the run closed.

The run summary is these counts *with their predicates*: "run R dispatched
11; 7 claimed-with-results, 1 claimed-without, 2 failed (named), 1 timed
out at the straggler deadline" is an accounting; "mostly done" is not
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). The
arithmetic invariant is total: accounts sum to the roster, always — a member
that fits no class is a bug in the harvest, and it should fail loudly rather
than be dropped from the denominator.

## A clean exit without the result is resumed before it is classified

One account has a recovery the others lack, and it arises from how a one-shot
headless session ends. Run unattended, the session's process lives exactly as
long as the model's turn: when the model ends its turn, the run is over. That
includes a turn the model ends to *wait for* something it started in the
background. Interactively, the background process finishing would arrive as the
next turn; headless, there is no next turn. The process exits with success, the
work is half done and uncommitted, the background job's failure goes unread, and
the roster sees a member whose exit was clean and whose drop point is empty.

One fleet hit this three times in three days, across three model families, which
settles two things about it:

- **It is not one model's quirk.** A workaround per engine is the wrong layer.
- **A sentence does not fix it.** After the session's instructions forbade
  ending a turn while a process ran, the same failure recurred in the next task,
  sixty-four turns in. This is the out-of-process form of
  [continuation-as-state](../../session-continuation/techniques/continuation-as-state.md):
  the fact that the run is unfinished has to live where the *runner* reads it,
  because the runner is the only party still awake when the session has exited.

So the recovery belongs to the runner, keyed on the declared drop point:

1. **Trigger on the exact conjunction:** exit success, declared result absent,
   and a resumable session identity captured from the first run's structured
   output. A failing exit is a failure to classify, not a stall to coax. Without
   a session identity, a "resume" is a fresh session with no memory of the work,
   which is a re-dispatch with its own cost and must be accounted as one.
2. **Resume the same session with a short, fixed continuation prompt** that names
   the likely cause and the exit condition: check whether the process it was
   waiting on finished by reading its log, wait for it in the foreground if it is
   still running, finish the remaining steps, verify, and write the result. The
   same session keeps the context of what it already did. A fresh session
   would redo that work or contradict it.
3. **Bound it, and stop early on exhaustion.** A small fixed count (that fleet
   allowed two) caps the cost of a session that will never produce the artifact.
   Skip the continuation when the run's output shows a quota or balance limit,
   because resuming into an exhausted account only produces another empty exit.
4. **Account for every continuation.** A member that needed continuations ends
   as *completed after N continuations*. A member that used them all ends as
   *exited clean, result missing after N continuations*. Neither is folded into
   ordinary success. The rescue rate is the number that says whether the bound
   is right, and only these accounts can produce it.

The continued session's result passes the same ingestion door and the same
acceptance verdict as any other
([completion-claim-verification](./completion-claim-verification.md)). The
continuation recovers the missing artifact. It does not certify what that
artifact claims.

**What is not known yet is the rescue rate.** The fleet that built this checked
that the resumed session keeps its context. It did not measure how often a
continuation then produced the artifact. Until someone measures it, the bound is
a guess. The accounts in step 4 are how to measure it.

**Do not continue a session that reported failure through the contract.** It
has said what happened, and a continuation would argue with its report. A drop
point that exists but fails validation is a malformed result, not a missing one,
and it is classified as such.

## Stragglers get a policy, not a vigil

A wave's completion time defaults to its slowest member, and its slowest
member is sometimes dead in a way nothing has noticed yet. The straggler
policy is declared at dispatch:

- **A deadline, always.** Per-member and/or per-run; infinite patience is
  not a policy, it is the absence of one.
- **A quorum option.** Many runs are useful at N-of-M: the harvest can
  close, publish the aggregate as partial-by-policy, and leave the
  stragglers running with their results marked late-arriving. Whether late
  results amend the published aggregate or file separately is decided when
  the policy is written — amending a number someone already acted on is a
  correction event, not a silent update.
- **Cut-off is a lifecycle act.** Enforcing the deadline goes through the
  registry's transition machinery (and, mechanically, through the sibling
  subject subprocess-lifecycle's termination path) — the harvest never
  reaches around the state machine to kill things privately.

## Aggregation: composition is the orchestrator's work

Above accounting sits the actual synthesis: N per-session results into one
run-level product — a merged report, a ranked list, a pass/fail verdict over
the whole. Principles:

- **Aggregate from validated results only,** with the accounting attached to
  the product. A synthesis over 7 of 11 must say so on its face; consumers
  of the aggregate inherit the roster math whether or not they are shown
  it, so show it.
- **Preserve provenance through the merge.** Every claim in the aggregate
  remains traceable to the session that produced it. Fleet outputs feed
  review processes and downstream decisions (often through a human gate —
  see [hitl-approval](../../hitl-approval/hitl-approval.md)), and an
  unattributable claim in a merged report is unverifiable exactly when
  someone finally questions it.
- **Partial failure is a first-class product shape.** The consumers of a
  run — a dashboard, a follow-up dispatch, a person — get a structured
  partial (what exists, what is missing, what is still possible) rather
  than a choice between a false success and an unhelpful total failure.
  Whether the missing fraction is retried rides on the retry discipline of
  [retry-backoff](../../../../backend-platform/resilience/retry-backoff/retry-backoff.md); the harvest's job
  is to make the retryable remainder *enumerable* — which the roster
  accounting has already done.

## Harvest is idempotent and resumable

The orchestrator can crash mid-harvest like it can crash anywhere else.
Ingestion is keyed by run, session incarnation and result revision. A repeated
key with identical content is a no-op; changed content under the same key is a
conflict, not a silently discarded correction. Late revisions follow the declared
amendment policy; the run's accounting state persists
with the fleet's durable state (see
[durable-fleet-state](./durable-fleet-state.md)); and a restarted orchestrator
finishes the harvest from the roster rather than re-deriving it from whatever
outputs it can still find. The roster is the memory of what was promised;
harvest completes against promises, not against discoveries.

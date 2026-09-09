---
layer: golden-path
type: golden-path
subject: session-continuation
status: forged
use_when: [an agent stops after a positive review verdict or a partial result, designing a keep-working mode for a coding-agent harness, a cancelled session keeps blocking the operator, deciding what must survive a context compaction, a multi-stage autonomous run has to resume safely]
techniques:
  - continuation-as-state
  - single-loop-authority
  - ordered-yield-composition
  - advisory-guard-fail-mode
  - ordered-teardown
  - compaction-checkpoint
  - sealed-stage-advance
  - stuck-loop-detection
---

# Session continuation

For an authorized task that requires several turns, a harness can keep working
after an intermediate result instead of requiring repeated requests to continue.
The continuation policy must also return control when work is complete, cancelled,
blocked on required input, out of budget or unable to proceed reliably. Persistence
is useful only while there is authorized, feasible work left to do.

This subject owns the loop inside one session. Fleet orchestration owns dispatch
across sessions; subprocess lifecycle owns process handles; instruction files
deliver project rules; durable agent operations owns recovery of interrupted
effects. A continuation hook does not grant tools, approve execution, or guarantee
that the model makes progress. Verify that the target harness exposes a suitable
boundary; a host can terminate independently of a plugin's stop decision.

## Keep authoritative control outside a lossy summary

Store the accepted task, completion predicate, owner/run identity, control revision,
cancellation state and resource bounds where the harness can re-read them. Prompt
text can explain the task, but is not the sole control record. Isolate records by
session and run so an unrelated conversation cannot inherit a mode from a shared
directory. Use a lease or explicit lifecycle policy appropriate to the work.
[Continuation as state](./techniques/continuation-as-state.md) defines renewal,
yield reasons and delegated-mode boundaries.

Approval of an intermediate plan is not completion of an implementation task.
Conversely, a review-only task can end with its review verdict. A gate passing
authorizes only what its policy and the user's accepted scope actually authorize.
Do not create an implementation task from a positive review alone.

## One arbiter owns the decision

Multiple behaviors may request continuation, but one authority resolves them.
For independent claimants, explicitly refuse, adopt or keep the second advisory.
For nested behaviors, an ordered arbiter can compose requests. Neither approach
allows a child to override cancellation, a protective refusal or the overall
budget. See [single-loop-authority](./techniques/single-loop-authority.md) and
[ordered-yield-composition](./techniques/ordered-yield-composition.md).

An evaluator's completion claim remains distinct from verified acceptance.
Inspect the actual artifact or authoritative result where the task allows it;
record unavailable checks as unavailable. Transcript evidence can contain real
tool results, but a narrative assertion that tests passed is not such a result.

## Separate permission to act from permission to yield

An advisory check that cannot run must not trap the operator in a loop. Report
its failure and release that advisory block. A protective check may instead
refuse the protected action. Refusing a destructive command is different from
refusing an explicit request to stop the agent. Declare class, event, failure
direction and timeout behavior in the installed hook registration.
[Advisory guard fail mode](./techniques/advisory-guard-fail-mode.md) explains why
unknown hooks cannot silently default to a harmless class, and why ending a wait
does not necessarily terminate a handler.

## Cancellation wins over re-arming

Use one cancellation coordinator that knows all continuation guards. Persist
cancellation or invalidate the control generation before dependent cleanup;
renewals must compare against that generation atomically. Stop local admission
immediately even if persistence fails, report the incomplete durable cancel and
keep retryable cleanup state. A mode handoff deactivates only the predecessor;
it does not cancel the successor. See
[ordered-teardown](./techniques/ordered-teardown.md).

## Restore current state across compaction

Persist control at meaningful transitions, not solely at a pre-compaction hook.
Restore by run identity, generation and the actual start reason. A stale snapshot
must not resurrect a cancelled run or reset budget and failure counters. A
model-writable note can preserve working hypotheses, but cannot re-arm authority.
[Compaction checkpoint](./techniques/compaction-checkpoint.md) covers the two
channels and the case where the host exposes no compaction event.

## Advance stages using provenance and acceptance

Pin the selected stage definition and declared inputs in a run descriptor.
Closed profiles are a useful scope limit, not the only safe workflow design.
Validate stage evidence against the current run and activation token, then check
the stage's actual acceptance predicate. A phrase in a correctly sourced assistant
record identifies a claim, not proof of its truth. Atomically update the expected
tracking revision, record acceptance and schedule the next stage through a
recoverable delivery mechanism. See
[sealed-stage-advance](./techniques/sealed-stage-advance.md).

## Detect stagnation without removing hard limits

Use failure signatures, measured progress and restart counts to identify work
that needs a changed approach or outside input. Different errors do not by
themselves prove progress; repeated errors do not prove every hypothesis is
exhausted. Keep absolute time, attempt and spend bounds independently of those
signals. [Stuck-loop detection](./techniques/stuck-loop-detection.md) covers
counter resets, evidence handoff and crash-resume limits.

## Acceptance

- An intermediate verdict continues only the remaining accepted task.
- Required input, explicit stop and exhausted budgets have honest yield states.
- Unrelated sessions and delegated workers cannot accidentally inherit authority.
- Cancellation defeats stale renewal and checkpoint replay.
- Hook failures preserve the declared action/yield distinction and remain visible.
- Stage claims cannot skip acceptance or advance more than one expected revision.
- Resume preserves limits and does not repeat external effects without a recovery contract.

Test these against the actual harness boundary. A prompt-only simulation or a
design document is not evidence that a shipped stop hook enforces them.

---
layer: technique
type: technique
subject: live-test-consent-and-evidence
technique: undo-even-on-uncertain-response
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [writing a live test that changes state on the platform, handling a timeout or unparseable response from a moderation call in a test, cleaning up after a live test run]
---

# Undo even on uncertain response

A live test that bans, times out, pins, creates or changes something on the platform
leaves that change behind unless it undoes it. Undoing after a confirmed success is
obvious; the technique is about the other outcomes. A timeout, a dropped connection, a
server error, a response that could not be parsed — each leaves the platform's state
**unknown**, and the action may well have landed. The rule is that every outcome except a
definite refusal runs the compensating action.

## Why uncertain is the dangerous case

Platform calls are not transactions the client can observe. A request can be applied and
its response lost; a request can be applied after the client's own timeout fired; a
server error can be raised by a layer behind which the change already committed. A harness
that maps every non-success to "nothing happened" leaves the test account banned or the
poll open in exactly those cases. The next run then fails for a reason unrelated to the
code under test — the target is already banned — and the failure is diagnosed as a
platform change, which is the worst kind of false finding a live suite can produce
([law: unmeasured-is-not-pass](../../../../_laws.md#unmeasured-is-not-pass)).

## Three outcomes, not two

Classify every response to a state-changing call:

- **Applied** — a success status, parsed. Undo.
- **Refused** — a definite, parsed refusal that the platform documents as leaving state
  unchanged: missing permission, invalid target, already in the requested state. Do not
  undo, but record whether "already in the requested state" means a previous run leaked.
- **Uncertain** — everything else. Undo.

The compensating action must be safe to run when there is nothing to compensate. Unbanning
an account that is not banned, ending a poll that does not exist, unpinning nothing: the
platform answers with a refusal of its own, and the harness treats that refusal as "state
is now clean" rather than as a test failure. Where the undo is that cheap, the simplest
correct harness skips the classification and **always** undoes, whatever the action
returned; the classification earns its keep only when the undo is expensive or itself
risky.

## A clean undo does not rescue the step

The test ran the action to observe something: that the platform accepts the call, with
this credential, on this target. An uncertain response means that observation was not
made. So the step fails — "action unconfirmed, undo requested" — even when the undo was
confirmed and the account is clean. Treating "restored" as "passed" records an action the
platform may never have applied as verified behaviour. Only an applied action followed by
a confirmed undo is a pass, and the two are recorded as separate entries in whatever log
the tool keeps of actions it took.

## The undo is part of the result

Run the undo in a block that executes whatever the test body did — an assertion failure,
an exception, an interrupt — and record its outcome next to the action's. An undo whose
own response is uncertain is retried a bounded number of times and then raised as a
finding the operator sees at the end of the run: the test account may still be banned,
check the channel. Reading the target's state back from the platform after the undo,
where an endpoint exists for it, turns "probably clean" into an observation.

Before each run, check that the owned targets start clean. A target that is already
banned, timed out or otherwise altered is evidence that an earlier undo did not complete,
and the run stops rather than piling a new test on an unknown state.

## Procedure

1. For each state-changing live call, write its compensating call and make it tolerant of
   a no-op.
2. Classify responses as applied, refused or uncertain; undo on applied and uncertain.
3. Put the undo in a guaranteed-cleanup block and record both outcomes.
4. Read the target state back after the undo when the platform offers a way to.
5. Pre-flight every run by confirming the owned targets are in their clean state.

## Decision rules

- **When the response is not a definite refusal, undo.** Doubt is resolved toward
  cleanup.
- **When the undo itself is uncertain, surface it to the operator by name.** Never end a
  run green with a target in an unknown state; tell the operator exactly what to check on
  the platform.
- **When the action was uncertain and the undo clean, fail the step.** The account is
  safe; the claim is unobserved.
- **When an action is irreversible in a test, do not escalate it.** A test that times out
  and undoes does not retry, and never escalates to a longer or permanent action because
  the first one was unclear.
- **When a target starts dirty, stop.** Clean it under supervision before running again.
- **When an action has no compensating call** — a message that cannot be deleted, a
  notification that cannot be recalled — make the test write only the fixed marker, and
  accept that it stays.

## When not to use it

Read-only calls change nothing and need no undo. Hermetic twins replaying recorded
responses need the classification logic tested, not executed against the platform. And
the technique does not license destructive tests whose undo is impossible on accounts that
matter; those tests do not run live at all.

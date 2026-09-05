---
layer: technique
type: technique
subject: job-coordination
technique: in-flight-is-a-position
status: forged
laws: [record-precedes-effect, unknown-is-not-a-value, silent-state-is-ungoverned]
shared_with: []
use_when: [recovery cannot tell whether a step ever started, a non-idempotent step sits at the frontier and the far side honours no idempotency key, deciding whether the recovery sweep may re-run the last step, a step's re-run safety must survive the deploy that happens during the crash]
---

# In-flight is a position

A checkpointed job records where it is. Ask what the recorded position
actually says at the moment a process dies, and the answer is thinner than it
looks: position `N` means *step N has not completed*. It does not say whether
step N was ever dispatched. "Never started" and "started, ran, and nobody
lived to report the outcome" are the same durable value.

That conflation is the reason
[step-position-and-resumability](./step-position-and-resumability.md) can only
promise **at-least-once per step**, and the reason its ordering rule — effects
durable first, position write second — is the right rule *given two position
values*. With two values there is no other choice. Recovery arrives, sees
position `N`, and must assume the worst in the safe direction: re-run.

The technique is to give the position a third value. Before dispatching the
step, commit **`in-flight`** — a durable value distinct from both *pending* and
*complete*, carrying the identity of the effect about to be attempted and its
declared re-run disposition. After the effect settles, commit the outcome and
advance. Now recovery reads a decision instead of making one.

## The three values and what each licenses

| Position value | What the record proves | Recovery's move |
|---|---|---|
| `pending` | the effect was never dispatched | start it — this is not a re-run |
| `in-flight` | the effect was dispatched; the outcome is unknown | consult the declared disposition |
| `complete` | the effect settled and its outcome is recorded | advance |

The middle row is the entire technique, and it is the row two-valued designs
do not have. It is
[record-precedes-effect](../../../../_laws.md#record-precedes-effect) applied
at the recovery grain rather than the accountability grain: the law is normally
read as *write the audit line before the response leaves*, and it is usually
satisfied by a record that says an attempt is authorised. This says the record
must also distinguish **authorised** from **attempted**, because a sweep that
cannot tell them apart is holding an absence of evidence and is about to spend
it as a verdict ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## What it buys that the declared-idempotency ladder cannot

step-position-and-resumability asks each step to declare its re-run behaviour,
and for the honestly non-idempotent case — an external charge, an irrevocable
send — it offers three repairs: put an idempotency key in front of the effect
that the far side honours, restructure so the irrevocable part is the final
smallest step, or accept duplicate cost in writing. All three are real, and all
three are unavailable in the same situation: **the far side is somebody else's
system and it dedupes nothing.** A shell command that deletes files, a
partner API with no idempotency header, a physical actuator. The ladder's
bottom rung is then "accept duplicate cost", and duplicate cost is what the
job was designed to avoid.

The third position value is the fourth repair, and it needs no cooperation from
anyone. Nothing about the effect changes; only the record does. The cost is
paid in a different currency: **the step's outcome becomes unknown rather than
duplicated.** A job that would have deleted the files twice now has one step
whose result is honestly indeterminate, and
[indeterminate-closure-on-interruption](../../../../llm-agent/runtime-and-io/agent-runtime-assembly/techniques/indeterminate-closure-on-interruption.md)
owns what is written into the record at that point and how it is said to
whatever reads it next. That technique's case analysis — a side-effecting call
requested and never reported is indeterminate; work that was never started is
merely unstarted and can simply be started — **presumes exactly this
distinction and does not say what produces it.** This is what produces it.

Note also what changes for
[terminal-state-recovery](./terminal-state-recovery.md). Its sweep issues
*park* for "a non-idempotent frontier step, ambiguous partial state" — a
correct verdict when the state really is ambiguous, and an unnecessary one when
it is not. With the third value the frontier step is not ambiguous: the record
names it, the disposition is attached, and the sweep resumes the job instead of
queuing a human. Park stops being the default for non-idempotent work and
returns to what it is for — decisions the record genuinely does not contain.

## The disposition is data, not an inference

The value written at dispatch carries the step's re-run disposition explicitly,
because the sweep must not re-derive it. Two properties make the difference
between a mechanism and a comment.

**It is written by the step's author, at dispatch, in the record.** A recovery
sweep inspecting a step to guess whether it was safe has reintroduced the
guess. The declaration travels with the in-flight marker so that the code
making the decision reads it rather than reasons about it.

**It is re-checked against the current declaration before it is honoured.** The
crash and the recovery are separated by an unbounded interval, and deploys
happen inside it. A step that declared itself re-runnable last week may have
grown a side effect since. So the safe path requires *both* the stored
disposition and the currently declared one to say re-runnable; disagreement, or
a declaration that has disappeared entirely, falls back to the unsafe path and
closes the step as indeterminate. Trusting the stored value alone is the defect
this rule exists to prevent, and it is invisible in every test that does not
redeploy between the kill and the restart.

## Where the marker must live

The in-flight value is subject to the same trap that
[step-position-and-resumability](./step-position-and-resumability.md) names for
marker-guarded steps: **a marker in a different store than the record it
qualifies can straddle a crash**, which recreates the ambiguity it was added to
remove. The in-flight write belongs in the same transaction and the same store
as the position it refines. If the job record is a row, it is a column on that
row, not a key in a cache.

Two consequences follow, and both are cheap:

- **The dispatch write and the effect must not be separated by anything that
  can fail silently between them.** This is
  [no-unrestorable-state-at-a-suspension-point](./no-unrestorable-state-at-a-suspension-point.md)
  on the smallest possible span, and it is the one span where that technique
  and this one are the same instruction.
- **The in-flight value is deleted by the transaction that records the
  outcome**, never by a later cleanup. A marker that outlives its effect is a
  step that resumes as indeterminate forever, which is
  [silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)
  with an extra step.

## When two values are correct

This is not free and it is not always right. Every step pays one extra durable
write on the hot path — the position advances twice per step instead of once —
and for a job whose steps are all naturally idempotent that write buys
literally nothing, because re-running was always safe and the sweep never needed
to consult anything. **Spend the third value only on the steps whose
disposition is not re-runnable**, and let the rest advance on the two-valued
protocol; the position vocabulary is per-step, not per-job. A job of entirely
keyed or converging steps is correctly served by the existing rule, and adding
in-flight markers to it is ceremony with a latency cost.

The other case for two values is a system that genuinely prefers duplicates to
unknowns. Some do, honestly: a duplicate notification is an annoyance and an
unknown one is a support ticket. That is a real trade and it should be recorded
as one — what this technique refuses is arriving at at-least-once by default,
because the position vocabulary was never given the value that would have
allowed the question to be asked.

## Decision rules

- Before adding an idempotency key or restructuring a step, check whether the
  cheaper repair applies: record the dispatch, and let recovery read it.
- Write `in-flight` before the effect and delete it in the transaction that
  records the outcome. Same store, same transaction as the position.
- Carry the step's re-run disposition in the in-flight value; do not let the
  sweep infer it.
- Honour a re-runnable disposition only when the stored and currently declared
  values agree. On disagreement or absence, close the step as indeterminate.
- Where the record names an in-flight step, the sweep resumes; reserve *park*
  for the states the record genuinely does not resolve.
- Spend the third position value per step, on the steps that are not
  re-runnable. Leave idempotent steps on the two-valued protocol.

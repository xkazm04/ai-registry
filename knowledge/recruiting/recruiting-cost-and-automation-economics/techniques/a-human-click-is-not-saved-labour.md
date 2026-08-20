---
layer: technique
type: technique
subject: recruiting-cost-and-automation-economics
technique: a-human-click-is-not-saved-labour
status: forged
laws: [say-only-what-the-record-holds, every-decision-names-its-actor, no-adverse-outcome-is-solely-automated]
use_when: [deciding whether an assisted action counts as a saving, valuing a drafted output a human reviews, auditing which recorded events feed an efficiency claim]
shared_with: []
---

# A human click is not saved labour

When a system produces something a person then reads, edits and approves, the
labour saved is the difference between doing the task and reviewing the
output — not the whole task. An event log that records "generated" and
"approved" is recording two things a human was involved in, and counting the
generation as a full saving values the human's remaining work at zero.

This is the most common inflation in an automation-economics model, and it is
usually accidental. The event that is easy to count is the one the system
emitted. The work that is hard to count is the reading, the judgement, the
edit and the decision to accept — which happen in a person's head and produce
one recorded click at the end. The click looks free. It is not; it is the
visible tip of the part of the task that was never automated.

There is a second reason this matters beyond arithmetic. In hiring, human
review is frequently not optional — a consequential decision about a person
requires a human actor with real discretion
([no adverse outcome is solely automated](../../_laws.md#no-adverse-outcome-is-solely-automated),
[every decision names its actor](../../_laws.md#every-decision-names-its-actor)).
A saving model that values that review at zero is quietly arguing for its
removal. The economics must not create pressure against a governance
requirement, and a model that counts review as waste does exactly that.

## Three postures, three valuations

Classify every automated capability into one of three postures before
assigning it any minute value:

- **Replaces.** The task is completed and no human reads the output before it
  takes effect. Full estimate applies. In hiring this is a short list, and it
  should be — mostly mechanical steps with no judgement in them.
- **Assists.** The system produces a draft, a summary, a shortlist or a score
  that a human reads and acts on. The saving is the residual: task minutes
  minus review minutes. Where the review time has never been measured, the
  honest residual is a conservative fraction of the task, stated as such — or
  zero.
- **Records.** The system logs, transitions, notifies or schedules. No
  saving; this is bookkeeping.

The classification is per capability, not per product, and it changes over
time. A capability that shipped as *assists* and later runs unattended has
moved postures, and its minute value moves with it — but so does its
governance status, and the second change is the more consequential of the
two.

## Procedure

1. **Read the event vocabulary and mark each kind with its posture.** Where an
   event kind spans postures — the same event emitted whether or not a human
   reviewed — that is a modelling defect to fix in the instrumentation, not a
   judgement call to make in the metric.
2. **For assists, estimate review time explicitly** and record it beside the
   task estimate. Two numbers, both arguable, is far better than one number
   that has silently assumed the second is zero.
3. **Prefer measured review time where it exists.** The interval between
   presentation and approval is often recorded and is a real, if noisy,
   signal. Use its median, not its mean — an approval left open over a weekend
   is not a two-day review.
4. **Count edited-then-approved separately from approved-as-is.** They are
   different residuals, and the ratio between them is one of the most
   informative quality signals available anywhere in the system.
5. **Do not count the approval click as an action that saved anything.** It is
   the cost, not the benefit.
6. **State the posture mix wherever the saving is published.** "Nine hours,
   of which seven from assisted actions where review time is estimated at a
   third of the task" is a claim a customer can interrogate. Nine hours is
   not.

## Decision rules

- When a human must review by policy or by law, the review time is never
  modelled toward zero, however good the output becomes. The floor is what a
  responsible review actually takes.
- When an output is approved in bulk — many items accepted in one gesture —
  the review time per item is not the task's review estimate; it is close to
  nothing, and that is a signal about the review's quality, not a saving to
  book. Report it as a review-quality observation, not as efficiency.
- When approval is recorded but no human could plausibly have read the output
  in the interval, exclude those items from the saving and surface the
  pattern. A saving model that rewards rubber-stamping is building the wrong
  incentive into a hiring process
  ([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).
- When a capability's posture changes, re-estimate rather than inheriting.
  Inherited estimates are how a model drifts from defensible to flattering
  without any single dishonest step.
- When the residual cannot be estimated at all, the capability contributes
  zero to the saving and its value is argued qualitatively instead. A
  qualitative benefit stated as such is credible; the same benefit smuggled
  into a number is not.

## When not to use this

Do not use this technique to argue that assisted work has no value. A draft
that turns a forty-minute writing task into an eight-minute editing task is a
genuine and large improvement; the technique exists to book eight minutes of
remaining cost, not to deny the thirty-two.

Do not apply the residual logic to a candidate-facing wait. Time a candidate
spends waiting is a candidate-experience concern with its own discipline, and
it is not an input to the organisation's labour saving.

Do not use recorded review intervals as a performance measure of individual
reviewers. The instrumentation exists to make a cost model honest; repurposing
it as surveillance will destroy the data's usefulness within one review cycle
and deserves to.

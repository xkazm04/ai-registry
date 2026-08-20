---
layer: technique
type: technique
subject: people-analytics-ethics
technique: producer-enforced-suppression
status: forged
laws: [one-validation-door, failure-not-empty-success]
shared_with: []
use_when: [deciding where a privacy floor is applied, adding a second surface over person-level data, a suppressed value renders as zero]
---

# Producer-enforced suppression

Suppression is enforced where the data is produced — in the query, the
analyzer, the aggregation function — and never in the component that draws
it. The producer's contract is that **everything it returns is already safe to
render by any consumer, including consumers that do not exist yet.**

## The contract

- **Withheld values never leave the producer.** Not hidden, not flagged for
  the renderer to skip: absent from the payload. A name suppressed by a
  rendering condition is still in the response body, the client's memory, the
  log line, and the cache. The only suppression an inspector cannot undo is
  the one that never serialized the value.
- **Withheld is a typed state, distinct from empty and from error.** Three
  outcomes must be distinguishable by the consumer: a value, "withheld —
  floor not met", and "could not compute". A producer that returns an empty
  list for all three teaches every renderer to draw a zero, and a zero is a
  claim ([law: failure is not empty success](../../_laws.md#failure-not-empty-success)).
  Carry the reason, not just the absence; carry the floor that was not met
  where it is not itself sensitive.
- **One door.** All readers of person-level data pass through the same
  producer function. A direct query added "just for the export", a second
  aggregation written for a summary panel, a debug endpoint left enabled —
  each is a path that does not inherit the policy
  ([law: one validation door](../../_laws.md#one-validation-door)). The set of
  writers to that door must be enumerable on demand; if nobody can list them,
  the door is decorative.
- **Consumers may read the flag for copy, never to re-derive the data.** A
  published "withheld" indicator is there so a surface can say *suppressed*
  rather than *no data*. The moment a consumer branches on it to compute
  something the producer declined to emit, the floor has moved back into the
  view layer. Where the producer can arrange it, the suppressed shape is also
  self-enforcing — an empty collection that a renderer naturally draws as
  nothing — so a forgetful consumer fails safe rather than failing open.
- **Floors are constants beside the producer**, named for what they protect,
  not inlined as numeric literals in a predicate. A reviewer must be able to
  read the policy without reconstructing it from arithmetic.

## Procedure

1. **Identify every producer that touches identity.** Search for the joins,
   not the components: anything that reads an author, reviewer, assignee, or
   account column is in scope, including producers whose current callers do
   not display it.
2. **Move each floor down.** Where a component filters, drops, or hides on a
   threshold, the same predicate moves into the producer and the component's
   version is deleted — not left as a redundant second check, which is how
   two thresholds drift apart.
3. **Give absence a shape.** Extend the returned type so a withheld result is
   representable: a discriminated result rather than a nullable value. If the
   type cannot express it, the consumers will invent their own
   interpretations, and they will disagree.
4. **Render the withheld state deliberately.** One shared presentation for
   "not shown — fewer than N", used everywhere, so the reason is legible to
   the reader and the design is not re-litigated per surface.
5. **Withhold the derived label too.** Suppressing a person's name while
   publishing a label only they could hold — the single owner of an area, the
   sole reviewer, the one on-call — names them by proxy. Any field whose
   value implies an identity is subject to the same floor as the identity.
6. **Test the producer, not the page.** The test asserts that a below-floor
   input yields the withheld state and that the identifying field is *not
   present in the payload*. A snapshot test of the rendered surface passes
   while the data leaks underneath it.

## Decision rules

- **When a second consumer of the same person-level data appears, do not copy
  the filter — move the filter,** because the third consumer is already
  scheduled.
- **When a producer cannot know the floor** (it computes a fragment used at
  several grains), it is the wrong seam: push the aggregation down so the
  producer that knows the population is the one that enforces, rather than
  passing a threshold in as a parameter that a caller can set to zero.
- **When a caller asks for a floor override**, the answer is no by default,
  and where a genuine exception exists (an investigation, a subject accessing
  their own data) it is a different door with its own authorization, not a
  parameter on this one.
- **When the floor changes**, it changes in one constant and every surface
  moves together. If that is not true, step 2 was not finished.

## When not to use it

- **Non-identifying aggregates.** A producer emitting repository- or
  organization-level values has nothing to suppress; adding floors there is
  cargo cult and makes the real floors look arbitrary.
- **The subject's own private view.** A person's view of their own data is
  not made safe by suppression thresholds and should not inherit them — it is
  protected by scope instead ([private-view-separation](private-view-separation.md)).
  Applying group floors there produces the absurd result of hiding people's
  own numbers from them.
- **Retained provenance.** An evidentiary action trail is deliberately
  complete; suppressing inside it destroys its purpose. Control who may read
  it, not what it records.
- **As the only control.** Producer-side suppression makes an admissible
  output safe at small n. It does not decide admissibility — that is
  [risk-framing-anonymization](risk-framing-anonymization.md) — and it does
  not decide who was eligible to be counted, which is
  [contribution-eligibility-floors](contribution-eligibility-floors.md).

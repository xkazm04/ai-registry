---
layer: technique
type: technique
subject: federated-benchmark-sharing
technique: capture-locally-publish-separately
status: forged
laws: [never-present-absence-as-an-answer, quality-apparatus-stays-unbudgeted]
shared_with: []
use_when: [a measurement run also asks the operator whether to share it, deciding what happens to a result when consent is declined, a contributor changed their mind about sharing after the run finished, sharing is failing and the runs are being lost with it]
---

# Capture locally, publish separately

Consent is per project and never inherited — that rule is the subject's, and it
is about *scope*. This technique is about **timing**, and it exists because the
obvious implementation of an opt-in destroys the thing it is gating.

The obvious implementation couples capture to publication: the run asks whether
to share, and the answer decides whether the result is written anywhere. A
decline means the measurement is computed, displayed, and discarded. That looks
like respecting the answer. It is actually a design that makes *no* the expensive
option, and it produces three failures at once — a contributor who declines once
can never contribute that run later, a network failure during publication loses a
measurement that had already succeeded, and the operator learns that saying no
costs them their own data, which is exactly the pressure an opt-in is supposed
not to apply.

## Two stages, one direction

Split the pipeline in two, with the store between them:

1. **Capture always writes locally.** Every run lands in a local store on the
   contributor's own machine, unconditionally and before any consent question is
   considered. The result belongs to the person who produced it; the federation
   has no claim on whether they may keep it.
2. **Publication reads that store.** Sharing is a separate operation over
   already-captured results, which can be invoked at run time as a convenience or
   at any later moment on its own.

The consequences are worth stating individually, because each one is a bug the
coupled design has:

- **Declining discards nothing.** A no means "not published", never "not kept",
  so the choice is genuinely reversible and costs the contributor nothing.
- **A backlog is a first-class state.** Results captured but never published
  accumulate, and a later publish sends them together. A contributor who spends a
  month deciding contributes a month of data, not one run's worth.
- **Publication is retriable without re-measuring.** A failure at the publish
  step is recoverable from the store, which matters because measurements can be
  expensive and network conditions are not.
- **A dry run is possible at all.** The contributor can be shown the exact
  payloads that would leave the machine, because those payloads are derived from
  stored data rather than produced in the same breath as the send. An opt-in
  where the operator cannot see what they are opting into is a formality; this
  split is what makes the disclosure the subject requires actually constructible.

## The privacy treatments still run before the payload leaves

Splitting capture from publication does **not** move the contributor-side
treatments later. The local store holds the contributor's own full-fidelity
results — that is the point of it — and the bucketing, vocabulary closure and
case floor run in the publication stage, on the way out, exactly as the subject
requires.

Read that as the ordering rule it is: the store is *inside* the trust boundary
and the treatments are the boundary. A design that stores the already-treated
payload instead has quietly made the local record as lossy as the shared one,
which serves nobody — the contributor loses their own detail, and the treatments
can no longer be changed without discarding history captured under the old ones.

## What this owes the contributor

- **An honest count of what is waiting**, surfaced where they will see it. A
  backlog nobody is told about is indistinguishable from a broken publisher
  ([never-present-absence-as-an-answer](../../../_laws.md#never-present-absence-as-an-answer)).
- **A record of what has already been published**, so a later publish sends the
  remainder rather than everything. Without it the backlog mechanism becomes a
  duplicate generator, and the path derivation in
  [content-addressed-contribution](./content-addressed-contribution.md) is what
  makes the remainder cheap to compute.
- **A local store the contributor can read, prune and delete.** Data captured
  without a consent question is only defensible while it stays theirs.

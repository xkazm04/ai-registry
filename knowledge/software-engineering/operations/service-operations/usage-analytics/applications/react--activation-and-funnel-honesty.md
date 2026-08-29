---
layer: application
type: application
subject: usage-analytics
technique: activation-and-funnel-honesty
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
applied: code
ab_verdict: better
---

# The activation latch that recorded intent — a two-line ordering with a permanent cost

*Verified against the project tree at `bf2a1e249`.*

The [activation-and-funnel-honesty](../techniques/activation-and-funnel-honesty.md)
technique carries one rule about the once-per-install dedupe latch: **the latch
must record delivery, not intent — write it after the emission is accepted,
never before.** This is an A/B of exactly that ordering in a desktop app whose
funnel is otherwise defined the way the technique asks.

## The seam

`src/lib/analytics/activation.ts` gets the hard parts right. The funnel is
declared in advance as completed actions, not visits
(`ACTIVATION_FUNNEL` at `:30-35`: `imported`, `persona_created`,
`execution_completed`, `shared`), the identifier is a locally minted random
install id (`:52-60`), and conversions flow through the same pluggable sink as
everything else so opt-out is a null sink rather than a call-site branch.

The defect is an ordering, at `:125-127`:

```ts
const reached = readReached();
if (reached.has(step)) return false;
reached.add(step);
writeReached(reached);        // :125 — the latch
try {
  getAnalyticsSink().conversion({ step, … });   // :127 — the emission
} …
```

The latch is written first. When telemetry is off the active sink is
`noopSink`, which discards by design — so the milestone is consumed by a sink
that was never going to report it, and that install can never contribute that
step again. Because the funnel's population is one row per installation per
step, the loss is not noise in an aggregate; it is a missing denominator entry
that no later event can supply.

## A and B

**A** is the ordering above. **B** splits the one latch into the two facts it
was carrying:

- `reached` — local product state, written the moment the milestone happens.
  Its accessor `hasReachedActivation` is documented as the thing that drives
  "share your first agent" nudges (`activation.ts:110`), and it must stay
  correct for opted-out users;
- `reported` — the funnel latch, written only after the conversion has been
  handed to a sink that is actually delivering, decided by a new
  `isSinkDelivering()` in `sink.ts` (a local consent query answered at the
  composition point, never a delivery acknowledgement the product waits on —
  the [sink-abstraction](../techniques/sink-abstraction.md) contract forbids
  branching on acceptance, and this does not).

`markActivation` keeps returning "was this the first time", so its seven call
sites are untouched.

## What was read

`src/lib/analytics/activation.test.ts`, with one case added that walks the
opt-out and back:

```
setAnalyticsSink(noopSink);   markActivation('persona_created');
setAnalyticsSink(capturingSink); markActivation('persona_created');
```

Under A: `AssertionError: expected [] to deeply equal [ 'persona_created' ]` —
the milestone is gone for the life of the install. Under B the conversion
fires once on the pass after opt-in, and a third call fires nothing. Full
analytics suite 18/18, `tsc --noEmit` clean. Verdict: **better**.

## The structural fact

The deviation was documented, not accidental. `activation.test.ts:94` pinned
the old behaviour with the comment `// dedupe state still advances`, under a
test titled *routes through the active sink, so telemetry-off (noop) fires
nothing*. Someone reasoned about this exact case and concluded that advancing
the latch was the correct thing to do — which is what the technique's rule
guards against, because both halves of the sentence are locally true: the sink
*is* the right consent mechanism, and the latch *does* need to advance. What
the local reasoning cannot see is that the two things being advanced are
different facts with different owners.

The tree's own structure says so more clearly than the test does. That test
did not even use `noopSink`; it built an anonymous sink with an empty
`conversion`, so the case it named — telemetry off — was never the case it
ran. The distinction the technique draws between *chosen silence* and *a
destination that happens to be quiet* had no representation in the code at
all until `isSinkDelivering()` gave it one; before that, the two were the same
shape, and a test written to check one necessarily checked the other.

## What this realization cannot do or prove

- It fixes the opt-out loss. It does **not** fix the other loss the same rule
  covers: a live sink whose transmission fails still latches `reported`,
  because the sink contract returns `void` and — correctly — nothing waits on
  acceptance. Delivery-truthful latching for a *failing* destination needs the
  loss accounting the technique cross-references, which this tree does not
  emit. What was applied is the consent half of the rule only.
- `isSinkDelivering()` answers by identity against the null sink. A future
  development sink or fan-out sink that discards would read as delivering. The
  honest boundary is: one sink in this tree is declared silence, and the
  function knows about that one.
- Nothing here measures a funnel. No conversion rate was computed before or
  after, and none could be — the destination is a shipped-build-only pipeline.
  The A/B proves a milestone survives an opt-out cycle in a unit test; it does
  not prove any published funnel number changed, or was ever wrong by a
  measured amount.
- One half of the split is currently theoretical. `hasReachedActivation` and
  `getReachedActivations` have no callers outside the analytics module in this
  tree, so "local product state stays correct for opted-out users" is a
  property nothing yet observes. The split is right on the technique's terms
  and free at this size, but its value is owed to a consumer that does not
  exist.
- The recovery has a shape worth stating plainly: the milestone reports on the
  next *observation* of that step, not at opt-in time. A user who created their
  only persona while opted out and never creates another still never reports
  `persona_created`. B narrows the hole; it does not close it.

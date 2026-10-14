---
layer: application
type: application
subject: performance-root-cause-diagnosis
technique: one-lever-from-supplied-entities
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# One lever, from supplied entities - the ads diagnosis normaliser

The Czech-first adtech workspace (`systedo-case`, branch `cur/n55-sys`, 2026-10-14) already
implemented most of the technique in its ads diagnosis: one recommended action in the prompt,
the model's affected-campaign list intersected with the ids the request carried (unknown ids
dropped, duplicates collapsed, capped at six), the cause and severity coerced to a closed
vocabulary, and the containment asserted from the hostile side in an adversarial test.

## What the seam disagreed on

The normaliser backfilled the deterministic worst-rows set whenever the filtered list was
empty. That conflates two cases the technique separates: a model that named nothing (a
portfolio-level reading, backfill is honest) and a model that named only ids the request never
held (it pointed at no real row, and the card then showed the worst-wasted campaigns as if it
had). The seam was chosen to falsify the claim "dropping is safe": it held for the invented id,
and failed one step later, at the backfill.

## A and B

Same normaliser, same request, two model outputs: all-invented ids, and an empty list.
A (before): all-invented gave the deterministic rows (not empty); empty gave them too.
B (after): all-invented gives an empty list and logs the drop; empty still gives the
deterministic rows. Target: all-invented case non-empty, 1 of 1 to 0 of 1. Floor: the
existing fabricated-id test, 41 adversarial tests, typecheck and lint stayed green; the wider
unit suite showed 24 failures in sqlite, embeddings and CI-config tests untouched by the change.

Not measured: how often a live model returns only invented ids. Open: the recommendation prose
is free text and is not checked against supplied names; only the structured list is.

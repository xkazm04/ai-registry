---
layer: technique
type: technique
subject: unattended-build-loop
technique: verified-vs-self-reported-pass-rate
status: forged
laws: [no-gate-self-certifies, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [reporting how much of a plan an automated run completed, choosing the stop condition for a loop, reconciling a builder's reported results against a plan]
---

# Verified versus self-reported pass rate

Keep two numerators over the same denominator: what the producer claimed, and
what an independent check confirmed. Report both, label both, and let the loop's
stop condition compare against the confirmed one by default.

This is bookkeeping over evidence that already exists. It adds no verification
mechanism — it stops an existing mechanism's results from being averaged into
the producer's opinion.

## The procedure

1. **Stamp each planned item with two facts**, not one: the producer's reported
   outcome, and a `verified` flag set only when the item's required check passed
   *for the session that produced it*. Both are per-item and both persist.
2. **Compute two rates from one denominator.** Self-reported = items the producer
   called done ÷ total planned. Verified = items with the flag set ÷ total
   planned. Same denominator, deliberately: two rates that share a basis are
   comparable, and the gap between them is itself the metric worth watching.
3. **Make the counting basis an explicit, named parameter** with the verified
   basis as its default. The legacy self-reported basis stays available for
   runs whose checks genuinely cannot be configured, and it must be chosen
   deliberately.
4. **Compare the stop condition against the basis in force.** A loop that stops
   on the self-reported rate while displaying the verified one is worse than a
   loop with one number, because the discrepancy is now attributed to a
   reporting bug rather than to the design.
5. **Headline the verified rate everywhere it surfaces.** The self-reported rate
   appears second, explicitly labelled as the producer's own claim. Ordering is
   not cosmetic — the first number in a summary is the one operators quote.

## Decision rules

- **When a producer reports a pass but the item's required check reported
  unverifiable, the item stays unverified.** This is the case the whole technique
  exists for. The producer may well be right; it is simply not evidence.
- **When the two rates diverge widely and persistently, treat it as a signal
  about the environment, not about the producer.** A verified rate pinned far
  below a healthy self-reported rate almost always means a required check cannot
  run — which is the condition unreachable-success-preflight detects at launch.
- **When you can only surface one number, surface the verified one.** Dropping
  the self-reported figure loses diagnostic value; dropping the verified figure
  loses the point.
- **Never blend the two into a single confidence-weighted score.** A blended
  number cannot be acted on: the operator cannot tell whether to go look at the
  code or at the configuration, and the blend hides which half moved.

## Reconciliation: matching reports back to the plan

The two numerators are only meaningful if reports map to plan items correctly,
and that mapping is the loop's integrity boundary.

- **Match on an exactly-normalised key.** Fold case, punctuation and whitespace
  into one canonical form; match on the item's name or its fully-qualified
  identifier. Nothing else.
- **No substring or fuzzy fallback, ever.** A substring match maps a report about
  one item onto a longer-named sibling; in an unattended loop nobody notices.
- **No force-pass fallback.** The pattern "nothing matched, so mark everything
  passed" turns an unparseable producer report into a completed plan. It is the
  single mechanism by which a builder most often convinces itself it finished.
- **An unmatched report leaves the plan item untouched** and is logged as an
  unmatched report. It is information about the producer, not about the item.
- **An item the producer never mentioned stays unverified.** Silence does not
  decay to pass at end of run, and does not decay to fail either.
- **Resolve identifier and name collisions deterministically.** When building the
  lookup, one form wins by a stated rule (names before identifiers, for example)
  so that an identifier-shaped report can never shadow a differently-named item.

## When NOT to use this

- **When there is exactly one authority and no producer claim at all** — a purely
  mechanical transformation checked by one deterministic test. Two numerators
  over identical data is noise.
- **When the checks are so weak that the verified rate carries no information.**
  If the required check only proves the artifact exists, a high verified rate
  says nothing more than the self-reported one; fix the evidence ladder first,
  or the second numerator provides false comfort.
- **When the denominators genuinely differ** — for example a subset of items has
  no applicable check at all. Then these are two different measurements and must
  be reported with their own denominators rather than as a pair.

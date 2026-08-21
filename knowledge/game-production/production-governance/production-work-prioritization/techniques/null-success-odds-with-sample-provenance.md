---
layer: technique
type: technique
subject: production-work-prioritization
technique: null-success-odds-with-sample-provenance
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a ranking factor forecasts whether work will succeed, a dashboard shows a success percentage on a young project, choosing between competing samples for a rate]
---

# Null success odds with sample provenance

A forecast factor — the odds that this work, attempted now, lands — reports `null` when no
sample supports it, contributes zero points to the composite, and drops its segment from
any visualisation. Where a rate *does* exist, it travels with the identity and size of the
sample it was computed from. This is *unmeasured is not a pass* applied to a prediction
rather than to a check.

## The failure it prevents

A neutral default of one-half is the single most seductive bug in this whole subject. It
is defensible in the abstract — maximum entropy, no information — and it renders as a
sentence: *half of past attempts at similar work succeeded.* On a project where nothing
has ever been attempted, that sentence is false, confident, and indistinguishable from a
measurement. Worse, it is *stable*: it never moves, so nobody notices it is not tracking
anything.

The asymmetry that makes this decidable: a missing forecast costs a reader one factor of
information they know they are missing. A fabricated forecast costs them a belief they do
not know is unfounded. The second is strictly worse, so the fallback is null.

## Procedure

1. **Define the sample tiers, strongest first**, and make the tier part of the output. A
   workable ladder: a matched prior instance of this specific work with its own recorded
   outcomes; the containing area's recorded run outcomes; nothing.
2. **Assert every evidence source is actually written.** A factor that reads a store no
   code path populates is structurally dead and reports "no evidence" forever while
   looking healthy. Prove reachability once, in a test, per source. This is the failure
   that hides longest, because its symptom is indistinguishable from an honest young
   project.
3. **Pass the real evidence in explicitly** rather than reaching for an ambient default.
   Where a caller omits it, the honest result is *no evidence*, never a neutral constant —
   which means the omission is visible instead of silently synthesising a number.
4. **Emit `null` when every tier is empty**, set the factor's contribution to zero, and
   have the renderer omit the segment rather than draw an empty one. An empty bar reads as
   a measured zero.
5. **Attach a provenance sentence to every rate**, naming the source, what it was computed
   over, and how many observations stand behind it. The sample size is the part that makes
   the number honest; a consumer is *required* to quote the sentence rather than the bare
   percentage.
6. **Report the run count and success count alongside the rate**, so a reader can see the
   denominator without parsing prose.

## Decision rules

- **When choosing between two candidate samples, weight the rate by a capped observation
  count** — a rate of 1.0 from one observation must not beat 0.8 from twenty. Capping the
  confidence multiplier around ten observations prevents a large old sample from
  permanently outranking a smaller, more current one.
- **When blending a specific sample with a broader one, weight the specific one higher
  and let the broader one contribute nothing when it is null.** A blend where the missing
  half is filled with a midpoint has quietly reintroduced the fabrication through the
  back door.
- **When the rate exists but the sample is below a stated minimum, publish the rate with
  its size and let the reader discount it.** Suppressing a small sample is a different lie
  from fabricating one, but it is still a lie; the honest move is disclosure, not
  concealment.
- **When an automated consumer reads this factor, a null must halt or de-prioritise, never
  default.** An unattended process acts on the number without the human's instinct to
  distrust a suspiciously round one.

## What a rate does and does not license

A recorded success rate is a statement about *past attempts of comparable work under past
conditions*. It is not a probability about this attempt, and the difference matters when
the team, the tooling or the target has changed. Two guards keep it useful: date the
sample, and never carry a rate across a change that invalidated the conditions it was
measured under. A rate whose sample predates a tooling change is evidence about a project
that no longer exists, and should be reported with that caveat or not at all.

## When not to use this

- **Where a genuine prior exists.** An organisation with hundreds of comparable prior
  deliveries has a real base rate; using it, clearly labelled as an organisational prior
  rather than this project's evidence, is legitimate. The rule bans invention, not
  evidence.
- **Where the factor is a policy input rather than a forecast.** "This class of work is
  deliberately de-prioritised" is a stated position and belongs in a different factor with
  a different name — not smuggled in as low odds.

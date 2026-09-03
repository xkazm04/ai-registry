---
layer: technique
type: technique
subject: modelled-performance-estimates
technique: one-ratio-then-a-capability-cap
status: forged
laws: [gate-sees-target, limits-are-derived]
shared_with: []
use_when: [turning a continuous estimate into a tier or a verdict, a verdict over-promises on tight fits and under-rates roomy ones, deciding where a top band should stop, adding a second input to a classification that already has one]
---

# One ratio, then a capability cap

A verdict is a categorical answer built from continuous estimates: does this
fit, is this fast enough, which tier is this. Its construction looks like a
free design choice and is not. Two rules decide whether the verdict survives
contact with the edge cases, and both are counter-intuitive enough that most
implementations get them wrong on the first pass.

> **The verdict is a pure function of one ratio. Any capability distinction is
> applied afterwards as a cap, never mixed into the ratio as a second input.**

## The two-input verdict fails in both directions at once

The natural design blends the fit itself with something about the environment
— the absolute size of the resource pool, how much headroom remains, which
execution path is available, a rule of thumb about what this class of workload
usually needs. Each addition is individually defensible. Together they produce
a verdict that **tracks the environment instead of the fit**, and the
signature is bidirectional:

- **It over-promises on tight fits.** A configuration consuming nearly all of
  a large pool clears an absolute headroom rule of thumb — the pool is large,
  so the remaining slice is large — and takes the top tier while sitting at a
  utilisation where it will not actually run. The verdict was reading the
  pool's size and reporting it as fit quality.
- **It under-rates roomy ones.** The same configuration occupying half of a
  small pool is demoted, because the second input reads "small pool", while
  the identical configuration on a larger pool at a *lower* fit quality scores
  higher. The verdict has ranked the hardware and called it a ranking of the
  configuration.

Both directions from one defect is what makes this rule transplantable rather
than a local fix. A verdict that fails in one direction can be corrected by
moving a threshold — raise the bar and the over-promise goes away. A verdict
that fails in both simultaneously has no threshold that satisfies it, because
the two failures move in opposite directions under every threshold change.
When you see a classification whose bugs pull the same knob in opposite
directions, the defect is the number of inputs, not their weights.

The underlying diagnosis is that the second input is a **proxy**. The question
is "how tightly does this fit", the ratio answers it directly, and the
absolute figure answers a correlated but different question — which is exactly
the condition under which [a gate that reads a proxy passes when the proxy
diverges from the target](../../../../_laws.md#gate-sees-target), and the
divergence cases are the tight fit on a large pool and the roomy fit on a
small one. Those are not exotic; they are the two situations a user most wants
the verdict for.

So: **compute the ratio, and classify on the ratio alone.** Utilisation of the
constrained resource, requirement over capacity, achieved over required —
whichever single quantity actually expresses the question. Everything else
that felt like it belonged in the verdict is either a cap (below) or a
separate field.

## The cap, and why it stops one tier down

Capability distinctions are real: an execution path may be available but
slower, a fallback may work but without a feature the top outcome implies. The
verdict must reflect that, and the way it reflects it is a **cap applied after
the ratio has been classified** — the tier is computed from the ratio, then
lowered to a ceiling if the capability is absent.

Two halves, and the second is the one naive designs miss.

**The cap exists** because the top tier is a conjunction. If the top verdict
means *fits with room to spare **and** runs on the fast path*, then a
configuration on a slower path cannot hold it regardless of how well it fits;
awarding it makes the top tier mean two different things and the reader cannot
tell which.

**The cap stops exactly one tier down.** It does not push the whole path to
the bottom. A configuration that fits comfortably on a slower path is
genuinely usable, and frequently the best available answer on that machine;
collapsing every slow-path result into the lowest tier destroys the
distinction between "works, just not quickly" and "does not work", which is
the distinction the user came for. The common naive design demotes the path
wholesale, and its symptom is a machine on which every verdict reads the same,
which readers correctly interpret as the verdict being broken rather than the
machine being uniform.

A cap is not a penalty. It is a ceiling on a claim whose upper end asserts
something the path cannot supply, and everything below the ceiling passes
through unchanged.

Write the two halves as **two composed functions** — a verdict from the ratio,
then a cap from the capability — rather than one branch that considers both.
The form is what keeps the rule enforced after the author leaves: the ratio
verdict can be exercised over its whole range with no capability in sight, the
cap can be exercised over every tier with no ratio, and a later contributor
who wants to "just check one more thing" has to put it visibly in one of the
two rather than folding a second input into a condition nobody re-reads.

## When the ratio cannot be computed, take the conservative tier

The denominator is not always knowable — the pool could not be sized, the
capacity was not reported, the division is not finite. This is the one place
in the subject where the answer is **not** an absence, and the reason is the
domain test the [refusal technique](./refuse-rather-than-emit-a-sentinel.md)
states: a closed tier vocabulary usually has a free value at the bottom, and
"we cannot claim this works" is a tier a reader will not mistake for a
measurement.

So resolve an uncomputable ratio to the **conservative** tier, and be explicit
about which direction conservative points: toward the outcome that costs the
user least when it is wrong. Claiming something fits a resource nobody could
size wastes an attempt and a download; declining to claim it wastes a
question. The verdict's note then says the pool was unknown, because the tier
alone would read as a measurement of a bad fit rather than an absence of
evidence about a possibly good one.

## Band edges are derived, and none of them sits at the limit

The ratio is classified by thresholds, and a threshold chosen by feel is
raised by feel later. Each edge should be [derived from a measured property
rather than picked](../../../../_laws.md#limits-are-derived), with the
derivation written where the constant lives.

The edge that matters most, and the one that generalises furthest, is the top
one: **the top band stops short of the theoretical limit.** A pool filled to
its last percent leaves nothing for the slack the model does not represent —
allocator overhead, fragmentation, the transient peak during setup, whatever
else shares the resource. Set the edge at the theoretical limit and the top
band contains configurations that fail for reasons the ratio cannot see, which
is the same thing as saying the band has never been tested at its own
boundary. Set it a few percent below, derived from measured overhead on the
systems you have, and the band means what it says.

The derivation is what makes the edge maintainable. "Ninety-eight percent,
because measured allocator and fragmentation overhead on the observed systems
runs one to two percent" is a constant somebody can re-derive when the
overhead changes. "Ninety-eight percent" alone is a number that will be nudged
in a later change by someone who does not know what it protects.

Two smaller rules ride along. **Edges are shared, not re-declared** — a tier
computed at one threshold on one surface and a slightly different one in a
report is one verdict disagreeing with itself. And **the ratio is published
beside the tier**, because a tier alone cannot be argued with and a
borderline case is exactly where somebody needs to see the number.

## Decision rules

- **When a second continuous input is proposed, reject it and ask which
  question it answers.** If it is a different question, it is a different
  field; if it is the same question, the ratio already covers it.
- **When a capability is missing, cap — do not demote.** One tier below the
  top, and no further.
- **When the ratio is not computable, take the conservative tier and say
  why.** The tier without the note reads as a bad fit rather than as no
  evidence.
- **When implementing, compose two functions.** A ratio verdict and a cap,
  each testable without the other; a single branch weighing both is how the
  second input comes back.
- **When setting a band edge, write the derivation beside the number.** An
  edge with no derivation is an edge that will be moved without one.
- **When the top band would touch the theoretical limit, pull it back by the
  measured slack.** The last percent belongs to what the model does not
  represent.
- **When a verdict and its ratio are both available, publish both.** The tier
  is the summary; the ratio is what a disagreement is settled with.
- **When two surfaces classify, they derive from one definition.** A verdict
  computed twice is a verdict that will differ once.

## When not to use this

- **When the answer is genuinely multi-dimensional and the consumer can hold
  it.** Some readers want the components, not a tier. A single verdict is a
  compression for a reader who needs one decision; forcing a rich comparison
  through it loses information nobody asked you to discard.
- **When no single ratio expresses the question.** If the constrained resource
  changes with the workload, the honest move is to name the binding constraint
  in the output and classify against that one, not to average two ratios into
  a composite that means nothing at either end.
- **When the tier would carry more precision than the estimate supports.** A
  five-tier verdict over an estimate whose error is wider than a tier is
  false resolution; fewer bands, honestly drawn, beat a fine ladder built on a
  modelled number with an unstated bound.

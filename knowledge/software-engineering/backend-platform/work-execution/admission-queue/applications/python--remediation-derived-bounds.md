---
layer: application
type: application
subject: admission-queue
technique: remediation-derived-bounds
stack: python
verified_on: 2026-09-04
verified_against: python@3.12
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# Python — the queue cap is the autoscaler's gain, and the smallest fleet has the least of it

How a CPU speech-synthesis service stands against
[remediation-derived-bounds](../techniques/remediation-derived-bounds.md), and
specifically against its closing rule: a limiter that bounds a quantity a
controller reads has set that controller's gain. Evaluated against the tree's
own deployment-plan generator by importing it and running its constants, not by
reading the chart.

## The three numbers and where they live

The service caps its admission queue per replica, and separately scales the
fleet on that same queue depth through a metrics-API scaler with a per-replica
target. The plan generator derives both from the measured replica count, and a
third constant sets the replica ceiling as a fixed multiple of the current
count. So the queue cap, the scaler target and the ceiling are computed in one
file — which is better than the usual arrangement, and is exactly why the
missing derivation is visible at all.

Evaluating the generator's own functions across the replica counts it emits
autoscaling for:

| replicas | queue cap | ceiling | growth needed | gain per interval | intervals to converge |
| --- | --- | --- | --- | --- | --- |
| 2 | 8 | 6 | 3.0× | **2.0×** | **2** |
| 3 | 12 | 9 | 3.0× | 3.0× | 1 |
| 4 | 16 | 12 | 3.0× | 4.0× | 1 |
| 8 | 32 | 24 | 3.0× | 8.0× | 1 |

The queue cap is four per replica and the scaler target is four, so the gain is
numerically equal to the replica count, while the growth the ceiling asks for
is a constant three. The two cross at three replicas.

**The two-replica plan is the one that pays.** It is also the smallest fleet
the generator will emit a queue-depth scaler for at all — the configuration a
first deployment gets — and at a fifteen-second polling interval it spends an
extra interval, roughly thirty seconds, shedding through a burst before it
reaches the ceiling it was configured to reach.

## What the technique got wrong here, and the tree corrected

The first draft of this reading claimed the two-replica plan *cannot* reach its
ceiling: gain 2.0 against a needed 3.0, therefore unreachable. That is wrong,
and the tree is what showed it. The scaler re-evaluates, so from two saturated
replicas it asks for four, and from four saturated replicas it asks for eight
and is clamped to six. The ceiling is reached — one polling interval later than
an unclipped signal would have reached it.

The technique now states the convergence form rather than a reachability one,
and this is the seam that produced the correction. It is worth recording
because the reachability version is the intuitive reading of a saturated
signal, it produces an alarming and false claim, and nothing in a static
configuration review would have caught it. Only asking "what does the
controller do on its *second* evaluation" does.

## The structural fact

The generator derives everything else in the plan — queue depth from replicas,
ceiling from replicas, the autoscaling *mode* from whether the topology makes
the metric meaningful at all, each with a `why` string carried into the emitted
chart. Its reasoning about the scaler is unusually careful: it refuses to emit
queue-depth scaling for the shipped port-sharing topology, on the ground that
the endpoint would report one arbitrary replica's queue rather than a pool
total, and falls back to CPU.

So this tree already knows that a scaler is only as good as the number it
reads. What it does not carry is the consequence of that number being
*clipped*: every other relationship in the plan is derived and explained, and
the gain is the one that is emergent. The absence is not carelessness — it is
that convergence time is the property a configuration review cannot see, which
is the argument for writing it down beside the ceiling.

## What this realization cannot show

The interval count is arithmetic over the configuration and is certain. What is
unmeasured is whether it matters: thirty seconds of additional shedding is
either irrelevant or the whole incident depending on burst shape and how long
callers wait, and nothing here establishes which.

The instrument that would settle it is a control-loop simulation — replay a
burst arrival against the admission path while stepping a scaler on the
polling interval, and compare completions against an unclipped-signal control.
The pieces exist in the tree (the fake-model harness that this subject's other
application used, and the fleet aggregation the scaler reads); what is missing
is the loop that joins them. Until it exists, the derivation is worth stating
and is not worth acting on.

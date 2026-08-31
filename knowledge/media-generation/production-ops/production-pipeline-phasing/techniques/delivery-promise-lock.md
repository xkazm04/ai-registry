---
layer: technique
type: technique
subject: production-pipeline-phasing
technique: delivery-promise-lock
status: forged
laws: [unmeasured-is-not-pass, cost-per-usable-output]
shared_with: []
use_when: [a pipeline can serve one brief in several media at very different costs, a compose stage cannot obtain the material the plan assumed, deciding what a quality ratio counts in its numerator, a delivered output satisfies its own metric and disappoints the person who commissioned it]
---

# Delivery promise lock

Phase order settles decisions so later phases do not gamble on them. One
decision is almost never on the list, because it feels like a restatement of
the brief rather than a choice: **what kind of thing is being delivered.**
Any pipeline that can render one brief in more than one medium has a
cheapest medium, and the cheap one is usually a legitimate product in its own
right — which is exactly what makes the substitution invisible. A commission
for a motion piece, served as a well-made sequence of animated panels, is not
a botched render. It is a different deliverable, competently produced, and
nothing in the artifact says so.

The technique is three obligations on that decision: classify it, lock it
before the means are chosen, and define its fulfilment metric so the cheaper
neighbour cannot satisfy it.

## Classify the deliverable, not the request

The promise is a small closed vocabulary of delivery kinds — motion-led,
source-led, explanatory graphics, presenter-led, translation of an existing
piece — and each kind carries its rules as data, not as prose: whether a
still-led fallback is permitted at all, whether generation is required, and
the floor a fulfilment ratio must clear.

Two properties make the vocabulary work. It is **closed**, because a promise
kind minted per brief is a description and cannot be enforced by anything.
And it is **derived, then overridden**: the pipeline shape proposes a default
kind, and explicit intent from the commissioner overrides it. A pipeline that
asks the commissioner to name the delivery kind from a blank page gets the
brief back in different words.

The promise is settled at a cheap phase — before any vendor, tool or runtime
is chosen, because those choices are made *to serve* it. A means chosen first
becomes the argument for what the promise should have been.

## The metric's numerator is the whole technique

Once a promise is enforced by a ratio, the ratio is the thing under pressure,
and there is a general rule about that:

> **The cheapest way to satisfy a quality ratio is to reclassify cheap output
> into its numerator.**

Nothing has to intend this for it to happen. A composition of animated panels
has transitions, easing, timed reveals and movement on almost every frame; any
metric that counts "cuts containing movement" scores it at or near one. It
will pass a motion floor of 0.7 without a single frame of the thing the
promise meant.

So the numerator is enumerated adversarially. Name the categories that
**count**, name the near-miss category that does **not**, and write the
exclusion down as a set rather than leaving it to a predicate somebody will
later relax:

- Real motion is footage, generated video, or animation of a subject.
- Slide grammar — text panels, statistic cards, charts, comparison frames,
  callouts — is *animated*, and does not count as motion.
- Stills are the honest third category and never counted for anyone.

Report all three counts beside the ratio, not just the ratio. A single number
cannot distinguish "we produced slides" from "we produced stills", and those
have different repairs. Per [unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass),
the fraction of the promise the gate could actually evaluate is reported with
the verdict; a cut list whose entries carry no type at all is unmeasured, not
compliant.

The adversarial step generalises past media. For any promise gated by a
proportion, ask: *what is the cheapest artifact this pipeline could produce
that scores well here and disappoints the commissioner?* Whatever that is, it
belongs in the excluded set by name. The exclusion is the technique; the
threshold is a detail that can be tuned later without breaking anything.

## A stage that cannot honour the promise halts

The failure this whole structure exists to prevent is not a bad render. It is
a **silent downgrade**: the compose stage discovers it lacks the material for
the promised kind, quietly assembles the adjacent cheaper kind, and delivers
on time and under budget. Every local signal is green. Per
[cost-per-usable-output](../../../_laws.md#cost-per-usable-output), that
delivery is the expensive one, because the cheap thing it produced is not a
usable instance of what was commissioned.

The rule: a stage that cannot meet the locked promise **stops and asks**. It
does not substitute, and it does not lower the floor it was handed. The escape
hatch is a field on the promise — an approved fallback, naming the kind that
may be delivered instead — and that field is set by a person, in advance or on
being asked, and never inferred from what the pipeline happens to have
managed. An approved downgrade is a decision with an owner; an inferred one is
the same artifact with nobody's name on it.

This is the delivery-side counterpart to the golden path's rule about probes.
A probe that rehearses an expensive medium in a cheaper one leaves the dropped
dimension *unsettled, never approved* — and that is correct, because a probe
is not a deliverable. The case this technique owns is the one where the
dropped dimension reaches the commissioner: the drop happened at delivery, so
there is no later stage to settle it in, and the honest states are halt or a
recorded downgrade.

## When not to use this

A single-medium pipeline — one kind of output, one means of producing it —
needs none of this; the promise is the tool, and a vocabulary of one is a
label. Do not grow the vocabulary to describe briefs: a kind earns its place
only by carrying rules that differ from every existing kind's, and a promise
list that has drifted into a taxonomy of subject matter has stopped gating
anything. And do not read the ratio as a craft score. It answers one question
— was the commissioned kind of thing delivered — and a piece that clears its
floor can still be poor work, which is what
[the grading and review subjects](../../review-iteration-loops/review-iteration-loops.md)
are for.

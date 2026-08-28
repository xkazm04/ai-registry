---
layer: technique
type: technique
subject: accessibility
technique: assistive-tech-divergence
status: forged
laws: [count-carries-predicate, unknown-is-not-a-value, deletion-is-not-repair]
shared_with: []
use_when: [a feature works for one tester and is silent for another, deciding which reader and browser pairs a release is held to, a colleague proposes deleting an odd-looking accessibility workaround]
---

# Assistive-technology divergence

The other techniques in this subject describe contracts a product owes:
a computable name, a keyboard path, an announcement that reaches the
user. This one is about the layer that *delivers* those contracts —
assistive technologies paired with browsers — and the fact that the
delivery layer is not one implementation. It is a small grid of
independently built products that read the same markup and disagree
about what to do with it.

[a11y-verification](./a11y-verification.md) says a human drives the
journeys with a real screen reader, at least one per platform. That rule
is correct and it is not the whole craft: it says how many passes to
buy, not what to do when two passes return different answers, which is
the normal case rather than the exceptional one.

## The specification is not the contract — the pair is

> **Conformance predicts behavior only where implementations agree, and
> on the sharpest edges of this domain they do not.** Markup that
> satisfies every published requirement can be voiced by one pairing,
> voiced differently by a second, and passed over in silence by a
> third.

This is not implementer sloppiness; it is downstream of the standards
themselves, which specify the *meaning* of a role or a live region far
more precisely than they specify the *timing and eventing* an assistive
technology must observe to notice one. Where a specification is quiet,
each implementation answered the question on its own, years apart, and
the answers stuck. The observable consequences cluster around exactly
the moments a product cares about: whether content already present when
a region appears is announced, whether a change racing its own container
into the tree is noticed at all, whether an identical repeated string
counts as an event, and how aggressively an interruption grade
interrupts.

The practical form of the claim is uncomfortable and worth stating
plainly: **a defect report of "this does not announce" is incomplete
until it names the pairing**, and a fix verified on one pairing is
evidence about one pairing. Two engineers can both be honest, both be
testing carefully, and reach opposite conclusions about the same commit.

## "Supported" is a list of pairs, or it is nothing

A product that claims accessibility support has, somewhere, an implicit
answer to *which* readers on *which* browsers it was held to. Left
implicit, that answer is always the same one: whatever the person who
last tested happened to have installed. Write it down instead — the
pairs the product is held to, chosen by the platforms it ships on and
the populations that use it, and reviewed as a product decision rather
than inherited from a laptop.

That written list is what makes the claim mean anything
([count-carries-predicate](../../../../_laws.md#count-carries-predicate):
"tested with a screen reader" carries *which one, on which browser, at
which version*, or it will be reused for a claim it does not support).
And it makes the complement honest too: pairings outside the list are
**untested, which is not the same as working**
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
A support matrix that quietly renders every unexercised cell as a pass
is the laundering this law names, applied to the one population that
cannot check the claim for itself.

The list should be short. Holding a pairing costs a real recurring pass,
and three pairings genuinely held beat eight nominally covered.

## Prefer mechanisms no reader has to interpret

The best defense against divergence is not branching — it is choosing
mechanisms whose signal is unambiguous to every implementation, so that
the question of interpretation never arises.

The design heuristic: **make the thing you want observed into an
unmistakable structural change, rather than a subtle one that each
implementation decides how to treat.** A container that exists early and
empty, mutated later, is unambiguous; a container arriving already
populated asks every implementation the question the standards left
open. Replacing a node outright is unambiguous; rewriting its text with
the same string asks whether an unchanged value is an event. In both
cases the robust mechanism costs a little more engineering and removes a
whole column of the matrix from the argument.

This is why the shared machinery in this subject is worth its weight:
one provider that always mounts before the news and always mutates
structurally is a single place where the divergence is engineered away,
instead of N call sites each discovering it separately
([live-region-architecture](./live-region-architecture.md)). The same
instinct favors native elements over reconstructed ones
([primitive-level-a11y](./primitive-level-a11y.md)) — a native control's
behavior is the one thing every pairing already agrees about.

## When pairs disagree, tie-break on the user's failure

Some divergences cannot be engineered away, and a choice has to be made
that is worse for one pairing than another. Conformance is a poor
tie-breaker there, because both branches usually conform. Rank the
*failures* instead:

1. **Silence is the worst outcome.** A message the user never receives
   is a capability they do not have; every other cost is smaller.
2. **A wrong or stale announcement is next.** It spends the user's
   attention and teaches them to distrust the channel — the
   announcement-side cousin of the false affordance
   ([keyboard-navigation-models](./keyboard-navigation-models.md)).
3. **Verbosity and interruption are real costs, and they are the ones
   to pay.** An extra prefix, an earcon, a message spoken twice on one
   pairing: annoying, survivable, and the correct price for the first
   two never happening.

Read that ranking against the common trade where a more forceful
delivery grade is the only one a given pairing reliably notices: it
costs an interruption on the pairings that were already fine, and it
buys the message reaching the one that was silent. Under this ranking
that trade is usually right — and it is a *deliberate* choice with a
recorded reason, not a default.

## A pairing workaround is load-bearing code and must say so

Code written for a divergence is code that looks wrong. It duplicates
something, or delays something, or forces a mutation that the
surrounding logic already appears to make. It has no failing test
attached in the obvious sense, because the behavior it protects is
invisible in every environment the team's automation runs in — and so it
is a standing candidate for a cleanup pass to delete as redundant,
after which nothing fails and the defect returns to a population that
does not file bugs.

Every such workaround therefore carries, at the site, what pairing it
serves, what was observed without it, and when that was last checked.
Removing it without re-measuring on that pairing is
[deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) in
its purest form: the workaround was the only place the divergence was
being handled, and deleting it converts a solved problem into an
invisible one.

## The matrix moves — re-measure on a clock

Divergences are bugs from the implementers' point of view too, and some
of them get fixed. A workaround can become unnecessary; a pairing that
was reliable can regress in a release nobody on the team installed. This
is the one part of accessibility verification that decays on someone
else's schedule rather than on the product's, so it cannot be triggered
by product events: re-measure the held pairings periodically and after
a platform's major release, and date the result. An undated matrix is a
record of a machine that no longer exists.

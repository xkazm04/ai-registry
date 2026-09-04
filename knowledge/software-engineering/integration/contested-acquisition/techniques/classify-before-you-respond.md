---
layer: technique
type: technique
subject: contested-acquisition
technique: classify-before-you-respond
status: forged
laws: [verdict-survives-boundary, failure-not-empty-success]
shared_with: []
use_when: [wiring a ladder of responses to a refused retrieval, a caller cannot tell "we tried" from "nothing applied", budget disappears against refusals nothing could have cleared]
---

# Classify before you respond

The ladder shape arrives on its own. Someone adds a cheap response to a
refusal, then a second one for the cases the first misses, then an expensive
one for the rest, and each is written to decide for itself whether it applies.
The result runs top to bottom and stops at the first success, which sounds
like the right structure and is the wrong one.

It is wrong because the responses are **not fungible and not comparably
priced**. One is a gesture that costs a few hundred milliseconds. One is a
model call that costs money per attempt. One is a person's attention, which is
the most expensive thing in the system and cannot be bought back. A ladder
that lets each rung self-select spends all three against outcomes that were
excluded before the first one ran.

The correction is one ordering rule: **classify the refusal into a closed set
before selecting any response, and let the class decide which responses are
applicable.**

## The closed set is the interface

The classifier's output is a small, enumerated vocabulary, defined once, and
every consumer derives from it — the ladder, the error surface, the metrics,
the caller. Three properties make it work:

- **It is closed.** A new refusal shape is a change to the vocabulary and to
  everything that switches on it, which is the point: an open set of strings
  drifts into a set of near-synonyms nobody can branch on.
- **It classifies shape, never whether.** Deciding that a response *is* a
  refusal and deciding *which kind* are two questions, and only the second
  belongs here. When both exist, they share one marker vocabulary, so the
  classifier can never disagree with the detector about whether a page is a
  refusal at all — it only refines the shape. Two independent implementations
  of "is this a refusal" is a race with a delay fuse.
- **It is pure.** Given the same evidence it returns the same class, with no
  network, no clock, no configuration. That is what makes the precedence rules
  testable in isolation, and precedence is where this whole technique lives.

## The election, including the empty one

The class does not merely *hint* at what to run. It **elects**: for each
class, the applicable responses and their order are derived from the class,
before any of them is entered.

The load-bearing case is the class whose applicable set is **empty**. There
are refusals that no response you own can clear — the ones where nothing is
presented to act on, where clearing is a property of who you are rather than
of anything you can do. For those, the election is the empty list, the run
spends nothing, and the answer is immediate.

> A class with no applicable response runs nothing and returns an honest
> negative. That is the correct execution of the ladder, not a hole in it.

Teams get this backwards twice. First by treating an empty election as a bug
and adding a "try anyway" path, which converts a free correct answer into a
paid wrong one. Second by treating it as a silent skip, so the run looks
identical to one that never reached the ladder.

## The declared refusal is a return value

When nothing clears — the empty election, or every elected response
failing — the ladder returns a **typed value**, not the absence of one. It
carries at minimum:

- the **class** the classifier assigned;
- which response, if any, actually ran and cleared — null when none did;
- the underlying status, **when one genuinely exists**, and absent when it
  does not. A refusal that arrived as a dropped connection or a rendered
  interstitial has no meaningful status, and inventing one converts "we do not
  know" into a number somebody will branch on.

That value has to reach the outermost consumer as a value
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)). A
refusal class computed carefully and then flattened into a generic error one
frame up has been computed for nothing: the classification exists where it was
made and dies where it mattered. The test is what the caller can branch on,
and prose in a message field is not a branch.

The complementary rule is that it must not be spelled like an empty success
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
Returning an empty document, a zero-length body, or a bare null for a refusal
puts the most expensive lie in automation directly in front of the caller: a
source that genuinely holds nothing and a source that declined to show you
what it holds produce byte-identical answers unless the vocabulary keeps them
apart.

## Decision rules

- **When a refusal arrives, classify before you elect; elect before you
  spend.** No response may inspect the raw evidence and self-select.
- **When the elected set is empty, return immediately with the declared
  refusal.** Do not run the cheapest response "since it is cheap" — its price
  is not zero and its outcome is known.
- **When a response clears, record which one.** The provenance rides on the
  result, because the next reader of that result needs to know what produced
  it (see the trust-tier rule in this subject).
- **When you cannot name the status, omit it.** Never synthesize a code to
  fill a non-optional field.
- **When adding a new response, add it to an election, not to the sequence.**
  A response wired in without a class that elects it is a response that runs
  in cases nobody chose.

## When not to use this

If exactly one response exists and it is free — a stored credential replayed
on the next request, and nothing else — the classifier is ceremony. Try it,
and report the refusal honestly when it does not clear. The technique earns
its cost from the moment the second response exists, because that is the
moment the ladder acquires an order and the order acquires a price.

It also does not apply to a *scheduled* relationship with a source. There the
correct response to a refusal is to stop and tell a human, and a classifier
that elects responses is elaborate machinery pointed at a decision that has
already been made.

---
layer: technique
type: technique
subject: skill-adjacency-and-normalization
technique: unmodelled-term-graceful-fallback
status: forged
laws: [absence-of-evidence-is-not-evidence, say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [a requirement or claimed skill is not in the taxonomy, deciding how to handle unknown vocabulary, planning taxonomy maintenance]
---

# Unmodelled term graceful fallback

Vocabulary moves faster than any hand-maintained graph. New capabilities are
named, renamed and abbreviated continuously, and a matcher will meet terms its
taxonomy has never seen on most runs. The technique defines exactly what the
system may do with such a term — and, more importantly, what it may not.

## The two wrong answers

- **Drop it.** If an unmodelled requirement is skipped, the requirement silently
  disappears from the denominator and the candidate scores against a shorter
  list than the role actually has. If an unmodelled *candidate* term is skipped,
  a person who named the requirement verbatim is scored as though they had not
  — [absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)
  in its most direct form, and it lands hardest on the candidates working in the
  newest areas.
- **Guess a relationship.** Attaching an unknown term to the nearest-looking
  known one, by string similarity or by asking a model to place it, produces
  credit derived from a relationship no human ever asserted. That credit is
  indistinguishable at the interface from a curated one, and it is a claim the
  record does not hold.

## The fallback

An unmodelled term gets **literal identity, plus bounded token overlap, and
nothing else**:

- Normalize both sides with the same folding used everywhere else (case,
  diacritics, whitespace, punctuation) and compare on the word grid, per
  [whole-token-matching-over-substring](./whole-token-matching-over-substring.md).
- **Exact string identity scores as an exact match**, because it *is* one — the
  same term appears on both sides.
- **Partial token overlap earns a capped fraction**, described below.
- No hierarchy walk, no specialization or generalization credit, no sibling
  adjacency. There is no graph to walk; a term with no modelled parent has no
  neighbours, and giving it any is invention.
- The result carries a marker: this match was made without taxonomy support.

The marker is what makes the fallback honest rather than merely permissive. It
lets the interface hedge correctly, lets analytics separate curated matches from
literal ones, and — most valuably — makes the gap countable.

## The bounded overlap, and why 0-or-1 is not good enough

Pure string equality is too blunt. Between two unmodelled surfaces there is
often real, decidable signal — one is the other plus a qualifier, or the same
phrase reordered — and collapsing that to zero produces a *false miss* on
exactly the vocabulary the graph has not reached yet: the newest terms and the
least-modelled families. A graded, deterministic, bounded overlap is the honest
middle:

- **Compare distinctive token sets, not strings.** Fold both surfaces, split on
  word boundaries, then drop tokens too short to be distinctive and tokens from
  a stopword list. The stopword list must include grammatical glue in *every*
  supported language and the generic role filler that appears in half of all
  skill phrases — the words for engineer, manager, specialist, analyst,
  experience, team. A shared filler word is not a shared capability.
- **Require at least one shared distinctive token.** This single rule kills the
  classic false positive: two phrases of the form "management of X" and
  "management of Y" share only glue, so their distinctive sets are disjoint and
  the score is zero. Without it, phrase-shaped requirements match each other
  everywhere.
- **Score by set overlap over set union**, so that extra tokens on either side
  drag the score down. Mere presence of a shared token is not enough; the
  *degree* of overlap is what is being measured, and a one-token surface
  matching a four-token phrase should score far below a near-identical pair.
- **Scale the result into a hard cap that sits strictly below the weakest
  curated adjacency tier.** The full ordering to defend is: exact, then
  specialization, then generalization, then sibling, then token-overlap
  fallback, then nothing. A guessed relationship must never outrank one a human
  wrote down.
- **The overlap path never returns a full match.** Full credit is owned by the
  callers — literal identity for an unmodelled pair, hierarchy resolution for a
  modelled one. Keeping the ceiling in the overlap function means no fallback
  path can manufacture a possession.

The short-token filter carries a second, non-obvious benefit: single- and
two-character capability names, which are the most dangerous surfaces in any
matcher, reduce to empty distinctive sets and score zero rather than colliding
with each other.

## The one-sided case: a modelled term against its own unmodelled variant

The case everyone forgets is the pair where *exactly one* side resolves. An
exact surface match is impossible there by construction — an identical string
would have resolved to the same term — so the naive implementation returns a
hard zero, and that zero is false whenever the unresolved side is a near variant
of the modelled term's own vocabulary.

The fix is to score the unresolved surface against the resolved term's **full
alias set**, taking the best overlap, under the same cap. A modelled term versus
a slight rewording of one of its own surfaces then earns sub-threshold adjacency
credit instead of registering as a miss. It still can never reach the match
threshold, which is the property that makes it safe: the system is saying "these
look related", not "this is held".

## Unmodelled terms are a work queue

Every unmodelled encounter is a datum about what the taxonomy is missing. Log
the term, the family the surrounding role belonged to, and the language it was
written in, then rank by frequency. The top of that list is the highest-value
taxonomy work available at any moment, and it is derived from real traffic
rather than from what a maintainer last happened to read.

Two rules keep the queue from becoming noise. Fold the queue by normalized form
before counting, or one capability appears as nine entries and none of them look
urgent. And review the queue on a cadence, because its whole purpose is that a
term appearing hundreds of times should not stay unmodelled for a quarter.

The queue also serves as the honest measure of the fallback's scope: a system
where most matches arrive through the fallback does not have a graceful
fallback, it has an unfinished taxonomy pretending otherwise.

## Rendering

A literal match without taxonomy support is *weaker information* than a curated
exact match, and the difference must survive to the surface — not as a lower
score, since the term genuinely matched, but as a different label. What the
system knows is "the same string appears in both documents"; what it does not
know is whether the two writers meant the same thing by it, which is exactly the
judgment a curated term encodes. Say the former and not the latter —
[inference must look like inference](../../../_laws.md#inference-must-look-like-inference).

Where an unmodelled term is central to a role — a requirement the whole hire
turns on — the honest recruiter-facing move is to say the term is unrecognised
and let a human confirm it, rather than to present a literal string collision as
a capability assessment.

## Decision rules

- **When a requirement is unmodelled and the candidate's record contains the
  same term**, credit an exact match, marked unmodelled.
- **When neither side resolves and the surfaces share distinctive tokens**,
  credit the capped overlap and classify it as adjacency, never as a match.
- **When a requirement is unmodelled and nothing in the record matches
  literally or by distinctive-token overlap**, report it unaddressed *and*
  unmodelled. Those are different
  facts: the second says the system had no vocabulary for the question, and a
  recruiter should read it as a prompt to check by hand, not as a finding.
- **When a candidate's term is unmodelled and no requirement matches it**, keep
  it on the profile as a self-asserted claim at whatever provenance its basis
  earns. Do not discard it because the graph is thin.
- **Never let an unmodelled term participate in a hard or statutory gate.** A
  literal string collision cannot establish a licence.
- **Never let the fallback's convenience become the reason not to extend the
  graph.** Track the fallback rate per family as a health metric, and treat a
  rising one as taxonomy debt.

## When not to use this

- **Do not apply the fallback to terms that are modelled.** If the taxonomy
  holds the term, its aliases and hierarchy are better evidence than a string
  comparison; falling through to literal matching on a modelled term means the
  surface set is incomplete and should be fixed there.
- **Do not use it as a general-purpose skill extractor.** It answers a
  containment question about two texts. Deciding *which* strings in a document
  are capability claims at all is extraction work, upstream of here.
- **Do not let it mint taxonomy entries automatically.** The queue exists so a
  human asserts the relationships; a graph that grows itself is a graph nobody
  reviewed.

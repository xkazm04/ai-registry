---
layer: golden-path
type: golden-path
subject: public-money-attribution
status: forged
use_when:
  - summing public contracts or subsidies toward a named official
  - designing a "money reachable by a politician" metric
  - deciding whether an institution's spending belongs to a board member
  - publishing a money figure next to a person's name
techniques:
  - owner-operator-vs-steward-split
  - entity-level-deduplication
  - public-body-classification
  - floor-versus-total-disclosure
  - citable-money-claims
---

# Public-money attribution

Attribution is the arithmetic that turns "this official has ties to these
entities, and these entities received this public money" into a figure that may
be printed next to the official's name. It is the single most
defamation-sensitive computation in accountability work, because every mistake
it can make is asymmetric: an overstated figure is a false accusation of
enrichment against a real, named person; an understated one is merely a weaker
story. The naive reading — join officials to entities, join entities to
spending, sum — produces a number on the first afternoon, and that number is
wrong in at least four independent ways. The whole subject is the discipline of
naming those four ways and closing each one deliberately.

## The four errors of the naive sum

**Error one: counting money per tie instead of per entity.** Money reaches the
public through an entity's contracts, not through a relationship record. Two
officials on the same board do not double the state's spending; one official
holding two roles at the same firm does not double it either. Any pipeline that
sums over the tie table rather than over deduplicated entities inflates
silently, and inflates *most* exactly where the story is hottest — well-connected
entities carry the most ties. The fix is [entity-level-deduplication](techniques/entity-level-deduplication.md):
collapse to one row per entity first, decide everything else afterwards.

**Error two: merging stewardship with ownership.** A supervisory seat on a
public hospital, a waterworks, a state fund is not the same relationship as
owning a supplier firm, and the money is not the same money: the institution's
contracting is its own public mandate, never the official's enrichment. Yet the
join treats both as "tie". In practice steward-side money tends to *dwarf* the
attributable side — in one measured corpus it was roughly nine tenths of the
raw total — so an undifferentiated headline is not slightly wrong, it is false
at an order of magnitude, and false in the defamatory direction. The split is
therefore not a presentation option; it is part of the definition. See
[owner-operator-vs-steward-split](techniques/owner-operator-vs-steward-split.md).

**Error three: deciding "public body" from the name.** Whether an entity's
money is its own public activity cannot be read off its name or even its legal
form alone. Publicly owned holding companies routinely wear ordinary private
legal forms; a name-keyed test catches every ministry and misses exactly the
large, interesting cases — in one incident the miss was the single largest
figure of its batch. Classification must walk ownership, must be built from
verified allowlists rather than a closed-world guess, and must send every
unrecognized case to `unknown`, never to `private`, because the expensive error
is hanging a public body's budget on a person. See
[public-body-classification](techniques/public-body-classification.md).

**Error four: presenting a capped read as a census.** Ingest pipelines cap:
per-entity page limits, truncated registry reads, bounded corpora. A sum over a
capped corpus is a *floor*, and printing it under a heading that says "total"
converts an honest lower bound into a fabricated total. The cap must be
detected, carried through the arithmetic as metadata, and rendered as "at
least" — and the detection itself must know whether it is looking at the whole
corpus or at one person's slice, because a cap signature that is meaningful at
corpus scale is pure noise at slice scale. See
[floor-versus-total-disclosure](techniques/floor-versus-total-disclosure.md).

## One definition, or several answers to one question

These rules only hold if they exist exactly once. The characteristic decay mode
of a live product is that each surface — the population ledger, the per-person
case file, the reviewer's queue — grows its own restatement of "reachable
money", and the restatements drift: one deduplicates and splits, another sums
per tie across all classes, a third shows three tiles with no split at all,
and all three call the result the same words. At that point the product holds
several different numbers for the same question and every one of them is
citable against the others. The remedy is structural, not editorial: the
attribution rules live in one pure, dependency-free module — the predicate
"may this tie's money be read as reaching the person", the per-entity
collapse, the split, the reach arithmetic — and every surface imports it. A
caller may vary exactly one thing: what it knows about the completeness of its
*own* read. Nothing else is a parameter.

The same discipline applies one level down. The vocabulary that classifies a
tie (marker lists, role keywords), the text-normalization used to compare
names, the thresholds — each copied instance is a future divergence, and in
this domain measured divergences have a habit of breaking in favor of named
firms, because the copy that drifted is the one that stopped recognizing an
entity as public.

## Classification is a judgment; the pipeline must know whose

A tie's class — owner, manager, steward — ultimately determines whether money
is attributable, so *where the class came from* is part of the claim. A
heuristic guess over free-text strings is a lead; an analyst's recorded ruling
with the registry open is a judgment. The store must keep them distinguishable:
a recorded class wins over a recomputed guess (otherwise every human
correction becomes dead data, silently re-overwritten at read time), the guess
is still always computed so that disagreement between the two is *surfaced*
rather than swallowed, and the surface never claims a class was human-reviewed
when the write path cannot prove it — a stored value may simply be an older
vintage of the same heuristic. Attribution inherits the weakest link of its
classification, and honesty about that link is what separates a lead from a
finding.

Mixed evidence resolves conservatively but explicitly: when one entity's ties
disagree about class, the entity counts as attributable if *any* tie is an
ownership or management tie. "Whichever record the scan returned first" is not
a rule; a stated precedence is.

## A number is a claim, and a claim has a state

The end product of attribution is not a dashboard figure; it is a sentence a
journalist will copy: "firms tied to this official received at least this
much." That sentence is a claim, and a claim needs an address, a derivation,
and a gate state. The figure must be minted from the shared arithmetic (never
re-added at the point of citation), must name exactly the quantity the reader
is looking at, and must carry the human-review status of the ties beneath it —
with the aggregate counting as verified only when *every* constituent tie is
verified. One confirmed tie plus four unreviewed ones is a pending claim, not a
verified one. And the strictest surfaces — an evidence packet handed to an
editor — admit only human-verified material, and *disclose* what the gate
excluded rather than silently shrinking. See
[citable-money-claims](techniques/citable-money-claims.md).

## What a principal practitioner holds true

- The defamatory direction is the expensive one. Every default, every
  fallback, every unknown resolves *away* from attribution to the person and
  *toward* disclosure to the reader.
- The split is the definition, not a view. Any figure that merges steward
  money into an official's headline is false, whatever the footnote says.
- Deduplicate entities before any other operation; every downstream rule
  assumes one row per entity.
- Public-body status is an ownership fact, not a naming convention, and
  "unknown" is a first-class verdict that blocks attribution.
- Capped reads yield floors; floors say "at least"; the cap and its population
  travel with the number.
- The arithmetic exists once, in a pure module every surface imports; the only
  per-caller degree of freedom is the caller's knowledge of its own read.
- A number without an address, a derivation, and a gate state does not render.
- Machine classification is a lead. Attribution asserted in public rests only
  on the parts a human verified, and the copy says which parts those are.

Held together, these rules let a small team publish money figures about
powerful named people and survive the scrutiny that follows. Dropped one at a
time, each produces a number that is bigger, simpler, more quotable — and
indefensible.

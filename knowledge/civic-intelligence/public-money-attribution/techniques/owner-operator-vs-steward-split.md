---
layer: technique
type: technique
subject: public-money-attribution
technique: owner-operator-vs-steward-split
status: forged
laws: [one-definition-one-import, lead-not-finding]
shared_with: []
use_when:
  - classifying an official's tie to an entity for money purposes
  - building the headline figure of a money surface
---

# Owner-operator vs steward split

Not every tie between an official and an entity means the entity's money can
reach the official. The technique names three classes and makes the boundary
between the last one and the first two the load-bearing wall of the whole
attribution:

- **owner-operator** — the official owns or controls a private entity that
  supplies the state. This is the canonical follow-the-money relationship: the
  entity's public contracts are plausibly the official's income.
- **manager** — a directorate seat at a private entity. Weaker than ownership,
  still an attributable relationship: the official runs the thing that the
  state pays.
- **steward** — a supervisory or board seat at a public or nonprofit body: a
  hospital, a utility, a university, a state fund. The body's contracts are
  its *own* public activity. Officials are appointed to such seats *because*
  the body is public; reading its budget as their money inverts the meaning of
  the seat.

## Why the split is the definition, not a filter

Steward-side money is typically the bulk of the raw join — public bodies are
large and contract constantly, private firms tied to officials are small and
contract occasionally. In one measured corpus steward money was roughly 91% of
the raw total. That ratio is the decision rule's justification: **when the
excluded category dominates the raw sum, an undifferentiated figure is not an
approximation, it is a different (and false) claim** — off by an order of
magnitude, in the defamatory direction. So the split may never be a rendering
choice layered on top of a merged total. The shared arithmetic returns *both
buckets, always*, and callers are permitted to render either or both but never
their merge as a person-attributed figure. The one legitimate consumer of the
combined number is a scale that explicitly means "the whole reachable
surface" — and it must be labeled as that, not as the official's money.

## Decision rules

- **When a tie is steward, its entity's money never enters the attributable
  bucket** — no threshold, no exception for suspiciously large figures. A
  suspicious steward seat is a lead for human investigation, not a
  reclassification.
- **When classifying, encode the predicate once.** "Attributable" means "class
  is not steward". That predicate belongs in one importable function; every
  inline `!== "steward"` restatement elsewhere is a copy that will drift into
  calling a hospital's contracting an official's money
  ([one-definition-one-import](../../_laws.md#one-definition-one-import)).
- **When the class comes from a heuristic, say so.** Free-text classification
  (entity name markers × role keywords) is a guess and must be labeled as
  derived wherever it decides rendering. A class recorded by an analyst with
  the registry open takes precedence over the recomputed guess — otherwise
  human corrections are silently overwritten at every read — but precedence is
  not provenance: a stored value can itself be an older vintage of the same
  heuristic, so the copy may claim human review only where the write path
  proves it ([lead-not-finding](../../_laws.md#lead-not-finding)).
- **When stored and derived disagree, surface the disagreement**; do not
  quietly pick the winner and discard the signal. Disagreement counts are a
  corpus health metric, and their drift history matters: measured drifts in
  classification vocabularies have favored named firms.
- **Color and caption by the class, everywhere.** The alarm styling that means
  "the official's own firm supplies the state" on a steward row is the visual
  form of the same defamation the arithmetic guards against.

## When not to use it

The split classifies the ties it is given; it does not choose them. Holdings
parked with relatives or nominees, and control routed through intermediate
entities, never reach its input — that is the
[attribution-perimeter](attribution-perimeter.md)'s question, and a narrow
perimeter makes even a correctly split attributable bucket a floor.

The split answers *attribution*, not *interest*. Do not use it to decide what
humans should investigate — a steward seat at a body awarding contracts to the
official's other firms is precisely a conflict-of-interest lead, and the split
must not launder it out of review queues. Nor is it a fraud verdict: an
owner-operator tie with large reach is a fact pattern, not an accusation, and
everything downstream still passes through human verification before it is
asserted.

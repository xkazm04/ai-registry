---
layer: technique
type: technique
subject: conflict-of-interest-detection
technique: tie-class-taxonomy
status: forged
laws: [one-definition-one-import, disclose-never-repair]
shared_with: []
use_when:
  - classifying official-to-entity relationships before any join or sum
  - a money total mixes ownership stakes with board and supervisory seats
  - deciding how strongly a tie should weight a conflict score
---

# Tie-class taxonomy

"Official linked to entity" is the rawest edge in accountability data, and
left raw it is the most defamatory: it puts a minister's supervisory seat on
a public hospital in the same bucket as their spouse-run supplier firm. The
technique is a small, closed, declared vocabulary of relationship classes,
assigned to every tie at ingestion and carried — never re-derived ad hoc —
through every join, score, cap and rendering downstream.

## The three-class core

Three classes cover the overwhelming majority of real corpora, and resisting
a larger vocabulary is most of the craft:

- **Owner-operator** — the official controls or owns a private entity that
  transacts with the public sector. This is the canonical conflict shape:
  public money reaching the entity is personal enrichment in potential, and
  every decision touching the entity's channel is self-interested in
  structure. Full weight in every score.
- **Manager** — a directing seat (board of directors, executive role)
  without established ownership. Influence over the entity, and often
  compensation from it, but the money is not the official's in the way an
  owner's is. Intermediate weight.
- **Steward** — a supervisory or oversight seat, typically on a public,
  municipal or nonprofit body. The body's spending is its *own public
  mandate*; the seat is frequently ex officio. Counting the body's contracts
  as the official's reachable interest is a category error that measured
  corpora show dominating raw totals — the steward side can be the large
  majority of an undifferentiated sum. Minimal weight, and excluded from
  any headline that implies enrichment.

The classes are ordinal in conflict-intensity but not merely a weight: joins
and review tiers branch on them by name. That is why the vocabulary must be
closed and live in exactly one module that every consumer imports, per
[one-definition-one-import](../../_laws.md#one-definition-one-import) — a
second, slightly different class list is a future discrepancy that will
favor or damn a named person.

## Assignment: recorded beats inferred, and the difference is disclosed

Classes come from two sources of very different grade, and the system must
track which one it is holding:

- **Recorded** — a class an analysis pass or a reviewer wrote onto the tie.
- **Derived** — a heuristic guess from the role's free-text title and the
  entity's name, computed at read time.

Resolution prefers recorded over derived, but the honest subtlety is that
*recorded does not mean human-verified*: bulk analysis passes typically
write classes using the same heuristic the read path would apply, so a
stored value may be a persisted guess. The product's copy must say only
what is true of the assignment's actual provenance — "classified by the
pipeline", not "confirmed" — and when a stored class disagrees with the
current heuristic, the disagreement is surfaced and counted, never silently
overwritten in either direction, per
[disclose-never-repair](../../_laws.md#disclose-never-repair). A repaired
class is an invented class; the disagreement itself is a review lead.

## Decision rules

- **When a tie cannot be classified, it gets no accusatory weight.** An
  unclassifiable role title falls to the weakest class or is held out
  entirely; it never defaults to owner-operator. The default direction of
  every ambiguity in this subject is away from accusation.
- **When summing money toward a person, sum per class or not at all.** A
  single mixed total is false at the order of magnitude the steward side
  contributes. Headline figures use the owner-operator (at most
  owner-operator + manager) partition; steward-side money renders separately
  and labeled.
- **When scoring, weight multiplicatively by class.** A class weight that
  merely adds points lets enough steward money outrank a modest
  owner-operator tie; a multiplicative weight keeps the class distinction
  dominant at every money scale.
- **When the registry corroborates the role, re-read the class from the
  registry's role text**, which is more precise than a scraped title —
  corroboration and classification reinforce each other.

## When not to use it

Do not build the taxonomy finer than decisions require. Sub-classes
(majority vs minority owner, chair vs member) earn their existence only
when some join, weight or rendering actually branches on them; otherwise
they add classification error without adding discrimination. And do not
apply the taxonomy to *entity-to-entity* relationships (parents,
subsidiaries) — that is ownership resolution, a different problem with
different failure modes, and forcing it through a person-tie vocabulary
mislabels both.

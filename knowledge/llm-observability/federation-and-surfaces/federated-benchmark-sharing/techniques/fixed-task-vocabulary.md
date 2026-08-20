---
layer: technique
type: technique
subject: federated-benchmark-sharing
technique: fixed-task-vocabulary
status: forged
laws: [aggregates-leave-identity-behind]
shared_with: []
use_when: [publishing any categorical field across an organizational boundary, mapping internal benchmark names to shareable labels, reviewing a shared schema for free-text channels]
---

# Fixed task vocabulary

Organizations name their benchmarks after their business:
"claims-triage-v3", "onboarding-email-tone", "prod-widget-regression". A
benchmark name is a confession — of product line, of internal roadmap, of
the existence of a project — and it is also a perfect join key: two digests
carrying the same odd name are the same contributor, k-floors be damned.
Free text must never cross the boundary. Every categorical field on the
wire draws from a **fixed, small, closed vocabulary**, and everything
internal is classified into it before publication.

## The mechanism

Maintain one canonical list of task categories — on the order of ten:
summarization, question answering, extraction, classification, translation,
coding, retrieval-grounded, reasoning, generation, and a `general`
catch-all. A pure classifier maps an internal benchmark name (plus an
optional explicit hint the operator can set) onto the vocabulary: lowercase,
keyword-match most-specific-first, first hit wins, default to `general`.
The function's contract is total: **any input returns a member of the
vocabulary** — there is no path by which custom naming reaches the wire.
That contract is the unit test worth writing: feed it garbage, assert the
output is in the list.

Two design choices matter more than the keyword table itself:

- **Most-specific-first ordering.** Real names match multiple keywords
  ("summarize support tickets" hits both summarization and
  question-answering stems); the table's order is the tie-break, so order
  it from narrow categories to broad and treat reordering as a semantic
  change, not a cleanup.
- **An explicit hint beats inference.** Classification by keyword is a
  heuristic and will miscategorize; give operators a per-benchmark tag that
  feeds the same classifier. The hint is still classified — never passed
  through — so a hostile or careless hint cannot mint a new category.

## Why the vocabulary must stay small and closed

Every added category is cardinality, and cardinality is fingerprint
surface: a category only one contributor ever populates identifies them by
its mere presence, and rare *combinations* of categorical values isolate as
effectively as names. The same rule governs every other enum on the wire —
reproducibility levels, coverage tags, judge families: a fixed list,
canon-clamped at ingest, where an unrecognized value becomes "not recorded"
rather than a new member. A contributor must not be able to widen any
vocabulary by sending a creative string; the hub's clamp is what makes the
closure real rather than aspirational.

Resist per-contributor extensibility hardest. The moment "our use case is
special, add a category for it" wins, the vocabulary starts ratcheting —
it only ever grows — and each grant makes the next harder to refuse.
Growing the shared vocabulary is a schema-version event with a review, not
a courtesy.

## Decision rules

- **Coarse and shared beats precise and unique.** A miscategorized bucket
  costs a little comparability; a leaked name costs confidentiality. When
  the classifier is unsure, `general` is the correct answer, not a better
  guess.
- **Classify at the source, clamp at the hub.** The contributor never sends
  a raw name; the hub never trusts that it didn't. Both ends enforce,
  because each end's failure is invisible to the other.
- **The catch-all is a feature, not a defect.** A large `general` share
  means the vocabulary under-fits the traffic — a signal to *deliberately*
  evolve the shared list, never to let names through while you decide.
- **Version the vocabulary with the schema.** Mergers across contributors
  assume the labels mean the same thing; a silently renamed or re-scoped
  category corrupts every historical row it touches.

## When not to use it

Inside the organization, keep the real names — they carry the meaning your
own engineers navigate by, and mapping them to coarse categories internally
would only degrade your own dashboards. The classification happens once, at
the boundary, on the way out. And where contributions are *signed and
attributed by design* (a public consortium publishing named results), the
vocabulary can be richer — the fingerprint argument evaporates when
identity is the point — though a shared taxonomy still pays for
comparability.

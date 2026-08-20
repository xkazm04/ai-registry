---
layer: technique
type: technique
subject: politician-performance-scoring
technique: participatory-reweighting
status: forged
laws: [one-definition-one-import, deterministic-code-owns-numbers, every-cap-ships-its-population]
shared_with: []
use_when: [letting readers re-weight a published index, aggregating reader weight preferences, sharing a custom weighting as a link]
---

# Participatory reweighting

The weights of a composite index are its most contestable element — reasonable
people disagree about whether voting participation outranks legislative output.
Reweighting turns that contest into a feature: the reader adjusts the component
weights and sees the ranking under their own priorities. Done carelessly it
destroys the product's central asset — one official, checkable number — so the
technique is mostly boundary enforcement.

## The absolute boundary: two artifacts, never a blend

The authoritative score is computed by the published formula and stored with its
lineage. The reader's lens is a **recomputation under the reader's stated
parameters**, and the two never mix on one surface:

- **At published defaults, the lens does not run.** The surface shows the
  official stored numbers, byte-identical for every reader. The lens is not "the
  same math, so it doesn't matter" — recomputing the default path invites subtle
  divergence (rounding order, stale component data) between two numbers that
  claim to be the same one.
- **The moment any weight differs, everything switches.** Scores, ranks,
  distributions, head-to-heads — all derive from the recomputation and all carry
  a "your index" label. A page showing official ranks beside custom scores
  asserts a hybrid methodology nobody published.
- **Recompute from what the reader can see.** The lens takes each component's
  *published* fulfillment (published points over published weight, at published
  precision) — not raw internal values. Then the reader can verify the custom
  index by hand from the page, which is the entire promise.

## The lens rule is itself a published rule

The reweighting is deterministic math with its own disclosed cascade:
normalization of the reader's sliders to effective weights summing to the
published total (so two lenses differing only in scale are the same lens),
stated rounding, and the same ranking rule as the official list — competition
ranking, with the meaningless stability tie-break named as meaningless. The
codec that encodes a lens into a shareable address has **one definition**,
imported by every consumer; the published-default lens encodes as the empty
address, so a clean link means the official method. An inbound lens that fails
the parameter grammar is **rejected, never repaired** — a repaired lens
attributes a weighting to an author who never chose it, and the link *is* a
claim about method.

## Aggregating reader preferences

Collecting submitted lenses ("how would readers weigh it?") is a legitimate
second product with three hard rules:

- **Normalize before aggregating.** Aggregate over effective weights, so scale
  duplicates collapse to one vote; a vector with zero total carries no lens and
  is excluded from the count.
- **K-anonymity floor.** Publish a per-component median only at or above a named
  minimum of valid submissions; below it, show only the count. A "median of
  three" effectively publishes individual ballots. And publish honestly what the
  aggregate is: per-component medians generally do not sum to the total — say
  so rather than renormalizing the result into a lens nobody submitted.
- **Disclose self-selection.** The aggregate describes the product's readers,
  not the population; every surface showing it says so. An unlabeled reader
  poll rendered next to an official index borrows authority it does not have.

## When not to use this

Do not offer reweighting before the official decomposition is fully published —
a lens over undisclosed components is a toy. Do not extend the lens beyond
weights (letting readers change caps or denominators multiplies the parameter
grammar and the explanation burden past what a surface can carry). Do not
attribute preset lenses to real organizations — inventing "how group X would
weigh it" fabricates an authority's position; presets are labeled editorial
examples. And never feed aggregated reader preferences back into the official
weights automatically: the official formula changes only through the published
correction-and-recompute path, with a human deciding.

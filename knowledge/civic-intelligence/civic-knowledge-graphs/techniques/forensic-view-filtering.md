---
layer: technique
type: technique
subject: civic-knowledge-graphs
technique: forensic-view-filtering
status: forged
laws: [lead-not-finding, disclose-never-repair]
shared_with: []
use_when: [rendering a graph that mixes verified and machine-proposed edges, defaulting a public reading surface, showing per-entity review status]
---

# Forensic view filtering

The concern: the store legitimately holds claims at different trust grades —
human-verified edges beside machine matches still pending review — but a
reading surface that renders them in the same ink launders the weakest claims
with the credibility of the strongest. Forensic view filtering is the display
discipline: default to the verified layer, count what you hide, and never
subtract a step from an answer the reader explicitly asked for.

## Default to what a human stands behind

In the graph's forensic reading mode, the ambient landscape — the hairball a
reader explores without having asked a specific question — shows only edges
that passed human review. Per
[lead-not-finding](../../_laws.md#lead-not-finding), a pending machine match is
a lead; painting it into the default landscape *asserts* it to every reader who
will never open its detail. The filter runs at the edge level against review
state, and it must preserve input order — a filter that also reshuffles is two
behaviors in one function, and the second one breaks visual stability and
testability for free.

Suppression must be **counted, not silent**. The surface states "N unverified
ties hidden" wherever the filter applied. Per
[disclose-never-repair](../../_laws.md#disclose-never-repair), hiding is a form
of withholding, and withholding is honest only when disclosed: a reader told
that eleven machine matches exist but are unshown has been informed; a reader
shown a clean graph has been told the record is clean, which is a different and
false claim. The counted-suppression rule is also what keeps the filter
non-partisan — the count is symmetric machinery that cannot be accused of
curating who looks clean.

## The requested-answer exception

The filter has one hard exception, and it is a rule, not a loophole: **edges
explicitly requested by a lens are never filtered.** When the reader asked a
question whose answer is a specific edge set — a computed evidence path, a
curated trail, an entity's full record — every hop renders even if pending,
because *a requested answer with omitted steps is a lie*. A path finder that
reports a four-hop connection while the view silently draws three hops has
fabricated a shorter, cleaner-looking connection than the one that exists.

The exception carries its own disclosure: hops kept only because a lens
requested them remain visually distinct (the pending treatment — dashed,
flagged), and their count is reported separately from the hidden count. The
reader thus sees three honest numbers: what is verified, what was hidden from
the ambient view, and what is shown-but-pending because they asked.

Mechanically, the lens communicates its kept set by canonical edge identity —
one edge-key definition (source, relation, target) shared verbatim by the lens
that requests and the filter that honors, defined once and imported, because a
formatting drift between two copies of that key silently turns "never filter
requested edges" into "sometimes filter them".

## Counts tell the truth about the record, not the view

Any summary the surface offers about an entity — a hover card, a badge, a
review-status breakdown — is computed from the **unfiltered** edge list. The
card answers "what does the record hold about this entity", and the answer
does not change when the reader toggles a display mode. A card computed from
visible edges reports "0 pending" for an entity with eleven hidden pending
ties — the exact deception the mode exists to prevent, produced by the mode
itself. Show the split per relation (verified vs pending), rank by volume with
a deterministic tie-break, and when the breakdown is truncated to fit, say how
many relations did not fit.

## Decision rules

- When adding a new trust grade (e.g. a "corroborated but unconfirmed" state),
  decide its default-view fate explicitly and add it to the counted
  disclosure — an unclassified grade that falls through to "visible" has
  been silently verified by omission.
- When a non-forensic casual mode exists alongside, the *data* is identical
  and only defaults differ; the toggle is a view preference, never a second
  query path that could drift.
- When a reader interacts with a hidden edge's endpoint (search, deep link),
  resolve the target and surface its pending edges in requested-answer terms
  rather than pretending the entity is isolated.

## When not to use it

Filtering by trust presupposes per-claim review state; on a graph whose every
edge is deterministic public record (a pure registry mirror with no proposed
layer), there is nothing to filter and the mode adds a confusing toggle with
one position. And never apply forensic filtering to the *analyst's* working
surface: review queues and verification consoles exist precisely to show the
pending layer — filtering it there deadlocks the pipeline that feeds the
public view.

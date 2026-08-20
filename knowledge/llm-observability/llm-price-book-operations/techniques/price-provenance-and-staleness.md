---
layer: technique
type: technique
subject: llm-price-book-operations
technique: price-provenance-and-staleness
status: forged
laws: [estimation-announces-itself]
shared_with: []
use_when: [auditing where a cost figure came from, maintaining the price book against provider page changes, deciding whether a cost dashboard can be trusted]
---

# Price provenance and staleness

Every number in a price book is a transcription of a claim somebody else
published and may change without telling you. That makes the book a *dated
secondary source*, and the technique is to treat it as one: every row and the
book as a whole carry enough provenance that a reader can answer, from the
artifact alone, three questions — **where did this rate come from, since when
has it applied here, and how much should I trust it today?**

## Row-level provenance: two fields, both load-bearing

Each price row carries:

- **An effective date** — when this rate took effect *in this system*
  (server-stamped at write). Note what this is not: it is not the provider's
  announcement date. The distinction matters at audit time — "the provider cut
  the price on the 3rd, our book followed on the 9th" is a six-day tranche of
  overstated cost, and the effective date is what makes that tranche
  computable instead of anecdotal.
- **A source link** — the provider page (or announcement) the rate was
  transcribed from. Its job is re-verifiability: the maintainer six months
  from now must be able to re-derive or refute the row without archaeology.
  A row whose source is gone or changed is due for re-verification, not
  quiet trust.

Because rows are self-contained (variants included), provenance is uniform:
the long-context tier row and the batch row each say where *their* number came
from, which matters because providers publish lanes on different pages and
change them on different days.

## Book-level provenance: the metadata block

The seed document — and any exported view of the book — leads with a metadata
block declaring:

- **Unit and currency**, explicitly. "Per million tokens" versus "per thousand"
  is a 1000× error that type systems cannot catch; the declaration is the only
  defense, and every consumer that renders a price repeats the unit it
  believed.
- **A last-verified date** — when a human (or a verifying job) last checked
  the whole book against the provider pages. This is the book's honesty
  heartbeat, distinct from any row's effective date: rows change when prices
  change, but *verification* is what asserts the unchanged rows are still
  right.
- **Sources** — the canonical provider pricing pages, as a list, so
  verification is a bounded checklist rather than a research project.
- **Declared non-coverage.** The most valuable line in the block is the one
  that says what the book deliberately does not model — "length tiers for
  these models are not modeled; the standard rate is used; verify before
  trusting cost dashboards." Per
  [estimation-announces-itself](../../_laws.md#estimation-announces-itself),
  the reader must learn the estimate's limits from the payload itself. A book
  that states its gaps converts a class of silent systematic error into a
  known caveat; a book that states nothing is read as complete, and its gaps
  are discovered by invoice.

## Staleness is a measurable condition, not a vibe

Providers reprice on an observable cadence — historically a few major moves a
year per provider, plus lane/tier introductions. That gives staleness an
operational definition: **the book is stale when its last-verified date is
older than the shortest repricing cadence among the providers it covers.**
Decision rules that follow:

- Put re-verification on a calendar (monthly is a defensible default), and
  treat a failed check — a source page that moved or changed — as a work
  item with the same urgency as a data-quality bug, because that is what it
  is.
- Surface book age where cost is asserted. A margin report resting on a book
  last verified two quarters ago should say so; the reader's trust must be
  calibrated by the artifact, not by their optimism.
- On every model launch you adopt, the row's absence is *already* visible as
  unpriced traffic — wire that signal to the maintenance loop. Unpriced
  events naming an unknown model are the book requesting its own update.

## What provenance is for

Provenance is not ceremony; each field discharges a real dispute:

- *"Why does our cost disagree with the invoice?"* → effective dates bound the
  mispriced tranche; source links show which page version was transcribed.
- *"Who set this rate and on what basis?"* → the write path stamped the row;
  the source link grounds it. A row with neither is a rumor with decimal
  places.
- *"Can we trust the dashboard for the board deck?"* → last-verified plus
  declared non-coverage answer it honestly in two lines.

## When not to use it

There is no deployment where provenance is skippable — but there is a scale
where it is *implicit*: a single-model builder with one constant can carry
provenance as a code comment with a link and a date, and that is the whole
technique at that scale. The failure is not "too little ceremony at small
scale"; it is carrying the code-comment posture into a multi-provider book
where nobody can any longer say which of forty rows was checked when.

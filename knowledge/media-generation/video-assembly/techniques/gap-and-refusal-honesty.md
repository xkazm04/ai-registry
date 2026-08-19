---
layer: technique
type: technique
subject: video-assembly
technique: gap-and-refusal-honesty
status: forged
laws: [refusal-is-a-state, output-never-outruns-evidence]
shared_with: []
use_when: [presenting a cut with missing or refused material, reviewing an assembly surface for claims the system cannot back, deciding what a refused generation should look like in the cut]
---

# Gap and refusal honesty

An assembly accumulates failures — a scene never rendered, a music cue the
provider refused, a capability the product has not built — and the technique
is the discipline of drawing them **as first-class states of the cut**
rather than hiding them, papering them, or claiming their absence. The
governing test for every element of an assembly surface: *could the system
back this claim right now?* A block claims material exists; a coverage
sentence claims a measurement; a button claims an action; a paragraph about
playback claims a player. Anything unbacked either gets built or gets
removed — never left standing as decoration.

## The state vocabulary

Keep the failure states distinct, because they demand different responses:

- **Missing** — the slot is planned and nothing backs it. Drawn as an
  explicitly empty-styled block *in its place on the clock* (dashed,
  hollow — visibly not the same as a filled block), never omitted. The
  reader's question is "what do we still owe?", and the timeline answers it
  spatially.
- **Refused** — a generator was asked and declined. This is a terminal
  outcome of a request, not a retriable hiccup and not an empty success.
  The region renders as what it actually is (silence, black) *and says so*,
  with the cost stated in the cut's own currency: which seconds of the
  clock are affected, out of what total.
- **Silent / unspotted by choice** — nothing was ever requested. Must stay
  distinguishable from refused: one is a design decision, the other a
  provider outcome, and merging them destroys the information a re-spotting
  pass needs.

The distinctions mirror the applied/rejected/missing separation used when
validating generated scenes: each state has a different owner and a
different next action, and any display that collapses two of them has
pre-decided the response for its reader.

## Computed, not narrated

Every sentence on the surface that summarizes the cut's condition — how
many seconds scored, which slots are empty, what fraction is covered — is a
reduction over the same data that draws the blocks. Hand-typed summaries
are correct on the day they are written and lies thereafter; a data edit
cannot leave a computed sentence behind. If a sentence cannot be computed,
it is either a claim about behaviour (see below) or it does not belong.

## No phantom capability

The sharpest form of the discipline concerns claims about what the system
*does*, not what the data *is*:

- **Copy that describes behaviour that does not exist** ("preview plays
  what exists and holds black over the gaps" — with no player in the
  build) is removed, not softened. If building the behaviour is out of
  scope, the honest replacement is a plain statement of what the surface
  actually is: a plan of the cut, not a playable cut.
- **Controls with no mechanism behind them** — a retry button for a music
  engine that is not wired, styled as the primary action — are removed. A
  dead control is worse than no control: it converts a visible system gap
  into an invisible user failure ("I clicked and nothing happened").
- **What replaces the phantom is a statement of the seam**: what a refused
  cue needs said is what happened and what it costs; what a missing
  capability needs said is that the seam exists and is unbuilt. Both are
  one sentence, and both survive scrutiny.

## Decision rules

- When choosing between hiding a gap and drawing it, draw it, because
  everyone reading the cut is allocating money or effort against its
  apparent completeness.
- When a provider refuses, record and display the refusal at the site of
  its cost (the region of the clock), not only in a log, because the person
  who must decide re-brief vs accept-silence reads the cut, not the log.
- When tempted to widen neighboring material to cover a refused region,
  don't, unless it is recorded as a design change — an automatic paper-over
  converts a provider failure into a silent edit nobody approved.
- When copy and capability disagree, capability wins: either build to the
  copy or cut the copy in the same change. A note to build later does not
  license the claim now.
- When a failure state is interactive (clickable, focusable), opening it
  should *lead with* the failure, not bury it — the refused cue's detail
  view states the refusal and its cost before anything else.

## When not to use this

Audience-facing deliverables are not status displays: the shipped video
itself does not carry "this cue was refused" cards — refusal honesty is for
the working surfaces where decisions are made, and the shipped artifact
either waited for the fix or accepted the silence as a choice. And in the
earliest sketch phase, before slots are commitments, an absent block is not
yet a "gap" — the technique engages at the moment a plan becomes a promise,
which is the moment someone else starts reading the timeline as truth.

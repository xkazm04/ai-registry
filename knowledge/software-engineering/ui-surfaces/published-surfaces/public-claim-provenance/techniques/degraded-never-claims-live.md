---
layer: technique
type: technique
subject: public-claim-provenance
technique: degraded-never-claims-live
status: forged
laws: [failure-not-empty-success, one-authority-per-vocabulary]
shared_with: []
use_when: [a public counter fetches at request time, deciding what a live badge may claim, all sources failed and the page must still render, tempted to add a baseline to a real count]
---

# Degraded never claims live

A public number derived at request time can be absent, complete, partial, or
missing entirely, and a surface that renders all four the same way has told
the reader nothing except that a number exists. Worse, such surfaces almost
always carry a badge asserting currency — *live*, *updated just now*, a
pulsing dot — and that badge is the cheapest lie available on a page, because
it is rendered by the layout rather than by the data. It appears whether or
not anything answered.

## The vocabulary is closed and defined once

Four states, one authoritative definition, every consumer deriving from it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):

1. **Loading** — no answer yet. The claim is *absent*, which is not the same
   as zero and must not render as zero. Reserve the space; do not fill it.
2. **Live** — every source answered. The value is derived, and the currency
   claim is licensed. This is the only state in which the badge may render.
3. **Partial** — some sources answered. The value is real over what answered,
   and the surface says which part is missing rather than implying the whole.
   A partial state that renders identically to live is a live state with extra
   steps.
4. **Seeded** — nothing answered. Placeholder values render so the layout
   holds, and the currency claim is **revoked**, not softened.

The states are derived from the **fetch outcome**, never from whether the
rendered value is non-zero. A plausible number proves nothing about its
source; a seeded figure and a live one are numerically indistinguishable by
construction, since the seed was chosen to look right. Deciding the state by
inspecting the value is the same category error as deciding a measurement is
valid because it fell in the expected range.

Keeping the vocabulary in one declaration matters more here than in most
places, because the states are consumed by the badge, the number, the
tooltip, and often a chart, and a second private copy of "are we live" in any
one of them is a race with a delay fuse — it diverges on the day someone adds
a fifth state.

## Seeding is allowed; wearing the badge is not

A marketing surface is entitled to prefer a plausible placeholder to an error
box. A broken-looking public page costs more credibility than a static figure,
the reader has no action to take on a failed fetch, and there is no operator
watching who needs the alarm — that is what the error reporting is for, on the
producing side.

What the seed may not do is claim to be current. Dropping the badge in the
seeded state is not a nicety; it is the whole of the technique's honesty,
because the badge is the only element on the page that distinguishes the two
states for the reader
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success): failure
must be spelled differently from success, and a seeded render *is* a failure —
a quiet one, correctly, but not a silent one).

The corresponding obligation on the producing side: a total fetch failure
renders quietly to the reader and loudly to the team. Quiet rendering plus
quiet logging is how a surface serves seed data for a year.

## Never blend a seed into a derived value

The worst state available is not the seeded one. It is the **sum**: a
hand-authored baseline added to a live count and rendered as one figure under
a currency badge. It appears for a familiar and sympathetic reason — the real
number is small and looks discouraging on a public page — and it is
categorically different from every other compromise here.

A blended figure is unfalsifiable to the reader *and to the team that built
it*. There is no predicate anybody can state for it: it is not the count of
anything, it does not correspond to any question, and no query will ever
reproduce it. The seed cannot be removed later without the public number
visibly collapsing, so the blend is permanent from the day it ships. And it
poisons the states around it: a partial fetch now adds the same baseline to a
smaller real count, so the surface moves for reasons unrelated to the world.

If a floor is genuinely wanted, it is a **separate, labelled component** —
stated beside the derived figure as the different thing it is — or it is
absent. Those are the two options; there is no third.

The rule generalises past addition. Any operation that leaves the reader
unable to say which value they are looking at — summing a baseline in,
substituting a minimum when the real figure falls below it, blending two
populations into one figure — produces the same defect on the surface, whether
or not the arithmetic behind it is defensible. Whether such a substitution is
a legitimate treatment of a measurement is a question about the measurement;
whether the surface may then present the result as an ordinary derived value
is this technique's question, and the answer is no. The displayed figure says
which of the two it is, or the surface has spent the reader's trust on a digit.

## Decision rules

- **When the surface can tolerate a gap, prefer absence to a seed.** A missing
  counter costs less credibility than a fabricated one that gets caught, and
  fabricated ones do get caught — by the most engaged reader on the page.
- **When the surface cannot tolerate a gap** (layout above the fold, a figure
  the design is built around), seed, drop the badge, and never sum.
- **When a refresh fails while real data is already drawn**, keep the drawn
  data, drop the currency claim, and state the vintage. Replacing good data
  with a seed on a failed refresh throws away the best information the surface
  has.
- **When a state is added**, add it to the one declaration and let every
  consumer fail to compile rather than fall through to a default. A default
  branch in a state machine about honesty will silently classify the new state
  as whichever one was cheapest to write.
- **When the badge is a design element the page cannot lose**, it is not a
  badge, it is decoration, and it must stop making a claim — change the words.
  A permanently rendered "live" is a permanently rendered assertion.

## When not to use this

A build-time claim has no load states, and giving it a badge invents a
liveness property it does not have — see
[build-time-derivation-off-the-client-bundle](./build-time-derivation-off-the-client-bundle.md).
A surface whose numbers all ship with the artifact is *more* current than one
with a pulsing dot, and it should say what it actually is: derived from this
release. Fabricated liveness on a static value is the same defect as a seed
under a badge, arrived at from the opposite direction.

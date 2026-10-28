---
layer: technique
type: technique
subject: status-vocabulary
technique: reserved-attention-hue
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [choosing the colour for items that wait for a person, attention colour spreads to warnings and stale data, a row still glows after the person acted]
---

# Reserved attention hue

A product that asks people to decide things needs one signal that means **this
waits for you**, readable across a dense screen in a glance. The cheap way to
get it is to borrow the warning colour; the cheap way to lose it is to let that
colour also mean stale, slow, over budget and "look here". Within a release the
signal means nothing, because every screen has a little of it, and the person
stops seeing the one row that was actually theirs.

The rule: **one loud colour is reserved for "waits for a person", and nothing
else in the product uses it.** It is a member of the status vocabulary with a
single meaning, owned in one place, and its exclusivity is the property being
designed — not the hue.

## Reserve it in the token layer

Declare the hue as its own semantic role (not as "warning"), with its own ink
for text on its fill, and state its reservation in the declaration itself: the
one comment that tells the next author this colour is spoken for. Every
consumer that means "yours to decide" uses that role; no consumer that means
anything else may, and that includes colours **near** it. A stale marker in a
slightly darker amber beside a decision chip in amber is the same signal to a
reader at arm's length, so the reservation is a band of hue, not one value.
Give stale, lagging and over-budget their own roles from a visibly different
family, and pair them with a distinct shape (see
[epistemic-marks](./epistemic-marks.md)).

Like every status colour, the attention hue is never the only channel: a solid
fill and a glyph or label say "you" to a reader who cannot tell the hues apart
([status-color-mapping](./status-color-mapping.md)).

## It leaves the moment the person has acted

Attention is a **lifecycle**, and the hue tracks it exactly. A row is in the
attention hue while it waits for a person; it leaves the hue the moment the
person has done their part — **staged**, **sent** or **decided** — even when the
system has not finished. A staged write waiting to run, a sent request waiting
for its answer, a decision recorded and pending its effect: each is now the
system's turn, and the row renders in the vocabulary of that turn (pending,
running, done). A row that still glows after the click teaches the person that
the click did nothing, and they click again.

Derive the hue from the row's state, never from the screen or the list it is
in. A list called "waiting for you" whose every row is painted amber by the list
keeps painting the staged ones; a row that computes its own tone from its own
state stops at the right moment.

## One meaning across surfaces

The same hue appears wherever a waiting decision appears — the navigation
badge, the row on a dense table, the item on a dashboard, a tour's chip for
"this is yours" — and it means the same thing on each. That only holds if all
of them read the role from the one vocabulary
([_laws: one-authority-per-vocabulary_](../../../../_laws.md#one-authority-per-vocabulary));
a surface that picks "something warm" for its own urgent state has reopened the
reservation. Audit it the way the reservation is broken: search the stylesheet
and the tone tables for every use of the role and its near hues, and require
each one to mean "waits for a person".

## What this technique refuses

- The attention hue doubling as warning, stale, lag or budget.
- A near hue for another meaning, sitting beside the reserved one.
- A row that stays in the hue after it was staged, sent or decided.
- A tone painted by the list rather than derived from the row's state.

## When not to use it

A product with no human decisions in its loop — a read-only dashboard, a
viewer — has nothing to reserve, and its warm colours can mean warning in the
ordinary way. The technique applies as soon as the product has even one queue
of items that a person must act on.

---
layer: technique
type: technique
subject: review-iteration-loops
technique: anchored-variation-slate
status: forged
laws: [edit-do-not-regenerate, unmeasured-is-not-pass]
shared_with: []
use_when: [a reviewer cannot say what they want but would recognise it, designing the divergence phase that runs before a review loop starts, a set of generated alternatives comes back looking like each other, deciding how many variants to show and what is allowed to make them differ]
---

# Anchored variation slate

A review loop assumes a reviewer who can react. The case it does not cover is
the one that opens most projects: a reviewer who looks at the work, knows it is
not right, and has no vocabulary for what would be. Free text is the wrong
instrument for them — it is the wrong instrument for everyone, which is why
notes are typed, but for a reviewer without the domain's language it fails one
step earlier, because there is no note. The instrument that fits is a **slate**:
a small set of genuinely different candidates, rendered and shown together, from
which the reviewer picks a direction. Selection asks for recognition where
description would ask for expertise the reviewer does not have and should not
need.

Building a useful slate is the whole difficulty, and the parameter that looks
like it controls the slate does not.

## Amplitude does not diversify; anchors do

A variation request appears to have one dial — **amplitude**, how far the
candidates should sit from the artifact in hand — and the natural reflex when a
slate comes back too similar is to turn it up. This does not work, and the
reason it does not work is structural rather than a matter of finding better
wording.

Amplitude is a **phrasing** lever. It asks the generator to move without saying
what to move toward, so the only direction available is the one the generator
already carries: the centre of its own training distribution. Turned up, an
unanchored slate does not spread out — it converges, and it converges somewhere
predictable. This is why unanchored variants have the tell they have: they look
like *each other* at least as much as they look like the original, which is a
different complaint from "it only changed the colours" and points at a different
fix.

The effect is measured, not inferred. A controlled study of machine-generated
design solutions — four thousand of them across five design topics, spanning
eight parameter combinations and eight distinct prompt-engineering techniques —
found human-produced solutions more diverse than the generated ones on **every
topic tested**, with no prompting variant closing the gap. Sixteen ways of
asking for difference were not sixteen sources of difference. Treat that as the
governing fact of this technique: **you cannot phrase your way out of a narrow
distribution; you have to put something into the request from outside it.**

One decision rule about what happens *after* the pick, learned by a
practitioner who priced both paths: **when the production tool can express
the winning design, adopt the idea and rebuild it natively — the generated
candidate never enters the deliverable.** A slate render adopted directly
drags its whole revision loop along (every later tweak is another
generation round, priced in credits and latency and misses); the same
design rebuilt in the editor's own primitives is changed in seconds by the
person who owns it. The slate's product is the *decision*, and treating the
render as a probe rather than a deliverable is the asset-vs-disposable
classification applied to ideation: the pick is the asset, the pixels that
carried it are not.

An **anchor** is that outside material — a specific artifact whose direction the
candidate should take, named per variant. Anchors are a structural lever because
they do not ask the generator to search harder; they relocate where it searches
from. Amplitude then becomes what it should have been all along: not the source
of variation but a limit on it, saying how much of the current artifact each
anchored candidate is licensed to overwrite.

The practical consequence is that a slate is specified as **one anchor per
variant plus one amplitude for the set**, and a slate that cannot name an anchor
for a variant should ship one fewer variant rather than filling the slot with an
unanchored one. The unanchored candidate is not a free extra option; it is the
modal answer, and it drags the reviewer's sense of the space toward the middle.

## Anchors need a standing source, gathered before they are needed

The anchor slot can only be filled if there is something to fill it from, and
"go and find references" at the moment a slate is due is a stall that resolves
badly. Assembled under deadline, an anchor set collects whatever was findable
that afternoon, which biases every subsequent direction toward the currently
prominent and the easily searched.

The repair is unglamorous: keep a **standing reference collection**, added to
when something is encountered rather than when something is needed. What makes
it work is that acquisition and use are decoupled in time, so the set carries
things that were interesting for their own sake instead of things that were
convenient under pressure.

Distinguish this collection sharply from the approved reference sheet that locks
a project's style, because the two objects are near-opposites and confusing them
corrupts both:

| | standing reference collection | approved reference sheet |
|---|---|---|
| purpose | supply **direction** during divergence | hold a **look** constant during production |
| scope | across projects, gathered over time | one project, ratified inside it |
| status | unratified by design | locked, one-way ratchet |
| sent to a generator? | never — read for description only | yes, that is its job |

That last row is the one that matters most and it is not a formality. An
admired artifact that somebody else made seeds a *description* of a direction; it
does not become a conditioning input, both because nothing ratified it and
because another party's work on a conditioning path is a rights question before
it is a quality one. The acquisition discipline is the same one that turns a
pointed-at sample into an editable style — read it back into words, and let the
words travel.

## Show them together, and show what made them differ

Candidates evaluated one after another are evaluated against memory; candidates
shown side by side are evaluated against each other, and the second is both
easier and more informative. This is the oldest reliable result about exploring
alternatives — parallel exploration produces more divergent work and better
final outcomes than the same effort spent iterating serially on one line — and
the slate is simply that result applied to a generative loop.

Two rules make the surface honest:

- **The anchors are visible next to the variants.** A reviewer who can see that
  candidate two was pulled toward a named direction can reject *the direction*,
  which is a far more useful message than rejecting the candidate. Hide the
  anchors and every rejection reads as "not this one", and the next slate is
  built from nothing.
- **The slate is labelled as a sample, not as the space.** Three candidates are
  three points; the reviewer will otherwise take them for the available range and
  optimise inside it. Saying so costs one sentence and prevents the most common
  quiet failure of the whole method.

Keep the set small. Past a handful, additional candidates stop adding
information and start degrading the choice — the reviewer decides worse and
trusts the decision less, and the surface has bought paralysis with tokens.

## The slate terminates, and what follows is the ratchet

Divergence is bounded, and its boundary is the moment a candidate is chosen.
Before that moment nothing is owed: no beat has been approved, no gate result is
bound to a version, no attribution ledger exists to orphan. That is exactly why
the slate belongs here and only here — it is the one phase in which throwing away
whole artifacts costs nothing, because nothing has accumulated against them yet.

After the choice, review capital starts accruing and the ordinary discipline
takes over: feedback is answered with the smallest set of edits, and everything
else stays byte-identical. **Re-running the slate to answer a note is
regeneration wearing divergence's clothes** — it is the helpful rewrite with a
better story, and it costs the same approvals, the same verdicts, and the same
ledger. A second slate is legitimate only when the *direction* is being
reopened, which is a decision somebody makes deliberately and pays for
knowingly, not a way to avoid writing an edit plan.

## Decision rules

- When a reviewer's note is "I don't know, not this", build a slate; when the
  note names something, do not — a slate offered in place of an answerable note
  is an evasion, and it discards the note.
- When a variant has no anchor, drop the variant.
- When the slate comes back too similar, add anchors; do not raise amplitude.
  Raising amplitude on an unanchored set is the move that produced the problem.
- When the author already knows which candidate they want, there is no slate.
  Alternatives produced so a reviewer can be shown options are decoys, and the
  tell is that they were never shippable. A decoy slate ratifies a decision
  already made while charging the reviewer for the appearance of one.
- When a system claims its slate diversifies, that claim is measurable and
  therefore owes a measurement — an anchored set against an unanchored control
  on the same brief. "These three look different to me" is the impression this
  technique exists because of; it is not evidence that the technique is working.

## When not to use this

Not in the convergence phase, and not on anything a human has ratified — there
the ratchet governs and divergence destroys standing work. Not where the brief
is genuinely settled and the remaining question is execution quality; a slate
there converts a finishing problem into a re-opened design problem, which feels
like progress and is not. And not as a substitute for a brief that was never
written: a slate can elicit a direction from a reviewer who has one they cannot
articulate, but it cannot manufacture one for a reviewer who has not decided what
the work is for. Those two look identical at the surface and diverge completely
one round later, when the first reviewer recognises their direction and the
second picks whichever candidate is prettiest.

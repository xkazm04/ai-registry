---
layer: technique
type: technique
subject: review-iteration-loops
technique: note-taxonomy-focus-scope-order
status: forged
laws: [causality-over-sequence]
shared_with: []
use_when: [designing the feedback controls of a review surface, translating creator notes into edit operations, deciding why a free-text note keeps being misread]
---

# Note taxonomy: focus, scope, order

Creator feedback arrives in three fundamentally different registers, and a
review surface that collapses them into one free-text box forces a fallible
reader to re-infer the register on every note. The taxonomy names them:

- **Focus** — how much of the runtime this material deserves. Two kinds:
  *more focus* and *less focus*. Neither adds nor removes material; they
  rebalance weight.
- **Scope** — whether the material appears at all. One kind: *descope*,
  remove it from every render. (Its inverse — bringing material in — is not
  a note; it belongs to the scoping surface, which is the point of the
  [scope-vs-preference-signals](scope-vs-preference-signals.md) precedence.)
- **Order** — same weight, different position: *move earlier* / *move
  later*.

Plus one honest escape hatch: **custom**, free text, read literally — and
refused with a named rule when it asks for something the rules forbid.

## Each kind maps to its minimal operation

The taxonomy's value is that each kind names the *smallest* edit that could
satisfy it, which is what lets an engine avoid over-answering:

| Note kind | Preferred operation | Escalation | Never |
|---|---|---|---|
| more-focus | retime an existing beat up | insert, only if no beat carries the material | rewrite unrelated beats to "make room" |
| less-focus | retime down, or tighten the text | — | cut entirely — *less* is not *none* |
| descope | cut every beat carrying it, repair the chain | — | leave residue in any render |
| move-earlier / move-later | cut and re-insert at the new position | — | rewrite the beat while moving it |
| custom | whatever it literally asks | refusal, naming the violated rule | creative interpretation |

Two of these rows carry the classic misreadings. **Less-focus is not
descope**: a creator asking to cut something back wants it kept — cutting
it entirely satisfies the words and betrays the intent. And **more-focus is
not license to write**: insertion is the fallback, not the default, because
an inserted beat is new unreviewed material with a new evidence declaration,
while a retime touches nothing the creator has not already read.

## Order notes are where the chain breaks

A reposition preserves the beat and destroys both of its seams. The beat's
causal connector to its predecessor was written for the *old* position; in
the new position it connects to a different neighbour, and so does the beat
that used to follow it. The rule: **every move re-checks the causal
connector at three places** — the new position, the vacated position, and
the moved beat's own opening. If the chain cannot be made to hold, the move
has surfaced a real structural problem; fix the chain or refuse the move,
never ship a beat whose only honest connector to its neighbour is "and
then".

## Aggregation rules

Notes arrive per-card, and multiple notes can land on one card. Aggregate
before acting:

- Group notes by target, then resolve the surviving set of kinds per target
  — precedence and conflict handling per
  [refusal-as-valid-outcome](refusal-as-valid-outcome.md) (contradictions
  are surfaced with a named winner, never resolved silently).
- A destructive kind and a weight kind on the same target cannot both hold;
  the resolution is announced, not just performed.
- A note is a **request, not an instruction**. The taxonomy tells the engine
  what is being asked; it does not oblige the engine to comply — refusing a
  note with a clear reason is better work than satisfying it badly.

## When NOT to use it

Do not force the taxonomy onto feedback about the evidence base rather than
the rendering — "is this figure still true?" is an interrogation request,
not a focus note, and belongs to the follow-up channel
([follow-up-that-can-kill-a-fact](follow-up-that-can-kill-a-fact.md)). And
do not grow the vocabulary casually: every added kind must name its own
minimal operation and its own refusal conditions, or it is just free text
with a label. A taxonomy that accretes kinds nobody mapped is worse than
the custom hatch it was built to shrink.

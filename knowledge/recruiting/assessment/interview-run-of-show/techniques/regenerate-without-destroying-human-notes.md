---
layer: technique
type: technique
subject: interview-run-of-show
technique: regenerate-without-destroying-human-notes
status: forged
laws: [every-decision-names-its-actor, say-only-what-the-record-holds]
shared_with: []
use_when: [an interview prep pack is regenerated after the brief or the loop changed, an interviewer reports their notes disappeared, designing the merge rules for any generated-then-edited artifact]
---

# Regenerate without destroying human notes

An interview prep pack has a life cycle that nearly every generated artifact in a hiring
process shares: it is **generated, then edited by a human, then regenerated**. The
default merge — fresh generated content replaces the stored artifact — destroys the
human's work, and it does so at the worst possible moment: silently, in a document they
wrote themselves and will not re-read before walking into the conversation.

The rule is a one-line inversion with large consequences: **on regeneration, human
content wins.** Generated material fills what the human has not touched. It never
overwrites what they have.

## The three behaviours the merge needs

- **Preservation is the default; the generator's ownership is the enumerated
  exception.** This is the load-bearing detail and the one almost every implementation
  gets backwards on the first attempt. The intuitive design is a list of the
  human-authored parts to protect, with everything else replaced. That list is a bug
  with a delay fuse: the day someone adds a new human-authored field — a notes box, an
  annotation, a re-scoring comment — it is not on the list, and the next regeneration
  destroys it silently. Nobody notices, because the list still looks complete. Invert
  it: keep everything that was there, and overwrite only the parts the generator
  actually produced. Then a human field nobody anticipated survives *structurally*,
  without anyone having to remember it exists.
- **De-duplication against the whole plan, not just the list.** A regeneration will
  re-propose questions substantially identical to ones already present. Matching on
  normalised text rather than exact equality is what stops a pack accumulating
  near-duplicates across three regenerations — the failure that makes people stop
  regenerating at all. And the comparison set is everything the interviewer will
  actually be handed: a question a human has already woven into a timed block must not
  also appear in the appended additions list, or the pack asks it twice and the
  interviewer has to work out which copy is the real one.
- **A cap on total items, stated in prose when it binds.** Repeated regeneration must
  not grow the pack past what the round's block can hold. An uncapped merge quietly
  reintroduces the overrun the timing contract exists to prevent — the pack still looks
  like a plan, but it is now a plan for a longer interview than the one that was booked.
  Cap at the round's maximum question count, and when the cap binds, **say so in the
  artifact**: "the first eight of twelve — ask the rest only if time allows" is a
  sentence an interviewer can act on. Silent truncation hands them a shorter list with
  no way to know anything was held back.

## The order of operations

1. Load the stored pack whole.
2. Generate the fresh set, and note exactly which parts of the artifact the generator
   claims to own.
3. Drop generated items that duplicate anything already present, human or generated.
4. Start from the stored pack and overwrite *only* the generator-owned parts. Everything
   else — named or not, anticipated or not — carries through untouched.
5. Append what remains, up to the cap.
6. Report what changed — added, held back, and what was left alone because a human owned
   it.

Step six is not decoration. An interviewer who regenerates a pack needs to know in one
glance whether the thing they are holding is still the thing they edited, and a merge
that reports nothing is functionally indistinguishable from one that destroyed
everything until the moment they look for their note and it is gone.

A useful invariant to hold the whole thing to: a regeneration that produces nothing new
must leave the artifact byte-for-byte as it was. If an empty regeneration perturbs the
pack, the merge has side effects nobody designed, and every real regeneration is
carrying them too.

## Why this is an authorship rule, not a convenience

A prep pack has two authors with different standing. Only one of them can be asked,
afterwards, why a question is on the list — and "why was this asked" is a question that
gets asked about interviews, sometimes by people with standing to require an answer. A
pack that cannot distinguish the hiring manager's addition from a generated suggestion
cannot answer it. Every consequential element of the process names its actor, per
[every-decision-names-its-actor](../../../_laws.md#every-decision-names-its-actor), and a
question that steered an assessment is consequential.

There is a second, quieter reason. A human edit is frequently a *correction* — the
interviewer knows something the generator did not, usually that a generated question
rests on a misreading of the record. Overwriting it does not merely lose a note; it
restores an error that a person had already caught, and the pack goes back to claiming
something the record does not hold, per
[say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds).

## Decision rules

- **When a generated item conflicts with a human-edited one, the human's stands and the
  generated one is offered, not applied.** Surface it as a suggestion the human can take;
  do not resolve the conflict for them.
- **Deletion by a human is a state, not an absence.** A question the interviewer removed
  must not be re-proposed on the next regeneration as though it were new. Record the
  removal, and treat a re-proposal as a duplicate.
- **Regeneration never changes the timing contract silently.** If the fresh material
  would push the plan past its duration band, the plan reports the collision instead of
  absorbing it.
- **The same rule generalises.** Any artifact in the process that is generated, edited,
  and regenerated — a debrief draft, a role brief, an outreach message — needs the same
  inversion. The instinct to let the newest generation win comes from thinking of these
  as views over data. They are not; they are documents with human co-authors.

## When not to use this

- **Immutable records.** A completed scorecard or a recorded outcome is not regenerated
  at all; it is superseded by a new version bound to what it judged. Do not apply a merge
  to something that should be append-only.
- **Pre-edit generation.** Before a human has touched the artifact, plain replacement is
  correct and cheaper. The inversion earns its complexity only once provenance is mixed.
- **Artifacts where staleness is the greater risk.** If the underlying facts changed in a
  way that makes a human's note actively wrong — the role was re-scoped, the round was
  reassigned — the answer is not to overwrite it silently but to flag it as stale and let
  the human retire their own text.

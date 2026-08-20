---
layer: technique
type: technique
subject: structured-interview-scorecards
technique: unassessed-competency-handling
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [an interview did not reach a planned competency, deciding what a scorecard writes for an untouched axis, a coverage notice is being ignored by its readers]
---

# Unassessed competency handling

Interviews do not cover what they planned to cover. Time runs out, a probe never
lands, the candidate takes the conversation somewhere more useful, the connection
drops. The technique is what the scorecard does with the resulting hole — and the
one thing it must not do is put a number there that behaves like a measurement.

## The two wrong defaults

**Zero, or the bottom of the scale.** An unobserved competency becomes the worst
observed one. The candidate is ranked below everyone who was asked, on a
dimension nobody saw, and if any threshold sits downstream they are rejected on a
number that was never computed
([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).

**The midpoint, silently.** Less obviously harmful and more dangerous, because it
is invisible. An unmeasured competency now reads identically to a measured
adequate one. Nobody downstream can tell the difference, so nobody schedules the
follow-up, and the decision meeting believes the loop covered ground it never
touched.

The midpoint is not wrong as a *placeholder*; it is wrong as a *silent* one. It
is the least distorting neutral value available when a schema forces an integer,
and it becomes acceptable exactly when the coverage state travels with it
everywhere the number goes.

## The arrangement that works

Separate the two facts a single integer cannot carry:

- **The rating** takes a neutral placeholder — a value chosen so it neither
  advantages nor penalises — and its evidence field is *empty*, not filled with a
  sentence explaining the absence. An explanation in an evidence field reads
  downstream as evidence (see evidence-quote-requirement).
- **The coverage flag** is the load-bearing artifact. It states, per scorecard,
  which axes carry an observation and which do not, and it is what surfaces to
  humans.

Everything that consumes ratings must consume the flag with them. A rating
exported, averaged, ranked or thresholded without its coverage state has laundered
an unmeasured competency into a measured one, which is the exact failure this
technique exists to prevent
([a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## Where the flag must surface, in order of value

1. **To the interviewer, while the loop is still open.** This is the only moment
   the gap is cheap to fix: another round is schedulable, a follow-up probe can
   be added to the next conversation. A coverage notice that first appears in the
   decision meeting has arrived too late to be anything but an excuse.
2. **To the decision meeting, as a stated limit.** "This loop did not observe
   ownership" is a fact about the loop, and the meeting either accepts the
   decision without that dimension or does not conclude
   ([uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)
   — an adverse outcome resting on an unobserved competency is not a decision the
   record supports).
3. **To whoever maintains the rubric.** One competency going unassessed across a
   population is not a scheduling problem; it is a signal that the axis is not
   reachable in the format, and the finding belongs to round design.

## A notice that fires on the majority trains people to ignore it

This is the hardest-won rule in the area, and it is a design rule, not a UI
preference. Coverage gaps come in kinds, and they do not deserve equal noise:

- **A gap that indicates a real miss** — a competency that this rubric expects
  and that this loop failed to reach — must be visible and specific.
- **A gap that is a structural property of the configuration** — a role family
  that legitimately has no extra axes defined, a competency that does not apply
  to this population — must be *silent by design*. It is not a miss; it is the
  configuration behaving correctly.

Conflating these produces a notice that fires on most scorecards, and a notice
that fires on most scorecards is furniture. Within a month nobody reads it,
including on the scorecards where it meant something. Enumerate the kinds of gap
explicitly, decide per kind whether it warrants a notice, and accept that the
correct behaviour for at least one kind is silence.

The same discipline applies to severity: distinguishing "an expected axis was not
scored" from "an axis was scored that this rubric does not contain" (see
rubric-versioning-at-write-time) keeps two different problems from sharing one
warning and diluting each other.

Two refinements make the split usable in practice:

- **Enumerate the kinds as a closed type, and record every one of them** — even
  the silent kind. The data stays complete; only the human-facing noise is
  filtered. Deciding at render time which cases speak is a different decision
  from deciding which cases exist, and conflating them loses the record.
- **Never resolve a gap by inference.** The tempting shortcut is to guess the
  missing classification — a role family, a population, a competency mapping —
  so the notice disappears. That converts a disclosed unknown into an undisclosed
  fabrication, which is a strictly worse artifact than the notice was.

## An absent scorecard is not an absent interview

The same rule applies one level up. A completed interview whose scorecard failed
to materialise — an empty transcript, a synthesis that did not run — must still
appear, with blank ratings and its state named, so it is visible for manual
review. Filtering it out of the list because it has no ratings makes a conducted
interview vanish, and vanished evidence is the one failure a hiring record cannot
recover from.

## Partial coverage is not partial credit

A loop that observed three of five competencies has not produced a 60%-confident
verdict. It has produced three ratings and two absences, and the honest summary
says exactly that. Rescaling — averaging over the observed axes and presenting
the result as though the instrument were complete — is the same laundering as the
silent midpoint, arrived at by arithmetic instead of by default value.

## When not to use this

- **Do not use it to excuse chronic under-coverage.** If a competency is
  unassessed in a third of loops, the instrument or the round design is wrong;
  flagging it faithfully every time is correct and insufficient.
- **Do not flag an axis that does not apply to this population or family as a
  gap.** It is not missing; it is out of scope, and treating it as a gap is what
  produces the notice-fatigue failure above.
- **Do not let a coverage flag substitute for a decision.** The flag states a
  limit; a person still decides whether the loop can conclude on what it has, and
  that decision has an owner.

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
([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).

**The midpoint, silently.** Less obviously harmful and more dangerous, because it
is invisible. An unmeasured competency now reads identically to a measured
adequate one. Nobody downstream can tell the difference, so nobody schedules the
follow-up, and the decision meeting believes the loop covered ground it never
touched.

The midpoint is not wrong as a *placeholder*; it is wrong as a *silent* one. It
is the least distorting neutral value available when a schema forces an integer,
and it becomes acceptable exactly when the coverage state travels with it
everywhere the number goes.

Hold that concession narrowly, because "neutral" hides a collision. A scale that
names its bar, as this subject requires, almost always names the middle level: on a
five-point scale labelled "well below, below, meets the bar, above, exceptional",
the midpoint *is* "meets the bar". A placeholder 3 then reads, to any threshold or
gate that has not been taught otherwise, as a competency that cleared it. Two
arrangements avoid this, in order of preference:

- **Omit the rating.** Where a person fills the scorecard, an unrated competency is
  simply not submitted. Nothing is stored that can participate in arithmetic, and
  the absence is the record. The same product that stores a placeholder 3 for its
  machine-drafted scorecards omits the rating on its human form, which is the
  better of its two paths and the one that needs no guard.
- **If an integer is forced, make the guard total.** Every reader that ranks,
  exports, averages, thresholds or shows the number must consult the coverage state,
  and the pair (placeholder rating, placeholder evidence) must be recognised as one
  thing. Recognising it takes both halves: a rule keyed on the rating alone misfires
  on a person's deliberate 3, and a rule keyed on the evidence text alone misfires
  when a later step rewrites the evidence and leaves a real-looking number behind.

## The arrangement that works

Separate the two facts a single integer cannot carry:

- **The rating** takes a neutral placeholder — a value chosen so it neither
  advantages nor penalises — and its evidence field is *empty*, not filled with a
  sentence explaining the absence. An explanation in an evidence field reads
  downstream as evidence (see evidence-quote-requirement).
- **The coverage flag** is the load-bearing artifact. It states, per scorecard,
  which axes carry an observation and which do not, and it is what surfaces to
  humans.

Where the flag comes from matters as much as that it exists. A flag derived from the
producer's own sentinel ("the model wrote Not assessed") is the producer marking its
own homework: it fails in both directions, reporting an axis as skipped when the
interview covered it, and a real-looking rating on an axis nothing ever asked about.
Where the loop leaves an independent record of what happened, derive coverage from
that. A directed interview whose agenda blocks each name a competency, plus an event
ledger of which blocks were begun and which were covered on a verified quote, yields
four states per axis rather than two: *covered* (a block was covered on verified
evidence), *asked* (begun, never covered), *not reached* (planned, never begun) and
*not planned* (the agenda carried no scored block for it). The middle two are
different findings, a probe that failed and a loop that ran out of time, and the
last is a rubric-versus-agenda mismatch that no interviewer could have fixed
mid-loop. Then show the disagreements as their own flags, a rating on an axis nothing
began, and a not-assessed sentinel on an axis the ledger says was covered, because
those are the cases a reader cannot see. Two rules keep it honest: an interview with
no such record has *unknown* coverage, and unknown is never rendered as an all-not-
reached map that accuses a call which was simply not directed; and an "owed
questions" count is only known once the loop has closed, so a dropped call reports
unknown, not zero. This four-state derivation is one deployment's arrangement, and the
evidence for it is that deployment's incident (see the application); what carries
over is the source of the flag, not the state names.

Everything that consumes ratings must consume the flag with them. A rating
exported, averaged, ranked or thresholded without its coverage state has laundered
an unmeasured competency into a measured one, which is the exact failure this
technique exists to prevent
([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## Where the flag must surface, in order of value

1. **To the interviewer, while the loop is still open.** This is the only moment
   the gap is cheap to fix: another round is schedulable, a follow-up probe can
   be added to the next conversation. A coverage notice that first appears in the
   decision meeting has arrived too late to be anything but an excuse.
2. **To the decision meeting, as a stated limit.** "This loop did not observe
   ownership" is a fact about the loop, and the meeting either accepts the
   decision without that dimension or does not conclude
   ([uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)
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

## Renormalising is a disclosure, not a licence

The measurement literature gives a legitimate move that this technique appears to
forbid: drop the absent inputs from numerator and denominator and divide by what was
observed, carrying the observed fraction beside the result. The two agree on the
part that matters. Renormalising is honest as a *description* of the observed axes,
with its coverage stated. It is dishonest as a *decision input* when the result is
then compared with a bar that was calibrated on the full set, because three observed
axes and five observed axes are different instruments wearing one scale. A partial
loop reports its ratings, its absences and its coverage; the meeting decides whether
that is enough to conclude, and that decision is not delegated to an average.

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

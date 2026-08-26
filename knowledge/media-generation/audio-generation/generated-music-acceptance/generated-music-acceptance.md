---
layer: golden-path
type: golden-path
subject: generated-music-acceptance
status: forged
use_when: [deciding whether a delivered generated piece is usable, a track sounds fine in the studio and falls apart on phones, loudness differs wildly between generated cues, checking delivered audio against the plan it was briefed from, clearing a generated track for commercial use]
techniques:
  - brief-conformance-listen
  - loudness-and-peak-acceptance
  - generated-audio-defect-taxonomy
  - structure-verification-against-plan
  - rights-and-provenance-record
---

# Generated music acceptance

A generated track arrives as a finished-sounding file, and that is exactly
the problem: it *sounds* finished whether or not it is usable. Acceptance is
the discipline that refuses to let finished-sounding stand in for checked,
and it runs on three gates that do not substitute for one another:

1. **Brief conformance** — is it the piece that was asked for? Structure,
   style, instrumentation, vocal or instrumental as briefed, an ending of
   the briefed shape.
2. **Technical acceptance** — is it deliverable? Loudness at the
   destination's target, peaks under the ceiling, structure at the briefed
   timestamps, no defect from the known taxonomy.
3. **Rights and provenance** — is it *usable*, in the legal sense, for what
   the production will do with it? Recorded at acceptance time, because the
   facts it needs exist at generation time and evaporate afterwards.

A track can pass any two and fail the third, and each failure has a
different remedy: a conformance miss goes back to the brief, a technical
miss to measurement-guided repair or re-render, a rights gap to the record
— or to the bin, because no amount of quality clears an asset that cannot
be shipped.

## Measurement is the spine

The bundle's law — unmeasured is not pass — bites harder in audio than
anywhere else, because listening is seductive: the ear normalizes, adapts,
and forgives, and it does all three more generously on the third listen
than the first. So the gates split by checkability. What the plan committed
to numbers is **measured**: duration in seconds, section boundaries at
offsets, loudness in LUFS, true peak in dBTP
([structure-verification-against-plan](./techniques/structure-verification-against-plan.md),
[loudness-and-peak-acceptance](./techniques/loudness-and-peak-acceptance.md)).
What the brief committed to words is **listened for, against a checklist
derived from the brief** — not against taste
([brief-conformance-listen](./techniques/brief-conformance-listen.md)).
The checklist exists because a free listen answers "do I like it", and
acceptance asked "is it what was briefed".

## Defects have names, and names route remedies

Generated audio fails in characteristic ways — smeared transients, vocal
garble, section bleed, tempo drift, broken endings, loop seams, spectral
holes — and the defect's class decides its remedy: some are one-section
re-renders, some are post repairs cheaper than any regeneration, some
condemn the take entirely
([generated-audio-defect-taxonomy](./techniques/generated-audio-defect-taxonomy.md)).
An acceptance verdict that says "failed" without a class has done half its
job; the class is what makes the failure actionable, and the taxonomy is
what makes the economics computable — cost per usable output is only
calculable when you know what a repair costs against a reroll.

## Rights are an acceptance property, not a legal afterthought

Whether a generated track may score a commercial production is decided by
facts that exist at generation time: which account generated it, on which
plan tier, under which terms, referencing what material. None of those
facts are in the file. The
[rights-and-provenance-record](./techniques/rights-and-provenance-record.md)
captures them per asset, at acceptance, because reconstructing them at
delivery — weeks later, terms changed, plan upgraded since — ranges from
expensive to impossible, and a vendor's commercial grant is routinely
non-retroactive across plan changes. An asset without a record is not
cleared, however it sounds.

## Where this subject ends

The four-way question again: this subject **judges produced sound against
its brief** — it does not write briefs (the composition subject upstream),
it does not place music in the cut (the assembly craft's spotting), and it
does not judge *people* by their voices, a neighbouring domain whose
fairness standards have no analogue here because a track has no rights to
due process. Grading craft that is modality-general — trial matrices,
grader disagreement, regrade-without-regenerate — lives with the output
grading subject in the visual category and transfers to audio whole; this
subject adds what is audio-specific: the measured gates, the defect names,
and the rights record.

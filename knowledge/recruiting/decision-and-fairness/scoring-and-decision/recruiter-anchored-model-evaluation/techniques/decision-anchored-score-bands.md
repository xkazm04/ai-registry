---
layer: technique
type: technique
subject: recruiter-anchored-model-evaluation
technique: decision-anchored-score-bands
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [writing the scale a judge model will score generated hiring text against, a model comparison came back with no spread between models, a quality score exists but nobody can say what a given number would change]
---

# Decision-anchored score bands

A score band is defined by **the action a practitioner would take with the
artifact in hand**, never by an adjective describing the artifact.

The band is not "excellent" but *send it as it stands*. Not "poor" but *this
would mislead the reader*. The judge is then answering a question about
consequences, which has a determinable answer, instead of a question about
worth, which does not
([meaning-does-not-live-in-a-label](../../../../_laws.md#meaning-does-not-live-in-a-label)).

## The failure this repairs

Ask a judge model for a number on an undescribed scale — "rate this one to ten,
be critical" — and it will return a narrow band around the middle almost
regardless of input. Run that judge across a matrix of models and use cases and
the table comes back nearly flat. The flatness is then read as a substantive
finding about the models, and it is nothing of the kind: it is the judge
declining the tails of a scale it was never given a referent for.

The shape of it is recognisable once you have seen it: a seven-model matrix
where every cell sits in the middle third of the scale, the overall mean lands
near the centre, and not one cell in the whole table reaches the top band. No
model was that uniform; the judge simply never offered the ends.

Two diagnostics distinguish the two explanations, and they are cheap:

- **Plant a known-bad artifact** — a summary about the wrong candidate, an
  advert with an invented salary — in the run. If it does not land in the bottom
  band, the bottom band does not exist and no ranking above it can be trusted.
- **Plant a known-excellent artifact**, hand-written by a practitioner. If it
  does not reach the top band, the scale cannot show improvement, and every
  future model change will look like noise.

A scale that fails either probe is not strict. It is unusable, and its
strictness is the alibi.

## Constructing the bands

1. **List the actions, not the grades.** Ask the practitioner who receives this
   artifact what they actually do with one when it arrives. The answers are
   discrete and few: send it, tweak and send, rewrite from it, throw it away
   because it would mislead, throw it away because it is not the thing.
2. **One band per genuinely distinct action.** The count follows the domain. If
   the practitioner has four real responses, build four bands. Five is common
   for a drafting task. Do not pad to ten because ten feels precise; every band
   the practitioner cannot distinguish is a band the judge will fill with noise.
3. **Write each band as a sentence about the reader.** "A recruiter would send
   this to the candidate without editing it." "A recruiter would use the
   structure and rewrite the substance." Second person about the recipient, not
   third person about the text.
4. **Make the bottom band about harm, not about disappointment.** The lowest
   bands should separate *would mislead the reader or omit something they need*
   from *does not do the job at all*. Those are different repairs — the first is
   a correctness problem, the second a specification problem — and collapsing
   them is how a grounding defect gets triaged as a prompt-quality defect.
5. **State explicitly that the full range is to be used, in both directions, and
   say what the matrix should look like.** Anchoring alone still leaves
   tail-avoidance on the table. Three sentences do the work: a flawless artifact
   *must* reach the top band — do not withhold it on principle; a broken one
   *must* reach the bottom; and across a set of models most outputs should not
   land on the same number. The last one is the sentence teams omit, and it is
   the one that names the pathology directly.
6. **Require the band's decision to be named back.** The judge returns the band
   *and* the action it implies, in the practitioner's words. A judge that cannot
   name the action has scored on vibe and the row should be re-run.

## Decision rules

- **When a model comparison shows almost no spread, suspect the rubric before
  the models.** Real quality on a hard drafting task is not uniform across a
  modern model matrix. Run the two planted probes before reporting anything.
- **When two bands imply the same practitioner action, merge them.** A
  distinction the recipient cannot act on is a distinction the judge will apply
  randomly, and random application shows up as run-to-run instability that gets
  misdiagnosed as model variance.
- **When a band's text contains an adjective doing load-bearing work, rewrite
  it.** "Well-written and thorough" is not an anchor. "Would be sent unedited"
  is.
- **When the gate is expressed as a threshold, express the threshold as its
  action too.** "Ships at or above *send after a small edit*" is a sentence a
  hiring manager can approve or reject. "Ships at or above 3.5" is not.
- **When you change the band text, re-baseline.** The bands are part of what the
  verdict is bound to
  ([a-verdict-is-bound-to-what-it-judged](../../../../_laws.md#a-verdict-is-bound-to-what-it-judged));
  scores from before an edit are not comparable to scores after it, and the
  temptation to compare them is strongest exactly when a rubric was loosened.
- **When a practitioner disagrees with a band assignment, that is the
  calibration signal you wanted.** Anchored bands are arguable by design.
  Collect the disagreements; a systematic one means a band's sentence is
  ambiguous, not that the judge is bad.

## Countermeasures that belong beside the bands

Anchoring removes the judge's discretion over what the scale means. It does not
remove the other well-documented judge pathologies, and a scale that fixes one
while ignoring the rest inherits a false confidence. Alongside the bands:
randomise the order in which candidate outputs are presented when scoring is
comparative, since judges systematically favour a position; keep length out of
the band text so verbosity cannot buy a band; and never let a model be the sole
judge of output from its own family, since judges under-penalise errors in text
that resembles their own writing.

## When not to use it

Do not build decision bands for a property that is categorically true or false —
did the artifact invent a salary figure, did it name the wrong candidate. Those
belong on a pass/fail reliability check with a full-pass gate, not on a graded
scale where a violation can be offset by good prose elsewhere.

Do not anchor bands to a decision no one in the process actually makes. If
nobody ever ships a generated advert unedited, "ship as it stands" is a fantasy
band and the scale has silently lost its top; re-anchor to the real ceiling.

And do not use bands where the artifact has no single recipient with a next
action — a document read by four roles for four purposes needs four rubrics or a
narrower task definition, not one blended scale.

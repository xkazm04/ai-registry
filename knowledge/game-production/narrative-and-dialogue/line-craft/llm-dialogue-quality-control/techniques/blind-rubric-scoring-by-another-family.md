---
layer: technique
type: technique
subject: llm-dialogue-quality-control
technique: blind-rubric-scoring-by-another-family
status: forged
laws: [no-gate-self-certifies, a-verdict-is-bound-to-its-content, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [scoring generated dialogue candidates with a model judge, a model reviewer approves lines a person finds generic, choosing a judge and a rubric for a dialogue pipeline]
---

# Blind rubric scoring by another family

The named concern: use a model to narrow a batch of dialogue candidates to a shortlist, with
the judge's known biases neutralised by procedure, and with its scores tied to a rubric that
names what each level looks like.

## The biases, and what removes each

A model judge is an instrument with four documented leanings, and each has a mechanical
countermeasure.

**It prefers the familiar.** A judge scores higher the text it would itself have found
likely, which is its own family's writing above all, and the likely line is the typical one.
Unguarded, a model judge selects for exactly the genericness the pipeline exists to remove.
The judge therefore comes from a **different model family** than the generator. Two models of one family agreeing count as one opinion, and
the record says which family each came from. Changing family removes self-recognition, not the
taste preference tuning gives every family: the preference for low-perplexity text holds
whoever wrote the text, and judges of several families rank model-written stories above
human-written ones. A judge from another family is therefore necessary and not sufficient;
the calibration below is what shows it can tell a specific line from a typical one.

**It prefers a position.** Many judges lean to the first or the last item in a list. Shuffle
the candidates for every draw, and run at least two draws with different orders; a candidate
whose rank swings with position is a tie, not a winner. In pairwise comparison, run each pair
twice with the positions swapped and drop the verdicts that flip.

**It leans on length.** Longer answers read as more thoughtful, to people as well as to many
models, but the direction is the judge's own: measured with length held apart, some families
prefer longer answers, one prefers concise ones and one is neutral, and in one recorded
dialogue run two judges of the same family leaned opposite ways on the same candidates —
within a slot, one favoured the longer line in 31 of 45 slots and the other in 12. Print each
candidate's length beside it and let the rubric's economy dimension price length against the
slot's intended size, so that length is a decision the rubric made. Then measure each judge's
lean on the run's own scores — the rank correlation between length and score within a slot —
rather than assume a direction and correct for it. For short lines, economy plus a
shorter-wins tie-break counts length twice and tilts selection toward brevity; keep the
tie-break only where the measured lean runs toward length.

**It prefers what it is told to prefer.** Candidates carry opaque identifiers and nothing
else: no constraint, no round number, no mark of which was revised or which a person wrote.
A judge that can see "revised" scores the revision up.

## The rubric

Around ten dimensions, each a bar a judge can check against the line: **action**, the line as
a move that shifts the balance of the exchange; **voice**, recognisable with the name covered
and inside the speaker's refusals; **subtext**, one concrete detail carrying the unsaid;
**economy**, nothing removable and within the slot's budget; **specificity**, fitting only this
world, speaker and moment; **function**, the information the player needs delivered inside the
character beat; **freshness**, a new angle that survives a third hearing; **tells**, residue
of stock phrasing the filter could not catch; **ear**, speakable in one breath; and **tone
fit**, menace that is calm rather than performed and humour that does not deflate a hard beat.
Each level is anchored with a short described example — what a one, a three and a five look
like for this dimension — so that a score names a bar cleared. The anchors describe shipped
dialogue a lead would keep, never the batch, so the best of a weak batch scores low.

Scores stay **per dimension**. An average alone lets a strong rhythm pay for a broken voice, so
any aggregate carries floors: no dimension below the middle level, and the dimensions a
generator fails most — voice and tells — held to a higher floor than the rest. A candidate under
a floor is out regardless of its average. The judge writes a short reason before each score,
citing the dimension and quoting the word it is scoring, because a score that cites nothing
cannot be checked and a reason written after the number is a rationalisation of it.

## Attribution runs before scoring

Voice is the dimension a judge is worst placed to score with the speaker's name in view,
because the name tells it whom to hear. So a separate, cheaper step runs first: with names
removed, a model from a different family is given the whole cast's voice entries and asked to
assign each line to its speaker. Lines it cannot attribute are dropped before scoring; for a
principal character's anchor lines a person makes that call instead. The scoring judge then
receives the speaker's entry, because it must score fit to a named target.

The judge receives the same voice entry, version for version, that the generator received,
plus the entry's never-say rows and off-voice examples, which the generator did not get.

## Draws, medians and calibration

One draw is a sample, not a verdict. In one recorded run, eighteen lines scored by two judges
were re-scored by two fresh judges of the same model classes: the mean moved by a median of
0.3 and up to 1.05 on a five-point scale, five of the eighteen changed their ship-rule result,
and two of nine pairs swapped order. Score each candidate in at least three draws with
different orders and take the median per dimension; report the spread, and treat candidates
whose medians sit within it as tied. Compare a line only with scores from the same draw: an
earlier draw's number for a line now beside a revision is a different measurement, and in that
run the re-scored lines fell by 0.3 on average once they stood beside rewrites.

Two judges disagree most on the dimensions a page reads worst. In the same run the two judges
agreed exactly on economy three times in four and on ear and subtext fewer than two times in
five, with ear offset by more than half a point between them. Where judges split on a floor —
one passes the line, the other fails it — the split is the finding: it goes to the person,
not into an average that carries the line over a floor one judge refused.

Before trusting a judge on a new rubric or a new cast, calibrate it: a person ranks a small set
of lines — some shipped-grade and written by a person, some generic, some deliberately
off-voice — and the judge must reproduce the person's ordering on the clear cases. A judge that
ranks the generic line above the shipped one, or the generated line above the human one, is
not usable on this rubric, whatever its general reputation.

## What the judge produces

A ranked **shortlist** with reasons, usually three to five, and the list of candidates it
excluded on a floor. It does not produce the winner; that is a person's decision, and the
judge's ranking is an input to it, which is
[no gate self-certifies](../../../../_laws.md#no-gate-self-certifies) applied to a line. Each score
is recorded with its basis — rubric version, judge identity and version, voice entry version,
draw count — which is
[a number carries its unit and its basis](../../../../_laws.md#a-number-carries-its-unit-and-basis),
and bound to a fingerprint of the exact candidate text, so an edited line is unscored until
judged again, which is
[a verdict is bound to the content it judged](../../../../_laws.md#a-verdict-is-bound-to-its-content).

## Decision rules

- **When the judge and the generator share a family, do not count the judge's approval** as
  independent evidence; replace the judge.
- **When a candidate's rank changes with its position, record a tie.**
- **When a candidate fails a floor dimension, exclude it** whatever its other scores.
- **When one judge passes a line and another fails it on a floor, send it to the person** as a
  disagreement; never average it past the floor.
- **When a line's score comes from an earlier draw, do not rank it against this draw's
  scores**; re-score it beside the lines it competes with.
- **When no judge of another family is available, record that, and require a person's pick on
  every slot that ships** instead of rationing the person.
- **When the judge has not been calibrated on this rubric, its shortlist is advisory** and a
  person reads the whole batch.
- **When the rubric changes, re-score the shortlists it produced** rather than mixing versions.

## When not to use this

Fewer than four candidates do not need a judge; a person reads them, or, at the filler ration,
reads a labelled sample of them — never neither. A slot whose quality is a
fact — a rule stated correctly, a name spelled right — is checked, not judged.

## Evidence status

Position and length biases in model judges, and length bias in human judges too, are reported
in primary measured evaluations of model-as-judge setups on general question answering rather
than dialogue; a 2026 comparison of five judges from four families found the length lean
heterogeneous in direction, and position bias small beside a preference for formatting.
Self-preference, traced in one measured study to a preference for text of low perplexity to the
judge whoever wrote it, likewise; that judges of several families prefer model-written stories
to human ones comes from two 2026 measured studies of creative writing. That models are poor at
detecting stock writing comes from a measured study in which models flagged problem spans with
less precision than three professional writers agreed with each other, and from a second that
found near-zero agreement between models and people on what counts as machine filler. The
test-retest spread, the per-dimension agreement and the opposite length leans are one recorded
dialogue run of 456 candidates by two judges of one family, read from its score record; they
are one run's numbers, not rates. No study tested showing word counts as a countermeasure.
The ten dimensions and their floors are a project rubric, not a validated instrument; the
median of draws and the calibration set are practitioner synthesis. None of this has been
tested in a played game.

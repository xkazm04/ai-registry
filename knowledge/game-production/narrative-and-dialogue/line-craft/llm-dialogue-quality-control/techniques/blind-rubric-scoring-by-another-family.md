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
the record says which family each came from.

**It prefers a position.** Many judges lean to the first or the last item in a list. Shuffle
the candidates for every draw, and run at least two draws with different orders; a candidate
whose rank swings with position is a tie, not a winner. In pairwise comparison, run each pair
twice with the positions swapped and drop the verdicts that flip.

**It prefers length.** Longer candidates read as more thoughtful, to people as well as to
models. Print each candidate's length beside it, let the rubric's economy dimension price
length against the slot's intended size, and break ties toward the shorter line, so that
preferring the longer line is a decision the rubric made rather than a leaning nobody noticed.

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

One draw is a sample, not a verdict. Score each candidate in at least three draws with
different orders and take the median per dimension; report the spread, and treat candidates
whose medians sit within it as tied. Before trusting a judge on a new rubric or a new cast,
calibrate it: a person ranks a small set of lines — some shipped-grade, some generic, some
deliberately off-voice — and the judge must reproduce the person's ordering on the clear cases.
A judge that ranks the generic line above the shipped one is not usable on this rubric,
whatever its general reputation.

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
- **When the judge has not been calibrated on this rubric, its shortlist is advisory** and a
  person reads the whole batch.
- **When the rubric changes, re-score the shortlists it produced** rather than mixing versions.

## When not to use this

Fewer than four candidates do not need a judge; a person reads them. A slot whose quality is a
fact — a rule stated correctly, a name spelled right — is checked, not judged.

## Evidence status

Position and length biases in model judges, and length bias in human judges too, are reported
in primary measured evaluations of model-as-judge setups on general question answering rather
than dialogue; self-preference, traced in one measured study to a preference for text of low
perplexity to the judge, likewise. That models are poor at detecting stock writing comes from a
measured study in which models flagged problem spans with less precision than experts agreed
with each other, and from a second that found near-zero agreement between models and people on
what counts as machine filler. The ten dimensions and their floors are a project rubric, not a
validated instrument; the median of draws and the calibration set are practitioner synthesis. None of this has been tested in a played game.

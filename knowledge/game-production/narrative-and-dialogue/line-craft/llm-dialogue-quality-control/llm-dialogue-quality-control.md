---
layer: golden-path
type: golden-path
subject: llm-dialogue-quality-control
status: forged
use_when: [generating dialogue, barks or cards with a language model, generated lines all sound like the same fluent assistant, choosing which of many generated candidates ships, a model reviewer keeps approving lines a person finds generic, building the review loop for a generated script]
techniques:
  - measured-banned-pattern-list
  - voice-bible-in-every-prompt
  - candidates-under-rotating-constraints
  - blind-rubric-scoring-by-another-family
  - critique-and-revise-with-human-checkpoints
  - read-aloud-pass
---

# LLM dialogue quality control

A language model asked for a line of dialogue returns a good-looking line on the first try,
and that is the whole difficulty. The line is grammatical, on topic and on tone. It is also,
with high probability, a line any character in any story could have said, built from phrases
the reader has met in a thousand other generated texts, in a register that belongs to the
model rather than to the speaker. This subject owns the production instrument that turns a
model into a source of specific, human-sounding dialogue: what goes into every prompt, how
many candidates a slot gets and how they are made to differ, what is filtered mechanically,
who judges the survivors and how, how a failing line is sent back, how it is heard, and where
a person must decide.

The subject is an instrument, not a taste. Every stage has a reader and an output that a
later stage consumes, and a stage that cannot say what it examined and what it concluded is
not a stage.

## Why model dialogue comes out generic

Three forces, and each has a different remedy. The first is **typicality**: preference tuning
rewards the completion human raters find most familiar, so a single sample is drawn near the
centre of what a line in this situation usually looks like, and the centre of all dialogue is
nobody's dialogue. The first draft is the model's most average line. The remedy is not a
cleverer adjective in the prompt; it is many samples made to differ, and a selection step that
does not share the same preference. The second is **the model's
own trained register**: tuned to be helpful, balanced and clear, it gives every speaker the
same complete sentences, the same habit of naming feelings and explaining motives, the same
tidy closing thought. The remedy is a voice reference per speaker carried into every call,
because a model with no voice to imitate imitates itself. The third is **starvation of
context**: a prompt that names a character and a topic but not what the speaker wants, what
they will not say and what just happened has asked an underspecified question, and the
generic line is the correct answer to it. The remedy is a prompt that states the situation,
the want and the pressure before it asks for words.

The naive reading treats the problem as a vocabulary problem: collect the words that sound
machine-made, forbid them in the prompt, and regenerate. That fails twice. A prohibition in
the prompt can prime the very phrasing it names — measured in a small open model, and a
model-dependent risk rather than a law — and even when it is obeyed, a forbidden word is
replaced by its nearest neighbour, so the line keeps its shape and loses only its most
recognisable token. The tells
that survive a word list are structural — the three-item list, the "it is not X, it is Y"
reversal, the rhetorical question answered by its own speaker, the line that ends on a
summarising aphorism, the character who says exactly what they feel — and they are invisible
to a list of words.

## Specify first, then generate wide, then narrow

The order of the line is the method. Specification comes first because nothing downstream can
add what the prompt did not carry: a judge cannot select a specific line from candidates that
are all generic. Each prompt carries the speaker's voice entry verbatim and the entries of the
people they address, the situation, the speaker's want in this exchange, what they are
withholding, a length budget stated as the intended size of the line, and a few reference
lines written by a person. It is phrased as positive instruction with reasons — what the
speaker does and why — because a model steers toward what it is shown; the few refusals a
voice needs stay in, each with its reason, since a prohibition that says why is followed
better than a bare one. And it is written flat and short, because the register of the brief leaks
into the register of the lines: an ornate brief returns ornate dialogue. See
[voice-bible-in-every-prompt](./techniques/voice-bible-in-every-prompt.md).

Generation is wide because the first sample is the median. A slot gets ten to twenty
candidates, and the candidates are made to differ by **rotating constraints** rather than by
temperature alone: one is held under six words, one answers a question with a question, one
starts mid-thought, one refuses outright, one carries the subtext in an object rather than a
feeling. Temperature varies the surface; a constraint varies the shape of the line, and shape
is where a generic line and a specific one differ. Part of every batch is asked for on purpose
from the unlikely end — lines this speaker would say that most writers would not think of —
because the selection step can only find a surprising line the generator was permitted to
write. The count is a budget that shapes the work,
scaled to the slot — a line the player hears once at the turn of the story earns twenty
candidates, a filler acknowledgement earns a handful — which is
[a budget shapes the output, it does not only cap it](../../../_laws.md#a-budget-shapes-the-output).
See [candidates-under-rotating-constraints](./techniques/candidates-under-rotating-constraints.md).

Narrowing then runs cheapest first. A mechanical filter strikes the candidates carrying a
banned pattern or reusing a phrase another slot already shipped; a name-covered attribution
check drops the lines no reader can assign to their speaker; a blind judge scores what remains;
a critique sends the best back once or twice; the shortlist is read aloud; a person picks and
edits.

## The ban list is a measurement, and it lives after generation

A list of phrases to ban is useful exactly to the extent that it is measured. The measured
list comes from comparing what the production prompt actually produces, sampled in volume,
against human-written dialogue of the same kind: a phrase or a structure that appears in model
output many times more often than in the reference earns its place, with its ratio and the
model and corpus it was measured on. An editorial list — the patterns a lead simply dislikes —
is legitimate, but it is a different thing and is labelled as one, because a measured entry
expires when the model changes and an editorial entry expires when the lead changes their
mind. Collapsing the two makes the list unauditable: nobody can tell which entries are
evidence and which are taste, and the list grows until it forbids ordinary speech.

The list is enforced by the filter after generation, and not by the prompt, for the reason
above. A hit rejects the candidate; a person may override a hit, and the override is written
down with its reason, so the list learns where it is wrong instead of being quietly ignored.
Beside the list sits a ledger of the key phrases every accepted line has used, because a phrase
that is fresh in one slot is a tell by its fourth appearance across a script. The filter reads the list from its one canonical statement rather than from a copy
typed into a checker, which is
[the law and the check that enforces it share one source](../../../_laws.md#law-and-check-share-one-source),
and it reports how many candidates it read beside how many it struck, because a filter handed
an empty batch passes everything, which is
[an instrument proves it had input](../../../_laws.md#an-instrument-proves-it-had-input). See
[measured-banned-pattern-list](./techniques/measured-banned-pattern-list.md).

## The judge is blind, anchored, and from another family

A model judging lines is an instrument with known biases, and each has a countermeasure. The
deepest is that it prefers text it finds familiar — its own family's writing above all — and
the familiar line is the typical line, which is usually the one the pipeline least wants. An
unguarded model judge therefore does not merely miss genericness; it selects for it. So the
judge comes from a different model family than the generator, and two models of one family
agreeing count as one opinion. Another family removes self-recognition, not the shared taste:
judges of several families rank model-written stories above human ones, so the judge is
trusted only after it ranks human-written lines of the kind that ships above generated ones.
It prefers whatever sits
first or last in a list, so candidates are shuffled and the order is varied across draws. It
leans on length, in a direction that depends on the judge — measured judges split between
preferring longer answers and preferring concise ones, and two judges of one family have
leaned opposite ways on the same candidates — so each candidate is shown with its word count,
the rubric prices length explicitly against the slot's budget, and the lean is measured per
judge on the run's own scores instead of assumed. It
prefers what was labelled as the favourite, so candidates carry opaque identifiers and no
generation metadata — no constraint, no round, no hint of which was revised.

The rubric is the other half. It names around ten dimensions — the line as a move that shifts
the exchange, voice recognisable with the name covered, subtext, economy against the budget,
specificity to this world and moment, the scene job the slot exists for, freshness that
survives a third hearing, residual stock phrasing, the ear, and tone fit — and anchors each
level with a described example, so a score means a bar was cleared rather than a mood was felt.
Scores are per dimension, and any aggregate carries floors, so that a strong rhythm cannot pay
for a broken voice. Scores are graded
against shipped dialogue a lead would keep, not against the batch, because the best of twenty
generic lines is still generic, which is
[grade against what ships, not on a curve](../../../_laws.md#grade-against-what-ships-not-on-a-curve).
A score is a draw, not a property of the line. In one recorded run, lines re-scored by fresh
judges of the same model classes moved by a median of 0.3 on a five-point scale, and five of
eighteen crossed the ship bar one way or the other. So a line is compared only with scores
from the same draw, never with an earlier draw's number, and a line that one judge passes and
another fails on a floor goes to the person as a disagreement rather than being averaged past
the floor.
The judge produces a ranked shortlist with reasons; it does not produce the winner. See
[blind-rubric-scoring-by-another-family](./techniques/blind-rubric-scoring-by-another-family.md).

## Revision is bounded and has to win

A critique that quotes the failing words, names the one lowest-scoring dimension and states
the direction — without writing the replacement — gives the generator something to act on; a
critique of everything at once gets a line rewritten wholesale and back toward the average. The generator
revises against the same voice entry; the revised line goes back through the filter and is
judged blind against its own original, both scored in the same draw. A revision that does
not beat the original by more than the spread between draws is discarded — a model judge
favours the smoother, more converged text, and the best of three rewrites beats one original
by chance alone — and after two rounds the slot stops revising, because a model revising its own
line sands it toward its own average: each round makes the line smoother, more complete and
more explained, which are the faults the round was meant to remove.

Human checkpoints sit where model judgement is weakest. Models are measurably poor at catching
their own tells — a reviewer from the same family reads the family's habits as good writing —
so a person signs off the voice entries before anything is generated from them, picks from the
shortlist rather than approving a single winner, edits mostly by replacing and cutting words
rather than adding them, accepts the final line, and after the first play audits what repeated
and what two characters ended up sharing. No line ships with neither a judge's ranking nor a
person's read; the cheapest lines may be auto-picked, but they are labelled so. A label that
marks a line as the pick records who picked it, because later stages read the label: a
runtime that plays "the pick" first turns a model's highest mean into a person's choice
without anyone making one. A model's
approval is a recorded input to that decision and never the decision, which is
[no gate self-certifies](../../../_laws.md#no-gate-self-certifies); a line nobody human has read
is unreviewed draft, not a pass, which is
[unmeasured is not a pass](../../../_laws.md#unmeasured-is-not-a-pass). See
[critique-and-revise-with-human-checkpoints](./techniques/critique-and-revise-with-human-checkpoints.md).

## The ear is a separate rung

Every stage above reads text. Dialogue is spoken, or read at the pace of speech, and the ear
catches what no page review reaches: the line that runs out of breath, the sibilant cluster,
the clause order nobody says aloud, two speakers with the same cadence, the word that sounds
like another word, the hesitation mark that a voice will render as a long dead pause. The
read-aloud pass is performed on the shortlist in scene order with the other speaker's lines,
timed against the slot, by a person where possible and by synthesized speech as a cheaper
floor; its findings are recorded per line. Where lines will be synthesized or recorded, the
read-aloud runs before that spend, because a line fixed on the page costs a word and a line
fixed after a recording costs a session. It is a perceptual rung above
the textual ones, which is
[structural proof is necessary and never sufficient](../../../_laws.md#structural-proof-is-never-sufficient)
applied to a script. See [read-aloud-pass](./techniques/read-aloud-pass.md).

## Every verdict carries its basis

A score of eight means nothing without the rubric version, the judge's identity, the voice
entry version and the candidate text it judged, which is
[a number carries its unit and its basis](../../../_laws.md#a-number-carries-its-unit-and-basis).
A verdict is bound to the exact text; an edit of one word makes it a statement about the past,
which is [a verdict is bound to the content it judged](../../../_laws.md#a-verdict-is-bound-to-its-content).
The record of a slot — every candidate, its constraint, its filter result, its scores, the
critique, the revision, the read-aloud notes and who picked — is part of the line's history,
and it is the only honest input to whether the pipeline is improving.

## Failure modes of the naive reading

The **one-shot line** takes the first sample, which is the median. The **prohibition prompt**
lists the banned words in the prompt and gets them back, or their neighbours. The **taste
list** bans patterns nobody measured until ordinary speech is forbidden. The **mirror judge**
scores a model's lines with the same family and approves its habits. The **length reward** lets
a judge's lean, longer or shorter, decide without anyone deciding that length matters. The
**borrowed score** compares a line with another line's number from an earlier draw. The **curve**
ships the best of a generic batch. The **polish spiral** revises until every line is smooth,
complete and dead. The **page-only review** never hears the line. And the **rubber stamp**
records a model's approval as a person's decision.

## What this cannot decide

Whether the scene should exist, whether the story works, and whether a character is worth
writing are not questions this instrument answers; it selects good lines for slots somebody
designed. Nor does a high score prove a line lands with players: the rubric approximates a
lead's judgement, and the read-aloud approximates a performance. The first played session is a
rung above everything here.

## Boundaries

**Against subtext-and-voice-differentiation.** That sibling owns the craft standard — what
subtext, a distinct voice, a trade, quiet menace and earned warmth are — and the voice bible
itself, its rows and its maintenance. This subject owns the pipeline that holds a generator to
that standard: carrying the bible into every call, generating wide, filtering, judging blind,
revising and hearing. The rule for picking: if the question is what a good line for this
speaker is, read the sibling; if it is how a generation line finds out whether it got one, read
here.

**Against generative-artifact-gating.** That neighbour owns the joint between any generated
artifact and the next stage of spend: whether a generator ran at all, whether the selected
candidate resolves, auto-picked against human-chosen provenance, the spend ledger, and the
rule that two graders of one family count as one. This subject owns the dialogue-specific
quality instrument that runs inside such a gate — what is measured about a line and how — and
inherits the neighbour's provenance and gate placement unchanged. If the question is whether a
line may advance and who chose it, it is the neighbour's; if it is whether the line is good and
how that was found out, it is here.

**Against judgeable-spec-authoring.** That neighbour owns writing a document so a strict
automated reviewer can grade it — closed enumerations, recomputed numbers, a register that
states rather than argues. This subject's rubric and voice entries are such documents, and the
neighbour's discipline applies to them; what this subject owns is the generation and judgement
of the lines themselves, which are not specs and are judged on whether they sound like a person.

**Against generated speech acceptance in the media bundle.** That subject judges a synthesized
clip against its text, its requested voice and its signal quality. The read-aloud pass here may
use synthesized speech, but only as an instrument for hearing the written line; whether the
clip itself is acceptable audio is the media subject's question, and a line that reads well and
renders badly is two findings in two places.

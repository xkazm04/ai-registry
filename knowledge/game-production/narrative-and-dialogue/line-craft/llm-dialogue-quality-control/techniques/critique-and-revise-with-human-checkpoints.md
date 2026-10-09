---
layer: technique
type: technique
subject: llm-dialogue-quality-control
technique: critique-and-revise-with-human-checkpoints
status: forged
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [sending a generated line back for revision, generated lines get smoother and blander with every pass, deciding where a person must look at a generated script]
---

# Critique and revise, with human checkpoints

The named concern: improve a promising generated line by a bounded loop of specific critique
and revision that must beat its own original, and place a person at the four decisions a
model judges worst.

## The critique

A useful critique has three parts and leaves out a fourth. It **quotes** the words that fail;
it **names** the rubric dimension they fail on — one dimension, the lowest-scoring, per round;
it states the **direction** of the fix — "the second sentence explains what the first
implied", "she would not use his name here" — and it does **not** write the replacement. A
critique of every weakness at once invites a wholesale rewrite, and a wholesale rewrite by the
generator is a fresh sample from the middle of its distribution. A critique that supplies its own rewrite hands the
generator a target written in the critic's register, and the loop converges on the critic's
voice instead of the speaker's. Corrective language names the axis and the evidence and leaves
the value to the voice entry.

The critique comes from the judge or from a person, never from the generator critiquing itself
without a different reader in the loop; a model reviewing its own line in its own family finds
its own habits sound.

## The revision

The generator revises with the same call it generated from — the same voice entry, situation,
want and budget — plus the quoted critique, and returns three fixes to that one dimension rather
than one, so that the revision is itself a small selection. Each revised line goes back through the
banned-pattern filter, because revisions reintroduce stock phrasing, and is then judged blind
**against its own original**, shuffled, with neither marked, and both scored in that same
draw. A revision that does not beat its original is discarded and the original stands. This is
the guard against the most reliable failure of the loop.

The guard is read with the same biased instrument the loop is guarding against, so it needs a
margin. A model judge favours the converged text a revision loop produces — repeated
self-refinement settles into a model-preferred form that an outside model judge then rates
better — and three fixes against one original win by chance more often than one would. So the
revision must beat the original by more than the spread between draws, and the original's score
is taken from the same draw, never carried over from the round that sent it back: in one
recorded run, originals re-scored beside their rewrites fell by 0.3 on average from their first
scores, which a carried-over number would have credited to every revision.

## The polish spiral

A model revising its own line pulls it toward its own average. Each round makes the line more
complete, more balanced, more explicit about what it means — and those are the faults that
made the first draft generic. Unbounded, the loop produces a line every reviewer approves and
no one remembers. So revision is **bounded at two rounds** per line. A line still failing after
two rounds is a specification problem or a lost cause: go back to the situation and the voice
entry, or let the slot draw a fresh batch. When a revision lengthens a line beyond its budget,
treat the lengthening as a finding against the revision.

## The human checkpoints

Model judgement is weakest exactly where taste is hardest to state, and models are measurably
poor at catching stock writing; a person's edit of generated prose measurably beats a model's
edit of the same text. A person therefore makes four decisions:

**Before generation, the voice entries.** A person signs off each speaker's entry, its refusal
row and its reference lines above all, because everything downstream imitates them and a
generated reference line teaches the generator its own average.

**After judging, the pick and the edit.** A person reads the shortlist — not the single top
line — with the judge's reasons beside it, reads each aloud, and picks, or rejects all of them.
A person who sees only the winner can approve but cannot choose, and approval of a single
candidate measures nothing about the alternatives. The person's edit of the chosen line is
mostly replacement and cutting: swapping the one generic word for the specific one, deleting
the clause that explains. An edit that adds is usually putting back what the line was right to
leave out. The edited line goes back through the filter and the read-aloud, which are cheap;
its scores stay with the text they judged and are not cited for the edited one.

**At acceptance, the scene.** A person reads the accepted lines in scene order, because a line
that wins its slot can still break its scene by repeating a move the previous speaker just
made.

**After play, the audit.** Once the lines have been heard in a played session, a person counts
which lines repeated past their welcome and which phrases two characters ended up sharing, and
each failure goes back as a new brief rather than a patched line. This is the only checkpoint
that sees the lines as a player meets them, and the only one that catches repetition across
slots that each passed alone.

A model's ranking and critique are recorded as inputs to these decisions and never stand in
for them, which is [no gate self-certifies](../../../../_laws.md#no-gate-self-certifies). A line
that no person has picked is unreviewed draft and is reported that way, not as passed, which is
[unmeasured is not a pass](../../../../_laws.md#unmeasured-is-not-a-pass). The record says who
picked, so that an automatic pick is never later cited as a person's — and that includes being
read by a later stage. A status that marks a line as the pick travels with the line into the
table a runtime selects from, and a runtime that plays the marked line first gives a model's
highest mean a person's precedence: its siblings stop rotating, and a slot the record flagged
as weak becomes the one line the player always hears. Until a person picks, the mark says
auto-picked, and nothing downstream ranks it above a draft.

## Rationing the person

The person's time is the scarce resource. Spend it in proportion to how much the player meets
the line: hero lines get every checkpoint; high-frequency barks get the voice sign-off,
a pick over the variant pool as a set, and a sampled read of what shipped; filler lines can be
accepted from the judge's shortlist with a periodic sampled audit, labelled as auto-picked. A
filler slot too small for a judge gets the person's sampled read instead; a line with neither
a judge's ranking nor a person's read is unreviewed, however carefully its writer checked it,
and the writer of a generated script is the generator's own family.
Never shorten a checkpoint by showing the person fewer candidates than the judge saw fail; show
the floor exclusions too, so the person can overrule the judge.

## Decision rules

- **When a critique contains a replacement line, strip the replacement** and keep the quote,
  the dimension and the direction.
- **When a revision does not beat its original blind, in the same draw and by more than the
  spread between draws, keep the original.**
- **When a pick is marked in the line table, mark who picked**; an unratified pick never
  outranks its siblings at runtime.
- **When a line still fails after two rounds, return to specification**, not to a third round.
- **When a person has not picked a line, report it as draft**, whatever its scores.
- **When the person and the judge disagree, record both and the person's reason**; repeated
  disagreements on one dimension are evidence about the rubric.

## When not to use this

A line a person wrote does not need the generator's revision loop; it needs the read-aloud pass
and the scene read. A batch with a clear shortlist winner and a person's pick needs no
revision round at all.

## Evidence status

That models fail to detect stock writing reliably, that readers rank writer-edited text above
model-edited text and both above raw output, and that professional writers' edits were about
three quarters replacements, a fifth deletions and very few insertions, come from a primary
measured study of editors and models on model-written fiction, not dialogue. That model edits
help but stay below human edits supports the two-round bound without fixing its number; a 2026
measured study of ten-round self-refinement on scientific abstracts found most edits in the
first few rounds, then a model-preferred fixed point that an outside model judge rated better,
which supports bounding the rounds and distrusting a model judge's verdict on them. The drift
of re-scored originals and the runtime that ranked an unratified pick first are one recorded
dialogue run and its shipped line table. The one-dimension-per-round rule, the margin, the
post-play audit and the rationing of the person are practitioner synthesis. None of this
has been tested in a played game.

---
layer: technique
type: technique
subject: brand-voice-capture
technique: rejections-and-edits-become-constraints
status: forged
laws: [label-convention-as-convention, a-gate-before-money-and-copy]
shared_with: []
use_when: [designing the reject flow for generated drafts, deciding what a pre-send edit should teach the model, building the avoid block of a draft prompt]
---

# Rejections and edits become constraints

Once a voice is live, the human review step produces the best training
material the voice will ever get, and most pipelines throw it away. The
outbox records that a draft was rejected, or that a message was sent, and
discards *why* it was rejected and *what changed* before it was sent. The
technique turns both into constraints on the next generation: rejection
reasons are counted and rendered as "avoid" directives at the top of the next
prompt; substantive edits are banked as style facts that feed the next
distillation. The loop closes without anyone writing a rule by hand.

## Rejections: fixed reasons, because they are counted

A rejection carries a reason chosen from a fixed preset list - off brand,
inaccurate, too long, wrong tone, risky claim - and an optional free-text
note. The reasons are presets *because* they are tallied: a tally over free
text is impossible, and the whole point is that the third "too long" on a
channel changes the prompt while the first is noise. The note rides alongside
to carry the specific why a person typed.

The tally is per channel, sorted by count, and the top few reasons (three is
a usual cap) render as one directive each, in the business's locale: "write a
markedly shorter reply - recent replies were rejected as too long"; "claim
nothing that is not in the source material - recent replies were rejected as
inaccurate"; "make no promises about prices, deadlines or outcomes - recent
replies contained risky claims". The most recent, non-empty, de-duplicated
notes follow, each clamped in length and capped in count, prefixed so the
model knows a human wrote them. The block sits in the user turn, so a change
in the tally never moves a tool's evaluation fingerprint.

A rejection is a human decision and stays one: it is legal for a client to
assert, unlike "sent", which only a delivery route may mint. The gate before
copy is the human's; the tally is what the gate teaches.

## Edits: the quieter, commoner correction

The far more frequent act is not rejection. The person takes the draft, fixes
it and presses send. The difference between what the model wrote and what the
human sent is a correction the model never saw. The technique measures it: a
word-level edit distance between draft and sent text, normalised to a ratio
in `[0, 1]`, and when the ratio clears a threshold the before/after pair is
banked as a style fact - "edited the reply: <before> -> <after>", each side
clamped to a bounded length - with the same shape and source as an answered
interview question, so the facts surface renders it with no special case and
the next distillation reads it as material.

Word-level rather than character-level, because swapping one word is one
change to a person and five to a character diff, and because the arrays are
short enough that the cost is nothing. A quarter of the words is a common
threshold - below it the edit is a typo fix, above it a style correction -
and the number is convention, labelled so. A whitespace-only edit, an emptied
reply, and an edit of something that was never a real generated draft never
bank.

## Decision rules

- When a draft is rejected, require a reason from the preset list, because a
  reason that cannot be counted cannot change the next prompt.
- When a channel's tally has entries, render the top reasons as avoid
  directives in the user turn before the next draft, because the model
  repeats a mistake it was not told about.
- When a sent message differs from its draft by more than the edit threshold,
  bank the pair as a style fact for that scope, because that is the owner
  showing the model the voice with their own pen.
- When the edit is below the threshold, discard it silently, because a typo
  fix banked as a lesson teaches nothing and inflates the retrain count.
- When facts banked this way reach the retrain margin, the nudge in
  `voice-maturity-and-retrain-triggers` fires; the edit loop does not retrain
  on its own.

## Why not free-text feedback alone

A pipeline that collects "what was wrong?" as prose has feedback nobody
reads. A pipeline with presets has a signal the prompt can consume tonight,
and the prose survives as the specific detail. Both are needed; only the
preset is load-bearing.

## When NOT to use

Do not feed rejection directives into the *editorial* surfaces - a tally of
rejected lead replies says nothing about the article generator, and the split
in `editorial-voice-vs-personal-voice-split` applies. Do not bank edits from
a demo project or from drafts the human did not actually send - the fact
must come from a real correction on a real message. And do not let the avoid
block grow without cap: an old, resolved pattern still counted months later
pins the model to a mistake it stopped making, which is why the tally reads
recent decisions and the notes are newest-first and bounded.

---
layer: technique
type: technique
subject: brand-voice-capture
technique: rejections-and-edits-become-constraints
status: forged
laws: [label-convention-as-convention, a-gate-before-money-and-copy]
shared_with: []
use_when: [designing the reject flow for generated drafts, deciding what a pre-send edit should teach the model, deciding whether a small pre-send edit is a typo or a voice correction, building the avoid block of a draft prompt]
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
short enough that the cost is nothing. A whitespace-only edit, an emptied
reply, and an edit of something that was never a real generated draft never
bank.

## Judge an edit by what changed, not by how much

The obvious filter is a size threshold - a quarter of the words, say, with
everything smaller written off as a typo fix. It filters the wrong thing. The
corrections that carry a voice are *small*: one adjective traded for
another, a hedge cut from "we could perhaps call tomorrow" to "we will call
tomorrow", a clause of attribution added because this owner always cites
their track record, a sign-off replaced. A writer who has ghost-written for
hundreds of clients describes the canonical "this doesn't sound like me"
rescue as a one-percent edit: two or three sentences of attribution added to
an otherwise untouched piece. On a fifty-word reply a quarter is thirteen
words, and every one of those corrections changes between one and eight.
Measured on paired fixtures against a live implementation, a quarter-of-the-
words threshold banked none of eleven voice corrections - it was not
filtering typos out, it was filtering the voice out.

Magnitude cannot tell a typo from a voice correction, because both are
usually one word. **Kind** can. Align the draft and the sent text word by
word and classify each changed stretch:

| Kind | What it looks like | Banks? |
| --- | --- | --- |
| Cosmetic | the same word after folding case, diacritics and punctuation | no |
| Typo | a one-for-one swap whose spelling is near - a small character distance relative to the word's length, a transposition counted once | no |
| Fact | only numbers changed - a price, a date, a quantity | no, and not here: it is a grounding correction, owned by the anti-fabrication side, not a style lesson |
| Voice | a different word, or words added or cut | yes |

A size threshold survives as the *rewrite* path: above it the whole pair
banks as it is, whatever the kinds. Below it, one voice stretch is enough.
And a small edit banks **its changed spans, with a few words of context**,
not two whole replies: a distiller handed two three-hundred-character texts
that differ by one word does not see the word, and the fact that was worth
banking is lost inside its own evidence.

The near-spelling rule has one known blind spot, and a team adopting this
should pin it rather than discover it: a register change that is spelled like
a typo - a colloquial elision, a dropped final syllable that is how the owner
actually talks - classifies as a typo. Where a language marks register in
spelling, a per-language list of register variants is the fix; the character
distance alone cannot know it. The edges of the near-spelling test (a third
of the word's length, words of three letters or more) are convention.

## Decision rules

- When a draft is rejected, require a reason from the preset list, because a
  reason that cannot be counted cannot change the next prompt.
- When a channel's tally has entries, render the top reasons as avoid
  directives in the user turn before the next draft, because the model
  repeats a mistake it was not told about.
- When a sent message differs from its draft by more than the rewrite
  threshold, bank the whole pair as a style fact for that scope, because that
  is the owner showing the model the voice with their own pen.
- When the edit is below the threshold, classify each changed stretch and
  bank it if any stretch is a voice change, as its spans with a little
  context, because the smallest corrections are the ones that carry a voice
  and a whole-reply pair hides them.
- When every changed stretch is cosmetic, a typo or a number, discard it
  silently, because a typo fix banked as a lesson teaches nothing and
  inflates the retrain count, and a corrected price is a grounding failure
  to fix at the source, not a style to learn.
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

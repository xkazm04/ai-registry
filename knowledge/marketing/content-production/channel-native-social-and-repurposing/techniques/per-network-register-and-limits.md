---
layer: technique
type: technique
subject: channel-native-social-and-repurposing
technique: per-network-register-and-limits
status: forged
laws: [label-convention-as-convention, a-gate-before-money-and-copy]
shared_with: []
use_when: [writing the per-channel section of a social or repurposing prompt, choosing character budgets for channel variants, building the validator and clamp for generated posts]
---

# Per-network register and limits

A channel is described to a writer - human or model - by two things that must live in
one place: its **register** (the posture the reader brings, and therefore the shape of
a post that fits) and its **limit** (the character ceiling the channel will accept).
They live together because they are enforced by different parts of a system - the
register by the prompt and the reviewer's eye, the limit by a validator and a clamp -
and two enforcers reading two tables drift apart.

## The register table

Register is a short phrase per channel that names posture, adornment and structure.
The practitioner's set, as convention, for the channels a small business commonly
runs:

| channel class | posture | adornment | structure |
|---|---|---|---|
| professional network | informed, matter-of-fact | minimal emoji, no hashtags or one | bullets welcome; a claim, then evidence |
| visual network | thumb-scroll, image-first | emoji as warmth; three to six relevant hashtags at the end | short lines; the caption supports the image |
| conversational network | friendly, community | light emoji | a question or a story; one link at most |
| short-video feed | decide-in-one-second | playful; three to five current hashtags | hook in the first sentence, then a single beat |
| microblog | one sharp claim | none | one sentence, at most two; the link is the second |
| newsletter issue | already-subscribed, wants a reason | none | a subject line, a short lead paragraph, one call to read |

Every cell is practitioner convention and the table says so. What is *not* convention
is that the table exists once and is rendered into the prompt from the same source the
validator reads - a channel line of the form "channel (key): register | max N
characters" - so that adding a channel is one row, not three edits.

## The limit table

Limits come from the platform's own documentation and change on the platform's
schedule, so the technique holds two facts about them rather than the numbers
themselves:

1. **The technical ceiling and the visible length are different numbers.** As of this
   writing the long-form feeds accept two to three thousand characters, a short-video
   feed accepts several thousand after a recent raise from about two thousand, and a
   microblog's free tier accepts a few hundred while a paid tier accepts tens of
   thousands. Before a "more" fold the reader sees roughly the first hundred to hundred
   and fifty characters on most feeds. Posts are *written* to the visible length and
   *validated* to the ceiling.
2. **A limit is a contract per account, not per network.** The microblog case shows
   why: the ceiling depends on the account's tier. A system that stores one number per
   network is storing a floor, and "slightly under the limit" in the prompt is the
   margin that keeps the floor safe.

Budgets for a repurposing generator are deliberately *soft* and *below* the ceiling -
a newsletter lead of a few hundred characters, a professional post well under its
ceiling - because the ceiling is what the channel accepts and the budget is what the
channel's reader tolerates. The budget is convention; the ceiling is documented
behaviour; the technique labels each.

## Enforcement: clamp for length, re-prompt for absence

The validator emits one canonical sentence for a length overrun - "field has N
characters (limit M)" - and nothing else in that shape. The wrapper partitions
violations by that exact shape:

- **Clampable.** A length overrun is repaired deterministically: cut at the last word
  before the limit, append an ellipsis only if something was cut. No second model call,
  because a re-prompt to fix arithmetic is pure cost.
- **Needs the model.** A missing channel, an empty variant, a non-object parse. These
  earn exactly one repair re-prompt.

The matcher for the clampable shape is anchored at both ends and deliberately narrow:
a free-text violation that merely *mentions* a limit must never be mistaken for an
overrun, because the cost of that mistake is skipping a repair the model genuinely
needed. And every field over its limit is clamped in the *same* normalisation that
runs after validation, so the clamp is not a separate promise - it is the reason the
overrun was cheap to ignore.

The write path re-checks the ceiling independently of the generator: a post handed to
the scheduling endpoint over its channel's limit is refused, whoever wrote it. The
generator's clamp is a convenience; the endpoint's check is the gate
([a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy)).

## Decision rules

- When the model returns a variant over its channel limit, clamp it and do not
  re-prompt, because the clamp is deterministic and the re-prompt costs a full call.
- When the model returns no usable variant for a requested channel, re-prompt once,
  because backfilling from templates and calling it a generation is canned content
  billed as the model's work; if the repair still comes back short, backfill and flag
  the result as partly or fully fallback.
- When a channel's ceiling depends on account tier, store the lowest tier's ceiling as
  the default and let the account raise it, because a stored ceiling above the
  account's real one produces posts the channel rejects at send time.
- When writing the register into a prompt, render it from the same table the validator
  reads, because a register in prose and a limit in code diverge silently.
- When a register rule is a habit rather than platform documentation - the hashtag
  count, "few emoji" - label it as convention in the table
  ([label convention as convention](../../../_laws.md#label-convention-as-convention)).

## When NOT to use

- Do not apply the register table to a channel the business does not run. An unused
  row in the prompt costs tokens and invites the model to fill it.
- Do not use the visible-length figure as the limit. A validator set to the fold
  length rejects every good long-form post.
- Do not carry the register table into voice. The voice subject owns *how this brand
  sounds*; this table owns *what shape a post on this channel takes*. When they
  conflict on words, voice wins; on shape, register wins; the prompt says so
  explicitly rather than leaving the model to choose.
- Do not treat any number in this technique as measured. The limits are the platform's
  documentation on a given date and the registers are convention; both are re-verified
  in the application layer, never here.

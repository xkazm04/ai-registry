---
layer: technique
type: technique
subject: creator-voice-and-tone
technique: delivery-rate-budgeting
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [setting a rate dial or duration slot for a script, reconciling a slow voice profile with a fixed video length, validating that a render's word count matches its declared timing]
---

# Delivery-rate budgeting

Rate looks like the most innocent dial — a preference for fast or slow — and is
actually a constraint generator: **rate × duration = word budget**, and the word
budget is a hard arithmetic fact that every other property of the script must live
inside. Treating rate as a pure style knob is how a legal tone setting quietly
damages content it was never allowed to touch.

## The numbers

Measured across produced factual video: spoken delivery runs **197–252 words per
minute**, and the top of the range belongs to a dense, numerate, no-analogy script —
speed is not a proxy for shallowness. Rates well below the band (measured down to
125–176 wpm) occur where visuals carry the load; rate is confounded with visual
density and is therefore **set per format, not per creator**. Word budget ≈
duration_s × wpm / 60 — a 130-second piece is 425–525 words depending on engine —
and the editor should count seconds, because the viewer does.

Two budget corrections that are always forgotten:

- **Budget net of sponsor and furniture.** A "100-second video" was measured at 64
  seconds of essay — 35% was sponsor read. State every budget as essay time.
- **Deduct the profile's non-beat allowance up front.** Bookends and the digressions
  a humor/persona dial buys advance no beat; subtract them from the essay before
  structural turns are placed, or the turns drift late and the recovered seconds
  come out of the argument.

## The word floor, and which way to fail

Every beat chain has a **word floor** — the shortest prose that renders all its
beats — and a ceiling past which beats are being padded. When a slow profile meets a
fixed slot, the arithmetic collides: measured concretely, a 172 wpm profile on a
300-second slot allows 860 words against a chain whose floor was 1026. Something
must give, and the rule is:

> **A rate that violates the chain's word floor must lengthen the video. It must
> never shorten the chain — and the tool should say which of the two it is doing.**

The beats that volunteer for deletion under pressure are precisely the escalation
and the counter-argument — the "strictly more of the same" beats a script parses
without, which are also its honesty and depth. Silence about this decision means the
renderer makes it, and it makes it badly.

## Compression eats the evidence first

The subtler failure: even when no beat is cut, a negative word budget strips words,
and the cheapest words in a factual script are **hedges and spelled-out figures** —
grammatically optional, narratively invisible. Measured on a controlled re-render, a
slow formal profile with no dial set for either cut hedging density by 56% and
numeric expressions by 31%; every individual edit ("roughly 0.70 to 0.80" → "almost
step for step") was a good line by the profile's own standard, and the sum was a
render more confident than its medium-confidence sources. The control run with a
surplus budget held both properties, proving the channel is compression, not tone
per se. Consequences:

- **The slow profile is the dangerous one** at fixed duration — the intuitive worry
  about fast delivery cutting depth has it backwards; surplus words elaborate,
  deficit words extract.
- **Hedges and figures are word-budget exempt.** A hedge may not be removed to meet
  a rate; a scale conversion may lose its framing prose, never its figure.

## Decision rules

- **When setting a rate target**, bound it by format (visual density) first, creator
  preference second, and validate learned targets against the measured band —
  outside 197–252 for talk-driven video, suspect extraction error before
  exceptionality.
- **After every render, verify the arithmetic**: word count, implied duration at
  the profile's rate, and the declared slot must be mutually consistent. Craft
  checklists do not catch arithmetic — a script was found declaring 947 words and
  5:00 at 190 wpm while actually holding 1161 words (6:07), and none of its twelve
  self-checks was a word count.
- **When budget and floor conflict**, present the creator the honest pair: longer
  video at their rate, or their rate is incompatible with this slot. Never the
  silent third option.

## When not to use it

Budgeting assumes a fixed slot. For platforms with elastic duration, let the chain's
floor set the length and rate becomes a genuine preference again. And do not apply
the word-floor logic to non-argumentative content (montage, ambient, listicle by
design) — with no causal chain there is no floor to defend, only a pacing taste.

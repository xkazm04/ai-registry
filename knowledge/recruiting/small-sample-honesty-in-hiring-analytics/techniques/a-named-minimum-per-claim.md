---
layer: technique
type: technique
subject: small-sample-honesty-in-hiring-analytics
technique: a-named-minimum-per-claim
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
use_when: [adding a new hiring metric, reviewing a shared sample threshold, justifying why a figure was withheld]
shared_with: []
---

# A named minimum per claim

Every claim a hiring analytics surface is willing to make declares, next to its
own arithmetic, the minimum evidence it requires and the reason that number is
the number. Not a shared constant imported from a utility module. Not a value
picked because it looked round. A per-claim figure with a written
justification, sitting where the claim is computed.

The reason is that a threshold is an answer to a question, and different claims
ask different questions of the same rows. "Is this rate stable enough to
publish?" and "is this flag about the stage or about one candidate?" and "can a
proportion be compared between two groups?" have no common answer. A single
constant serving all three is correct for at most one of them, and silently
wrong for the others in ways nobody will ever notice, because a threshold that
is too low fails invisibly.

## Procedure

1. **Name the claim in a sentence a recruiter would say.** "Candidates wait
   nine days at technical review." "We accept 67% of the offers we make."
   "Screening does not disadvantage this group." The sentence, not the column
   name, is what has to be defensible.
2. **Ask what would make that sentence wrong.** Almost always the answer is a
   specific small-sample story: one candidate on holiday; one outlier hire; one
   group with three applicants. That story is the justification.
3. **Choose the minimum so the story cannot happen.** Pick the smallest count
   at which the single worst plausible observation cannot move the claim past
   the point where a reader would act differently.
4. **Write the reasoning where the constant lives.** One or two sentences. If
   the reasoning cannot be written, the number was guessed and the next person
   will change it during a demo.
5. **Give the claim a distinct behaviour below the floor** — see the thin-state
   and not-measurable techniques. A minimum with no defined below-floor
   behaviour is not a minimum, it is a comment.

## How to size the four common shapes

- **A displayed percentage.** The floor is roughly the reciprocal of the
  resolution you intend to show, scaled by how much movement matters. If a
  reader would act on a ten-point difference, a denominator where one
  observation is worth more than ten points is below the floor. Showing a
  decimal place raises the floor by an order of magnitude, which is usually the
  cheapest argument against showing one.
- **A benchmark-shaped headline.** Anything a team will quote outside the room
  wants a floor tied to the organization's own scale rather than to statistics
  — a meaningful fraction of a typical team's annual hiring, large enough that
  a single outlier hire cannot move it by tens of percent. A number that must
  survive being repeated needs a larger floor than a number that only informs
  a next action.
- **A behavioural flag.** An amber or a "look here" is sized by the cost of
  being wrong once. If acting on the flag consumes an hour of recruiter
  attention that is then unavailable to the genuinely slow stage, the floor is
  whatever count makes the flag more often right than not — usually a handful,
  and always more than one.
- **A group comparison.** Sized by statistics rather than by product: a
  proportion needs enough observations in *each* arm before the ratio between
  them is anything but noise, and the floor applies per arm, never to the
  total. This floor is not the product's to soften.
- **A regime floor.** A fourth kind, and the one that is almost never named: a
  count below which the *phenomenon being measured is not happening*, quite
  apart from statistical stability. A recruiter-capacity ratio computed over two
  open roles is not an unstable capacity signal, it is a quiet quarter, and no
  amount of extra observation of a quiet quarter produces a capacity reading.
  State this floor separately from the statistical one rather than folding it in
  — they refuse for different reasons and want different words.

## Count the minimum in the unit the claim rests on

A floor is a count of *the observations that carry the claim*, which is often
not the unit the metric is displayed in. A time-saved figure rests on the
automated actions actually performed, not on hires — gating it on hire count
would withhold a well-evidenced number from a team with three hundred assisted
actions and four hires, and would publish it for a team with the reverse. Ask
what the arithmetic is actually averaging over, and put the floor there. Where
the display unit and the evidence unit differ, the basis says both.

## Decision rules

- When two claims read from the same cohort, they still take two minimums
  unless someone has argued they ask the same question. Sameness of input is
  not sameness of claim.
- When a floor and a capacity limit both exist — a minimum below which the
  claim is meaningless and a maximum beyond which the computation is too
  expensive — state them as two separate named values. Folding a performance
  cap into the honesty floor makes an infrastructure decision look like a
  statistical one, and the next engineer tunes it for latency.
- When a customer's data does not clear a floor, the floor does not move. That
  customer is the reason the floor exists. Change what is shown below it, never
  the floor.
- When a claim's minimum has no justification anyone can reconstruct, treat
  the claim as ungated and fix it before shipping the next metric next to it —
  one unjustified threshold licenses the next five.
- When a metric is composed of others, its minimum is the strictest of its
  inputs, not the loosest and not an average. A blend inherits the weakness of
  its thinnest term.
- When a floor is enforced, the floor itself travels to the reader alongside the
  current count — "four of the eight needed" rather than a bare refusal. A
  private constant produces an unexplainable interface; a published one produces
  a progress bar, and that single change is what stops recruiters from reading a
  refusal as a bug.

## When not to use this

Do not apply a statistical minimum to a **count**. "Four candidates are in
technical review" is a fact about four candidates and is true at n=4; gating it
hides the operational reality the recruiter came for. Minimums govern rates,
ratios, averages, curves, verdicts and comparisons — anything derived — not
enumerations of the record itself. This is also the escape hatch that keeps
gating from making a young workspace useless: what is withheld is the
inference, never the record.

Do not use a minimum where the honest problem is structural rather than
statistical. A comparison with one item in it does not need a bigger sample; it
is not a comparison at all, and the answer is a refusal on grounds of shape,
not of size ([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).

Do not let a minimum substitute for a basis. Clearing the floor does not
exempt a figure from stating what it was computed over —
[a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)
applies at every sample size, and a basis that appears only on weak numbers
will be engineered away.

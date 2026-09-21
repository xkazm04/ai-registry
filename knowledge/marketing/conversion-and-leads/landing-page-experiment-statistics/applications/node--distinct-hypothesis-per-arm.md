---
layer: application
type: application
subject: landing-page-experiment-statistics
technique: distinct-hypothesis-per-arm
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# All arms in one call, duplicate headlines rejected, losers banned from the next round

Verified against the Czech adtech marketing workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08), Node 24. Two model tools
split the job: `src/lib/ai/tools/lp-variant-ideas.ts` proposes challenger *concepts*,
`src/lib/ai/tools/lp-variant-draft.ts` writes the *page* for every arm of one
experiment. Both run through the structured-generation wrapper with a normalizer, a
validator and a deterministic demo fallback.

## What the tree proves

**One call for all arms, and the reason is the test's cost.** The draft tool's header
(`lp-variant-draft.ts:8-13`) states the standard verbatim: "A model drafting one arm at
a time cannot know what the other arms already say, and reliably produces three pages
that are the same page with different adjectives - a test that costs six weeks of
traffic to conclude nothing. Drafting the set together lets the prompt demand (and the
validator check) that the arms are distinct and that each one follows ITS OWN seeded
hypothesis." The prompt repeats each seed's `armId` and hypothesis with "hold to it"
(`:56-58`) and asks for exactly `req.arms.length` items in the same order (`:84`).

**Distinctness is validated, not requested.** `validateLpVariantDraft()`
(`lp-variant-draft.ts:212-247`) has two bars, and the comment says "the second is the
one that matters": every requested arm must return a headline and an intro, and the
headlines - normalised by `headlineKey()` (`:201-203`: trim, lower-case, collapse
whitespace) - must be distinct, because "arms that open with the same sentence are not
two pages, they are one page served twice, and the experiment would spend its whole
sample size proving that a page converts like itself." A violation re-prompts once
through the wrapper.

**Identity is coerced, all-or-nothing.** `normalizeLpVariantDraft()`
(`lp-variant-draft.ts:173-197`) matches model arms by claimed `armId` first and by
position only when *not one* id matched (`:167-171`), because a mixed rule would
"hand arm B's copy to arm A as well" and the experiment would prove a page converts
like itself; an unmatched seed falls to `baseLpArm()`, a grounding-only floor that
invents no number (`:250-251`). A model that invents or drops an arm cannot publish a
page whose arms are not the ones being measured.

**No invented proof, by schema and by prompt.** The system prompt
(`lp-variant-draft.ts:44-45`) forbids conversion rates, customer counts, percentage
savings, ratings, statistics, guarantees, certifications, deadlines, prices, and any
address, phone or e-mail; the result type `LpArmCopy` is prose only; and when the
experiment runs on illustrative data the prompt adds a note to write generically
(`:79`). Temperature is 0.7 (`:295-298`), "warmer than the local page and cooler than
the ideas tool: the arms must be genuinely different from one another, but each one
is bound to a hypothesis it is not free to reinterpret."

**Losers are banned in the next round.** The ideas tool's system prompt
(`lp-variant-ideas.ts:28-38`) demands 2-3 concepts each testing a different
hypothesis, different from the control, never re-proposing angles "already tested and
did NOT beat the control - they are disproven", and inventing no numbers. The prompt
builder (`:41-53`) injects the control's CVR to beat and the loser list;
`bannedLabels()` (`:127-135`) puts the control's label and every loser on a banned
set, `distinctVariants()` (`:139-152`) de-duplicates by normalised label, and the
normalizer falls back to the demo set unless at least two distinct, non-banned
challengers survive (`:154-166`). The client computes `losers` as the arms whose
uplift went negative on the real experiment.

## The structural fact: grounding that a prompt promises must be asserted, not assumed

`tiger/call-sites/lp-variant-ideas.md:30-33` records the incident: the UI already
sent `controlCvr` and `losers`, the prompt builder was ready to use them, and
`validateLpVariantIdeasRequest` in `src/lib/ai/validation.ts` silently dropped both
on the way in - "the system prompt promises behaviour the request layer makes
impossible." Nothing errored; the ideas were plausible and blind. The fix threads
both fields through the validator (`validation.ts:910-918`, losers capped at 10,
`controlCvr` accepted only as a finite number in (0, 1]) and adds a contract golden
whose probe fixture carries control CVR and loser variants, so the live run exercises
the grounded path and a regression would fail the gate (`tiger/call-sites/lp-variant-ideas.md:41-45`).
The standard takes the lesson as its decision rule: a dropped grounding field produces
no error, only a worse test, so the fixture that proves the field arrived is part of
the technique.

## Deviations from the standard

- **Distinctness is checked on headlines only.** Two arms with different headlines
  and identical intros and bullets pass the validator; the standard asks for
  distinctness of hypothesis, which the tool enforces at the seed level (each arm's
  hypothesis is operator-recorded or comes from the ideas tool) but cannot verify in
  the drafted body beyond the first sentence.
- **Losers are labels, not hypotheses.** The banned set is built from arm labels;
  a re-proposed hypothesis under a fresh label passes. The standard's "never
  re-propose a disproven angle" is enforced to the resolution of the label.
- **Two rounds are not linked.** Nothing ties the ideas round to the experiment it
  follows beyond what the client sends; a history of disproven angles across
  experiments on the same cluster is not kept.

## Upward lesson taken into the standard

The all-or-nothing positional fallback (`lp-variant-draft.ts:167-171`) - identity
matching that is either wholly by id or wholly by position, never mixed - was not in
the expert draft and is now the technique's "bind each arm to the identity it was
seeded with" step, with the failure it prevents stated: a page that is not the arm
being measured corrupts the counter it feeds.

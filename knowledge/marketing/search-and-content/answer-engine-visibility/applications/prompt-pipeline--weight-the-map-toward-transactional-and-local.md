---
layer: application
type: application
subject: answer-engine-visibility
technique: weight-the-map-toward-transactional-and-local
stack: prompt-pipeline
status: forged
verified_on: 2026-09-09
verified_against: prompt-pipeline@2026.09.06
---

# Cut 3b: a reweighting step that hard-codes the magnitude it should observe

The open SEO agent (commit `a47c1ecd57016568cc791d24af9d809768d8d5ab`, 2026-09-06)
runs keyword research as a sequence of cuts in `.claude/commands/keyword-research.md`.
Cut 3b (`:113-119`) is the AI-overview reweighting, and it is a near-verbatim
statement of this technique's three rules - with one structural difference that
decides whether the step still works next quarter.

## Confirmed: the three rules, in the command

`keyword-research.md:117` - "Weight the map toward transactional and local
terms. Hire, book, quote, emergency, near me, [city] + [service]. These keep
close to their pre-AI-Overview click behaviour." That is the technique's first
decision rule, with the same term list. `:118` - "Treat informational posts as
top-of-funnel and internal-linking fuel, not traffic plays ... do not forecast
traffic off them and do not let them dominate the build order." That is the
blanked-forecast rule and the build-order rule. `:119` - "Say this in the
report when the map skews informational, rather than shipping a list of blog
posts whose clicks have already been taken." That is procedure step 4, the one
the technique calls the most common way the knowledge fails to reach the
client. The reference file behind the command, `references/keyword-strategy.md:121-128`,
carries the same three lines under "What changed with AI Overviews", each tagged
`[E]` and each with a source link.

The command also places the cut correctly: after the volume floor (Cut 3,
`:102`) and before the difficulty ceiling (Cut 4, `:121`), so the reweighting
runs on keywords that have already survived intent verification on the live
page (Cut 2), which is the technique's precondition that the classification
be read off the results page rather than a tool label.

## Deviation: the percentage is a constant in the prompt

`:113` opens the cut with the magnitude: "Organic CTR on queries showing an AI
Overview fell 61% (1.76% to 0.61% across 3,119 terms and 25.1M impressions)."
`keyword-strategy.md:124` gives the same figure with its source, a search
agency's September 2025 tracking study, and `:128` adds a second vendor's "58%
CTR reduction for the top result ... up from 34.5% eight months earlier, so the
penalty is deepening rather than stabilising."

Both numbers are correctly sourced and correctly classed as vendor
measurements. The structural problem is where they live: in the command text
that an agent reads on every run. The same tracker's 2026 update measured the
boxed-query CTR rebounding from about 1.3% to about 2.4% between December 2025
and February 2026, and aggregated 2026 vendor data puts the trigger rate at
roughly 36% of informational queries against 8% commercial and 5%
transactional. None of that reaches the command, because the command was
written to a number rather than to an observation. An agent following `:113-119`
in September 2026 will tell a client "fell 61%" and "deepening rather than
stabilising" - a dated vendor figure and a trend that has since reversed -
because the prompt says so.

The technique's rule is that the step fixes the ordering and never the
percentage: classify each query by observed box presence on the live page,
record `box`, `cited` and `checked-on` per keyword, and quote any magnitude
with its source class and date at the point of use. The command has the
ordering right and the observation missing. `:114-119` never asks the agent to
search the query and note whether a box appears; it asks the agent to apply a
rule about query types to labels it already has. That is the difference between
"the results page is the verdict" and "a 2025 study is the verdict", and on
this subject - the fastest-moving one in the bundle - the second one is
folklore within two quarters.

## Deviation: no blank, no quarantine column

`:118` says "do not forecast traffic off them", which is the right instruction,
but the map output the command produces (the cut list and the keyword map in
`keyword-map.md`) has no state for "retained, forecast blank, job: coverage".
A keyword either survives with its volume column or goes to the cut list. The
technique's step 3 - blank the forecast, not zero it, and write the reason
retained - has nowhere to land, so a boxed informational keyword that survives
the cut carries the same volume number as a money term and the report the
command writes cannot distinguish them by column, only by the prose warning
`:119` asks for.

## What the tree proves

The pipeline proves the technique's ordering is teachable as three sentences an
agent can follow, and it proves the failure mode the technique warns about in
its own text: the moment a vendor magnitude is written into a reusable prompt,
the prompt inherits the vendor's sample and the vendor's quarter. The fix for an
adopter is a five-line change - replace `:113`'s number with an instruction to
observe box presence per query on the live page and to quote any magnitude
with its source and date - and a map column for the blanked forecast.

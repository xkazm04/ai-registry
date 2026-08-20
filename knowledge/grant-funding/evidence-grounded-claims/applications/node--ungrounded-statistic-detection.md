---
layer: application
type: application
subject: evidence-grounded-claims
technique: ungrounded-statistic-detection
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: the grounding-echo guard (grant-writing-nonprofits)

The `grant-writing-nonprofits` repo runs its deterministic fabrication
check in `src/lib/ai/critique.ts:117-162` — the "grounding-echo guard" —
as a critical-severity gate over every generated narrative.

## The measured finding that keeps the check alive

The comment block at `critique.ts:117-123` records both halves of the
technique's doctrine as findings, not theory. First the stakes: "An
invented statistic asserted as fact is the cardinal grant-writing sin
(rejection/blacklist risk)." Then the counterintuitive part: "The Tiger
drill showed that handing the model RICHER data re-introduces it — a model
given real facts also invents adjacent 'supporting' stats ('40% read below
grade level')." That drill is why the repo kept the deterministic check
*after* wiring the VERIFIED ORG FACTS grounding block into drafting —
grounding and detection run together, permanently.

## The percentage scoping, in code

The same comment states the precision reasoning: the check is scoped "to
PERCENTAGES: counts, dates, and dollar amounts legitimately recur in
prose, but a percentage stated as fact is almost always a real org/funder
figure WHEN it's grounded. Anything else is a fabrication to flag."
Mechanically (`critique.ts:124-151`):

- `PERCENT_RE` matches numeric percentages in both symbol and word form
  (`%`, "percent", "percentage points"), and `percentSet` reduces the
  grounding — "the prompt: verified facts + RFP + funder-DNA + profile",
  i.e. everything the generator was actually shown — to a set of numeric
  values. Matching is value-level, exactly as the technique requires: the
  draft's "78%" matches a grounding "78 percent".
- `ungroundedPercentages(text, grounding)` first strips bracketed
  placeholder spans from the draft (`text.replace(/\[[^\]\n]{0,80}\]/g, " ")`)
  so "the honest anti-fabrication form" can never trip the alarm, skips
  the rhetorical `0` and `100`, dedups, and returns each offending value
  once as a rendered `"NN%"` list.

## Failing closed, actionably

`gGroundedPercentages` (`critique.ts:153-162`) wraps the detector as a
named gate — id `grounded_pcts`, title "No ungrounded percentage
statistics", severity `critical` — that passes only when the flagged list
is empty and otherwise reports "not in the verified grounding: 78%, 40%".
The output is a list of specific values to resolve, not a boolean, which
is what makes the gate's critical severity survivable in practice.

## The companion checks around it

The same file carries the placeholder half of the discipline:
`fillInPlaceholders` (`critique.ts:112-115`) extracts the distinct
bracketed spans still in a draft, with the comment naming the exact state
model — "honest (anti-fabrication) but not yet submittable. The submission
gate blocks these, so the critic surfaces them as a quality flag the
writer must resolve." One detector excludes brackets so honesty is never
punished; its sibling counts them so honesty is never shipped.

## Why this is a faithful realization

The application demonstrates the technique's three hard parts as working
code: scope chosen by false-positive reasoning rather than ambition
(percentages only), exclusions that protect the honest form (placeholder
stripping, 0/100 exemption), and the grounding defined as *what the model
was shown*, making the check a pure echo test that needs no model to run.
Its known limit is the one the technique states: a wrong figure inside the
grounding echoes cleanly — extraction honesty and provenance upstream are
what this gate presumes, not what it provides.

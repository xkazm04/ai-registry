---
layer: application
type: application
subject: agent-benchmark-design
technique: coverage-and-provisional-labelling
stack: process
status: forged
verified_on: 2026-09-16
---

# Process: a grid stopped by a seat limit, reported provisionally

A benchmark of eight agent skills against three repositories intended 15 GPT
configurations per cell plus a later Claude phase. On 2026-09-16 the shared GPT seat hit a
weekly limit with a stated reset five days out, leaving **40 of the GPT cells unrun** —
concentrated in the top tier and in two skills — plus two cells owed as reruns.

## What the report does with that

The report tool counts stored artefacts at generation time rather than trusting a
maintained tally, and prints per skill: cells measured against cells expected, the
repositories and tiers covered, and a `PROVISIONAL` marker with the reason. Two examples
from the run on 2026-09-16, at 415 scored runs:

```
agent-guidance-bootstrap
- Coverage: 30/72 cells; apps athena, kp, tracklight; efforts low, high
  - PROVISIONAL - grid incomplete, not publishable
- Recommended (cheapest within 1.0 of best on every app): gpt-5.6-sol@high (mean 7.5)

ci-gate-check
- Coverage: 30/72 cells; ... PROVISIONAL - grid incomplete, not publishable
- No recommendation: no configuration produced keepable, hard-passing output on every app
```

The publishing step refuses a provisional recommendation unless explicitly overridden, so
the label is enforced by a tool rather than by the author's memory.

## The distinctions that kept the counts honest

- **Refused cells count as missing, not as failures.** The capacity refusal at 20:59 and
  the 40 cells stopped by the weekly limit produce no records at all — their partial
  artefacts are deleted on detection — so they cannot average into a configuration's score.
- **A truncated cell is present but not finished.** One run hit its 60-minute ceiling with
  19 commits; it appears in the table, marked, and is ineligible for the recommendation.
- **Void cells are named with their cause.** Two runs whose type-check read a build
  directory shared with a sibling clone, and one killed by its ceiling after the host
  slept, are excluded pending re-run rather than scored.
- **A separately-measured phase is labelled separately.** With the GPT judge unavailable,
  the 96 Claude runs were judged by two Anthropic judges; those verdicts record the judge
  names and the phase is marked single-family and provisional until the GPT judge
  re-scores it, rather than being merged into the cross-family numbers.

## Why the label is worth the friction

The provisional recommendations are already being used to choose defaults — an operator
has to pick something today. What the label buys is that when the grid closes, nobody has
to work out which published claims rested on 30 of 72 cells: the artefact says so, in the
same paragraph as the recommendation, and the tool that publishes standards refuses it
until the count changes.

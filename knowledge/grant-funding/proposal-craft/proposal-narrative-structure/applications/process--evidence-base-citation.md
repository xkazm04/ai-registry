---
layer: application
type: application
subject: proposal-narrative-structure
technique: evidence-base-citation
stack: process
status: forged
verified_on: 2026-08-19
---

# Process: grounded evidence and anti-fabrication in a prompt-pipeline drafter

How the same drafting assistant (repo `grant-writing-nonprofits`) makes the
evidence discipline structural in its prompts rather than aspirational.

## The shared anti-fabrication clause

`src/features/ai-gemini/prompts.ts:36-39` defines `ANTI_FAB`, concatenated
into every narrative variant: "Do NOT assert invented statistics, past
results, dates, or named partners as fact — where a specific figure would
strengthen the case but isn't provided above, use a bracketed placeholder
like [insert # served] for the writer to fill, not a made-up number." The
report-section prompt carries the same rule independently
(prompts.ts:261). Placeholders-over-inventions is enforced at the prompt
layer, not left to review.

## Verified facts as the only figure source

The assembled prompt closes with: "Where a VERIFIED ORG FACTS block is
present above, use those exact figures wherever they fit and state no other
number as fact" (prompts.ts:197). The verified-facts block is injected as a
first-class grounding section (prompts.ts:190), separate from the untrusted
RFP text — the fact set is authoritative, the solicitation is data.

## The conditional measurability nudge

prompts.ts:150-159 is the incident-shaped lesson. A drill finding
(2026-06-23) showed that pushing for "a MEASURABLE outcome" with no data to
ground it "just produces bracket-bloat that INCREASES a writer's rework (a
'negative rung')". So the outcome directive —

> "Using those verified facts, state at least one MEASURABLE result — a
> named metric with its value or target — and do NOT present attendance or
> retention as the outcome."

— is appended **only** when the section is the narrative *and* a verified
fact ledger is present (prompts.ts:156-159). A downstream grounding-echo
gate (`critique.ts`, `gGroundedPercentages`) catches any statistic the model
invents to satisfy the nudge, so the conditional cannot silently reopen the
fabrication risk. Note the outputs-vs-outcomes rule riding along:
attendance/retention are explicitly barred from impersonating the outcome.

## The need statement's evidence posture

`src/features/ai-gemini/needStatement.ts:121-141` applies the same ladder to
the standalone need statement (180-260 words): open with the specific
problem and population, ground in the program's approach "not generic 'we
provide services'", connect the request to a concrete fundable outcome
aligned with funder priorities — with verified facts as exact figures and
bracketed placeholders for everything else (needStatement.ts:139).

## Voice without fact leakage

`src/features/ai-gemini/exemplar.ts:17-34` supplies the strongest voice
evidence — the org's own past *winning* application — as a delimited style
exemplar with an explicit firewall: "match its VOICE and STRUCTURE; copy NO
facts, names, or figures from it" (exemplar.ts:31). Candidates below 200
chars are rejected as not being a useful voice sample; the longest candidate
wins, capped at 1,500 chars and sanitized against forged delimiters. The
org's mission-statement ABOUT block carries the same guard: "never assert a
fact stated here unless it appears in the verified facts" (prompts.ts:174).
Evidence for *voice* and evidence for *facts* flow through separate,
differently-trusted channels.

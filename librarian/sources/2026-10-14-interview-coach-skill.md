---
source: github:noamseg/interview-coach-skill
kind: repository
url: https://github.com/noamseg/interview-coach-skill
title: "A prompt-only interview coach for candidates: story allocation and an over-claiming calibration rule"
author: noamseg
words: 4138 landing page; about 108000 in-tree prose (references/, releases/)
extracted: 9
accepted: 7
declined: 0
leads: 2
already_covered: 2
untriaged: 1
dispatched: 1
applied: 1
shipped: 0
run_id: icoach-1014
siblings: 4
rescan_when: a release note adds a calibration or outcome-tracking feature; or 8 weeks elapse (2026-12-09)
---

# A candidate-side coach: seven techniques, one new subject

**Class:** practitioner skill repository (prompt-only, no runtime). Operator focus: hiring
domain. Commit `634a8dd8`. Expected yield: one subject at most, mostly from the reference
documents; the README is its advertisement. Swept: story-mapping engine, gap-handling
module, calibration engine, differentiation, challenge protocol, evidence sourcing, JD
decode, transcript processing, version roadmap. Live siblings at start: 4, none on
recruiting.

## Design record (routing count: 4 candidates share one home-if-new, XL fired)

| decision | forces | corpus |
| --- | --- | --- |
| allocate a finite story set over predicted questions as a matrix, not per question | stories are scarce, questions are guessed | NONE (home if new: candidate-self-presentation) |
| tier a match four ways, secondary skill capped at workable | a story serves one competency as its centrepiece | NONE |
| count story use across a search, not one interview | the same people hear the same story | NONE |
| pick the gap response by the strength of what exists | an honest gap beats a thin story | NONE |
| call a coach calibrated at three outcomes | wants a feedback loop | corrected: three outcomes cannot calibrate |

## Triage (rule: Phase 5 score; all rows GAIN 3 as new technique in a new subject)

| # | candidate | read | decision |
| --- | --- | --- | --- |
| 1 | fit tiers with a secondary-skill cap | real gap | landed |
| 2 | portfolio assignment before per-question pick | real gap | landed (the worker replaced the source's conflict rule with loses-most-if-denied) |
| 3 | freshness and overuse across a search | real gap | landed, thresholds 3 and 5 not stated: unmeasured |
| 4 | gap response chosen by story strength | real gap | landed |
| 5 | earned secret needs proof | partial | landed as a tie-break, not a fit-tier boost |
| 6 | practice score needs outcomes before it is trusted | corrected source | landed against the source: the three-outcome rule over-claims |
| 7 | one treatment per root cause | partial | landed, resolution claimed for practice only |
| 8 | spiky point of view | lead | manufactured contrarianism conflicts with say-only-what-the-record-holds; return: a measurement that distinctive takes help |
| 9 | JD decode with confidence labels | catch | a confirmation probe and a benign alternative already exist |
| 10 | temporal decay tiers | untriaged | thresholds with no measurement; nobody verified |
| 11 | challenge always ends in one fix | lead | folded into the golden path as a paragraph |

## Landed and applied

Subject `interview-story-portfolio` (golden path, 7 techniques, 3 applications, 35 anchors
all held). One apply row: simulation on a connected hiring workspace's job-seeker
reasoning, unmeasurable; the surface holds no per-experience strength. Spec:
`librarian/specs/2026-10-14-interview-story-portfolio.md` (EXECUTED).

## Directions not proposed

The hiring workspace's scope names employer-side screening only; a candidate-side
preparation surface is a direction and was not proposed this run (no source design record
for it beyond the above).

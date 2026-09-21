---
layer: application
type: application
subject: lead-quality-and-source-diagnosis
technique: two-axis-fit-engagement
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Two-axis lead score with a thirty-day half-life - a pure fit x engagement module

Verified against the Czech-first marketing workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08), Node 24. Anchors:
`src/lib/leads/score.ts:25-102, 155-196` and the design note at
`docs/leads/design.md:128-146` (scoring) and `:186-216` (consent, erasure and the
no-model rule); the qualification half reused from
`src/lib/speed-lead/qualification.ts:38-54`.

## The structural fact the tree proves

The module header (`score.ts:1-18`) states the technique's thesis as its reason for
existing: "a 70 built from 'great fit, no engagement' demands the opposite action from
'poor fit, very engaged'. Collapsing them destroys exactly the information the work
queue needs, so this module returns both and a grade." It is pure - no I/O, no store
reads, `now` always passed in (`:16-17`, `:151`) - and there is no model in it: the
optional triage layer "must never auto-write a score" (`:17-18`), which
`design.md:146-150` restates with the redaction requirement.

**Fit** (`fitScore`, `:67-102`) is the five-component ladder of the technique with the
weights the technique labels as convention: reachability 25 (email six-tenths, phone
four-tenths, `:71-72`), service match 30 against the catalogue spine (`:74-79`),
business signal 20 with a registered company identifier at full value and a bare
company name at six-tenths (`:81-84`), region 10 (`:86-94`), channel quality 15 on an
explicit ladder (`sourceQuality`, `:123-136`: referral 1, organic or direct 0.85,
search 0.8, messaging 0.7, professional network 0.65, social lead form 0.5, import
0.3). The service match saturates at two hits (`offeringMatch`, `:104-121`: "one
clear match is already a strong signal; ten is not ten times stronger").

**Engagement** (`engagementScore`, `:155-172`) is half the reused
`qualificationScore()` and half behaviour - inbound volume saturating at four
(`:161-162`), replied 25, meeting 30 (`:166`) - with the comment that "either alone
can only reach 50, which is honest: a lead with three messages and no qualification
is not an A" (`:168-169`). `recencyFactor` (`:176-183`) is `0.5 ^ (days / 30)` with
`RECENCY_HALF_LIFE_DAYS = 30` (`:25`).

**The grade** (`gradeFor`, `:189-196`) is the plain 2x2 at `GRADE_THRESHOLD = 60`
(`:30`), B before C "because fit is the half you cannot change" (`:187-188`), and
`scoreRank` (`:227-231`) orders A to D then by the sum, with the comment that the
reply clock is applied by the caller on top: "lateness always outranks grade".

## Upward lessons taken from the tree

**Drop and re-normalise, never zero.** A fit component that cannot be evaluated - no
catalogue, no regions - is omitted and the remaining weights re-normalised
(`Component` doc, `:51-57`; the `offerings.length > 0` and `regions.length > 0`
guards at `:77`, `:88`), "so an unconfigured project is not punished with a low
score". This is the technique's first decision rule.

**Missing recency is freshness.** An absent or unparseable `lastActivityAt` returns
factor 1 (`:177-179`): "never punish missing data".

**An absent qualification is honestly zero.** `qualification` undefined scores the
first half zero (`:141-142`, `:156`) because "an un-worked lead IS low" - the one
place the technique treats absence as a fact rather than a gap, and the tree is the
reason it does.

**Erasure keeps the funnel skeleton.** `design.md:200-207`: erasure clears every
identity field and deletes the timeline first, then leaves a tombstone with stage,
attribution and timestamps, because a row delete "would silently rewrite historic
funnel counts". The golden path's denominator section carries this.

## The deviation the standard keeps

Every weight is asserted and none calibrated - the bundle-wide finding, and the
module says as much by calling its channel ladder "deliberately coarse and explicit
rather than a learned weight - an operator must be able to read it" (`:123-124`).
Readable is the right property; the standard adds a source and a date per constant
and a revisit once closed outcomes exist, which no surface here carries. The channel
ladder also names platforms inside the matching strings (`:130-133`), which is
correct for an application layer and is why the ladder is described upstairs by
channel kind, not by name.

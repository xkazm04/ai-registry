---
layer: application
type: application
subject: funder-format-blueprints
technique: trust-and-lottery-sections
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: unmeasurable
---

# UK trust and community-fund forms that never told the drafter to mirror published priorities

Source tree: the fleet's grant-matching and drafting platform for small nonprofits (slug `grant`),
a TypeScript web application, read on 2026-10-14 at `f5b9e0c` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the seam
and does not cite paths or lines. The change is `a694276` on the project's `main`.

## The sections were already built

The tree carries two UK shapes, routed by source key ahead of every genre rule: a government
community-fund form (need, activities, difference, about your organisation, budget) and a lighter
trust form that drops the organisation section (need, what you will do, difference, budget). Labels,
the community's-voice expectation, the one-indicator-per-outcome altitude and the "portal wins over
instinct" ordering all match the technique. Routing is pinned by tests, including that a UK source
beats the federal, arts and advocacy genres. A seam on the structure would only have confirmed it.

## The seam: the one decision rule with no owner

I chose the decision rule to falsify, *mirror the funder's published priorities*, because a
sentence-level rule is the easiest thing for a blueprint to miss while still looking compliant.
Neither form's drafting guidance said anything about it: the activities section asked for concrete
delivery and the trust form asked what "this trust's money makes possible", but nowhere was the
drafter told to say which published funding priority the work serves. Guidance is passed verbatim
into every drafting path (editor, full draft, autopilot, per-section suggest), so the gap was live.

A caught outcome would have been a finding that the priorities were already supplied some other way
(a prompt-level field, a critic). The full-draft assembler carries no priorities field, so the
guidance sentence is the only carrier.

## A and B

- **A**: both UK activities sections as read; no mention of funder priorities.
- **B**: one clause on each, conditional on the funder publishing priorities ("where the funder
  publishes funding priorities, say plainly which one the work serves and how"), so a funder with
  none gets no invented alignment. No new section, no structure change.
- **Target**: UK blueprints whose activities guidance carries the priority-mirroring instruction,
  A 0 of 2, B 2 of 2, pinned by a test that fails on A.
- **Floor**: the blueprint resolver and structure tests unchanged and green (13 of 13 in the
  blueprint suite); section keys, order and labels untouched.

## What this realization cannot do

It moves the instruction, not the draft. Whether a model told to name the priority names the right
one, and whether that raises a trustee's score, needs graded drafts against real funder priorities,
which the project has no offline corpus for. The verdict is `unmeasurable`, returning when a set of
UK community-fund calls with published priorities is held with scored or reviewed drafts.

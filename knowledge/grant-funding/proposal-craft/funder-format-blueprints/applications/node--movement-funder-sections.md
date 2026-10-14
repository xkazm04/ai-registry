---
layer: application
type: application
subject: funder-format-blueprints
technique: movement-funder-sections
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: unmeasurable
---

# A public-agency portal that could hand an applicant the movement form

Source tree: the fleet's grant-matching and drafting platform for small nonprofits (slug `grant`),
a TypeScript web application, read on 2026-10-14 at `d3b42c8` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the seam
and does not cite paths or lines. The change is `d7996c8` on the project's `main`.

## The four sections were already built

The tree's advocacy blueprint carries the technique's shape closely: the problem and who is
affected, strategy and theory of change, base, coalition and leadership, and how the change is
measured, plus a budget. Its drafting guidance names targets and decision-points, leadership of the
people affected, and power-building indicators, and the generation-time critic gates each section
on those words. A seam on the sections would only have confirmed them.

## The seam: the boundary, not the sections

I chose the technique's boundary to falsify: *not for public-agency funders; government sources
rarely fund lobbying, and the power frame can create compliance exposure.* The resolver ordered its
rules the other way. A specific portal won, then federal, then arts, then **advocacy, then the US
state portals**. The comment said so on purpose: a state advocacy call "still gets its specialized
blueprint". The advocacy marker list is loose ("policy", "reform", "coalition", "movement"), and
state-agency text uses those words in the ordinary sense. A state portal grant whose description
said "policy" therefore got the organizing form, and a unit test pinned that outcome.

A caught outcome would have been a state portal grant whose own text is genuinely a movement call,
which the technique would then have wrongly flattened. None of the six curated state grants reads
that way, and no state portal sells organizing money.

## A and B

- **A**: the resolver as read. A state source key with the advocacy genre resolves to the advocacy
  blueprint.
- **B**: a state source key resolves to the state blueprint (the federal-style need, approach,
  capacity, evaluation, budget) before the advocacy check. Arts still wins above it. Non-government
  sources keep the advocacy form. Every structural caller, the editor, the full draft, autopilot,
  per-section suggest, the review panel and the submission seal, resolves through this one function,
  so one edit moves them all.
- **Target**: state-portal pairs routed to the advocacy form. Over the project's six curated state
  grants (the only offline state corpus) A and B were identical, 0 of 6 on the advocacy form under
  either arm. The target did not move on any recorded input, which is why the verdict is
  `unmeasurable` and not `better`.
- **Floor**: the project's type check clean, lint clean, and the 57 test files that touch the
  resolver, 523 tests, green. The test that pinned the old order now pins the new one and fails on A.

## What this realization cannot do

- No store snapshot was available to count live state-portal grants whose text reads as advocacy,
  and the curated corpus is six illustrative grants. The measurement that would settle it is a
  count over the grants table of rows with a state source key whose funder genre is advocacy.
- The decision keys on the source key, not on the funder's type. A foundation reached through a
  state portal, or a government funder reached through a non-state source such as an aggregator,
  is not corrected. The loose advocacy vocabulary is untouched.

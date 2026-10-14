---
layer: application
type: application
subject: lazy-section-addressability
technique: anchor-coverage-guard
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: code
ab_verdict: better
---

# Anchor coverage guard - React/Next.js implementation (Personas marketing site)

How the `personas-web` tree gained the guard, and what it showed about the
tree's existing gates. The tree already had two source-level comparisons for
its home page (the scroll-map vocabulary against the stage manifest, in both
directions, and every `/#x` link literal against the resolver). Neither reads
the live document, and neither covers the info pages' own `scrollMapItems`
or the guided tour's `#id` scroll targets.

## What was added

- A pure comparison, `findAnchorGaps(declared, hosts, hostedIds)`, taking a
  predicate for "does the live document answer this address" and returning
  both directions; a second function renders one message per gap naming the
  address, the consumer and the page. No DOM inside, so node tests drive it.
- A development-only hook run from the shared page shell (the one component
  every info page renders its map through): after the first commit it asks the
  document `getElementById(id) ?? [data-scroll-anchor=id]`, collects the
  `data-scroll-anchor` wrappers, warns, never throws, does nothing in
  production. It deliberately avoids an animation-frame callback: the wrappers
  are already in the document when effects run, so no timing is being waited
  for, and the repo's animation lint rule (rightly) treats frame callbacks as
  gated work.
- The tour gate's header had said bare `#id` scroll targets were NOT checked,
  because verifying them "would mean hard-coding knowledge of the wrapperId
  prop". The stage manifest now exists, so the gate resolves each `#id`
  against it, or against an `id` literal in source. Fourteen targets, all
  green on the day.

## A/B (seam chosen to falsify)

Question that could kill the finding: do the existing gates already catch the
drift this guard exists for? Two mutations, run against the whole suite
(2,150 tests; four failures present before the change, all unrelated:
shallow-clone history checks and a timing-sensitive mutation harness).

| Mutation | Before (A) | After (B) |
| --- | --- | --- |
| rename a home stage's external wrapper id | caught by two existing tests | caught by those two plus the tour gate |
| rename the `lab` stage id on the features page and its section | **nothing failed**; the tour step and a scroll-map dot silently pointed at no element | one test fails, naming the tour, the step and `#lab` |

So the finding held where the home manifest owns the vocabulary (the existing
gate was sufficient, and the guard adds nothing there beyond the live-page
reading) and was needed where a vocabulary is hand-declared outside any
manifest: the info pages. The pre-existing backlog was zero on both
vocabularies, so no mute pressure existed at adoption.

Target: dead addresses in the suite's view, A 1 of 2 mutations invisible,
B 0. Floor: suite otherwise unchanged (no new failures, lint and typecheck
clean, warning budget not consumed).

## Not measured

The dev-time hook itself has not been run against a live dev server in this
pass; only its pure comparison is under test. Instrument that would measure it:
an end-to-end spec that loads each info page in dev and fails on a
`[anchor-coverage]` console warning.

## Where the repo stops short

The info pages' hand-declared maps still have no static per-page gate; the
tour check is source-wide, so an id duplicated on another page would satisfy
it. A per-page host check needs the page-to-component graph and was not
attempted.

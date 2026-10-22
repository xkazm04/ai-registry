---
layer: application
type: application
subject: zero-budget-channel-planning
technique: fit-effort-quick-win-rule
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The quick-win rule on two surfaces - a callout that goes silent and a recommendation that would not

The Czech-first adtech workspace (`systedo-case`, origin/master `7bbd1cab`,
2026-10-22) applies the quick-win rule in two places. The free-channel module's
callout (`src/components/app/modules/OrganicChannels.tsx:187-190`) is the rule as the
technique states it: the first channel with `effort === "low" && fit >= 70` and no
tracked stage, else nothing. The workspace overview's "free channel"
recommendation (`src/lib/insights/aggregate.ts`, `channelRecs`) quotes the same rule
in its comment ("the module's own quick-win rule ... so the callout and the rec name
the same channel") and then extends it, because the overview wants one item per
module. The node version is the one the tree's toolchain ran under on this machine.

## What the tree already does right

The overview falls back past the bar, but it does not keep the quick-win label. An
earlier fix changed the copy to describe the pick instead of the rule: a pick that is
not low effort and high fit is introduced as "the best-fitting free channel you
haven't started yet ... the plan has no low-effort quick win left right now". This
fits the technique's reason for its rule ("the label would be false"). The technique
forbids promoting a medium-effort channel *into the quick-win slot*. A surface that
must fill a slot can go past the bar if it relabels the pick, and the tree pins that
relabelling in three tests.

## The defect the seam was chosen to find

The fallback chain had four links: untracked quick win, best untracked, tracked quick
win, first channel. The last two only run when every channel is tracked. In that
state they put a channel the tenant has already started back on the overview. The
copy then said either that it was a low-effort way to get visible or, for a
high-effort pick, that the tenant "haven't started yet". The second claim is false,
and the module's callout is silent in the same state, so the two surfaces disagreed.
The seam was chosen to falsify the "show no quick win" rule. If the overview
genuinely needs an item, the rule was too strict for a dashboard and should become a
boundary. The outcome was the opposite: the items the overview produced in that
state were false statements, and no test pinned them.

## Proof

Arms: A is origin/master and B drops the two tracked links, so the chain is untracked
quick win, then best untracked, then no item. The test set is the five seeded
project-type packs × three tracking states (none tracked, every quick win tracked,
everything tracked) × two locales, 30 cases in all.

- **Target**: recommendations that name a tracked channel. A 10 of 30, with 4 of them
  saying "haven't started yet"; B 0 of 30.
- **Floor**: the 20 cases that are not all-tracked must not change. They are
  byte-identical (title and detail) across arms. `tsc --noEmit` is clean. `test:unit`
  runs 4,388 tests with 4,384 passing; the one failure is `patterns-embeddings`, the
  existing base red on origin/master that needs cloud credentials.

Shipped on branch `cur/quick-win-no-tracked-fallback` (`b2025f6f`, with the applied
row in `bca77255`), cut from origin/master, with a pinned test for the all-tracked
case in both locales. The branch is pushed. master is not, because the base red blocks
master pushes in this tree.

## What this realization cannot do

The threshold of seventy is a duplicated literal on both surfaces, not a shared
constant. A team that moves it in one place will split the callout from the
recommendation again. Neither surface records whether a tenant acted on a quick win,
so the threshold remains the uncalibrated convention the technique says it is.

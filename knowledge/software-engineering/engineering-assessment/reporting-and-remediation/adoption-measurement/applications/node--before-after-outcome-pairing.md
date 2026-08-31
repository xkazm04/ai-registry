---
layer: application
type: application
subject: adoption-measurement
technique: before-after-outcome-pairing
stack: node
verified_on: 2026-08-31
verified_against: node@24
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# The discriminator run against two instruments, and refused by both (Node)

The amendment to this technique adds a test: when a unit is missing from the
before side, decide whether it is missing from the *measurement* (coverage
change, exclude) or from the *world* (induced scope, count separately). This
application is the test being run against two real before/after instruments in
the fleet. Both returned "coverage change", the existing rule already governed,
and the amendment changed no verdict. That is the useful result, and it is
recorded here so the next run does not re-derive it.

## Instrument 1: a context-to-subject conformance map

The Personas client regenerates `.ai/registry-map.json`, joining source contexts
to registry subjects with a per-pair state (`unknown`, `deviation`,
`conformant`, `not-applicable`). Conformance is re-evaluated over time, so a
before/after pairing is exactly what a reader would build from it.

Two revisions, eight days apart, both from the project's own git history:

| | 2026-08-23 | 2026-08-31 |
| --- | --- | --- |
| contexts | 208 | 208 |
| (context, subject) pairs | 764 | 821 |

Pairs added: **245**. Pairs removed: **188**. Net: **+57**.

The naive reading is the net: the map grew 7%, so a conformance rate computed on
each side is roughly comparable. The paired reading is that only **576 of 821
after-side pairs (70%) existed on the before side** — the churn is four times the
net movement, and a delta computed on the totals is comparing two populations
that differ in nearly a third of their members.

So far this is the technique's step 5 doing its job. The amendment's question is
the next one: are those 245 additions induced scope or coverage change? The
discriminator resolves it without ambiguity. **The context count did not move at
all** — 208 to 208, none added, none removed — so no new unit of work appeared;
what changed is which subjects the matcher paired each existing context with.
The additions are the instrument's output moving, not the world's. Coverage
change, step 5 governs, exclusion is correct.

Worth noting because it cuts the other way: over the same period the project's
source tree went from **4,746 to 5,881 files (+24%)**. Real induced scope
existed in abundance and the map's unit population did not track it. A reader
who assumed "the tree grew, so new units are new work" would have reached the
right conclusion by the wrong route, and been wrong on these numbers.

## Instrument 2: a lint ratchet with a population floor

A second project pins per-rule finding counts in `.ai/ratchet-baseline.json` and
fails on any divergence. Its design comment is unusually careful about exactly
this class of problem, and it enumerates the drop case: "a drop has at least
three causes — the defect was fixed, the file carrying it was deleted, or the
counter broke — and they are indistinguishable from the number alone."

It guards the population accordingly, on one side: `minFilesWalked` is written
as 80% of the measured walk, and a walk below it exits 2 (instrument could not
run) rather than 1 (a verdict about the code). That is the coverage-change guard
implemented, correctly, and it is the same instinct as step 5.

**There is no ceiling.** The rise direction gets the enumeration the drop
direction got: a rise also has at least three causes — a defect was introduced,
the counter broke, or the population grew — and only the first is a verdict
about the code. A tree that doubled would raise every bucket and the ratchet
would report exit 1, a real regression, over a change in the denominator.

The asymmetry is real and the amendment predicts it. It also costs this project
nothing today, which is why the verdict below is what it is: the tree measured
**990 files on 2026-06-01 and 996 now** — six files in three months. A missing
ceiling over a flat population is a latent defect, not a live one, and proposing
the guard here would be proposing work with no measurable effect.

## Verdict, and the seam class it names

`not-better`. The amendment ran as designed on both instruments and changed
neither's output: the first because its churn is genuinely instrument-side, the
second because its population does not grow. Neither is a refutation of the
amendment's claim — both are cases where its precondition (a measured population
that grows because the practice created work) is absent — but the distinction
matters for the ledger, and the seam class is worth naming so it is not re-tested:

> **An instrument whose unit population is derived by a matcher rather than
> enumerated from the tree does not exhibit induced scope**, however fast the
> tree grows, because its units are its own output. Its churn is always coverage
> change, and step 5 as originally written is complete for it.

The instruments that *would* test the amendment are the ones whose units are
tree artifacts counted directly — a per-file finding count, a per-module
coverage figure, a backlog sized by work items. The ratchet is one of those and
is currently a flat tree; it is the place to re-run this when that changes.

## What this realization cannot do

Both arms are measurements of instrument *populations*, not of outcomes. Neither
project runs a genuine before/after outcome pair around an adoption instant —
there is no assessment score with a fixed adoption timestamp on either side — so
this application tests the amendment's discriminator and not the technique's
pairing procedure. The 245/188 churn figures are computed from two committed
revisions of a generated file and are exact; the +24% file growth is from
`git ls-tree` at two commits and is exact; nothing here is sampled or estimated.

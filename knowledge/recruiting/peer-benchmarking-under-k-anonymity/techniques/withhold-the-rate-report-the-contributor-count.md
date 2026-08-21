---
layer: technique
type: technique
subject: peer-benchmarking-under-k-anonymity
technique: withhold-the-rate-report-the-contributor-count
status: forged
laws: [absence-of-evidence-is-not-evidence, a-claim-carries-its-sample-and-its-basis]
use_when: [a peer cohort fails its floor, designing the empty state of a benchmark, deciding what a refusal may safely say]
shared_with: []
---

# Withhold the rate, report the contributor count

When a peer cohort does not clear its floors, the benchmark does not render a
number, a dash, or an empty panel. It renders a statement that the comparison
exists and is not yet sayable, carrying the one figure that is safe to publish:
**how many organisations are in the pool, against how many are needed.**

"Peer benchmark unavailable — 3 of 6 contributing organisations." Nothing else
changes about the layout. The comparison keeps its place on the page.

## Why the count and not a blank

A blank is read as a bug. A team that sees an empty benchmark panel three times
concludes the feature does not work, stops looking, and never learns that the
pool was simply young — and a measurement surface people have stopped looking at
is dead regardless of how correct it is.

The count converts a dead end into a progress bar. It tells the reader three
things at once: the comparison is real, it is not available, and it will become
available when more organisations contribute. It also tells the truth about
*which* floor failed, which matters because the two floors imply different
futures — a contributor shortfall resolves with adoption, an observation
shortfall resolves with hiring, and a team that knows which one it faces stops
waiting for the wrong thing.

And the count is the only figure whose disclosure risk is nil, because it is a
fact about the pool rather than about anybody's data. Every other candidate for
"something to show instead" — a wider cohort, a partial figure, a range, a
directional hint — is the withheld statistic wearing a disguise.

## Procedure

1. **Type the state.** *Withheld for pool size* is a distinct state from
   *measured*, stored and rendered distinctly, and never coerced to a number.
   A withheld rate that becomes a zero has made a specific false claim.
2. **Publish the count against the floor**, both numbers, so the shortfall is
   legible without the reader knowing the constant. A private threshold produces
   an unexplainable interface.
3. **Name which floor failed**, in plain language: not enough contributing
   organisations, or not enough underlying observations.
4. **Say what would change it** — "available once six organisations in this
   role family contribute" — which is the sentence that keeps the team looking.
5. **Keep the withheld state out of every aggregate.** A summary that counts
   "benchmarks available" and folds withheld ones in as neutral or passing is a
   lie with a denominator
   ([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).

## What the refusal itself may disclose

A refusal is a release too, and it carries information. Three cautions:

- **The reason can be identifying.** "Withheld: only 2 organisations in this
  region contribute" tells a reader in a small market roughly who those two are.
  Report the count against the floor; do not report the filters, regions, or
  role families that produced the thin cohort beyond what the reader themselves
  selected.
- **The count moving is a signal.** A reader watching the contributor count tick
  from five to six, and the benchmark appear, learns the sixth contributor's
  approximate position from the value that appears. Where this matters, publish
  the count in bands rather than exactly, or hold a newly qualifying cohort for
  one recompute cycle.
- **A refusal that lists everything is worse than a number.** The instinct to be
  maximally transparent about *why* is right for a single-organisation metric
  and wrong here, because the missing data belongs to third parties. Transparency
  about your own constraints; silence about other people's composition.

## Decision rules

- When a filtered slice is withheld, offer the broader cohort that does clear —
  as an explicit, differently labelled comparison, never as a silent
  substitution. Widening the cohort without saying so is the single most common
  way a benchmark starts lying.
- When a reader asks why a figure disappeared between visits, the honest answer
  is that the cohort behind their current filters no longer clears the floor.
  Design for this question; it will be asked.
- When a floor is nearly met, do not show the number with a caveat. A caveated
  peer figure below the anonymity floor is still a disclosure, and caveats do
  not un-disclose.
- When withheld states dominate a page, that is a finding about the pool's
  maturity and should be surfaced as such, not hidden by removing the panels.
- When a benchmark is withheld, the organisation's own figure still renders. The
  team's own data is theirs; only the comparison is unavailable
  ([a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)
  — the basis here simply has no peer term yet).

## When not to use this

Do not use this pattern where the floor failure is permanent and known — a
market slice that will never have enough contributors. There, the honest design
removes the slice from the interface rather than promising a progress bar that
will never fill. A refusal that implies "soon" when the answer is "never" is its
own small dishonesty.

Do not use the contributor count as a consolation metric. It is a fact about the
pool, not a proxy for the comparison, and rendering it in the visual grammar of
a benchmark figure — large, centred, with a trend arrow — will get it read as
one.

---
layer: application
type: application
subject: optional-dependency-degradation
technique: fallback-retirement-condition
stack: react
status: forged
verified_on: 2026-08-31
verified_against: react@19
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Eight correct reapers, none of them observable

A connected desktop application carries fallbacks for platform capabilities that
were once absent and are now universal — background workers, intersection and
resize observation. Each is the technique's subject exactly: a substitute path
taken only when a capability the platform was expected to gain is missing.

The technique makes three separable claims about such a fallback. A census over
the tree's tracked sources scored every seam against all three, with server-side
guards deliberately excluded from the population — an absent window object is a
stable fact about where the code runs, which belongs to this subject's original
lane and not to this technique.

## The paired comparison

Arm A is the tree as it stands; arm B is the same seams with the technique
applied. The instrument asserted itself twice before reporting: it must find a
non-zero population (a zero would indicate a broken pattern, not a clean tree),
and its branch-emission probe must fire somewhere in the codebase (otherwise a
score of zero measures the probe rather than the code). Both held.

| Claim | Arm A | Arm B |
| --- | --- | --- |
| The branch tests the **capability**, not a proxy for it | **8 / 8** | 8 / 8 |
| The check is **present** — no unconditional substitute | **8 / 8** | 8 / 8 |
| The branch taken is **emitted**, so retirement is verifiable | **0 / 8** | 8 / 8 |

n=8 seams across 4 capabilities and 7 files. The delta is entirely the third
claim.

## The structural fact, which nobody designed

The first two rows are the more interesting result, and they are corroboration
rather than a finding: eight seams, written by different hands against four
different capabilities, **all** test the capability directly and **none** branches
on a version string, a build flag, or a client identifier. The technique's
warning about proxies describes a mistake this tree never made.

Set that beside the third row and the asymmetry explains itself, in a way the
technique had asserted but not evidenced. **The check is load-bearing and the
emission is not.** Code that omits the capability check crashes on the runtime
that lacks the capability, so the check gets written correctly every time and
review catches it when it is not. Code that omits the branch signal behaves
identically in every environment and fails no test, so it never gets written at
all. Conformance tracks consequence, not diligence — and this tree scores 100%
on the half that breaks and 0% on the half that only makes a future decision
possible.

The cost is a specific unanswerable question. For all eight paths the tree
carries a correct, automatic reaper, and for none of them can anyone say whether
it has already fired — whether any session in the field still takes the
substitute, and therefore whether the path can be deleted. The reaper works; its
firing is unobservable; the code stays forever on the strength of a doubt that
one counter would settle.

## What this realization cannot do

The census scores a *static* property — whether a branch signal exists near the
seam — and cannot say what the runtime distribution actually is. That is the
point of the finding rather than a limitation of it: the number the technique
asks for does not exist in this tree, so no instrument reading this tree can
report it. Adding the emission is what makes the real measurement possible, and
until it is added the honest status of all eight paths is unknown rather than
dead.

The seam classification is also a judgment, not a measurement: the population
was drawn by excluding environment guards, and a reader who counted those would
get a much larger denominator and a much less meaningful ratio. The exclusion is
stated so it can be disagreed with.

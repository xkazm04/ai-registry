---
layer: technique
type: technique
subject: conformance-checking
technique: pass-ratio-comparability
status: forged
laws: [count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [publishing a conformance percentage, comparing two conformance runs, defending a score to the repository being judged]
---

# Pass-ratio comparability

## The concern

A conformance run produces findings; readers want one number. The number
that emerges is a **weighted pass ratio over the findings that this run
happened to emit** — and every clause of that definition restricts what the
number may be compared to. The technique is the set of rules that keep the
percentage honest: how the denominator is constructed, what must travel
alongside the number, when two numbers may be subtracted, and when to refuse
to render one at all.

## What the number actually is

Numerator: the weighted sum of checks that passed. Denominator: the
weighted sum of checks that *ran and applied*. Excluded from both:
everything unable to be checked, and everything not applicable to this
project shape. That exclusion is correct — scoring an uncheckable clause as
zero punishes the checker's own gaps — but it means the denominator is a
property of the run, not of the standard.

Consequences, each of which someone learns publicly:

- **Two projects of different shapes are scored over different
  denominators.** The smaller project skipped the expensive families and is
  measured on the easy ones. Its higher percentage means "conformant on a
  narrower set", which is not what a leaderboard renders.
- **A missing tool raises the score.** Drop a check into unable-to-check and
  it leaves the denominator; if it was a check the project was failing, the
  percentage goes *up* when the environment gets worse. Any percentage
  reported without its unchecked count is therefore uninterpretable.
- **The worst-scoring project has the smallest denominator.** A repository
  with no contract at all emits one finding and scores zero, while a
  repository with one genuine failure among many passes scores high. The
  ratio is not monotone in effort at the bottom of the range, which is the
  end of the range people quote.
- **A new standard version moves every score.** Adding clauses changes the
  denominator for everyone. Cross-version comparison is not a trend, it is
  two different measurements sharing an axis.
- **Weight changes are silent rescorings.** Weights are policy owned
  elsewhere; when they change, historical numbers do not, and the series
  breaks at a point no reader can see.

## Decision rules

- **Publish the failures and the warnings as the headline; the percentage is
  a display heuristic.** Owners act on findings, not on a number. The
  number's only legitimate job is ordering work and showing direction over
  time.
- **A percentage is comparable only between runs of the same shape**: same
  project, same standard version, same set of applicable-and-runnable
  checks. When any of those differ, the honest render is the two finding
  sets side by side, not a delta.
- **Every emitted number carries its predicate**
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): the
  standard version, the counts of pass / fail / warn / unchecked / not
  applicable, and the run identity. A percentage that can be copied out of
  its context without those will be, and the copy is the one that ends up in
  a slide.
- **Refuse to render the percentage when a hard failure fired.** A number
  next to an irreversible finding invites arithmetic where there should be
  an action.
- **Refuse to render when the unchecked fraction is large.** Above a
  declared threshold — a quarter of weighted checks is a defensible line —
  print the denominator problem instead of the ratio. The alternative is a
  confident number computed from a crippled run.
- **State the recomputation**
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
  a stored score names the run, the standard version, and the command that
  reproduces it. A score in a datastore with no path back to the run that
  made it is a rumour.

## Designing against gaming

An automated score published against a public rubric will be optimized
directly. This is not cynicism; it is the consistent finding of open
scorecard methodology reviews, which document both the incentive and
concrete instances of checks that awarded marks for surfaces that were
merely present. Three defences, in order of effectiveness:

1. **Raise the proof rung.** Execution proofs are far harder to fake than
   presence proofs ([declared-then-proven](./declared-then-proven.md)). Most
   gaming is presence-level gaming.
2. **Ship the breakdown with the composite, always.** A score whose parts
   are visible makes an inflated score self-incriminating; a score without
   parts makes the inflation invisible and the honesty unprovable.
3. **Treat the score as a private trend line and the findings as the public
   artifact.** Nothing forces you to publish a comparable-looking number
   about somebody else's repository.

Weight vectors, banding and the arithmetic of composites belong to the
scoring-rubrics subject; this technique constrains only what a *checker's*
ratio may claim.

## Procedure

1. Compute per-check outcomes with severity and applicability attached.
2. Build the denominator from applicable-and-runnable checks only, and count
   the exclusions separately.
3. Compute the weighted ratio; attach the predicate block.
4. Apply the refusal rules (hard failure present, unchecked fraction over
   threshold) before rendering.
5. Render findings first, number second, breakdown always, and label the
   number with the comparison rule in the same view where it appears — a
   caution printed only in the documentation is a caution nobody reads.

## When not to use it

- **Do not compute a ratio at all for a single-clause or tiny standard.**
  Five checks produce a percentage that jumps twenty points per finding;
  print the findings.
- **Do not use the ratio as a gate threshold.** Gating on a composite means
  a project can buy its way past a real failure with cheap passes elsewhere;
  gate on the finding set, at the severity that warrants it.

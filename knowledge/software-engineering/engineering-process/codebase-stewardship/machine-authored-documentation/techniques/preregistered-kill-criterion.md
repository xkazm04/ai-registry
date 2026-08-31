---
layer: technique
type: technique
subject: machine-authored-documentation
technique: preregistered-kill-criterion
status: forged
laws: [silent-state-is-ungoverned, count-carries-predicate, deletion-is-not-repair]
shared_with: []
use_when: [deciding whether to build a component into a generator, an experiment is about to be judged on how the outputs look, a planned feature keeps surviving reviews on enthusiasm, an experiment failed and the criteria are being renegotiated]
---

# Write the pass bar before the arms exist

The expensive decisions about a document generator are not about any document.
They are about what to build into the generator — a parser for an input
dialect, a layout solver, a theming layer, a whole architectural direction —
and they are settled by looking at outputs and forming an aesthetic judgment.
Aesthetic judgments are legitimate here; the outputs are for human eyes and
there is nothing better to judge them by. What is not legitimate is forming the
judgment *after* seeing which arm is yours.

The failure has a signature. The experiment runs, the result is ambiguous, and
the criterion moves: the bar was "clearly better", now it is "better in the
cases that matter"; the sample was five, now it is the three that worked. Every
step is defensible in isolation and the sequence has no stopping condition,
which is why the feature ships and the finding is lost. This is
[silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)
at the level of a build decision: the belief that decided the outcome was never
converted into an artifact anything could check.

## The four things fixed in advance

Written down before a single arm is produced, in a document with a date:

1. **The arms, named and characterised.** Not "old and new" but a description
   precise enough that a reader can tell whether an output belongs to each. The
   useful shape is three arms rather than two: the cheap baseline, the proposed
   intervention, and a **hand-crafted ceiling** produced without regard to cost.
   The ceiling is what makes the result interpretable — without it, a
   disappointing intervention and an impossible problem are indistinguishable.
2. **The pass bar, numeric and conjunctive.** Both halves matter. A single
   threshold on a mean invites the argument that the mean was dragged down by
   one case. A second criterion that is *structural* — the intervention is
   rated closer to the ceiling than to the baseline in at least four of five
   cases — cannot be rescued by an outlier argument.
3. **The sample and its diversity, argued.** Real inputs, drawn from real
   sources, with the coverage stated: the size range, the structural variants,
   the shapes each case contributes. And the substitutions declared — when a
   canonical example was too small and a near neighbour was used instead, that
   is a caveat written down at design time, not a discovery someone makes while
   defending the result.
4. **What the failing branch does.** The single most important line, and the
   one always omitted. A pre-registration without a failure disposition
   pre-registers only the outcome everyone wants; when the other one arrives,
   the team is designing the response under the worst possible incentives.

## Blind the rating

The ratings are subjective, so remove the two cues that make subjectivity
directional: randomise the presentation order and strip the labels. Rate every
output, in the randomised order, before de-anonymising any of them. This is
cheap — it is a shuffle and a rename — and it is the difference between an
experiment and a demonstration.

It also makes a self-evaluation admissible. An owner rating their own arms
blind is producing weak evidence honestly; an owner rating them labelled is
producing no evidence at all. The staging that follows from that: **run the
self-evaluation first as a screen**, and escalate to an external panel only if
the cheap arm clears the bar. A decisive self-evaluated failure does not need a
five-rater panel to confirm it, and the panel is the expensive half.

## Degrade, don't delete

The disposition that makes a kill cheap enough to actually accept. A failing
experiment does not have to mean the capability is abandoned — usually the
capability was fine and the *implementation* was the expensive bet. So the
failing branch names the cheapest surface that still delivers the capability,
and the feature degrades onto it.

The field record holds the clean case. The hypothesis was that a mechanical
translation of an existing diagram dialect, plus the project's own styling,
would land close enough to hand-crafted output to justify building a parser and
an automatic layout solver. Three arms: stock rendering of the dialect,
the same rendering with the project's theme applied, and hand-placed output.
Fifteen images, randomised, labels stripped, bar fixed in advance. The result
was unambiguous on the owner's own first read — the themed arm was not
meaningfully better than the stock arm — and it carried a finding worth more
than the feature: **swapping presentation without changing arrangement does not
close the gap; the arrangement was the product.**

The parser was killed. The layout solver was killed. The capability survived as
a prompt-level instruction: accept the dialect as an input notation, read it for
structure and meaning, and author fresh output rather than translating styling.
That cost approximately nothing and delivered what users had asked for. The
components that were *independently* justified — the typed intermediate
representation, the stable-coordinate renderer — were explicitly kept, because
they solved a different problem and the experiment had never been about them.

That last separation is the technique's sharpest edge. **A kill decision names
what dies and what survives, item by item.** A result that kills a whole
roadmap section because one hypothesis failed is over-reading it exactly as
badly as shipping anyway would have under-read it.

## Record the failure where the next person will find it

The experiment's document keeps its empty rating tables, its unused external
panel section, and its checked FAIL box, alongside the decision and the
consequence list. Rewriting it into a clean narrative of what was decided
destroys the record that the criteria were fixed beforehand — which is the only
thing that distinguishes this from a rationalisation
([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)). A
reader a year later needs to see the bar, the result against the bar, and the
disposition, in that order.

## Decision rules

- **When the outcome is obvious to everyone in advance**, still write the bar
  down — it takes ten minutes and the obvious outcomes are the ones that
  surprise. If it is genuinely obvious, the document is short.
- **When the experiment is cheap relative to the build**, always run it. The
  ratio here is the whole argument: fifteen rendered images against a parser
  and a layout solver.
- **When the result is ambiguous**, that is a result: the intervention did not
  clear a bar somebody set while disinterested. Ambiguity resolves against the
  build, because the build is the expensive branch.
- **When someone proposes re-running with a different sample**, the new sample
  is pre-registered too, and both results are kept.

## When not to use this

Not for reversible, cheap changes — pre-registration is overhead proportional
to the decision it governs, and a change that can be tried and dropped in an
afternoon should be tried. The technique binds where the build is expensive,
the judgment is subjective, and the outcome will be defended later.

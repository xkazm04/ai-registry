---
layer: application
type: application
subject: reference-parity-gating
technique: dual-anchor-scoring
stack: node
status: forged
verified_on: 2026-08-31
verified_against: node@24
applied: experiment
ab_verdict: not-better
---

# A second anchor that was not one, on a specification gate

A connected project runs a contract gate over its agent specification library: a test suite
asserts that every specification declares frontmatter, an output-contract section, a
discipline section, and a word budget. One specification additionally has its four named
output sections pinned as a golden contract. The suite runs on a pre-push hook.

This is a single-anchor parity gate in the shape the technique warns about. Its authority is
a set of structural rules encoded in the test itself; there is no independent measurement of
whether an artifact that satisfies those rules is actually the thing it claims to be. The
project's own documentation names the missing tier — recorded input, expected claims, real
output compared against them — and calls it the next step.

## What A and B were

**A** — the gate as it stands. Run over the specification library: 6 files, 69 assertions,
all green. Every specification passes the output-contract rule, which tests that a `What to
return` heading exists.

**B** — the gate plus a second anchor, implemented as a read-only probe outside the project
so no product code moved. The second anchor asked whether that section *enumerates* discrete
named outputs rather than merely existing: at least two named items detected as bolded list
labels, sub-headings, or backticked names.

Same corpus, same run, both arms counted with the same predicate.

## Result

Arm A passed 4 of 4 specifications. Arm B flagged 2 of those 4.

Both flags were **false**. Opening the two flagged sections showed each one enumerating its
outputs correctly, inside a fenced template whose lines begin with a markdown heading marker
— a form the probe's pattern did not recognise. Net real catches: zero. Net false positives:
two.

Verdict: **not-better**, and the failure is informative rather than incidental.

## Why it failed, and what the technique gained

The second anchor was a different rule, at a different threshold, on a different code path —
and it read *the same representation* the first anchor read. Its disagreements with arm A
were therefore properties of its own parser, not of the artifacts. It inherited every
blindness of the first anchor and added one of its own, while producing output that looked
like corroboration.

That is the technique's third decision rule firing, in a form the rule did not previously
cover: correlation is easiest to miss when the second measurement is *stricter*, because
strictness reads as rigour. The technique now carries the amendment — independence is a
property of the authority, not of the rule, and the test is whether one anchor could be
satisfied while the other is violated *for a reason about the artifact*.

The seam's own documentation had already identified the honest second anchor: run the agent
and compare real output against the declared contract. That reads a different representation
produced by a different process, and it is genuinely independent. It is also materially more
expensive, and this experiment is evidence that the cheap substitute is not a partial
version of it — it is a different thing that produces noise.

## The condition under which the technique did not hold

Dual-anchor scoring holds where two authorities measure different quantities of the artifact.
It does **not** hold where the only available second measurement re-reads the first's
representation, which is the common case for gates over text artifacts — specifications,
prompts, configuration, documentation. In that seam class the technique's benefit is
unavailable until a behavioural anchor exists, and adding a static one is worse than adding
nothing, because a false-positive rate on a pre-push hook is paid by every contributor.

Return condition: re-test when the project's golden-output layer exists, which supplies a
behavioural anchor and makes the conjunction testable as designed.

## What this realization cannot do

The experiment measured catch rate on a 4-specification corpus, which is far too small to
estimate a false-positive rate for the general case; it is an existence proof that the
correlated-anchor failure occurs, not a measurement of how often. Nothing here tests the
technique's primary claim — that a defective *reference* is caught by a specification anchor
— because this seam has no reference artifact at all.

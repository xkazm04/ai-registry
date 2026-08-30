---
layer: application
type: application
subject: quality-gates
technique: prose-rule-drift
stack: node
verified_on: 2026-08-30
verified_against: node@22
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Auditing a standing document against its own gate surface

A fleet of Node projects shares one standing instruction file per repository
and a common tooling lane. The audit in
[prose-rule-drift](../techniques/prose-rule-drift.md) was run against one of
those repositories: enumerate the imperative rules its standing documents
state, and for each ask what fails, and where, if someone violates it right
now.

The measurable was chosen before the run: **the count of stated rules whose
violations are currently observable**, and — for any rule found unbacked —
the count of violations actually present. Both arms use the same instrument
on the same tree, so the comparison is paired rather than before-and-after.

## The rule that was unbacked and holding

One rule asserts a hard ceiling on component file length and states the
current count of violations as zero. Nothing enforces it: the lint
configuration carries no rule for it, the maturity gate does not measure it,
and no script in the tooling lane mentions it. By the audit's own
classification it is unbacked, and the technique's stated prior is that an
unbacked rule has been violated for as long as it has existed.

Counting directly across 785 component files returned **zero violations**.
The prior was wrong here, and the reason it was wrong is the useful part:
this rule sits outside the technique's own predicted-risk region on all
three axes. It constrains an **artifact** rather than an action, that
artifact lives in the reviewed tree, and the governed action — editing a
component — is the most frequent action in the repository. Every edit is
therefore an occasion to notice, and the standing file is read at the start
of every assisted session.

That is a confirmation of the technique's boundary rather than of its
headline, and it is worth recording as such: **the risk region is doing real
work, because a rule that falls outside it survived without a mechanism.**

## The rule that was backed on paper and unbacked in fact

A second rule governs how shared tooling is attached to each repository, and
the standing document names the checker that verifies it, with its exact
invocation and its non-writing flag. Read as documentation, this is the
strongest of the three audit answers: a named check, in a named place.

Grepping the checker's filename across the hooks, the pipeline definitions
and the task runner's scripts returned no match in any of them. **Nothing
invokes it.** Running it by hand reported **27 violations across four of the
repositories it governs** — missing links, missing generated rule files, and
a managed ignore block that no longer matches its declaration.

The two arms of the pair:

| Arm | Instrument | Violations observed |
| --- | --- | --- |
| A — the rule as the tree currently enforces it | whatever runs on commit and in the pipeline | 0 |
| B — the rule with its own named checker invoked | the same checker, run once | 27 |

Same instrument, same tree, one invocation apart. The gap is not a
measurement of code quality; it is a measurement of **how much a documented
check that nothing calls is worth**, and the answer is that it is worth
exactly what the prose was worth.

## What the tree's shape says

Two structural facts fell out that nobody designed, and both are better
evidence than the counts.

**The violations concentrate where the technique says they will.** The two
repositories carrying 27 of the 27 are the two whose shared-tooling
declarations changed most recently. The governed action — re-linking after a
declaration changes — is rare, is taken at setup time, and leaves its
evidence in a directory that no test reads and no reviewer diffs. Rarity,
peripherality and prohibition-shape are the three properties the technique
names, and the drift landed on exactly the rows that carry all three.

**The checker's existence is what retired the rule from attention.** The
standing document's sentence about it is true — the check exists, the flag
works, the invocation is correct. Nothing in that sentence is wrong, and a
reader who takes it as evidence of enforcement is making the inference the
document invites. This is the state the technique gained a section for after
this run, and it was found by applying the technique rather than by
reasoning about it.

## What this realization cannot do

The audit is manual and its recall is unmeasured: it enumerates rules by
grepping imperative phrasing in standing documents, which finds rules written
as **never**, **always** and **must**, and misses rules stated as
descriptions of how things are done. The 27-violation figure is exact
because it is the checker's own output; the count of *unbacked rules* is a
lower bound and should not be reported as a rate.

Nothing here measures whether the drift caused a defect. Three of the four
affected repositories are working normally with their links missing, which
means the rule's cost is latent rather than realized — and an audit that
cannot price a violation cannot rank its own findings.

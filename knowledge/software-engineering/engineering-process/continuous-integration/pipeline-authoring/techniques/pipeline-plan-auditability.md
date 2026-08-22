---
layer: technique
type: technique
subject: pipeline-authoring
technique: pipeline-plan-auditability
status: forged
stage: multi-service
laws: [derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [the plan is generated rather than written, explaining an old run, reviewing a change to a generator]
---

# Pipeline plan auditability

Once the plan is computed, the repository no longer contains it. What is in version control is
the generator; what actually ran is a value that existed for the duration of one run. This
technique is the obligation that replaces the readable file: **the resolved plan is an output
of the run, stored beside the inputs that produced it.**

That is [derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
applied to the most consequential derived value in delivery. A generated plan with no recorded
form and no invokable regeneration path is a decision with no arbiter — and the question it
eventually has to answer ("why did the security lane not run on that change") is asked in
exactly the circumstances where nobody can afford to guess.

## What gets captured

Three things, together, because any one alone is insufficient:

- **The resolved plan**, as submitted: every unit, its identity, its dependency edges, its
  targeting. This is the answer to "what ran".
- **The inputs**, as read: the changed-file set and its base, the manifest revision, the
  parameters, the branch class, the generator's own version. This is the answer to "why".
- **The selection predicate**, in words: what closure was computed and what was therefore
  skipped. Per [count-carries-predicate](../../../../_laws.md#count-carries-predicate), "14
  lanes ran" is not a finding — "14 of 31 lanes ran, selected by closure over the manifest at
  revision R" is.

Store them where the run's other outputs go, with the retention the run's outputs have. A plan
retained for a week cannot answer a question asked in a quarter, and the questions that matter
are asked late.

## Print without submitting

The generator has a mode that produces the plan and does not submit it. This is not a
convenience, it is what makes the generator reviewable:

- **In review.** A change to a generator is unreadable as a diff — a three-line change to a
  filter can add or remove forty units. The reviewable artifact is the *difference between the
  plans* the old and new generator produce for the same input. Generate both, diff them, and
  review that.
- **Locally.** An author can see what their change will cause before causing it. A generator
  that can only be exercised by pushing has kept the worst property of the configuration file
  it replaced.
- **In the run itself.** Emitting the plan before submitting it costs nothing and puts the
  answer in the log, where the person debugging is already looking.

## One code path generates and verifies

Where a plan or a generated artifact is also checked for freshness — the common arrangement is
a build step that regenerates and a gate that asserts the committed copy matches — both must be
**the same code path with two modes**, not two implementations of one rule.

Two implementations are two authorities for one fact, which
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary) forbids for
the same reason: they will disagree, and they will disagree at the moment somebody extends the
rule and updates only one. A generator with a `--check` mode that recomputes and compares is
one authority. A generator plus a separate validator is two.

The corollary is worth stating because it is routinely violated: the verifying mode must
recompute from the same inputs, not compare against a stored digest of its own previous output.
A digest comparison verifies that nothing changed; it does not verify that the output is
*correct*, and it passes happily when the generator has been broken since the digest was
written.

## Assert the instrument

A verification that compares two computed values must confirm that both were actually
computed. The characteristic failure is a comparison against an empty or unreadable input,
which matches nothing and reports agreement. State the counts before the verdict — how many
units were generated, how many were read back — and fail loudly when either is zero. A check
that walked nothing and exited clean has reported "blind" as "fine".

The same discipline extends to the comparison's own stability. If the digest of a plan is
computed over raw bytes, it becomes a property of the machine that wrote it — line endings,
path separators, key ordering — and the check then fails for reasons that have nothing to do
with the content, indistinguishably from a real drift. Normalize before hashing, and gate the
normalization itself.

## Decision rules

- Capture the resolved plan, its inputs, and its selection predicate as run outputs, with the
  run's retention.
- The generator has a print-without-submitting mode, used in review, locally, and in the run.
- Review a generator change by diffing the plans it produces, not the code alone.
- Generation and verification are one code path with two modes.
- The verifying mode recomputes from inputs; it never compares against a stored digest of its
  own output.
- State the counts before the verdict; zero on either side is a failure, not a pass.
- Normalize before hashing, so the verdict is a property of the content and not of the
  checkout.

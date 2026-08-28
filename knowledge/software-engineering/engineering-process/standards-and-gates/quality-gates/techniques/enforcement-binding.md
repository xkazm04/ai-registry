---
layer: technique
type: technique
subject: quality-gates
technique: enforcement-binding
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success, absent-guard-is-loud, gate-sees-target]
shared_with: []
use_when: [a check is green in the pipeline and nobody can say whether it blocks a merge, a job was renamed or split and no gate has failed since, deciding what happens to a required check whose job did not run]
---

# The enforcement binding

Every other technique in this subject engineers a gate: what it reads,
what severity it can carry, whether it is alive. This one is about the
join between the gate and the merge decision — because those are made by
two different systems, and the second one is configured somewhere the
first cannot see.

The pipeline computes verdicts. A separate mechanism, belonging to the
hosting platform rather than to the repository, decides which of those
verdicts the merge action is allowed to proceed without. That mechanism
is the actual top rung of the ladder. A pipeline whose every check is
correct, precise, and blocking by construction enforces nothing at all if
the merge decision is not bound to it — and no run of that pipeline, at
any verbosity, will report the problem, because from the pipeline's side
everything worked.

[gate-laddering](./gate-laddering.md) ends at "the binding rung is the
last one" and treats the merge pipeline as that rung. This technique
supplies what sits above it. Its closest sibling there is the
typical-commit fire set — the diagnostic asking *which jobs actually
run* for a representative commit; this one asks the next question, which
is what the merge decision does about the ones that did not.

## The join is a name

Requirements are almost universally expressed as a list of check
**names** that must report success. That list is a set of strings,
matched against whatever the pipeline happens to emit, and nothing
validates that the two sides refer to the same thing.

So the highest-frequency failure in this whole area is a rename. A job
renamed for clarity, split in two, moved into a reusable definition, or
folded into a matrix emits differently-named results; the requirement now
matches nothing that runs. Matching nothing is the platform's version of
a glob that walked zero files, and it resolves the same wrong way —
**a requirement satisfied by no check is not a failing requirement, it is
an absent one**
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The configuration still reads strict. Every screen still shows the rule.
The next audit will find the check listed as required and the check
running green, and neither observation touches the fact that they are no
longer the same check.

The consequence for practice: renaming a check is a change to the
enforcement configuration, exactly as much as deleting it, and belongs in
the same change with the same review.

## "Did not run" resolves to a definite value — and which one depends on where you skipped

This is the sharpest edge in the subject and it is entirely
counter-intuitive, because two ways of expressing one intent produce
opposite safety:

- Condition the **whole pipeline definition** — restrict it by path, by
  branch, by commit-message directive — and on a change that does not
  match, it never runs and therefore reports *nothing*. A requirement
  waiting on a result that will never arrive stays unsatisfied, and the
  merge is blocked indefinitely. Loud, obstructive, and **fail-closed**.
- Condition the **unit inside** the pipeline — same intent, one
  indentation level down — and the unit is evaluated, found
  inapplicable, and reported as **success**. The requirement is
  satisfied by a check that did no work. Silent, convenient, and
  **fail-open**.

An engineer writing "don't run the expensive suite for a docs-only
change" can produce either of these and will not be told which. The
second is the dangerous one and it is also the one every troubleshooting
guide recommends, because the first is unbearable in daily use — so the
usual resolution to a deadlock is to move the condition inward, which
converts a gate that blocked everything into a gate that blocks nothing,
and looks in every report like the deadlock was fixed.

This is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) at
the boundary the law describes, an optional result meeting a
non-optional requirement, with the platform supplying the default. The
sound construction is to keep the requirement always-firing and put the
conditionality inside the *work*, so that a check which skipped its
expensive body still reports honestly and, where the skip could hide a
real target, still runs the cheap part that proves the skip was correct
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Where a
platform offers only the two behaviors above, the choice is made
deliberately and written down beside the check, not discovered.

## The configuration is a guard living outside the thing it guards

The enforcement binding is typically not in the repository. It is not in
the diff, not reviewed with the change that depends on it, not restored
by a revert, and often not visible to the engineers who write the gates.
It can usually be weakened by one person holding one permission, in a
web form, without a trace anyone reads.

That is the exact shape of
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud): a
protection that must be configured protects the repositories somebody
remembered to configure. The defaults are permissive, new repositories
start unbound, and a repository split or migration begins life with a
full pipeline and no binding at all — the failure is invisible precisely
because the pipeline is the part everybody looks at.

Two counters, in order of cost. **Read the binding back from the
platform and check it in a gate**, so the enforcement configuration is
itself a gated artifact with a committed expectation — a requirement
that disappears then fails a build like any other regression. Where that
is not available, **write the expected binding into the repository as
plain text and require review of it**, which does not enforce, but
converts a silent change into a detectable one.

## Enumerate the binding — it is an inventory question, not a diff question

The subject's own distinction applies directly here. Asking "did the
enforcement configuration change" is a diff-shaped question, and
diff-shaped gates are blind to absence: a check added to the pipeline and
never added to the requirement list changes nothing to detect. The
question that works is an inventory:

1. Enumerate every check the pipeline can emit.
2. Enumerate every check the merge decision requires.
3. Diff the two sets, in both directions.

Both directions carry a finding. Required-but-never-emitted is the
rename failure above, or a deadlock waiting to happen. Emitted-but-not-
required is the more common and more comfortable one: a real check, with
real findings, whose severity is blocking by construction inside the
pipeline and **advisory by configuration** at the only rung that
matters. Its author believes they shipped a gate. They shipped a report.

This enumeration is the honest answer to "what is our quality bar" — not
the rule count, not the pipeline definition, but the intersection of what
runs and what is required.

## Prove the refusal, not just the failure

[gate-liveness](./gate-liveness.md) establishes that a gate is proven
alive by feeding it a known-bad input and watching it go red. The
binding needs the same proof one level out, and passing the first does
not give you the second: the seeded-failure exercise stops at a red
result, and a red result that nothing consumes is exactly the state this
technique exists to find.

So the liveness proof for the binding is a change that *should* be
refused, taken all the way to the merge decision, with the refusal
observed there — not in the run log. Do it when the binding is created,
and again after any change to check names, pipeline structure, or the
protection configuration. It is the only observation that crosses the
seam, and everything on either side of the seam can be healthy while the
seam is not.

## Bypass at this level is a feature, with a ledger

Merging past a failing requirement is a legitimate capability — the
incident fix at 3am, the release blocked by a genuinely broken external
dependency — and a binding with no override gets loosened permanently the
first time it traps something urgent, which is strictly worse than an
override used twice a year. The rule mirrors the one for local hooks
([hook-hygiene](./hook-hygiene.md)): the escape hatch stays, and every
use of it is attributable, visible after the fact, and counted. A rising
override count is the same signal as a rising bypass rate one rung down,
and it is read the same way — the gate is too slow, too imprecise, or
guarding the wrong thing.

What must never be permanent is the *class* of exception: an actor
exempted from the binding indefinitely, or a path permanently excluded,
is not an override but a hole with a polite name.

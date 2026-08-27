---
layer: technique
type: technique
subject: deployment-contract
technique: direct-push-delivery
status: forged
stage: solo
laws: [gate-sees-target, absent-guard-is-loud, failure-not-empty-success]
shared_with: []
use_when: [a single owner is deciding whether to push the default branch directly, review ceremony exists with nobody to review, the default branch has been red for days, designing a push-time gate, an agent-heavy loop makes branch ceremony the bottleneck]
---

# Direct push delivery

A single-owner repository that routes every change through branch, proposal and self-approval
is performing review without a reviewer. The ceremony costs a loop's worth of speed and buys
nothing the owner did not already have. Pushing the default branch directly is the honest
topology for that situation — and it is only honest when the safety the ceremony *pretended*
to provide is supplied by something real. This technique is the list of what must be real.

## The topology's one sentence

In direct-push delivery, **the push is the release act**. Everything that must be true of a
release must therefore be true before the push — which is a stronger statement than "run the
checks"; it relocates the entire quality gate from after the fact to before it.

## Precondition one: the whole gate, one command

The full blocking set the delivery system enforces — static analysis, types, tests, the
production build, every repository-specific check — is runnable locally as **one declared
command**. Not a documented sequence a disciplined person types; one command, named in the
project's task definitions, that is the same set in the same order the remote gate runs, per
[gate-sees-target](../../../../_laws.md#gate-sees-target). The command discovery and
never-invent rules are
[pre-authorship-verification@machine-paced-delivery](../../machine-paced-delivery/techniques/pre-authorship-verification.md);
what this topology adds is that the aggregate command is *load-bearing*: with no reviewer and
no pre-merge pipeline between author and production, that command is the entire gate.

Two clarifications earned by field failures. First, the local gate must include the checks
that actually break — a gate that runs the fast half of the pipeline and skips the half that
has been failing all month is a ritual, per
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success). Second, the
production build belongs in the set even though it is the slow step, because type-clean code
that does not build is precisely the failure a hosting platform will find for you in
production's path.

## Precondition two: machinery, not memory

The gate runs at push time because a hook runs it, not because the owner remembers. The hook
fires on pushes to the default branch specifically — other branches push freely, the remote
pipeline covers them — and it blocks on the first failure. Memory-based discipline fails
exactly when it matters: under time pressure, at the end of a long session, when an agent is
doing the pushing. The repositories that generated this technique had documented gate
sequences, working checks, and days-red default branches, all three at once, because the link
between "documented" and "runs" was a human remembering.

## Precondition three: the escape hatch announces itself

A gate with no bypass gets deleted the first time it blocks an emergency; a gate with a silent
bypass is already deleted. The resolution, per
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud): the bypass exists, is
deliberate to invoke, and *leaves a record* — it prints what it is skipping and demands a
reason that lands somewhere durable. Skipping the gate is sometimes right; skipping it
silently never is.

## Precondition four: red main is an outage

In this topology the default branch is the release channel, so a red default branch means the
release channel is broken — and everything stacked on top of it ships unverified. The
response is an outage response: the next action in the repository is fixing the gate, not the
next feature. The failure pattern this prevents is well documented in the field: a red gate
tolerated for a day becomes a red gate tolerated for two weeks, at which point every push is
un-gated and the topology has silently become "no delivery process at all."

## When a branch still earns its place

Direct push is the default, not a law. A change still goes through a branch when: the owner
wants the platform's preview environment *before* the default branch moves (see
[environment-promotion](./environment-promotion.md)); the change is risky in a way a rollback
cannot cheaply undo — a destructive migration, a public contract change; several working
sessions (human or agent) would otherwise interleave half-done work on the default branch; or
the change is a proposal from an autonomous worker, which per
[proposal-not-push@machine-paced-delivery](../../machine-paced-delivery/techniques/proposal-not-push.md)
does not push the default branch at all. The topology is "direct by default, branch by
declared exception" — the inversion of team practice, for the situation that inverts the
team's premise.

## After the push, close the loop

The remote pipeline still runs, as the backstop for what only a clean environment proves. The
push is not finished until its remote verdict is seen — a one-command watch that follows the
triggered run to its conclusion turns "push and hope" into "push and know," and it is cheap
enough to be habitual. A push whose remote verdict nobody read is a release whose gate nobody
read, one boundary later.

## Decision rules

- Adopt direct push only with all four preconditions standing: one-command full gate,
  push-time enforcement by hook, a loud recorded bypass, red-main treated as an outage.
- The aggregate gate command mirrors the remote blocking set exactly — same checks, same
  order, build included; a check the remote gate enforces that the local gate skips is a hole,
  not an optimization.
- The hook guards the default branch only; other branches push freely under the remote
  pipeline.
- Branch by declared exception: preview-first changes, rebuild-irreversible changes, parallel
  sessions, autonomous proposals.
- Watch the remote run to its verdict after every default-branch push; the push is not done
  until it is green.

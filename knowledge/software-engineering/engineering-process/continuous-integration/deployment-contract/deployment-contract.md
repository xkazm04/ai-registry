---
layer: golden-path
type: golden-path
subject: deployment-contract
status: forged
use_when: [a hosted build fails while the delivery system is green, choosing where the production build runs, deciding whether pushes to the default branch may deploy directly, an environment setting exists only in a provider dashboard, production shipped from a commit the gate never passed]
techniques:
  - platform-build-parity
  - environment-promotion
  - direct-push-delivery
  - deployment-config-as-code
  - deploy-gate-coupling
---

# Deployment contract

A repository that deploys through a hosting platform is in a relationship it usually has not
written down. The platform builds the code — with its own runtime version, its own install
flags, its own environment — and ships the result to real users, on a trigger the repository's
own verification pipeline may know nothing about. Most of the time the two systems happen to
agree, and the relationship stays invisible. The day they disagree, the failure appears in the
one place that has no gate in front of it: the deploy.

This subject names that relationship and makes it a contract. The thesis:

> A deployment is a claim that a **specific, verified build** reached a **named environment**
> through a **declared path**. Every part of that claim the repository does not control in
> writing — where the build runs, what triggers it, what configuration it sees — is a part
> that will eventually diverge silently.

The subject exists because the neighboring subjects each stop one step short of it. The
pipeline's structure is owned elsewhere; so is the trust boundary around what a delivery
system may execute, the machines that execute it, and the artifact's own publish door. What
none of them owns is the *target*: the hosting platform as a second build system with its own
opinions, the environments it maintains, and the topology by which a change travels from a
developer's push to a user's request.

## The platform is a second delivery system, and it must not be a second opinion

When a hosting platform builds the code itself, the repository has two build systems: the one
in its verification pipeline and the one at the host. Every input that can differ between them
— runtime version, install command, dependency resolution flags, environment variables present
at build time — is a place where "verified" and "deployed" quietly stop describing the same
thing. The classic symptom is a green pipeline and a failed hosted build, or worse, a hosted
build that succeeds by resolving differently.

The standard is parity from one declared source, per
[one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary): the build
command, the runtime version and the install flags each live in exactly one place the
repository owns, and both build systems read them from there. Where the platform cannot read a
declaration, the declaration is mirrored *into* the platform deliberately and the mirror is
recorded. How to enumerate the inputs, where each authority lives, and what to do when the
platform's builder cannot be fed are
[platform-build-parity](./techniques/platform-build-parity.md).

## Environments form a ladder, and production is a promotion

A platform that builds every push gives each change a disposable environment for free —
a preview, addressable, running the real code against real configuration. That is the cheapest
integration test that exists, and the standard is to treat it as a rung: every change earns a
preview, the preview is looked at or probed, and production is reached by **promoting a build
that already exists**, not by building again from the same commit and hoping for the same
result. A rebuild is a recomputation, and per
[derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation) it must
either be named as one or be avoided; promotion avoids it.

The same shape answers rollback: the previous production build still exists, so rolling back
is re-pointing, not reverting-and-rebuilding while an outage runs. Environment naming, what a
preview must prove before promotion, and the rollback that never waits on a build are
[environment-promotion](./techniques/environment-promotion.md).

## Direct push is a legitimate topology — with preconditions, not vibes

Branch-and-review delivery assumes there is someone to review. A single-owner repository has
nobody, and forcing every change through a ceremony with no second participant produces
ritual, not safety: unreviewed approvals, stale branches, and a slower loop with the same
actual risk. Pushing the default branch directly is the honest topology for that situation —
**provided the safety the ceremony pretended to provide is supplied by something real.**

The preconditions are the technique's substance: the entire blocking gate is runnable locally
as one command, that command runs at push time by machinery rather than memory, the escape
hatch announces itself per [absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud), and
a red default branch is treated as an outage rather than a backlog item — because in this
topology the default branch *is* the release. When a change still earns a branch (the author
wants a preview first, the change is reversible only by rebuild, parallel agent sessions share
the checkout), the topology bends without breaking. The preconditions, the escape hatch
discipline, and the boundary where direct push stops being honest are
[direct-push-delivery](./techniques/direct-push-delivery.md).

## The platform's configuration is code, or it is drift

Everything the platform needs to build and run the code — the build command, the runtime
version, scheduled invocations, routing, environment variable *names* — either lives declared
in the repository or exists as clicked state in a dashboard. Clicked state is invisible to
review, absent from history, unrecoverable at re-setup, and per
[silent-state-is-ungoverned](../../../_laws.md#silent-state-is-ungoverned) it is not governed
by anything. The standard: declare what the platform can read from the repository, and for
what it genuinely cannot — secret *values*, project linkage, plan-level settings — keep a
committed manifest that names each setting, where it lives, and why it cannot be code. The
split between declarable and dashboard-only, the manifest's shape, and the re-setup test that
proves it complete are
[deployment-config-as-code](./techniques/deployment-config-as-code.md).

## The deploy must not outrun the verdict

A platform that deploys on push, and a verification pipeline that runs on push, are two
consumers of the same event racing each other — and the platform usually wins, because it has
no gate to wait for. The result is a production deploy from a commit whose verification later
fails, and nothing anywhere that says so. Per
[verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary), the verdict has to
travel to where the deploy decision is made; per
[failure-not-empty-success](../../../_laws.md#failure-not-empty-success), a deploy that
happened *before* the verdict existed must never read as a verified one.

Two honest resolutions exist: couple the platform's deploy to the verdict where the platform
supports it, or accept the race deliberately and move the whole gate ahead of the push — which
is exactly what the direct-push topology's preconditions provide. What is dishonest is the
default: both systems wired to the same push, no coupling, and the disagreement discovered by
users. The coupling mechanisms, the compensation pattern, and the after-push watch that closes
the loop are [deploy-gate-coupling](./techniques/deploy-gate-coupling.md).

## What this subject does not own

The pipeline as a program — its plan, steps and checkpoints — belongs to
[pipeline-authoring](../pipeline-authoring/pipeline-authoring.md). What a delivery system may
make machines run, and where a publishing credential lives and for how long, is
[ci-execution-trust](../ci-execution-trust/ci-execution-trust.md) — this subject borrows
[secret-materialization-discipline@ci-execution-trust](../ci-execution-trust/techniques/secret-materialization-discipline.md)
whenever a deploy token appears. Serializing two deploys that would otherwise overlap is
[shared-resource-serialization@runner-fleet](../runner-fleet/techniques/shared-resource-serialization.md).
The artifact's own staging and its opt-in publish door belong to
[release-pipeline](../../build-and-release/release-pipeline/release-pipeline.md); watching a
deployment you do not own, and per-environment deployment history, are
[cicd-monitoring](../../../integration/cicd-monitoring/cicd-monitoring.md). Running the gate's
own commands before authoring a change is
[pre-authorship-verification@machine-paced-delivery](../machine-paced-delivery/techniques/pre-authorship-verification.md);
this subject turns that from a discipline into a topology's load-bearing precondition. What is
here is the contract with the deployment target itself: where the build runs, what the
environments are, and how a push becomes production without anyone watching it happen.

## The techniques

- [platform-build-parity](./techniques/platform-build-parity.md) — the host's builder fed the
  same command, runtime and flags from one declared source.
- [environment-promotion](./techniques/environment-promotion.md) — a preview per change,
  production as promotion of an existing build, rollback as re-pointing.
- [direct-push-delivery](./techniques/direct-push-delivery.md) — single-owner direct push with
  real preconditions: one-command gate, push-time enforcement, loud escape hatch, red-main as
  outage.
- [deployment-config-as-code](./techniques/deployment-config-as-code.md) — declared platform
  configuration, and a committed manifest for what cannot be declared.
- [deploy-gate-coupling](./techniques/deploy-gate-coupling.md) — the deploy waits for the
  verdict, or the gate moves ahead of the push; never the silent race.

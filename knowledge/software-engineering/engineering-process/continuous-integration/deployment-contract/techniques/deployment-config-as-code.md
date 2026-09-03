---
layer: technique
type: technique
subject: deployment-contract
technique: deployment-config-as-code
status: forged
stage: solo
laws: [silent-state-is-ungoverned, one-authority-per-vocabulary]
shared_with: []
use_when: [an environment setting exists only in a provider dashboard, re-creating a deployment on a fresh account or machine, a deploy behaves differently and no diff explains it, deciding where a platform setting should live]
---

# Deployment configuration as code

Everything the hosting platform knows about your project it learned one of two ways: it read a
file in the repository, or somebody clicked. This technique's claim is that the first category
should be as large as the platform allows, and the second category — which can never be empty —
must be *inventoried* in the repository even though it cannot be *expressed* there.

## Why clicked state is the enemy

A dashboard setting has no diff, no history, no reviewer, no backup, and no presence in the
repository that a reader could consult. When a deploy behaves differently and the code did not
change, clicked state is where the explanation lives — which means the explanation is
invisible precisely when it is needed. Per
[silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned), state that
nothing watches is state nothing governs: it drifts when a platform migrates plans, resets
when a project is re-linked, and vanishes when an account is rebuilt. The single-owner case
makes this worse, not better — there is no second person to remember what was clicked.

## Declare everything the platform can read

Hosting platforms accept a configuration file in the repository for most of what matters: the
build command (pointing at the project's own task, per
[platform-build-parity](./platform-build-parity.md)), install overrides, routing and
rewrites, scheduled invocations, function-level limits, output directories. Every one of these
that lives in the file is reviewed, versioned, and travels with a fork or a re-setup for free.

The discipline has one subtlety: the platform file must not become a second authority for
things that already have a home. It *points* at the build task, it does not restate the build;
it references the runtime pin, it does not duplicate it — per
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary). A platform
file that restates three other files' contents is three future disagreements.

## Declared is not the same as inherited

Committing the configuration makes it reviewable; it does not make it *true*. Several
serving and platform configuration languages compose nested blocks by **replacement rather
than merge**: a child block that declares one entry of a directive family discards the
parent's entire set for that family instead of adding to it. The reviewed diff then reads
as an addition and behaves as a deletion, and the family this bites hardest is response
headers — a block added to set one thing silently drops every protective header the outer
block established, for exactly the paths that block matches.

Nothing announces it. The configuration parses, the service starts, the paths serve, and
the loss is visible only to whoever thinks to request one of those paths and read the
response headers. Per
[silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned), inheritance
the reviewer assumed and the parser does not implement is ungoverned state wearing a
committed file's credibility.

Two habits close it: **know the composition rule of every configuration language before
relying on inheritance in it**, and where the rule is replacement, have each block restate
the full set it needs, with a comment at the site saying why the repetition is not
redundancy — otherwise the next reader deduplicates it back into the bug. Where the set
matters enough, assert it: one request per block shape, checking the headers came back.

## Inventory everything the platform cannot read

Some state is genuinely dashboard-or-CLI-only: secret **values**, the linkage between this
repository and the platform's project identity, plan-level toggles, custom domains,
integration installations. The repository cannot hold these — secrets must never be committed
— but it can and must hold their **inventory**: a committed deployment manifest that names
each setting, its location, its purpose, and how to re-create it.

For environment variables the manifest names *names*, never values: which variables exist,
which environments each applies to (preview versus production, build-time versus runtime),
which are secret, and what breaks without each one. An example-file with placeholder values is
the conventional carrier and doubles as local-setup documentation. For project linkage, the
manifest records the identifiers needed to re-link non-interactively, which is also exactly
what an automated deploy from a pipeline needs — the identifiers are not secrets; the token
that acts on them is, and lives under
[secret-materialization-discipline@ci-execution-trust](../../ci-execution-trust/techniques/secret-materialization-discipline.md).

## The re-setup test

The manifest is complete when this holds: **a fresh machine, a fresh platform account, and the
repository are sufficient to reach a working production deployment**, with every manual step
named in order and nothing discovered by archaeology. This is the deployment equivalent of a
restore-tested backup, and like backups it is only believed after it has been rehearsed once.
Run the rehearsal when the manifest is first written; re-run it when the platform materially
changes its model. The rehearsal's byproduct is the deployment runbook — which is not a
separate document to maintain but the manifest read in order.

## Decision rules

- Anything the platform can read from a repository file lives in a repository file; the
  dashboard is set only where the platform offers no declared alternative.
- The platform file points at existing authorities (build task, runtime pin); it never
  restates them.
- Where a configuration language composes nested blocks by replacement, every block restates
  the directive set it needs and says at the site why; inheritance is relied on only where
  the language's composition rule has been read.
- Dashboard-only state is inventoried in a committed manifest: setting, location, purpose,
  re-creation steps. Variable names and scopes always; values never.
- Project-linkage identifiers are recorded for non-interactive re-linking; the credential that
  uses them is materialized late and scoped, never stored in the repository.
- The manifest is proven by the re-setup test once, and re-proven when the platform's model
  changes; until rehearsed it is a hypothesis, not a runbook.

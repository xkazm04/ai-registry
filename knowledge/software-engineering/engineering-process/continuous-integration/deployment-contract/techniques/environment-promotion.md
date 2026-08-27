---
layer: technique
type: technique
subject: deployment-contract
technique: environment-promotion
status: forged
stage: solo
laws: [derivation-names-recomputation, verdict-survives-boundary]
shared_with: []
use_when: [deciding how a change reaches production, a preview environment exists but nobody looks at it, rolling back a bad deploy, production was rebuilt from the same commit and behaved differently]
---

# Environment promotion

Environments form a ladder — ephemeral preview, production, sometimes a named staging rung
between — and a change climbs it. The technique's claim is that the climb should move a
**build**, not a commit: production receives the same bytes the preview proved, by promotion,
and never by building again and assuming equivalence.

## The preview is a free integration test; collect it

A platform that builds every push gives each change an addressable, running environment with
real routing, real server behavior, and (deliberately scoped) real configuration. For a single
owner this is the review that replaces a reviewer: the preview is where "it built" becomes "it
works when visited."

What keeps previews from becoming noise is a minimal proof obligation. Before its build is
eligible for production, a preview must have survived *something* — a human look at the
changed surface, a scripted probe of the golden path against the preview's address, or at
minimum the platform's own build-and-boot succeeding. The obligation scales with the change;
the point is that it is named, so "the preview passed" is a claim with content. A preview
proves most when its configuration matches production in shape — same variable names, scoped
values — because a preview green against a different shape is a verdict about a different
system, and per
[verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary) that verdict does
not travel.

## Promotion, not rebuild

A second build from the same commit is a recomputation, and per
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation) a
recomputation either names itself as one — accepting that dependency resolution, platform
builder version, and time-of-build inputs may have moved — or is avoided. Promotion avoids it:
the platform re-points production at the already-built, already-proven deployment. The build
that was verified is the build that serves.

Where a platform's default is "push to the default branch rebuilds and ships," promotion
discipline still holds in a weaker form worth having: the production build must succeed from
the same declared inputs as the preview's (see
[platform-build-parity](./platform-build-parity.md)), and any drift between preview build and
production build is treated as an incident, not weather.

## Rollback is re-pointing

The previous production build still exists on the platform. Rolling back is promoting it
again — seconds, no build, no new code. Reverting the commit and waiting for a fresh build
adds a full build cycle to an outage and ships an artifact nobody has run. The order is:
re-point production to the last known-good build first, then fix forward on the default branch
at leisure.

The precondition that makes this true is schema compatibility: a rollback across a database
migration is only a rollback if the previous build runs against the migrated schema. That is
the standing argument for backward-compatible migrations held for at least one release, and it
is the one input that can convert "roll back" into "fix forward under pressure." Know which
situation you are in *before* the incident: if the last deploy carried a destructive
migration, rollback was never on the table and the runbook should say so.

## Environments are named, few, and asymmetric

Two rungs — preview and production — are enough for most single-owner systems; add a third
only when something real (a paying integration, a demo audience) needs a stable non-production
address. Each rung is named, has a declared configuration surface, and differs from production
only in ways that are listed. The asymmetry that matters: previews may hold weaker secrets,
fake capacity, or scoped data, but they must not hold *different wiring* — a preview that
stubs the database out entirely proves layout, not behavior.

## Decision rules

- Every change gets a preview; every preview carries a named proof obligation before its build
  may promote, scaled to the change.
- Production receives an existing proven build by promotion wherever the platform supports it;
  a rebuild-on-push default is compensated by strict input parity and drift-as-incident.
- Roll back by re-pointing to the last known-good build; revert commits afterwards, never as
  the outage response.
- Keep migrations backward-compatible for one release so rollback stays possible; when a
  deploy carries a destructive migration, record that rollback is off the table for it.
- Keep the environment ladder short, named, and different from production only in listed ways.

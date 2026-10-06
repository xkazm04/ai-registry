---
layer: application
type: application
subject: conditional-service-composition
technique: requirement-closure-before-selection
stack: docker-compose
status: forged
verified_on: 2026-10-06
verified_against: docker-compose@2.40.3
applied: experiment
ab_verdict: better
---

# Requirement closure before selection — three ways to say "the dashboard needs the database"

*Verified against `tracklight` at `c2546bd` (service definitions read with `git show`, the
working tree untouched), resolved with the locally installed `docker compose` CLI plugin,
v2.40.3-desktop.1. Specification and documentation quotes accessed 2026-10-06.*

The [conjunction-activated-fragments application](./docker-compose--conjunction-activated-fragments.md)
ended on a gap: a composite profile `postgres+grafana` was refused by Compose unless the
bare `postgres` profile was requested too, because grafana's `depends_on: [postgres]` is a
hard reference the fragment's identifier never named. This application measures the
three designs that gap leaves open, and is the evidence behind
[requirement-closure-before-selection](../techniques/requirement-closure-before-selection.md).

## The seam

`tracklight` ships two hand-maintained presets
(`deploy/compose/docker-compose.yml`: `api` alone; `deploy/compose/docker-compose.postgres.yml`:
`postgres` + `api` + `grafana`). Split into fragments, the real definitions give four
documents:

- `api.yml` — the base `api` service, on its local SQLite store.
- `postgres.yml` — the `postgres` service with its healthcheck.
- `api.postgres.yml` — an **integration**: `api`'s `LIGHTTRACK_DATABASE_URL` and its
  `depends_on: postgres (service_healthy)`. It belongs to neither service.
- `grafana.yml` — `grafana`, which `depends_on: [postgres]` and whose provisioned
  datasource (`dashboards/grafana/provisioning/datasources/postgres.yml:9`) hardcodes
  `url: postgres:5432`. That is a **requirement**: grafana has no useful run without it.

`api.yml` had its `build:` replaced by the image name so `config` resolves without the
build context. Nothing here proves the containers run; it proves what the resolver is
handed and what it answers.

## The harness

A short assembler (subset selection, arity-then-code-point order, optionally a
transitive requirement closure over request-kind handles) hands the ordered fragments to
`docker compose -f ... config --format json` and records the services resolved, whether
`api` carries `LIGHTTRACK_DATABASE_URL`, and the engine's error. Every one of the eight
subsets of `{api, postgres, grafana}` was requested under three arms:

- **A1 — requirement as condition**: grafana's fragment named `grafana.postgres.yml`, so it
  only selects when both handles are requested.
- **A2 — requirement left to the engine**: `grafana.yml` as a singleton; no closure.
- **B — closure before selection**: `grafana.yml` as a singleton, and a handle vocabulary
  declaring `grafana requires postgres`; the active set is closed before selection.

## What it said

| request | A1 | A2 | B |
|---|---|---|---|
| (none), `api`, `postgres`, `api,postgres`, `postgres,grafana`, `api,postgres,grafana` | identical across all three arms | identical | identical |
| `grafana` | exit 0, **services: none** | `service "grafana" depends on undefined service "postgres"` | grafana, postgres |
| `api,grafana` | exit 0, **services: api** | same error | api, grafana, postgres — and `api` on Postgres |

- **A1 silently dropped a requested service on 2 of 8 requests.** Exit clean, no warning.
  The operator asked for grafana and got a topology without it.
- **A2 refused the same 2 requests loudly.** Better than A1, and still not a topology.
- **B served all 8.** On `api,grafana` the closure added `postgres`, and the integration
  `api.postgres.yml` then activated, so `api` was resolved onto the database grafana reads.
  That is the right outcome for this topology — leaving `api` on SQLite would give a
  dashboard over an empty database — but nobody typed `postgres`, which is why the
  technique has the dump print implied handles separately.

## The optional-dependency door

Compose's long-form `depends_on` accepts `required: false` (spec: "When set to `false`
Compose only warns you when the dependency service isn't started or available", added in
v2.20.0). It is the obvious way to make A2's refusal go away, so it was measured both ways:

- **Dependency absent from the model** — the fragment design, `postgres.yml` not
  selected: still refused, `depends on undefined service "postgres"`, exit 1.
- **Dependency defined but excluded by profile** — one file, `postgres` under
  `profiles: [postgres]`, `grafana` under `profiles: [grafana]`, request
  `--profile grafana`: `config --services` printed `grafana` alone, exit 0, and
  `up --dry-run` created the grafana container with no warning in its output. Without
  `required: false` the same file is refused.

So in a single-file, profile-gated topology, `required: false` turns the refusal into
exactly the silent omission the technique forbids. Whether a real `up` prints the
documented warning was not observed — the dry run did not.

The Compose specification itself takes the refuse side on purpose
(`compose-spec/15-profiles.md`): "References to other services (by `links`, `extends` or
shared resource syntax `service:xxx`) do not automatically enable a component that would
otherwise have been ignored by active profiles. Instead Compose returns an error." The
profiles guide states the operator's three exits: dependencies gated behind a profile must
be "In the same profile", "Started separately", or "Not assigned to any profile so are
always enabled". Explicitly targeting a service activates *its* profile, not its
dependencies' — closure is not something Compose does for you.

## Verdict

**better.** Target — every requested service present, no refusals — moved from 2 silent
drops (A1) or 2 refusals (A2) to 0 and 0 (B). Floor — the six requests the baseline arms
already served — held: B resolved the same services and the same `api` wiring as
both baseline arms on all six.

## What this realization cannot do or prove

- It is resolution-time evidence through the real resolver, on a scratch copy of real
  definitions — not a committed change and not a running stack.
- `code` mode was not reached: `tracklight`'s working tree carries another session's
  uncommitted files and its `main` is 85 ahead / 11 behind `origin/main`, so collapsing its
  presets into fragments was left to the return condition rather than risked.
- Three services and one requirement is the smallest topology that shows the effect; a
  transitive chain (a requirement of a requirement) was not exercised by this tree.

**Return condition**: when `tracklight`'s tree is clean and caught up, replace the two
presets with the four fragments above and a declared `grafana requires postgres`, and keep
the A1 shape out of it — `grafana` must be requestable alone.

---
layer: application
type: application
subject: conditional-service-composition
technique: conjunction-activated-fragments
stack: docker-compose
status: forged
verified_on: 2026-10-03
verified_against: docker-compose@2.40.3
applied: experiment
ab_verdict: better
---

# Conjunction-activated fragments — an optional Postgres+Grafana stack with no fragment mechanism

*Verified against the project tree at `7a56d615`, resolved with the locally installed
`docker compose` CLI plugin, v2.40.3 — the tree itself pins no Compose version; its CI
invokes `docker/setup-buildx-action` for image builds and never runs `docker compose`.*

The [conjunction-activated-fragments](../techniques/conjunction-activated-fragments.md)
technique had no application anywhere in the corpus. This reconciles it against a real,
small multi-service topology and measures the one claim worth measuring: does giving each
optional integration its own participation condition reach combinations the project's
current scheme cannot, without new files — and does it survive the technique's own
"conjunction, and only conjunction" rule once a fragment needs more than one handle.

## The seam

A local-observability service ships two complete, hand-maintained compose presets instead
of fragments:

- `deploy/compose/docker-compose.yml` — one service, `api`.
- `deploy/compose/docker-compose.postgres.yml` — `postgres` + `api` + `grafana`, bundled
  together as a single named preset.

The `api` service definition is duplicated across both files (build context, image, ports,
the same four environment keys) with nothing to catch drift between the copies, and the
combination space has exactly two reachable points: `{api}` and `{api, postgres, grafana}`.
`{api, postgres}` — Postgres without the dashboard — is not a file, and reaching it means
writing one. The base file's own trailing comment keeps two future integrations ("5a:
Postgres", "5f: Grafana") as commented-out YAML "kept here as a reference" — a correctness
condition living in a human remembering to uncomment and merge it, which is the technique's
opening "central manifest" failure (lines 21–31 of the technique) in miniature, one step
before it has even been written down as a manifest.

Grafana's half of the integration is a second fragment the two-file scheme hides: its
Postgres datasource is provisioned from
`dashboards/grafana/provisioning/datasources/postgres.yml:9`, which hardcodes
`url: postgres:5432`. That line belongs to neither service — it is reachable only because
the two are always bundled together — and nothing in the tree states that grafana's
participation *requires* postgres's.

## A and B

**A** — the tree as it stands: two named, hand-authored presets selected by `-f`. Three of
the four combinations of `{postgres, grafana}` are expressible; the fourth
(`{postgres}` without `grafana`) requires authoring a third file.

**B** — the technique applied: one compose file, each optional service carrying its own
participation condition as a Compose `profiles:` identifier, selected at `up` time by the
active set of requested profiles — the practical embodiment, in Compose's own primitives,
of "a fragment states its own condition, the assembler evaluates it against a set."

Code mode was not reachable: `tracklight`'s working tree carries another session's
uncommitted files and is 56 commits ahead / 11 behind `origin/main`, so a real edit to its
compose files was deferred rather than risked. The experiment instead ran the project's own
real service definitions, copied read-only into a scratch file, through the real `docker
compose config` resolver — a harness that does not change the project's tree — to observe
fragment selection under both schemes.

## What it said

Round one: wrap each optional service in its own single-handle profile (`postgres` →
`profiles: ["postgres"]`, `grafana` → `profiles: ["grafana"]`), mirroring the two services
exactly as the technique's "give the fragment an identifier" rule suggests at first read.

```
--profile postgres                    -> api, postgres                  (NEW: unreachable under A)
--profile grafana                     -> ERROR: "grafana" depends on undefined service "postgres"
--profile postgres --profile grafana  -> api, postgres, grafana         (matches A's full preset)
```

The target moved on the first line — `{api, postgres}` is reached with zero new files,
exactly the claimed benefit. The second line broke, and not quietly: Compose's own
dependency check caught it. The reason is the technique's own rule, violated by the naive
port — grafana's *real* condition is not "the `grafana` handle is active", it is
"`grafana` **and** `postgres`", and a list of per-service profiles is Compose's
disjunction, not the technique's conjunction (the technique's "Why conjunction, and only
conjunction" section names exactly this: a genuine multi-handle requirement needs a
*composite identifier*, not a second list entry).

Round two applied that rule correctly — one composite profile tag, `postgres+grafana`, on
the service that needs both handles — and still failed on the under-specified request:

```
--profile postgres+grafana                      -> ERROR: "grafana" depends on undefined service "postgres"
--profile postgres --profile postgres+grafana   -> api, postgres, grafana   (matches A's full preset, now reached by composing two independent handles rather than one named preset)
--profile postgres (alone)                      -> api, postgres            (still the new combination)
```

The composite identifier is necessary but not sufficient here: Compose's `depends_on`
is a second, implicit activation requirement the fragment's own identifier does not carry
— requesting `postgres+grafana` does not also request the bare `postgres` service's own
profile, so the orchestrator refuses a request that *reads* as complete to an operator.
Only the active set `{postgres, postgres+grafana}` — the composite *and* its constituent
handle, both explicit — reproduces A's full preset exactly and reaches the new combination
cleanly.

## The structural fact

This is the technique's own "unreachable fragment" failure (lines 103–137), physically
reproduced by a careless but entirely plausible first attempt at applying the technique
rather than by a hypothetical. Twice: once as a straight compose-level error (the per-service
`profiles:` list, round one), and once more subtly after the composite-identifier rule was
followed correctly (round two) — because Compose's `depends_on` is an orchestrator-level
hard reference the fragment's own handle vocabulary never names. Nothing in this tree
declares "the grafana fragment's active set must be expanded to include postgres's own
handle"; an operator who reasons from the fragment's stated identifier (`postgres+grafana`)
reaches a request that looks sufficient and gets refused. The technique's own reachability
gate (lines 121–137) — "assert the resulting active set is one an operator could actually
request" — is written broadly enough to catch this, but the existing text's own worked
example (mutually exclusive handles) does not mention a dependent fragment needing its
dependency's *own* singleton handle independently requested. That gap cost two of the three
rounds in this experiment and would cost an operator exactly the same confusion, minus the
instrument that caught it here.

## Verdict

**better.** Target — new combinations reachable with zero new files — moved: `{api,
postgres}` is unreachable under A without authoring a file, and reachable under B with the
existing fragments once correctly expressed. Floor — no new failure surface on the
combination A already serves — held: the corrected active set (`{postgres,
postgres+grafana}`) reproduces A's full preset exactly (`api, postgres, grafana`), so
nothing that worked under A stopped working under B.

## What this realization cannot do or prove

- It is a resolution-time experiment against a scratch copy of the real service
  definitions, run through the real `docker compose config` instrument — not a committed
  change, and not a running stack. Nothing was built; `api`'s `build:` section was replaced
  with a placeholder image so `config` would resolve without the Dockerfile's context, so
  this proves fragment *selection*, not that the resulting containers function.
- `code` mode was available in principle (Compose profiles are a real, shippable mechanism)
  but was not reached: the tree carries another session's uncommitted files and is ahead of
  and behind `origin/main`, so landing this in the project itself is left as the return
  condition below rather than risked against foreign WIP.
- The separator chosen for the composite identifier (`+`) was picked for this experiment
  and was never checked against the technique's own rule that the separator be reserved and
  enforced where handles are declared (lines 79–84) — there is no handle vocabulary in this
  tree yet for it to be reserved in.
- The depends_on-expansion gap this experiment found is a real boundary case of the
  technique as written, not something this application run is positioned to fix — amending
  the technique itself is outside what an apply-only pass does; it is named here as the
  reason an operator, not just this experiment, would have been confused.

**Return condition**: when `tracklight`'s working tree is clean and caught up with
`origin/main`, this is a `code`-mode candidate — collapse the two presets into one file
using the composite-profile scheme measured above, with the postgres datasource's implicit
dependency on the `postgres` handle made explicit (either by a build-time check that
`postgres+grafana` auto-requests `postgres`, or a documented rule that requesting a
composite handle also requires its constituents).

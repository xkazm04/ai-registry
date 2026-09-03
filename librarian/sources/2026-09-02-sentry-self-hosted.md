---
source: github:getsentry/self-hosted
kind: repository - vendor repository, packaging flavour (a company's compose-and-install distribution of its own hosted product)
url: https://github.com/getsentry/self-hosted
title: "getsentry/self-hosted - Sentry, feature-complete and packaged up for low-volume deployments"
author: getsentry (self-hosted maintainers)
commit: c1199830027809d54c8ff69c3ca4e620be0bce1f
words: 308 landing / ~10,966 in-tree markdown (CHANGELOG 8,900 of it; CONTRIBUTING, optional-modifications, workstation) plus 2,242 lines of installer shell, 1,727 lines of tests, a 781-line compose file and a 250-line composite CI action
extracted: 16
accepted: 4
declined: 0
leads: 2
already_covered: 4
untriaged: 6
applied: 3
shipped: 0
dispatched: 0
run_id: intake-sentry-selfhosted
siblings: 0 at claim, 1 by landing (sherpa-onnx, in voice-io - no overlap)
rescan_when: "the 26.9.0 changelog section lands (monthly release, the 15th); or the file-healthcheck compose anchor changes shape; or a consumer runtime's docs state whether the heartbeat file is written on idle iterations (would settle the idle rule in the probe-design amendment); or 2026-11-01"
---

# getsentry/self-hosted - an installer read at its step scripts, its tests and its compose anchors

## Class, and the yield it predicted

**Vendor repository**, packaging flavour: the engine is a set of images
built elsewhere; this repository is the wiring, the installer, the config
templates and the tests for those. The landing page is 308 words and the
README is five lines, so the class's rule (the README is the least reliable
surface) was trivially true; there is no `docs/` at all. The dense surfaces
were, in order: the install step scripts (each one a paid-for failure mode
with its issue number in a comment), the compose file's YAML anchors, the
unit tests (each named for the script it guards, several asserting that
garbage survives), and the composite CI action. The CHANGELOG is 8,900
words of one-line PR titles - the declared focus (sweep changelog fragments
first) applied, and it produced one lead and no landing: on this repo the
changelog is an index into PRs, not fragments written to stand alone. The
scripts are where the fragments would have been.

Expected yield, said before triage: 2-4, mostly amendments. Landed 4
amendments, 0 techniques. Right on class.

## Declared foci, and what they did

- **Re-scan conditions at Phase 1**: two ledger rows carry one; neither
  fired (both dated later than today). Said out loud, no run opened.
- **Lead return conditions in the last ten notes**: read; none fired.
- **Changelog fragments before operating docs**: applied; see above - the
  fragment sweep was cheap (one grep) and the yield was in the scripts.
- **Calibrate before the verdict**: applied to the cooldown experiment and
  **it changed the count** - 4 fast supersessions became 1 once grouped
  proposals the bot rebuilds were recognised as a different mechanism. The
  calibration was reading the rows the classifier returned, not a separate
  case; the known-merged and single-proposal checks changed nothing. Third
  run of three the focus's own check allows: the step has now changed a
  verdict once (2026-09-01 openwiki) and a count once (here). Keep it.

## Accepted (4 amendments, 3 applied)

### 1 - The consuming probe (health-checks / probe-design) - applied, simulation, better

Anchor: the compose file's `x-file-healthcheck` anchor - the check *deletes*
`/tmp/health.txt` and fails when there was nothing to delete; every consumer
service passes `--health-check-file` to its runtime; file-check start
period 600s against 10s for servers; interval 60s x 3 retries against a
300s max-poll-interval flag. Strip test: a target-minted token consumed by
the probe is a mechanism, not a product. Prior art read in full:
`probe-design` (side-effect-free with one exception; proxy table's
"process running" row), `liveness-and-heartbeats` (self-reported pulses
ranked weakest, "heartbeats from a corpse"), `loop-health-telemetry`
(expectation check against a declared cadence), `loop-supervision`
(heartbeat claim). None had the consuming direction, and the first two
each hold half the reason it works (no cadence to drift; honest only when
the work loop writes it). Corroboration: training-data convergence on the
consumer runtime's behaviour (the file is touched per poll iteration, idle
included) - recorded as the rescan condition, not asserted as fact in the
technique beyond "idle iterations must write it too". Applied against a
fleet worker whose only pulse is a timer-driven lease renewal, with the
opposite coupling stated in its own comment; the tree has ownership and no
progress, by structure. Three cases from the tree; verdict better; filed as
the project's next change.

### 2 - Configuration the user owns (packaging / installer-authoring) - applied, experiment, not-better

Anchor: `install/migrate-pgbouncer.sh` (exact-block match, consent prompt
with the flag printed, "I'm assuming you know what you're doing" on
custom), `install/check-memcached-backend.sh` (same prompt, but declining
exits 1 and an unreadable prompt exits naming the flag),
`install/_lib.sh::ensure_file_from_example` (`cp -n`) and
`_unit-test/migrate-pgbouncer-test.sh` enumerating all three states with
the custom case asserting no modification. Prior art:
`installer-authoring` has five transitions, user data off the uninstall
list and unattended mode, and no stage for "the upgrade must change a value
in a file the operator owns". `idempotent-steps` has the three-state guard
for system-owned state (unknown halts) - the discriminator (who owns the
state decides skip-and-report vs halt) is stated on the installer side.
Applied against the registry's own link script, which rewrites a marked
block in project ignore files: 7 of 8 checkouts, 0 operator lines inside
markers, 3 stale self-written comments that a naive foreign-line check
would misreport. **Not better** on that seam because the block is
machine-owned; the closing paragraph of the amendment now says the rule is
for values outside such regions. The seam the rule fits (the manifest's
skill declaration on a rename) is named with its return condition.

### 3 - Same code means same inputs (test-harness / flake-lifecycle) - unapplied

Anchor: `test.yml` runs every six hours on weekdays against `nightly`
image tags; `action.yaml` reports failures to an error tracker only on the
default branch "to detect flakey tests, as it's expected that people have
failing tests on their PRs"; `check-latest-commit.sh` refuses to install
from a stale checkout of the floating branch. Strip: a scheduled suite
whose inputs float measures the world, not the test. Prior art:
`flake-lifecycle` says "same-code is the load-bearing qualifier" and that
cross-tree comparisons measure churn - and did not say what "same code"
means when inputs move without a commit; `scheduled-deep-analysis` has
clock-triggered risk for advisories only; `suite-partitioning` has the
scheduled tier without the input question. Corroboration: two fleet trees
pin their toolchain for the exact stated reason ("a certification judged by
a floating toolchain would attribute a compiler's change to the product"),
which is the amendment's discriminator reached independently. **No fleet
project has a scheduled lane over floating inputs** - both scheduled Rust
lanes pin deliberately, the registry's own workflows have no schedule, and
the two Node scheduled jobs are advisory scans. Unapplied; return when a
project grows a lane that tracks a moving upstream by design. The negative
structural fact (the fleet pins, and says why) is recorded in the
subject note.

### 4 - Release age is a tier input (supply-chain / update-automation-review) - applied, experiment, unmeasurable

Anchor: `.github/dependabot.yml` - `cooldown: default-days: 3` and an
ignore list holding every stateful component's next major (`postgres
>=15`, `valkey >=9`, `kafka >=7.7`, ...) whose lifting condition lives in
CONTRIBUTING ("we only upgrade a major version when SaaS does"). Strip:
a minimum release age and an operated-version ceiling are policies, not
products. Prior art: `update-automation-review` tiers by version size with
no age axis; `dependency-policy-gates` requires exceptions to carry a
review-by date - the source's ignores carry none, and a fleet tree
(politicas) carries one that expires on a named event, so the amendment
states that an event is an acceptable expiry when named in the file.
Corroboration: 1 fetch (the bot's options reference - cooldown is
version-updates only, security exempt by construction) plus training-data
convergence on minimum-release-age options across package managers after
the 2025 registry compromises. The one fetch of three spent this run.
Applied as an experiment over 67 bot proposals in four repos: 8
superseded, 4 within three days, **1 real** after calibration. Verdict
unmeasurable for the supply-chain claim; instrument named (advisory feed
joined to release timestamps).

## Already covered (4, verified by reading the files)

- **CI volume cache keyed by a migration-set hash** (`action.yaml`,
  `scripts/snuba_migrations_hash.py`) - `fixture-economics` § "the template
  names its rebuild" already says fingerprint the migration list and the
  builder. Refinement left untriaged (#5 below).
- **Installer error report with local fingerprint dedupe, consent prompt,
  never on interrupt** (`install/error-handling.sh`) - `crash-capture`
  holds crash-loop detection, aggregation keys, bounded breadcrumbs and
  sanitisation. The interrupt clause is untriaged (#6).
- **One-shot data migration with a marker in the volume, a pre-migration
  copy, and shell tracing disabled around the secret**
  (`install/migrate-seaweedfs-kek.sh`) - `idempotent-steps` (ledger in the
  data), `pre-migration-snapshots`. The xtrace-off habit is a practice-lane
  nugget, not a technique.
- **Proxy env forced empty inside health checks because the busybox fetcher
  ignores no_proxy; "avoid small intervals, the runtime burns CPU"**
  (compose anchors, issues 1537 and 1000) - `platform-quirk-absorption`,
  and the health-checks golden path's "checking must not become the load".

## Leads (2, return conditions attached)

- **Drain before upgrade because persisted task signatures change across
  versions** (`install/_lib.sh`: stop timeout raised from 10s to 60s "as
  task signatures may change across versions"). Converges with the
  matrix-rust-sdk note's untriaged #13 (a serialization-snapshot rule for
  persisted types) from the other side: this is the operational
  consequence of not having one. **Return condition:** a second source
  states the rule for persisted queue payloads, or a fleet project persists
  task payloads across a version boundary - then the two become one
  technique in migrations or delivery-guarantees.
- **Minimize-downtime upgrade keeps the ingest edge alive and buffers
  behind it, at the price of no automatic cleanup on error**
  (`install/turn-things-off.sh`, `install/wrap-up.sh`, `parse-cli.sh`'s
  "might leave your installation in a partially upgraded state"). The
  strip test leaves "keep the accepting edge up and let it spool; the
  price is no rollback". No fleet project has an ingest edge that spools.
  **Return condition:** one does, or a deployment-contract or
  environment-promotion source states the edge-first upgrade order.

## Untriaged (6) - extracted, reached the table, never picked; nobody verified these

| # | Candidate | Anchor | Nearest subject | Own read |
| --- | --- | --- | --- | --- |
| 5 | Prefix-key cache fallback restores the nearest older template and migrates it forward - the fixture is built by the upgrade road when the prefix hits and the fresh road when nothing hits, so CI exercises both roads by accident | `action.yaml` restore-keys chain; `SKIP_*_MIGRATIONS` only on exact hit | test-harness/fixture-economics, migrations "two roads" | partial |
| 6 | An operator interrupt is not a crash: the trap sends nothing on INT | `install/error-handling.sh` cleanup, `"$1" != "INT"` | error-handling/crash-capture | partial |
| 7 | Preflight measures resources from the runtime's vantage (a container reports its own CPU and RAM, not the host's); the instruction-set check is skipped under one hypervisor because cpuinfo lies there, i.e. could-not-determine collapsed to healthy, justified by a loud first-use failure | `install/check-minimum-requirements.sh`, issue 340 | health-checks/probe-design, three-state-outcomes | partial (the collapse is the interesting half) |
| 8 | A floating-input branch may only be installed from its head - every older commit was paired with inputs that no longer exist | `install/check-latest-commit.sh` | release-pipeline, deployment-contract | partial; pairs with accepted #3 |
| 11 | Distribution release scheduled one hour after its components', on the 15th, calver; default branch reset to floating tags after release; pins exist only at tags | `.craft.yml`, `release.yml`, `post-release.sh`, `reset.sh` comment | release-pipeline/pipeline-staging | partial |
| 12 | Revert as a one-label action with attribution and a failure comment on the PR | `fast-revert.yml` | delivery-analytics/revert-linkage | likely catch |
| 13 | Shell-script test sandbox: shallow-clone the working copy, symlink dirty files over it, keep it up under DEBUG | `_unit-test/_test_setup.sh` | test-harness/isolation-lanes; practices lane | likely catch, reusable engineering |
| 14 | Customisations as patch files against shipped defaults - an overlay whose drift gate is free, because a patch that no longer applies fails loudly, where a merged overlay drifts silently | `optional-modifications/` | packaging/variant-config-parity | partial |

(Numbering follows the extraction order; 1-4 accepted, 9-10 leads, 15-16
covered.)

## What the tree did better than the corpus, in one line each

- Every step script carries the issue number of the failure it prevents.
- Every unit test that guards a "never overwrite" rule asserts that garbage
  survives.
- The compose anchors comment their CPU cost with the upstream issue.
- The dependency bot config is the only file in the repo that carries a
  policy the contributing guide explains two directories away - the one
  place the tree is worse than the fleet's own politicas config.

## Method notes

- 1 of 3 fetches spent (the bot's options reference), seventeenth run in
  which corroboration was mostly corpus-internal and real code.
- The fleet contradicted-and-completed the source rather than confirming
  it: the lease-vs-progress split (accepted #1) came from tracklight's
  comment, not from the source; the machine-owned-region boundary
  (accepted #2) came from the not-better result against the registry's own
  script.
- `index.json` and `catalog.json` regenerated under the lock and left
  uncommitted: a sibling's voice-io technique is in the working tree and
  not in HEAD.

---
layer: application
type: application
subject: web-scraping
technique: soak-mode-and-verdict-replay
stack: rust
verified_on: 2026-08-24
verified_against: rust@1.96
---

# Rust application: shipping the resilience detector un-armed (pumper)

`pumper` is a local-first scraping service — one axum binary, a SQLite job
queue, ~35 workspace crates, one per scraping use case. Its `resilience`
subsystem judges every scrape run for silent extraction rot, and the rollout
discipline around it is the harvestable part. Citations are against the repo
root at `ef21429`, toolchain pinned `1.96.1` (`rust-toolchain.toml`).

## The split, and the two accessors

`[resilience]` carries two switches and the docstring on the config type
(`crates/core/src/config.rs:379-396`) states why they are separate: `enabled =
false` is "a complete no-op", while `enforce = false` — "the shipping default"
— "computes and stores every verdict while gating nothing: no trust stamps, no
suppressed pushes, no downgraded syncs. That is the soak mode."

The technique's two-accessor shape is exactly what the store exposes.
`Resilience::state` (`crates/core/src/resilience/store.rs:705-718`) answers what
a source's state actually is; `Resilience::enforced_state` (`:723-729`) is "the
state that governs enforcement: always `Healthy` while `enforce` is off, so soak
mode cannot gate anything even by accident", short-circuiting on `enforcing()`
(`:691-693`) before it ever reads the row. `observe` (`:736-…`) is downstream of
neither flag but `enabled`: it sketches the run, computes drift, checks
invariants, evaluates, and writes the verdict regardless of `enforce`. Its
docstring also pins the ordering the technique's "evidence first" rule implies —
"call this **before** writing the batch… computing it afterwards would stamp
trust and infer removals from a verdict that did not exist yet."

## Soak's exit is named where the flag is defined

The same config docstring carries the exit criterion rather than leaving it to
folklore: enforcement "is meant to be turned on only after `source_runs` shows
the false-positive rate is acceptable on real data. On an unattended box a false
quarantine that silently stops a working pipeline is worse than a detection a
week late" (`config.rs:385-388`). That is the sentence the technique demands at
the point the flag is declared.

## The rollout gate is a replay, and it says so as doctrine

`crates/core/src/resilience/preview.rs:1-30` is the module docstring, and it is
the technique stated rather than merely implemented. The evidence "is already on
disk", because "soak mode is a no-op strictly **downstream**"; therefore "a
preview is a *replay of stored rows*, not a re-run of the detector". The
re-judging trap is named outright: "Re-judging today's history against today's
thresholds would answer a different question ('what would these rules say now')
and would be worthless as a rollout gate." Path-dependence gets its own line —
"`state_after` IS the would-be state. The ladder is not gated on `enforce`; only
its consequences are."

`replay` (`preview.rs:265-331`) is documented as pure — "nothing here re-judges
anything; every verdict, score and state is read off the row it was written to"
— and `preview_fleet` (`:348-397`) is "**read-only**: `list_sources` + one `runs`
read per source, and nothing else". The stored `reasons` array travels verbatim
into the output (`PreviewTransition::reasons`, `:88-91`: "every test that ran,
its value and its threshold. Passed through verbatim; nothing is recomputed"),
which is what makes the row sufficient to reconstruct the decision. Even the
decode of a stored verdict string refuses to round up: `verdict_of`
(`:333-345`) maps an unrecognised value to `Inconclusive` because "'we cannot
tell what this run said' must never be rounded up to 'it was fine'".

Read-only is asserted, not intended:
`crates/core/tests/enforcement_preview.rs:278-302`
(`a_preview_leaves_the_store_byte_identical`) dumps every health table *and* the
database file bytes on both sides of a preview and compares them.

The HTTP surface repeats the contract where a caller reads it
(`crates/server/src/routes/health.rs:239-256`): "Read-only replay of the stored
verdicts — it changes nothing, gates nothing, and re-judges nothing," followed
by a **Fidelity, not re-simulation** paragraph. The route's own `?runs=` clamp
(`preview_runs`, `:292-308`) is deliberately re-stated at the boundary rather
than inherited from the core function, "the promise being made *where it is
documented*".

## Attribution honesty

`TransitionCause` (`preview.rs:60-73`) has two variants, and the second is the
technique's rule verbatim: `Outside` marks a state change with no judged run
explaining it — an operator override via `POST /sources/{id}/state`, or the
deciding run having been pruned — because "crediting an unjudged run with a move
it did not make is exactly the kind of tidy lie a rollout gate must not tell".
`SourcePreview` also carries `unjudged_runs` (`:204-207`) — "counted here rather
than silently folded into the clean ones" — and `live_state` (`:219-224`),
surfaced "so the preview never quietly disagrees with `GET /sources`". The fleet
answer is names, not a percentage: `ready` plus `not_ready: Vec<NotReady>`, each
naming the source, its gates, and the transition that put it there (`:232-266`,
`preview_fleet` populating it at `:366-380`).

## The ladder

`next_state` (`crates/core/src/resilience/detect.rs:826-899`) is the ladder,
`healthy → suspect → degraded → quarantined → probation → healthy`. Every rule
the technique states is present and argued in a comment beside it: the first
rung is inert ("`suspect` deliberately changes nothing downstream, so it is cheap
to enter and one clean run leaves it"); descent is `trips_of_last3 >= 2` then
severity-or-three; recovery "steps back one rung rather than jumping to
healthy"; quarantine releases to `probation`, "which still stamps every write
`provisional`, so a premature release is visible in the data rather than
silent"; and a trip during probation "goes straight back to quarantine — no
intermediate rungs, because this source has already proven it can break".

`Recovery` (`:786-812`) carries the streak and the required length, and its doc
states the judged-runs-only rule — runs nobody judged "are not in this count: a
source must not be able to heal on evidence that was never looked at".
`consecutive_clean` (`:815-823`) uses `take_while`, so "three clean runs with a
break in the middle are not a recovery". Terminal quarantine is named as the
bug it replaced: "The old rule was 'terminal without an operator', which on an
unattended box means a source that broke at 03:00 and healed at 04:00 stays
quarantined… That is the single biggest reason `enforce = true` is not
adoptable" (`:869-878`). The transition table is pinned by tests at `:1625-1700`,
including `quarantine_releases_on_evidence_not_on_one_quiet_run`.

## Cohort adequacy and `unmonitored`

`CohortAdequacy` (`detect.rs:122-155`) is the three-valued honest state:
`Full`, `Shrunken` ("below the floor, but this source has cleared it before —
today's run shrank"), and `Chronic` ("structurally too small to be judged
statistically — it is **unmonitored**, and `GET /sources` says so instead of
showing it as healthy"). `cohort_adequacy` (`:157-171`) reads one fleet-wide
`min_cohort_docs` against the source's own baseline peak, and its doc states the
non-lowering rule: "a thin source does not become easier to trip by being
chronically thin, it becomes honestly labelled as unmonitored."

The baseline-poisoning consequence is closed at `detect.rs:337-359`: an
inadequate cohort returns `RunVerdict::BelowCohort`, which "neither moves the
state nor enters the baseline", with the regression it fixed written down —
"recording it as `ok` (what this did before) let a chronically thin source
assemble a baseline out of runs nobody had judged." The rollout gate carries it
through: `SourcePreview::monitored` (`:225-227`) and `FleetPreview::unmonitored`
(`:256-259`), whose doc makes the technique's point exactly — such sources "gate
nothing, so they do not block readiness — but a preview of a source nobody could
judge is weak evidence, so they are named rather than counted silently."

## Consequence enumeration — the shape is right, the check is not

`CONSEQUENCES` (`preview.rs:44-59`) is the declared inventory, each entry naming
its live call site (`core::app::AppContext::write_target`,
`…::sync_many_with_provenance`, `server::worker::suppress_unhealthy`,
`server::worker::dataset_search_docs`), and the docstring states the contract:
"if a fifth consumer ever gates on `enforced_state`, it belongs here too, and
`every_enforcement_consequence_is_previewed` fails until it is."

**Deviation.** That test (`preview.rs:532-552`) asserts `CONSEQUENCES` equals a
hand-copied `EXPECTED` literal sitting twelve lines below it, plus that every
name is reachable from some state. It fires when somebody edits the list — not
when a new consumer appears, which is the failure mode the docstring claims it
covers. The call graph is never consulted; `enforced_state` already has further
call sites in the apps layer (`crates/apps/extractor/src/lib.rs:691`,
`crates/apps/grants-common/src/lib.rs:231`,
`crates/apps/plugin/src/lib.rs:1533`,
`crates/apps/trades-common/src/lib.rs:1725`) which read the state to mirror the
routing rather than to add a consequence — but nothing mechanical distinguishes
those from a fifth consequence, and nothing would notice one. The technique's
requirement is a check over the consumers; this is a check over a copy of the
list.

## Deviation: unknown renders as `Healthy`

`Resilience::state` (`store.rs:698-718`) fails open — a store read error logs a
`tracing::warn!` and returns `SourceState::Healthy`. The reasoning is written
down and is good ("this sits on the write path of every app… the cost of failing
open is one unsuppressed run; the cost of failing closed is the whole fleet
stopping on a locked database"), and it is the right operational trade. It is
still a definite value standing in for an unknown one, with no state in the
vocabulary for "could not be read" — precisely the distinction the technique's
`unmonitored` rung makes for the *statistical* unknown but not for the
*infrastructural* one. A `Unknown` variant that gates nothing and reports itself
would preserve the trade and close the honesty gap.

## The house convention around it

Every gating or destructive subsystem in this service ships a read-only preview
sibling, registered together in `crates/server/src/routes/mod.rs`:
`extract_preview` (`:177`), `datasets_doctor` (`:213`), `retention_preview`
(`:216`), `enforcement_preview` (`:264`), `datahub_governance_preview` (`:270`).
The technique asks for one preview; the repo generalised it into a rule for the
whole surface, which is the transplantable part beyond this subsystem.

## Reconciliation summary

Confirmed, and in several places better argued than the draft: the observe /
enforce split with the no-op strictly downstream and two named accessors; the
exit criterion stated at the flag's definition; replay-not-re-judge as explicit
doctrine at both the module and the route; read-only asserted down to database
file bytes; unattributable transitions reported rather than credited; the full
hysteretic ladder with an inert first rung, earned stepwise recovery, a
provisional-stamping probation rung, and judged-runs-only counting; three-valued
cohort adequacy that never lowers the bar and never lets an unjudged run enter
the baseline. Upward lessons folded into the technique: the preview should
report `live_state` beside the replayed state so it cannot quietly disagree with
the source listing, and the read-only property is worth asserting at the storage
layer rather than reviewing for. Deviations: the consequence-enumeration check
compares the list to a copy of itself instead of to the call graph, so the one
failure mode a rollout gate cannot have is unguarded; and a failed health read
renders as `Healthy`, an infrastructural unknown wearing a definite value.

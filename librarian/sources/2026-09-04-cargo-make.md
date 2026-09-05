---
source: cargo-make
kind: practitioner build-tool repository (single maintainer)
url: https://github.com/sagiegurari/cargo-make
title: "cargo-make — task runner and build tool"
author: sagiegurari
words: 211 (landing page as ingested) / 21,395 (README, which is the manual) / 13,145 lines non-test source
commit: 95dcc545db8cf08af6fbec524e200e7c80b06027
extracted: 10
accepted: 6
declined: 0
leads: 0
already_covered: 0
untriaged: 4
dispatched: 0
applied: 5
shipped: 2
run_id: cargomake-0904
siblings: 2
---

# cargo-make — nine design decisions that scatter across five subjects, and therefore are not a forge job

An eight-year-old task runner with a 21,000-word README that *is* its manual. The
ingest returned **211 words** — the rendered landing page, the advertisement — and
exiting there would have been the README anti-pattern with a frontmatter on it. The
tree was cloned at `95dcc54` and swept in the Phase 2b order: the operating
documents (README and its site mirror, CHANGELOG), the instrument (the condition
evaluator, the version checkers), the measurement (none worth the name — this
project does not publish benchmarks), the types (`types.rs`, 2,467 lines, the real
data model), and the tests last.

## Class read, and the yield it predicted

Practitioner build-tool repository, single maintainer, mature. Predicted before
the triage table: **high on design decisions, zero on currency, zero news leads.**
That held exactly — nothing in this tree is news, and a run here that produced a
"currency signal" would have been the miss. The yield hid where the class says it
does: in the config schema and the execution engine, not in the prose.

Two live siblings on the board (`everywhere`, then `opik`), and `opik` held
`pipeline-authoring` and `untrusted-extension-host` — two of this run's nearest
neighbours. Rows 9 and 10 below were routed away from them rather than contested.

## Phase 2d routing count — both clauses, written before the decision

**Per system (NONE / no corpus model):** flow engine 1 · descriptor 3 ·
extension surface 2 · installer 0 · self-nesting observability 2.

**Cross-system `HOME IF NEW` clustering:** `settings` 2 · `observability-telemetry`
2 · `repo-manifest-standard` 1 · `self-healing` 1 · `agent-runtime-assembly` 2.
Largest cluster **2**.

The descriptor clears three, but its three do **not** share one home — one lands
in `repo-manifest-standard`, two in `settings` — so neither clause of the v2.2
trigger fires. **Routing decision: stay in intake, no forge handoff.** Nine
load-bearing decisions in a tree is not by itself a forge job; a forge job is
three that want the same home nobody owns.

## The design record

Grouped by system. `corpus:` is the subject whose golden path models the
decision's *forces*, or NONE with the nearest neighbour named.

### System A — the flow engine

**A1. Protect a flow by re-invoking the binary as a child process.**
*forces:* an on-error handler that lives in the failing process does not run for
the failures severe enough to need it — a hard abort, a signal, a non-yielding
wedge. *buys:* a handler whose reliability does not depend on how the failure
arrived. *rejects:* an in-process error hook, which the tree still offers per task.
*where:* `runner.rs:620` `run_protected_flow`, `proxy_task.rs:9` `create_proxy_task`.
*stage:* between "a flow was requested" and "the flow runs".
*corpus:* **NONE.** `self-healing/healer-death-as-promotion` treats the healer's
death as the given and prescribes writing the verdict before exiting; it never asks
whether the shared fate was a choice. → **landed as a technique.**

**A2. The plan is materialized whole and printable; conditions are evaluated
per-step at run time.** *forces:* a plan you can print is a plan you can review, but
a condition that depends on the environment cannot be evaluated before the steps
that set the environment have run. *buys:* an inspectable plan. *rejects:* condition
evaluation at plan time, which would make the printed plan a prediction rather than
an upper bound. *where:* `execution_plan.rs:455` `build`, `condition.rs:679`
`validate_condition_for_step`. *corpus:* partial — `work-execution/pipeline-dag`
pins and validates the graph at the door. → **untriaged.**

**A3. Workspace fan-out is compiled into a generated script that shells out per
member.** *where:* `execution_plan.rs:225` `create_workspace_task`. *corpus:*
partial — `pipeline-authoring/runtime-pipeline-generation` owns "the plan is
computed"; the twist here is generating a script that re-invokes the tool rather
than a plan the engine consumes. Home held by a live sibling. → **untriaged.**

### System B — the descriptor

**B1. The declared version is parsed before the schema.** *forces:* the reader
rejects unknown keys (correct for a single-reader config, where an ignored key is a
silent typo), and a rejecting reader cannot tell a typo from a document written for
a later version of itself. *buys:* "your tool is old" instead of "this key is
wrong". *rejects:* must-ignore-unknown, deliberately. *where:*
`descriptor/mod.rs:304` `check_makefile_min_version` — a raw `toml::Value` read that
returns `Ok(())` on its own parse failure and lets the typed parse speak.
*corpus:* **NONE.** `repo-manifest-standard` owns the multi-reader inverse and the
author-side evolution rule; nothing owns the reader-side ordering. → **landed as a
technique.**

**B2. Origin provenance is stamped into each merged entry.** *forces:* after the
merge nothing says which file an entry came from, and a relative path inside an
inherited entry must resolve against its own file. *buys:* a shared fragment that
works in every repository that adopts it. *rejects:* resolving everything against
the entry document. *where:* `descriptor/mod.rs:88` `add_file_location_info`.
*cost the tree records:* the provenance rides **inside** the task's own environment
map, so the merge must distinguish "declared nothing" from "declared only
provenance" with a literal *length-2-and-contains-exactly-these-two-keys* test — at
`descriptor/mod.rs:66` and again at `execution_plan.rs:100`. *corpus:* **NONE**
(`inherited-default-override` states the beside-the-values rule for a different
provenance question). → **merged into B3's technique.**

**B3. Each include declares its own path root.** *forces:* a fragment referencing
something beside itself, a repository-wide artifact, or a sibling package need three
different roots, and only the fragment knows which. *buys:* portable shared
fragments. *where:* `descriptor/mod.rs:262`, the `relative` enum
(`makefile|git|crate|workspace`). *departure:* an unrecognized value **warns and
defaults** rather than refusing — the hole the mechanism exists to close.
*corpus:* **NONE** (`cross-source-precedence-chain` covers the platform-declared
chain, not the author-declared graph). → **landed as a technique with B2.**

### System C — the extension surface

**C1. The extension point publishes a raw payload *and* ~15 pre-answered
predicates.** *forces:* the extension language cannot reasonably parse JSON to ask
"does this task have a condition?", but the host must not close the surface.
*buys:* the queries an extension actually makes, answered, with the raw object kept
as the escape hatch. *where:* `plugin/runner.rs:136` `setup_script_globals_for_task`
— `task.as_json` beside `task.has_condition`, `task.has_env`,
`task.has_install_instructions`, and a dozen more. *corpus:* **NONE**
(`agent-runtime-assembly/observer-and-mutator-surfaces` owns registration
contracts, not predicate projection). → **untriaged; home adjacent to a live
sibling's claim.**

**C2. An `@`-prefixed sentinel namespace separates built-in engines from anything
on PATH; the shebang is the fallback declaration channel.** *forces:* a runner name
is a free string that must be able to mean either "this executable" or "my own
built-in", with no collision possible. *where:* `scriptengine/mod.rs:92`
`get_internal_runner`. *detail worth keeping:* a shebang **with arguments** falls
out of the internal-engine path, because an internal engine cannot accept
interpreter arguments. *corpus:* NONE. → **untriaged.**

### System D — the installer

**D1. The installed-version check fails OPEN on every unknown.** *forces:* a
version gate whose false-red costs a network reinstall on every invocation is
removed by the team; one whose false-green costs "you run the binary you already
have" is affordable. *buys:* a check nobody disables. *where:*
`crate_version_check.rs:185` — no cargo home, unparseable registry file, unparseable
declared minimum all `warn!` and return `true`. Two-tier lookup: the package
manager's own ledger (`~/.cargo/.crates.toml`) first, a `--version` shell-out
second. *corpus:* partial — `quality-gates/gate-liveness` says folding
could-not-run into pass is the worst failure mode. → **landed as an amendment**,
because the tree makes the *same* repository fail **closed** on B1 and **open**
here, and the asymmetry is the discriminator.

### System E — observability of a self-nesting tool

**E1. The recursion counter is reused as the log prefix.** Carried in an
environment variable for control flow (`recursion_level.rs`), rendered as `[n]`
beside the component name on every record, blank at depth zero
(`logger.rs:136`). *corpus:* NONE. → **folded into A1's technique**, where it
belongs: it is the observability half of the same mechanism.

**E2. `error!` is `exit(1)`.** The logger's format closure terminates the process
on any error-level record, and panics instead under `cfg!(test)` so tests can catch
it (`logger.rs:163`). *corpus:* **NONE** —
`observability-telemetry/log-architecture` says levels are a contract and defines
`error` as "a failure a human should eventually know about", which this binding
makes unsayable. → **landed as an amendment.** This is the run's clearest case of
a source implementing a good idea badly: the good idea is one authority for "this
is fatal"; putting it in the logging façade empties the `error` level and overloads
`warn`, which is why this codebase warns on every unknown in D1.

## Triage table as presented

| # | Shape | Title | Prior art | My read | Outcome |
| --- | --- | --- | --- | --- | --- |
| 1 | technique | Fork the flow so the handler outlives it | self-healing | real gap | **landed** |
| 2 | technique | Parse the declared version before the schema | repo-manifest-standard | real gap | **landed** |
| 3 | technique | Each include declares its own path base | settings | real gap | **landed** (merged with 4) |
| 4 | technique | Provenance rides the merged entry | settings | real gap | **landed** (merged into 3) |
| 5 | amendment | A level bound to a side effect leaves the vocabulary | log-architecture | real gap | **landed** |
| 6 | amendment | A gate whose false-red costs work fails open | gate-liveness | real gap | **landed** |
| 7 | technique | The extension gets pre-answered predicates | agent-runtime-assembly | real gap | untriaged |
| 8 | technique | Reserve a sentinel namespace for built-in runners | agent-runtime-assembly | partial | untriaged |
| 9 | technique | The printed plan is an upper bound | pipeline-dag | partial | untriaged |
| 10 | technique | Fan out by generating a re-invocation script | pipeline-authoring (sibling-held) | partial | untriaged |

Rows 5 and 6 were promoted from `partial` by executing their promoting questions —
one file read each, per v2 — and both promoted. Row 5's question: *does
`log-architecture` say what `error` means?* It does, and the binding makes that
meaning unsayable. Row 6's question: *does `gate-liveness` distinguish reporting
could-not-run from routing it?* It does not; it fuses them in one sentence.

## Untriaged — extracted, never verified, nobody said no

These carry anchors so a later pass does not re-derive them. **No judgment was
formed on any of them**; they are not declines.

- **7 — predicate projection at an extension point.** `plugin/runner.rs:136`.
  The host precomputes ~15 booleans the extension would otherwise have to parse
  JSON to answer, and ships the JSON anyway. Home (`agent-runtime-assembly` or
  `untrusted-extension-host`) was held by a live sibling this run.
- **8 — `@`-sentinel runner namespace.** `scriptengine/mod.rs:92`. Includes the
  shebang-with-arguments fallback, which is the interesting half.
- **9 — the printed plan is an upper bound, not a prediction.**
  `execution_plan.rs:455` builds the whole step vector; `condition.rs:679` decides
  per step at run time. `--print-steps` therefore prints steps that may not run,
  and nothing marks which. `pipeline-dag` validates and pins at the door.
- **10 — fan-out by generating a script that re-invokes the tool.**
  `execution_plan.rs:225`. Home held by a live sibling.

Also noted and not extracted: the host prepends `exit_on_error true` to every
plugin script (forcing error semantics on the extension rather than trusting it),
and the time summary self-enables under CI — the measurement that is only useful in
retrospect turning itself on exactly where retrospect is all there is.

## Corroboration

**Zero of three fetches spent**, which is what this class predicts: a practitioner
codebase corroborates corpus-internally and against its own tree. All six landings
rest on the tree read in-run plus training-data convergence — supervisor/supervised
fate separation is converged across process supervisors; version-handshake-before-
content-negotiation is converged across wire protocols and manifests.

## What the run learned about its own method

The apply phase corrected the corpus twice, which is the loop working:

- The naive application of the version-gate technique to the registry's own loader
  was **wrong**, and the tree said so before the commit: returning early with a
  truthy object would have produced 191 spurious findings. The technique gained a
  paragraph it did not have.
- The fork technique was **rejected** at the fleet seam it looked designed for, on
  a disqualifier the first draft under-stated — live shared accounting, not merely
  large state. The technique gained that condition and a placement section.

# XL spec - `perf-regression-gating`

- **Run:** `in-aura-1001` (intake of a vendor's documentation site for an AI agent over a game engine, plus two
  engine documentation pages read verbatim in-run, plus a connected project's tree read by four workers).
- **Source that surfaced the gap:** the vendor's performance-profiling page and a grep over `game-production`
  (uncapped, case-insensitive) that found performance **only as an authoring-time budget** (polygon, shader) and
  a size-growth baseline - nothing owns performance as a **test stage**. The vendor page **originates** the
  subject and authorizes nothing in it: it is a thin alpha-feature page (three rules and a statement that its
  autonomous capture is experimental). Every technique is corroborated from the engine's own documentation read
  verbatim, from a connected tree, or from training-data convergence with the stated boundary.
- **Operator decision:** forge in this session (operator multi-select review, 2026-10-01).
- **Status:** EXECUTED 2026-10-01 (run `in-aura-1001`). Five techniques written as proposed. Overrides recorded by the
  worker and kept by the director: no sixth verdict technique (the five non-answer reasons are one paragraph in the
  golden path); memory and load time left out as siblings; a threshold derived from a measured spread may block at its
  published resolution. The premise that the connected project's capture stage was unmerged went stale mid-run (it
  landed while the worker drafted); the applications were rewritten against the merged tree.

## Why XL

Five design candidates share one home and none has one: how to bound a capture window, why a threshold needs a
noise floor, why one frame-time number hides which thread regressed, why a mean hides a hitch, and why a
baseline is bound to a build and a machine. They are one pipeline - capture, characterize noise, compare,
promote - and the corpus owns no stage of it. `research-map` on "performance profiling budget regression",
"frame time hitch percentile", "capture window baseline noise" returned only authoring-time and size neighbours.

## Placement (verified against the authority)

`knowledge/game-production/taxonomy.json` is the authority (`layout: "nested"`). Category `engine-integration`
(order 5) holds 7 subjects and no subcategories; `MAX_CHILD_DIRS` is 10, so one more fits.

- Resulting path: `knowledge/game-production/engine-integration/perf-regression-gating/`.
- Append the slug to that category's `subjects` array. Append, do not reorder.
- Verify link depth to `_laws.md` against a sibling subject in the same category, do not compute it.
- A sibling branch (`forge/racing-tv-games`) is unmerged and adds two top-level categories; it does not touch
  `engine-integration`, so this placement is unaffected.

## Proposed techniques (each must carry a decision rule)

1. `noise-floor-before-the-threshold` - run the unchanged build against itself (A/A) several times and take the
   spread BEFORE choosing any threshold. Rule: a regression gate fires on a delta measured against that spread,
   never on a bare difference; a result whose spread is larger than the effect it is asked to detect is
   **unverifiable**, not pass and not fail. State how many A/A pairs are enough and what the spread is measured
   on (a percentile, not a mean).
2. `bracketed-capture-window` - a measurement window is bounded by the scenario's own phase markers and preceded
   by a baseline phase; warm-up (first frames, shader work, streaming) is excluded by construction, not by hope.
   Rule: capture the smallest window that contains the symptom; a whole-session capture drowns it, and an
   intermittent symptom is captured by repeating a scripted window, not by lengthening one. State why driving the
   capture from the scenario beats an agent deciding when to start and stop (the vendor says autonomous capture
   is experimental and recommends manual start and stop; treat that as a claim to test, not a fact).
3. `per-thread-budgets-not-one-frame-time` - separate budgets for the game thread, the render thread and the
   graphics processor, because one frame-time number cannot say which regressed. Rule: where a run mode cannot
   measure one of them (no renderer), the result says that thread was not measured; it never reports it as
   within budget. Distinguish a **budget** (a policy: what the team will accept) from a **baseline** (a
   measurement: what this build did) and state which one a gate compares to.
4. `percentile-and-hitch-gate` - a mean hides the frames players feel. Rule: gate on a high percentile and on a
   count of frames beyond a multiple of the median, and report the distribution beside the verdict. State the
   percentile choice and what sample size makes it meaningful.
5. `baseline-bound-to-build-and-machine` - a baseline is a verdict bound to the content it judged: build,
   configuration, scenario, timestep and hardware class. Rule: a comparison across a different hardware class or
   configuration is not a comparison; promoting a new baseline needs an explicit approval signal, never a silent
   re-record (read `approval-snapshots-with-guarded-update` in test-harness and state the boundary).

The drafter must decide, not discover: whether memory and load time belong here or are a sibling subject; whether
a sixth technique (the perf verdict vocabulary: pass / regression / unverifiable with named reasons) is separate
from `runtime-observation-evidence`'s three-outcome rule or a one-paragraph application of it - prefer the
paragraph unless a decision rule is genuinely new.

## Boundaries this subject must state and must NOT absorb

- `runtime-observation-evidence` owns what evidence a behaviour claim requires, the three outcomes and the
  fixed-timestep rule. This subject **cites** them and adds what is specific to a measured quantity that varies
  run to run. Do not restate `deterministic-headless-timestep`.
- Authoring-time budgets (polygon counts, shader cost) and `ship-pipeline-gating`'s size-growth baseline are
  other subjects; this one is about runtime frame cost measured in a run. State the line in the opening.
- `test-harness` (software-engineering) owns flake lifecycle and approval snapshots in general; the noise floor
  and baseline promotion here are the performance-specific cases. Read it and state what is not repeated.
- `metric-gates` / `deterministic-proxy-gate` (software-engineering) cover gating on a measured proxy; read it
  and state the difference (here the quantity is itself noisy and the proxy question is noise, not validity).
- Cross-bundle links are forbidden: where a rule is stated in another bundle, name the discriminator in prose.

## Trees to reconcile read-only (never edit)

The connected project **pof**, at its default branch (`<pof checkout>`, master). Read-only. It has an
analysis half (CSV import, triage, base-versus-head compare under `src/lib/profiling/` and
`src/app/api/performance-profiling/route.ts`; sessions are process-local) and a scripted scenario runner on a
fixed 1/60 s timestep (`-benchmark -fps=60`, `src/types/observation.ts`), with the null-renderer mode noted as
not measuring graphics time. It has no capture step. **Do not read the `direction/*` worktrees under `C:\t\`**:
a worker is building a capture stage there right now and its code is not merged. Applications are written only
for what you open on master; an application whose finding is "the tree has the analysis half and no capture, and
no noise floor" is a legitimate negative-space application.

## Primaries (the drafter's web budget, ~6 fetches)

Read with the registry's verbatim ingest, NOT a summarizing fetch (a summarizing fetch has been caught
inventing quotes and inverting findings): `node <registry>/scripts/research-ingest.mjs
"<url>" --json` prints a JSON with a `path` to a cleaned text file; Read that. Already fetched verbatim this
session (read these first):

- <research-cache>/automation-test-framework-in-unreal-engine-unreal-engine-5-8.clean.txt
  (the engine's automation framework page: test types, design guidelines - note "do not assume the state";
  tests may run out of order or in parallel across machines)
- <research-cache>/unreal-automationperformacehelper-unreal-python-5-2-experime.clean.txt
  (a performance helper for functional tests: a baseline record first, then a named record with separate
  graphics-processor, render-thread and game-thread budgets, and per-thread within-budget checks)

To fetch (engine documentation, https://dev.epicgames.com/documentation/en-us/unreal-engine/...): the CSV
profiler page (`csv-profiler`), the Unreal Insights introduction, `running-gauntlet-tests-in-unreal-engine`,
`introduction-to-performance-profiling-and-configuration-in-unreal-engine`, and the vendor's own page
https://www.tryaura.dev/documentation/performance-profiling (already ingested: cleaned text at
<research-cache>/performance-profiling-aura-documentation.clean.txt).
The upper layers carry no product or tool names; names live only in applications.

## Open questions the drafter must resolve

- What sample size and how many A/A pairs make a percentile gate trustworthy on a shared machine? Cite a
  primary or state the rule as a procedure the reader measures for their own machine, never as a number.
- Is a fixed timestep sufficient for a stable frame-cost measurement, or does it only make motion reproducible
  while frame cost still varies with machine load? (The corpus says the former for observation; state the
  boundary for cost.)
- Where does the graphics-processor measurement live when the cheap run mode has no renderer - a second boot,
  a separate lane, or a stated non-measurement?

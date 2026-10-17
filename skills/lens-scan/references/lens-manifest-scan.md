# The lens manifest `scan` block - how lens-scan measures a lens with no built-in method

Read from `SKILL.md` phase 2 ("Lenses with a scan block"). The contract is the blueprint's
(bp `src/lib/standard/types.ts`, `docs/standard/schema/lens-manifest-1.schema.json`); this
page restates it **name for name** and says what lens-scan does with each part. When the two
disagree, bp's types win and this page is the bug.

## The types

```ts
type LensScan = LensScanJudgement | LensScanSteps;            // LensManifest.scan?

interface LensScanJudgement {
  method: 'judgement';
  instructions: string;      // what to look for, in the author's words
}
interface LensScanSteps {
  method: 'steps';
  steps: LensScanStep[];     // 1..8 steps, run in order by lens-scan measure
}
type LensScanStep =
  | { kind: 'script'; run: string; yields: string[] }
  | { kind: 'skill'; skill: 'conform'; args?: string; budget?: number }
  | { kind: 'judgement'; instructions: string };
```

A lens's **metric fields** are its `fields[]` entries with a `metric` block and a numeric
`type` (`integer`, `number`, `percent`, `money`). Every reading of the lens fills one of
them, and only them. `node scripts/structure.mjs lens --id <lens>` prints the method, the
instructions or the steps, and those fields with their `unit`.

## Which lenses use it

- `development`, `security`, `design` and `performance` keep their built-in methods
  ([metrics.md](metrics.md); performance's are the overlay's `## Probes` and `bundle_stats`);
  a scan block on them is ignored and the `lens` output says so.
- `business`, `operations`, `quality` are built-in ids **without** a built-in method: their
  manifest's scan block measures them exactly as it measures a project lens. Without one they
  are refused, as any lens with nothing to measure it.
- Every project lens (`com.<org>.<name>`) and temporary lens (`tmp.<kebab>`) with a scan block.

Refused before run-start (`structure.mjs lens` exits 1; headless: `lens-scan refused: <why>`):
no scan block; a steps list that is empty or longer than 8; a step of an unknown kind; a
`script` step without `run` or whose `yields` names a field that is not a metric field; a
`skill` step naming anything but `conform` - `step skill <x> is not allowed`.

## `judgement`

Per scoped feature: read its code footprint once, judge it against `instructions` and only
those, write one measurement per metric field it can judge (`--method judgement`, evidence
`file:line, ...`, unit from the field). A feature the instructions do not touch gets no
reading and a facet `applicable: false` with a one-line reason (SKILL.md, steps 1-4).

The facet command edits only that facet's `applicable` and `reason` (every other facet,
value and lens entry is kept) and rewrites the file atomically. Re-running phase 1
afterwards keeps both. Judgement numbers on an author's instructions drift like any
judgement: same instructions, same reading, and a run note when the manifest's
instructions changed since the last measurement.

## `steps`

The steps run **in order, inside one measure run** (one `run-start`, one `run-end`). Each
step writes an activity `note` naming itself before it starts. A step that fails writes an
`error` activity and the remaining steps still run; the run ends `failed` (with the failed
steps in its note) when no step wrote anything, else `done` with them named in the report.

### `script`

```
node ${CLAUDE_SKILL_DIR}/scripts/steps.mjs run --lens <id> --step <i> --run-id <run> [--scope a,b]
```

`steps.mjs` (its header is the full reference) replaces the placeholders, runs the command
through the shell with cwd = the product root and a 10 minute cap, and records its stdout.

| Placeholder | Becomes |
| --- | --- |
| `{root}` | the product root |
| `{structure}` | the app-structure.json path (absolute) |
| `{registry}` | the ai-registry checkout: `$AI_REGISTRY_DIR`, else `registry.local` from `<root>/.ai/manifest.yaml`, else `../ai-registry` beside the product. **None of them a directory: the step is skipped** with the note "no registry checkout" and measures nothing. |
| `{features}` | the scoped feature slugs, comma-separated; empty when the run covers every feature |

Values go in as they are: quote a path placeholder in `run` (`"{root}"`).

Stdout is JSON rows - an array, or an object holding `rows`:

```ts
{ feature: string; metric?: string; value?: number; evidence?: string; applicable?: boolean; reason?: string }
```

| Row | What lens-scan does |
| --- | --- |
| feature outside the scope | ignored (counted in the summary, never written) |
| `applicable: false` + `reason` | `facet --applicable false --reason` on the map; no reading |
| metric in `yields`, a metric field, finite value | a measurement: method `static`, unit = the field's `unit`, evidence = the row's (else the step's `run`) |
| metric not in `yields`, not a metric field, value not a number, `applicable:false` without a reason | **refused**: a `note` activity naming the row and why; never a row |

A feature that gets a measurement while its facet says `applicable: false` is cleared back to
applicable. A command that exits non-zero, times out or prints something that is not rows
fails the step: an `error` activity, nothing written, `steps.mjs` exits 1.

### `skill`

Only `conform` (since 1.3.0). The measuring session runs `/conform` itself, headless, with the
step's `args` and `--budget <budget>` (conform's own default, 3-6 pairs, when absent), then
continues with the next step. conform writes verdicts into `.ai/registry-map.json`; it writes
no measurement. That is why the registry lens composes `script -> skill -> script`: the
second script re-reads the map conform just changed. The session never runs any other skill
from a step and never asks conform to edit the registry.

### `judgement`

As a judgement lens, with this step's `instructions`, filling the lens's metric fields that
use `method: 'judgement'` in their metric block. A judgement step after a script step may
read what the script wrote (the store's `latest`), never overwrite it with a second number
for the same metric in the same run.

## Units

Every measure write takes `unit` from the manifest field, never free text: `steps.mjs`
copies it, `harness.py` copies it from the map, a judgement reading passes `--unit` from the
`lens` output, and `footprint.mjs` keeps a `UNITS` table that must equal the built-in
manifests' units. A field with no `unit` is written with none. This is what keeps one metric
one series across runs (on pof, `depCount` was once written as `deps` and once as `packages`).

## An example

The registry lens bp's validation onboarded (`tests/fixtures/registry-lens.manifest.json`
holds a shorter copy the tests run):

```json
"scan": { "method": "steps", "steps": [
  { "kind": "script", "run": "node \"{registry}/scripts/registry-lens.mjs\" --project <slug> --path \"{root}\" --structure \"{structure}\" --json",
    "yields": ["registered", "topicsMapped", "judgedPct", "conformantPct", "deviations", "staleVerdicts", "leadsFiled", "leadsLanded", "appliedBetter"] },
  { "kind": "skill", "skill": "conform", "budget": 6 },
  { "kind": "script", "run": "node \"{registry}/scripts/registry-lens.mjs\" --project <slug> --path \"{root}\" --structure \"{structure}\" --json",
    "yields": ["registered", "topicsMapped", "judgedPct", "conformantPct", "deviations", "staleVerdicts", "leadsFiled", "leadsLanded", "appliedBetter"] }
] }
```

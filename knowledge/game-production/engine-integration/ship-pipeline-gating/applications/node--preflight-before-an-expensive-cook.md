---
layer: application
type: application
subject: ship-pipeline-gating
technique: preflight-before-an-expensive-cook
stack: node
status: forged
verified_on: 2026-08-20
---

# Preflight in a TypeScript packaging module

`src/lib/packaging/preflight.ts` (443 lines) in the PoF repo is a pure, side-effect-free
preflight for an Unreal Engine 5 cook. Every check is a function from already-read inputs
to a `PreflightCheckResult` — `{ id, label, status, detail, issues }` — with
`PreflightStatus` being `'pass' | 'warn' | 'fail'`. The three-valued status and the
per-rule `id` are what make the module usable: the caller renders twelve rows, not one
boolean.

## Config sanity — the economic argument, in code

`checkConfigSanity` (line 78) takes the contents of `Config/DefaultGame.ini` and
`Config/DefaultEngine.ini` plus a resolved `defaultMapExists` boolean, and checks three
declarations:

- `ProjectID` under `[/Script/EngineSettings.GeneralProjectSettings]` — empty is a hard
  `fail`, with the comment stating why: *the cook commandlet rejects a blank ProjectID*.
  A one-line INI read against a cook that runs tens of minutes.
- `GameDefaultMap` under `[/Script/EngineSettings.GameMapsSettings]` — unset is `warn`
  ("the packaged build will not load a level on launch"), but set-and-not-resolving is
  `fail`. That asymmetry is the technique's *check the referent* rule realized: a
  dangling reference is a harder defect than a blank.
- `GlobalDefaultGameMode` — unset is `warn`.

The warn/fail split matches the technique's fatal-vs-advisory rule exactly. The code
comment records the incident that produced the check: a vertical-slice build with neither
map nor game mode set launched into a black screen.

`defaultMapExists` is typed `boolean | null | undefined` with `null` documented as "not
checked / no map configured" — the third value the technique demands, kept out of the
boolean.

## The audit as a preflight rule

`auditWithEditor` (line 142) returns `WithEditorViolation[]`, and a separate
`withEditorCheckResult` (line 234) wraps that list into the same
`PreflightCheckResult` shape. Splitting the scanner from the result-wrapper is worth
copying: the scanner is unit-testable against source strings with no knowledge of the
gate, and the wrapper owns the `pass`/`fail` policy. `issues` renders each violation as
`path:line — \`token\` not under #if WITH_EDITOR`, which is the technique's "report
location and guard state" rule.

## Build-result parsing, and why it is exit-code territory

`parseUbtResult` (line 400) demands an affirmative marker: `succeeded` is true only when
`sawSucceeded && !sawFailed && errors.length === 0`. `Target is up to date` counts as
success. The error matcher deliberately excludes `0 error` summaries — the technique's
"exclude the summary shapes that report a count of zero".

## What did not transplant

`overallStatus` (line 433) reduces the whole result set to one status by
fail-beats-warn-beats-pass. It has no notion of *unevaluated*: a rule that could not read
its input has to encode that as `warn` or invent a status. The technique holds the
stricter line — an unevaluated rule is a fourth state and must not roll up as a warning,
which is a shape a two-plus-one enum cannot express.

Preflight also does not load the downstream size-budget configuration
(`src/lib/packaging/size-budgets.ts`), so an unreadable budget blob is discovered after
the cook rather than before it. The technique places gate-configuration integrity in
preflight for exactly that reason.

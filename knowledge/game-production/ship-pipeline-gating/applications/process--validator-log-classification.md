---
layer: application
type: application
subject: ship-pipeline-gating
technique: validator-log-classification
stack: process
status: forged
---

# Choosing the judgment mode of each gate in a UE5 harness

Two subsystems in the PoF repo arrived at the same law independently, which is the best
evidence a law has. Both say it in a comment.

`src/lib/harness/ue-gates.ts:1` (header comment):

> UBT is a deterministic, headless, from-source compile whose EXIT CODE is a reliable
> pass/fail signal — unlike the editor (`-run=...`), which can crash on headless shutdown
> even after a clean run (per project convention we never trust the editor's exit code).
> ... So the compile gate is UBT (exit-code judged); the automation-test gate runs the
> editor and is judged by ABSLOG CONTENT, never exit code.

`src/lib/packaging/preflight.ts` (around line 300, on `parseAssetValidation`):

> Judged by output content, never by exit code — headless `UnrealEditor-Cmd` exits
> non-zero on a benign shutdown null-deref.

Note the direction in the second one. The failure is not only "exits zero after failing";
it is "exits non-zero after succeeding". Both directions of the status are noise for a
process that outlives its task.

## The tool choice is two-dimensional

The `ue-gates.ts` comment makes the coverage argument alongside the judgment-mode one:
`CompileAllBlueprints` run inside the editor covers only Blueprints, while the harness
writes C++ game code, so the truth needed is "does the C++ still compile". UnrealBuildTool
wins on both axes — coverage *and* exit-code honesty — so the compile gate is
out-of-process. The automation-test gate has no out-of-process equivalent, so it accepts
log-judgment deliberately (`readAbslogFacts`, imported at line 21) rather than by
default.

`deriveUeCompileCommand` (line 76) returns `null` when the engine root cannot be derived
from the editor-cmd path, and the comment says the caller then "reports the gate
unverifiable" — the third verdict, present in the real system. `resolveUeEnv` (line 32)
returns `null` unless both `POF_UE_EDITOR_CMD` and `POF_UE_UPROJECT` are set: "no
half-config".

The generated command carries `-WaitMutex` (line 84), described as "don't clash with a
running editor" — the gate waits for the resource rather than racing the developer for
it.

## The classifier is scoped to the emitting subsystem

`parseAssetValidation` does not match on severity alone. `VALIDATION_LOG_CATEGORIES`
(around line 265) is an explicit set — `LogContentValidation`, `LogDataValidation`,
`LogEditorValidator`, `LogContentValidator`, `LogAssetValidation`, `LogContentCommandlet`,
`LogSavePackage` — and the comment states the reason: scoping "avoids treating unrelated
engine errors (a `LogTemp: Error` from gameplay code, say) as content defects". A gate
that failed builds on unrelated gameplay logging would be routed around within a sprint.

`LOG_LINE_RE` strips any number of leading bracketed prefixes (timestamp, frame counter)
before reading `Category: Verbosity: message`. Deduplication is on `severity|message`
(the `seen` set), so one defect repeated across a hundred assets counts once.

The subtlest rule in the file: `Display`-verbosity lines are normally ignored, but a
redirector-fixup summary with a nonzero count is promoted to a warning
(`REDIRECTOR_COUNT_RE`). Leftover redirectors bloat the cook and are never reported at
warning severity — a severity-only classifier would discard the only signal that exists
for that defect class.

`categorizeAssetIssue` sorts each message into `missing-reference | redirector | texture
| map-not-in-cook | other`, and `assetValidationCheckResult` reports errors and warnings
as separate counts rather than a boolean, truncating the issue list at 30.

## The gap

Neither subsystem has the technique's *unclassified* outcome. `parseAssetValidation`
returning an empty array means "no violations found", which is also what an empty log, a
crashed-on-startup commandlet, and a changed log format produce. The technique keeps the
stricter rule: no recognised success marker and no recognised error is a third verdict,
not a pass. `parseUbtResult` does require an affirmative success marker and is the model
to copy here.

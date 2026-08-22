---
layer: application
type: application
subject: engine-integration-safety
technique: refuse-dont-kill-a-live-editor
stack: process
status: forged
verified_on: 2026-08-20
---

# Refusal as a stated repo law — the PoF experiment lab and gate runner

How one codebase turned "never kill a live editor" from a comment into an enforced
operating law, after the sweep had already destroyed real work.

## The incident, as the repo records it

`docs/catalog/L3-L4-RUNNER.md:69` states it flatly:

> **Teardown is PID-scoped.** The capture runner kills **only the editor it spawned**
> (`taskkill /PID <pid> /T /F`, built by the pure `buildPidKillArgs`) … It previously
> followed that with `taskkill /IM UnrealEditor.exe /F` — a machine-wide sweep that killed
> the operator's live editor and any concurrent session's editor on the shared UE tree.
> **Repo law: never kill by image name; kill only what you spawned, by PID.**

The second victim is the part worth transplanting. `src/lib/ue-experiment/editor-process.ts:1-16`
records that the swept drain "mis-read [the kill] as its own spawn failure" — the sweep
did not merely destroy data, it manufactured a false diagnosis in innocent code. That is
the epistemic half of the golden path's founding incident, observed rather than theorised.

## The refusal replaces the kill

`src/lib/ue-experiment/editor-precondition.ts` is the refusal path, and its header names
the choice explicitly: the runner "used to resolve that by force-killing every Unreal
process on the machine — i.e. by destroying the operator's open editor and its unsaved
work. The honest resolution is a REFUSAL, not a kill."

Two guards, **both read-only**:

1. **Process probe.** `detectRunningEditors` shells `tasklist` for the two editor images.
   `buildTasklistArgs` (line 34) is commented as "deliberately the only Unreal-image-shaped
   argv in this subsystem: it names an image to READ, never to kill" — the technique's rule
   that class matching is permitted for observation and forbidden for action, enforced by
   confining the class-shaped argv to one pure function a test can assert against.
2. **Drain lease.** `drainEditorLease` takes the gate runner's global key `'*|*'` from
   `src/lib/test-gate-runner/drain-lease.ts`, the same registry the drain route and the
   always-on worker contend on.

`editorPreconditionReason` builds the four-part message the technique prescribes — what was
found (`UnrealEditor.exe (PID 12345)`), why it blocks ("UE is not re-entrant on one
project"), why the tool refuses ("PoF will not kill an editor it did not start"), and the
remedy plus a stated-consequence override ("tick 'Run anyway' to launch beside it …
consequence: the second instance commonly fails to launch or fights the first for project
file locks — and your open editor is left untouched either way").

The override split is the sharp part. The **process probe is overridable** — an operator may
legitimately want a second instance and is told what they are buying. The **lease is not**:
`leaseConflictReason` ends "this guard is not overridable", because a lease conflict is a
machine-state fact inside the same process, and stepping over it "is precisely the race that
made a drain mis-attribute our kill to itself". Consent cannot make a data race safe.

## Refusal is a first-class outcome

`src/lib/ue-experiment/runner.ts:206` carries a dedicated result shape for "the run never
started: a precondition refused it (live editor / drain lease held)" — distinct from a
failed run. Nothing downstream can read a refusal as a verdict on the experiment.

## The probe may not lie either way

`detectRunningEditors` never throws: a probe that cannot run (non-Windows, no `tasklist`)
"reports nothing found and SAYS SO in the debug log — an undetectable editor must not
become a silent excuse to proceed quietly, but it also must not block the lab on a platform
where the probe does not exist." That is the technique's *probe unavailable* rule, with the
platform trade-off resolved in favour of not blocking, and the gap logged.

## What makes the law hold

`src/lib/ue-experiment/editor-process.ts` delegates its whole spawn/kill lifecycle to
`createCaptureRun` + `buildPidKillArgs` in `src/lib/ue-launch/capture.ts:62,76` — "one law,
one implementation" — and exposes an `exec` seam whose stated purpose is "so a test can
observe every command this module issues and prove none of them names an image"
(unit-asserted in `capture.test.ts`, per the runner doc, with no test ever launching an
editor). The law survives because a test fails when it is broken, not because a comment
asks nicely.

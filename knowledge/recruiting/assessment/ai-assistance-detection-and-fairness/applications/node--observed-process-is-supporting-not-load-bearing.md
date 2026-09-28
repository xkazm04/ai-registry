---
layer: application
type: application
subject: ai-assistance-detection-and-fairness
technique: observed-process-is-supporting-not-load-bearing
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: code
ab_verdict: better
---

# The observation waiver in a process-authenticity score (TypeScript)

`app/_lib/devcase-authenticity.ts` is a pure, import-free scorer that folds a
dev-case submission's process trace into one authenticity band. The caller,
`runEvaluateSubmission` in `app/_lib/devcase-run.ts`, assembles its inputs from
two different submission paths: a git repository, and the in-product Live Work
Surface, where every edit is captured as an event and there is no git history at
all. That second path is where the technique's waiver, and its trap, both live.

## The waiver

The commit lines are waived for watched work, and the comment gives the
technique's reason in the product's words: "penalizing watched work for lacking
commits would defeat the whole point of the Live Work Surface (it scored the
cleanest submissions as half-suspect)" (`:108-112`). `single bulk commit` (−40)
and `no commit history` (−15) test `!input.observed` (`:113`, `:119`).

## The trap, and the line that closes it

A blanket waiver "previously let a candidate paste a whole LLM solution into the
watched editor and still score 'authentic'" (`:124-128`). So one watched signal
is kept on and made decisive: `observedBulkPaste` (−65, `:129-131`), a single
paste of at least `PASTE_BULK_CHARS = 600` (`:100`). That is the technique's
"signals that observation makes *more* observable must stay on".

## The waiver has to follow the derivation (fixed 2026-09-26)

The iteration pattern and the read-before-write ratio reach the scorer from the
reflection (`devcase-run.ts:756-757`), and the reflection is inferred from the
commit history alone (`pipeline/jobfit/devcase/evaluation_pipeline.py:113`). A
watched session has no commits. The deterministic reflection reads an empty
history as a big dump (`n <= 2`, `reflect.py:163`) and returns `big-bang`, so
until kp `ac43761d4` every watched session on the no-API-key path lost 15
points and showed the reviewer a big-bang finding about work the product had
watched edit by edit. The waiver covered the commit lines by name and missed the
fields computed from the same absent source. The existing tests had not caught
it because every observed fixture passed `iterationPattern: "linear"`, a value
the real path never produces for an empty history.

The fix waives both commit-derived fields when `observed` is true (`:160-171`,
`:185`). The A/B is a test fed what the reflection actually returns: observed,
`big-bang`, read-before-write 0.2, no decisions log — 45 (mixed) before, 75
(authentic) after — while an unobserved submission with the same reflection is
still charged. On the deterministic reflection's real value (read-before-write
0.35) the move is 60 → 75 without a decisions log, 85 → 100 with one. This is the
upward lesson the technique now states: waive by derivation, not by name, and
test the watched path with what the inference really returns.

## Integrity: decisive, but subtracted rather than voided

`integrityCompromised` (a hash chain that fails to recompute, a client timestamp
outside its server receive window, or a foreign session's watermark in the
submitted tree, `devcase-run.ts:748-750`) costs −70 (`:138-140`), and the comment
states the technique's premise: "every process signal above it is
untrustworthy". A null chain (legacy) is deliberately not tampering.

## Deviations

- **A compromised trace is scored, not voided.** The technique says a failed
  integrity check voids every process signal derived from the trace and routes
  to a human. Here the −70 is added to whatever else fired, and integrity is
  never passed to the Python evaluation (no `pipeline/jobfit/devcase` module
  reads it), so the model still reads the untrusted process events as evidence.
- **The bulk-paste tell tests size, not review, and is decisive alone.** The
  comments describe "a single large bulk paste … with no incremental build-up"
  (`:34-36`, `:95-99`). The capture records paste magnitude only
  (`app/devcase/apply/[token]/LiveWorkSurface.tsx:400-404`), and the predicate is
  any paste of 600 characters or more (`devcase-run.ts:741`). Nothing checks
  whether the pasted block was edited afterwards, which the technique names as
  the part that carries the information, and −65 crosses the suspect boundary
  on its own. That is the assistive-technology and drafted-elsewhere hazard the
  bulk-paste technique warns about. The mitigation is real: suspect holds
  auto-promotion for a live interview and never rejects.
- **Capture states are a boolean.** `observed = events !== null`
  (`devcase-run.ts:724`); the technique's *observed / not observed / capture
  unavailable / declined / waived* collapse into two, and the waived commit lines
  leave no `waived` reason for the reviewer to read.

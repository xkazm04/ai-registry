---
layer: application
type: application
subject: ai-assistance-detection-and-fairness
technique: never-penalise-tool-use-invariant
stack: react
status: forged
verified_on: 2026-09-26
verified_against: react@19
---

# Holding the invariant at the surface (React panel + penalty schedule)

The invariant is easiest to lose on the screen, where a number rendered on a
red-to-green meter becomes a penalty whatever its caption says.
`app/features/tools/devcases/DevEvalPanelChecks.tsx` is where the mechanical
verdicts computed by the Python side finally reach a human, and its header
comment (`:11-26`) names three product rules as "load-bearing here, not
decoration".

## Rule 1 — honest darkness

Every check is optional at the producer: `{}` for a repo submission, no
`canaryOutcomes` when the seed planted none, no `baselineSimilarity` when the
model was unavailable at approval. "Each of those renders as 'this check did not
run', NEVER as a pass" (`:13-19`) — and the comment cites the engine's own
refusal for the reason, quoting `seed_materializer.py`: "a template flaw with no
real ground truth would grade candidates against noise."

The same posture governs unrecognised values. `canaryStatus` (`:45-49`) coerces
anything outside the closed four-verdict list to `unverifiable`, commented as
"the honest default, never a pass" — the standard's rule that an unreadable
verdict is an absence of one, realized at the boundary where free-form JSON from
the Python side crosses into typed UI.

`CANARY_TONE` (`:38-43`) keeps all four verdicts visually distinct, because
"collapsing them to pass/fail would erase the two that matter most:
`propagated` … and `unverifiable` (we cannot grade this, so we don't)". Note the
tone assignment: `flagged` is blue, not green and not coral — an
interviewer-facing signal rather than a score. The canary `kind` is rendered
beside the verdict (`:64-69`) after a review found a reviewer reading
"propagated · src/rates.ts" could not tell a wrong constant from a stale doc
without opening the seed. The ungradable canaries are counted beside the graded
ones (`:99`, `:123`), and each verdict's cause rides in its tooltip (`:71`).

## Rule 2 — the baseline is rendered without a meter

"BASELINE SIMILARITY IS NOT A PENALTY. The engine says so explicitly. It is
rendered as a neutral figure with an interview prompt — no bar, no colour ramp,
nothing that reads as a score" (`:20-23`). The engine's claim is at
`baseline.py:9-11`: "Similarity to it is NEVER a penalty — it aims the
authorship interview at whatever the human did (or didn't) add beyond the bare
model."

`BASELINE_AIM_INTERVIEW = 0.85` (`:54`) exists only to decide whether to show
the interview prompt, and it matches the engine's own threshold rather than
introducing a second one — the standard's rule that a similarity number may aim
a conversation but never resolve into a verdict. The match is by value: the
engine's side is a literal (`artifact_checks.py:285`, `sim >= 0.85`), not a
shared constant, so the two can drift apart without a test noticing.

## Rule 3 — model use is context, never a penalty

"AI USE IS NEVER A PENALTY. Prompt counts are context that aims the interview.
`briefPasteRatio` is the one negative-leaning signal and it is labelled as an
interview aim, in blue, never in coral" (`:24-26`), with
`BRIEF_PASTE_AIM_INTERVIEW = 0.6` (`:57`) matching the engine's literal
(`prompt_signals.py:138`).

Upstream, `prompt_signals.py:9-13` states the contract the panel renders:
"using the assistant is never a penalty — zero prompts is simply 'no signal',
and heavy use is graded on QUALITY, never volume". The ratio itself
(`_brief_paste_ratio`, `:66-86`) is the standard's containment measure: the
fraction of the brief's 5-gram shingles present in the most brief-like prompt,
order-insensitive and undiluted by the candidate's own additions, with short
briefs (< 8 tokens) returning 0.0 as no-signal rather than a spurious number.
`process_events.py:15-17` carries the sibling clause: "over-reliance is NEVER
inferred from tool use; we observe process *artifacts* (opens/edits/decision-log),
never keystrokes or screens."

## The penalty schedule

`app/_lib/devcase-authenticity.ts` is the numeric layer: a published schedule in
which each line names its behaviour, never a black-box risk score, banded at
`SUSPECT_THRESHOLD = 40` (`:92`, half-open bands). No line fires on model use,
model style or fluency. `suspect` gates *auto-promotion* only — a suspect
submission "is held for the live ownership-verifying interview the followups
were minted for, never auto-advanced on score alone" (`:8-10`). The schedule's
observation waiver, its bulk-paste exception and its integrity line are read in
[the node application](node--observed-process-is-supporting-not-load-bearing.md),
because that is the technique they test.

## Deviations

- **"Did not use" and "not captured" render as one sentence.**
  `derive_prompt_signals` promises that consumers "can tell 'didn't use the
  channel' from 'channel not captured'" (`prompt_signals.py:90-92`), but it
  computes `observed = bool(msgs)` (`:114`), and the pipeline passes no signals
  at all when no transcript exists (`evaluation_pipeline.py:85`). The panel's
  single `!promptObserved` branch (`DevEvalPanelChecks.tsx:154-155`) then tells
  the reviewer "The assistant and stakeholder channels went unused" for a repo
  submission whose channels were never captured. The caption's "No signal either
  way, never a penalty" keeps it from reading as adverse, but the sentence asserts
  a fact the record does not hold. It should be two states.
- **Resolved since 2026-08-20:** `iterationPattern === "unclear"` no longer
  costs 5 points; it is zero-cost with the reason kept for the reviewer
  (`devcase-authenticity.ts:172-182`, kp `62fbf8339`).

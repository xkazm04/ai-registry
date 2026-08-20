---
layer: application
type: application
subject: ai-assistance-detection-and-fairness
technique: never-penalise-tool-use-invariant
stack: react
status: forged
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

The same posture governs unrecognised values. `canaryStatus` (`:47-50`) coerces
anything outside the closed four-verdict list to `unverifiable`, commented as
"the honest default, never a pass" — the standard's rule that an unreadable
verdict is an absence of one, realized at the boundary where free-form JSON from
the Python side crosses into typed UI.

`CANARY_TONE` (`:38-44`) keeps all four verdicts visually distinct, because
"collapsing them to pass/fail would erase the two that matter most:
`propagated` … and `unverifiable` (we cannot grade this, so we don't)". Note the
tone assignment: `flagged` is blue, not green and not coral — an
interviewer-facing signal rather than a score. The canary `kind` is rendered
beside the verdict (`:64-70`) after a review found a reviewer reading
"propagated · a rates file" could not tell a wrong constant from a stale doc
without opening the seed.

## Rule 2 — the baseline is rendered without a meter

"BASELINE SIMILARITY IS NOT A PENALTY. The engine says so explicitly. It is
rendered as a neutral figure with an interview prompt — no bar, no colour ramp,
nothing that reads as a score" (`:20-23`). The engine's claim is at
`baseline.py:11-13`: "Similarity to it is NEVER a penalty — it aims the
authorship interview at whatever the human did (or didn't) add beyond the bare
model."

`BASELINE_AIM_INTERVIEW = 0.85` (`:54`) exists only to decide whether to show
the interview prompt, and it mirrors the engine's own threshold rather than
introducing a second one — the standard's rule that a similarity number may aim
a conversation but never resolve into a verdict.

## Rule 3 — model use is context, never a penalty

"AI USE IS NEVER A PENALTY. Prompt counts are context that aims the interview.
`briefPasteRatio` is the one negative-leaning signal and it is labelled as an
interview aim, in blue, never in coral" (`:24-26`), with
`BRIEF_PASTE_AIM_INTERVIEW = 0.6` (`:57`) mirroring the engine constant.

Upstream, `prompt_signals.py:9-13` states the contract the panel renders:
"using the assistant is never a penalty — zero prompts is simply 'no signal',
and heavy use is graded on QUALITY, never volume", and `derive_prompt_signals`
returns `observed: False` on an absent transcript "so consumers can tell 'didn't
use the channel' from 'channel not captured'". The ratio itself
(`_brief_paste_ratio`, `:35-56`) is the standard's containment measure: the
fraction of the brief's 5-gram shingles present in the most brief-like prompt,
order-insensitive and undiluted by the candidate's own additions, with short
briefs (< 8 tokens) returning 0.0 as no-signal rather than a spurious number.
`process_events.py:14-17` carries the sibling clause: "over-reliance is NEVER
inferred from tool use; we observe process *artifacts* (opens/edits/decision-log),
never keystrokes or screens."

## The penalty schedule and its waiver

`app/_lib/devcase-authenticity.ts` is the numeric layer, and it is a published
schedule where each line names its behaviour and reason rather than a black-box
risk score: single bulk commit −40, no readable history −15, missing decisions
log −25, bursty cadence −15, big-bang iteration −15, weak read-before-write −15,
banded at `SUSPECT_THRESHOLD = 40` (`:49`). No line fires on model use, model
style or fluency; every line names an observable behaviour.

Crucially, `suspect` gates *auto-promotion* only — a suspect submission "is held
for the live ownership-verifying interview the followups were minted for, never
auto-advanced on score alone" (`:8-10`). The adverse direction is a hold, not a
rejection, which is the standard's fail-closed-toward-the-candidate posture.

The observation waiver (`:26-31`, `:63-70`) is the partial waiver the standard
teaches, including the trap: watched work has no commit history by design, so
the commit penalties are waived because "penalizing watched work for lacking
commits would defeat the whole point of the Live Work Surface (it scored the
cleanest submissions as half-suspect)" — but blanket waiving "previously let a
candidate paste a whole LLM solution into the watched editor and still score
'authentic'", so `observedBulkPaste` (≥ `PASTE_BULK_CHARS = 600`, `:57`) carries
a decisive −65. `integrityCompromised` (`:95-99`) is the other decisive line: a
broken hash chain or backdated timestamps mean "every process signal above it is
untrustworthy", so the whole trace is voided into a human review rather than
nudged down. Both were upward lessons for the standard.

## Deviations

Two, and the standard does not bend for either.

- **`iterationPattern === "unclear"` costs −5** (`:117-119`) for a trace that
  simply could not be read. That is a penalty for an absence of evidence, on a
  signal class the same repo's red-team round proved fabricable — the candidate
  with the least legible tooling pays, and the gamer does not. It should be a
  no-signal state at zero cost.
- **Process-derived lines can reach the suspect band on their own** (a single
  bulk commit plus a missing log is −65). The standard says no process signal
  moves a candidate across a decision boundary alone. The mitigation here is
  real — the boundary is *hold for interview*, never reject — but the rule as
  written is stronger than the implementation.

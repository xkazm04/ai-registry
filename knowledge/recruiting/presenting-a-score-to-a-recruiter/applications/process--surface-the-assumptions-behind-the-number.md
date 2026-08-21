---
layer: application
type: application
subject: presenting-a-score-to-a-recruiter
technique: surface-the-assumptions-behind-the-number
stack: process
status: forged
---

# The matching engine's assumption and knockout channels

The Python matching engine emits, alongside every candidate's score, two
structured channels the recruiter reads before believing the number: the
imputations that produced it, and the hard gates that fired.

## `candidate_assumptions` — what the recruiter must see

`pipeline/jobfit/matching.py:952` builds the list, and its docstring at
`:977` states the purpose exactly as the technique does: "Imputations /
uncertainties the recruiter should see to judge a score fairly."

The entries are produced by `_candidate_assumption_pairs` at the moment the
condition is detected, not reconstructed later. Their wording is the craft:

- `"Education level unknown — not penalized (absence of evidence, not a
  fail)."` — the phrase the technique's rule 4 asks for, verbatim, and the
  render of a gate that was skipped rather than passed.
- `"No languages listed — language KO skipped rather than failed."` — the
  skipped gate is disclosed instead of silently benefiting the candidate.
- `"Some skills are self-declared — discounted; validate them in interview."`
  — an imputation with its probe attached (rule 7).
- `"Thin skill profile — scores carry a wide confidence band."` — an
  assumption whose effect is on the *width* of the reading, not its level; it
  pairs with the `Confidence { low, high, level, drivers }` type in
  `app/features/shared/matchTypes.ts:38`, which carries the interval and "the
  human reasons behind its width".
- `"Some skills were directly observed (live case / interview) —
  high-confidence, not self-reported."` — an assumption that cuts *upward*.
  Its presence is what keeps the panel from reading as a strike sheet.

Each entry is emitted twice by construction. `_candidate_assumption_pairs`
returns `(english_string, LabelCode)` tuples; `candidate_assumptions`
(`:977`) yields the strings and `candidate_assumption_codes` (`:982`) the
locale-independent `match.assumptions.*` codes, "same order, so the UI can zip
them and fall back string→code cleanly." `MatchResponse.candidate.assumptions`
/ `assumptionCodes` (`matchTypes.ts:154`) is the wire shape. That is the
technique's rule 6 — a stable code plus a parallel legacy string, composed
into a sentence at render time in the reader's language.

The deviation: the codes have no typed `params` populated for the assumptions
that name a value, and the records carry no explicit *direction* or magnitude
field. A reader learns that education was unknown, not how many points the
imputation was worth. The standard's typed record (dimension, what was
missing, what was assumed, direction) is only two-thirds realized here.

## `ko_filter` — categorised at birth

`pipeline/jobfit/matching.py:294` is the sibling channel and the cleanest
instance of the neighbouring technique. `KoReason` (`matching.py:258`) is
documented as "One hard-gate failure, categorized AT BIRTH by `ko_filter`",
with `key` drawn from a closed `KoReasonKey` literal — `language`,
`seniority`, `early_career`, `education`, `work_mode` — and `detail` as the
candidate-facing clause. The line that matters: "the two never need to agree
on wording because the key alone is authoritative."

`_KO_REASON_CLAUSES` (`matching.py:992`) is therefore "purely presentation",
and `aggregate_ko_reasons` (`matching.py:1015`) ranks by
`(-counts[k], _KO_KEY_ORDER[k])` — count first, declaration order as the
deterministic tie-break, so the same data never renders in two orders.

Three fairness stances inside `ko_filter` match the technique's gate rules:

- **Unknown skips the gate.** The education minimum is checked only when the
  candidate's level resolves (`matching.py:326`); a candidate listing no
  languages is not failed on a language requirement (`:332`).
- **Unclassifiable fails closed.** An unknown archetype is not hard-gated on a
  seniority floor at all — "never auto-KO on seniority a candidate we cannot
  classify" (`matching.py:313`) — while scoring continues on neutral baseline
  weights.
- **A defaulted field is a phantom.** The work-mode gate fires only when the
  candidate expressed a preference *and* the advertisement actually stated a
  mode; a `work_mode` stamped from `DEFAULT_POLICY` and recorded in
  `job.defaulted_fields` "is a PHANTOM the ad never asserted … and must NEVER
  act as a hard gate" (`matching.py:336`).

## The re-weighting control

The recruiter-facing challenge surface is bounded on both ends. Engine-side,
dynamic weights may move each slot at most `_WEIGHT_MAX_DELTA = 0.15` from the
archetype baseline and never past `_WEIGHT_FLOOR = 0.10` / `_WEIGHT_CEIL =
0.60` (`matching.py:670`), "so one strong signal can neither erase a dimension
nor let it" dominate; `weightBounds` rides the payload so the interface seeds
bounded sliders.

Client-side, `matchTypes.ts:128` holds the two rules the panel depends on.
`weightsDirty` compares draft against in-effect weights "in WHOLE percent (the
sliders step in 1%), so sub-percent float jitter from the server's
renormalization never falsely marks the panel dirty." `syncDraftToWeights`
re-anchors the sliders to "the server-renormalized `weights` actually in
effect, NEVER the recruiter's pre-normalization drag" — before the fix, "the
sliders + `{n}%` labels disagreed with the ranking and the button stayed
falsely enabled", which is a control that lies about the number it produced.

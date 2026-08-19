---
layer: application
type: application
subject: review-iteration-loops
technique: edit-plan-over-regeneration
stack: process
status: forged
---

# Process: the recalibration prompt as an edit-plan contract

The Gravitone pipeline realizes edit-plan-over-regeneration as a system
prompt — `pipeline/RECALIBRATE-PROMPT.md` in the `gravitone-gcloud` repo —
deliberately built as the opposite number of its research prompt: research
*produces* a notebook from nothing; recalibration *edits* scripts that
already exist, with the same model (`claude-opus-5`, the one named in the
notebook's own `researcher` field) under a different contract.

## The rule, stated as the prompt's first law

The prompt opens with the doctrine verbatim (lines 13–34): "THE RULE: EDIT,
DO NOT REGENERATE", followed by the three-part argument for why a
regenerated script is a worse deliverable even when it is a better script —
approved beats silently replaced (review void), craft checks and the
constraint ledger computed against discarded beats ("Nothing that says
'verified' on screen is true any more"), and "the creator asked for a
rebalance. Handing back a rewrite is answering a question nobody asked."
It closes the section with the operative sentence: "Your output is a list
of edits, not a script."

## The operation vocabulary and the ledger discipline

Lines 76–102 define the four operations — `retime`, `rewrite`, `cut`,
`insert` — each with required fields, every edit carrying `renderId` and a
`why` "read by a person deciding whether to accept your work — write it for
them, not for a log." The attribution ledger rides along: `cards` is
mandatory on `rewrite`/`insert`, and a rewrite must "start from the `cards`
the beat arrived with" and amend rather than re-derive — the prompt's own
warning is that a re-derived list "is how the matrix drifts away from the
script" (lines 88–102, 162–163).

## Seven unbreakable rules, refused wholesale

Lines 105–139 list the rules the app itself enforces on the output —
nothing enters that is not in the notebook; every `unknown.impact` binds;
required material (the steel-man) stays; descoped material stays out;
a turn keeps its evidence; runtime is fixed ("Do not quietly shrink an
unrelated beat to make the arithmetic work"); every connector is BUT or
THEREFORE. A plan violating one is "refused wholesale, not partially
applied". The output schema carries `refusals[]` and `unchanged[]` beside
`edits[]` (lines 64–74), making refusal and explicit-untouched first-class
outputs.

## The self-audit ends on the tell

The prompt's final checklist (lines 158–171) ends by instructing the model
to re-read one item above the others: "Are the beats you did not need to
change absent from `edits[]` entirely? … An edit list longer than the notes
is a regeneration wearing an edit list's clothes." The scope-creep tell
from the technique is encoded as the last thing the engine reads before it
emits.

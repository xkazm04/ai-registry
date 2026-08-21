---
layer: application
type: application
subject: hypothesis-not-verdict-soft-signals
technique: what-to-confirm-checklist-not-a-dossier
stack: react
status: forged
verified_on: 2026-08-20
---

# Rendering the panel: what the recruiter-facing surface gets right, and where it slips

`app/_components/results/interview/SoftSignalsSection.tsx` is the first and only
surface for the engine's soft-signal panel. Its header comment states the stance
it inherits (`:9-15`): "these are hypotheses to confirm in the interview / work
sample, not verdicts" — and notes the module "was built and tested with zero
production callers; this section is its first surface".

Placing it inside the **interview** tab (`InterviewTab.tsx:83`, `:102`) rather than
alongside the fit score is the single most important decision on this surface: the
panel sits where questions are prepared, not where candidates are ranked. Nothing
on it feeds a score.

## What the row carries

Each signal renders (`:106-140`) as label, a source badge, a confidence
percentage, a `needs confirmation` pill, the detail sentence, the probe under a
bolded "Probe" prefix, and the grounding CV snippets behind a `<details>`
disclosure. That is the standard's five-part record surfaced in full — including
the source, which most surfaces drop first.

`sourceLabel` (`:147-150`) translates the raw tier constant through a message
catalog and falls back to the raw string when no translation exists — so an
unrecognised source renders as itself rather than disappearing, which is the right
failure direction for a provenance field.

The `evidence` disclosure is a good compromise on the technique's tension between
scannability and groundedness: "the compact card stays scannable but the CV
snippets that grounded each hypothesis are one click away" (`:126-128`).

## The copy-out is where the artifact travels

`checklistLines` (`:22-26`) deliberately mirrors the Python
`to_interview_checklist` "so the copied list and the Python-side checklist can't
drift in shape", filtering to `needsConfirmation && suggestedProbe` and composing
`[RED FLAG|STRENGTH] label — probe`.

The filter is exactly right: only items that still need confirmation and have
something to ask reach the clipboard. The composition is where the surface slips —
see the deviation below.

## Deviations

- **Two sections, not one impact-ordered list.** Antipatterns render as one group
  and strengths as another (`:70-83`), each with its own tone class —
  `border-coral/30` for risk, `border-moss/30` for strength (`:90-97`). The
  standard asks for one list interleaved by decision impact, precisely because two
  colour-coded sections are read as prosecution and defence. The order is also
  fixed adverse-first, and within a group it is detector order, not impact order.
- **`RED FLAG` in the exported line.** Every line in that list is by construction a
  `needsConfirmation` item; tagging it `RED FLAG` gives an unconfirmed hypothesis
  the vocabulary of a finding, and the detail sentence carrying the innocent
  reading is not in the exported line at all. `TO CONFIRM` plus the detail would
  cost one field and fix both.
- **The summary is an aggregate count.** `panel.summary` (`:68`) renders the
  engine's "N antipattern(s), M hidden strength(s); K need interview/work-sample
  confirmation" (`soft_signals.py:302-306`). It is honest and symmetric, and it is
  still a count of concerns at the top of a person's page — the standard's warning
  that aggregation is where a checklist turns back into a score. Leading with the
  confirmation count instead ("3 things to confirm") would carry the same
  information as an agenda.
- **No caps, no states.** Nothing bounds how many rows render, and no row has an
  open / confirmed / refuted / not-asked state or an actor who resolved it, so the
  list cannot empty as the process answers it. The engine caps only the folded
  model flags at four (`soft_signals.py:263`).
- **No scope statement.** The surface never says which readings were and were not
  attempted, so five rows read as an exhaustive account of the person's risks.

## What generalizes

The parts worth copying wholesale: the panel lives on the interview surface and
nowhere near the score; every row shows its source and its confidence next to its
claim; the probe is rendered as text an interviewer can read aloud; the grounding
snippets are one disclosure away; and the copied artifact is generated from the
same filter as the engine's own checklist, so the two cannot drift apart.

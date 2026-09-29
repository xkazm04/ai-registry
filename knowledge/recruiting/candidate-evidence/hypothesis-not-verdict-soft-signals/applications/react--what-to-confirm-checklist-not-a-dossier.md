---
layer: application
type: application
subject: hypothesis-not-verdict-soft-signals
technique: what-to-confirm-checklist-not-a-dossier
stack: react
status: forged
verified_on: 2026-09-29
verified_against: react@19
---

# Rendering the panel: what the recruiter-facing surface gets right, and where it slips

`app/_components/results/interview/SoftSignalsSection.tsx` is the first and only
surface for the engine's soft-signal panel. Its header comment states the stance
it inherits (`:10-16`): "these are hypotheses to confirm in the interview / work
sample, not verdicts" — and notes the module "was built and tested with zero
production callers; this section is its first surface". Re-read on 2026-09-29
against kp `d9c8b17f`.

Placing it inside the **interview** tab (`InterviewTab.tsx:88`, `:128`) rather than
alongside the fit score is the single most important decision on this surface: the
panel sits where questions are prepared, not where candidates are ranked. Nothing
on it feeds a score.

## What the row carries

Each signal renders (`:108-143`) as label, a source badge, a confidence
percentage, a `needs confirmation` pill, the detail sentence, the probe under a
bolded "Probe" prefix, and the grounding CV snippets behind a `<details>`
disclosure. That is the standard's five-part record surfaced in full — including
the source, which most surfaces drop first.

`sourceLabel` (`:150-153`) translates the raw tier constant through a message
catalog and falls back to the raw string when no translation exists — so an
unrecognised source renders as itself rather than disappearing, which is the right
failure direction for a provenance field.

The `evidence` disclosure is a good compromise on the technique's tension between
scannability and groundedness: "the compact card stays scannable but the CV
snippets that grounded each hypothesis are one click away" (`:128-130`).

## The copy-out is where the artifact travels

`checklistLines` (`:21-33`) deliberately mirrors the Python
`to_interview_checklist` "so the copied list and the Python-side checklist can't
drift in shape", filtering to `needsConfirmation && suggestedProbe` and composing
`[TO CONFIRM|STRENGTH] label — detail — probe`. A second consumer applies the same
filter: `InterviewTab.tsx:98-101` collects the probes into `signalProbes`, which
the import-to-prep button carries into interview preparation (`:156`).

The first reading of this surface recorded a `RED FLAG` tag and a missing `detail`
in the copied line. Both were fixed upstream on 2026-08-21 (kp `1aa6b768`, the TS
half of the rename), and the comment at `:27-29` names why.

The filter then did something the composition fix could not see. It was exactly
right in shape and one-sided in effect, because the engine marked its two
document-derived strengths as settled. Every strength that could have gone to the
clipboard or to prep was filtered out, and every antipattern went. The surface
code did not change. The engine flag did (kp `d9c8b17f`), and over the 66 seeded
candidates the adverse-only exports went from 32 to 0. The lesson for the
technique is that a filter on a confirmation flag is only as symmetric as the
producer that sets the flag.

## Deviations

- **Two sections, not one impact-ordered list.** Antipatterns render as one group
  and strengths as another (`:73-86`), each with its own tone class —
  `border-coral/30` for risk, `border-moss/30` for strength (`:93-100`). The
  standard asks for one list interleaved by decision impact, because two
  colour-coded sections are read as prosecution and defence. The order is also
  fixed adverse-first, and the whole panel is headed by a coral warning icon
  (`:51`), including when it holds only strengths. The copied checklist has the
  same order.
- **The summary is an aggregate count.** `panel.summary` (`:71`) renders the
  engine's "N antipattern(s), M hidden strength(s); K need interview/work-sample
  confirmation" (`soft_signals.py:361-364`). It is honest and symmetric, and it is
  still a count of concerns at the top of a person's page — the standard's warning
  that aggregation is where a checklist turns back into a score. Leading with the
  confirmation count instead ("3 things to confirm") would carry the same
  information as an agenda.
- **No caps, no states.** Nothing bounds how many rows render, and no row has an
  open / confirmed / refuted / not-asked state or an actor who resolved it, so the
  list cannot empty as the process answers it. The engine caps only the folded
  model flags at four (`soft_signals.py:319`). With strengths now exported, a
  seeded candidate's copied list averages 1.8 lines and the longest is three,
  inside the technique's cap of five. The seeds carry no model flags, so four more
  rows can arrive on a real analysis. The cap is unenforced, not yet exceeded on
  the seeds.
- **No scope statement.** The surface never says which readings were and were not
  attempted, so five rows read as an exhaustive account of the person's risks.

## What generalizes

The parts worth copying wholesale: the panel lives on the interview surface and
nowhere near the score; every row shows its source and its confidence next to its
claim; the probe is rendered as text an interviewer can read aloud; the grounding
snippets are one disclosure away; and the copied artifact is generated from the
same filter as the engine's own checklist, so the two cannot drift apart. That
last property is also why an asymmetric flag in the engine reaches both the
clipboard and prep at once.

---
layer: application
type: application
subject: cv-authenticity-screening
technique: a-screen-is-not-a-verdict
stack: react
status: forged
verified_on: 2026-09-26
verified_against: react@19
---

# Where a screen meets the reviewer: the quality strip and the decision gate

The Python half of this technique (the screen that computes flags and acts on
none of them) is recorded in the process application beside this one. This file
is the other half: the React client and its API route, where a recruiter reads
the flags and decides. Read against a TypeScript applicant-tracking app on
React 19 (`react` `^19.3.0`, Next 16), pinned to one commit on 2026-09-26.

The technique's rule is that a machine may annotate and a person decides. This
surface realizes the second half more strictly than the standard asks. It also
shows how a mechanism built to make people read the flags can tilt the decision
it guards.

## Reading the ledger by type, not by prose

`app/_lib/sanity-checks.ts:1-7` states the contract: each finding is "coded at
birth by its Python producer", every reader "goes by severity/scope", and the
old regex over the English sentence is "the LEGACY reader for payloads saved
before the field existed … Do not extend it; code the finding." The legacy
regex survives only for stored payloads with no `trustFindings`
(`:18-19`, used at `:45` and `:88`).

The band chip mirrors the Python count (`authenticityBand`, `:76-92`): coded
findings on the `authenticity` scope, warned or not, give high, medium or low,
and `null` when no authenticity check ran. An analysis that never ran the screen
gets no chip at all rather than a default "high", the standard's rule that a
check which did not run never renders as a pass. Injection findings sit on
another scope and cannot move the band, and a test pins that
(`app/_lib/sanity-checks.test.ts:112-121`).

## The strip: notes in the grammar of notes

`app/_components/results/QualityStrip.tsx` renders the ledger above the result.

- **A clean run is one quiet line** (`:46-58`): "All N quality checks passed",
  the band chip, and the passing lines behind a toggle.
- **Any warning makes an amber notice** with a count pill (`:61-74`), and the
  warnings are listed **always**, not behind a toggle (`:72`). The band chip
  sits in the same row as the notes it counts, so the standard's rule that a
  band must expand to its notes in one interaction is met with zero.
- **The notes are the engine's own sentences**, shown verbatim under a label
  saying they are engine text and not translated (`:94-99`), so a reviewer
  reading a localized page knows which half is machine output. Every
  authenticity note is phrased as a probe ("verify concrete specifics in
  interview").
- **Nothing sorts, filters, ranks or routes on the band.** It is read in one
  place, the chip (`:31`). The count of open warnings reaches the history table
  as a single pill (`app/features/tools/analyze/history/HistoryTable.tsx:87-94`)
  that lumps authenticity with every other warning.

## The decision gate: a flag must be read before an advance

`app/_components/results/decisionBrief.ts` is the mechanism this surface adds.
Its header (`:1-11`) names the failure it fixes: the warnings used to sit one
panel below the buttons, so "'Advance' on a run whose ledger said 'verify
before advancing' was one silent click, indistinguishable afterwards from an
advance on a clean run."

- `decisionGate` (`:61-79`): **advance** requires every open warning to be
  acknowledged. **Hold** and clearing need nothing. **Pass** on a strong read
  needs a stated reason.
- The client renders one checkbox per open warning under "Open flags: tick each
  one you have checked before advancing" and blocks the pick until they are
  ticked (`DispositionEditor.tsx:114-121`, `:212-227`).
- The API route re-derives the brief from the **stored** payload and refuses an
  unacknowledged advance with `409 DISPOSITION_ACK_REQUIRED`
  (`app/api/analyses/[slug]/route.ts:125-129`). A client cannot acknowledge a
  warning the engine never raised (`decisionBasis`, `decisionBrief.ts:88-99`).
- The acknowledgement becomes part of the record: the disposition event carries
  "N flags acknowledged" (`app/_lib/db/pipeline.ts:1805-1808`), "so a flagged
  advance reads differently from a clean one".

This is the technique's "do not run screens whose output nobody reads", made
mechanical, and "a flag names its reviewer's next action", made a precondition.
The acknowledgement is not a verdict: the recruiter who ticks the box still
advances the candidate.

## Deviations

- **The friction points one way.** A candidate carrying open flags can be
  passed on any read below the strong line (75) with no acknowledgement and no
  reason, while advancing them needs every flag ticked. Where the read is
  strong, the pass reason is checked only in the client. The route enforces the
  acknowledgement (`route.ts:127`) and not the reason. So the flags the
  technique forbids from routing a rejection make rejection the cheaper click
  for a recruiter under load. That is not an automated adverse outcome, but it
  is a nudge toward one, and it lands hardest on exactly the candidates the
  screen fires on wrongly. The symmetric form records what a pass was decided
  against as well, and enforces it at the same boundary.
- **The band speaks in measurement grammar.** The chip reads "Authenticity:
  high / medium / low" in green, amber or coral with a shield icon
  (`QualityStrip.tsx:80-89`; `messages/en.json:7355-7357`). The count of notes
  is shown as a rating of the document's authenticity. "Authenticity: low" is
  the phrase this technique exists to keep off a candidate's record.
- **Authorship is named at the point of use.** The chip's tooltip reads "CV
  authenticity screen: a deterministic check for AI-generated / embellished
  résumés" (`en.json:7354`, the same in cs, de, fr). The screen's measurements
  say nothing about authorship. The recruiter-facing description says they do,
  and machine drafting is not a finding.
- **Injection flags look like every other warning.** They are listed with the
  same icon and colour as a salary-range note (`CheckList`, `:91-114`). The one
  finding the record may state as fact is rendered in the same grammar as the
  inferences, and the acknowledgement checkbox treats them identically.
- **No test renders the strip or the chip,** and the decision-gate tests use
  credential and score warnings, never an authenticity or injection finding
  (`decisionBrief.test.ts`).

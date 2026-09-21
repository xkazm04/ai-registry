---
layer: application
type: application
subject: lead-quality-and-source-diagnosis
technique: quality-score-qualification-and-win
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Quality score, junk rule and cost-per-qualified drift - pure lead-quality math with an ungated alert

Verified against the Czech-first marketing workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08), Node 24. Anchors:
`src/lib/lead-quality/compute.ts` (score `:34, :49-50`; drift `:196-198, :308-322`),
`src/lib/lead-quality/import.ts:14-30, 155-179` (import aliases and cumulative
counting), `src/lib/lead-signals/summary.ts` (the report grounding block),
`src/components/app/modules/LeadQualityModule.tsx:110-114` (score bands) and
`src/components/app/modules/leads/FunnelBySourceCard.tsx:29-34` (step tones).

## The structural fact the tree proves and the one it refutes

`withMetrics()` (`compute.ts:36-52`) is the technique's procedure in eleven lines:
stage rates on adjacent denominators (`qualRate = qualified / leads`, `winRate = won /
qualified`), cost per lead and cost per qualified lead beside them, and
`qualityScore = round(100 x (0.6 x qualRate + 0.4 x winRate))` (`:49`). The junk
predicate is one exported constant, `JUNK_QUAL_RATE = 0.35` (`:34`), and the flag is
`spend > 0 && qualRate < JUNK_QUAL_RATE` (`:50`) - paid only, one threshold, exported
"so the UI's picker keys off the same single threshold instead of duplicating the
literal" (`:31-33`). Absence is rendered as absence: `roi` is `null` for an unpaid
source, with the comment that `Infinity` would be serialised to null and formatted as
an infinity sign (`:21-24`).

The refutation is in the drift watch. `CPQL_ALERT_RISE = 0.25` (`:196`) fires a
warning whenever `cpqlDelta > riseThreshold` (`:308-315`) and `CPQL_TARGET_CZK = 900`
(`:198`) fires a critical whenever the current cost per qualified lead exceeds it
(`:316-322`). **Neither alert tests a sample size.** `relDelta` (`:202-204`) guards
only against a zero prior; `sourceTrend` (`:226-243`) carries counts but the alert
never reads them. A source with six qualified leads last period and four this period
raises a "rose by 50 %" warning with the same badge as one on two hundred. The
technique's standard - the drift alert carries the same per-stage floor as a verdict
and renders "thin" otherwise - is not met, and the junk flag itself has no floor
either: `withMetrics` flags a paid source with five leads and one qualified as junk,
while the diagnosis floor at `MIN_LEADS_FOR_SIGNAL = 30` would call the same source
"volume". Two verdicts on one row, as `junk-source-rule` warns.

## Upward lessons taken from the tree

**Cumulative stage counting.** `aggregateLeads` (`import.ts:166-179`) increments
`qualified` for any row whose stage rank is at or above qualified and `won` for won
rows, so a record imported at "won" counts at every earlier stage; the doc comment
says "a won lead counts toward qualified + opportunity too". Without it the
qualification rate of a closing source would fall as it closed. The golden path's
denominator section is this lesson.

**Spend zero is honestly omitted, and a single import has no drift.** The same
comment records that an exported pipeline carries no ad spend, so cost per lead and
cost per qualified lead render as a dash downstream, and that one import has no
`prior`, so no drift alert can fire - absence as absence, twice.

**Illustrative data scales counts, never ratios, and never live rows.**
`scaleSourcesToLeads` (`summary.ts:19-70`) rescales the sample spine so the narrative
total matches the report tile, assigns the rounding residual to the largest source,
then clamps each stage to its parent because independent rounding "can break the
funnel invariant ... or flip a source's junk flag vs the on-screen table" (`:43-47`).
`leadSignalsText` applies it only when `!live` (`:83-84`); imported leads "are ground
truth and are never rescaled" (`:74-75`).

## Confirmed craft

- The report grounding block speaks the lead-generation numbers - leads, qualified,
  won, blended cost per lead and per qualified lead, the junk sources with their
  two numbers, the best source by score with its inputs, velocity - rather than
  e-commerce revenue (`summary.ts:96-119`), and labels live versus illustrative in the
  header (`:93-95`).
- Score bands at sixty and forty (`LeadQualityModule.tsx:110-114`) and funnel-step
  tones at a half and a fifth (`FunnelBySourceCard.tsx:29-34`) are display
  conventions; the module's delta tone has a half-percent dead-band so tiny wiggles
  do not flash (`LeadQualityModule.tsx:116-120`).
- Import headers and stage values accept Czech and English aliases with diacritics
  folded (`import.ts:14-33`), so a pasted export from any pipeline tool lands on the
  same four stages.

## The deviation the standard keeps

The weights (`0.6 / 0.4`), the junk threshold, the alert rise and the target are
asserted constants with no calibration and, for the target, a currency anchor. The
`AlertOptions` overrides (`compute.ts:279-284`) let a caller change the rise and the
target per project, which is the right seam; nothing in the tree yet fills it from
the business's deal value, and no surface says "convention" beside the score.

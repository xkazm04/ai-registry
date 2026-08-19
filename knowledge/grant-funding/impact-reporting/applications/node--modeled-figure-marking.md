---
layer: application
type: application
subject: impact-reporting
technique: modeled-figure-marking
stack: node
status: forged
---

# Node: marking the modeled figure at the formatter

The grant-writing-nonprofits app models "jobs enabled" as awarded dollars
divided by a $/FTE-year constant, and pins the honesty of that estimate at the
one place every surface passes through: the formatter.
`src/features/impact-metrics/computation.ts`, lines 141-152:

```ts
// "Jobs enabled" is a MODELED figure (dollars ÷ a $/FTE-year constant), not a
// headcount, so the formatted value carries a "≈" marker — it travels to every
// surface that shows the number (dashboard, board PDF, public pages), keeping
// the estimate honest right on the figure instead of only in a footnote.
export function formatJobsEnabled(fteYears: number): string {
  if (fteYears < 1) {
    return fteYears > 0 ? "<1 FTE" : "0 FTE";
  }
  return `≈${fteYears.toFixed(1)} FTE`;
}
```

The `<1` branch is the "mark to inform, not decorate" refinement — a bound
already reads as approximate, so it takes no extra glyph.

## The rules around the model, in the same module

- **Guarded denominator** — `computeImpactFromDrafts` (lines 26-31) refuses a
  non-finite/zero/negative rate and falls back to `DEFAULT_USD_PER_FTE_YEAR`:
  "Better than emitting Infinity into the UI." The certificate builder
  (`src/features/match-certificate/impact.ts:59-62`) repeats the same guard at
  its own boundary.
- **Real inputs only** — `isCountableAward` (lines 15-17) is the single
  countability predicate: `status === "awarded"` with a positive amount. The
  comment at lines 12-14 states the sharing rule: "Used by BOTH the aggregate
  filter and the per-funder breakdown loop so the two can never drift" —
  `computeImpactReport` (lines 96-128) reuses the aggregate and the same rate
  for its per-funder rows, and buckets blank funders under `"Unattributed"`
  "so dollars are never silently dropped" (line 104-108).
- **Parameters recoverable** — the modeled figure's note in the impact
  certificate spells the model out to the reader:
  `impact.ts:84` — "`≈X FTE` of nonprofit labor funded (modeled estimate),
  computed at $Y per FTE-year."
- **Bounded input detection** — `warnIfImpactTruncated`
  (computation.ts:58-67) logs when the 500-draft pull hits its cap, so a
  silently truncated total is at least detectable until a scoped-sum query
  replaces it.

## Where the marked figure travels

The dossier builder (`src/app/verify/org/[orgId]/dossier.ts:49-90`) carries
`fteYears` onto the public no-login page, and the impact certificate embeds it
per grant — both render through the same formatter, so no unmarked copy of
the number exists anywhere in the product. That is the technique's core move
realized structurally: honesty attached to the value's only formatter, not to
each surface's discipline.

---
layer: application
type: application
subject: impact-reporting
technique: report-calendar-derivation
stack: node
status: forged
---

# Node: deriving the reporting calendar from the period label

The grant-writing-nonprofits app (a Next.js/TypeScript product) implements the
full derivation chain in one pure module,
`src/features/award-reports/types.ts`, with no schema change: the due date is
derived from the already-stored `periodLabel`, so pre-existing report records
gained a calendar the day the code shipped (the header comment at lines 84-88
states this retrofit goal explicitly — "no new column / migration, works for
old records").

## The chain, step by step

- **Period notation → period end** — `reportPeriodEnd` (lines 97-108) parses
  exactly two strict notations: `/^FY(\d{4})$/` → Dec 31 UTC of that year, and
  `/^Q([1-4])\s+(\d{4})$/` → the quarter's last day via the day-zero trick
  `Date.UTC(year, quarter * 3, 0)`. Anything else returns `null` — no fuzzy
  parsing, no guessed dates. All arithmetic is UTC, satisfying the
  fixed-timezone rule.
- **Period end + grace → due date** — `reportDueDate` (lines 111-118) adds
  `REPORT_GRACE_DAYS = 30` (line 90, commented "funders typically allow ~30
  days after period end") as a default parameter, so a funder-stated deadline
  can override the convention at the call site.
- **Due date → bucket** — `reportBucket` (lines 122-133) maps to the union
  `"submitted" | "overdue" | "due_soon" | "upcoming"` (line 93). Submitted
  short-circuits first; `REPORT_DUE_SOON_DAYS = 14` (line 91) sets the
  warning window; `Math.ceil` on the day count rounds toward the alarm.

## The false-alarm rule, verbatim

Line 121's comment is the technique's decision rule in production: "an
unparseable due date never raises an alarm (treated as upcoming)" —
`if (!dueIso) return "upcoming";`. Garbage labels degrade to quiet visibility
instead of a false "overdue".

## The current-period rule

`defaultPeriodLabel` (lines 70-82) encodes "the current period is never
reportable": a quarterly report created in-quarter defaults to the *previous*
quarter, and Q1 wraps to `Q4 ${year - 1}` of the prior year — the report
covers the period that just ended, never the one still running.

## Transplant notes

Everything is a pure function of `(periodLabel, status, now)` with `now`
injectable — trivially unit-testable and portable to any runtime. To adopt:
keep the strict closed notation (extend the regex set deliberately, per
funder fiscal calendars, rather than loosening it), and keep the grace
constant as an overridable default so captured real deadlines always win.

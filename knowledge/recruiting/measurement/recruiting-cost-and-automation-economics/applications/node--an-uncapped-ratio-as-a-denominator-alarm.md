---
layer: application
type: application
subject: recruiting-cost-and-automation-economics
technique: an-uncapped-ratio-as-a-denominator-alarm
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# Removing the cap that made a broken model look excellent

`app/_lib/automation-roi.ts` computes `pctOfManualBaseline` — the share of a
hire's manual recruiter effort the automated event trail offset. It used to be
wrapped in `Math.min(100, …)`. The comment recording the removal
(`automation-roi.ts:112`) is the technique's own argument, arrived at from an
incident rather than from a principle:

> NOT capped. The old `Math.min(100, …)` was defended as "you can't offset
> more than the full manual effort", which is true of the CONCEPT and false of
> the ARITHMETIC: this ratio also exceeds 100 when the denominator is wrong (a
> mixed-basis hire count) or when the org's baseline is set too low. The cap
> rendered 437% as a clean, plausible 100% — it hid the one reading that
> proves the number needs looking at.

437 rendering as 100 is the whole technique in one observation. The clamp did
not produce a wrong number in the usual sense — it produced a *plausible* one,
which is worse, because a plausible number is never investigated. The type
declares the property where a consumer will see it (`:68-70`): "Share of the
manual per-hire effort offset, as a percentage. UNBOUNDED ABOVE — see the note
at the computation: a figure over 100 is a real signal, not an overflow to be
tidied away." (Every citation here is to kp at its committed `0c6c9e39c`, read
on 2026-09-29; the comment at `:112-117` still ends "An implausible figure now
shows itself; that is the signal.")

## The two named breach causes are both real defects in this repo's history

**Mixed-basis denominator.** `app/_lib/db/analytics.ts:108-115` (the field) and
`:770-787` (the query) carry the fix:
`hired` is a *creation-cohort* count (entries created in the window that now
stand on a terminal stage) while the ROI numerator `kindCounts` is
*event-time* (work that happened in the window). The function's own contract
(`automation-roi.ts:80-83`) now states it as a precondition — "`hires` MUST be
counted on the same basis as `kindCounts` — hires that CLOSED in the window,
since kindCounts is events that HAPPENED in it" — and a second field,
`hiresClosedInWindow`, exists purely so every event-time per-hire figure has a
denominator on its own basis. Feeding the cohort count divided a full window of
automated work by whatever fraction of its hires happened to also start inside
the window; the ratio breached, and the cap swallowed it.

The comment at `:770-787` now records the reproduction that found it: a 44-day
time-to-hire inside a 30-day window, 6 hires closed and only 1 in the creation
cohort, so the ROI read 100% of the manual baseline against an honest 31%, and
compute read $62.40 a hire against an honest $10.40. Six times 31% is about 186%
(our arithmetic beside the comment, not a figure it prints), a reading only a
cap could show as 100: the incident is the clamp hiding exactly the number that
needed to be seen.

**A baseline set too low.** `MANUAL_HOURS_PER_HIRE = 42` is documented as a
research mid-point (`automation-roi.ts:36-46`: "Research anchor: ~40–51 h total
per hire (≈23 h of it screening, ~13 h sourcing); 42 is the defensible
mid-point"), and an
organisation may replace it via the reserved `MANUAL_HOURS_TARGET_KEY` row
(`analytics-target-keys.ts:25`, `"manual_hours_per_hire"`, capped at 1000 h at
`:40`), which the call site now genuinely threads through (`analytics.ts:914-918`
passes `targetValues.get(MANUAL_HOURS_TARGET_KEY)` alongside
`hiresClosedInWindow`) and which a settings input on the panel sets
(`AnalyticsAutomationPanel.tsx:178-184`, `metric={MANUAL_HOURS_KEY}`). An org that sets its own baseline low pushes the ratio
up — which is exactly the case the alarm exists for, and exactly the case a cap
would have concealed while making the product look better.

The default itself is the weak part. The anchor is called a research mid-point but
names no source, and on inspection its components have none that could be found:
the 23 and 13 hours circulate on vendor pages with no study, one page stating the
13 as hours per week per role. The baseline technique's rule applies to kp's own
constant: it is an unsourced default, not a citation, and the panel does not say
so. The org-settable override (above) is what makes that survivable.

## The upward lesson this repo taught, and the one it still owes

The comment at `automation-roi.ts:42-44` (its twin at `analytics.ts:911-913`
reads "pinned the '% of manual effort offset' claim to a constant a customer could
neither see nor contest") is the sharper half of the story:

> "override-able" was true of the signature and false of the product: no call
> site passed the parameter, so the org's own anchor could not reach it.

`manualBaselineHoursPerHire` had shipped as the fourth parameter of
`automationRoi` with a default, and nothing in the application ever supplied
it — so the percentage the panel printed was measured against a constant no
customer could contest, while the code read as configurable to anyone
reviewing it. That is why the technique's companion rule now demands the
override be traced end to end (stored row → read path → call site → surface),
not merely accepted by a signature.

Where the repo falls short of the technique: the breach is not *routed*. Rule
4 asks that a ratio above the bound alarm the engineering team with its inputs
attached, since a breach is a production defect report with a full repro case.
Here the uncapped value reaches the panel and the honest rendering
(`AnalyticsAutomationPanel.tsx:145` prints the raw percentage), no flag on a value
over 100 was found anywhere in the tree, and the diagnosis depends on somebody
looking. The other half — the per-kind
breakdown that would make a breach diagnosable — does exist: `actions[]`
(`automation-roi.ts:56`, typed at `:48-53`) carries `kind`, `count`, `minutesEach` and `minutesTotal`, sorted by
time saved, so a breach report has everything it needs the moment anyone
decides to emit one. The standard stays; the wiring is missing.

## Adjacent honesty the same file keeps

`hoursSavedPerHire` and `czkSavedPerHire` are `null` rather than a large number
when `hires` is zero (`:106`, "null (honest gap, mirroring cost-per-hire)
instead of inflating a tiny denominator"), and `pctOfManualBaseline` inherits
the null. A ratio that refuses at zero and breaches loudly above the bound is
the pair the technique asks for: the uncapping is only safe because the
divide-by-nothing case was already refusing.

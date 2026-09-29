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
manual per-hire effort offset, as a percentage. UNBOUNDED ABOVE — a figure
over 100 is a real signal, not an overflow to be tidied away."

## The two named breach causes are both real defects in this repo's history

**Mixed-basis denominator.** `app/_lib/db/analytics.ts:769-820` carries the fix:
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

**A baseline set too low.** `MANUAL_HOURS_PER_HIRE = 42` is documented as a
research mid-point (`automation-roi.ts:36-46`: "~40–51 h total per hire, ≈23 h
of it screening, ~13 h sourcing; 42 is the defensible mid-point"), and an
organisation may replace it via the reserved `MANUAL_HOURS_TARGET_KEY` row
(`analytics-target-keys.ts:25`), which the call site now genuinely threads
through (`analytics.ts:914-918` passes `targetValues.get(MANUAL_HOURS_TARGET_KEY)`
alongside `hiresClosedInWindow`). An org that sets its own baseline low pushes the ratio
up — which is exactly the case the alarm exists for, and exactly the case a cap
would have concealed while making the product look better.

## The upward lesson this repo taught, and the one it still owes

The comment at `automation-roi.ts:42-45` is the sharper half of the story:

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
Here the uncapped value reaches the panel and the honest rendering, and the
diagnosis depends on somebody looking. The other half — the per-kind
breakdown that would make a breach diagnosable — does exist: `actions[]`
(`:56`, typed at `:48-53`) carries `kind`, `count`, `minutesEach` and `minutesTotal`, sorted by
time saved, so a breach report has everything it needs the moment anyone
decides to emit one. The standard stays; the wiring is missing.

## Adjacent honesty the same file keeps

`hoursSavedPerHire` and `czkSavedPerHire` are `null` rather than a large number
when `hires` is zero (`:106-107`, "null (honest gap, mirroring cost-per-hire)
instead of inflating a tiny denominator"), and `pctOfManualBaseline` inherits
the null. A ratio that refuses at zero and breaches loudly above the bound is
the pair the technique asks for: the uncapping is only safe because the
divide-by-nothing case was already refusing.

## Re-read 2026-09-29: the breach has no display state

At kp f63450548 the computation is unchanged (uncapped, null at zero hires,
`roi.hoursSavedPerHire` and `pctOfManualBaseline` from `hiresClosedInWindow`,
`analytics.ts:909-919`), and the test fixture still pins 317% as reported, not
tidied (`automation-roi.test.ts:89-93`). What the technique's third rule asks
for is not there: `AnalyticsAutomationPanel.tsx` prints
`roi.pctOfManualBaseline` straight into the sentence "about {pct}% of the ~{baseline} h
a hire takes by hand" and into the leadership tile, with no threshold and no
alternative state. A workspace at 317% would read "about 317% of the ~42 h a hire
takes by hand" as good news. The value is uncapped and the display is not
defended, which is the reverse of the technique's own statement that the value is
uncapped while the *display* has a defined state for the breach. A blind lane
proposed the opposite trade (clamp the display, flag it, keep the raw value in an
audit view); the technique already allows suppressing the display and forbids
suppressing the value, so that lane's rule is a permitted rendering, not a
refutation, and the technique stands unchanged.

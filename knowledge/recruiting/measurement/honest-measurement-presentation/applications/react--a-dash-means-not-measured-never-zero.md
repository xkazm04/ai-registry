---
layer: application
type: application
subject: honest-measurement-presentation
technique: a-dash-means-not-measured-never-zero
stack: react
status: forged
verified_on: 2026-09-29
verified_against: react@19
---

# One finiteness gate, and a whole grammar of hiding

Two surfaces in this repo carry the technique, at opposite ends of the
audience: the analytics tab, where a dash must read as *not measured*, and the
public `/market` page, where a missing open-data figure must read as nothing at
all. Citations are at kp `24006b85e`.

## The em-dash rule, stated as doctrine

`docs/features/analytics/README.md:1210` opens the honesty-rules list —
explicitly "load-bearing, not stylistic" — with the exact claim:

> an unknown cost renders as `—`, never `$0` ("free" and "unpriced" are
> different facts)

The list has grown since it was first read here: an unknown threshold floor
renders `—` rather than `0`, a rate with no cohort behind it renders `—`, and
capped tables say what they dropped. The first-run empty state previews the
metrics with literal em-dashes and never fabricates sample figures
(`AnalyticsEmptyPreview.tsx`), which is rule 7 of the technique, shipped. The
UAT record (`docs/product/uat-insights/2026-08-17-analytics-sections.md:122`,
guardrail G10) quotes the sentence the surface actually shows a recruiter:
*"Pomlčka ve sloupci Útrata znamená, že se u tohoto typu zdroje neměří, ne že
byl zdarma"* — a dash in the Spend column means this source type is not
measured, not that it was free. It ships as `boardSpendNote`
(`sections/EconomicsBoard.tsx:332`). That is rule 5, the reason travelling with
the glyph, in the reader's own language. It is also the only place on the
analytics surface that says what the dash means (see the deviations).

## `isFigure` — finiteness, not nullness

`app/landing/spark/market/data.ts:194` is the single gate, and its doc comment
is the technique's rule 6 discovered the hard way:

> True only for a number we would be willing to print. `Number.isFinite`
> rather than a null check: NaN and ±Infinity fall out of the scale maths below
> (an empty array makes `Math.min()` return Infinity), and printing "NaN Kč" on
> a public page is worse than printing nothing.

Every formatter routes through it and returns the same em dash for a
non-figure, so one glyph carries one meaning across the page. The colour
helpers (`heatColor` `:271`, `salaryColor` `:282`) clamp non-finite input
rather than propagating it, after `heatColor(NaN)` used to destructure
`undefined` and throw, "taking the whole map down client-side"
(`docs/features/marketing/README.md:499`).

## A missing figure has no place on the scale

`regionScale` (`data.ts:298`) used to answer 0.5 for a region with no median,
and 0.5 for every region when none had one. The map painted that as the middle
of the salary ramp, so a region where nothing was measured read as an
ordinary salary, and with no values at all the legend was correctly hidden
while all fourteen regions wore the same mid green. It now returns null for a
missing figure, and `CzMap.tsx` fills null with the neutral it already used for
regions absent from the snapshot (kp `609876d1a`). Three tests on the real
snapshot pin it. This is the technique's rule that a missing value never takes
a position on a colour scale. The case was latent: every region in the current
snapshot carries a median.

## The hiding ladder, enumerated

`docs/features/marketing/README.md:445-459` lists the per-surface answers, and
they are precisely the ladder the technique describes:

- region card — the median tile disappears and **the vacancy count takes the
  full width**;
- occupation list — **the money cell goes blank but keeps its column width**;
- salary field guide — families with no median are **filtered out**, and the
  junior/lead footer **prints only the ends that exist**;
- org tiles — no pay figure, so **the opening count becomes the headline**
  (demote to a fact you do have);
- job-description cards — a floor with no ceiling reads **"From X", not a bare
  figure** (state the part you have, marked partial);
- map legend — no values behind the metric, **no legend**: it previously
  rendered the literal words "Infinity" and "NaN" *including into its
  `aria-label`*, which is the accessible-name failure named in the golden path;
- hero freshness — a missing percentage **drops the clause** rather than
  publishing "0% posted in the last 90 days".

## The producer side: three states, and no laundering

`app/_lib/metric-pack.ts:9` states the contract this surface consumes:

> measured — enough data; the value stands / thin — a real value from a sample
> below MIN_SAMPLE; shown, always labelled / not_measurable — no data at all;
> value is null, and NO number is invented

The metric layer decides the state and the surface must show it beside the
value. `MIN_SAMPLE = 8` (`:37`) is justified in place rather than asserted, and
every `Metric` carries a `sample` and a **mandatory** `basis` (`:55`).

The sharpest line is the input comment at `metric-pack.ts:109`: candidate NPS is
passed as `rawScore`, *the unwithheld figure*, not the already-suppressed
`score`, because the pack "applies its own sample policy and labels a thin
metric rather than hiding it, which keeps the invariant that a null value
always means 'no data' and never 'we chose not to say'." That is the
withheld-is-not-absent rule, and it is the reason the two silences stay
distinguishable all the way to the screen.

`certifiable` (`metric-pack.ts:84`) is the artifact-level gate — true only when
every metric is `measured`, with `caveats` naming why not. UAT guardrail G7
(`:107`) freezes the whole contract, including "the flat refusal to compute a
'% improvement vs before' kp has no baseline for" and the two-currency rule: a
USD ledger and CZK spend side by side, never summed, reason printed.

## Deviations

**The dash says what it means in one column.** The analytics tab renders in
en, cs, de and fr, and Czech and German readers are trained by their
statistical offices to read a dash in a table as *nothing occurred, zero*. The
only on-screen statement of the dash's meaning is `boardSpendNote`, for the
Spend column. The not-measured dashes elsewhere on the tab (the stat cluster,
the automation, compute-cost, calibration and org-benchmark panels, the by-role
table) carry no legend. None of them carries an accessible name, so a screen
reader passes over them in silence: in Deque's testing NVDA reads straight
through an em dash and VoiceOver pauses without saying anything. The only annotations are a `title` on one
by-role cell and a `data-tip` in the journey lanes. The catalogs already hold
`notMeasured` ("not measured" / "neměřeno"), used today only in hiring
settings.

**Not applicable shares the not-measured mark.** `metric-pack.ts` has three
states, and none of them is *not applicable*. A rate over an empty cohort
renders `—`, the same mark as an unpriced cost (the README's list says both),
so "nobody entered this stage" and "we do not track this" read identically.

**The same state wears a different mark on the same stage.** In
`app/features/insights/matrix/focus/MatchJobCompare.tsx` (`:125`, `:138`) the
dash stands for an empty list of matched skills, a measured zero, and for a
list that was never produced (`undefined` coalesced to a length of 0). The
list behind it is capped at eight with no "+N more".

**The region remainder is still in the docs only.**
`docs/features/marketing/README.md:579` records that region vacancy counts
sum to ~35 200 against a national total of ~38 600, because postings with no
region are unattributed. The hero prints the national figure
(`MarketPulseApp.tsx:123`); the map and its top-five list show only
attributed counts, and no remainder row renders. A reader adding the regions
still lands short of the headline.

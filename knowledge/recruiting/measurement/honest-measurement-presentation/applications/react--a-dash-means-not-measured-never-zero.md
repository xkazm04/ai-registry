---
layer: application
type: application
subject: honest-measurement-presentation
technique: a-dash-means-not-measured-never-zero
stack: react
status: forged
verified_on: 2026-08-20
---

# One finiteness gate, and a whole grammar of hiding

Two surfaces in this repo carry the technique, at opposite ends of the
audience: the analytics tab, where a dash must read as *not measured*, and the
public `/market` page, where a missing open-data figure must read as nothing at
all.

## The em-dash rule, stated as doctrine

`docs/features/analytics/README.md:524` opens the honesty-rules list —
explicitly "load-bearing, not stylistic" — with the exact claim:

> an unknown cost renders as `—`, never `$0` ("free" and "unpriced" are
> different facts)

and closes it with "the first-run empty state previews the metrics with literal
em-dashes and never fabricates sample figures (`AnalyticsEmptyPreview.tsx`)" —
rule 7 of the technique, shipped. The UAT record
(`docs/product/uat-insights/2026-08-17-analytics-sections.md:77`, guardrail
G10) quotes the sentence the surface actually shows a recruiter: *"Pomlčka ve
sloupci Útrata znamená, že se u tohoto typu zdroje neměří, ne že byl zdarma"* —
a dash in the Spend column means this source type is not measured, not that it
was free. That is rule 5, the reason travelling with the glyph, in the
reader's own language.

## `isFigure` — finiteness, not nullness

`app/landing/spark/market/data.ts:158` is the single gate, and its doc comment
is the technique's rule 6 discovered the hard way:

> True only for a number we would be willing to print. `Number.isFinite`
> rather than a null check: NaN and ±Infinity fall out of the scale maths below
> (an empty array makes `Math.min()` return Infinity), and printing "NaN Kč" on
> a public page is worse than printing nothing.

Every formatter routes through it — `fmtInt` (`:161`), `fmtCzk` (`:165`),
`fmtCzkShort` (`:177`), `fmtDate` (`:169`) — and each returns the same em dash,
so one glyph carries one meaning across the page. The scale helpers
(`:200`, `:214`, `:230`) clamp non-finite input rather than propagating it,
after `heatColor(NaN)` used to destructure `undefined` and throw, "taking the
whole map down client-side" (`docs/features/marketing/README.md:311`).

## The hiding ladder, enumerated

`docs/features/marketing/README.md:300-309` lists the per-surface answers, and
they are precisely the ladder the technique describes:

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

Two families never render at all — one has no source coverage, the other is
`0` across the board until consecutive snapshots differ — and the momentum
badge "treats `0` as *no change measured*, not as an increase". The mirror
rule holds too: a measured zero stays a zero.

## The producer side: three states, and no laundering

`app/_lib/metric-pack.ts:9` states the contract this surface consumes:

> measured — enough data; the value stands / thin — a real value from a sample
> below `MIN_SAMPLE`, shown, always labelled / not_measurable — no data at all;
> value is null, and NO number is invented.
>
> A pack renderer must show the status beside the value.

That last sentence is the division of labour: the metric layer decides the
state, the surface must show it. `MIN_SAMPLE = 8` is justified in place rather
than asserted, and every `Metric` carries a `sample` and a **mandatory**
`basis` — "a metric whose basis cannot be stated cannot be defended in a
procurement conversation" (`metric-pack.ts:53`).

The sharpest line is the input comment at `metric-pack.ts:78`: candidate NPS is
passed as `rawScore`, *the unwithheld figure*, not the already-suppressed
`score`, because the pack "applies its own sample policy and labels a thin
metric rather than hiding it, which keeps the invariant that a null value
always means 'no data' and never 'we chose not to say'." That is the
withheld-is-not-absent rule, and it is the reason the two silences stay
distinguishable all the way to the screen.

`certifiable` (`metric-pack.ts:60`) is the artifact-level gate — true only when
every metric is `measured`, with `caveats` naming why not. UAT guardrail G7
freezes the whole contract, including "the flat refusal to compute a '%
improvement vs before' kp has no baseline for" and the two-currency rule: a USD
ledger and CZK spend side by side, never summed, reason printed.

## Deviation

`docs/features/marketing/README.md` records that region vacancy counts sum to
~35 200 against a national total of ~38 600, because postings with no region
are unattributed: "The hero states the true national figure; the map cannot be
reconciled to it." The gap is disclosed in the docs but the unattributed
remainder does not render as its own row on the map surface, so a reader adding
the regions still lands short of the headline. The standard asks for the
remainder to be accounted for where the reader can see it.

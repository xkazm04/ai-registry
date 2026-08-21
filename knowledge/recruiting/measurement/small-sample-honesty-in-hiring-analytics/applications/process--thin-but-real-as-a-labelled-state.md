---
layer: application
type: application
subject: small-sample-honesty-in-hiring-analytics
technique: thin-but-real-as-a-labelled-state
stack: process
status: forged
verified_on: 2026-08-20
---

# The three-state contract, and the process that stops it eroding

kp's realization of the thin state is not only a type — it is a type plus a
written constraint that forbids future work from removing it. Both halves are
needed, because the thin state is the one a product organization is always
tempted to delete: it is the state that stops a good-looking number from being
published.

## The contract

`app/_lib/metric-pack.ts:9-19` states it as a header comment before any code,
under the heading "THE HONESTY CONTRACT (why this is not just four numbers)":

> a marketing number computed off two hires is a lie with a decimal point. Every
> metric here carries its own `status`:
>
> - `measured` — enough data; the value stands
> - `thin` — a real value from a sample below MIN_SAMPLE; shown, always labelled
> - `not_measurable` — no data at all; value is null, and NO number is invented

The three states are the `MetricStatus` union at `:42`, and the distinction the
technique insists on is carried in the value shape: `thin` keeps its number
(*"shown, always labelled"*), `not_measurable` nulls it. `:46` makes the
invariant explicit — *"value is null iff status is not_measurable"* — so a null
in this structure always and only means "no data", never "we chose not to say".

That second reading is made load-bearing at `:76-79`, where the pack takes the
candidate satisfaction figure as the **unwithheld** `rawScore` rather than the
already-suppressed `score`, precisely so the pack *"applies its own sample policy
and labels a thin metric rather than hiding it, which keeps the invariant that a
null value always means 'no data' and never 'we chose not to say'."* An upstream
module that suppresses on the caller's behalf destroys the distinction between
thin and not-measurable; the pack refuses that input and does its own labelling.

Two supporting fields complete the contract:

- `sample: number` on every metric (`:51`) — *"how many observations back it —
  the number a reader needs to judge the value"* — present on healthy metrics
  too, not only on weak ones.
- `basis: string` (`:52-54`), mandatory, *"never omitted: a metric whose basis
  cannot be stated cannot be defended in a procurement conversation."*

And the aggregate bit at `:243`: `certifiable: metrics.every((m) => m.status ===
"measured")`, with `caveats` (`:61`) carrying the plain-language reasons —
`caveatThin(metric, sample)` and `caveatNotMeasurable(metric, basis)`
(`:117-118`). A thin metric is shown *and* blocks publication, which is exactly
the constraint that distinguishes a real thin state from a decorative label.

## The process half: constraints on all future measurement work

`docs/product/uat-insights/2026-08-17-analytics-sections.md:72-127` converts the
strengths found in a user-acceptance pass into ten guardrails — *"Not
compliments. Conditions every item must satisfy"* — placed **above** the design
backlog so that every proposed improvement below is bound by them. Two govern
this technique directly:

- **G1** (`:77-86`) — *"The honesty gate stays the headline, never a caveat."*
  It pins `MIN_CALIBRATION_OUTCOMES = 20`, the refusal to draw a curve below it,
  and the per-quarter "not enough results yet" state on a workspace whose
  all-time arm reports `calibrated: true` — the per-cohort gating outcome where
  parent and child legitimately disagree. The recruiter's own words are recorded
  as the rationale: *a curve fitted through a handful of points would project a
  confidence this data does not have.* Any future calibration work must preserve
  the under-data verdict **as the headline**, not demote it to a footnote.
- **G7** (`:107-115`) — *"Do not touch the metric-pack contract"*: the per-metric
  `measured|thin|not_measurable`, the sample, the mandatory `basis`, the
  `certifiable` gate, the hours-saved metric sampled in actions rather than
  hires, and *"the flat refusal to compute a '% improvement vs before' kp has no
  baseline for."*

The mechanism worth copying is the ordering. A backlog that lists honesty
behaviours as *features* invites a later trade against velocity; a backlog that
lists them as *preconditions every item below must satisfy* does not. The
guardrails are also traced to the individual findings that produced them
(`KAT-ANA-14`, `LUC-ANA-S08`, `KAT-ANA-12`), so a future reviewer can reconstruct
why a constraint exists rather than deleting it as unexplained.

## The register that carries the state to the reader

G10 (`:118-127`) preserves the wording conventions that make the states legible
without a legend — the em-dash rule, the "not yet" branches, and a
verdict-as-instruction register: *"nobody has been hired yet, so there is nothing
to report"*, *"a dash in the spend column means this source type is not measured,
not that it was free"*, *"keep a human on rejections until this improves"*. That
second sentence is the not-measurable/zero distinction rendered in one line of
recruiter-facing prose. The guardrail's instruction is to *"fix what those
sentences rest on, not their register"* — the states decided here, rendered by
the honest-presentation discipline.

## Deviations

The thin state's raw-observation substitute — showing the underlying
observations in place of a derived rate below the floor — is only partially
realized. The bottleneck picker returns `null` below its floor
(`app/_lib/analytics-bottleneck.ts:20-33`) so the surface shows nothing rather
than an enumerated "here are the two candidates who have waited", and the offer
conversion nulls its rates below `MIN_OFFERS` while keeping the raw counts
available (`app/_lib/analytics-offer.ts:29-40`) — which is the right shape, but
the counts are the pack's, not a per-candidate list. The standard stands: below
the floor, the honest and more actionable output is the record itself.

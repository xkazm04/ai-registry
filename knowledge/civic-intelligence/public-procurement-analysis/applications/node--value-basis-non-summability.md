---
layer: application
type: application
subject: public-procurement-analysis
technique: value-basis-non-summability
stack: node
status: forged
---

# Node: VAT-basis composition without moving a single crown (politicas)

The politicas money surfaces render per-firm and per-politician CZK totals from a
knowledge graph harvested off the Czech contract registry. The registry publishes
value in three mutually exclusive shapes — `hodnotaBezDph` (net), `hodnotaVcetneDph`
(gross), and a foreign-currency pair — and the dump client's header states the law
flatly: "They are NOT summable with each other, and a CZK total that mixes them is
wrong" (`lib/ingest/sources/smlouvy-dump.ts:31-34`). Each shape parses into its own
field; no coercion, no fallback.

## The defect this module confesses

The harvest *does* collapse into one `amount` (`hodnotaVcetneDph ?? hodnotaBezDph`)
— but records which basis filled it as `amountBasis` on the contract node and every
`supplies` edge. Until 2026-08-13 **no surface read that field** (`grep -rn
"amountBasis" features/ app/` returned zero), so every published CZK total silently
mixed both bases across a corpus measured at 82,918 net / 36,580 gross / 2,959
foreign-currency rows (`features/money/amountBasis.ts:1-16`). The number was always
plausible — within a VAT factor of true — which is why it survived: the defect is
relational, invisible to per-row checks.

## What the fix deliberately does not do

`features/money/amountBasis.ts` is a pure module whose header enumerates its
refusals (lines 18-29): it does **not repair** (the VAT rate is not in the graph, so
conversion "would be an invented number — precisely the crime this repository exists
for"); it does **not move a single crown** (it counts rows by basis, never touches
edge weights, and a test pins that sums did not move); and an **unknown basis joins
neither side** — `unrecorded` (this graph never wrote the field), `none` (the
registry stated no value), and `ciziMena` are counted separately and never inflate
either VAT side. `none` vs `unrecorded` is itself a two-claim distinction the UI
reports: "the registry was silent" versus "we never asked" (amountBasis.ts:36-41).

## Composition as the single derived truth

`basisComposition` (amountBasis.ts:103-113) is the one place `sole`, `mixed` and
`outsideVatSplit` come into existence: `mixed` is derived exclusively from the
`VAT_BASES` pair constant (lines 45-48, "the only place the pair stands"), and
`emptyBasisComposition` makes "a firm with zero contracts" render `counted: 0` as an
answer, not a gap. The module returns catalog *keys*, not sentences
(`BASIS_COPY_KEYS`, `basisSentences`) so the client relations book and the
server-rendered MP money section speak the identical confession from one
implementation — a mixed total renders "N net / M gross" with both counts, a sole
basis names itself, and foreign-currency and unstated rows get their own lines.

## Upward lesson

The repo's contribution to the standard is rule 1's parenthesis: when a single
amount column is operationally forced, *writing the basis down at harvest time* is
what makes late repair possible. The harvest recorded `amountBasis` months before
anything read it; because the composition existed on every edge, the 2026-08-13 fix
was a pure fold over data already present rather than a re-ingest of a 26 GB dump.

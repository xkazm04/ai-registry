---
layer: application
type: application
subject: honest-proof-and-illustrative-data
technique: claims-derived-from-product-code
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Node: a typed number in pricing copy is a failing unit test

Workspace `systedo-case` at commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08). Three marketing surfaces derive their claims from the code that
ships them, and one of them is pinned by a unit test that fails on a typed
number. The structural fact this tree proves: the derivation can be asserted as
a relationship, and a stale number - invisible to typecheck, lint and an
end-to-end smoke because "a stale number is still a string" - is caught only
that way.

## Pricing rows

`src/components/marketing/pricing/planRows.ts:1-14` states the rule in its
header: "a price, a plan, an order or a daily limit on the pricing page is a
claim about `src/lib/plans.ts`". `planRows()` (lines 121-138) maps `PLAN_INFO`
in catalogue order, takes `name`, `priceCzk` and `featured` from each entry, and
fills `{aiEval}` / `{sync}` / `{image}` in the hand-written `PLAN_COPY` lines
(lines 39-43 explain: "the daily limits are NOT typed out ... so raising a limit
can never leave this page quoting the old number in two languages") from that
plan's own `PLANS` entry through the caller's localized integer formatter.
Lines 15-22 record the drift that motivated it: `PlanInfo` once carried its own
cs-only tagline and features, "it had drifted from what this page actually
shows", its last reader was a retired variant, and the duplicate was deleted so
"this is the one place the words live".

`test-unit/pricing-plan-rows.test.mjs` pins the relationship, and its header
(lines 1-15) is the clearest statement of why a rendering test would not do.
Five assertions:

- lines 22-31: the row set IS `PLAN_INFO`, same plans, same order, per locale;
- lines 33-45: name, price and featured card match the catalogue, and
  `row.priceCzk === planPriceCzk(row.id)` - "the two surfaces cannot state
  different prices for the same plan", the account page being the other;
- lines 47-55: exactly one featured plan and exactly one at price zero, because
  the pricing component picks the actionable CTA by `price === 0`, so "exactly
  one plan costs nothing" is a load-bearing catalogue property;
- lines 71-92: **no daily limit and no price is typed** - every plan's price and
  every limit value is collected into a forbidden set, and each tagline and
  feature line in each locale is tested against `(?<!\{)\b<value>\b`, failing
  with "states N literally - interpolate {aiEval}/{sync}/{image} instead";
- lines 94-115: no unfilled `{}` placeholder survives into the page, and
  whichever limits a plan's copy chose to quote are that plan's own - asserted
  per placeholder "because which limits a tier advertises is a copy decision -
  where the number comes from is not".

## Feature grid and FAQ

`src/components/brand/landing/LandingModules.tsx:1-12` derives the homepage
module grid from `MODULES` and `SECTION_LABELS`, the same registry that composes
the authenticated sidebar (lines 80-83: registry order is render order; the
module count in the heading is `shown`, read out of the registry). Lines 58-60
key the per-section framing by `Exclude<ModuleSection, "settings" | "system">`,
"so adding a section to the registry fails the build here" - the structural
derivation the technique's step 3 asks for.

`src/components/brand/landing/LandingFaq.tsx:8-11` states that "where an answer
contains a fact the code owns, the fact is READ rather than typed ... An answer
that would go stale therefore breaks the build instead", and lines 61-64 do it:
the free price from `planPriceCzk("free")` through the currency formatter, the
accepted key vendors from `BYOM_VENDORS` with their localized labels, the locale
count from `SUPPORTED_LOCALES.length`. The FAQ is also emitted as `FAQPage`
structured data (lines 75-80) from the same items, so the markup carries the
derived facts too.

## Marketing numbers from the product's own grounding builder

`src/components/marketing/kanaly/facts.ts:1-17` derives every number on the
free-channels marketing surfaces - channel families, business types with a
curated plan, distinct curated channels - from the channel catalogue, and builds
the demo plan with "the SAME call the public demo makes ... against the SAME
fixture project, so the table on the marketing page and the table in the live
demo cannot disagree". The grounding comes from `buildKanalyGrounding`, "the
app's own pure, unit-tested builder ... rather than a marketing-side
re-implementation" (lines 12-15, 66-80). Lines 29-35 pin the catalogue read to a
fixed instant, `DEMO_NOW`, because a live clock in a prerendered tree is "a source
of drift between the marketing table and the demo".

## What the tree confirms and where it stops

Confirmed: numbers through placeholders; structure (rows, order, featured, free)
from the catalogue; cross-surface price equality asserted; forbidden-literal
test; per-placeholder rather than all-limits assertion; registry-derived feature
grid with a compile-time hole for a new section; FAQ facts read from code;
marketing demo from the product's own builder on a pinned fixture.

Deviation: the pricing test forbids the literal values present in the catalogue
today, so a copy line typing a number that happens not to be a current price or
limit (an old limit, a rounded one) passes. The technique asks for "no number
the code owns" typed into copy; this test enforces "no current value" typed,
which is narrower. The standard stays.

Upward lesson taken into the technique: the separation of copy decisions from
source decisions - assert per placeholder, do not require every limit to be
shown - came from this test's own comment and was not in the draft.

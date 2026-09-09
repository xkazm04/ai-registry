---
layer: application
type: application
subject: landing-page-experiment-statistics
technique: uniform-split-disclosed-no-ramping
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Cookieless uniform assignment, a pinned split, on-page disclosure and a noindex no-numbers page

Verified against the Czech adtech marketing workspace at commit
`2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08), Node 24. The assignment half
of a hosted experiment is `src/lib/lp-exp/serve.ts`; the page policy is
`src/lib/microsite/lp-page.ts`, `src/app/m/[slug]/page.tsx` and
`src/components/microsite/LpMicrosite.tsx`; the design record is
`docs/specs/wp-W3-B.md`.

## What the tree proves

**Uniform means uniform, and it is pinned.** `pickArm()` (`serve.ts:36-49`) draws one
number from an injected RNG, takes `Math.floor(r * n)` with the `r === 1` edge clamped
to the last index, and returns the arm - "no weighting, no ramping, no epsilon-greedy",
because "a split that quietly re-weights itself toward the arm that is winning so far
is how an A/B test turns into a self-fulfilling prophecy, and `evaluate()`'s
significance math assumes equal, independent allocation." The RNG is injected so the
uniformity claim is a unit test rather than a hope:
`test-unit/lp-hosted-model.test.mjs:23-38` draws 10,000 times over three arms with a
deterministic well-spread sequence (`((i++ * 2654435761) % 1_000_003) / 1_000_003`) and
asserts every arm within 2% of a third and that every draw landed on exactly one arm.
The test's header (`:5-8`) calls it "the load-bearing one" for the same reason the
technique does.

**The cookieless trade is decided and disclosed, not hidden.** The module header
(`serve.ts:8-24`) states the whole trade: nothing in the product sets a measurement
cookie, so assignment is per request; a returning visitor may see a different arm; the
test measures "which page converts a visit, not which page converts a person"; each
view is its own trial and the served arm's id rides the page into the conversion
beacon, so the arithmetic is unaffected; the residual is a decision one arm started
and another closed, which is uniform and independent of history and therefore biases
no arm. `docs/specs/wp-W3-B.md:16-22` records "no stickiness cookie" as a deliberate
non-goal with the same reasoning. The disclosure is on the page:
`LpMicrosite.tsx:36` carries the Czech text ("this page is part of an A/B test, a
randomly chosen variant is shown, a later visit may show another; we store no cookies
or visitor data - only a view and an action are counted") and `:138-142` renders it as
"disclosure, not fine print" beside the content.

**Attribution is to the served arm, and probes learn nothing.** `isServedArm()`
(`serve.ts:61-63`) is the convert beacon's entire authorisation: an arm id the page
never rendered "is not a conversion, it is a probe", answered with the same silent
204 either way. `mintArmId()` (`serve.ts:54-56`) makes the identity opaque rather
than label-derived so a renamed arm does not orphan its counter rows.

**The page prints no numbers and carries no search identity.** `lp-page.ts:17-19`:
"There is deliberately NO numeric field anywhere in this payload. An experiment page
that printed its own score would stop producing independent trials." `mintLpSlug()`
(`lp-page.ts:48-57`) keys the address on the cluster, not the arm - "all arms live at
ONE address, because the split is what is being measured. A per-arm URL would let a
visitor (or a link a visitor shares) select their own arm, which is not a randomised
trial." `isOperatorTarget()` (`lp-page.ts:70-82`) admits only `tel:`, `mailto:` and
`https://` destinations, refusing plain `http:` and dropping everything else.
`src/app/m/[slug]/page.tsx:65-79` sets `robots: { index: false, follow: true }` for
the experiment kind, with the reasoning inline: an experiment page "exists to be
measured and DIES when the test ends"; indexing would rank one arm's copy, rank a URL
that will 404 in six weeks, and land organic arrivals on a page whose split they were
never randomised into; `follow` stays on so the operator's own link check works.

**Counters overwrite, never accumulate, and hand-typed arms are untouched.**
`syncArmCounts()` (`src/lib/lp-exp/types.ts:225-264`) recomputes each identified
arm's `visitors`/`signups` from the counter totals - idempotent by construction - and
leaves any arm without an `armId` alone; the `signups <= visitors` clamp holds after
sync. Retention is 180 days (`src/lib/lp-exp/counts.ts:41`), chosen because a
business-to-business page "can take a quarter to reach its required sample size" and
must not be truncated mid-test - the standard's runtime point, stated as a retention
rationale.

## Deviations from the standard

- **No sample-ratio-mismatch check.** The split is pinned uniform in code, but the
  *observed* view counts are never tested against it. A bot filter
  (`isBotUserAgent`, applied at view time) that fires asymmetrically, or a cache that
  favours one arm, would go undetected; the standard's goodness-of-fit check at a
  one-in-a-thousand tail is absent.
- **No minimum runtime.** Nothing knows the test's age in days; the two-full-weeks
  convention has no enforcement.
- **Per-visit identity widens variance.** The trade is honest and disclosed, but the
  surface does not tell the operator that a visit-level test needs more sample than a
  person-level one to see the same person-level effect; the standard asks that the
  cost be stated to the operator, not only to the visitor.

## Upward lesson taken into the standard

The disclosure paragraph on the public page (`LpMicrosite.tsx:36`) and the
"per-arm URL lets a visitor choose their arm" reasoning (`lp-page.ts:53-55`) were
both missing from the expert draft's first pass and were promoted into the technique
and the golden path: disclosure beside the content as the condition for running a
randomised trial on a public page, and one address per test as a randomisation
property rather than a tidiness preference.

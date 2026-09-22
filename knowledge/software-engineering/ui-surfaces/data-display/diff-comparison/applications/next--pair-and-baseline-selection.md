---
layer: application
type: application
subject: diff-comparison
technique: pair-and-baseline-selection
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16
---

# The pair arrives in the URL, and the server is allowed to answer a different one

Read in the `ascent` tree (Next.js 16.3.3, React 19.2.4) at HEAD `62c252dd`; every
citation below was resolved against that tree on 2026-09-20.

When the pair is carried in the query string of a server-rendered route, the
technique's failure modes change shape. The baseline is not a remembered preference
living inside the product — it is a link, and the link is held by the reader, pasted
into conversations, and opened again months later. Whatever the server does with it
on re-resolution is invisible from the reader's side by construction, because the
page renders one pair and the URL names another.

`src/app/report/compare/page.tsx` is a server component (`dynamic = "force-dynamic"`,
`:16`) that reads `{ repo, a, b, against }` from `searchParams` (`:37`) and resolves
the pair through `getScanComparison(..., { afterId: a, beforeId: b, limit: 60 })`
(`:83-88`). Two design decisions in that call are the whole subject in miniature: the
requested ids are advisory, and the resolution runs inside a **window**.

## Asked-for against resolved, compared explicitly

The window is the interesting failure because the baseline it drops still exists.
Retention keeps roughly two hundred scans; resolution looks at the newest sixty. A
bookmarked comparison whose scan has aged past the sixtieth slot resolves to the
default pair — correctly computed, correctly rendered, and answering a question
nobody asked. The comment records what that cost before it was detected: "previously
with ZERO indication, silently breaking the shareable-URL contract (the saved link
later shows different numbers)" (`:128-133`).

The guard is two identifier comparisons:

```ts
const unhonored = pair
  ? [a && pair.after.id !== a ? a : null, b && pair.before.id !== b ? b : null].filter(
      (x): x is string => x !== null,
    )
  : [];
```

and a `role="status"` notice above the picker (`:164-175`) naming the ids that were
not honored, saying the default was shown instead, and pointing at the control that
fixes it. Note what the predicate is: it does not ask whether the requested scan
exists, or why it was dropped. It asks whether what came back is what was asked for.
That is the only form of the check that catches all three causes at once — the aged
id, the mistyped id, and the id belonging to another repository — and it is the
reason the guard needed no knowledge of the resolver's internals.

## The degenerate pair, labelled rather than rendered

`WhatChanged.tsx:29` computes `sameScan = before.id === after.id` and renders "Same
scan selected on both sides. Pick two different scans to see a diff." (`:49-52`)
instead of the diff body. The empty result that the pair (X, X) would otherwise
produce is the one this technique singles out — indistinguishable from "no changes"
— and the surface never draws it.

Worth reading beside it: the panel distinguishes that state from the *other* honest
empty, `diff.unchanged` (`:53-56`), which is a real comparison that found nothing. A
single "no differences" rendering would have merged a defaulting artifact with a
finding.

## The second axis is a different species, and it refuses to substitute

The same route carries a cross-entity comparison — this repository against a named
peer, the organization's best, or a cohort's top decile — resolved from `?against=`.
`parseExemplarRef` (`src/lib/report/exemplar.ts:83-107`) returns `null` for anything
it does not recognise, and the reason above it is this technique's rule in the
project's own words: "it never silently falls back to another exemplar, because a
comparison the reader did not ask for, rendered where the one they did ask for
should be, is worse than none" (`:79-82`). `ExemplarSection.tsx` is the single place
a token becomes either a panel or a notice, and its docstring states the same
commitment for the four resolution failures below the parser.

The cross-entity vocabulary is carried consciously. `exemplar.ts:12-16` declares a
framing rule — "Everything here is **has / lacks**, never better / worse" — and
derives the two-directional shape from it: `absentSignals` *and* `aheadSignals`, on
the stated grounds that a one-directional panel "would read as a ranking of teams
rather than a transfer of practice". The panel repeats the framing to the reader
before the first row (`ExemplarPanel.tsx:89-92`). A cohort below its population floor
is refused rather than aggregated (`COHORT_EXEMPLAR_MIN`, `COHORT_MIN_ORGS = 3`,
`:47-54`), and the floor's stated reason is a baseline-identity one: five public
repositories belonging to one tenant is "a de-facto private view of that tenant's
engineering, rebranded as 'the cohort'".

## What is not here

- **The default baseline is displayed, but not named as a species.** The panel shows
  the two scans and an arrow between them (`WhatChanged.tsx:39-42`), which satisfies
  the display obligation. It never says *why* those two — that this is the temporal
  species, previous against latest. A reader who has never changed the picker cannot
  tell a deliberate default from the first two rows of a list.
- **The unhonored notice cannot fire on the single-scan path.** `unhonored` is gated
  on `pair` being non-null (`page.tsx:134`), so a repository with one stored scan
  that is opened through a link naming two ids shows the "need two scans" notice with
  no mention that the requested pair was dropped. The case is rare and the guard is
  one branch away; it is recorded because the technique's obligation attaches to the
  request, and here one path answers a request without acknowledging it.
- **Nothing measures how often the window bites.** The sixty-row limit against a
  two-hundred-row retention makes the failure structurally reachable, and the notice
  proves the team saw it in the field, but no count of unhonored resolutions is
  recorded anywhere in the tree. How much of the shareable-link contract was being
  broken before the guard landed is not recoverable from this repository.

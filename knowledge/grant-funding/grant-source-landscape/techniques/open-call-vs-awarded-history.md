---
layer: technique
type: technique
subject: grant-source-landscape
technique: open-call-vs-awarded-history
status: forged
laws: [honest-null-over-forced-guess]
shared_with: []
use_when: [evaluating a candidate data source, deciding what a dataset can power, auditing a corpus for unapplicable rows]
---

# Open call vs awarded history

The first question asked of any funding dataset — before schema, before
access, before licensing — is *which kind of data is this*. Three kinds
exist, and each supports a different product function and nothing else:

| Kind | Answers | Powers | Availability |
| --- | --- | --- | --- |
| **Open-call feed** | what can be applied to, by when | the match itself; the deadline pipeline | scarce — a few structured feeds per continent |
| **Awarded history** | who funded whom, at what size | funder intelligence; match *ranking*; "funders like yours" | abundant and structured almost everywhere |
| **Applicant registry** | who the applicant legally is | onboarding; verification; the eligibility gate | strong nationally; absent at the supranational level |

The kinds are not interchangeable and not convertible. No amount of awarded
history produces a single applicable opportunity; no opportunity feed tells
you a funder's real giving pattern. A corpus needs the right kind for each
function, sourced separately.

## The masquerade problem

The reason this needs to be a named technique rather than a definition:
**publishers systematically present kind 2 in kind-1 clothing.** A
sub-national open-data portal hosts dozens of datasets titled "grants",
"grant awards", "funding" — and a survey of such portals across many regions
finds that essentially all of them are past-disbursement records: recipient,
amount, award date. Open calls with application windows live elsewhere, on
agency program pages or in the federal clearinghouse. The one open-data
portal in that survey that genuinely published live funding programs — with
real application-open and application-closed columns — was the exception
that proves how rare the exception is.

Foundation data masquerades the same way at a different address. The
publicly available layer of philanthropic data is derived from mandatory tax
filings: complete-ish award history, a year or more stale, thin
descriptions. Structured *open-call* data for foundations does not exist as
open data — it is licensed commercial directories or the funder's own
website. A source plan that lists "foundation database" under open calls has
already made the category error.

## The verification procedure

Never classify a dataset by its title, its portal category, or its
publisher's description. Classify it by its columns and its rows:

1. **Fetch real rows** from the live endpoint — not the documentation.
2. **Look for a future-facing time field**: an application window, a close
   or due date, a submission deadline. An award date, payment date or fiscal
   year is the signature of history.
3. **Check tense in the row content.** "Awarded to", past-tense verbs,
   recipient names present → history. Program descriptions with eligibility
   language and instructions → open call.
4. **Check the update cadence.** Opportunity feeds refresh on the cadence of
   publication (daily or better); history dumps refresh annually or on
   filing cycles.
5. **Record the verdict with a date.** The classification is an empirical,
   dated fact about a living endpoint, and the map it feeds must say when
   and how it was verified.

When the verdict is "history, not calls", the honest output is a null in the
open-call column of the market map — with the history dataset recorded where
it belongs, under funder intelligence. Wiring it into the opportunity corpus
to make a jurisdiction look covered is a forced guess at scale: every row is
a match candidate no one can apply to.

## Decision rules

- When a dataset has no future-facing application-window field, it is not an
  open-call source, whatever it is called — file it under awarded history or
  reject it.
- When a jurisdiction has no verified open-call feed, say so and cover it by
  other means (a curated floor, a broader-jurisdiction backbone, scraping) —
  never by reclassifying history.
- When awarded history is abundant and open calls are scarce — the normal
  case — let history power ranking and intelligence while the scarce feeds
  power existence. Both, correctly placed, beat either misplaced.
- When a registry is missing at the level a funder operates (the
  supranational case), the eligibility gate degrades to per-member-state
  verification; plan the product around that seam rather than pretending a
  unified registry exists.

## When not to apply

The distinction blurs legitimately in one place: **forecast data**. Some
clearinghouses publish forthcoming opportunities — announced but not yet
open. Forecasts are kind 1 (future-facing, actionable for preparation) and
belong in the open-call corpus with their status carried honestly, not
dropped as "not open yet". Do not let the history/call boundary harden into
"only currently-open rows count".

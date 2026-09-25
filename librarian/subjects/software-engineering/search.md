---
subject: search
domain: software-engineering
last_touched: 2026-09-24
dry_streak: 0
---

# search

First note for the subject. Created by intake run `intake-chatterino2` (2.3.2) on 2026-09-03; the subject predates it.

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

New technique `typed-filter-language`: a user-authored filter expression language typed at
parse time, so an ill-typed expression is refused before it is evaluated and the hot path
never branches on type. The landing worker checked the boundary the front half flagged (a
chat filter is not a search query) against `query-parsing` and the alerting subject's
rule-authoring validation, and kept it here because the forces are the end-user author
and the hot path, which this subject's golden path states. `cpp--typed-filter-language`
application. Unapplied in the fleet: no project has a user-authored filter language.

## 2026-09-24 - intake `intake-tin-0923` (2.14.1)

Source: a vendor's announcement of an in-database text index (`2026-09-24-introducing-tin`).
`full-text-indexing` gained a section: index-or-scan is decided per result contract
(ranked page, exhaustive set, exact count) and per query shape, because a ranked page
visits every match, a phrase visits its words' conjunction and a common-word OR visits
nearly the corpus. Authorized by a paired measurement in politicas, not by the source:
speedup 150-234x at zero matches, 13-25x counting / 4-11x ranking at 1-3%, about 1x
past a quarter; floor (identical results) held 24/24. `node--full-text-indexing`
application, `applied: experiment`, `better`. Boundary kept: the exhaustive and count
contracts are the golden path's Filter intent, so the golden path's opening stands and
only the engine consequence landed. Open: nothing in the corpus owns engine internals
(host-locator postings, page bitmaps, index-only counts) - lead L1 in the source note.

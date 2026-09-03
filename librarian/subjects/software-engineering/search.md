---
subject: search
domain: software-engineering
last_touched: 2026-09-03
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

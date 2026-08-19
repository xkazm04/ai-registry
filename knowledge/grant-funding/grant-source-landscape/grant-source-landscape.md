---
layer: golden-path
type: golden-path
subject: grant-source-landscape
status: forged
use_when: [choosing which funding-data sources to ingest, entering a new market or jurisdiction, onboarding a new source into a normalized corpus, explaining why a jurisdiction has no live feed]
techniques:
  - open-call-vs-awarded-history
  - curated-floor-vs-live-feed
  - market-readiness-tiering
  - stable-dedup-key-selection
  - close-date-normalization
  - relevance-precision-filtering
---

# Grant source landscape

Every product that matches applicants to funding rests on a corpus of funding
data, and the quality of that corpus is decided long before any matching model
runs — it is decided by *which sources feed it and how honestly each source's
limits are understood*. The naive reading of this subject is "aggregate all
the grant databases". The principal reading is that **there is no such thing
as "the grant databases"**: there are three structurally different kinds of
funding data with wildly different availability per market, and confusing
them — or pretending a market has a kind of data it does not — produces a
corpus that looks rich and matches wrong.

## The three kinds of data, and why they must never be conflated

Funding data comes in exactly three kinds, distinguished by *what question
they can answer*:

1. **Open-call feeds** — live opportunities with an application window: what
   can be applied to, by whom, by when. This is the only kind that powers the
   core promise ("apply to this by Friday"). It is also, everywhere, the
   **scarcest** kind. A handful of jurisdictions publish it as structured,
   refreshable data: a federal opportunity clearinghouse with a key-free
   search interface and status vocabulary (posted, forecasted, closed,
   archived), a supranational funding portal with a public search endpoint,
   one or two sub-national portals, a few national opportunity registries.
   Everywhere else, open calls live on agency web pages and must be scraped
   or researched.
2. **Awarded-grant history** — who funded whom, for what, at what size. This
   is **abundant and structured almost everywhere**: public spending
   disclosures, tax-filing-derived foundation giving records, national
   awarded-grants standards with millions of rows in bulk download. It powers
   funder intelligence and match *ranking* — never match *existence*. A past
   award tells you a funder's habits; it does not tell you anything is open
   to apply to today.
3. **Applicant registries** — the identity, legal status and financials of
   the organizations that apply. Strong in most jurisdictions (charity
   registers, exempt-organization files, company registers), with one
   important structural hole: supranational funding bodies have no unified
   registry, only the member states' fragmented ones. Registries power
   onboarding, verification and the eligibility gate.

The single most consequential field finding in this subject: **general-purpose
open-data portals overwhelmingly publish kind 2 while appearing to promise
kind 1.** A sub-national open-data portal full of datasets titled "grants" is
almost always award history — past disbursements — not open calls with
application windows. A team that wires such a dataset into its opportunity
corpus has manufactured a set of unapplicable "opportunities" with no
deadlines, or worse, with award dates masquerading as close dates. Verify the
kind of every dataset by reading its actual columns before a single row is
ingested, and expect the answer "history, not calls" most of the time.

Foundation and philanthropic data has its own version of the same trap: the
publicly available layer is tax-filing-derived award history (limited
descriptions, a year or more stale), while structured *open-call* data for
foundations essentially does not exist as open data anywhere — it is either a
licensed commercial directory or the funder's own web page. Plan for that
absence rather than around it.

## Availability is a per-market fact, not a global one

Source strategy cannot be designed once and applied everywhere. Each market
must be assessed on all three kinds independently, because they do not
correlate: a market can have world-class awarded-history data and no open-call
feed at all; another can have the best open-call feed anywhere and no unified
applicant registry. The assessment is empirical — fetch the endpoints, read
the real columns, count the live rows — and it is dated, because portals
change. A market map whose claims were never verified against live responses
is a wish list ([market-readiness-tiering](techniques/market-readiness-tiering.md)).

Two consequences follow. First, a market is *launch-grade* only where the
scarce intersection exists: a structured open-call feed **and** a structured
applicant registry. Second, markets without that intersection are not
worthless — they are served differently: a strong federal or supranational
backbone can carry a whole region's baseline while local coverage arrives as
curated data or scraping, added as depth rather than as the floor.

## No jurisdiction renders empty

A corpus that is honest about feed scarcity still owes its users something in
every jurisdiction it claims to serve. The structural answer is a two-layer
source design: an **always-on curated floor** — a hand-maintained, offline,
deterministic set of real recurring programs per jurisdiction — underneath
**opt-in live feeds** that layer on top when a verified endpoint exists
([curated-floor-vs-live-feed](techniques/curated-floor-vs-live-feed.md)). The
floor guarantees no market is empty and no demo depends on a third-party
endpoint being up; the live feed guarantees freshness where freshness is
available. The two are explicitly the same shape in the corpus, so upgrading
a jurisdiction from floor to feed is additive, not a migration.

## Bringing a source into the corpus: the normalization contract

Every source enters through one normalization boundary, and that boundary is
where the corpus's integrity is won or lost. A new source is admitted only
when it can satisfy a small, enforced contract:

- **A stable identity.** Every row needs a deduplication key that survives
  refresh: the publisher's own identifier where one exists, and where none
  does, a hash of the record's *identity fields only* — never of the whole
  payload, which mutates between fetches and would turn every re-ingest into
  a duplicate ([stable-dedup-key-selection](techniques/stable-dedup-key-selection.md)).
- **A resolvable public reference.** Every row must trace back to a live web
  page — stored, or deterministically constructable from the key. An
  opportunity nobody can find on the funder's own surface is a rumor, and
  provenance per field starts with provenance per row.
- **A jurisdiction.** Every row maps to the market and geography it applies
  to, derived deterministically from its source, so geographic scoping never
  depends on per-row data quality.
- **Normalized time.** Close dates arrive in every shape publishers can
  invent — date-only strings with an implicit local-midnight convention,
  multi-cutoff calls with several deadlines, impossible placeholder dates.
  All of it is resolved to an explicit date, time and timezone at ingest, or
  to an honest null ([close-date-normalization](techniques/close-date-normalization.md)).
- **Relevance precision.** Sources are rarely scoped to exactly "live grant
  opportunities". Portals export mostly-closed histories; government search
  indexes mix grants with news, statistics and loans. Deterministic filters
  — status allowlists, document-type noise screens, positive-signal
  requirements — run at the ingest boundary so the corpus holds actionable
  calls only ([relevance-precision-filtering](techniques/relevance-precision-filtering.md)).

The contract is per-source but the shape is shared: downstream scoring,
drafting and deadline machinery see one stable schema regardless of which of
a dozen adapters produced the row. Aggressive normalization at the boundary
is what makes a multi-source corpus feel like one dataset instead of twelve.

## Failure modes of the naive reading

- **History sold as opportunity.** Award-history rows ingested into the
  open-call corpus; users are matched to money that closed years ago.
- **The empty jurisdiction.** A market claimed in marketing renders zero
  results because its only planned source was a live feed that was never
  verified or is currently down.
- **The mutating key.** Dedup keys derived from full payloads or random
  fallbacks; every refresh doubles the corpus.
- **The immortal call.** A closed or cancelled opportunity that survives
  ingest because status filtering was a blocklist and the publisher invented
  a new status string.
- **The vanishing call.** A multi-deadline opportunity that disappears from
  the corpus after its first cutoff passes, though later cutoffs remain open.
- **The unverified map.** Source strategy built from portal marketing pages
  rather than fetched responses; half the "planned feeds" turn out to be
  award history or bot-walled.

Each of these is prevented structurally by one of the six techniques, not by
downstream vigilance. The corpus is the foundation of everything a funding
product does; the landscape discipline is what keeps the foundation honest.

## The techniques

- [open-call-vs-awarded-history](techniques/open-call-vs-awarded-history.md) —
  the load-bearing kind distinction: what each of the three data kinds can
  support, and how to verify which kind a dataset actually is.
- [curated-floor-vs-live-feed](techniques/curated-floor-vs-live-feed.md) —
  the two-layer source design that guarantees no jurisdiction renders empty.
- [market-readiness-tiering](techniques/market-readiness-tiering.md) —
  assessing markets on all three pillars with live verification, and tiering
  where the product can be trusted.
- [stable-dedup-key-selection](techniques/stable-dedup-key-selection.md) —
  identity-field keys that survive refresh and make upserts actually upsert.
- [close-date-normalization](techniques/close-date-normalization.md) —
  publisher deadline conventions, multi-cutoff resolution, and honest nulls
  for impossible dates.
- [relevance-precision-filtering](techniques/relevance-precision-filtering.md) —
  status allowlists and noise screens that keep the corpus actionable.

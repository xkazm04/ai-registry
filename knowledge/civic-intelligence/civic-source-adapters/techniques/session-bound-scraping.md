---
layer: technique
type: technique
subject: civic-source-adapters
technique: session-bound-scraping
status: forged
laws: [every-cap-ships-its-population, incident-anchored-doctrine]
shared_with: []
use_when: [a registry offers only a search page as export, pagination behaves statefully, sizing a sweep against a request-per-entity API]
---

# Session-bound scraping

Some public registries publish everything and export nothing: the data is legally
public, complete, and reachable only through a server-rendered search page. Scraping
it is legitimate civic infrastructure — but these portals are built on server
frameworks that hold UI state in a session, which means the page's behavior is a
*protocol*, not a URL scheme. The technique is to discover that protocol by decisive
live probes, implement it exactly, record what was proven, and budget the traffic
like a guest.

## Discover the protocol by decisive probes, not assumption

Stateful portals defeat the intuition that a GET with all the right parameters is
enough. Typical reality: page-size and offset parameters are *signals* that mutate
paginator state held server-side in the session — they do nothing without the
session cookie, and they do nothing when combined into the first request of a
session. The working protocol becomes a two-step: request one establishes the
session and returns the default page; request two carries the first response's
cookie and the resize/advance signal. Nothing about this is guessable; it is
established by experiment:

- **Probe pairs that isolate one variable.** "Same parameters, with and without the
  cookie." "Signal in the first request versus in the second." "Parameter A versus
  parameter B for a case where the correct answer is known." Each probe should be
  decisive — designed so the two candidate hypotheses predict different outputs.
- **Probe the negative claims too.** "There is no structured export" is a claim;
  verify it (do the export-parameter variants actually return the same markup?)
  before building the scraper, and record that it was verified, so nobody
  re-litigates it — or worse, assumes an API exists and claims the scrape was a
  choice.
- **Pin down parameter semantics with a known-answer test.** Search parameters
  that look symmetric often are not — "party" versus "publisher" fields can each
  match only one side of a two-sided record. Find a record where the sides differ
  and test both parameters against it. An adapter that sweeps only one side must
  document the consequence: the sweep *misses* every record where the entity
  played the other role, and completeness claims must account for both sweeps.

## Write the protocol down where it cannot be lost

The probe results are hard-won facts about an undocumented system. They live as a
dated verification note at the top of the client — what was tested, what the
decisive probe was, what conclusion follows, and "do not re-derive". Per
[incident-anchored doctrine](../../_laws.md#incident-anchored-doctrine), a protocol
note with its experiment attached resists both erosion and re-litigation; a bare
implementation invites a future cleanup that re-breaks it. When a later probe
falsifies an earlier claim, correct the note explicitly and say the old claim was
untested — the correction is itself doctrine.

## Budget like a guest, disclose like an auditor

- **Size the sweep before starting it.** Entities × periods × endpoints = requests.
  A number in the tens of thousands is a standing batch job with its own schedule,
  not an in-session fetch; know which one you are writing before the loop exists.
- **Identify yourself.** A user agent naming the project and a contact URL. Backoff
  with jitter on failure; never hammer a portal whose continued openness you
  depend on.
- **Cache immutable fetches to disk** keyed by their request identity, so re-runs
  and debugging never re-download what cannot have changed.
- **Bound every batch explicitly and disclose the bound.** A partial sweep (the
  132 largest of 6,254 entities, one year of five) is fine — *if* the surface that
  consumes it states the coverage. Per
  [every cap ships its population](../../_laws.md#every-cap-ships-its-population),
  a bounded batch presented as complete converts a budget decision into a false
  claim.
- **Session hygiene**: one session per logical search; do not reuse a paginator
  session across different queries, because its server-side state (page size,
  offset) silently applies to the new query.

## Parsing scraped markup

Scraped HTML is a positional format with extra steps, and everything from
[fail-loud-schema-drift](fail-loud-schema-drift.md) applies with more force: assert
the header shape every fetch, reject rows of the wrong width, treat "no results
table" as a valid empty answer distinct from drift. Parse with the narrowest
extraction that works and keep publisher sentinels ("not stated" value cells) as
explicit nulls, never zeros.

## When not to use this

Whenever any structured channel exists — a bulk dump, an open-data package, a JSON
endpoint the portal's own frontend calls (often discoverable in its bundle and far
stabler than its markup) — prefer it; scrape only the gap. Do not use session-bound
scraping to bypass access controls: the technique is for data that is public and
merely inconvenient, and an authentication wall is a legal boundary, not a
protocol puzzle. And if terms of use prohibit automated access to otherwise-public
data, that conflict is resolved by humans (and lawyers), not by rotating user
agents.

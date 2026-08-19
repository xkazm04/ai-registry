---
layer: application
type: application
subject: civic-source-adapters
technique: session-bound-scraping
stack: node
status: forged
---

# Node: scraping a session-stateful contract registry

The politicas repo's client for the Czech contract register (smlouvy.gov.cz, the
"Registr smluv") at `lib/ingest/sources/smlouvy.ts` realizes session-bound scraping
end to end: protocol discovery by decisive probes, a dated do-not-re-derive note,
fail-loud shape assertions, and sentinel-preserving cell parsers.

## The probed protocol, written where it cannot be lost

The header (`smlouvy.ts:12-47`) is the verification note the technique prescribes,
dated 2026-07-27 and marked "do not re-derive". The site is a Nette app whose
pagination parameters (`do=searchResultList-setLimit` / `-setOffset`) are signals
mutating paginator state held in the session. The decisive probes are recorded with
their outcomes:

- limit signal combined into the very first request of a session → **zero rows**;
  the same two params sent as a *second* request reusing the first response's
  `Set-Cookie` → all matching rows (`smlouvy.ts:16-22`). Hence the implemented
  two-step: GET establishes the session and returns page 1 at default size 10;
  a cookie-bearing second GET re-renders at size up to 500, with a further offset
  signal advancing windows (`smlouvy.ts:23-30`).
- the negative claim is verified, not assumed: `&export=1|xml|csv` all return the
  same HTML — "do NOT claim an API exists" (`smlouvy.ts:21-22`).
- parameter semantics pinned by a known-answer test (`smlouvy.ts:31-41`):
  `party_idnum` matches only the non-publishing party; the proof is one authority's
  identifier returning zero rows under `party_idnum` while `subject_idnum` returns
  the contract it published the same day. The consequence for callers is spelled
  out — a `party_idnum`-only sweep misses every contract the swept company
  published itself — and the header corrects its own history: "An earlier revision
  of this file claimed `party_idnum` matched EITHER party. It does not; the claim
  was never tested until batch 011."

## Fail-loud shape, calibrated to what the site renders

`checkHeaderRow` (`smlouvy.ts:189-208`) asserts the results table's shape on every
fetched page and **throws** on drift — "silently mis-parsing a shifted column would
fabricate a contract value out of the wrong cell." The assertion is calibrated to
reality: the live table's seventh (action) column renders an empty `<th>`, so the
labelled prefix is checked by label and the width by count; an earlier revision
that expected a literal "Detail" label failed against the real site (batch 009 note
at `smlouvy.ts:56-60`) and was corrected without weakening the guard. A missing
header entirely is treated as "no results table", a valid empty answer, not drift
(`smlouvy.ts:187-191`); `parseDataRow` independently rejects rows whose cell count
disagrees.

## Sentinels and coercion at the cell level

`parseValueCell` (`smlouvy.ts:213-225`) maps the publisher's literal `"Neuvedeno"`
("not stated") to `{valueCzk: null, valueNote: null}` — "NEVER coerced to 0" — and
handles both nbsp and space thousands separators. `parseCzechDate`
(`smlouvy.ts:228-…`) returns null, "never a guess", for unparseable dates.

## Budget discipline in a sibling client

The same repo's municipal-finance client (`lib/ingest/sources/monitor.ts:28-33`)
shows the sizing rule: a full sweep is computed as ~37k requests and declared "a
standing batch job, NOT an in-session fetch"; the shipped batch is explicitly
bounded (132 towns ≥ 10k population × 5 years = 660 calls at concurrency 8) and
"coverage of a partial batch is DISCLOSED on-page, never passed off as
completeness." Both clients identify themselves with a project-and-contact user
agent (`smlouvy.ts:52`, `monitor.ts:38`) and share a backoff helper. The
court-notice adapter (`lib/ingest/sources/kiosek.ts:23-29`) adds the
non-append-only rule: postings vanish once their relevance window passes, so the
poller dedups forward by the posting's URL — its stablest key, chosen after
confirming the nominal `iri` field points at a dead host.

---
domain: civic-intelligence
subject: civic-source-adapters
last_touched: 2026-09-09
touched_by: architecture-review
dry_streak: 0
---

# civic-source-adapters

## Architecture review - 2026-09-09

Retain the subject and all six techniques. Correct normalization and parser
claims, snapshot completeness, export discovery and retention boundaries.
This is a library review with focused reproductions of consumer limitations,
not a consumer repair or refreshed application witness.

## Open leads

- Repair consumer calendar, whole-token timestamp and exact-integer validation;
  resolve unknown escapes and source timezone semantics with the publisher.
- Require positive empty-response evidence and preserve unknown/malformed/sentinel
  distinctions; verify the actual monetary grammar before parsing decimals.
- Compare structured metadata exports with targeted search requirements and
  exercise pagination, completeness and upstream withdrawal propagation.
- Reopen application verification only with the above source and runtime
  checks; do not promote maturity on the strength of this prose review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/civic-source-adapters",
  "date": "2026-09-09",
  "baseline": "097be8c6cb041a948b4f6e20da0c7b3c1939aa09",
  "digest": "sha256:c88c5159db6abacd",
  "disposition": "clarify",
  "coverage": "All nine owned documents read. Publisher format/export pages, Unicode and encoding specifications, and privacy guidance consulted. Inspected local pure parser and scraper source. Eight focused assertions executed against pure parser exports and built-in normalization under Node 24.14.0. No live pagination, bulk ingest, consumer repair, historical incident reproduction or compliance certification. Application witness dates unchanged.",
  "counterexamples": [
    "Caron letters decompose normally while stroked letters need separate transliteration; an explicit table alone may miss decomposed input.",
    "A wrong codepage accepts every byte and yields mojibake despite fatal mode.",
    "An unknown escape loses its marker, a large integer rounds, an impossible February date passes and timestamp garbage is ignored.",
    "A challenge page with no table is not an established empty search result.",
    "A truncated snapshot must not delete records missing from the partial response.",
    "A later repeated transition after reversion needs an identity distinct from the first occurrence.",
    "Failed export query parameters do not exclude documented XML bulk exports.",
    "A historical export is corrected or withdrawn after being cached.",
    "An implausible date is not proof of a publisher-defined sentinel; hashing a birth date does not establish deletion."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1300",
      "result": "Confirmed UNL delimiter/null/encoding basics, full snapshots, trailing-column extension policy and attribution terms. Complete escape semantics and timezone not supplied on this page."
    },
    {
      "url": "https://smlouvy.gov.cz/stranka/otevrena-data",
      "result": "Confirmed XML metadata exports and index, historical corrections/withdrawals and publisher personal-data reuse notice. Retracts broad no-structured-export claim; no dump downloaded."
    },
    {
      "url": "https://www.unicode.org/reports/tr15/tr15-57.html",
      "result": "Normalization is distinct from lossy transliteration; composed/decomposed equivalence must survive the search pipeline."
    },
    {
      "url": "https://www.unicode.org/charts/nameslist/n_0100.html",
      "result": "Primary character data supports caron decomposition; built-in normalization probes independently reproduced it."
    },
    {
      "url": "https://encoding.spec.whatwg.org/#interface-textdecoder",
      "result": "Fatal decoding acts on decoder errors, not on semantic correctness of the selected encoding."
    },
    {
      "url": "https://www.edpb.europa.eu/topics/ai-and-technology/anonymisation-pseudonymisation_en",
      "result": "Pseudonymisation and anonymisation differ; retained linkability cannot be treated as automatic anonymisation. No case-specific legal finding."
    },
    {
      "source": "Local source inspection and eight pure-function probes",
      "result": "Reproduced normalization, escape loss, tolerant row parsing, unsafe integer rounding, invalid calendar date, timestamp prefix acceptance and wrong-codepage mojibake. Scraper empty-page/value/date limits established by source inspection only; private pin and harness remain local."
    }
  ],
  "documents": {
    "civic-source-adapters.md": {
      "disposition": "clarify",
      "reason": "Narrow decoder, schema, snapshot and privacy guarantees; distinguish normalization from transliteration and exact numeric validation."
    },
    "techniques/entity-name-normalization.md": {
      "disposition": "clarify",
      "reason": "Correct false caron decomposition claim, cover decomposed input, and distinguish query-input folding from scanning stored rows."
    },
    "techniques/fail-loud-schema-drift.md": {
      "disposition": "clarify",
      "reason": "Require positive empty-page and snapshot-completeness evidence; allow documented compatible extensions and distinguish recurring events."
    },
    "techniques/legacy-encoding-and-escape-parsing.md": {
      "disposition": "clarify",
      "reason": "Unknown escapes are not lossless when the marker is discarded; validate required width, exact numbers, real dates, whole tokens and source-backed timezones."
    },
    "techniques/licence-and-privacy-by-construction.md": {
      "disposition": "clarify",
      "reason": "Licence and privacy roles are separate; typed extraction does not control every copy; hashing is not deletion and corrections/withdrawals propagate."
    },
    "techniques/publisher-sentinel-values.md": {
      "disposition": "clarify",
      "reason": "An extreme or impossible value does not establish a publisher convention; distinguish rejected/unresolved from publisher-defined unknown."
    },
    "techniques/session-bound-scraping.md": {
      "disposition": "clarify",
      "reason": "Scope negative discovery claims, preserve historical probe validity, budget pagination/retries and detect repeated or expired-session responses."
    },
    "applications/node--legacy-encoding-and-escape-parsing.md": {
      "disposition": "reverify",
      "reason": "Primary grammar partly confirmed and pure-function limitations reproduced; full ingest, missing escape/timezone evidence and repair remain open."
    },
    "applications/node--session-bound-scraping.md": {
      "disposition": "reverify",
      "reason": "Official XML exports contradict broad source absence; code admits false-empty responses and weak date/value coercion; live protocol and downstream completeness not rerun."
    }
  }
}
```

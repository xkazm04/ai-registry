---
domain: civic-intelligence
subject: civic-source-adapters
last_touched: 2026-10-10
touched_by: intake-apply
dry_streak: 0
---

# civic-source-adapters

## Architecture review - 2026-09-09

Retain the subject and all six techniques. Correct normalization and parser
claims, snapshot completeness, export discovery and retention boundaries.
This is a library review with focused reproductions of consumer limitations,
not a consumer repair or refreshed application witness.

## Apply - 2026-10-10 (ia-enn-1010)

entity-name-normalization gained its first application (node, politicas, code,
better). The consumer held four folds over one corpus: the ingest table fold and
three NFD-strip forks (graph search, roster bridge, municipality picker). It also
lacked the decomposed-input guard the 2026-09-09 review named. Paired over 1,252
payload names, the folds disagreed on 0 letters and 13 doubled spaces. Graph
search misses went from 13 to 0, decomposed-twin key mismatches from 853 to 0, and
0 persisted keys moved. The technique gained a boundary: two folds also part in the
steps around the letter table, so compare their outputs over the population, not
their tables. Pushed to the consumer's origin. The single-stack point does not move, because the fleet's one civic
project is node.

## Open leads

- Repair consumer calendar, whole-token timestamp and exact-integer validation;
  resolve unknown escapes and source timezone semantics with the publisher.
- Require positive empty-response evidence and preserve unknown/malformed/sentinel
  distinctions; verify the actual monetary grammar before parsing decimals.
- Compare structured metadata exports with targeted search requirements and
  exercise pagination, completeness and upstream withdrawal propagation.
- A fold version stamp and an unsupported-character report for the consumer's
  single fold: neither exists, so a table change cannot be re-folded by scheme.
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

## Architecture review - 2026-10-31

The 2026-09-09 clarifies are in the text. The publisher pages were re-read and Unicode decomposition re-probed. One application's 2026-09-09 limitation is now partly superseded by a sibling application.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/civic-source-adapters",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:12619eb6d175ea59",
  "disposition": "clarify",
  "coverage": "All thirteen owned documents read: the golden path, six techniques and six applications, four of the applications added 2026-10-10 to 2026-10-14. The 2026-09-09 clarify items are present. The publisher format and open-data pages were re-read. Unicode decomposition was re-probed under the local Node runtime's built-in normalization. The consumer tree, the live registry pagination and the bulk exports were not exercised, and application dates stay as they were.",
  "counterexamples": [
    "An application's 2026-09-09 review note says empty, sentinel and malformed value cells collapse into one null pair, while a 2026-10-14 sibling application adds a closed value state beside that pair. A reader of the older note gets a stale limitation.",
    "A header-only election registry body has no documented empty marker, so the shape guard cannot distinguish an empty acquisition from an empty registry.",
    "A table-only fold leaves a decomposed acute accent in the key, so the composed and decomposed spellings of one name fold to different keys.",
    "A withdrawn contract disappears from the publisher's historical dumps but persists in a cached copy (retained from 2026-09-09)."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1300",
      "result": "Re-read 2026-10-31. Pipe separator ('znak roury'), empty column is null, backslash-led escape sequences with no enumerated list, windows-1250, 'nové sloupce přidávány na konec' (new columns appended at the end), no timezone statement. Attribution required: 'uvedením zdroje dat a případně datem zpracování'. The unchanged reverify on the UNL application stands."
    },
    {
      "url": "https://smlouvy.gov.cz/stranka/otevrena-data",
      "result": "Re-read 2026-10-31. Monthly 'dump_<YYYY>_<MM>.xml' refreshed daily, with an index.xml. Modification or withdrawal updates already generated dumps, and withdrawal at the publisher's request removes 'všech verzí smlouvy z historických dumpů'. The recipient 'se stává správcem osobních údajů'. Supports the technique's withdrawal propagation and the retraction of 'no structured export'."
    },
    {
      "source": "Built-in normalization probe, Node 22",
      "result": "NFD gives ď = U+0064 U+030C, ť = U+0074 U+030C, ľ = U+006C U+030C, á = U+0061 U+0301. ł, đ and ø have no decomposition. Supports the normalization technique and its application's correction."
    },
    {
      "source": "Internal consistency across applications",
      "result": "The session-bound application's null-pair limitation is partly superseded by the publisher-sentinel-values application (ValueState added, null pair unchanged). In the session-bound application, 132 x 5 = 660 calls checks out."
    }
  ],
  "documents": {
    "civic-source-adapters.md": {"disposition": "keep", "reason": "The decoder, compatible-extension, snapshot-completeness, normalization-versus-transliteration and privacy narrowing all landed."},
    "techniques/entity-name-normalization.md": {"disposition": "keep", "reason": "Caron decomposition and stroke exceptions were reproduced. The 2026-10-10 whitespace boundary matches its application."},
    "techniques/fail-loud-schema-drift.md": {"disposition": "keep", "reason": "Positive empty evidence, compatible trailing extensions and transition-scoped event identity are present. The publisher's append-at-end policy confirms the extension clause."},
    "techniques/legacy-encoding-and-escape-parsing.md": {"disposition": "keep", "reason": "Unknown escapes are quarantined. The 'source-backed timezone' rule is consistent with the publisher page, which gives none."},
    "techniques/licence-and-privacy-by-construction.md": {"disposition": "keep", "reason": "Licence and privacy are kept separate. The 2026-10-14 note-writer boundary is consistent. Withdrawal propagation is confirmed by the publisher's dump policy."},
    "techniques/publisher-sentinel-values.md": {"disposition": "keep", "reason": "Documented-convention-only sentinels and the three kinds of null are present and match the 2026-10-14 application."},
    "techniques/session-bound-scraping.md": {"disposition": "keep", "reason": "Negative discovery claims are scoped, structured channels are preferred, and the cache follows the publisher's freshness contract."},
    "applications/node--legacy-encoding-and-escape-parsing.md": {"disposition": "reverify", "reason": "The publisher grammar was re-read and still lacks an escape list and timezone. The consumer repair of the five reproduced limits is not shown."},
    "applications/node--session-bound-scraping.md": {"disposition": "clarify", "reason": "Its 2026-09-09 note says empty, sentinel and malformed cells 'collapse into the same null pair'. The 2026-10-14 sentinel application adds a closed value state beside the unchanged pair, so add a dated cross-reference. The live protocol has still not been rerun."},
    "applications/node--entity-name-normalization.md": {"disposition": "reverify", "reason": "The decomposition facts were reproduced and the table is internally consistent (853 decomposed twins, 13 whitespace misses). The consumer commits and the payload population were not reopened."},
    "applications/node--fail-loud-schema-drift.md": {"disposition": "reverify", "reason": "Internally consistent, with its scope limits stated (no empty marker, header not re-fetched). The consumer change was not reopened."},
    "applications/node--licence-and-privacy-by-construction.md": {"disposition": "reverify", "reason": "Structural-only proof with persisted prose left open, as stated. The consumer change was not reopened."},
    "applications/node--publisher-sentinel-values.md": {"disposition": "reverify", "reason": "Internally consistent; the unparsed frequency is unmeasured, as stated. The consumer change was not reopened."}
  }
}
```

### Applied - 2026-10-31

Phase B applied the cross-reference. The application stays `reverify` for its live protocol.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/civic-source-adapters",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:d0e1ed56581d3d10",
  "disposition": "reverify",
  "coverage": "Second record, same session, against the digest after Phase B. All thirteen owned documents read: the golden path, six techniques and six applications, four of the applications added 2026-10-10 to 2026-10-14. The 2026-09-09 clarify items are present. The publisher format and open-data pages were re-read. Unicode decomposition was re-probed under the local Node runtime's built-in normalization. The consumer tree, the live registry pagination and the bulk exports were not exercised, and application dates stay as they were.",
  "counterexamples": [
    "An application's 2026-09-09 review note says empty, sentinel and malformed value cells collapse into one null pair, while a 2026-10-14 sibling application adds a closed value state beside that pair. A reader of the older note gets a stale limitation.",
    "A header-only election registry body has no documented empty marker, so the shape guard cannot distinguish an empty acquisition from an empty registry.",
    "A table-only fold leaves a decomposed acute accent in the key, so the composed and decomposed spellings of one name fold to different keys.",
    "A withdrawn contract disappears from the publisher's historical dumps but persists in a cached copy (retained from 2026-09-09)."
  ],
  "sources": [
    {
      "url": "https://www.psp.cz/sqw/hp.sqw?k=1300",
      "result": "Re-read 2026-10-31. Pipe separator ('znak roury'), empty column is null, backslash-led escape sequences with no enumerated list, windows-1250, 'nové sloupce přidávány na konec' (new columns appended at the end), no timezone statement. Attribution required: 'uvedením zdroje dat a případně datem zpracování'. The unchanged reverify on the UNL application stands."
    },
    {
      "url": "https://smlouvy.gov.cz/stranka/otevrena-data",
      "result": "Re-read 2026-10-31. Monthly 'dump_<YYYY>_<MM>.xml' refreshed daily, with an index.xml. Modification or withdrawal updates already generated dumps, and withdrawal at the publisher's request removes 'všech verzí smlouvy z historických dumpů'. The recipient 'se stává správcem osobních údajů'. Supports the technique's withdrawal propagation and the retraction of 'no structured export'."
    },
    {
      "source": "Built-in normalization probe, Node 22",
      "result": "NFD gives ď = U+0064 U+030C, ť = U+0074 U+030C, ľ = U+006C U+030C, á = U+0061 U+0301. ł, đ and ø have no decomposition. Supports the normalization technique and its application's correction."
    },
    {
      "source": "Internal consistency across applications",
      "result": "The session-bound application's null-pair limitation is partly superseded by the publisher-sentinel-values application (ValueState added, null pair unchanged). In the session-bound application, 132 x 5 = 660 calls checks out."
    }
  ],
  "documents": {
    "civic-source-adapters.md": {
      "disposition": "keep",
      "reason": "The decoder, compatible-extension, snapshot-completeness, normalization-versus-transliteration and privacy narrowing all landed."
    },
    "techniques/entity-name-normalization.md": {
      "disposition": "keep",
      "reason": "Caron decomposition and stroke exceptions were reproduced. The 2026-10-10 whitespace boundary matches its application."
    },
    "techniques/fail-loud-schema-drift.md": {
      "disposition": "keep",
      "reason": "Positive empty evidence, compatible trailing extensions and transition-scoped event identity are present. The publisher's append-at-end policy confirms the extension clause."
    },
    "techniques/legacy-encoding-and-escape-parsing.md": {
      "disposition": "keep",
      "reason": "Unknown escapes are quarantined. The 'source-backed timezone' rule is consistent with the publisher page, which gives none."
    },
    "techniques/licence-and-privacy-by-construction.md": {
      "disposition": "keep",
      "reason": "Licence and privacy are kept separate. The 2026-10-14 note-writer boundary is consistent. Withdrawal propagation is confirmed by the publisher's dump policy."
    },
    "techniques/publisher-sentinel-values.md": {
      "disposition": "keep",
      "reason": "Documented-convention-only sentinels and the three kinds of null are present and match the 2026-10-14 application."
    },
    "techniques/session-bound-scraping.md": {
      "disposition": "keep",
      "reason": "Negative discovery claims are scoped, structured channels are preferred, and the cache follows the publisher's freshness contract."
    },
    "applications/node--legacy-encoding-and-escape-parsing.md": {
      "disposition": "reverify",
      "reason": "The publisher grammar was re-read and still lacks an escape list and timezone. The consumer repair of the five reproduced limits is not shown."
    },
    "applications/node--session-bound-scraping.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: the null-pair limitation now carries a dated note that a closed value state travels beside the unchanged pair (2026-10-14 sentinel application). Live pagination, the empty-page check, calendar dates and the decimal grammar are still unverified."
    },
    "applications/node--entity-name-normalization.md": {
      "disposition": "reverify",
      "reason": "The decomposition facts were reproduced and the table is internally consistent (853 decomposed twins, 13 whitespace misses). The consumer commits and the payload population were not reopened."
    },
    "applications/node--fail-loud-schema-drift.md": {
      "disposition": "reverify",
      "reason": "Internally consistent, with its scope limits stated (no empty marker, header not re-fetched). The consumer change was not reopened."
    },
    "applications/node--licence-and-privacy-by-construction.md": {
      "disposition": "reverify",
      "reason": "Structural-only proof with persisted prose left open, as stated. The consumer change was not reopened."
    },
    "applications/node--publisher-sentinel-values.md": {
      "disposition": "reverify",
      "reason": "Internally consistent; the unparsed frequency is unmeasured, as stated. The consumer change was not reopened."
    }
  }
}
```

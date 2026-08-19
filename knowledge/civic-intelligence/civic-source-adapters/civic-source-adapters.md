---
layer: golden-path
type: golden-path
subject: civic-source-adapters
status: forged
use_when: [ingesting a government or registry data source, writing a parser for a legacy bulk export, scraping a public-sector portal, debugging silently wrong ingested rows]
techniques:
  - legacy-encoding-and-escape-parsing
  - publisher-sentinel-values
  - fail-loud-schema-drift
  - session-bound-scraping
  - licence-and-privacy-by-construction
  - entity-name-normalization
---

# Civic source adapters

A civic source adapter is the code that turns what a public institution actually
publishes into rows a knowledge graph can trust. The gap between those two things is
the whole subject. Public-sector sources are authoritative in content and hostile in
delivery: bulk dumps in formats frozen when the underlying database was procured
decades ago, single-byte legacy codepages, magic sentinel dates standing in for
"unknown", search pages whose only export is server-rendered markup, schemas that
drift without an announcement, and licence terms that quietly make you a data
controller the moment you mirror a file. None of this is negligence to be worked
around casually — it is the terrain, and the adapter is the one layer whose job is to
survive it without lying.

The stakes are asymmetric in a way most data engineering is not. Downstream of the
adapter sit counts, rankings, and published claims about named people and firms.
A dropped row is a coverage gap you can disclose; a *corrupted* row — a column shifted
by an unescaped delimiter, a name mangled by a lenient decoder, a sentinel date read
as a birthday — is a fabricated fact wearing the source's authority. Every doctrine in
this subject reduces to one sentence: **missing beats wrong.** When the adapter cannot
be sure, it produces null, or nothing, or an exception — never a plausible value.

## The adapter is a trust boundary, so it is strict on both faces

Everything downstream assumes adapter output is what the publisher asserted. That
assumption is only affordable if the adapter refuses to guess on the way in:

- **Parse the publisher's grammar, not an approximation of it.** A pipe-delimited
  dump with a documented backslash-escape rule cannot be split on the delimiter;
  real titles contain literal delimiters and a naive split silently shifts every
  later column of that row. The failure is invisible — the shifted row still parses,
  it just describes the wrong thing. Read the publisher's own format description
  (there almost always is one, however buried) and implement its escape rules,
  its null convention, its row terminator, exactly.
- **Decode fatally.** Legacy-codepage payloads are decoded with an unmappable byte
  treated as an error, never substituted with a replacement character. A silently
  mangled person name is precisely the wrong-beats-missing case: it will fail entity
  matching later, quietly, for one person, forever.
- **Coerce whole values, never prefixes.** Standard-library integer parsing that
  accepts `"123abc"` as 123 converts a mis-parsed field into a plausible-looking
  wrong identifier. Numeric coercion requires the entire trimmed value to match;
  anything else is null.
- **Validate semantics behind syntax.** A regex-shaped date with month 13 must not
  be emitted as a syntactically valid but meaningless value. Range checks follow
  every pattern match.

The same strictness governs the other face: what the adapter emits is typed,
carries its source identity, and distinguishes null-because-absent from
null-because-rejected, because [missing is not zero](../_laws.md#missing-is-not-zero)
and a suppressed bad value must be counted, not repaired
([disclose, never repair](../_laws.md#disclose-never-repair)).

## The publisher's conventions are facts to model, not noise to clean

Legacy sources encode meaning in conventions the schema does not declare: a fixed
ancient date meaning "birth date unknown", a literal "not stated" string in a value
column, a vocabulary code that *merged* two categories decades ago by act of the
institution itself. The naive reading treats these as dirty data; the principal
reading treats them as publisher assertions with their own semantics. A sentinel is
detected and recorded as an explicit unknown-flag plus null — and when the publisher
has merged two categories at the source, no downstream metric may pretend to split
them; the honest output is a merged category and a statement that the distinction is
uncomputable for the affected period. The adapter is also where a source's *measured*
blind spots are established and written down — e.g. discovering that half of a
self-declared free-text field is self-referential and useless for the signal you
wanted, and reporting that percentage rather than shipping a classifier that hides it.

## Drift is a certainty; the only choice is loud or silent

Public-sector sources change shape without versioning or notice. An adapter that
tolerates shape change tolerates mis-parsing: a column inserted into a scraped table
shifts every value one cell left, and the shifted values are still numbers and dates —
they will flow all the way to a published page. The rule: **assert the expected shape
on every fetch and refuse to parse on mismatch.** A crashed ingest run costs an hour;
a silent mis-parse costs published wrong numbers and the credibility they were
resting on. The same logic covers full-snapshot sources with no diff feed: an
adapter run replaces rows in place, so "what changed" must be reconstructed by
explicit snapshot diffing over natural keys — and the first backfill of history
shares one recording instant, which must be treated as an epoch so it does not flood
the change stream with thousands of fake "new" events. Record time (when we saw it)
and world time (when it was true) are different columns and never conflated.

## Acquisition is a protocol, and its terms travel with the data

When the only access is a search page, the adapter implements the page's real
protocol, not the protocol you wish it had. Server frameworks that keep paginator
state in a session make pagination a stateful two-step — the first request
establishes the session, subsequent requests carry its cookie — and no single
stateless request can express "page 2 at size 100". These properties are established
by live probes, recorded next to the client with the date of verification, and not
re-derived from hope. Volume is budgeted before the loop starts: a sweep is sized in
requests, run with backoff and an honest user agent, and a partial batch is disclosed
as partial, because [every cap ships its population](../_laws.md#every-cap-ships-its-population)
— a truncated read presented as complete once silently deleted every late-sorting
entity's records from a page whose promise was completeness.

Licence and privacy obligations enter with the bytes, not at publish time. The
adapter's header is where the licence is logged, where non-commercial or attribution
conditions are recorded, and where GDPR consequences are turned into structure: if
mirroring officer records makes you a controller of birth dates and home addresses,
the adapter extracts those fields as matching keys only and never lets them into
narrative output. A constraint enforced by code cannot be forgotten by a future
caller; a constraint noted in a wiki will be.

## Normalize once, at ingest, with one scheme

Entity resolution across civic sources lives or dies on name matching, and the
sources disagree about diacritics, ordering, honorifics, and legal-form suffixes.
The doctrine: fold to a canonical form **once, at ingest**, persist it in an indexed
column, and make every consumer import the *same* folding function — two folding
schemes that agree on 99% of inputs will disagree on exactly the names that matter,
per [one definition, imported everywhere](../_laws.md#one-definition-one-import).
Unicode-decomposition shortcuts are checked against the actual alphabet: several
letters common in central-European names do not decompose, so a fold table is built
explicitly rather than trusted to a normalization form. And a name match is never
an identity claim by itself — the adapter emits candidates; identity is adjudicated
downstream with more evidence, because
[a machine result is a lead, never a finding](../_laws.md#lead-not-finding).

## Failure modes this standard exists to prevent

- **The shifted row** — naive delimiter split over an escape-bearing format; every
  later column of the row silently describes the wrong field.
- **The mangled name** — lenient decoding substitutes replacement characters into
  a person's name; entity matching fails quietly and permanently.
- **The phantom birthday** — a sentinel date surfaced as a real value; impossible
  ages flow into published records.
- **The fabricated figure** — header drift tolerated; a value parsed from the
  wrong cell publishes as a contract amount.
- **The silent truncation** — an ad-hoc read cap outgrown by the corpus; ordered
  reads make the loss systematic, not random, and the page still claims totality.
- **The licence surprise** — a bulk mirror taken without reading the terms; the
  project is now a data controller of private-person fields it never needed.
- **The double fold** — query-time normalization diverging from ingest-time
  normalization; the index is defeated and the borderline names mismatch.

## The techniques

- [legacy-encoding-and-escape-parsing](techniques/legacy-encoding-and-escape-parsing.md) —
  implementing the publisher's real grammar: escapes, codepages decoded fatally,
  whole-value coercion, semantic validation behind syntax.
- [publisher-sentinel-values](techniques/publisher-sentinel-values.md) — magic
  dates, "not stated" strings, merged vocabularies: modeling publisher conventions
  as explicit unknowns instead of cleaning them into lies.
- [fail-loud-schema-drift](techniques/fail-loud-schema-drift.md) — shape assertions
  on every fetch, snapshot diffing for versionless sources, epoch discipline for
  the first backfill.
- [session-bound-scraping](techniques/session-bound-scraping.md) — stateful
  pagination protocols, live-probe verification notes, request budgets, honest
  partiality.
- [licence-and-privacy-by-construction](techniques/licence-and-privacy-by-construction.md) —
  logging terms at the adapter boundary and compiling privacy obligations into
  what the code can extract.
- [entity-name-normalization](techniques/entity-name-normalization.md) — one
  explicit fold table, ingest-time persistence, and the boundary between a name
  match and an identity claim.

---
layer: technique
type: technique
subject: public-procurement-analysis
technique: contract-registry-record-model
status: forged
laws: [disclose-never-repair, missing-is-not-zero]
shared_with: []
use_when: [building an ingest for a contract registry, choosing the corpus key, parsing registry exports]
---

# Contract registry record model

The concern: decide, before the first row is stored, what a registry record *is* —
which of its identifiers is the durable key, which fields are assertions and which
are publication metadata, and what the parser does when the source violates its own
shape. Every downstream error in procurement analysis traces back to a record model
chosen implicitly.

## The four identities

A single row in a contract registry participates in four identity spaces. Conflating
any two corrupts the corpus:

- **Contract identity** — the underlying agreement, stable across amendments and
  corrections. This is the corpus key: nodes, joins and counts hang off it.
- **Version identity** — one publication event in that contract's history. Registries
  typically expose a second id sequence for versions, and the web URL of a record is
  usually the *version* id, not the contract id. The two sequences often overlap
  numerically, so a mistaken key does not error — it silently attaches the wrong
  contract's metadata, or duplicates the corpus on re-ingest. Decision rule: **key on
  the contract id, store the version id as an attribute, and test the distinction
  with a concrete pair of records whose ids collide across the sequences** before
  trusting any join.
- **Party identity** — the legal persons on the contract, carried by the
  jurisdiction's company identifier where one exists. Names are display strings, not
  keys: they vary by encoding, abbreviation and legal-form suffix.
- **Publication identity** — who published, when, and under what duty. The publisher
  is usually one of the parties but is a distinct role; searches and joins that
  assume "publisher = buyer" or "publisher = one specific side" inherit that
  assumption as a blind spot (see registry-coverage-blind-spots).

## Assertions versus metadata

Model each field as one of: an **assertion by the publisher** (parties, value, basis,
dates, direction flags), **registry metadata** (validity flag, version linkage,
publication timestamp), or **payload you must justify keeping** (attachments,
signatory names, addresses). The third class matters legally: bulk registry exports
routinely contain personal data, and re-use terms can make the harvester a data
controller with deletion obligations. The robust posture is allowlist-by-construction
— retain only records matching an explicit entity allowlist and drop personal-data
fields at parse time, so compliance is a property of the parser rather than a
cleanup job. Re-harvesting from current exports is then how upstream deletions
propagate.

## Parsing rules

- **"Not stated" is a value.** Registries have explicit not-stated sentinels for
  contract value and other fields. Parse them to null with the sentinel recorded —
  never to zero, and never silently: a zero-valued contract and an undisclosed one
  are different facts, and only one of them is a story.
- **Fail loudly on shape drift.** Where the source is scraped or semi-structured,
  assert the expected shape (header labels, column count, element names) on every
  fetch and refuse to parse on mismatch. A parser that guesses through a shifted
  column fabricates a contract value out of the wrong cell. Assert what the source
  actually renders — not what it "should" render; asserting a label the source never
  emits turns a cosmetic difference into a false alarm, so pin labelled fields by
  label and unlabelled ones by count.
- **Suppress and count, never repair.** Impossible dates, malformed values, and
  broken rows are excluded with a counter and a reason, and the exclusion count is
  part of the corpus's coverage statement. A repaired value is an invented value.
- **Record the retrieval conditions.** Session parameters, page caps, search-side
  choices, and harvest date are part of the record's provenance — the same query
  re-run later must be distinguishable from the original, because registries mutate.

## When not to use

Do not build a bespoke record model when the jurisdiction publishes in a documented
open-contracting schema with releases and records already modeled — adopt that
model's contract/version separation instead of re-deriving it. And do not over-model
a one-off manual lookup: the four-identity discipline pays for itself at corpus
scale; for a single contract read by a human, the registry's own web page is the
model.

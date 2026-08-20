---
layer: technique
type: technique
subject: nonprofit-verification
technique: registry-adapter-contract
status: forged
laws: [provenance-per-field, clean-is-not-ready]
shared_with: []
use_when: [adding a second or later registry source to a verification pipeline, normalizing heterogeneous registry responses into one aggregatable shape, id-based and name-based sources need to run through one call]
---

# Registry adapter contract

One verification pipeline, many registries: a national business register
queried by identifier, an exempt-organization list queried by tax id, a
sanctions screen queried by name, an annual-filing index, a
federal-contractor roster. Each has its own transport, its own status
vocabulary, its own failure shapes. The technique is to force every source
behind one adapter interface returning one normalized result shape, so that
aggregation, display, and the eligibility verdict are written once and never
learn source-specific quirks.

## The contract

Each adapter declares:

- **A stable source key** matching the jurisdiction profile's declared
  source list, so "which checks apply here" is enumerated from the profile,
  not hardcoded in the pipeline.
- **An implemented flag** — a source can be declared on a jurisdiction
  before its adapter exists, and the pipeline must be able to say "declared
  but not built" without a fake result.
- **One verify function** taking a *subject* that carries both the
  identifier and the claimed name (plus optional region). Id-based sources
  read the identifier; name-based screens read the name; carrying both in
  one subject lets every source share a single fan-out call instead of
  splitting the pipeline by lookup style.

Each result carries: the source key, the normalized subject id actually
checked, the three-valued outcome, the adapter-specific raw status, the
canonical name the registry returned (or null), the registered legal-form
code (or null), a check timestamp, and a human-readable detail sentence
written *at check time*. That per-field provenance is what lets a later
reader — a reviewer, a funder, an aggregator — re-derive the verdict
instead of trusting a boolean.

## Decision rules

- **When two conveniences encode the same fact (an `ok` boolean and an
  outcome enum), derive one from the other in a single constructor,
  because** any shape assembled independently at N adapter sites will
  eventually drift at one of them, and a drifted convenience flag is a
  verdict bug that no per-adapter test catches.
- **When each source has its own rich status vocabulary, keep it — in the
  raw status field — and map it to the shared outcome inside the adapter,
  because** the classification from source-specific status to outcome is
  per-source domain knowledge (see the outcome technique), while everything
  downstream must be able to remain source-agnostic.
- **When the human detail sentence can be written at check time, write it
  then, because** the adapter is the only layer that still knows *why* —
  reconstructing "no record, but that's normal for a foundation-funded org"
  from a status code later loses exactly the nuance that matters.
- **When two sources read the same upstream (one public mirror serving both
  an exemption check and a filings check), share one fetch-and-cache client
  beneath two adapters, because** the adapters answer different questions
  and must stay separate results, but a doubled network call and doubled
  cache entry per applicant is pure waste — the seam belongs below the
  contract, not in it.
- **When the check must not fire on garbage input, prevalidate inside the
  adapter before any network call** (see the checksum technique) **and
  return an input-shaped status, because** callers should not need to know
  which sources have validatable identifiers.

## Aggregation stays dumb on purpose

The fan-out runner filters to implemented adapters, calls them in parallel
with one shared subject, and returns one result per source. It contains no
per-source branches. The moment a runner grows `if (source is the sanctions
screen)` logic, the contract has failed — that knowledge belonged in the
adapter's own outcome classification. The test for a healthy contract:
adding the next jurisdiction's registry touches one new adapter file and one
profile declaration, and zero lines of aggregation, verdict, or display
code.

## When not to use

Do not build the abstraction for a single source with no second source in
sight — a one-adapter registry is ceremony, and the right contract is much
easier to see once a second, structurally different source (especially a
name-based screen next to an id-based lookup) forces the real seams. And do
not stretch the contract to cover non-verification lookups (address
enrichment, financial-data pulls) just because they also call registries:
the contract's shape is dictated by the three-valued verdict, and a source
that produces data rather than a verdict deserves its own interface.

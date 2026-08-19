---
layer: technique
type: technique
subject: funder-research
technique: schema-validation-at-boundary
status: forged
laws: [untrusted-text-is-data, honest-null-over-forced-guess]
shared_with: []
use_when: [parsing research-agent output into typed rows, deciding which malformed candidates to repair versus reject, keeping a corpus schema stable across many discovery sources]
---

# Schema validation at the boundary

Everything a research agent returns is text until proven otherwise. The
technique: one validation boundary through which every discovered candidate
must pass before anything downstream may treat it as data — and past which
nothing needs to re-check what the boundary guarantees. The boundary does
three jobs in order: extract structure from text, validate structure into
typed fields, and reject implausible values with recorded reasons.

## Extraction: tolerate wrapping, not content

Agents wrap output — explanation before the payload, formatting fences around
it — even when told not to. Fighting this with stricter instructions loses;
tolerating it at the parser wins. The extractor scans for the outermost
payload delimiters, tolerates fences and leading prose, and parses what it
finds. The tolerance is *positional only*: the payload itself is parsed
strictly, and anything that does not parse as the demanded structure yields
an empty result, never a best-effort partial. Lenient location, strict
content.

## Validation: mandatory core, honest-null periphery

Fields split into two classes, and the split is the design decision:

- **Mandatory identity fields** — a title and a funder, at minimum. A row
  missing either is not a degraded opportunity, it is not an opportunity;
  reject it. These are also the fields the deduplication key derives from, so
  admitting a row without them corrupts identity, not just completeness.
- **Nullable enrichment fields** — deadline, amounts, eligibility, summary,
  web address. Null is a *legitimate value* here, by the same contract the
  discovery instruction promised the agent ("if unsure, use null"). A
  boundary that rejects nulls in enrichment fields teaches the pipeline's
  upstream to guess, which is precisely the behavior the whole subject exists
  to suppress. Coerce where coercion is safe and deterministic — numeric
  strings with currency punctuation into numbers, whitespace-padded strings
  trimmed — and null where it is not.

## Plausibility: reject the checkable lies

Structural validity is not truth, but some lies are checkable without
touching the network, and the boundary owes downstream those checks:

- **A stated deadline in the past** rejects the row. The pipeline's product
  is actionable opportunities; an expired one is not degraded, it is out of
  scope — and a fabricated row is more likely than a real one to carry a
  stale date.
- **Negative amounts** reject the row. There is no valid reading.
- **A web address that is not a fetchable scheme** rejects the row —
  reachability is a later, network-touching stage, but scheme validity is
  free and a non-web "address" is noise or fabrication.
- **An unparseable date** rejects the row rather than coercing to null: the
  agent was offered null and instead produced something date-like that isn't
  one, which is exactly the shape of an invented value.

Every rejection records its reason into the run log. The reasons are the
tuning surface: a spike in "missing funder" points at instruction drift; a
spike in "deadline in the past" points at the agent surfacing archive pages;
a spike in unparseable payloads points at the output-format contract
breaking. Silent drops make all of that invisible.

## The boundary is also where identity is minted

The deduplication key is computed at the boundary, from identity fields only
— jurisdiction, funder, title, and the stated deadline — never from the whole
payload, whose enrichment fields legitimately vary between discoveries of the
same program. A second, looser key handles cross-source identity: folding
case, punctuation and diacritics so the same program discovered fresh and
already loaded from a feed collapse together, in every script and market.
Both keys exist because they answer different questions — "is this row
already staged?" versus "is this opportunity already served?" — and the
second must run *before* expensive verification, so known opportunities cost
nothing to rediscover.

## Decision rules

- When tempted to auto-repair a malformed row (infer the funder from the
  title, guess the deadline from the summary), reject instead — repair at
  the boundary is fabrication with extra steps.
- When a new discovery source comes online, extend the boundary's coercions,
  never downstream code — one boundary, many sources, one schema is the
  contract that keeps a multi-source corpus coherent.
- When rejection rates for a source exceed roughly a third of its volume,
  stop and fix the instruction or the source; a boundary discarding most of
  what it sees is a symptom, and the surviving fraction is not necessarily
  the trustworthy fraction.

## When not to use

This boundary validates *structure and plausibility*, not truth — it must not
grow network calls or agent calls; those belong to the verification stage,
and mixing them makes the boundary slow, flaky and untestable. It is also the
wrong tool for trusted structured feeds with their own ingest contracts:
those have publisher schemas to validate against, a stronger guarantee than
plausibility. This technique is for the untrusted, generative path.

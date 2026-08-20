---
layer: technique
type: technique
subject: claim-verification-and-provenance
technique: structured-review-emission
status: forged
laws: [lead-not-finding, provenance-or-nothing]
shared_with: []
use_when: [emitting machine-readable fact-check markup, deciding which claims crawlers may see as reviewed, designing the emitter API for review markup]
---

# Structured review emission

A structured review markup standard — the vocabulary crawlers and search
surfaces ingest to display "fact checked" results — is not an export format.
It is a **speech act toward machines**: emitting it asserts that a named
claim was reviewed and assigned a rating. Machines consume that assertion
without reading hedges. The whole technique reduces to one sentence: **emit
the markup only for claims that passed the human review gate, enforce that
rule inside the emitter, and for everything else the honest machine-readable
statement is silence.**

## The failure this prevents, told once

The natural first implementation emits markup for every claim page and stuffs
the review state into the rating field as a sentence — "awaiting human
review" where a number belongs. Two lies ship at once. A crawler that does
not parse the rating as prose ingests the page as a completed fact-check, so
an unreviewed machine-generated lead surfaces in search results wearing the
publisher's authority as a verified finding — the exact promotion
[lead-not-finding](../../../_laws.md#lead-not-finding) forbids, now performed at
web scale toward consumers who cannot see the caveat. And the rating field
itself is malformed: a sentence in a numeric slot is not a hedge, it is an
invalid rating that each consumer resolves however it likes. There is no
"weakened markup type" for pending claims worth inventing; absence of markup
is a well-defined machine statement ("this publisher does not claim to have
reviewed this"), and it is the only true one.

## Enforce at the emitter, not the call site

The emission function takes a claim (or receipt) and returns either the
markup object or null, and **the human-gate check lives inside it**:

- Standing *verified* → emit.
- *Pending*, *rejected*, *ungated*, no gate applicable (an entity page, a
  deterministic derivation) → null, unconditionally.

Call sites are absent-minded by nature — new surfaces get built by people who
have never read the review-gate doctrine — so a rule enforced by convention
at N call sites is enforced at N−1 of them. One emitter, one check, and a
claim's default standing is pending, so a call site that forgets to set the
field cannot accidentally publish. When two surfaces must emit (a receipt
page and a claim capsule), they share the emitter or duplicate the *rule* in
the same words with a pointer to the owning statement — never re-derive it
loosely.

## What a well-formed emission carries

- **A numeric rating on a declared scale** (value, best, worst) plus a short
  human-readable alternate name — and the on-page verdict visible to human
  readers must be the same statement as the machine rating. Publishing norms
  for fact-check surfacing require the visible verdict and the markup to
  match; a divergence is treated as markup abuse, and deserves to be.
- **The permanent claim address as the reviewed item's identity** — the
  machine-readable claim names itself by the same address the verification
  gate resolves, closing the loop: a crawler, a citing article, and the gate
  all speak of one identifier
  ([provenance-or-nothing](../../../_laws.md#provenance-or-nothing)).
- **The claim restated as a human sentence** (subject, relation, object — or
  metric and value), derived from the same view model as the page, never
  hand-written.
- **Appearance links only from stored identifiers.** Where the claim's
  entities appear in public registries is listed literally from stored
  registry ids — never guessed URLs; deduplicated in stable order so the
  emission is byte-reproducible.
- **The review date, then the computation date.** The published date is the
  date of the *human decision*; the derivation date is the fallback only when
  the decision timestamp was not recorded. Dating a review by its computation
  inflates the review's recency.
- **An absolute permalink or none.** Consumers refuse relative URLs; when the
  canonical base cannot be honestly determined at render time, omit the URL
  field — a fabricated domain is worse than a missing property.
- **One claim, one page.** Host a given review's markup at a single canonical
  address; duplicating it across pages degrades trust with the consumers the
  markup exists for.

## Decision rules

- When a reviewer *rejects* a claim, do not emit a negative-rating review by
  default. A rejection of a machine-proposed link is quality control on your
  own pipeline, not an editorial finding about the world; publishing it as a
  rated fact-check asserts an investigation that did not happen. Emit rated
  negative reviews only for claims that went through the full editorial
  process with a human author.
- When the standing later changes (verified → rejected on appeal), the
  emission must disappear or change with it — which recomputation gives you
  for free if the markup derives from the live receipt, and which a cached
  emission silently violates.
- When a consumer's eligibility rules for the markup tighten (they
  periodically do), the gate check is the thing to audit first: every
  historical over-emission is a standing trust liability with that consumer.

## When not to use it

Products with no human review lane should emit **no** structured review
markup at all — not even for their strongest deterministic derivations.
Machine-checkable is not the same claim as human-reviewed, and the markup
vocabulary only speaks the second. Publish the methodology, the addresses,
and the verification gate instead; let the markup wait until there is a
human decision for it to describe.

---
layer: golden-path
type: golden-path
subject: claim-verification-and-provenance
status: forged
use_when: [publishing numbers the press will quote, building a public verification surface, designing permalinks for derived claims, emitting machine-readable fact-check markup]
techniques:
  - claim-ref-addressing
  - recomputation-receipts
  - three-verdict-vocabulary
  - derivation-comparison
  - gate-state-as-modifier
  - structured-review-emission
---

# Claim verification and provenance

An accountability platform does not publish pages; it publishes **claims** —
"this firm received this sum", "this representative voted with that bloc 84%
of the time" — and those claims leave the platform immediately. They are
copied into articles, screenshots, and arguments, where they live for years
detached from the surface that computed them. The subject of this document is
the discipline that keeps a detached claim honest: giving every published
figure a **permanent, machine-checkable address**, making the thing at that
address a **re-derivation rather than a stored assertion**, and operating a
**public gate** that answers, in a closed vocabulary, the only question a
citing reader ever has — *does this still hold?*

The naive reading is that provenance is a footnote: store the source URL next
to the number and you are done. That produces citations that rot silently. The
source moves, the formula changes, the reviewer rejects the underlying link —
and the footnote keeps vouching for a number nobody would recompute today. The
principal reading inverts the direction of trust: **the citation is not
evidence about the number; the number must be re-derivable from the citation.**
Everything below follows from that inversion.

## The address is the claim

A verifiable claim needs an identity that outlives every rendering of it. The
load-bearing move is to make the address *carry the full identity of the
claim* — the dataset, the metric, the subject; or the graph edge's endpoints
and relation — rather than pointing at a database row by surrogate key. When
the address encodes the claim itself, the server can re-derive the answer
from nothing but the address and the current store: no lookup table that can
drift, no id that a re-import renumbers, no "citation table" that becomes a
second source of truth. A row id names *where a claim once sat*; a
self-describing address names *what was claimed*, and only the second survives
a rebuild of the store.

Two consequences are non-negotiable. First, **an undecodable address is a
refusal, not a repair**: a malformed reference returns "we do not know this
claim", never a best-guess match and never an empty frame that looks like a
page still loading. A verification surface that guesses has already lied once.
Second, addresses are **append-only forever**. Every address ever issued is a
promise; a format migration keeps decoding the old shape, and a claim the
current store no longer carries gets an honest "this record is gone" page that
states what the address *asserted*, salvaging whatever context still exists —
because the reader arriving at a dead citation is the reader you can least
afford to abandon.

## What the address resolves to: a receipt, recomputed

The page behind a claim address is a **receipt**: the claim restated, the
data behind it, how it was derived (which pass of which pipeline, by which
method, when), what human review it has or has not received, and the primary
registries where the reader can check the underlying entities without
trusting the platform at all. The receipt is **derived fresh on every
request** from the same store and the same code paths that produced the
published figure — it is an addressed computation, not a stored document.
A cached receipt is a claim about the past wearing the tense of the present.

The receipt discloses; it never repairs. Weights render exactly as stored —
rounding a documented value is falsifying a document. Missing fields say they
are missing. An entity that has vanished from the store renders as its literal
identifier, never a reconstructed name. And the receipt reports the state of
human review truthfully: a relation that passes through a review gate but has
no recorded decision reads "awaiting review", never "verified" and never
blank — while a purely deterministic derivation says explicitly that no
review queue exists for it, rather than implying a reviewer who is not coming.

## The gate: one door, three answers

On top of addresses and receipts sits the public gate: paste any citation —
an address, or an address plus the value as quoted — and get a verdict. The
gate's vocabulary is deliberately closed at **three verdicts**: *verified*
(today's re-derivation yields the same content), *moved* (the address is
valid but the value or content has changed since citation — shown with both
sides and both dates), and *unknown* (the reference cannot be decoded, was
never issued, or the record is gone — each with its stated reason). No fourth
verdict, ever. Every pressure to add one — "verified but stale", "probably
fine", "verified with caveats" — is better expressed as a *modifier* on one
of the three, because a vocabulary that grows loses the property that makes
it citable: a reader can hold three words in mind and know exactly what each
excludes.

Two subtleties in the vocabulary carry most of its value. **Verified means
what was re-derived matched — nothing more.** For an existence claim ("this
edge is in the graph"), verified attests existence, not approval; the human
review standing is an orthogonal modifier, because a rejected link *remains
in the graph* precisely so the rejection is auditable, and a gate that
conflates the two axes will print a large confirming banner over a claim a
human refused. And **the same number is not the same claim**: when the value
matches but a different formula wrote it, the honest verdict is *moved*, not
*verified* — agreement between two different derivations is a coincidence,
and stamping a coincidence "verified" is the exact failure the gate exists
to prevent.

The gate also does not adjudicate by its own lights. It translates the
answers of the same loaders and the same shared arithmetic that publish the
figures — one definition, imported by both the publishing surface and the
verifying surface, so that verification failure means the world changed, not
that two implementations disagreed about encoding.

## Provenance is compared, not just displayed

A derivation stamp ("formula ref @ pass N, computed on date D") is only
worth carrying if something *compares* it. Three comparisons close the loop:
the gate compares a citation's recorded derivation against today's (catching
the changed-formula coincidence); every aggregate surface compares the stamps
across its whole population and reports *uniform / mixed / absent* rather
than reading one row's stamp and generalizing — a half-recomputed store has
no single provenance, and picking one is fabrication; and an invariant
sentinel compares the store's stamps against what the code declares today,
so a corrected formula with uncorrected data becomes an alarm instead of a
silently stale published ranking. The sentinel's own report must obey the
same honesty: a run that never reached the data emits an "unevaluable"
report, because nothing anywhere may let *never ran* render as *passed*.

## Machine-readable review is a privilege, not an export

Structured fact-check markup — the standard vocabulary crawlers and search
surfaces ingest — asserts to machines that a claim was **reviewed**. Machines
do not read hedges: a rating slot filled with "awaiting human review" is
consumed as a review. So emission is gated at the emitter, not at call
sites: markup goes out **only** for claims that passed the human gate, with a
numeric rating on a declared scale matching what the page visibly shows, and
the permanent claim address as the reviewed item's identity. For everything
else — pending, rejected, ungated — the only honest machine-readable
statement is silence. This mirrors the published norms of the fact-checking
field itself: the verdict shown to humans and the rating shown to machines
must be the same statement, sources must be citable enough to replicate the
check, and the methodology must be public so a reader can disagree with the
method rather than the data.

## Failure modes this standard exists to prevent

- **The footnote that outlives its number** — provenance stored as decoration,
  never re-derived, vouching for a figure nobody could recompute.
- **The repaired address** — fuzzy-matching a malformed reference to the
  "probably intended" claim; one guess destroys the surface's authority.
- **The coincidence stamped verified** — same value, different formula,
  confirmed as if the derivation had not changed.
- **Existence read as endorsement** — "the record is there" rendered with the
  visual weight of "a human approved this".
- **The single-row generalization** — one row's provenance published as the
  whole population's, hiding partial recomputes entirely.
- **The hedged machine assertion** — structured review markup emitted for
  unreviewed claims with the caveat hidden in a field machines never read.
- **"Never ran" rendered as "passed"** — a verification job whose absence of
  output is indistinguishable from a clean bill.

## The techniques

- [claim-ref-addressing](./techniques/claim-ref-addressing.md) — self-describing
  permanent addresses; refusal over repair; append-only address space.
- [recomputation-receipts](./techniques/recomputation-receipts.md) — the receipt
  as an addressed computation: derived per request, disclosing, never caching
  an assertion.
- [three-verdict-vocabulary](./techniques/three-verdict-vocabulary.md) — the
  closed verified/moved/unknown vocabulary and why it never grows.
- [derivation-comparison](./techniques/derivation-comparison.md) — carrying and
  comparing the formula identity behind a value; uniform/mixed/absent over
  populations; the sentinel against silent staleness.
- [gate-state-as-modifier](./techniques/gate-state-as-modifier.md) — human
  review standing as an axis orthogonal to the verdict; ungated as a
  first-class state.
- [structured-review-emission](./techniques/structured-review-emission.md) —
  emitting standard fact-check markup only past the human gate, enforced at
  the emitter.

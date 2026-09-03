---
layer: technique
type: technique
subject: decentralized-artifact-distribution
technique: origin-signed-record-with-index-as-cache
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
stage: multi-service
use_when: [designing where a third-party listing's authoritative copy lives, an operator wants to hand-edit a listing row and you need the argument against it, deciding what a client must be able to verify without trusting the index, writing the acceptance test for a hostile index]
---

# Origin-signed record with the index as a cache

A registry that lists other people's artifacts has to store *something*, and the
decision that fixes its trust model is made early and quietly: **is the stored
row the listing, or a copy of one?** The centralized answer — the row is the
listing — is not merely a different implementation. It makes the operator the
only party who can make a statement in the system, which means compromising the
operator is equivalent to compromising every publisher at once, and it means a
consumer has no test it can run to detect that this has happened.

The inversion: the listing is a **record the publisher signs in a store the
publisher controls**, addressed by an identifier derived from the publisher's
own key material rather than issued by the registry. The index subscribes to
changes, fetches the record from the publisher's store, verifies it, and stores
the result as a cache with a materialized view over it for search and browse.

## The procedure

1. **Publisher identity is a portable, self-controlled identifier**, resolvable
   to the store that holds the publisher's records and to the public key that
   signs them. It is not an account row in the registry. The test of portability
   is whether the publisher can move to a different store, or list on a second
   index, without renaming anything.
2. **The index subscribes** to a change feed and receives, for each event, a
   claim: this publisher, this collection, this record key, this revision.
3. **The index fetches from the publisher's store** — not from the feed, which is
   a notification and not a source. The fetch returns the record together with
   the proof material needed to verify it.
4. **The index verifies before it stores.** Two things, together: an **inclusion
   proof** that this record is genuinely part of the publisher's committed
   collection at this revision, and a **signature** over that commit by the
   publisher's declared signing key. Either alone is insufficient — a signature
   over a record with no inclusion proof cannot detect a record the publisher
   removed, and an inclusion proof with no signature check trusts whoever served
   the tree.
5. **Verification failures are dropped and counted by reason class**, never
   stored optimistically and never silently discarded. The classes that matter
   are different in kind: transport failures (the store was unreachable, timed
   out, returned a server error) are *retryable and boring*; proof failures
   (bad signature, bad inclusion proof, malformed bytes, mismatched key or
   collection) are *forensic and never retryable*, because the same bytes will
   fail identically forever. A single "ingest error" counter that mixes them
   makes an attack indistinguishable from a bad afternoon on someone's host
   ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
6. **The verified bytes are retained verbatim**, alongside the normalized
   columns the browse view is built from. This is what lets the index re-serve
   the signed envelope to a client that wants to verify for itself, without a
   second fetch to the publisher's store — and it is what makes the normalized
   view demonstrably derived rather than independently authored
   ([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).

## The property this buys, stated as a test

> Point a client at a hostile index. It must not be possible to show that client
> a record the publisher never signed.

Write that test. It is the whole claim, it is cheap to write once the verified
bytes are retained, and a system that cannot express it has an architecture
diagram rather than a trust model. Two variants are worth having beside it: an
index that serves a *stale* revision the publisher has since replaced (the
client must be able to detect this, or the design must state that it cannot), and
an index that serves a record signed by a *different* key than the one the
publisher's identity currently resolves to.

The complementary property is the one to be honest about. A hostile index can
still **withhold** — omit a listing, delay it, bury it in ranking, refuse to
serve it. Nothing in this technique prevents that, and a design that claims
otherwise is wrong. The rule is asymmetric on purpose: *withhold, never forge*.

## The direct read path

Verification at the index protects consumers of the index. It does not protect
against the index, and for the decisions that matter most — installing bytes,
granting capabilities, spending money — a client should be able to bypass it
entirely: resolve the publisher's identity to their store, read the record from
the source, verify it locally, and act on that. The index then becomes what it
claims to be, a discovery accelerator, and the security-critical path does not
depend on it at all ([gate-sees-target](../../../_laws.md#gate-sees-target)).

Two constraints on that path, both learned the hard way:

- **The fetch is to an address a stranger controls.** It is a
  server-side-request-forgery surface and needs the corresponding defences —
  hostname resolution that refuses internal ranges, a byte ceiling on the
  response, an absolute timeout. Records and their proofs are tiny; the ceiling
  exists for the store that streams an unbounded body, not for the honest case.
- **A byte ceiling is derived, not chosen.** Set it from the observed size of a
  real record and its proof plus an order of magnitude, and write the derivation
  beside the number, or the next person raises it to make an error go away.

## What it costs, and why the cost is the feature

State these in the design document, not in the postmortem. They are the same
property viewed from the other side, and a team that discovers them after launch
concludes the architecture was a mistake.

- **The operator cannot fix a listing.** Not a typo, not a wrong category, not a
  broken link. The repair path is the publisher re-signing, and every support
  workflow that used to end in a database edit now ends in correspondence. Build
  the publisher-facing repair tooling as part of the same project, or the
  operator will build a back door and the property will be gone.
- **Key loss is name loss.** There is no reassignment path, because an operator
  who could reassign a name could forge under it. The mitigations are the
  publisher's — key backup, delegated signing keys where the identity scheme
  supports rotation — and the registry's honest contribution is to say so
  clearly before anyone publishes.
- **Deletion is a publisher act, not an operator act.** The index can stop
  serving, which is withholding; it cannot make the record cease to exist, and
  any legal or policy obligation that assumes it can needs to be answered by
  the redaction grant rather than by the storage layer
  ([split-admit-state-and-redact-authority](./split-admit-state-and-redact-authority.md)).

## Decision rules

- **If the index can produce a record the publisher never signed, the index is
  the authority** — whatever the design says. Test it rather than reasoning
  about it.
- **A change feed is a notification, never a source.** Fetch and verify from the
  publisher's store on every event, including events the index generated itself.
- **Inclusion proof and signature are checked together or the check is
  decorative.** Name which one a given code path is missing before shipping it.
- **Retain the verified bytes.** A normalized view that cannot be traced back to
  signed bytes is an independently authored copy with extra steps.
- **Separate transport failures from proof failures in metrics and in
  handling.** They differ in whether retry can ever help and in what a rising
  count means.
- **Derive every ceiling and timeout on the fetch path** from a measured
  property of a real record, and write the derivation next to the constant.

## When not to use it

- **When you are the publisher of everything you list.** A first-party catalogue
  has one authority already, and the machinery here buys nothing while costing
  the operator every repair path.
- **When the artifacts are free and the listings carry no consequence** — a
  gallery of examples, a documentation index. The cost falls entirely on the
  operator and the benefit falls entirely on a threat model that does not exist.
- **When publishers cannot hold keys.** If the realistic publisher is a
  non-technical author on a shared host, an identity scheme that makes key loss
  equal name loss will produce mass abandonment. Either supply custodial identity
  with the honest disclosure that the custodian can forge, or do not adopt this.
- **When the index must be able to correct listings for a regulatory reason.**
  Say so, pick the centralized model deliberately, and spend the effort on
  making the operator's edits auditable instead.
</content>

---
layer: technique
type: technique
subject: public-procurement-analysis
technique: payer-vs-receiver-direction
status: forged
laws: [missing-is-not-zero, lead-not-finding]
shared_with: []
use_when: [attributing money between a public body and a firm, writing copy about who paid whom, aggregating a supplier's public revenue]
---

# Payer vs receiver direction

The concern: a contract record ties parties together; it does not, by itself, say
which way the money flows. "Public body B has a contract with firm X" supports two
opposite headlines — "B paid X" and "X paid B" — and real registries contain both in
the same search result: public bodies buy, but they also sell assets, lease
property, license rights, and collect fees. An analysis that assumes
direction-from-role converts a contract corpus into a stack of claims, roughly half
of which may be backwards for any firm that transacts with the state in both
directions.

## Where direction lives

- **Explicit flags.** Better registries and open-contracting schemas carry per-party
  payer/receiver markers. These are the only ground truth. They are also frequently
  **optional** — in measured national corpora, roughly half of records carry no flag
  at all.
- **Nowhere else.** Contract subject text, party order, publisher role, and value
  sign are all unreliable proxies. The publisher is often the public body regardless
  of direction; subject descriptions are free text; and "the state usually pays"
  is exactly the assumption that fails on the interesting records.

## The three-state rule

Direction is a three-state fact: **paid-by-the-public-body**,
**paid-to-the-public-body**, **not stated**. The decision rules:

1. **Absence of a flag is `unknown`, never a default.** Do not fold "not stated"
   into the majority direction, and do not let it inflate either side of an
   aggregate. A per-firm revenue figure includes only records where the firm is
   explicitly flagged as receiver; everything else is reported separately as
   "direction not stated," with its count.
2. **Strengthen the claim only when the record structure supports it.** A defensible
   "documented payment" predicate is conjunctive: the payee is explicitly flagged as
   receiver *and* the contract has exactly the two parties in question. Multi-party
   contracts, framework agreements with many call-off parties, and flag-less records
   all stay in the weaker "contractual relationship exists" bucket. When X, do Y,
   because Z: when any clause of the predicate fails, demote the record to the
   relationship bucket, because a partially supported direction claim published as a
   payment is a fabricated assertion about a named entity.
3. **The copy must match the bucket.** Three buckets, three sentences: "the record
   documents a payment to X," "the record documents a payment by X," "the record
   does not state the direction of payment." Rendering the first sentence over the
   third bucket is the direction flip — the error this technique exists to prevent.
4. **Directioned aggregates ship their composition.** A total presented as "public
   money received" states how many underlying records were explicitly
   receiver-flagged and how many were excluded as unknown or reverse-flagged. A
   reader must be able to see that the figure is a floor over the flagged subset.

## Direction as a lead generator

Once direction is honest, its *anomalies* become review candidates: a "supplier"
whose corpus is mostly reverse-direction (a buyer of state assets wearing a
supplier's label), or a firm whose flagged and unflagged records diverge in size
distribution. These are leads for document-level review — the contract text states
the direction the flags omitted — never publishable as-is, because flag absence is
overwhelmingly a publisher-diligence artifact, not a concealment signal.

## When not to use

Skip the machinery when the source is an actual payments ledger (treasury
disbursements, invoice-level spend data): there, direction is constitutive of the
record and the three-state model collapses to two. Conversely, do not "fix" a
contract registry by joining a payments ledger and back-propagating direction onto
flag-less contract records without a per-record match — a fuzzy join at aggregate
level reintroduces the assumption through the side door.

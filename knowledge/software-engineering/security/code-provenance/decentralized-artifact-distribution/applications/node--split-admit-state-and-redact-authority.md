---
layer: application
type: application
subject: decentralized-artifact-distribution
technique: split-admit-state-and-redact-authority
stack: node
status: forged
verified_on: 2026-09-03
verified_against: node@22.16
---

# A delegated trust root with a write path and no read path

Citations are against `github:emdash-cms/emdash` at commit
`7a5d9c1838f6afc5649b7bc0940eacf920b40dab`. The version witness is the root
`package.json` `engines` field — `"node": ">=22.16"` — the runtime under which
the aggregator's `typecheck` and `test:unit` scripts run; no per-service runtime
pin exists in the tree.

**This is a negative application.** The three-grant split itself is implemented
well here, and is summarized first so the negative is legible. The finding is
about a *fourth* authority — a delegated publisher-verification trust root —
that is fully specified, ingested, stored, tombstoned and re-served, and is
consumed by nothing that changes any decision.

## The three grants are real

`packages/registry-moderation/src/policy.ts:5-14` defines the trust policy with
the grants as three separate lists — `requiredPositiveSources`,
`acceptedStateSources`, `redactionSources` — plus a policy version and an
effective-from instant. There is no `trusted: true` boolean and no role column.
`stateSources` (line 42) derives the state-believing set as the union of the
state grant and the admission grant in one place, which is the derivation the
technique asks for. The validator refuses an empty `requiredPositiveSources`
(line 60) so the empty list is reachable only from the deny-all path, and
refuses duplicate entries per list.

The evaluator (`packages/registry-moderation/src/evaluate.ts:110-210`) applies
the order the technique prescribes: publisher deletion, tombstone, redaction,
block, conflict, required positives, display state. Redaction is checked before
every positive, and its scope is the point the technique makes about the
second instrument: `redactionUris` (line 135) admits a takedown addressed to the
release URI, to the publisher's profile URI, *or* to the publisher identity
itself, and a takedown carrying no revision identifier applies regardless. So
the revision binding that governs approvals is deliberately relaxed for
takedowns — the grant that must survive a one-byte republish is the one scoped
to the identity, exactly as the sibling technique argues.

The collision rule is present and fails closed: where two terminal values are
simultaneously applicable, or where a source has issued colliding statements,
the result is a distinct `"conflict"` state with reason code
`conflicting-terminal-state` (lines 181-194), and `conflict` is not among the
states that set `visible: true`. No most-recent-wins, no severity ordering.
Applicability for everything else is `label.uri === subject.uri &&
label.cid === subject.cid` (line 89) — the revision binding, in the same
predicate as the subject check.

The aggregator's projection queries join each grant separately
(`apps/aggregator/src/listing-policy.ts:219, 230, 241`), each requiring both
`trusted = 1` and the specific grant column, so a party configured for redaction
only cannot contribute a positive.

## The authority nobody reads

Alongside that, the tree specifies a delegated verification trust root. The
record schema
(`packages/registry-lexicons/lexicons/com/emdashcms/experimental/publisher/verification.json`)
is complete and thoughtful: one identity vouches for another as a trusted
publisher; the official identity publishes these as the trust root and "trusted
issuers may delegate by issuing further verification claims of their own"; the
claim is bound to the subject's handle *and* display name at issuance, so "a
change to either invalidates the verification until the issuer re-attests"; an
optional expiry is defined and clients "SHOULD treat the verification as not in
force after this time".

That is a delegated admission authority with an anti-drift binding and an expiry
policy — a fourth grant, specified more carefully than most systems specify
their first.

The full write path exists:

- The record type is in the subscribed collection set
  (`apps/aggregator/src/constants.ts:27`), so every such record in the network
  is fetched and verified.
- `ingestPublisherVerification` (`apps/aggregator/src/records-consumer.ts:875`)
  validates it against the schema and inserts into `publisher_verifications`
  (line 894).
- Deletions tombstone it (line 1016-1024).
- It is re-served verbatim to clients that ask for the signed envelope
  (`apps/aggregator/src/routes/xrpc/sync-get-record.ts:202-206`).
- Its `verified_at` participates in the ingest cursor floor
  (`apps/aggregator/src/records-do.ts:31-44`).
- It has dedicated unit coverage for insert, replace and soft-delete
  (`apps/aggregator/test/records-consumer.test.ts:348-395, 498-520`).
- The schema not only anticipates the reads, it names them. The table comment
  (`apps/aggregator/migrations/0001_init.sql:137-138`) says ingest "stores the
  facts; the validity check is a query-time concern", and the two indexes are
  annotated with the queries they exist for: `idx_publisher_verifications_subject`
  is labelled *"Hot path: show me all unexpired, non-tombstoned verifications for
  subject X"* (line 156-158) and `idx_publisher_verifications_expires` *"For
  periodic expiry sweeps"* (line 160-162). Both the handle column and the
  display-name column carry comments saying the query-time check compares them
  against current values.

There is no query-time check. A grep for `publisher_verifications` across the tree
returns migrations, the two writers, the cursor floor, the passthrough, and
tests — nothing else. The aggregator's public views carry no verification field
at all: the column lists backing `packageView` and `releaseView`
(`apps/aggregator/src/routes/xrpc/views.ts:67-100`) are enumerated explicitly,
and no verification-derived value appears in either. Neither index is used by
any statement in the tree. The trust policy's three grant lists have no fourth
member for it. Nothing in the admission path consults it.

Meanwhile the shipped changelog entry describing the browse experience
(`packages/admin/CHANGELOG.md:45`, repeated in `packages/core/CHANGELOG.md:98`
and `packages/registry-client/CHANGELOG.md:23`) promises that the admin "uses
the approved author name or publisher DID instead of a mutable handle". A reader
reasonably takes "approved author name" to be backed by the verification record
— that is what the record is for, and it is the one place a display name is
attested by a third party. It is not: the displayed name comes from the
publisher's own signed profile, and the verification record's careful
display-name binding is checked by no consumer in this tree.

## Why this is the most useful sentence the tree gives

A team designing a federated registry will be tempted by exactly this record
type, and it is a good design. The finding is that **specifying, ingesting and
storing a trust root is roughly a fifth of the work, and it is the fifth that
produces no security property.** Until a read path branches on it, the tree
contains a fully-built authority whose compromise costs nothing and whose
correct operation buys nothing — with two indexes, a tombstone path and a test
suite maintaining the appearance that it is load-bearing.

The contrast lives in the same repository. The older centralized marketplace
service keeps an `authors.verified` column that *is* read: every plugin and
theme browse query selects it
(`packages/marketplace/src/db/queries.ts:57, 107, 602, 649`). One operator-owned
boolean that changes what a user sees, against one cryptographically delegated
trust root that changes nothing. The comparison is not an argument for the
boolean; it is the measurement of how much of a decentralized design's value
sits in the consumer half that is easiest to defer.

Three lessons for the technique, stated as they apply to any tree:

- **A grant is claimed by a branch, not by a schema.** If no evaluation path
  reads it, it is not a grant — and the three-list configuration is the right
  place to notice this, because a fourth authority that does not appear there is
  a fourth authority nothing enforces.
- **Anticipatory indexes are evidence of intent, not of implementation.** Two
  unused indexes are the clearest available signal that the read path was
  planned and never landed; they are worth grepping for during a design review.
- **Documentation that describes the intended read path ships before the read
  path does**, and nothing gates it. A changelog line promising a verified
  display is a claim the test suite does not cover, because there is nothing to
  cover.
</content>

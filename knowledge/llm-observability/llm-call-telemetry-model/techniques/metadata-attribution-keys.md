---
layer: technique
type: technique
subject: llm-call-telemetry-model
technique: metadata-attribution-keys
status: forged
laws: [server-owns-the-accounting-clock, estimation-announces-itself]
shared_with: []
use_when: [linking call events to billing customers and products, deciding between a new column and a metadata key, designing per-key or per-customer rollups over heterogeneous store backends]
---

# Metadata attribution keys

The call record carries an open metadata map — arbitrary app-supplied
fields — and the technique is using a small set of **well-known keys inside
that map** as the attribution layer, instead of promoting each to a column:

| Key | Written by | Meaning |
| --- | --- | --- |
| `customer_id` | client SDK | the billing customer this call is attributed to; margin rollups group on it |
| `product_id` | client SDK | the billing product/feature charged |
| `pricing_mode` | client SDK | the pricing lane (standard / batch / flex) the price book should apply |
| `cost_source` | server | how `cost_usd` was determined (`client` / `book`) |
| `api_key_id` | **server only** | the id of the credential that wrote the row |

## Why a map and not columns

Attribution linkage is the schema's fastest-moving edge — new billing
dimensions arrive with every pricing conversation — while the record itself
is persisted across heterogeneous store backends (an embedded local store, a
cloud warehouse, whatever a customer self-hosts). A key in an open map is
carried by every backend unchanged, with **no cross-backend migration**; a
column is a migration per backend per change, and the backend you forgot
becomes the one where per-customer questions silently return nothing. The
trade accepted: map keys are un-indexed residual predicates in queries.
That is tolerable because attribution queries are equality-filtered within
an already-indexed project-and-time range; if one key becomes the hot path
of every dashboard read, *that key* has earned a column (or a materialized
rollup) — promotion is a performance decision made per key, late, on
evidence.

## The discipline that makes a map safe

An open map with conventions rots into an open map with folklore unless
three rules hold:

1. **Named readers, not string literals.** Every well-known key gets an
   accessor on the record type (`customer_id()`, `cost_source()`, …) and all
   consumers go through it. The accessor is where the convention lives,
   where the doc-comment states the ownership and semantics, and where a
   rename remains possible. A codebase querying `metadata["customer_id"]`
   in forty places has forty copies of an undocumented contract.
2. **Ownership stated per key.** Client-asserted keys (customer, product,
   pricing lane) are trusted the way any client claim is: enough for
   grouping, flagged when they feed enforcement. Server-owned keys
   (`api_key_id`, `cost_source`) are stamped at ingest with any client-sent
   value overwritten or stripped — the full mechanics are
   [server-owned-fields](server-owned-fields.md). The map holding both
   grades is precisely why each key must declare its grade.
3. **Absence is a named bucket.** An untagged call has no `customer_id` —
   the accessor returns none, and rollups surface an explicit
   "unattributed" bucket rather than dropping the rows or inventing a
   default customer. The size of that bucket is itself a metric: it measures
   SDK-tagging adoption, and a margin statement that omits it overstates
   how much of spend is actually explained.

## Edge rules earned in production

- **Non-object metadata is client-owned.** A client may legally send a
  scalar or array as metadata. The server's stamping code must handle it:
  it cannot hold a forged `api_key_id` (nothing to strip) and must not be
  clobbered into an object just to plant server keys — losing a client's
  payload to write your stamp is a worse corruption than carrying an
  unstamped row. Null metadata, by contrast, is upgraded to an object when
  the server has something to stamp.
- **Rows predating a key carry no value and fall into the unattributed
  bucket** — never backfill a guessed attribution; a wrong billing linkage
  is worse than a disclosed gap.
- **Query surfaces expose the map generically** (`key` and `key=value`
  predicates) so new keys are immediately queryable without an API change —
  the map's agility is only real if the read path shares it.

## When not to use it

Do not put measurements in the attribution map — token counts, cost,
latency belong as typed fields; the map is for *linkage and provenance*,
identifiers that connect the row to entities the record model does not own.
And do not let the well-known set grow silently: a key consumed by any
rollup belongs in the documented table above, or it is folklore.

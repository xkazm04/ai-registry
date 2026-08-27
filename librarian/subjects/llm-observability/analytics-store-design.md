---
subject: analytics-store-design
domain: llm-observability
last_touched: 2026-08-27
dry_streak: 0
---

# analytics-store-design

First touch: [[2026-08-27-duckdb-changing-physics-of-analytics]] — an `/intake` run
aimed at a different bundle that found this subject's enumeration one item short.

## State

6 techniques, 4 applications (process, rust, sql). Golden path is strong — the
three-adjective contract (fast / portable / honest) and the parity-or-refusal
discipline are among the better-argued things in the bundle.

## 2026-08-27 — the enumeration was one quadrant short

**The catch was an enumeration, found by the rule that an enumeration is a claim.** The
golden path listed its portability targets as four — embedded relational, networked
relational, document, analytical warehouse — and that 2x2 has exactly one hole: the
*embedded analytical* engine. Both statements of the four-item list were corrected
(golden path §Three adjectives and §Heterogeneous backends).

**The sharper half is the amendment to `analytical-copy-partitioning`: the copy does not
have to be a warehouse.** The technique priced the fork as a warehouse decision, which
made its trigger a *scale* question and left exactly two answers beneath it — better
composite indexes, or client-side summation at O(matched rows). An in-process columnar
engine over an exported file is a third. Every structural rule in the technique survives
the substitution unchanged, because they are rules about the **role** (receives, never
originates; never enforces; mirrors the logical schema) and not about the topology.

Consequence, and the reason it matters: **the trigger drops.** A deployment that
correctly refused a warehouse may still be well past the point where scanning in the
service is the wrong answer. The amendment also notes that partition grain stops being a
pricing decision where nothing is billed by bytes scanned.

Discriminator recorded for future runs: **a warehouse earns its keep when the copy must
be queried by people and systems outside this service** — shared SQL access, other
teams' tooling, multi-year retention, volumes past what one host should scan. Below
that, the copy has one consumer, and a consumer that links the engine needs no service
to talk to.

## Open leads (banked, with return conditions)

- **`fixed-width-timestamp-encoding` still enumerates three backends** ("an embedded
  relational store, a networked relational store, and a document store") and separately
  handles the warehouse's native temporal type. Not corrected this run — the embedded
  analytical engine's type system was not verified, and guessing at it would be the
  phantom-fix failure. Return when a connected project runs the hybrid and the encoding
  can be checked rather than assumed.
- **`capability-flags-and-refusal` has not been re-read against the fifth backend.** Its
  refusal vocabulary was designed around a document store that cannot aggregate; the
  embedded analytical engine's refusals are the mirror case (aggregates brilliantly,
  should never serve point reads or enforce). Likely an amendment, not a technique.

## Cross-bundle boundary (do not link)

`software-engineering/backend-platform/data-layer/embedded-db/techniques/analytical-reads-off-the-serving-store`
holds the same fork from the other end: it decides which reads leave a serving store,
this subject shapes the copy they land in. Same fork, opposite ends. The discriminator is
stated in prose on each side and neither absorbs the other — cross-bundle links are
forbidden, and a later run should recognise the shape rather than re-litigate it.

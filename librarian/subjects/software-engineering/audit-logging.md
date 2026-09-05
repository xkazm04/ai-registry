---
subject: audit-logging
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# audit-logging

Touched by [[2026-08-31-tigerbeetle-blog]] — gained `two-clock-records` plus
`sql--two-clock-records`, and a **correction to a stated rule in the golden
path**.

The anatomy section read *"Time — assigned at the chokepoint, one clock per
ledger."* That is correct where the ledger originates the fact — a trail of
actions this system performed, where doing and learning are the same instant —
and wrong for any ledger recording facts learned from elsewhere. The bullet now
carries the condition and points at the technique.

The finding came from the Phase 6 **asymmetry hunt**, not from a gap:
`append-only-design` already owns "correction is a new record", and everything
it records about a correction (who, when, why) sits on the *recorded* clock;
nothing captured when the corrected fact was actually true. `audit-querying`
independently treats time as a single "time window" filter. Two techniques
mentioning time, neither modelling the second clock.

Application is a **confirming tree** (`politicas`): an independently-designed
bitemporal schema whose enforcement splits exactly where the technique
predicts — record clock `not null default now()`, world clock nullable and, by
the migration's own admission, unpopulated. It also stores the unknown world
time as NULL rather than defaulting it, which is `unknown-is-not-a-value`
observed in the wild and the reason a later backfill is still possible.

## Open leads

- **The query obligation is untested.** Whether read paths *name* which clock
  they range over could not be assessed while only one clock has values in it.
  Return when a tree populates both.
- **A third clock.** The technique notes that systems accumulate more times
  (received, valid-from, approved, posted) and that two is the minimum rather
  than the maximum. No corpus material on naming them.

## Proof debt

`sql--two-clock-records` is `structural-only`. The instrument that would
promote it: `count(*) where valid_from is not null` against a populated
database, which this run did not open.

## 2026-09-02 - `/intake` gstack (run `intake-gstack-0902`, intake 2.1.0)

Source-tree application `node--best-effort-with-accounting` written against a
hash-chained egress-receipt ledger: claim-before-send with the polarity per sink class
pinned as test data (fail-closed for state leaving the machine, fail-open for user-facing
sinks), a new-sink scanner with no unwired bucket, and the threat model stated verbatim
(forensic, not a control; tail truncation undetected). Where it falls short of the
technique: no durable miss counter for fail-open sends, and rotation is a comment. A
catch, not an amendment - the technique already says both halves.

## Intake 2026-09-05 (`intake-utopia-0905`, source `github:deeplethe/utopia`)

**Landed:** `record-axis-predicate` (new technique - the read side of two clocks: one
`held_at(T)` predicate per table composed in one module, null meaning now so one
statement serves replay and the present, write paths keeping the current-row guard, a
row rewritten in place taking its clock from the ledger that rewrote it, a both-directions
database-backed test, the full-text-index boundary). Application
`rust--record-axis-predicate` over `record_axis.rs` and the two tests that pin it.

**Single-source debt, named on day one.** One tree (record 0019, `record_axis.rs`).
Counterpart for the reconcile lane: the SQL standard's system-versioned tables (`FOR
SYSTEM_TIME AS OF`), a standard-tier source that states the same predicate as a
language feature; the technique is what a store without that feature builds by hand.
`two-clock-records` is the write-side sibling and was cited, not restated.

**Applied to politicas as a simulation - and the debt above closed the same day.** The
seam search that began "no fleet project rewinds a record clock" found politicas'
`features/shared/provenance/asOfLens.ts`: an as-of lens over provenance receipts, one
pure module both surfaces read, six closed states, and tests pinning that a day resolves
to its end and that three "we don't have it" states must not sound alike. Three real
cases (before the migration epoch; a derived family that cannot be replayed; a malformed
day) walked under the technique as first written versus with a "three absences" section:
better for the section, which was added. `next--record-axis-predicate` written. The
technique is now two-sourced across two languages and two stores; the SQL-standard
counterpart remains the reconcile target.

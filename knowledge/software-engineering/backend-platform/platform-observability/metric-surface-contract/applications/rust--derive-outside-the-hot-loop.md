---
layer: application
type: application
subject: metric-surface-contract
technique: derive-outside-the-hot-loop
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.97
applied: code
ab_verdict: better
---

# A store instrument whose healthy path takes no lock, pinned by a test

An embedded-SQLite job and dataset store measures its own statements through one
chokepoint that every measured operation passes. The hot loop here is that chokepoint:
its per-call cost is paid by the whole worker pool, so the technique's split applies
literally.

## 1. The split was already there, in prose

The write path emits facts and nothing else: one clock read, one packed integer stored
into a fixed ring slot, and a handful of relaxed atomic adds. No allocation, no
formatting, no lock, no use of the database. Percentiles, windows, the slow-line
comparison for reporting, and every label come from a snapshot taken at read time, paid
by the one operator who asked. This is steps 2 and 4 of the procedure, done well, with
the cost written into the module header.

## 2. The seam chosen to falsify

The prose claimed more than any test held. The push-mode consumer (a rate-limited slow
operation log line) takes a per-key mutex, and its header says the mutex and the
formatting are "paid by the pathological case, never by the healthy one". The suite
asserted the burst summary and the breach count, but nothing asserted that a healthy
call stays out of the mutex. A caught outcome would teach that the budget rule had no
guard: a refactor that moves the lock above the threshold check would put a shared lock
on every operation of the hottest chokepoint and every existing test would stay green.

## 3. A and B

- **A (suite as it was):** with the lock moved ahead of the threshold check, 13 of 13
  store-instrument tests pass.
- **B (one new test):** the test holds every per-key warn mutex on the test thread and
  runs a healthy record plus a below-the-line warn check for all 14 keys on a worker
  thread, with a 5 second join. On the correct code it passes in milliseconds; on the
  same mutant it fails after the 5 second timeout. Target: mutants caught 0 of 1 to 1 of
  1. Floor: the 13 existing tests, fmt and clippy with warnings denied stayed green.

## 4. What the technique gained

Nothing changed in the rule. The finding is about its enforcement: the decision rule
"what stays in the fast path" is a statement about locks and allocations, and the
cheapest durable guard for the lock half is a test that holds the lock from outside and
asserts the fast path does not wait. The allocation half has no equally cheap guard in
safe Rust and stays prose. The nearest pairing is
[same-process-monotonic-intervals](./python--same-process-monotonic-intervals.md), which
covers the clock read this write path takes.

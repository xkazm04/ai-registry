---
domain: software-engineering
subject: bounded-enumeration
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
depth: L3
---

# bounded-enumeration

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - `/deepen`, first pass (dp-be0926)

Dispatched by the Curator lane on "single stack (go)". There were four
lanes:
- a read of the one fleet tree whose map joins this subject with a real
  paging surface (a Rust data service over SQLite, `strong` on its sync SDK);
- a measurement in that tree;
- web counter-evidence on six claims;
- a blind training-data lane.

**Counter-evidence: one claim refuted as stated, five conditioned, none
left absolute.**
- "Consistent view is unbounded by construction": refuted as stated. A
  versioned store pins a read version in the position, bounded by its
  retention horizon, with a distinct expiry error. An immutable change feed
  from a walk's high-water mark is the other bounded route.
- "Never an opaque cursor": conditioned.
  - The leak is in what a position is computed from, not in its being a
    token. A sealed token does stop decoding, and the published conventions
    mandate opaque tokens.
  - When the order is not key order, the position is the delivered row's
    sort tuple.
- Seek guarantee ("no entry that existed is skipped"): conditioned on a sort
  value written once, a unique last column, and predicate = ORDER BY tuple.
- Over-ceiling refusal and zero-means-ceiling: conditioned. This is one
  policy engine's posture and the minority one. A clamp is silent only
  without a continuation, and zero is absent where the wire cannot tell them
  apart.
- "Lowest limit wins because permissions intersect": the behavior is
  confirmed and the justification corrected. Grants union, so the minimum is
  a non-monotonic guardrail.
- "Recursion is a verb, not a flag": conditioned. A flag is admissible
  where the policy language conditions on it and an unconditioned grant
  reads narrow.

**Convergence.** The tree, the blind lane and a primary source all reached:
- the mutable-order skip (measured in the tree);
- the predicate/ORDER BY tuple rule (the tree's own shipped fix, and a
  keyset reference text);
- "leak = computed from the examined row".

The malformed-position refusal rests on the tree's shipped livelock and the
blind lane. The web lane could not fetch the standard's invalid-token text.
No new technique was earned: every convergence was a condition on an
existing one.

**Landed** (50b0b708):
- two rust applications (second stack): declare-the-inconsistency, measured,
  and after-plus-limit-not-cursor, simulated over fourteen paged sites;
- conditions in all six techniques and in golden-path spine items 1, 3, 4
  and 5 plus the done-bar;
- a byte-cap alternative in page-size-from-memory-budget;
- a caller-chosen-predicate exception in filter-after-return-under-limit.

The three go applications are untouched and keep `verified_on: 2026-09-02`.
Their citations were not re-checked this run. The web lane read the same
policy code and found the ceiling behavior they record.

**Applied** (5 rows in [[applied]]):
- experiment better: the mid-walk miss is measured and the contract stated
  in the tree, committed `aed8915` (not pushed; see below);
- simulation better: position from the delivered row, 14 sites;
- simulation better: clamp admissible with a continuation, cursor-mode vs
  legacy shapes;
- 2 unapplied (no fleet policy language with page ceilings; no fleet
  per-key hiding filter).

The tree's `master` was 15 ahead and 5 behind its remote, and 14 of those
commits are not this run's, so nothing was pushed there.

## Impact

Maps were regenerated at registry 50b0b708 for the seven projects that join
this subject, each committed on its active branch and not pushed. Ten pairs
across goat (2), tracklight (1), pumper (1), politicas (2), systedo-case
(2), ascent (1) and athena-everywhere (1) are all `unknown`, with **0 stale
verdicts**. Nothing has been judged against this subject yet, so there is
no `/conform --stale` queue.

## Open leads

- **The sync SDK's `filter` applies only at cold start.** The incremental
  run reads the unfiltered change feed, so a mirror configured for a slice
  receives the whole dataset from run two on. This comes from the tree
  read, a single lane. It belongs to sync-replication, not here. Return:
  when sync-replication is next deepened, or when that SDK is next touched.
- **Iteration direction decides resumability.** A newest-first change feed
  forces the client to buffer the whole delta before it can advance its
  watermark. Oldest-first would let it checkpoint per page. Single lane.
  Return: a second tree walking a feed, to earn a rule here or in
  sync-replication.
- **A wall-clock watermark vs commit visibility.** A revision stamped
  before it becomes visible could fall under a watermark already advanced
  past it. The tree's single-writer store probably closes this, but that is
  unverified. Return: with the item above.
- **The legacy clamped shapes carry no has-more signal** (a bare-array
  list, and the legacy feed and history bodies). A response header would
  make the clamp visible without breaking parsers. Return: when that API's
  legacy shapes are next touched.

## Declines

- Resolving a delivered id to its sort tuple server-side (the
  id-as-position design some payment APIs use): its not-found behavior went
  unverified, so it was not landed.
- A number for how long versioned stores retain history: it ranges from
  minutes to a week by store and setting, so the technique states the
  horizon as operator-controlled instead of quoting one.

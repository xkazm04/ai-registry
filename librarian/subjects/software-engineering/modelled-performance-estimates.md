---
domain: software-engineering
subject: modelled-performance-estimates
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
depth: L2
---

# modelled-performance-estimates

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - `/deepen`, first pass (dp-mpe-0926)

The Curator lane dispatched this run on "single stack (rust)". The one
application read an external model-fit tool. There were four lanes:
- a read of the three fleet trees the map joins (goat, personas, ascent),
  searched per project with a known positive checked in each;
- web counter-evidence on six claims, with every quote re-fetched verbatim;
- a blind training-data lane;
- a re-read of every cited line before an application landed.

**Counter-evidence: six claims conditioned, none refuted outright.**
- "Nearly every model computes a ceiling": conditioned. Only
  bound-and-bottleneck models do; the roofline paper sets itself against
  predictive models. Predictive analytical models report two-sided errors,
  worst-case analyses are deliberately pessimistic, and price-times-count
  estimates are not bounds at all. Mechanisms that avoid the modelled
  bottleneck (speculative decoding, reading only active parameters) beat the
  ceiling.
- "No confidence interval that means anything": conditioned. Measured
  residuals give one, and conformal methods make it distribution-free, but
  only inside the population that was calibrated.
- "No free sentinel": true of zero. A negative is out of domain for sizes
  (a platform interface uses minus one for an unknown length) until the value
  is differenced. Not-a-number does not survive the common wire format, and
  one monitoring system had to reserve a specific bit pattern to tell its
  marker from a computed result.
- "One ratio, never a second input": conditioned. Fixed terms (runtime
  context, context-sized buffers, co-tenants) are absolute, so they go in the
  numerator first; left out, they return as the second input.
- "The top band stops a few percent short": conditioned. Documented
  runtime defaults claim about 0.92 of the pool, a fitter reserves 1024 MiB
  per device, and sizing guidance allows up to 20% overhead.
- "Per-category entries beat one global factor": conditioned. In Gelman's
  comparison the cross-validated errors were 0.84 pooled, 0.86 unpooled and
  0.79 partially pooled. Entries are shrunk toward the fixed default, never
  toward a recomputed mean, which keeps the scoping rule intact.

**Convergence.** Both lanes independently reached every one of the six. The
two structural ones, the absolute terms in the numerator and shrinkage, earned
technique-level text, but as conditions on the existing techniques
(one-ratio, scoped-calibration), not as new techniques. Both refine a rule
rather than adding a mechanism.

**Tree read.** goat has one seam, and it is dead code (no callers). personas
has four, and ascent has two. The joined trees outranked both lanes on the
application side, with two findings no lane predicted:
- **zero as a true value.** Ascent prices local inference at exactly zero,
  and the code comments give both reasons: a self-hosted org reads $0.00, and
  a prefix-matching local tag cannot be billed at a vendor's rate. That became
  the refusal technique's converse condition.
- **three disagreeing price tables** in one app (personas). One Opus call is
  priced 3x higher before an execution than before an arena duel, and no
  surface publishes the rate it used.

**Landed** (618b9df5):
- next--refuse-rather-than-emit-a-sentinel (ascent `06e14f77`, next@16);
- react--provenance-travels-with-the-value (personas `900b8f0b4`, react@19);
- conditions in five golden-path paragraphs, the refusal list and the
  technique list, and new sections in three techniques.

The rust application keeps `verified_on: 2026-09-09`; its tree was not
re-opened.

**Applied** (4 rows in [[applied]]):
- simulation better: zero-is-the-value and the floor rule, over ascent's
  headline fold, three cases;
- unapplied: the numerator condition (no fleet fit verdict against a sized
  pool);
- simulation unmeasurable: shrinkage, over personas' per-effort token table
  (n=1 per anchored entry, no held-out session);
- simulation unmeasurable: the golden path's class naming and interval, over
  the same gauge's minutes (a calibrated rate from n=2, not a ceiling).

## Impact

No context in goat, personas or ascent pairs with this subject: each of the
three projects' maps, rebuilt to a scratch file at 618b9df5, carries zero
pairs. The known positive `measurement-honesty` was present. That makes 0
stale verdicts and no `/conform --stale` queue. goat's committed map was
rebuilt and committed locally (d47a9b8, on a main 23 ahead of and 276 behind
origin, so not pushed). Ascent's and personas' map files carry another
session's uncommitted edits and were left alone. **Owed:** their rebuild,
when those sessions have committed.

## Leads banked

- **Ascent: one meaning for zero.** Have the meter lanes record a local call
  at 0 micros, with a `self-hosted` basis, rather than null plus an
  unpriced count, so the floor caption only fires for money that is really
  unknown. Return: the owner's call, because the meter comment records a
  deliberate choice. Once taken, it is a `code` row.
- **personas: one price table.** Three tables disagree (Sonnet in: 3/2/3;
  Opus in: 5/5/15; Haiku in: 1/1/0.25). The fix is one resolution function
  that each surface reads, with the rate published beside every figure.
  Return: a quiet personas tree (86 modified files at this read).
- **personas: absent head figure.** An all-unpriced arena match renders
  $0.00. The cost should be absent when no priced duel exists. Same return.
- **personas: crashed-run backfill.** When a run ends without its result
  line, the Rust parser writes a modelled cost into the same `cost_usd` a
  measured one occupies (verified at `900b8f0b4`). Its doc comment says "the
  caller must say so where it records it", and at the record site the only
  label found is a log line. Whether the persisted execution row carries any
  class was not established: the database search's known positive failed, so
  its zero means nothing. Return: re-read the persistence path, then, if no
  class survives, a `code` row the next time the execution record's schema
  moves.
- **The rust application's 0.98 edge.** It sits above every documented
  runtime default found. Re-open that tree and ask whether its numerator
  carries the fixed terms. Return: the next re-verification of that
  application (its derived clock).

## Declined

- "A partial sum is a labelled floor" as a new technique. There is one tree
  (ascent) and no lane reached it, so it landed as a decision rule in the
  refusal technique and a section of the next application.
- "Zero-cost local must read as nothing to price" (ascent's meter comment).
  The product wants the distinction; the technique places it in the basis
  field, not in the absence.

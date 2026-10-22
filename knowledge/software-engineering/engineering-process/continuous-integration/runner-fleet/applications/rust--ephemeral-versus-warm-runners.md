---
layer: application
type: application
subject: runner-fleet
technique: ephemeral-versus-warm-runners
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@1.96
applied: experiment
ab_verdict: unmeasurable
---

# Ephemeral hosts, one declared mount, and a store the verdict never reads

A Rust workspace in the managed fleet runs every job on a platform-provided, per-job environment.
Across its workflows there are eight `runs-on` declarations, six `ubuntu-latest` and two a
`matrix.os` expression, and no self-hosted label anywhere. The witness for `verified_against` is
the pinned toolchain channel `1.96.1` in `rust-toolchain.toml`. By the technique's default this is
the ephemeral model, chosen by the platform rather than by anyone, so the interesting question is
what the tree then *adds back* and whether it kept to the middle ground the technique prefers.

## The persistence surface is one declared path

The technique's preferred compromise is an ephemeral job environment with a single declared mount.
The tree has exactly that, in two forms:

- Two content-addressed caches (a browser binary cache keyed on the resolved tool version, and a
  framework build cache keyed on a lockfile hash plus a source hash). A key change busts them; time
  does not.
- One **rolling** cache, `flake-history`, written by the test job under a unique per-run key and
  restored by prefix match. It is not content-addressed: it is meant to accumulate, because flake
  detection is a query over retained history and a per-run artifact does not accumulate.

The rolling cache is the one that can contaminate, so it is the seam.

## The seam chosen to falsify the technique

The technique says to fix contamination by stopping the leftover, and that a warm host weakens what
a green result proves. A rolling store restored into a blocking job is the case that should break
both sentences: if the register check's exit code depended on what earlier runs left in the cache,
the same commit could be green on one run and red on the next, and the check would be observing
the cache rather than the change.

A caught outcome would have taught something concrete: the persistence list needs a third entry
class, state that decides a verdict, with its own loss-handling rule. So the arm was run, not read.

## What was run

The tracked tree was exported at its current commit into a scratch repository and the blocking
register check run three ways, changing only the contents of the history directory:

| arm | history present | exit |
| --- | --- | --- |
| A | none (a lost cache) | 0 |
| B | four unparsable files | 0, history reported "none recorded" |
| C | four schema-valid records for one test, alternating outcome on one sha | 0, history reported "1 test observed" |

Arm C proves the store is actually read, since the report changes between A and C, while the exit
code does not. The code agrees: the verdict is computed from the register and a source scan only,
and the history feeds a published, explicitly non-blocking figure. Two choices make the lost-cache
case honest. Empty history prints "NONE RECORDED YET ... This is not 'no flakes'", and a scanner
that finds zero ignored tests exits with a distinct "cannot check" code instead of passing.

**Target:** the exit code is independent of the persisted store. **Floor:** a lost or corrupt cache
never turns a red verdict green. Both held at n=3 arms, one commit. What arm C did not reach: the
history schema was reconstructed from the writer, and no seeded record produced a flaky label, so
the label path was not exercised.

## What the tree says about the standard

The technique's persistence list is written for *environment* the job starts from. This tree
persists *evidence* the job writes about itself, and that is a different object with a different
safety condition. The test is not "is it reaped" but **delete it: does any verdict change?** A
store that passes that test is a record, not a starting condition, and the technique's
"stop the leftover" rule does not apply to it; one that fails it is warm state under another name.
Neither of the technique's current bounds covers this: the store's age limit lives in the reader (a
fourteen-day window), while retention is the platform's eviction, so a rolling prefix is refreshed
by use and never ages out on its own.

No amendment was written. One tree, confirming rather than refuting, is a boundary candidate
(score GAIN 1, RISK 0), below the auto-accept bar.

## What this realization cannot do

It shows verdict independence for one blocking check on one commit. It says nothing about the
cache-write trust boundary (which ref scope a pull request can write into), which the platform
decides and this tree did not exercise, and nothing about the two content-addressed caches, whose
keys were read but not mutated.

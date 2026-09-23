---
layer: application
type: application
subject: index-free-random-access
technique: conservation-sweep-over-a-partition-parameter
stack: rust
verified_on: 2026-09-07
verified_against: rust@1.85
---

# The sweep exists, and the build has never run it

The tree that originated this technique implements it exactly as described —
and then leaves it outside the build, which is the technique's own last rule
failing in the place best positioned to know better.

The version witness is the toolchain file pinning the channel to `1.85.0`,
corroborated by the lint configuration's minimum supported version and by the
release workflow, which overrides to the same version before building. Three
independent statements of one number; the toolchain file is the one read here.

## The instrument

`scripts/test_segmentation.sh` is the conservation sweep, in nineteen lines of
shell. It builds the release binary, records the record count from one linear
pass, and then for every partition count from 1 to 128 it asks the tool for
that many byte segments, slices each one independently, counts it, and sums:

```bash
for i in $(seq 1 128);
do
  declare -i total=0
  $XAN split --chunks $i --segments $1 | ...
  while read -r segment;
  do
    count=$($XAN slice $segment $1 | $XAN count)
    ((total += $count))
  done
  echo "--chunks=$i -> $total"
done
```

Every element the technique prescribes is present. The ground truth is the
simplest available code path. The sweep is wide — 1 to 128 — rather than a
single value. Both sides count through the same predicate, because both sides
are literally the same subcommand. And it takes the artifact as an argument,
so it runs against whatever real file the operator points it at rather than a
curated fixture.

## The structural fact: what is verified is the half that cannot be wrong

The technique closes by insisting that a sweep is a guard only if it runs
unattended. This tree is the negative case, and the shape of it is worth more
than the confirmation.

The continuous-integration workflow runs exactly one test step: `cargo test`.
The sweep is a shell script; nothing invokes it. Its output is not even an
assertion — it prints `--chunks=N -> total` for each of 128 iterations and
leaves the comparison to whoever is reading the terminal. There is no exit
code to fail on.

Meanwhile the compiled suite does cover the splitting command, in a 236-line
test file with six test functions. Those functions exercise `--size`,
`--filename` and `--no-headers`. **The words "chunks" and "segments" do not
appear in that file at all.**

So the split command has two modes: a deterministic one that divides on a
fixed record count, and a heuristic one built on probabilistic boundary
recovery. **The deterministic mode is the one with automated tests; the
heuristic mode has none.** That is the inverse of where the risk sits, and
nobody designed it — it fell out of the fact that the deterministic mode is
easy to write a fixture for and the heuristic mode is not, which is precisely
the difficulty this technique exists to answer. The team solved that
difficulty, correctly, and then the solution did not make it into the
automated suite because it was not shaped like the other tests.

This is better evidence for the technique than an adopting tree would have
given. It shows the instrument being invented by people who needed it, and it
shows the second half of the rule — that inventing it is not enough — failing
in the same repository on the same day.

## What this realization cannot do

The sweep prints; it does not assert. Converting it into a guard is a small
change (compare each total against the linear count, exit non-zero on a
mismatch, run it against a small committed artifact in the workflow), and this
application does not claim that change was made or measured here — the tree
was read, not modified.

Nor does the sweep check contents. It conserves the record *count* only, so
the identical-mis-parse case the technique names as the count's blind spot is
open in this implementation too: a boundary error that shifts field alignment
consistently across every segment would preserve the total and produce wrong
records. The technique's suggested extension — a checksum over contents on
both sides — is not present here, and on this tree it would be cheap, since
the tool already has the hashing and aggregation subcommands to express it in
the same shell idiom.

---
layer: application
type: application
subject: delivery-guarantees
technique: co-transactional-consume
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@1.96.1
applied: experiment
ab_verdict: better
proof: structural-only
---

# One crate, both postures, and nothing in it says why

The version witness is `rust-toolchain.toml`'s `channel = "1.96.1"` — the file
exists precisely so the blocking gates are a function of the commit — read at
commit `241db18`. The stack is a telemetry service whose store trait has two
backends; this is the one over a managed relational database.

The crate implements a dozen write domains behind one trait. Two of them are
queues in the ordinary sense: a job runner that executes benchmarks against
external model judges, and a relay that hands an action to a physical device
and waits for it to report back. The other write paths admit an event under
rate rules, append a delivery outcome, fill prices over a batch, and replace a
contributor's whole entry set.

Both groups are correct. They are correct **by different mechanisms**, and the
mechanism each uses is not a preference — it is forced by whether the work
leaves the database.

## The partition, counted

The discriminating question is the technique's: *does every effect of this
operation land in the store that holds the row?* Grouping the crate's write
modules by the answer, and counting the tokens that make up a lease — the
claim timestamp, the fence, the lease deadline, the staleness bound:

| Module | Effects leave the store? | Lease/fence tokens |
|---|---|---|
| `alerts` | no — a read-modify-write on the alert row | 0 |
| `admission` | no — lock, read rules, admit, commit | 0 |
| `price_fill` | no — a batch write | 0 |
| `collective` | no — a delete-and-insert set replacement | 0 |
| `jobs` | **yes** — runs a benchmark against external judges | 23 |
| `relay` | **yes** — hands an action to a device | 18 |
| `relay_lease` | **yes** — the conditioned half of the above | 9 |

Zero on every local path, fifty across the three escaping ones, and no path
sits in between. The four local modules each open one transaction, do the
work, and commit; a crash rolls back the effect and the claim together, so
there is nothing to reclaim and no reaper is created. The three escaping
modules carry the whole apparatus this subject's other techniques describe: a
persisted claim, a fence the holder renews (`renew_lease` moves `claimed_at`;
the relay moves `lease_deadline` and never the fence, so one run keeps one
identity), and a completion write conditioned on still holding it, whose
refusal reports what beat it rather than a bare failure.

## What the tree proves that nobody built it to prove

**No document in the crate, its design notes, or its runbooks states the rule.**
The partition is exact and undesigned: it fell out of what each path could
physically promise, one function at a time, and it holds across two authors'
worth of history without a sentence naming it. That is the strongest available
evidence that the discriminator is real rather than stylistic — a convention
would have drifted somewhere in a dozen modules, and a documented rule would
prove only that someone had read the rule.

It is also the evidence for the technique's stated risk. Nothing enforces the
split. A local path that grows one network call moves across the line in a
change that reviews cleanly, and lands in the group that has no claim column,
no fence and no reaper — the machinery its new posture requires. The revert is
by addition and it is silent, exactly as the technique predicts, and this tree
had no line of defence against it until this run added one.

## What the corpus said before, measured

The same eight sites, classified twice. Under the three-posture table alone —
every accepted event needs a stable identity and a dedup barrier, and the
exactly-once experience "only ever" comes from at-least-once plus idempotent
effects — the four local modules read as under-protected: they carry no
identity, no dedup horizon, no claim. Under the locality question, they are
correct without any of it.

**2 of 8 sites classified correctly before, 8 of 8 after.** The six the old
reading missed are not exotic; they are the ordinary majority of a store
crate's write surface, which is why the gap was invisible — the subject was
never wrong about a queue, it was silent about everything a queue sits beside.

## What changed here, and what did not

**No behaviour changed and none should have.** The tree was already on the
right side of every call; the technique's contribution to this project is not
a fix but a name for a rule it was already obeying, plus the argument for
writing it down. The shipped change is the crate's own module documentation,
stating the question, both answers, and the prohibition that keeps a local
path local. The project's blocking gates — `cargo fmt --check` and
`cargo clippy -D warnings` — are green on the crate.

The honest limit of this application: it confirms the discriminator and
measures the corpus's fit, and it does **not** measure the technique's
performance claims. Nothing here tests how long a local transaction stays
open, what the concurrency ceiling costs when in-flight items each hold a
connection, or where the shape stops paying — the local handlers in this tree
are all short enough that the cost the technique warns about never bites. A
tree that pushed a slow handler into the local group is what would price that,
and this is not one.

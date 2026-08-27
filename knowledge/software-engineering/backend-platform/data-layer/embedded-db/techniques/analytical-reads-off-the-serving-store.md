---
layer: technique
type: technique
subject: embedded-db
technique: analytical-reads-off-the-serving-store
status: forged
laws: [derivation-names-recomputation, one-authority-per-vocabulary]
shared_with: []
use_when: [an aggregate or self-join over the largest table has become user-perceptible, an analysis script must be run against a copy because something holds the store, deciding whether a second embedded engine is worth its sync cost, adding a reporting surface to an application that already has a store]
---

# Analytical reads leave the serving store

Every other technique in this subject operates the store the application
already has. This one is about the read that should never have gone to it.

An embedded engine is chosen once, early, for the transactional job: the
application needs durable local state, so it acquires a row store and signs
the contracts the rest of this subject describes. Later — always later — a
question arrives that is not transactional. A tally across the whole history,
an agreement matrix, a per-cohort rollup, a self-join of the largest table
against itself. Nothing in the codebase suggests a second engine, because the
first one *answers*: the query returns, the numbers are right, and the only
symptom is that it takes a while. So the query stays, and the store the
application serves from becomes the store the application analyses in.

**That decision is almost never made. It is inherited from the fact that the
store was already there** — and the axis it was decided on, "which engine is
already a dependency", is not one of the axes that determines the answer.

## The two axes, and why one of them is invisible

An in-process engine has a **form factor** — it runs inside the application's
address space rather than across a wire — and, independently, a **workload
shape**: it is organised for transactions, or it is organised for scans. The
form factor is the visible axis. It is why the engine was chosen, it is what
the deployment story is built on, and it is what most teams mean when they say
embedded. The workload shape is invisible precisely because the first engine
settled it implicitly and nothing since has re-opened it.

Both quadrants are populated and neither is exotic. A row-oriented in-process
store holds a working set the application mutates, indexes it for point and
range access, and pays for that with per-row overhead on a scan. A
column-oriented in-process store holds a copy it does not own, reads it in
vectorised batches sized to stay in cache, and pays for that with a write path
nobody would serve a request from. **Collapsing the axes produces the common
failure directly**: a team that has correctly concluded "in-process, not a
server" concludes along with it "therefore the store I have", and the second
conclusion does not follow from the first.

The tell that the axes have collapsed is a vocabulary one. Where *embedded*
and *transactional* have become the same word in a codebase's discussions, the
analytical quadrant is not being rejected on the merits — it is not being
seen, and no decision record will show the omission, because no decision
occurred.

## The rule, and where its threshold actually sits

**When analytical reads over a large table become frequent or need to feel
interactive, they leave the transactional store.** The escape is not a
service: it is an exported canonical copy read by a column-oriented engine in
the same process, which keeps intact every reason the store was embedded in
the first place.

The threshold is not a row count, though a row count is what teams reach for.
Three conditions decide it, and the first inverts most intuitions:

- **Query shape, not table size.** The cost gap between the quadrants is
  negligible on a point read, real on a grouped scan, and *widens with join
  complexity* — an analytical self-join is where a row store is worst, and it
  is worst by a wide margin relative to its own showing on simpler
  aggregates. A team that benchmarks its group-bys, finds the gap tolerable,
  and generalises has measured the shape where the gap is smallest and
  extrapolated to the shape where it is largest.
- **Frequency and audience.** A nightly batch that takes seconds costs
  nothing. The same query behind a click is a defect. The question is not how
  slow it is, but who waits.
- **Whether the read contends.** Usually the deciding condition, and rarely
  counted — the next section is about why.

Below all three, **add nothing**. A second engine is a second store with a
second lifecycle, and this subject's closing section on the forgotten second
database applies to it in full. The single-engine answer stays correct for
longer than performance instinct suggests, and "we might need it later" is not
one of the three conditions.

## The read that contends is paying twice

Here is the cost that never appears in a latency comparison, and it is the one
that most often settles the decision.

A store that admits a single writer, in a directory any process on the machine
can open, is the subject of
[single-writer-holder-discipline](./single-writer-holder-discipline.md) — an
elaborate discipline for surviving a hazard that is real, expensive, and worth
every clause. **An analytical read routed through that store walks into that
hazard.** The long scan holds the connection while the application wants it;
the analysis cannot run while a development server is up; and the workaround
the team converges on — run it against a copy of the directory — is the exact
operation that technique warns produces a torn copy whenever the original is
held.

The signature is a comment nobody reads twice: an analysis script carrying an
instruction to run against a copy, because something else holds the store.
That instruction is not a quirk of the script. It is the transactional
quadrant's locking contract being paid by a workload that never needed it — a
column-oriented reader over an exported file has no writer to exclude, no
directory to hold, and nothing for a second process to contend with. For this
read, the hazard the discipline exists to survive is an artifact of routing
rather than a property of the problem.

So the accounting is: the row store is slower on the query, **and** it turns
the query into an operational event. Comparisons between quadrants usually
count only the first.

## The copy is derived, and it names its recomputation

The moment a second engine reads an exported copy, the application holds a
stored derived value, and
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
governs it: the export is not a file that happens to exist, it is a
materialisation with a documented, invokable path from the canonical rows.

Two rules keep the hybrid honest, and together they are what stop it becoming
two sources of truth:

- **Both engines read the same canonical rows.** The serving store owns the
  records; the analytical copy is projected from them and never edited in
  place. Where that holds, the split does not create a second authority — it
  creates a second reader of one authority, which satisfies
  [one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
  rather than violating it.
- **Any number the application shows is produced by the engine that defines
  it.** A figure computed one way in a report and another way in a feature is
  a discrepancy with no arbiter, whichever engines are involved. The cheap
  proof is a cross-engine checksum: run one scalar aggregate down both paths
  and assert they agree. Where they do not, the split is not a reconciliation
  problem to manage later — it is a defect now.

Export cost is usually the surprise on the cheerful side. Bulk-loading a
column-oriented engine from a flat canonical dump is a scan, not an index
build, and it commonly stands the analytical side up in a small fraction of
the time the analytical query itself was taking. A hybrid rejected because
"standing up a second engine is too much machinery" has generally estimated
that cost from experience with servers, where it is a different number.

## What the quadrant changes

Being explicit about which of this subject's disciplines are retired matters,
because a team that carries all of them into the analytical engine will
conclude the hybrid is expensive:

- **Retired.** The journal-and-durability contract — there is nothing durable
  to protect, since the copy is reproducible by definition; single-writer
  holder discipline for the analytical store; and pool sizing against writer
  contention.
- **Kept, unchanged.** Storage accounting and pruning, because an export
  directory is an unbounded accumulator like any other and
  [creation-names-reaper](../../../../_laws.md#creation-names-reaper) does not
  care which engine made the files. Self-instrumentation, because the
  analytical path is now a second thing that can be slow with nothing external
  watching it.
- **New.** The freshness contract. The copy has an age, some consumer will
  eventually care what it is, and an export whose staleness is not surfaced
  becomes a support conversation about numbers that look wrong and are merely
  old.

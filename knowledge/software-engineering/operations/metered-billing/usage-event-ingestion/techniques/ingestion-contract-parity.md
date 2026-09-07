---
layer: technique
type: technique
subject: usage-event-ingestion
technique: ingestion-contract-parity
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [adding a high-throughput ingest lane beside an existing one, routing customers between two ingest implementations, proving two runtimes admit events identically]
stage: multi-service
---

# Parity between two implementations of one admission contract

Metered systems grow a second front door. The first is the general path, on the
same runtime as the rest of the product, sharing its models and its store. The
second is a narrow high-throughput lane, usually on a different runtime chosen
for concurrency, fed by a durable log and writing into a store built for
scanning. The second lane is a good idea and is usually well built.

What is rarely built is the relationship between them. Both lanes implement the
**same admission contract** — the same de-duplication rule, the same subscription
resolution including its fallback, the same refusal set, the same timestamp
handling — over the same customer configuration, in two languages, maintained by
people who read different code. That contract is now a vocabulary with two
authoritative definitions, which
[the one-authority law](../../../../_laws.md#one-authority-per-vocabulary)
forbids for exactly the reason it plays out here: the copies drift when somebody
extends the rule and finds only one of them.

The drift has a cruel signature. It affects only customers routed to the newer
lane, only for inputs neither team thought to test, and it is discovered by an
invoice.

## The three commitments

### One lane is named authoritative

Write down which lane the money is computed from, and treat the other as a
variant that must be shown equivalent — not as a peer with an opinion. Usually
the authority is the transactional lane the invoice reads, and the throughput
lane is a shadow or a feeder. Whichever it is, the naming has teeth: **an invoice
never reads from a lane whose equivalence has not been demonstrated for that
customer's configuration.** A lane that is authoritative for some customers and
shadow for others is fine; a lane whose status nobody can state is not.

The authority is a property of the *contract*, not of the code. When the two
lanes must genuinely differ — the throughput lane cannot enforce a uniqueness
constraint on write, so it deduplicates with a sweeper afterwards — the
difference is written into the contract as a stated, bounded divergence with its
own convergence window. A divergence that is documented is a design. A divergence
that is discovered is a defect.

### Equivalence is proven differentially, not by unit tests

Each lane's own tests encode **that lane's understanding** of the contract. Two
implementations that are self-consistent and mutually contradictory both pass
their own suites, comfortably, forever. Unit tests cannot observe the thing in
question, which makes them a gate over a proxy —
[a gate must see its target](../../../../_laws.md#gate-sees-target), and the
target here is the *difference*, which exists only when both lanes run.

So the harness feeds one input to both and diffs the outcomes:

1. **A fixture corpus, expressed as data.** Each fixture is a triple: a customer
   configuration (metrics, filters, subscriptions with their windows), an input
   event, and the expected admission outcome — admitted or refused with which
   reason, which subscription resolved and by which rule, and what a repeat
   submission does. Data, not prose, and in one place both lanes read.
2. **Both lanes execute it.** Not a model of a lane, not a reimplementation of
   its rules in the test: the actual admission code paths, over a real store.
3. **The comparison is field-level, and its silence is proven.** A diff that
   reports "no differences" when it in fact executed zero fixtures is the
   canonical
   [failure spelled as empty success](../../../../_laws.md#failure-not-empty-success).
   Report the fixture count beside the difference count, and fail the run when
   the first is zero. Seed the corpus with at least one fixture the lanes are
   *known* to disagree on, and fail the run if it does not appear in the diff —
   an instrument asserted against a known positive before its absences are
   believed.

The strongest form runs both lanes against the **same live schema inside a
transaction that is rolled back**, flipping the per-customer routing switch
between the two executions. It gives a genuine A/B over one input with no
fixtures-versus-reality gap and no state left behind. Two things make it honest:
the flip must be the only variable, and the roll-back must be verified, because a
harness that leaks admitted events into a customer's period has invented usage.

### The routing switch is billing-critical

Whatever decides which lane admits a customer's events — a per-customer flag, a
percentage rollout, a routing rule — is a surface with invoice consequences, and
it is usually treated as an ordinary feature flag.

- **Flipping mid-period means one invoice was admitted under two contracts.**
  Every discrepancy between the lanes lands inside a single bill, where it is
  hardest to explain and impossible to attribute. Flip at a period boundary, or
  do not flip.
- **Flip only after a differential run over that customer's actual
  configuration.** The fixture corpus proves the lanes agree on the shapes
  somebody imagined; the customer's own metrics, filters and overlapping
  subscriptions are the shapes nobody imagined.
- **A flip is recorded on the events**, or at minimum stamped with a timestamp
  that later analysis can join against. When a period's numbers are questioned,
  the first question is which lane admitted them, and it must be answerable from
  data.
- **Rollback must be as tested as rollout.** Moving back after a bad flip means
  events already admitted by one lane and events about to be admitted by the
  other coexist in one period; the de-duplication key is what keeps that safe,
  which is a good reason for both lanes to share it exactly.

## Where the divergences actually are

A parity harness with no hypothesis tests the easy cases. Four classes of
divergence account for most of what a differential run finds, and each of them
is invisible to a reader comparing the two implementations side by side, because
in each the two bodies of code *look* like translations of one another.

- **A predicate expressed in the two runtimes' different vocabularies.** One
  lane filters a subscription by a lifecycle *status* column; the other,
  reading a projection that does not carry that column, filters by a *time
  window* that usually implies the same thing. They agree on every ordinary
  subject and disagree on the ones in an unusual state — provisioned but not
  started, terminated and revived — which is precisely the population a
  migration produces.
- **Uniqueness enforced at different times.** One lane refuses a repeat at
  write; the other collapses repeats at read. First-write-wins on one side,
  last-write-wins on the other, for the same key. See the de-duplication
  technique; the harness's job here is to include a re-submission with modified
  properties in the fixture corpus, because that is the input where the two
  answers differ.
- **Retention horizons on caches and windows.** A lane that resolves from a
  cache holding a bounded slice of history cannot match what a lane querying the
  full store matches. The divergence is a function of how late the event is, so
  it never appears in a fixture corpus built from fresh events. Put a
  deliberately stale event in the corpus.
- **Coercion of a malformed value.** One lane refuses a value it cannot parse as
  a number; the other substitutes zero and carries on. Both are defensible in
  isolation; together they are a customer whose invoice depends on which lane
  admitted them. This one is usually *known* to at least one author and written
  in a code comment — which is where a documented divergence goes to be
  forgotten. Promote it into the contract, or converge it.

## Decision rules

- **When a second implementation of the admission contract merges, the harness
  merges with it.** Not after the rollout; the rollout is what it exists for.
- **When the two lanes must behave differently, write the divergence into the
  contract with a convergence window.** Undocumented divergence is a defect by
  definition.
- **When a fixture is added for a bug, it is added once, to the shared corpus.**
  A fix in one lane with a test in that lane's suite is how the drift restarts.
- **When the diff is empty, check that it ran.** Fixture count beside difference
  count, every time.
- **When you cannot run both lanes over one input, you do not have parity** —
  you have two hopes.

## When not to use this

- **One implementation.** With a single lane this is not a technique, it is just
  tests. The cost is only justified from the moment the second implementation
  exists.
- **Two lanes with genuinely disjoint contracts** — different event kinds,
  different customers, no shared rule — are two systems, not two implementations,
  and forcing a parity harness on them tests nothing.
- **A throughput lane that never becomes authoritative and never feeds an
  invoice** — a pure observability mirror — needs monitoring, not parity. The
  moment somebody proposes billing from it, this technique becomes a
  prerequisite.

---
layer: application
type: application
subject: analytics-store-design
technique: backend-parity-as-contract
stack: rust
status: forged
verified_on: 2026-08-24
---

# The contract as an executable suite, run three times (LightTrack)

LightTrack fronts SQLite, Postgres and Firestore behind one `Store` trait,
and it holds the technique's central claim — parity is a correctness
property, not a nicety — in the only form that cannot rot: the contract is
a function, and every backend is made to run it under its own required CI
check.

## The contract is `run(&dyn Store)`

`crates/store/src/conformance.rs:1-7` states the doctrine at the top of the
file: "Backend-agnostic conformance suite: exercises the full `Store` trait
and asserts round-trips, so SQLite, Postgres, and Firestore can be held to
identical behavior." `run` (`:24-42`) is a flat dispatch through sixteen
sections — events, projects/keys/limits, scores, traces, prices,
benchmarks, datasets, rubrics, jobs, three admission variants, revenue,
relay — and each backend crate's integration test is a single screen that
constructs its store and calls it (`crates/store/tests/sqlite_conformance.rs:1-9`,
`crates/store-pg/tests/conformance.rs:11-24`,
`crates/store-firestore/tests/conformance.rs:11-25`). The reference is
SQLite, designated by construction rather than by declaration: it is the
backend with no external infra, the one that "runs in CI always", and the
one whose behavior every assertion was written against. The stake is
written where a contributor and an agent both meet it, in the same words
twice — `CLAUDE.md:62-64` and `CONTRIBUTING.md:116-121`: "a `Store` method
that SQLite implements and another backend quietly defaults is how caps and
filters silently become advisory. Implement it, or return
`StoreError::Unsupported` (→ HTTP 501). Never a quiet default."

One more property makes the suite reusable rather than ceremonial: it is
safe against a non-empty database (`conformance.rs:5-7`), scoping every
section to a freshly minted project id, so the same function that runs
against an in-memory SQLite can be pointed at a shared cloud instance
without a teardown ritual nobody would maintain.

## Both permitted states are asserted, in the same suite

The technique's trichotomy shows up as two distinct test shapes, which is
what a suite has to do if it is to catch the forbidden fourth state from
both directions.

**Refusal is asserted where a backend declines.** `traces()`
(`conformance.rs:600-648`) branches on the capability flag: when
`serves_traces()` is false, a local `refused` closure demands
`Err(StoreError::Unsupported(_))` from all five trace entry points —
`list_traces`, `list_traces_filtered`, `list_trace_events`,
`list_trace_scores`, `get_trace` — and panics on anything else, including
success. Its doc-comment names the substitution it exists to stop: "a
backend that answers a trace read with an empty page instead of refusing …
so 'not implemented' can never read as 'you have no traces'". The typed
error carries the reasoning in its own definition
(`crates/store/src/lib.rs:44-50`): distinct from `Other` so the API can
answer 501 rather than an opaque 500, "and so a permanent capability gap is
never mistaken for a transient outage (or, worse, for 'no data')". The
mapping is real and unit-tested at the edge
(`crates/api/src/error.rs:186`, `:95`, `:251`). Below method granularity,
`EventFilter::unsupported_extension` (`lib.rs:99-115`) lets a backend refuse
*the predicate it has not ported* rather than the whole listing, with the
sharpest statement of the principle in the tree: "a filter that returns
*more* than asked reads as authoritative rather than broken."

**The quiet default is asserted against where a backend claims to serve.**
`parity_gap_methods()` (`conformance.rs:485-598`) is the mirror half, and
its doc-comment is the incident report. Four trait methods carry defaults
so unported backends keep compiling — `list_events_filtered`,
`cost_summary_windowed`, `usage_since_scoped`, `usecase_costs` — and the
defaults return "plausible-but-wrong data (an unfiltered list, all-time
cost, project-wide usage, an empty rollup), so before this section the
suite passed a backend that silently answered these wrong." The section
pins each: a model filter must return one event of three; a one-hour window
must total 3.0 and not the all-time 7.0; a scope on one model must count
one call, not both; a use-case rollup must group rather than come back
empty; and keyset paging must mint a cursor, exhaust cleanly, and neither
duplicate nor skip across the boundary — "the default mints no cursor at
all" (`:544-581`). Reading the default it targets makes the point
concrete: `list_events_filtered` (`lib.rs:548-573`) refuses the *extended*
predicates but silently delegates the rest to an unpaginated
`list_events`. That is the additive-evolution convenience the technique
warns manufactures quiet defaults at every addition, caught here by the
suite rather than by a customer.

## Three separate required checks, because a suite that skipped is not evidence

The hard-won part of this application is not the shared function. It is
that both cloud suites are **env-gated and pass as a no-op when the
variable is unset** — `crates/store-pg/tests/conformance.rs:13-21` and
`crates/store-firestore/tests/conformance.rs:13-22` both print "skipping …"
and return `Ok`. `CONTRIBUTING.md:91-93` says it in the plainest available
terms: "The Postgres and Firestore suites are env-gated: with no env var
they **silently skip**." A green board therefore proved only that SQLite
conformed, while the parity claim was being made for all three.

The fix is infrastructure, not a test: `.github/workflows/ci.yml:8-11`
records the reasoning at the top of the workflow — "Before, only SQLite ran
… so a codec or ORDER-BY divergence in the cloud backends could ship
undetected. Now each backend is its own required check." Three jobs run the
identical `conformance::run`: in-memory SQLite with no infra (`:41-57`), an
ephemeral `postgres:16` service container whose steps are gated on
`pg_isready` rather than on container start (`:59-96`), and a gcloud
Firestore emulator provisioned with a Java 21 JDK and polled on `/` for up
to two minutes before the suite is handed control (`:98-141`). The
Postgres job's comment enumerates what the container exists to catch that
an in-memory store cannot — "codec round-trips, `ON CONFLICT` upserts, the
`FOR UPDATE SKIP LOCKED` job claim, and the fixed-width RFC3339(Nanos,Z)
timestamp invariant that range filters / `ORDER BY` depend on" (`:60-63`).
This is the completed loop the technique asks for: contract, refusal type,
shared suite, and a per-backend check that cannot pass by not running.

## Where the repo stands below the standard

The parity **matrix** is partial. `docs/MARGIN.md:53-72` maintains one —
five methods by three backends, cells reading full / empty, with the
Postgres degradation named as "a documented handoff, not a bug" — but it
covers the margin surface alone. For the rest of a large trait, a method's
state on a given backend is discoverable only by reading which defaults
that backend still inherits, which is precisely the inspection the matrix
exists to spare a reviewer and an operator. The suite compensates for the
correctness half (an inherited default on a covered method now fails CI)
and not for the deployment-guide half: an operator choosing Firestore
cannot read, in one table, what they are giving up before they give it up.

The second gap is that "required" is a branch-protection setting the
workflow can only *request*. Each of the three jobs carries a comment
asking a human to "mark `postgres conformance (required)` as a required
status check for main" (`ci.yml:64`, `:43`, `:103`) — the check name is the
contract with a setting living outside the repository, so a renamed job
silently stops being required. Naming the requirement in the job's own name
is the mitigation the repo chose, and it is the right one available; it is
still a cell of the contract that no test can hold.

---
layer: application
type: application
subject: quality-gates
technique: gate-liveness
stack: rust
verified_on: 2026-09-05
verified_against: rust@1.85
---

# Skip locally, fail in the pipeline: could-not-run routed by where the green authorizes

A Rust server with a Postgres-backed store keeps its integration tests
behind a database URL. Without one they skip, so a contributor's bare
`cargo test` needs no running database. The pipeline once inherited that
skip: the job with no database ran the store's twenty-four integration tests
as silent passes, and the only job *with* a database ran one of them. The
tree's own comment on the fix names the state exactly — "green was fake" —
and the fix is the technique's rule that reporting could-not-run and routing
it are separate decisions, implemented as one environment variable. The
floor witnessed is the README's `Rust 1.85+`; the pipeline pins `stable`.

## The routing switch

`crates/utopia-store/src/test_db.rs` is the single entry every
database-backed test calls first. It returns the database URL or `None`,
and `None` means skip — **unless** `UTOPIA_TEST_REQUIRE_DB` is set, in which
case a missing URL panics with a message that says the run "must not skip
database-backed tests". The pipeline's database job sets the variable; a
developer's shell does not. The same predicate therefore routes could-not-run
to *skip* where the green authorizes nothing (a local run, where the
developer knows they have no database) and to *fail* where the green
authorizes a merge.

This is the technique's distinction made mechanical rather than
conventional. The vocabulary is three-valued in both contexts — the skip
prints a line saying it skipped and how to make skipping fatal — and only
the *routing* differs, decided by the one thing that differs between the
contexts: what a green there is used for.

## The instrument asserted before the result

The database job in `.github/workflows/ci.yml` (the `migrations` job) does
three things in order that the technique lists as liveness properties:

- **Refuses a population it cannot trust.** A step lists the migration
  directory and fails on a duplicate version number — a collision the
  version control system merges cleanly and the runner would index
  ambiguously. The comment records the incident: two changes each added a
  step 25, both green in isolation, the service failed to start after the
  merge because "the merged state had never been run by any pipeline".
- **Runs the chain on a fresh store, then runs it again.** The second pass
  is the seeded condition for a renumbered step replaying over a store that
  already ran the old number.
- **Runs the whole store suite with skipping made fatal**, tees the log,
  and writes a summary line that states the counts *and the rule*: "a
  missing database fails this job instead of skipping". The summary carries
  the predicate with the number.

## The structural fact

What the tree proves about the technique is the shape of the switch. The
technique warns that a check which folds could-not-run into pass has
pre-committed to the worst failure mode, and then says the routing may
legitimately differ by what the green authorizes. This tree shows that the
two contexts can share **one predicate and one line of code** — the
difference is an environment variable set by the context that needs the
stricter routing, not two test harnesses. A single skip function that every
test calls is also what makes the count auditable: there is exactly one
place a database-backed test can decide to skip, so "how many tests can
silently pass" has an answer.

## What this realization cannot do

- The switch guards **presence** of the database, not its **version**. A
  pipeline pointed at the wrong Postgres image passes the liveness check and
  tests against the wrong engine; the image is pinned in the workflow, which
  is a convention the predicate does not see.
- The summary counts `passed` and `failed` by grepping the test runner's
  output. A runner format change would zero both counts and the summary
  would read as a clean run with nothing tested — the technique's "walked
  population of zero" failure, one grep away. A floor on `passed` would
  close it and is not present.
- Skipping is still legal locally, so a contributor can merge a test that
  has never run on their machine. The pipeline is the backstop; the tree
  accepts that and says so.

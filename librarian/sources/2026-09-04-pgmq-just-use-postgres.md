---
source: youtube
kind: second-hand practitioner review (thin)
url: https://www.youtube.com/watch?v=KZw8et-e6vk
title: "Forget SQS, RabbitMQ and Kafka. Just use Postgres."
author: Better Stack
words: 590
extracted: 7
accepted: 2
declined: 0
leads: 1
already_covered: 3
untriaged: 3
dispatched: 0
applied: 1
shipped: 1
run_id: intake-mq-0904
siblings: 3
rescan_when: n/a (not a repository class)
---

# A three-minute demo that is wrong about its own headline, and right about where to look

## Class and expected yield

A **second-hand practitioner review**, and a thin one: 590 words, a vendor's
developer-content channel demonstrating a third party's queue extension. Per the
source-class table a review is reliable for *that a thing shipped* and little
else, and the thin-review corrective says it "yields a lead and nothing else
unless you spend the fetch."

**Expected yield, stated before the triage table: one content row at most, plus
catches.** That is what it returned — but not from the half the class predicted.
The yield came from the source being *wrong*, not from the source being
informative, which is the case this method says is worth more than a correct
source: it located something true and gave an inverted rule for it.

Operator focus: the message-queue knowledge path, and opportunities in
Postgres-backed fleet projects.

## The source's own claims, and what the corpus already said

The video's load-bearing sentence is: *"VT is visibility timeout … no other
process can pick them up. This is how [it] guarantees exactly once delivery."*

That is false, and the corpus refutes it in the file the map pointed at, in
almost the same words — `guarantee-selection` opens its table with *"Exactly-once
delivery across a boundary is an illusion."* A visibility timeout is a lease; a
worker that dies after the effect and before the delete gets the message
redelivered. The source has described at-least-once and named it exactly-once.

Its second argument — *"but it doesn't scale. Well, actually it does"* — is
supported by a stress test the run treated as its proudest segment and therefore
as where its boundary is missing: 100 workers, batches of 10, 100k rows, 9
seconds, ~11,100 msg/s, on a container deliberately limited to 2 CPUs and 2 GB.
The number is real and the protocol is incomplete in the one direction that
matters: 100 workers against a database is 100 connections and 100 open
transactions, and the test ran against a store doing nothing else.

## Prior art (Phase 4)

`research-map` over 14 queue concepts, then uncapped greps to establish the
absences (a capped result cannot establish one). The neighbourhood is dense and
mature: `work-execution` holds eight subjects, `delivery-guarantees` (7t) owns
the semantics, `job-coordination` (7t) the leases, `admission-queue` (13t) the
depth policy, `concurrency-guards` (12t) the exclusion primitives. Category is
at 8/10, so the placement veto did not fire.

Two absences were checked properly and are real: no document in any bundle
contains a row-skipping lock clause, and `transactional outbox` returns two
spurious slug hits. The second is a **seam, not a hole** — the outbox is
modelled in full, from the producing side, in
`data-layer/data-access/transactions-and-units-of-work`, which calls it "the
strong version" of deferring an effect past a commit.

## Triage (Phase 5, scored)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Name the posture the subject denies | delivery-guarantees/guarantee-selection | new-technique | real gap | 4/2/2 | **accept** |
| 2 | K | correction | S | "Visibility timeout = exactly once" is false | guarantee-selection | none | likely catch | — | caught |
| 3 | T | script | S | The board folds every video URL to one identity | scripts/run-board.mjs | none | real gap | judgment lane | **accept** |
| 4 | K | technique | M | Worker count is connection count | admission-queue/queue-cardinality | — | partial | — | folded into row 1 |
| 5 | K | currency | S | 11,100 msg/s at 2 CPU / 2 GB | — | none | thin | — | lead |
| 6 | K | design | S | Every queue is its own table | — | none | thin | — | untriaged |
| 7 | K | amendment | S | Archive and delete as distinct terminal verbs | delivery-guarantees, data-retention | none | likely catch | — | untriaged |

Vetoes: V1 clear (category 8/10, and row 1 adds a technique to an existing
subject rather than a subject). V2 satisfied twice over — training-data
convergence plus real code read in two connected trees. V4 clear. V5 clear, the
board reported no sibling on either target file. No escalation: one technique and
one paragraph in an existing subject is not XL.

Row 1's RISK carries the `+2` rewrite penalty honestly: the landing makes an
existing sentence — *"There is no fourth row"* — false as written, so it is a
rewrite and not an append. `4 − 2 = 2`, which clears the threshold exactly.

## The accepted finding

`guarantee-selection` states the condition and then spends it on a disclaimer:

> "Exactly-once delivery" … is a claim that the acknowledgment and the effect
> commit atomically — **which holds only when both live in the same transactional
> store.**

It names the condition to explain why a vendor's advertisement is false, and
never turns it around into a design somebody could choose. Meanwhile the corpus
builds the **mirror image** of that property, at full strength, in another
bundle branch: the outbox, where an effect's intent is made durable exactly when
the data is. The registry owns the producing half as a mechanism and denies the
consuming half as a posture. That asymmetry is the finding.

The consuming half is a mechanism, not a boundary case, so it landed as a
technique rather than an amendment: it deletes the persisted claim, the lease,
the reaper, the retry counter and the stable-identity requirement for its lane,
inverts two of `atomic-claiming`'s decision rules, and carries two costs the
subject had nowhere to record — the transaction held open for the handler's
duration (in direct tension with the lock-lifetime discipline in `data-access`,
stated as a tension rather than resolved away), and a concurrency ceiling
measured in connections rather than consumers, which is the boundary the
source's stress test hides.

It also fixes a vocabulary conflation that the operator focus predicted. Round
19's declared focus was *"when a subject's material is a published standard,
mine the standard and not only its implementations."* This subject's material is
not a standard, but the same failure shape was present: the prose is written in
the **vendor's** frame ("systems that advertise exactly-once") rather than the
literature's, and so the subject never draws the distinction the literature
draws — exactly-once *delivery*, which is impossible, versus exactly-once
*effect*, which is ordinary transactional atomicity. Naming that split is what
made a fourth posture expressible.

## Catches — the corpus winning

- **Exactly-once via visibility timeout.** Refuted head-on by the file the map
  named, before this run added anything.
- **tracklight's job queue.** Its own 2026-07-16 feature scout documents a
  double-claim bug (a long benchmark outliving a 10-minute lease and being
  re-run). **That is fixed in HEAD** — `renew_lease` moves `claimed_at`, and
  `finish` conditions on it with the loser reporting what beat it. Read the code,
  not the doc; a stale finding was one step from being reported as live.
- **ascent's claim → run → stamp.** Its comment states the escaping-effect
  dilemma better than most prose in this corpus — *"Write-then-work leaves a
  failed accept marked done. Work-then-write runs a double-click twice"* — and
  its three one-way guarded steps are `guarantee-selection`'s amplifying-effect
  remedy, independently arrived at.

## Applied (Phase 7.5) — `experiment`, `better`

Target **tracklight** (Rust over a managed relational store), the one fleet tree
carrying both postures. The technique's discriminator was run as a classifier
over eight write paths and scored against two policies on the same input.

**The result is a perfect, undesigned partition**: the four modules whose effects
stay in the store carry **0** lease/fence tokens each; the three whose effects
leave it carry **23 / 18 / 9**. Nothing sits between. No document in the tree
states the rule. Under the corpus as it stood, 2 of those 8 sites classify
correctly; under the technique, 8 of 8.

Shipped: the crate's module documentation now states the question, both answers,
and the prohibition that keeps a local path local — the silent-revert risk the
technique names was live and undefended. `cargo fmt --check` and
`cargo clippy -D warnings` green on the crate; commits `ed9e0d7` and `8be0bb9`
on `main`, not pushed. **No behaviour changed and none should have** — the tree
was already right on every call.

## Leads

- **A queue's throughput number is a measurement of the wrong resource unless it
  names the connection count and the concurrent OLTP load.** The source's
  ~11,100 msg/s at 2 CPU / 2 GB is the instance. Return condition: a second
  independent source publishing a database-queue benchmark *with* connection
  accounting, at which point this is a technique in `admission-queue` about
  sizing a consumer pool against a shared store rather than against a broker.

## Untriaged (cause: **verified but unwritten** — budget, not verification)

Both rows had their promoting question executed and neither was promoted.

- **Per-queue-table as a design decision.** Strip leaves little a team elsewhere
  could act on without the extension's specifics; promoting question ("does any
  subject own the physical layout of a queue?") answered no, and the answer did
  not promote the row because the source gives no forces, only the fact.
- **Archive-versus-delete as distinct terminal verbs.** Promoting question ("does
  `delivery-guarantees` model retention of *processed* work?") — it models
  terminal states and `non-delivery-ledgers` models reasons; retention belongs to
  `data-retention`, which owns it. Resolved against the row.

## Instrument notes

- **The board's `normSource` folded every YouTube URL to one identity.** Its
  fold drops the query string, and a video's identity lives in `?v=`, so the
  first claim of this run was refused as a SAME SOURCE collision with a
  completely different video. It fails in both directions: a false collision on
  every pair of video runs, and a *missed* collision between the two spellings
  of one video (`youtu.be/<id>` keeps its id in the path). A check that cries
  wolf on every video teaches the operator to `--force` past it, which disables
  it for this skill's most common source class. Fixed, with an eight-case
  assertion covering the 2026-09-02 repository fold it must not regress.
- **A `catch` that swallowed a `ReferenceError`.** While asserting the above, the
  harness returned a plausible-looking wrong answer because the function wrapped
  its whole body in `try/catch` and any bug inside it fell through to the
  not-a-URL fallback. Narrowed to the parse alone.
- **`FOR UPDATE` in DDL is a row-level-security policy, not a row lock.** The
  fleet scan's queue-table pattern matched 10 hits in one project that were all
  `ON <table> FOR UPDATE` RLS clauses. Assert the instrument's positives.
- The gate went red mid-run on `eval-harness/pairing-schedule.md`, a live
  sibling's untracked technique. Named, not fixed; index and catalog were
  regenerated under the lock and the result checked against `HEAD` before
  deciding what to commit.

## Budget

**0 of 3 fetches.** The class predicted the fetch would be the extraction; it was
not needed, because the finding was corroborated corpus-internally (the outbox
mirror), by training-data convergence, and by code read in two connected trees —
which the corroboration table ranks above commentary anyway. 3 siblings live at
claim; none held either target file.

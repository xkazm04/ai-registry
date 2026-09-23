---
layer: application
type: application
subject: agent-memory
technique: pending-beliefs-live-apart
stack: rust
verified_on: 2026-09-05
verified_against: rust@1.85
applied: code
ab_verdict: better
proof: ab-paired
---

# The nod queue in a bitemporal graph store, and the rejection ledger a companion brain lacked

Two Rust trees, read the same day. The first is the technique's source: a
knowledge-graph server whose `remember` tool once wrote an extracted edge
live at confidence 0.9 with an empty relation, and which now holds every
memory-extracted claim in `pending_facts` until a person nods. The second
is a desktop companion whose consolidation pass already had the
proposal-reviewed lane and a review inbox, and whose rejections lasted
exactly one pass. The technique's first three sections are the first tree;
the paired proof is the second. Witnesses: the server states `Rust 1.85+`
as its floor and pins `stable` in its pipeline; the companion was built and
tested here on `rustc 1.96.1`.

## The source tree: `pending_facts`, `rejected_facts`, and the card

`crates/utopia-store/src/pending.rs` opens with the failure-direction
argument in the tree's own words: fifty-odd queries select live facts by
`invalidated_at IS NULL`; adding a filter to each and missing one puts an
unconfirmed fact in the graph, "which is the entire reason this table
exists", so pending rows live apart and a forgotten read hides the queue
instead. It names `derived_facts` (migration `0013`) as the same judgment
made once before. The decision record (`docs/decisions/0015`) lists the
status-column design as a dead end that got as far as a written migration
before the count — 27 read sites in 6 files, 56 in 7 a day later — reversed
it.

`propose()` runs the technique's three checks in order and returns a
closed `Outcome` — `AlreadyAsserted`, `AlreadyPending`, `Rejected`,
`Proposed(id)` — with a comment that none of the three "did not propose"
values is an error, because re-extracting one memory recomputes the same
triple and "not blocking it means erasing the person's decision once per
extraction". The rejected check is keyed on subject, predicate and *object
entity*, and literal-valued claims skip it on purpose: `rejected_facts`
(migration `0018`) has no value column, and the comment says blocking on
subject and predicate would widen "salary 28000 rejected" into "never
propose salary again" — "better to ask once more than to reject a new
value on the person's behalf". The rejection table is separate from the
pending table because a table whose meaning is "waiting for a person" must
not hold rows a person has seen, "or the count lies" (the migration's own
comment).

The row carries the utterance's chunk id (`chunk_id NOT NULL`, the whole
sentence as the quote), the model's `proposed_predicate` beside a nullable
`predicate_id` — "the emptiness is exactly what the person must see" — and
`proposed_by` plus, since migration `0026`, `proposed_token`: which agent
credential said it, because several agents attach to one base under one
person's identity and "who said it is the only thing the reviewer can
judge by". The token column is `ON DELETE SET NULL` for the person-deleted
path only; a revoked token is a trace and the column keeps it.

The reply rule landed as a revision: the record's decision 3 first read
"the assistant says N facts were extracted", and wiring the runtime showed
N does not exist when `remember` replies, because extraction is queued.
The reply now says the sentence is recorded and its claims will be shown
first; the card grows into the chat on a `pending` event fetched by the
memory's chunk. Confirmation goes through `insert_fact` plus evidence plus
temporal reconciliation — the extraction path — and the pending row is
gone afterwards.

## The second tree: a rejection with no memory of itself

The companion brain's `run_consolidation`
(`src-tauri/src/companion/brain/consolidation.rs`) asks a model to distil
recent episodes into fact proposals, writes each as a `pending` row in
`companion_consolidation_item`, and a person applies or rejects them one
by one. `reject_item` flipped the status and nothing else. The next pass
read the same episodes under the same prompt, re-derived the same fact, and
put it back in the inbox: the lane existed, the door existed, and a
rejection lasted one cycle. The apply-side dedup (`find_near_duplicate`)
looks only at *existing facts*, so a rejected proposal was the one class of
proposal nothing checked against.

**The change** (branch `intake/utopia-pending-rejections`): the persist
loop moved out of `run_consolidation` into `persist_proposals(tx, id,
proposals) -> Persisted { inserted, skipped_rejected }`, and before each
insert it asks whether a `rejected` item exists with the same `(scope,
fact_key, proposed_value)`. The value is part of the key on purpose, per
the source tree's literal-value rule: rejecting "home_city = Brno" must not
become "never propose home_city". The run's log line now carries both
counts.

**The paired proof** is one test, `a_rejected_proposal_is_not_asked_again`,
with arm A inside it as the known-positive: pass one proposes the fact
(`inserted 1`), the operator rejects it, pass two re-derives it. Under the
old loop pass two inserts again; under the new loop it reports
`skipped_rejected 1`, and a new value for the same key still inserts. The
verdict, the counts and the gate are in the applied ledger row for this
technique; the arm-A behaviour was confirmed by running the same test with
the check removed.

## The structural fact

The companion tree already had the technique's *first* rule by
construction — proposals live in their own table (`companion_consolidation_item`),
separate from `companion_fact`, so no forgotten read could have leaked one —
and lacked the *third*. That is the ordinary shape: the storage split is
what people build when they build a review inbox at all, and the
rejection ledger is what nobody builds until the operator notices they are
answering the same question every night. The source tree built the ledger
in the same migration as the queue because its decision record asked what a
re-extraction would do; the companion's did not ask.

## What these realizations cannot do

- The companion's check is **exact-string on the value**. A re-derived
  proposal that the model rephrases by one word passes it. The source tree
  keys on entity ids and so is immune to wording; a companion whose values
  are prose would need the normalised-hash rung of the audit subject's
  identity ladder to close that gap.
- Neither tree shows the reviewer a **rejection count** for a key. The
  operator cannot see that a fact keeps being derived and refused, which
  is the bypass-pressure signal the governance technique asks for.
- The source tree's card is **one component with a declarative payload**
  (chunk plus triple list) so an external client can swap the renderer;
  the companion's inbox renders its own rows. The technique's card rules
  were read against the first only.

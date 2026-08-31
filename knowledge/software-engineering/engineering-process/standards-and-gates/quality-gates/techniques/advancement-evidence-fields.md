---
layer: technique
type: technique
subject: quality-gates
technique: advancement-evidence-fields
status: forged
laws: [unknown-is-not-a-value, count-carries-predicate]
shared_with: []
use_when: [an item passes many gates over months or years rather than one pipeline run, deciding what the record shows for an obligation a gate waived, a tracking board whose compliance column is mostly empty cells, a gate whose verdict can be overridden by a vote]
---

# Advancement evidence fields

Most of this subject assumes a gate's natural lifespan: a checker runs
against a commit, returns a verdict, and the verdict's job ends when the
merge decision is made. The record that matters is the gate's own — did it
run, could it fail, was it alive.

A different shape appears wherever items advance through **stages** over
long periods: a change moving through design review, a component walking a
readiness ladder, a proposal crossing a standards committee. Here the
verdict is the transient thing and the *item* is durable. It will face the
gate's obligation once, be judged, and then live for years afterward in a
state where somebody must be able to ask "was that ever actually
satisfied?" without re-running anything. The answer lives in a field
carried on the item, and the design of that field is a gate-engineering
problem with its own failure modes.

## Mint the field at the stage its obligation binds

The naive tracking board gives every item the same columns and every stage
the same schema. It reads as consistency and it costs the board its meaning:
a compliance column shown against items that have not yet reached the stage
requiring compliance is empty for two entirely different reasons, and
nothing distinguishes them.

The disciplined structure is that **the schema is the ladder**. A field
appears in the record at exactly the stage its obligation becomes binding,
and is retired once the obligation is permanently discharged. Reviewer
assignment is a column for items at the stage that requires reviewers;
conformance-test coverage is a column at the stage that requires a test
suite and stays through the stages that depend on it; both disappear from
the record of items that have completed, where the interesting field is
instead the publication target. An item's own row then answers a question
no dashboard filter can: which obligations are live for *this* item right
now, as opposed to which exist in the policy.

This has a pleasant secondary property. When the entrance criteria change,
the column set changes with them, and a stage whose criteria nobody can
name turns out to be a stage with nothing to add to the row — which is
usually the discovery that it is not a gate.

## The non-satisfied states need a closed vocabulary, and blank is not one

The field's satisfied state is easy: a pointer to the artifact that
discharges the obligation. Everything interesting is on the other side, and
the temptation is to leave that side empty. An empty cell is the direct
analogue of the false green this subject warns about elsewhere — it is not
a reading, it is the *absence* of one, and it silently merges every
distinct reason the obligation is unmet
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

A field carrying a long-lived obligation needs at least four
distinguishable states, three of which are not "satisfied":

- **satisfied** — a pointer to the artifact, not an assertion that one
  exists;
- **in progress** — a pointer to the work underway, which is a different
  claim from satisfied and must never be filed as one;
- **absent, with a pointer to why** — the obligation is genuinely unmet
  and there is a link to the discussion or the exemption that explains it.
  This is the state teams skip, and it is the most valuable one, because it
  is the only cell that records a *decision* rather than a status;
- **unknown** — nobody has checked. Rendered explicitly, never as a blank,
  and never as anything a reader could mistake for a definite value.

The measured case for the closed vocabulary is a natural experiment that
appears whenever one board tracks two obligations under two conventions. In
a public standards pipeline with a decade of history, the conformance-test
field uses explicit markers for all four states — links for satisfied,
links to open work for in-progress, a link to the discussion for the
explicit "no tests" case, and a rendered glyph for unknown. The reviewer
field on the neighbouring stage uses blanks. At the time of reading, the
test field showed 8 of 18 items at or past its binding stage in a
non-satisfied state, each one legible and attributable; the reviewer field
was blank on 16 of 29 items at the stage that requires reviewers — a 55%
hole that no reader can act on, because a blank cannot distinguish "not
assigned yet" from "assigned and never recorded" from "nobody has looked."

**The obligation with the readable field is the one that gets discharged.**
Not because the vocabulary enforces anything — neither field blocks
anything at all — but because a countable backlog attracts work and an
uncountable one does not. This is the same asymmetry that
[ratchet-design](./ratchet-design.md) exploits against a metric nobody can
zero today, arriving at a pipeline where refusal is not available.

## The fourth resolution: advance anyway, and write the hole into the record

[unmeasurable-criteria](./unmeasurable-criteria.md) enumerates what a gate
may do when a condition cannot be evaluated: announce a skip, fail closed,
or refuse to return a verdict. Those are the honest resolutions available
to machinery that returns one verdict and stops.

A durable record admits a fourth, and it exists only because the record
outlives the decision: **advance the item, and write the unmet obligation
into the row where it stays visible until it is closed.** The gate did not
skip the condition — a skip disappears with the run. It did not fail
closed, and it did not refuse a verdict. It made a judgment that this item
should proceed despite the hole, and it left the hole standing in public.

This is not a loophole to be closed. It is the correct resolution for the
large class of gates whose verdict is a *judgment* that some authority can
override — a committee vote, an architecture review, a release sign-off.
For those, refusal was never the real mechanism, and pretending otherwise
produces the worst outcome available: the override happens anyway, off the
record, and the field is backfilled as satisfied or left blank. Recording
the override is what converts an unenforceable gate into an auditable one.

The condition on using it is narrow, and it is what separates this from
simply waiving standards: the hole must be **written by the same act that
advances the item**, not added afterward by whoever notices. If advancing
an item does not require filling its evidence field, the field decays to
blanks and the mechanism is gone.

## What the field buys, and what it does not

What it buys is a sentence nobody could otherwise say: *n of m items at or
past this stage have not discharged this obligation, and here is each one's
reason.* That sentence is only computable because the vocabulary is closed
and the population is defined by the schema
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) —
with an open-ended prose column, or with blanks, it is not a number at all.
It is what lets a stalled obligation be raised as an agenda item rather
than discovered years later.

What it does not buy is enforcement, and a team adopting this should say so
out loud. Everything else in this subject is about machinery that refuses;
this technique is about a record that *reports*, deployed where refusal is
structurally unavailable because the gate is a human judgment. It makes
non-compliance countable, attributable and dated. It does not make it
impossible, and a pipeline that adopts the field while believing it bought
a gate has made exactly the error
[severity-by-construction](./severity-by-construction.md) describes, one
layer up: a label that says "tracked" over a construction that says
"noticed."

The complementary check — whether the item on the row is still being worked
on at all, as opposed to whether its obligations are met — is
[item-liveness](./item-liveness.md).

---
layer: technique
type: technique
subject: agent-memory
technique: coverage-instrumentation
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [asking whether memory covers what it should, a store that looks healthy, reporting memory health]
---

# Coverage instrumentation

Every other technique in this subject improves what is *in* the store. This one
answers the question none of them can: **what is missing?** A memory store with
four hundred items looks healthy on any listing surface and can still be blind
to half the territory it is supposed to know, because items cluster on whatever
someone happened to care about.

The structural point: **a listing surface can only show what is there; it
cannot show an absence.** No amount of browsing, filtering, or searching over
existing items will ever surface the subject that has no items. Absence needs
its own instrument, and that instrument is built by inverting the question.

## The denominator is the population, not the rows

The whole technique is one design decision. Coverage is computed over **every
subject the system tracks** — every project, tenant, domain, or scope the agent
is responsible for — not over the subjects that already have memory. Dividing
covered-subjects by subjects-with-rows always yields a number near one hundred
percent, and that number is worse than no number: it is a confident report that
the blind spots do not exist.

This is [count-carries-predicate](../../_laws.md#count-carries-predicate) at
its sharpest. "Four hundred items" is not a health finding. "Nine of forty
tracked scopes have memory confirmed within the last month" is, because it
names its denominator, and the denominator is where the truth lives.

The join key between memory and the tracked population must be the *same*
attribute the writers set — the scope or namespace a human filing a note and an
automated writer both stamp. A coverage instrument keyed on something inferred
(a tag convention, a substring of the content) measures the inference, not the
coverage.

## Honest zeros

Three cases where the instrument must resist the flattering reading:

- **A subject with no memory at all is a stale subject, not an omission.** It
  reports with an explicit "never" for last-confirmed rather than being
  dropped from the result because it has no row to attach a date to. Silently
  omitting the uncovered is exactly the failure the instrument exists to
  prevent, reintroduced in its own implementation.
- **Coverage over an empty population is zero, never one hundred percent.**
  "All of nothing is covered" is arithmetically defensible and operationally a
  lie; a fresh or misconfigured system must read as uncovered.
- **Only live memory counts.** Archived, superseded, and expired items are not
  coverage. A subject whose every item was retired last quarter is uncovered,
  and reporting it as covered means the instrument disagrees with the recall
  path about what the agent knows — which is the same divergence the
  [memory-value-model](memory-value-model.md) exists to prevent one layer down.

## Freshness is part of coverage

"Has memory" and "has memory that anyone would trust" are different questions,
and coverage answers the second by carrying a **window**: a subject is covered
when at least one live item for it was confirmed inside the window. The window
is chosen against the cadence at which the subject is expected to produce
memory — if the work touching a scope happens monthly, a scope that produced
nothing in a month has genuinely gone quiet, and that quiet is the signal.

Order the uncovered by severity, not alphabetically: never-covered first, then
longest-since-confirmed. The instrument's output is a worklist, and a worklist
that buries its worst cases in the middle is a report nobody acts on.

## The instrument is not part of the store's write surface

Coverage reads across the memory store and the tracked population, which makes
it tempting to grow it inside the store's own data layer. Keep it separate. The
store's data layer has one job — the item lifecycle — and an instrument that
joins it to an unrelated population is a second job that will drag that
population's schema into the memory layer's dependencies.

The same separation is what lets the instrument be honest about its own
failure, per
[failure-not-empty-success](../../_laws.md#failure-not-empty-success): "no
uncovered subjects" and "the population source was unreachable" must not
render as the same clean report. An instrument for absence that cannot report
its own absence has recreated the problem it was built to solve.

## What coverage is not

It is not a quality measure. A subject with one shallow, stale-but-in-window
item counts as covered, and coverage will never tell you the item is useless —
that judgment belongs to [consolidation](consolidation.md) and to the value
model. Coverage answers exactly one question, and its usefulness comes from
answering it without qualification.

Nor is it a target to be optimized directly. Coverage measured is coverage that
someone will try to raise, and the cheapest way to raise it is to write a
worthless item for every uncovered subject. Report coverage next to the
freshness distribution and the item counts, so the shortcut is visible the
moment it is taken, and treat a sudden jump in coverage the way you would
treat a sudden jump in any other metric: as something to explain before
celebrating.

## When not to use it

Coverage requires an enumerable population. When the territory an agent is
supposed to know is open-ended — everything the operator might ever ask about
— there is no honest denominator, and a manufactured one (topics seen in the
last quarter) measures traffic rather than coverage. In that case, instrument
the *recall* path instead: how often recall returns empty, and for what, is
the closest honest signal about the shape of what the store does not hold.

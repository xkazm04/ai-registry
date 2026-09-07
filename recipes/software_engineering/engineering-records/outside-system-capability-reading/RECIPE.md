---
name: outside-system-capability-reading
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/engineering-records
---

# Outside system capability reading

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Every way of choosing between outside systems starts from a characterization
of what each one is, and nobody produces that characterization under any discipline, so
the choosing is done well over a reading that was done badly. Three things go wrong in
it and none of them is visible afterwards: a capability gets counted at the level it is
announced at rather than the level anything has been seen working at, a published
interface gets read as proof of the data, model, index or control plane behind it, and
two things that merely answer the same question get placed in adjacent columns of a
table that has therefore already decided.

**Input.** The candidates a direction question has put in play, the current system as
the baseline, whatever access path exists to primary material about each one such as
source, tests, releases and deployment material, and whatever has already been concluded
about any of them.

**Core action.** Establish what each candidate actually owns rather than what its
surface suggests, raise every decision relevant claim to the highest evidence level it
can support and no higher, and be willing to return that a candidate is not comparable
at all.

**Output.** A reading of each candidate: the boundary it owns, every decision relevant
capability at the maturity its evidence reaches, each claim marked verified, inferred or
unknown against the revision or date it was read at, the contradictions left standing,
and the assumption the whole reading rests on. It says what is there and leaves whether
to whoever is choosing.

## Activities

1. Take the candidates in play with whatever access path exists to primary material on
each *(observe)*
2. Separate the candidates that own the capability in question from the ones that only
share its surface *(decide)*
3. Re-open what has already been concluded about the survivors, as leads rather than as
findings *(observe)*
4. Read primary material for the boundary each one actually owns beneath the interface
it presents *(observe)*
5. Set each decision relevant capability at the highest maturity its evidence supports
and no higher *(decide)*
6. Mark every claim verified, inferred or unknown against the revision or date it was
read at *(act)*
7. Hand the reading on with its contradictions standing and the assumption it rests on
named *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A capability is counted at the level the evidence supports rather than the level it is
declared at.**

- Each decision relevant capability carries the highest of declared, implemented, wired,
  exercised and measured that its evidence actually reaches, and the levels above that
  one are named as absent rather than left blank.
- The levels are never added up or collapsed into a single figure, because the only
  thing they are for is showing which link is missing and a total is exactly what hides
  it.
- A capability found in the source but never reached by the supported runtime path is
  recorded as implemented and not wired, rather than counted as present.
- A capability with no evidence that anything observes its quality or its failures is
  recorded as unmeasured, and a claim about how well it works is downgraded accordingly
  rather than repeated.

**A candidate that only shares the interface is named as not comparable rather than
scored beside the ones that are.**

- Every candidate is classified by the capability it owns before any two of them are put
  side by side, since a comparison already laid out has already made the judgment it was
  supposed to support.
- Not comparable is recorded as a finished reading with the boundary that separates it
  named, never as a candidate that could not be assessed or as a gap to be filled later.
- A published interface, a client library, a plugin surface or a protocol implementation
  is recorded as evidence that an interface exists, and never as evidence that the data,
  model, index, scheduler or hosted control plane behind it is open or independently
  reproducible.
- A candidate that can be run on the adopter's own hardware is not recorded as
  independent while its discovery, data, models or control services still come from
  somebody else.

**The reading says what it was taken from and when, what it could not establish, and
what would change it, so whoever decides from it knows what they are standing on.**

- Every decision relevant claim is marked verified, inferred or unknown, and an inferred
  claim carries the reasoning that produced it rather than only the conclusion.
- Each claim names the revision or the date of the material it was read from, because a
  reading of something still moving is only true as of when it was taken.
- What could not be established is written as unknown with what would resolve it, and is
  never filled in from the supplier's own account of itself.
- Two sources that disagree are both kept with the disagreement explained, rather than
  settled by taking the one that fits the direction already forming.
- A measurement taken elsewhere is recorded as somebody else's measurement of somebody
  else's workload, and an automated health or security signal is recorded as a lead
  whose underlying checks still have to be inspected for whether they apply here at all.

## Guidance

An interface proves an interface. It says nothing about the data, model, index or
control plane behind it, and running something on your own hardware is not the same as
owning what it depends on. So read what each owns before putting any two side by side,
and count a capability at the level its evidence reaches rather than the level it is
announced at. A conclusion somebody already reached is a lead until its evidence is
re-opened. Where the evidence stops, say what would resolve it.

## Where this is worth adopting

- A team about to lay out four candidates in one comparison, two of which turn out to
  answer the same question while owning none of the same machinery, so the layout
  decides the argument before anybody reads a row.
- A direction question raised because something published an interface, where the whole
  case rests on an untested assumption that what sits behind it is available on the same
  terms.
- An evaluation where the only material anybody has opened is the front page and the
  announcement, and every claim in the summary that resulted is the supplier's own claim
  in slightly different words.
- A capability that appears in a candidate's module list, its configuration and its
  documentation, and has never once been reached by the path the product actually runs.
- A decision being revisited, where the earlier reading is being reused whole and nobody
  can say which of its claims were checked at the time and which were carried across
  from somewhere else.
- A closed product being weighed against something whose source can be read, where the
  honest reading of one is far thinner than the other and the comparison keeps quietly
  filling the difference.

## Connector types

`source_control`, `research`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`event`. A direction question is a real event: somebody proposes replacing something, a
dependency stops being maintained, or a candidate appears that would change what gets
built. The reading is worth taking only while a decision is waiting on it, and one taken
on a schedule against candidates nobody is choosing between produces a document that
goes stale before anybody opens it. Since a reading is true only as of the material it
came from, the event recurs whenever the decision it fed is reopened, rather than being
answered once.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which capabilities the decision in hand actually turns on, because a candidate has
  dozens and reading all of them at every level costs more than the decision is worth.
- What access exists to primary material here, since a reading built from source, tests
  and releases and one built from published documents alone stop at different levels and
  must never be handed on as the same kind of claim.
- What the current system already owns, because a candidate is only readable against a
  baseline and the baseline is the one thing that is never a candidate and is always in
  play.
- Where the reading is written and whether the assumption it rests on can be found from
  there afterwards, since the work that watches a decision for rot needs that assumption
  readable rather than implied.
- How thin a reading this operation is willing to act on, because the level at which the
  evidence runs out is a property of the candidate and what to do about it is a property
  of the adopter.

## Dependencies

None.

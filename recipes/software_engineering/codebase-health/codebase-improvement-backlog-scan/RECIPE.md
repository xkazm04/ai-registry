---
name: codebase-improvement-backlog-scan
version: 0.2.0
status: seed
domain: software_engineering
path: software_engineering/codebase-health
---

# Codebase improvement backlog scan

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** The work a codebase most needs is already written down inside it, in markers,
deprecated calls and the files everybody edits nervously, and none of it reaches the
place where work is chosen. The scan that goes looking usually fails the other way. It
reports everything it can detect, and a standing list of several hundred correct
findings is the configuration with the lowest fix rate anybody has measured: not because
the findings are wrong, but because a list that arrives nowhere near the moment work is
chosen is read once and then never again.

**Input.** The code itself, its change history, whatever portfolio level health and risk
signals exist for it, and the record of which kinds of candidate this operator has
already turned down.

**Core action.** Separate the findings that are genuinely worth someone's time from the
ones that are merely detectable, ranking by where the code actually changes rather than
by how many markers it carries, and describe each survivor well enough that a person can
accept or reject it without opening the repository.

**Output.** A short list of candidates, each naming the files it touches, the approach
it proposes and the reason it ranked where it did, alongside a record of what was
covered, one plain statement when a pass found nothing worth surfacing, and a named list
of whatever the pass could not examine.

## Activities

1. Decide which part of the tree this pass covers and what the last pass left
*(observe)*
2. Read it for markers, deprecated usage, risk flags and structural gaps *(observe)*
3. Weigh each finding against where the code is actually changing *(decide)*
4. Drop what has already been turned down and what would not survive triage *(decide)*
5. Write each survivor as a candidate a person can judge without opening the repository
*(act)*
6. Hand the candidates to triage and record the coverage, including a pass that found
nothing *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The candidates that reach a person are few enough to read and good enough that most of
them are accepted rather than dismissed.**

- Each candidate names the files it touches, the approach it proposes, and the reason it
  was ranked where it was.
- The share of candidates a person accepts is carried forward as a measured number, and
  a category whose candidates are dismissed most of the time is narrowed or stopped
  rather than tuned indefinitely.
- The number surfaced in a pass is bounded by what the triage queue is actually
  draining, not by how many findings the scan could produce.
- A candidate arrives attached to the place work is chosen, not as a separate document
  that has to be sought out.

**A part of the tree is only scanned again when it has changed, or when the reason it
was skipped has expired.**

- A pass that surfaced nothing records that it looked, what it covered and that it found
  nothing, rather than being silent.
- A category the operator has turned down repeatedly stops being surfaced, and the
  record names the category and the refusals that stopped it.
- The first pass over a tree says it is establishing coverage and reports no trend,
  rather than presenting a first inventory as a deterioration.
- Anything the pass set out to examine and could not, whether an area it failed to read
  or a kind of finding it had no way to evaluate, is named as not examined with the
  reason, and is never counted among what it found clean, because a thing it could not
  open and a thing with nothing in it are the same silence from outside.

**The scan proposes and never edits, so a candidate is a question put to a person rather
than a change already made.**

- No pass writes to the code it is reading.
- A finding that looks like a security exposure leaves on its own path rather than
  queueing behind ordinary improvement work.
- A known defect or a missing feature is routed to its own queue rather than being
  dressed as an improvement candidate.

## Guidance

A marker count is not a signal, and complexity only matters where the code actually
changes, so rank by change and leave the quiet corners alone. Watch your own rejection
rate: a category whose candidates are mostly dismissed should be narrowed or stopped,
not tuned forever. Debt is the invisible part of the work; a known bug or a missing
feature belongs in its own queue. A young marker is usually still someone's live
intention, an old one rarely is. Say plainly when a pass found nothing.

## Where this is worth adopting

- A team that ran a static analysis tool once, was handed several thousand findings, and
  quietly stopped opening it, so the codebase now carries a large unread inventory
  standing in for a judgment nobody has made.
- A codebase old enough that its markers have become furniture, where a fresh reader
  cannot tell which note was left for a colleague who moved on years ago and which one
  is still load bearing.
- An operator maintaining several projects who needs each of them to offer a small
  honest amount of work every so often, rather than one producing an avalanche while the
  rest go silent.
- The months after a framework or dependency migration, when deprecated usage is
  scattered across the tree in a pattern nobody has mapped and the migration is quietly
  treated as finished because nothing has failed yet.
- A team whose backlog already exceeds what it can build, where the valuable
  contribution is not more candidates but a defensible account of why most of what could
  have been surfaced was not.

## Connector types

`source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[codebase](examples/codebase.md) for `source_control`,
[codebases](examples/codebases.md) for `source_control`.

## Recommended trigger

`self_paced`. A clock spends the same effort on a quiet tree as on a busy one, and
produces its worst output exactly when there is least to find, because a pass that feels
obliged to report something invents filler. Look when the code has moved enough that a
scan would see something new, and when the triage queue has drained enough that new
candidates will actually be read. An adopter who wants a predictable rhythm binds a time
trigger on the charter.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which codebase and which parts of it the adopter is willing to change, because
  candidates against frozen or vendored code are waste and will be rejected every time.
- Which categories of finding this operator wants at all, since the distance between a
  marker sweep and a structural read is a taste judgment and neither is the obvious
  default.
- How many open candidates the adopter can absorb, which is what bounds a pass, because
  the drain rate of the queue rather than the richness of the codebase is the real
  constraint.
- Where in the adopter's working day a candidate can arrive attached to something they
  were already going to look at, because that placement decides the fix rate more than
  the quality of the finding does.
- What this operator has already turned down and why, so the first pass starts from
  their history instead of rediscovering it over several months of rejections.

## Dependencies

None.

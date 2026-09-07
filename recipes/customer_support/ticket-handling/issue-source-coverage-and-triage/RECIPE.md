---
name: issue-source-coverage-and-triage
version: 0.1.0
status: seed
domain: customer_support
path: customer_support/ticket-handling
---

# Issue source coverage and triage

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A reported issue that nobody looked at again is indistinguishable from one
that was handled. Over time the tracker fills with things that are old rather than open,
and the first symptom is not a complaint: it is that people stop reading it and start
asking somewhere else.

**Input.** One tracked issue source, the issues created or updated since the last pass,
and the set of solutions already known to work along with what happened when each was
last used.

**Core action.** Judge whether each issue holds real work, check that its premise still
holds before acting on it, attach a solution already known to work rather than restating
the problem, and decide which issues need a person, reading tone and priority together
rather than priority alone.

**Output.** Nothing in the source is lost: everything with real work in it has reached
the backlog in a shape that can be judged, everything else has a stated reason it was
closed, and the set of known solutions is a little more trustworthy than it was.

## Activities

1. Advance coverage over the tracked source since the last pass *(observe)*
2. Judge whether each issue holds real work or should be closed with a reason *(decide)*
3. Look for a solution already known to work before proposing anything new *(observe)*
4. Check the issue's premise still holds, and decline with a reason when it does not
*(decide)*
5. Attach a known solution, escalate what needs a person, or close what is abandoned
*(act)*
6. Promote what carries real work into the backlog in a shape that can be judged
*(deliver)*
7. Record what the outcome confirmed or contradicted so the known set improves
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Nothing reported in the tracked source is lost, and everything with real work in it
reaches the backlog in a shape that can be judged.**

- Coverage is continuous: every issue created or updated since the last pass has been
  seen
- A pass that could not reach the whole window says what it did not reach, rather than
  leaving a gap that reads as an empty queue
- A promoted item carries the symptom, the affected area, and what is already known
  about it
- The same issue is never promoted twice

**An unhappy or high priority reporter always reaches a person, and is never auto closed
into silence.**

- Tone and priority are read together, not priority alone, when deciding to escalate
- Closing an abandoned issue reads as considerate rather than dismissive, and can be
  reopened
- An issue closed for silence and then reported again is treated as one that was never
  resolved, not as a new arrival

**The set of known solutions becomes a more reliable source of fixes over time rather
than a growing pile of guesses.**

- Confidence in a known solution comes from it having been confirmed on a matching issue
  before, not from how certain the proposed answer sounds
- A confirmed resolution strengthens the entry that produced it
- A rejected solution loses confidence so it stops being suggested
- A solution is not attached to an issue whose premise the product has already
  overtaken; that issue is declined with the reason instead

## Guidance

Own the completeness of one source so nobody has to check it by hand. Judge each issue
on whether there is real work in it, not on how loudly it was reported, and check its
premise still holds before acting: a confident answer attached to a problem that no
longer exists costs more than silence. Attach a known solution only where it has been
confirmed before, and let confidence come from that rather than from how sure the answer
sounds. Bring anything ambiguous to a person.

## Where this is worth adopting

- A team with a public issue tracker receiving more reports than anyone reads, where the
  honest state is that nobody knows which of the open items still matter.
- A support inbox that also receives bug reports, where the ones with real work in them
  have to arrive at engineering in a shape engineering will accept rather than as a
  forwarded thread.
- A product whose known fixes live in a growing document, where the same answer is
  retyped every week and nobody can say which of the entries have ever actually worked.
- A tracker holding two years of items nobody closed, where a blanket auto close would
  be fast and would also tell a dozen paying customers their report was never read.
- A solo maintainer who can absorb triage in a good week and loses a fortnight in a bad
  one, so how well the queue is covered depends on how their month went.

## Connector types

`ticketing`, `knowledge_base`, `messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[jira](examples/jira.md) for `ticketing`, [slack](examples/slack.md) for `messaging`.

## Recommended trigger

`self_paced`. Advance a cursor over the source rather than polling on a fixed interval:
act when new or updated issues are plausibly waiting, and sooner when the previous pass
left items unresolved. A short cron rereads a quiet backlog and still lags a busy one.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which source, and which project or queue inside it, since the cut is one
  responsibility per source and each instance must know its slice
- What makes an issue worth the backlog rather than worth closing, because that is the
  whole judgment and it differs completely between a bug tracker and a feedback inbox
- Which known solutions may be attached without asking, because attaching a confident
  wrong answer to somebody else's issue is the expensive failure here
- At what age silence should be read as abandonment here, since that is a property of a
  team's rhythm and of how its users behave, not a number a recipe can carry
- What the seat is allowed to read to check an issue's premise, because declining an
  item honestly requires seeing whether the product has moved past it

## Dependencies

None.

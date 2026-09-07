---
name: knowledge-base-curation-audit
version: 0.2.0
status: seed
domain: general_professional
path: general_professional/knowledge-curation
---

# Knowledge base curation audit

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A curated base does not fail by being wrong. It fails by nobody trusting it
enough to look, and the decay is invisible from inside: a reader who hits two pages that
disagree stops consulting it and asks a person instead, so the fewer people who visit,
the fewer notice what has gone stale. By the time anyone looks, the pages that were
never edited are the ones most likely to be false, and they pass every freshness check
because nothing about them has changed.

**Input.** The whole page and tag population as it can be reached, the date each page's
claim was last checked, whatever readership is observable, and the same measurements
from earlier audits.

**Core action.** Measure whether the base is still believed rather than whether it is
tidy, by putting contradictions first, judging staleness against when a claim was last
checked rather than when a page was last edited, and reporting the share of the base the
walk could not reach.

**Output.** A report of contradictions, unverified claims, pages nothing points to and
near-duplicate tags, each read as a direction against earlier audits, with every change
proposed and none applied.

## Activities

1. Walk the whole page and tag population, recording the share that could not be reached
*(observe)*
2. Find pages that answer the same question differently *(decide)*
3. Judge each page against when its claim was last checked rather than when it was last
edited *(decide)*
4. Separate pages nothing points to into unfinished connections and deliberate
standalones *(act)*
5. Read the counts against earlier audits so decay and sprawl are directions rather than
numbers *(decide)*
6. Propose consolidations and re-checks without applying any of them *(act)*
7. Deliver the report, naming what could not be walked and saying plainly when nothing
needs doing *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The audit says whether the base is still believed, not whether it is tidy.**

- Pages that answer the same question differently are the report's first finding,
  because a contradiction ends a reader's trust faster than a gap and is otherwise
  discovered by the reader it misled.
- Staleness is judged against the date each page's claim was last checked, and a page
  carrying no such date is reported as unverifiable rather than counted as fresh.
- Where readership is observable, a page nobody opens is reported alongside a page
  nobody edits; where it is not observable the report says so, rather than letting the
  missing signal read as health.

**A silence in the report is a finding about the base rather than a gap in the walk.**

- Every audit enumerates the whole population rather than only what changed, because the
  page that has not moved is the one most likely to have quietly gone wrong.
- The share that could not be reached is reported as a figure, and nothing behind it is
  counted as an orphan.
- A page nothing points to is separated into a connection somebody did not finish and a
  reference deliberately left standalone, since the two call for opposite actions.
- The first audit states that it is establishing a baseline; later audits report their
  counts as directions against it.

**The base is exactly as the audit found it, and every change is the owner's.**

- No merge, deletion or restructuring happens without the owner applying it, because an
  audit that edits on its own spends precisely the trust it was measuring.
- Each proposal carries the evidence behind it, so it can be refused on the evidence
  rather than on instinct.
- An audit that found nothing worth doing says so, rather than promoting the largest
  number it happened to count.
- A section that could not run is named and skipped rather than failing the whole
  report.
- A proposal the owner refuses is recorded with the audit that raised it, and later
  audits leave it alone until the pages behind it have moved, because an audit that
  re-raises a settled refusal teaches its owner to read the report as a list.

## Guidance

A base does not fail by being wrong, it fails by nobody trusting it enough to look, and
that is what you are measuring. Judge a page against when its claim was last checked,
not when it was last edited: an unedited page that is still true and one that went wrong
in spring look identical by age. Report contradictions first, since they end trust
fastest. Propose everything and apply nothing, because a wrong merge is found by the
reader it misled.

## Where this is worth adopting

- A base that everybody agreed was useful two years ago and nobody opens now, where the
  owner wants to know whether to invest in it or close it and currently has only a page
  count to decide on.
- A team whose people have quietly gone back to asking each other, which reads as
  culture and is actually two pages disagreeing about the same policy for eight months.
- A base feeding an assistant that answers from it, where a stale paragraph is no longer
  a page somebody might read but a wrong answer repeated confidently to everyone who
  asks, and the cost of staleness has risen without anyone deciding it should.
- A curator who has been adding tags conscientiously for a year and now cannot find
  anything, where the finding is not the number of tags but the pairs that differ only
  by a plural.
- An owner who was once talked into an automated cleanup that merged pages people were
  still using, and will only accept an audit that is structurally incapable of touching
  anything.

## Connector types

`knowledge_base`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[notion](examples/notion.md) for `knowledge_base`.

## Recommended trigger

`self_paced`. Decay tracks curation volume and elapsed time rather than the calendar, so
a fixed evening produces audits over a base that has not changed and misses the month
somebody added two hundred pages. Audit when enough has been added or enough time has
passed for the picture to have moved. Because a skipped audit and a clean one look alike
from outside, the record has to show which happened.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What counts as an orphan in this base, because a deliberately standalone reference
  page and a connection somebody never finished look identical and want opposite
  treatment.
- How long a claim in this subject stays true, because that is what turns an age into a
  staleness judgment, and it is measured in weeks for some material and years for other
  material in the same base.
- How much tag sprawl the owner will tolerate before it is worth reporting, because a
  strict vocabulary and a loose one both work and only one of them wants this report
  often.
- Whether readership can be observed at all, because if it cannot then the strongest
  available signal of decay is missing and the report has to be honest about what it is
  inferring from edit dates alone.
- Who owns the base well enough to apply a proposal, because a report that proposes to
  nobody is the same as an audit that never ran.

## Dependencies

None.

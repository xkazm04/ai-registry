---
name: deploy-regression-correlation
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/observability
---

# Deploy regression correlation

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** When errors jump, whoever is on call starts from zero on the question that
matters most, which is what changed just before; the answer is sitting in the deploy
list nobody cross referenced, and the teams that ship often enough for it to matter are
the ones for whom bare proximity names the wrong change.

**Input.** The deployment and flag change record for the window, the error series over
the same window, and how often this team normally ships.

**Core action.** Decide which changes are close enough, and specific enough, to be
offered as the hypothesis for an error jump, given how many changes land in a window of
this length anyway, and say plainly what would separate the candidates.

**Output.** A ranked hypothesis carrying the commit, the author, a rollback hint and the
confidence it deserves, recorded where the person on call will read it, and a clean
statement when nothing in the window explains anything.

## Activities

1. List the deployments and flag changes inside the window, and how many normally land
in one *(observe)*
2. Line the change times against the error series and find where the rise actually began
*(observe)*
3. Decide which pairings survive the base rate of shipping this often *(decide)*
4. Name what would separate the candidates when more than one change fits *(act)*
5. Record the ranked hypothesis with its confidence where the person on call reads it
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**When errors spike shortly after a change, whoever is on call already has the commit
and author in hand instead of starting from zero.**

- A change inside the correlation window of an error jump is named with its commit, its
  author and a rollback hint
- The verdict states when the rise began relative to the change, and a rise that started
  before the change is disqualified rather than reported
- A weak or crowded correlation is offered as a hypothesis carrying its confidence,
  never asserted as the regression

**The correlation window is justified by how often this team ships rather than carried
over from a default.**

- The account states how many changes land in a window of this length on an ordinary
  day, so a reader can tell whether proximity means anything here
- When several changes fall inside the window, all of them are ranked and what would
  separate them is named, rather than the nearest one being asserted

**A window containing no explanatory change is written down as such, so the next look
does not repeat it.**

- No changes in the window produces a recorded statement to that effect rather than
  silence or speculation
- The record names which sources were read, so a deploy source that could not be reached
  is distinguishable from an absence of deploys

## Guidance

Correlation here is not proof; it is the fastest useful hypothesis, and it is worth
exactly that much. Count how many changes normally land in a window of this length
before treating one inside it as special, because a team shipping twenty times a day
always has a deploy nearby. Check that the rise began after the change and not before.
Where feature flags decouple shipping from exposure, the flag change is the deploy. Say
what would settle it.

## Where this is worth adopting

- A small team on call for their own service, where the first fifteen minutes of every
  incident go to reconstructing what shipped and nobody has opened the deploy list yet.
- A team that has moved to continuous deployment and finds its old habit of blaming the
  most recent deploy now names the wrong change more often than not, because five of
  them landed in the last hour.
- An organization using feature flags heavily, where the code behind an incident shipped
  last Tuesday and was turned on this morning, so the deploy list alone points at the
  wrong day.
- The write up after an incident, where which change caused it is being answered from
  memory and the honest answer needs the timeline reconstructed against the error
  series.
- A service whose error rate drifts up quietly rather than spiking, where nobody
  connects it to a change at all until the monthly numbers are read.

## Connector types

`cloud`, `monitoring`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[vercel](examples/vercel.md) for `cloud`, [sentry](examples/sentry.md) for `monitoring`.

## Recommended trigger

`self_paced`. A deploy is a real external event but the answer does not exist at the
moment it lands, because the error series needs time to show the effect and a gradual
rollout needs time to reach enough traffic to be visible. Look once a recent change has
had that time, or when an error jump is sitting unexplained.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Where changes are recorded here, because a platform deploy list, a tag history, a CI
  run log and a feature flag audit trail are four different sources with four different
  truths, and most operations have more than one
- How often this operation ships, since that number decides whether a change being near
  an error jump carries any information at all
- How new code reaches users here, because an instant cutover, a gradual rollout and a
  flag turned on for one segment produce three different shapes in the error series
- Whether a named regression should reach a person immediately or wait for the next
  account, and where that record lives so on call finds it without being told

## Dependencies

None.

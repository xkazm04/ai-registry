---
name: application-error-scan
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/error-triage
---

# Application error scan

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** An error list that shows the same dismissed pattern every day teaches its
readers to skim, and the one new error that matters goes past unread with the rest. The
list also lies about its own shape: a single bug split across hundreds of signatures
never crosses any threshold, and two different bugs collapsed into one signature look
fixed the moment either is fixed.

**Input.** Unresolved errors from the monitoring provider over a window, each with its
signature, its occurrence count, how many distinct users or sessions it reached, the
release it first appeared in, and the record of how this team has triaged signatures
like it before.

**Core action.** Decide which errors are genuinely new, genuinely escalating, or
genuinely returning after being resolved, using the count, the reach and the triage
history together, and let a signature the team has repeatedly judged unimportant fall
quiet without anyone having to judge it again.

**Output.** A written account of the window naming what is new, what is escalating and
what has regressed, with the suppressed signatures counted rather than hidden, an
explicitly stated baseline on the first run, and an explicitly stated zero when there is
nothing to report.

## Activities

1. Pull the window's errors with counts, reach and first seen release *(observe)*
2. Match each signature against how this team triaged it before *(observe)*
3. Rank by reach and trajectory rather than by raw count alone *(decide)*
4. Separate the new, the escalating and the regressed from settled noise *(decide)*
5. Write the account, including a clean window recorded as clean *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The team's attention goes to errors that are new, escalating or returning, and not to
the same settled pattern every day.**

- Every surfaced error names why it surfaced: first seen in this window, rate rising
  against its own history, reach widened, or resolved and returned.
- A signature this team has repeatedly judged unimportant is counted in a suppressed
  total rather than listed, and the total is shown so suppression is visible.
- A suppressed signature whose rate or reach moves materially is surfaced again despite
  its history.
- The share of surfaced errors that a person actually acted on is carried forward, so
  the floor is tuned from what the team did rather than from how the list feels.

**A window is only scanned once, because the run before it wrote down what it saw.**

- A window with nothing worth reporting produces a record saying the window was scanned
  and found nothing, with the window and the scope it covered.
- The first run states that it is establishing a baseline and reports no trend, rather
  than reporting movement against nothing.
- A run made against a stale or partial read from the provider says so, gives the age of
  the data, and is not counted as a clean window.

## Guidance

Grouping is the hidden dependency: this assumes one bug is one signature, and neither an
over- nor an under-grouped signature survives a count threshold honestly. Rank by how
many people an error reached and which way it is moving, not by how often it fired: a
rare failure on a payment path outranks a noisy log line. A learned baseline needs about
a month of history before it is worth trusting, so call the trend provisional until
then. Repeated dismissal is a reason to stay quiet, never to stop looking.

## Where this is worth adopting

- A small team whose error monitor has been on long enough to accumulate a permanent
  backlog of unresolved noise, where nobody opens the dashboard any more because the top
  of the list has not changed in months.
- The days after a release, when the honest question is not how many errors exist but
  which of them did not exist last week, and a raw count moves with traffic rather than
  with quality.
- An operation with several services under one monitoring account, where the person
  responsible for one of them has no way to read a list that is mostly about the others.
- A team that keeps rediscovering an error it already decided was harmless, spending the
  same ten minutes on it every few weeks because the decision was made in conversation
  and never written anywhere the next scan could read.
- A handover or an on-call rotation, where the incoming person needs to know what was
  already looked at and judged, not just what is currently open.

## Connector types

`monitoring`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. The provider is already collecting continuously, so this is a read of a
series that is always there and nothing outside obliges it at a particular hour. Look
when enough has accumulated to be worth reading, when a release has just shipped, or
when the error rate itself has moved. An adopter who wants it before a standup binds a
time trigger on the charter.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which projects, services or environments this scan is accountable for, because a
  monitoring account almost always spans more than one team and a list that is mostly
  other people's is unreadable.
- What this team already treats as settled noise, since the same signature is a finding
  in one operation and background in another, and starting from their history rather
  than from nothing is the difference between the first useful run and the tenth.
- How many findings a person here can absorb in one pass, which is what sets the floor,
  rather than a default number deciding it for them.
- Whether the deployed code is grouped well by the provider's defaults, because a team
  whose signatures are dominated by a dynamic value in the message needs its grouping
  fixed before any threshold in this recipe means anything.

## Dependencies

None.

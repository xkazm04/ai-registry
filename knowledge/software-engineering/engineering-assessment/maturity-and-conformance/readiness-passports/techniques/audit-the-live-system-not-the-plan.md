---
layer: technique
type: technique
subject: readiness-passports
technique: audit-the-live-system-not-the-plan
status: forged
laws: [gate-sees-target, claimant-does-not-adjudicate, count-carries-predicate]
shared_with: []
use_when: [a release, launch, certification or submission deadline is near, the plan and the docs say a requirement is met, ranking what is left when time is short, the public write-up claims things ran]
---

# Audit the live system, not the plan

Close to a crossing — a release, a launch review, a certification, a
competition submission — a team's sense of readiness is assembled from the
documents it wrote: the plan says the demo is filmed on Friday, the decisions
file says the integration is done, the write-up says the flows "come next" or,
worse, that they ran. Every one of those is the team's statement about its own
work, and a readiness verdict that reads them has let the claimant decide
([claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate)).
The documents are a proxy for the system, and they drift from it exactly in
the last stretch, when work moves faster than anyone updates the plan
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The rule: **before the crossing, audit every published requirement against
the live system, item by item, and rank the remaining work by the gate each
item fails.** The passport discipline applied to yourself, at the moment it
is hardest: the assessor observes; the subject's account of itself is an
input to be checked, not an answer.

## Start from the requirement's own source

Re-read the authoritative statement of the requirements — the rules page, the
review checklist, the standard's text — not the team's summary of it. The
summary is where a deadline shifts by an hour, a time zone is dropped, a
required artifact becomes optional, and a pass/fail entry gate that precedes
the scored judging goes unmentioned. Copy each requirement out as a line, with
the source's wording, its deadline in an unambiguous zone, and whether failing
it disqualifies or merely costs.

## Observe each requirement where it lives

For each line, find the observation that would settle it and make it against
the running system:

- **Counts from the system of record.** How many pipelines exist on the
  repository being submitted, how many merge requests, issues or agent
  sessions on the project the demonstration claims, read from the platform's
  interface or API — not from memory of having run them. A count carries what
  it counted and where ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
  "zero pipelines on the submission repository" and "two pipelines on the
  development fork" are different findings.
- **Addresses that answer.** Every deployed address the write-up names is
  fetched and returns what it claims; every link is followed as an anonymous
  reader, because reviewers are anonymous readers and some pages that open
  for the team (session pages, private projects, links into files the
  repository ignores) do not open for them.
- **Claims against what ran.** Every sentence in the public write-up that
  says something happened is matched to an artifact that shows it — a
  pipeline, a merged change, a recorded run — or rewritten as planned work.
  An honest "not yet wired" section is worth more to a reviewer than a claim
  they will fail to reproduce.

## Rank by gate, then parallelize

Sort the failures by consequence: an entry gate that disqualifies comes
first, whatever its size; scored criteria next, by how much they move; polish
last. Then split the remaining work into independent tracks that can run in
parallel, with one person or process owning each shared artifact so parallel
tracks do not collide in it. Re-run the audit after the work lands, because
the fix to one line regularly breaks the evidence for another.

## Cautions

- **Your verification traffic is the human's traffic.** Repeated automated
  page loads and API polling from the team's own machine share the address
  the people use, and a host's per-address rate limit then blocks the person
  trying to submit. Throttle automated checks, prefer one API read over many
  page loads, and stop polling once a fact is established.
- **An audit of the plan is not an audit.** Checking that every plan item is
  marked done measures the plan. The audit's input list is the requirements;
  the plan is one more claim to verify against them.
- **Date the audit.** Each observation is true at the moment it was made; an
  audit that does not say when it looked will be trusted after the system
  moved.

## When not to use it

For a crossing with no external gate and no public claim — an internal
milestone the team alone judges — a lighter check against the plan is
proportionate. The technique earns its cost where someone outside the team
will judge the system as it is, by a published standard, at a fixed time.

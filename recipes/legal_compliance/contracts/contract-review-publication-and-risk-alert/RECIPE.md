---
name: contract-review-publication-and-risk-alert
version: 0.1.0
status: seed
domain: legal_compliance
path: legal_compliance/contracts
---

# Contract review publication and risk alert

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A finished review that stays where it was produced helps nobody. The submitter
chases for an answer, and legal either hears about every routine order form or about
none of the dangerous ones, because the thing that decides who gets interrupted is
usually a count of flags rather than what the flags actually are.

**Input.** A completed contract review with its deviations and their severities, the
dates the contract carries, and the team's own rule for who reviews what at which
severity.

**Core action.** Route the review by what the worst finding is rather than by how many
findings there were, publish it where contract records already live, and tell the
submitter who owns the contract now and what is expected of them.

**Output.** The review is on the record where somebody can find it later, the submitter
knows who holds it and by when, the reviewer the severity called for has picked it up,
and a delivery that failed is queued rather than lost.

## Activities

1. Take a completed contract review as it lands *(observe)*
2. Weigh the worst deviation against the level of reviewer the team assigns it
*(decide)*
3. Publish the full review where the team already looks for contract records *(act)*
4. Tell the submitter what was found, who owns it now and what is expected of them
*(act)*
5. Pull in the reviewer the severity calls for, and leave everyone else alone *(act)*
6. Record who accepted the review, the outcome and the dates the contract now carries
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The person who submitted a contract knows what was found, who is holding it and what
is expected of them, without chasing anyone.**

- Every submitter receives the findings, the owner the contract has been routed to, and
  what happens next.
- The message names the specific deviations behind the severity rather than a score on
  its own.
- A submitter who has to do something is told what it is, and a submitter who has to do
  nothing is told that too.

**The reviewer a contract reaches is decided by the worst thing in it, not by how many
things there were.**

- One severe deviation reaches the senior reviewer even when it is the only finding in
  the document.
- A document full of minor departures does not reach the senior reviewer on count alone.
- The routing rule is the team's own written one, so a routing decision can be checked
  afterwards rather than argued about.

**A review that took real work to produce survives a delivery failure and survives being
ignored.**

- A failure to publish or to message keeps the review and queues the delivery rather
  than dropping it.
- A routed review that nobody has picked up after the interval the team set is raised
  again, because sending is not the same as landing.
- The record names the human who accepted the review, so a signed contract can always be
  traced to somebody who read the findings.

## Guidance

Route on the worst finding, not on how many there were. Five cosmetic departures are not
an escalation and one uncapped liability is, and a count cannot tell them apart. Publish
where the team already looks, because a record filed somewhere new is the same as no
record. Sending is not landing: a review nobody has picked up is still yours. Say who
holds the contract now, and remember the finding informs the decision rather than being
it.

## Where this is worth adopting

- A team whose legal channel has been muted, because a threshold set on flag count paged
  them for every standard order form until nobody read it any more.
- A company where contracts are reviewed properly and then discussed in a chat thread,
  so six months later the question of what was flagged before signature has no answer
  anybody trusts.
- A sales organisation where the submitter's real question is not what was found but
  whether they can send the countersignature today, and the silence between review and
  answer is where the deal slows down.
- A growing team splitting one general counsel across three business units, where the
  decision worth automating is not the review but which of the three severities each
  contract belongs to.
- A regulated business that has to show not only that contracts were reviewed but who
  accepted each review, which is the part an informal handoff never produces.

## Connector types

`knowledge_base`, `email`, `messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`event`. The work exists only in response to a review completing and has nothing to do
between reviews. Waking on the completion is the whole of it, and the value of the
routing decays quickly, since a severe finding delivered a day late has already been
overtaken by whoever needed an answer.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- The team's own rule for who reviews what at which severity, because that rule is the
  entire routing decision and a threshold invented here would be somebody else's.
- Where this team already keeps contract records, since publishing into a place nobody
  reads is the same as not publishing.
- How long a routed review may sit unclaimed before it is raised again, which differs
  sharply between a deal desk and a two person company.
- Whether anything going to an external submitter needs a person to see it first, which
  is a relationship decision rather than a technical one.

## Dependencies

None.

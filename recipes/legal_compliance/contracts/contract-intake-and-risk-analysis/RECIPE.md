---
name: contract-intake-and-risk-analysis
version: 0.1.0
status: seed
domain: legal_compliance
path: legal_compliance/contracts
---

# Contract intake and risk analysis

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Contracts get read by whoever had time, against whatever they personally think
is fair, so the same clause is waved through in March and fought over in June. The
clause nobody mentions is the one that is not there: a missing indemnity or a missing
cap reads as silence, and silence is what a reader skimming for problems finds nothing
wrong with.

**Input.** An incoming contract document, the team's playbook for that contract type
where one exists, and the reviewed history of the same counterparty.

**Core action.** Work the contract clause by clause against the position the team
already decided it wants, name every deviation and how far outside the acceptable
fallbacks it sits, and say which expected protections are absent rather than merely
unfavourable.

**Output.** A deviation list a reviewer can work from without rereading the contract:
each departure from the playbook, its severity, the protections that are missing, the
dates the document commits somebody to, and an explicit note wherever the reading could
not be confident.

## Activities

1. Take in an incoming contract and get readable text out of it *(observe)*
2. Decide whether the document is complete enough to review at all *(decide)*
3. Identify the contract type and pull the playbook and counterparty history for it
*(observe)*
4. Work through the clauses, the money and the obligations against the playbook position
for each *(act)*
5. Name each deviation and its severity, and the expected protections that are absent
*(decide)*
6. Hand a reviewer the deviation list and the dates the contract commits anyone to
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**No contract reaches a signature with a departure from the team's own position that
nobody was told about.**

- Every contract taken in produces a list of the clauses that differ from the playbook
  position, each with how far outside the acceptable fallbacks it sits.
- A protection the playbook expects and the contract does not contain is reported as
  missing, which is a different finding from a clause that is present and unfavourable.
- A contract that cannot be classified, reads suspiciously short, or is an amendment
  whose original is not held, is routed to a person rather than reviewed as if it were
  complete.

**The review prepares a human's judgment and is never mistaken for it.**

- Findings are written as deviations from a stated position and as facts about the
  document, not as conclusions about whether a term is enforceable or whether to sign.
- Every clause the reading was not confident about is named as such, with the passage
  attached, rather than being scored and passed on.
- The record of the review names the person who accepted it, so a signed contract can
  always be traced to a human who read the findings.

**A claim that a term is out of line can be traced to a document rather than asserted
from nothing.**

- A comparison to what this counterparty has signed before cites the specific prior
  contracts wherever any exist.
- A comparison made with no playbook and no prior history says so plainly instead of
  implying a baseline that does not exist.

## Guidance

Review against a playbook rather than a personal bar: the position the team prefers for
each clause, what it will accept, and what it will not. A deviation is a difference from
that position, and naming it with its severity is the work. The absent clause is what
pattern reading misses, so report a protection as missing rather than unmentioned.
Escalate instead of guessing when the document is partial or an amendment without its
original. This prepares a reviewer's judgment; the person who signs owns the verdict.

## Where this is worth adopting

- A company signing more vendor paper than one lawyer can read, where the practical
  alternative to this work is not a careful review but a skim by whoever owns the
  budget.
- A sales team on the counterparty's paper for every deal, where the same three clauses
  get conceded again and again because no one has the previous versions in front of them
  at the moment of negotiation.
- A team that has just written its first contract playbook and has no way to tell
  whether anyone is following it, since the playbook only starts paying once deviations
  from it are counted.
- A founder with no in house lawyer and an hourly outside counsel, who needs to arrive
  with the three clauses worth paying for rather than the whole document.
- A procurement function taking in renewals at volume, where an amendment arrives
  without its original often enough that reviewing it as though it were complete is the
  routine failure.

## Connector types

`email`, `storage`, `knowledge_base`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`event`. A contract arriving is a real external occurrence with a clock already attached
to it, and there is nothing to do before one arrives. The predecessor offered both a
poll and a webhook for the same arrival, which is the tell that the arrival rather than
the interval is the thing being waited for.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- The team's playbook: the preferred position for each clause, the fallbacks it will
  accept and what it will not, because without it the review has no standard and
  degrades into one reader's taste.
- Which contract types this team actually sees, since that decides which clauses are
  expected and therefore which absences are findings.
- Where contracts arrive and how they are marked, since the work should not read an
  entire inbox or an entire drive.
- Who owns the verdict for each severity of deviation, because a finding that reaches
  nobody with the authority to act on it has not been delivered.
- Whether an unreadable document should be bounced back to the sender or held quietly,
  which is a relationship decision and not a technical one.

## Dependencies

None.

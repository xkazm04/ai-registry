---
name: access-grant-audit-and-compliance-reporting
version: 0.1.0
status: seed
domain: legal_compliance
path: legal_compliance/compliance-monitoring
---

# Access grant audit and compliance reporting

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** When somebody asks why an access grant was approved, the answer is
reconstructed by hand from logs months later by whoever still remembers. The failure
that looks fine is worse: a period that approved everything, removed nothing and filed a
clean account, because nobody compared the grants against the access that still exists.

**Input.** The ledger of access requests with their approvers, verdicts, justifications
and timings, and the access that is actually in place today to read it against.

**Core action.** Turn one ledger into both the periodic account and any point in time
answer, so the two can never disagree, and read the approval chain as a control rather
than a queue: who approves everything, who holds the chain up, and which grants outlived
the reason they were given.

**Output.** A standing record of who asked, who decided, on what grounds and whether the
access was ever taken away, with the patterns an auditor would ask about named and every
gap in the source stated rather than smoothed over.

## Activities

1. Read the access request ledger across the period, including grants later removed
*(observe)*
2. Read the ledger against the access that is actually in place today *(observe)*
3. Aggregate volumes, verdicts, time to decision and how long grants have lived *(act)*
4. Name the approval patterns worth a question: blanket approval, self approval, grants
that never expire, approvers holding the chain up *(decide)*
5. Compose the account, stating plainly what the ledger cannot answer *(act)*
6. Deliver the account and answer point in time questions from the same ledger
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Anyone asking why an access grant was approved can get the chain of approvals and the
justification behind it for any date range, without a person digging through logs.**

- A question about any requested date range reconstructs each grant with its requester,
  approver, stated justification and timing.
- A grant the ledger cannot fully account for is listed as unaccounted for rather than
  omitted from the total.
- A period with no access requests produces an account saying so, because a period with
  no account reads to an auditor as a review that was skipped.

**The approval step is visible as something that either works or does not, rather than
as a queue that only has a length.**

- The account names approvers individually, both the ones holding the chain up and the
  ones whose verdicts are indistinguishable from automatic approval.
- Grants still in force whose stated justification has expired are listed, not only
  grants that were denied.
- Time to decision and the shape of the verdicts are comparable across consecutive
  periods, and the first account says it is establishing the comparison rather than
  reporting a change.

## Guidance

An approval ledger is half the evidence. The other half is whether the access was ever
taken away, so read the grants against what exists today and treat access nobody revoked
as a finding rather than a gap in the data. An approver who approves everything is a
weaker control than one who is slow, and both are legible in the same ledger. Say what
the source cannot answer instead of writing around it, and file the account for a quiet
period too.

## Where this is worth adopting

- A team a few weeks from a SOC 2 or ISO 27001 audit, holding a year of approval
  messages in a chat channel and no way to answer what an auditor asks first, which is
  not who has access but who decided they should and on what grounds.
- An engineering organisation where production access is granted for an incident and
  quietly kept, so the count of people who can reach the database only ever goes up and
  nobody can say when it last went down.
- A security lead who suspects approvals have become a formality, and needs the pattern
  in front of a manager as a shape in the record rather than as an accusation about how
  carefully they read.
- A small company where one person approves nearly everything and is also the
  bottleneck, and the question of whether to add a second approver keeps being argued
  from impressions rather than from how long requests actually waited.
- A customer or regulator asking a pointed question about one account on one date, where
  the answer has to come from the same record the quarterly account came from or the two
  will contradict each other in writing.

## Connector types

`database`, `messaging`, `knowledge_base`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`time`. The period is the control. Under the frameworks this work is usually done for,
an account that did not land for a period is recorded as a review that was missed rather
than as a quiet period, so the calendar boundary carries meaning that a judgment about
accumulated activity cannot replace. Point in time questions are answered from the same
ledger between accounts and need no trigger of their own.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which framework, if any, the adopter is audited against, because that sets the period,
  the retention the ledger has to reach back over, and what the account is obliged to
  contain.
- Who reads the account and what they decide with it, since that sets its length and
  shape entirely.
- Where the access that was granted can actually be read back from, because without that
  side the account can only describe decisions and never whether they were undone.
- What counts as too slow for an approver here, which is a rhythm judgment about this
  team rather than a fixed number.

## Dependencies

- An access request ledger already being written by the intake work. This recipe reads
  that record and does not create it.

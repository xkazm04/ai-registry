---
layer: technique
type: technique
subject: positioning-and-pricing-transparency
technique: ships-today-vs-claim-separation
status: forged
laws: [never-invent-proof, provenance-is-binary-and-labelled]
shared_with: []
use_when: [writing the per-claim body of a value case, deciding whether a claim may be rehearsed in a sales conversation, reviewing positioning copy for future-tense drift]
---

# Ships-today versus claim separation

Every claim in a value case is written as two labelled parts that never merge:
**the claim** - what the product is, in the terms the buyer will repeat - and
**what ships today** - what a buyer who signs up this afternoon will actually
find. The separation is a structural device against the drift every
positioning document suffers, toward the tense in which the product is best.

The pair also carries the document's one honesty escape valve: a claim whose
ships-today line depends on an integration nobody has run against a live
account gets a **pre-launch caveat** in the same document, and is not
sales-safe until the caveat is closed.

## Procedure

1. **Write the claim first**, in the present tense, as the sentence you want
   repeated. "The workspace treats the second national ad platform as a
   first-class channel."
2. **Write ships-today second**, as an inventory. Name each capability at its
   level: copy-limit checks, keyword suggestions, a typed client, a currency
   convention. Then name what is absent: "no live sync of that platform's
   performance data yet." The absence is written, not implied by omission
   ([provenance is binary and labelled](../../../_laws.md#provenance-is-binary-and-labelled)
   applies to capabilities as it does to numbers).
3. **Reconcile the two.** If the claim reads as broader than the inventory,
   narrow the claim until a buyer who reads both is not surprised by the
   product. The inventory is never widened to fit the claim.
4. **Check every load-bearing dependency.** For each capability in the
   inventory, ask: has this been exercised against the real thing? A client
   whose method set was written from offline documentation and never called
   against a live account is unverified.
5. **Write the caveat where the claim lives.** One paragraph, named as a
   pre-launch must, stating what is unverified and what verifying it would
   take. A caveat in an engineering note is not read by the person selling.
6. **Mark the claim's sales status.** Sales-safe or not. A claim that is not
   sales-safe is not rehearsed where money is on the table, and its channel
   pill on the landing page is not the one a demo leans on.

## Decision rules

- When a claim and its inventory fit in one sentence, split them anyway,
  because the merged sentence is where the tense collapses.
- When the inventory lists an unverified integration, the claim is not
  sales-safe until a live call succeeds, because a capability that has not
  been exercised is a proof the business has not got
  ([never invent proof](../../../_laws.md#never-invent-proof)).
- When a capability degrades safely on failure - an unknown method throws and
  the connector contributes nothing - that is a reason it may ship, not a
  reason it may be claimed; write it in the inventory as "degrades safely,
  unverified".
- When the ships-today line changes, re-read the claim the same day, because
  the drift happens in the direction the inventory did not move.

## What the separation buys

A buyer who reads both parts and signs up has bought the product that exists,
which is the only defence against the "demoed beautifully and underdelivered"
memory every sceptical buyer carries. A founder who writes both parts finds
out which claims are promises, and a promise has a different home - the
roadmap - where it can be dated and tracked rather than sold.

The caveat, in particular, is a document of intent: it converts "we should
probably check that" into a named pre-launch gate with a stated action, and it
is the shape a sceptical reviewer recognises as honesty rather than hedging.

## When NOT to use

- A retrospective case study of a shipped engagement: everything shipped;
  the separation is empty and the two-part form reads as evasive.
- Pure vision or manifesto documents that make no capability claim; the
  inventory has nothing to hold.
- A feature grid derived from the product registry, where the list is
  ships-today by construction and the claim layer is absent; that mechanism
  is `honest-proof-and-illustrative-data`'s and does not need this pairing.

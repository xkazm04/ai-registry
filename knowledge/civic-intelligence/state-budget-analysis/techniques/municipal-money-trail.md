---
layer: technique
type: technique
subject: state-budget-analysis
technique: municipal-money-trail
status: forged
laws: [lead-not-finding, missing-is-not-zero, disclose-never-repair]
shared_with: []
use_when:
  - joining a municipality's budget to the public contract record
  - publishing "this town has contracts with these firms"
  - surfacing firm-to-politician ties next to a town's suppliers
---

# Municipal money trail

The trail answers "where does the town's money go?" by joining the municipality
to the public contract register, and every sentence it produces has two named
parties — a town and a firm. That makes it publication-grade output built from
join logic, and join logic loves to infer. The technique is a set of published
clauses, each of which closes one inference the naive join would make, plus two
disciplines about time and liveness. Print the clauses on the surface that uses
them; a money trail whose rules are implicit is an accusation generator.

## The four clauses of attribution

1. **The town must be a party under its own identifier.** A contract belongs to
   the municipality only when the municipality itself — its registered
   identifier, exactly — appears as a contracting party or publishing body.
   Identifiers of the town's satellites (a school it founded, a technical
   services company it owns, a state body operating locally) are *never*
   resolved upward to the town. Drop, don't guess: the upward inference feels
   obviously right ("the town's utility is the town") and is exactly how a
   founder gets billed for a subsidiary's contracting — a different body's
   mandate hung on the town. Identifier hygiene is part of the clause:
   normalize the registered identifier to its canonical form (fixed width,
   leading zeros restored) and treat anything non-conforming as unusable, not
   as a fuzzy-match candidate.
2. **A partial record is a partial record.** If the contract corpus being
   joined is bounded — seeded from a particular entity set, capped by an ingest
   batch — then a firm's absence from the town's trail means "outside the
   record", never "no contracts"
   ([missing-is-not-zero](../../_laws.md#missing-is-not-zero)). The trail's
   coverage (how many bodies in record, retrieval date, ingest pass) renders
   with the trail. A town absent from the record entirely gets an explicit
   "outside the record" state, never an empty chart implying zero contracting.
3. **Payment direction is asserted only when the record proves it.** "The town
   has a contract with the firm" and "the town paid the firm" are different
   claims. Assert the second only in the one shape where the record makes it
   unambiguous: the record marks the firm as recipient *and* the contract has
   exactly two parties, the town and the firm. Multi-party contracts, records
   without direction flags — often half the register — stay in a third state:
   "direction not stated by the record". Never inferred from role names, never
   defaulted from "who usually pays".
4. **The amount is the contract's registered value, and says so.** Register
   values are commitments, not disbursements; label the sum as contract value,
   never as "spent". Take the amount from the same edge of the same graph
   every other surface reads, so two pages cannot report different money for
   one contract. A contract with several municipal parties counts in full for
   each town's own view and is never summed across towns — per-town views are
   honest; a cross-town total of them would double-count.

## Time and defect discipline

A sum of contract values over a multi-decade record reads as an annual flow
unless the year range renders beside it — so the range is part of the figure.
And the range is where data defects concentrate: registers contain signature
dates that cannot have happened, including dates after the day the register
was read. An impossible year is a data defect, and the response is the
domain's standard one — withhold and disclose, never repair and never punish
the reader ([disclose-never-repair](../../_laws.md#disclose-never-repair)).
Withhold *both* bounds of that row's range (a range with one invented end is
an estimate), keep the row and its money (the defective field is the date, not
the contract), and count withheld rows on the surface so absence of a range is
distinguishable from "nothing checked". The plausibility bound is one shared
definition — the day the register was read, carried with the batch — not a
per-module guess; the incident that anchors this is a published contract
history running seventeen years into the future because one module kept a
private "reasonable year" check.

## Ties to people: live state over frozen batch

When the trail decorates a firm with its recorded ties to politicians, two
data lifetimes meet. The contract aggregates may be a frozen generated batch —
they change only on re-ingest. The human-review state of each tie changes with
every review decision and must be read live: a tie rejected by a reviewer
disappears at the next render, not the next regeneration. Freezing review
state into the batch means publishing overturned claims for weeks. The
mapping is conservative: absence of a review state means pending, never
verified; and every tie renders with its state, because an unreviewed machine
match is a lead, not a finding
([lead-not-finding](../../_laws.md#lead-not-finding)). When the live store is
unreachable, the surface says "ties cannot be verified right now" — an
explicit unavailable state — because silently rendering nothing is the false
claim "no ties".

## When not to use it

The trail shows recorded counterparties and recorded amounts; it is not a
procurement-risk detector (no clause here evaluates whether a price is fair or
a tender was rigged) and not an enrichment metric (contract value reaching a
firm is not money reaching a person — that is a different subject with its own
discipline). Do not run it against registers with no party-identifier field —
name-matching towns to contracts reintroduces every inference the clauses
exist to ban.

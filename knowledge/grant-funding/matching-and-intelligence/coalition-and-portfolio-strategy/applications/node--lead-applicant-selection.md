---
layer: application
type: application
subject: coalition-and-portfolio-strategy
technique: lead-applicant-selection
stack: node
status: forged
verified_on: 2026-10-13
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A lead chosen by capacity alone, beside a gate that already knew better

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-13 at `77f3c2c` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `12a458e` and its ledger row is `8727e03`,
both on the project's `main`.

## The tree had the gate and the default, and never joined them

The technique says start from the highest-capacity member and let eligibility gates veto. The
tree implements both halves in different modules. The coalition proposal takes the
highest-revenue member of the assembled group as lead, with the technique's reasoning attached in
a comment. The eligibility layer, next door, decides per organization whether the funder's
applicant-type and geography rules admit it. Nothing connected them: the proposal never asked the
gate, and peers were ranked on region and mission overlap with no applicant-type filter at all.
So a university or a municipality, larger than every nonprofit beside it, became the recipient of
record for a grant whose applicant codes exclude it.

The structural fact is the second one. The proposal function has no production caller. It is a
tested, pure module waiting for a surface, so the defect was latent, and the fix cost nothing
that anyone depended on. A technique with a veto clause is cheapest to honour before the first
caller exists; afterwards it is a migration.

## What changed

The proposal's grant input gained an optional hook, `canLead`, a predicate over an organization.
The caller builds it from the existing eligibility checks, ignoring the capacity check (the one
failure a coalition cures) and the deadline. With the hook, the lead is the highest-capacity
member that passes. When no assembled member passes, the best-ranked passing peer is added so the
gate has a candidate. When nobody passes, the lead is null and the proposal is not reachable: the
technique's "this coalition cannot responsibly pursue this grant" output, stated in the type
rather than in prose. Members who may not lead still join as subrecipients and keep their share.
Without the hook the function behaves as before.

## The paired proof

Arm A is the function without the hook, verbatim; arm B passes the hook. The population is
constructed, not observed: 48 coalitions, from four applicant-code sets (nonprofit-only,
higher-education, government-only, open) crossed with six entity types for the largest peer and
two revenue levels, scored by the project's real eligibility function.

- **Target: leads the funder's gate rejects.** A 28 of 48, B 0 of 48. In 20 of those 28 cases
  arm B names no lead at all, because every other member is also outside the code set.
- **Floor: nothing moves where the gate has nothing to say.** On the 12 open-grant cases the two
  arms name the same lead. The full suite is green (3,599 tests) and the type check is clean.

The 28 is a property of the matrix, not a rate: no real peer population exists to measure, which
is the same fact as the missing caller. Read it as "the old rule can name an ineligible lead and
the new one cannot", not as how often it would.

## What this realization cannot do

It does not use audit history or prior awards from this funder, the two signals the technique
ranks above raw size; the profile carries neither. It does not model the lead declining, so there
is still no second-choice path beyond "the next passing member by revenue". And it gates the
lead on the same applicant-type heuristics the rest of the layer uses, which are only as good as
the entity type the organization declared: an organization with no declared type is judged on
the jurisdiction default and can pass a gate it would fail with its true legal form.

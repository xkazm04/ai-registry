---
layer: application
type: application
subject: conflict-of-interest-detection
technique: statute-relevance-mapping
stack: node
status: forged
verified_on: 2026-10-13
verified_against: node@24
applied: experiment
ab_verdict: not-better
---

# Node: a declared statute table with no scope column, and a repeal signal that cannot stand in for one

The politicas money layer joins an MP's verified company ties to the votes on
bills that amend a statute governing the company's public-money channel. The
stack is Node 24, as witnessed by the CI pin in `.github/workflows/ci.yml:36`
"node-version: 24". The tree was read at commit `cce005b`.

## Where the technique holds

The table is one declared constant with a rule version, imported by the join and
rendered literally on the public methodology page:
`features/money/collisions/statuteRelevance.ts:32` "export const COLLISION_RULE_VERSION = "strety-v1";",
`features/money/collisions/StretyPage.tsx:109` "rows: CONTRACT_STATUTES". The
join matches by set membership only, with no inference:
`features/money/collisions/deriveCollisions.ts:185` "const hit = bill.amendedRefs.filter((r) => relevantRefs.has(r.ref));".
Channel activity gates the rows, and a tie with no channel gets none.

## Where it does not: the scope column

A row is a reference and a label. It has no jurisdiction, effective period or
text version, and a subsidy channel fires on a bare count:
`features/money/collisions/statuteRelevance.ts:48` "if (tie.subsidiesCount > 0) add(SUBSIDY_STATUTES, "subsidies");".
The technique's scope paragraph asks the method to report exclusions such as a
repealed framework. Nothing in the tree reports one.

## The experiment, chosen to falsify the obvious fix

The obvious fix is to drop an amendment edge when the bill also lists the same
statute as repealed. Its inputs exist: the amendment census records a
per-bill `repealedRefs` list, built from repeal-clause detection
(`scripts/case-loops/law/amends-census.ts:161` "const REPEAL_MARKER = /Zru"). Both arms ran on the committed
regenerated edge set and census (141 bills, 140 checked), read-only.

- Arm A, the table as it is: 15 edges reach the four table statutes, across
  11 bills.
- Arm B, drop an edge whose statute is also in the bill's repealed list: 8
  edges survive on 6 bills. Five bills lose every edge they had; a sixth loses
  one of its three.

Target: candidate bills carrying an unreliable edge. Floor: genuine
amendments retained. The floor fell. Of the 5 bills that vanish, two are titled as
amendments of the listed statute itself (one amends the contract-register act,
one amends the procurement act). A repeal clause inside a bill that amends a
statute removes provisions; it does not repeal the framework. The other three
are omnibus bills amending many statutes, where a repeal clause names the
statute among others. In this population no bill repeals a listed statute
whole. The exclusion class the technique names is real in principle and empty
here.

So B is `not-better`: the signal cannot separate a repealed framework from a
provision-level repeal, and using it as a filter deletes true amendments. The
technique's wording, report exclusions and do not infer, is the correct shape.
A filter is not.

## What the realization cannot do

It cannot say a table row is in force on the vote date, because rows carry no
dates. The regenerated edge payload was prepared against a graph copy and not
applied to the live graph, so the 15-edge count describes the committed
payload, not production. Arm B was not shipped; no product change was made.

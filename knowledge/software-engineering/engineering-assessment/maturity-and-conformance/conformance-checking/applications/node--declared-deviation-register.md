---
layer: application
type: application
subject: conformance-checking
technique: declared-deviation-register
stack: node
verified_on: 2026-09-02
verified_against: node@24.14.0
applied: simulation
ab_verdict: better
proof: structural-only
---

# Two accepted-finding ledgers that never learned a line number

The tree keeps two registers of findings it has decided to accept: a lint
debt baseline (`lint-baseline.json`) and the rule-pairing block in the lint
configuration that names the same entries (`eslint.config.mjs`). Neither
carries a position. The baseline's own header states its predicate —
warning-severity findings grouped by rule id over the whole repository minus
the config's ignore block — and the config's comment ties each demoted rule
to its baseline entry *by rule name*, with the instruction to delete both
together. The join between an accepted finding and its entry is the finding's
identity, and the identity survives every edit that moves code.

## The structural fact

Nobody in this tree chose identity keys against position keys; the ratchet
counts per rule because that is what the ratchet-design technique's
"bucketed baseline" asks for, and the position never entered. The
consequence falls out of the shape: an unrelated edit above an accepted
finding cannot un-accept it, so the ratchet's "any mismatch fails, in either
direction" clause is safe to enforce — a position-keyed register could not
afford that clause, because line drift would trip it on every refactor. The
strictness the tree relies on is available *because* the key is identity.

## The simulation

Three cases from the tree, walked under policy A (entries keyed by
file:line:column, the form most tools print) and policy B (entries keyed by
rule plus symbol, the form the tree uses):

1. **A refactor that reorders imports** above a file holding an accepted
   warning. A: the entry stops matching, the warning resurfaces, the
   symmetric-mismatch rule fails the build on the innocent commit, and the
   fix offered is a re-baseline that names no cause. B: no change; the
   count per rule is identical. Falsified if the tree's lint runner reports
   findings without stable rule ids — it does not.
2. **A rule demoted to warning and paired with its baseline entry**, per
   the config's own comment. A: the pairing has to name a position in a
   second file and rots independently in both. B: one name joins the two
   files, and deleting the pair is a search for that name. Falsified if two
   distinct accepted findings share a rule id and cannot be told apart —
   the per-rule count absorbs that case by design, at the cost of not
   naming sites, which the technique's "per site, not per cause" clause
   would count against this register if a site-level decision ever needed
   recording.
3. **A deleted file that carried accepted findings.** A and B both drop
   the count; the ratchet's forced-look clause catches it in both. The
   policies do not differ here, which is worth recording so the next reader
   does not credit identity keys with a protection they do not provide.

Two sibling trees in the same fleet key their ratchets the same way — one
by suppression kind, one by route name — so the fleet has no position-keyed
register today, and nothing to change. The return condition is the arrival
of a tool whose waiver file is position-keyed by default (mutation and
type-suppression baselines commonly are); the entry then gets keyed by the
mutation or symbol name before the first waiver is written.

## What this cannot show

That identity keys are *sufficient*: a register that counts per rule does
not record which site was accepted or why, and the technique's four-field
entry is not what this tree keeps. The tree has a ratchet with honest keys,
not a deviation register; the application confirms the keying rule and says
nothing about the rest.

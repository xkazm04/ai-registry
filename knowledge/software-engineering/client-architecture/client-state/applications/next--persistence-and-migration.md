---
layer: application
type: application
subject: client-state
technique: persistence-and-migration
stack: next
verified_on: 2026-09-02
verified_against: next@16.3.3
applied: simulation
ab_verdict: better
proof: structural-only
---

# A shape stamp whose honesty rests on a clause nothing enforces

The app's step store (`app/_phases/_shared/stepStore.ts`) stamps every
record it writes with a shape version, and the constant's doc comment
carries the whole policy: absent means the founding version, permanently,
with every field optional; new writes carry the stamp; a record from the
future is refused, never downgraded; migrations are pure step functions at
the read seam. Rules three and four are deliberately unbuilt because one
version exists and the machinery would be untestable. The stamp shipped
alone as "the irreversible half".

## The structural fact

The policy is correct for its encoding — keyed JSON in a browser database,
where a default-on-missing rule can backfill — and the amendment's first
clause says exactly that: under a self-describing encoding an optional
addition is not a new shape, and "absent means v1 with every field optional"
is honest. What the tree does not have is anything that holds the second
half of that sentence. The honesty of version 1 rests on *every field
optional*; the day a required field is added to a stamped interface without
a bump, version 1 covers two shapes, and nothing in the tree — no type-level
test, no gate over the interface declarations, no line in the policy —
would notice. The tree also records why that day is likely: the database
version bump that once fired a close race per open tab (the comment beside
the store's connection handling) is the cost that teaches a team to add
fields without bumping.

## The simulation

Three cases from the tree's history, under policy A (the policy as written)
and policy B (the policy plus the amendment's two clauses: encoding decides
what a shape change is; a number that has covered two shapes is retired):

1. **The commit that introduced the stamp** left every pre-existing record
   unstamped. A and B agree: absent is version 1, and version 1 is the
   all-optional shape, which is the only description true of records that
   predate a field. No difference, and the agreement is the point — the
   amendment does not ask this tree to change its founding rule.
2. **The next commit to the store** added two record types under two new
   phase keys, one with a required field. A and B agree again: a new key is
   a new payload with its own version, not a change to an existing shape.
   Falsified if the new records were written under an existing key — they
   were not.
3. **The first required field added to an existing stamped interface**,
   which the history has not yet produced. A: the stamp stays at 1, old
   records lack the field, the readers that "destructure what they know"
   read `undefined` where the type says `string`, and the failure surfaces
   three screens later as the policy's own comment predicts. B: the change
   is a bump by rule, the read seam gains its first migration, and — should
   the field land without one — the recovery is to bump past 1 and refuse
   it, not to widen the reader. Falsified if the tree's readers already
   treat every field of every stamped record as optional at the type level;
   they do not, which is what the comment's "three readers optional-chain
   through fields their own interface declares REQUIRED" describes.

The verdict is better on the third case alone: the next change is a fifth
rule in the policy comment and a test that fails when a required member is
added to a stamped interface without the constant moving. A positional
encoding is not in this tree, so the amendment's wire-negotiation clause has
no seam here.

## What this cannot show

Whether the type-level test is writable cheaply in this toolchain; the
simulation assumes it is. And it says nothing about the database-level
version, which versions stores and indexes and has its own, documented,
race — the amendment is about the records inside the stores.

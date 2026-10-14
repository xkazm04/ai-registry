---
layer: application
type: application
subject: knowledge-registry
technique: consumer-overlays
stack: node
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# The overlay that was right, and the copies of it that were not

A fleet-management service is the reference consumer of this registry, and it keeps the
overlay the technique describes: a per-consumer settings file beside the registry's neutral
root declaration, a `lanes` map stating its role per lane ("reader" everywhere), a
parser that drops unknown roles instead of coercing them, and a scaffolder that seeds a new
customer registry with a copy of the file. The technique is implemented faithfully, so the
seam was chosen to falsify it: look for the places where one overlay exists in several
copies and ask whether they still agree.

## What the tree showed

- **Three copies, one of them stale.** The reference overlay declares five lanes. The
  scaffolder seeds from a constant that listed four (the knowledge lane, which the indexer
  does read, was missing). The test fixture, a pasted copy of the reference taken before the
  fifth lane existed, also listed four. The existing round-trip test ran the fixture through
  its own parser, so it agreed with itself and could not see the seed drifting from the
  reference.
- **A neighbouring comment contradicting the role.** The seeded file's comment described the
  `registry` telemetry sink as a commit into the usage lane, while the same file declares
  that lane a reader. The code behind the sink writes a different lane and gates on a
  `signals: writer` declaration that no emitted overlay carries. The comment sat one field
  below the role it contradicted, which is the pair the technique warns about.

## A and B

Arm A: the original constant and comment, with two new assertions (seed lanes equal the
reference's; the sink comment names the writer lane and the usage lane stays unwritable).
Three assertions failed (the two new ones, plus one old test that hard-coded four lanes).
Arm B: the constant gains the missing lane, the comment states the real write and its
required role, the fixture is refreshed. All pass; the registry suite (1655 tests) and the
type check stayed green, which is the floor. Shipped to the service's main branch.

## What it adds to the technique

Round-tripping a fixture proves the parser inverts the serializer, not that the seed
matches the reference. The comparison that catches drift is seed against reference,
directly. And a reference file is itself a copy: when it states a role next to a field
that implies the opposite, fix the comment where it is seeded and leave the role alone.

Not changed: whether the consumer should be a writer by default for the contribution lane.
That is a trust decision for the registry's owner, not a drift to repair.

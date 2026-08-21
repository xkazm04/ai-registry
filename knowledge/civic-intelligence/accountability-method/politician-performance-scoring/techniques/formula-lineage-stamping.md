---
layer: technique
type: technique
subject: politician-performance-scoring
technique: formula-lineage-stamping
status: forged
laws: [provenance-or-nothing, one-definition-one-import, incident-anchored-doctrine]
shared_with: []
use_when: [changing a published scoring formula, guarding stored scores against silent overwrites, deciding whether a served ranking matches the deployed method]
---

# Formula lineage stamping

A scoring product has two arms: the formula in code, and the scores in the
store. They are updated by different processes on different days, and nothing
couples them by default. The failure this technique exists for is precise: a
scoring correction lands in code, the store still carries scores from the old
formula, and every surface serves a pre-correction ranking while the methodology
page describes the corrected one — for days, with a full test suite green,
because the formula arm is fixture-fed and the store arm was seeded before the
change. No test can see across that gap. Lineage stamping is the edge between
the arms.

## The mechanism

The formula module exports a **lineage reference** — a short human-readable
string naming the formula's current identity (name the change, not a number:
"committee-dedupe" tells a reader what shifted).

1. **Every writer stamps it.** Any process that writes a score onto a person
   record stamps the reference alongside the score, inside a provenance object
   that also carries the computation batch.
2. **Every reader compares it.** Every surface that prints a score compares the
   stored reference against the one the deployed code declares. Match: the
   ranking is current. Mismatch: the surface says, visibly, that the published
   ranking was authored by a superseded method — **stale, not wrong-in-silence**.
3. **Change means recompute.** The contract, stated at the constant's
   definition: any edit that changes what the scorer returns MUST change the
   reference; a changed reference is not "applied" until a recompute has
   re-stamped every record in the population; until then the store carries the
   old reference and every surface says so.

The reference's definition site is also where the contract and its founding
incident are recorded — the rule with its measured failure attached resists the
"do we really need this" erosion that a bare convention invites.

## The write guard — equality, not ordering

A reference only readers check is a label. The other half is a guard at the
write end: before committing, a writer asks whether the records it is about to
overwrite were stamped by the same formula it implements. If not, the **write is
refused** and a human decides — because in the common failure, the *stored*
scores carry a newer correction than the writer, and proceeding would silently
roll it back.

The comparison is **equality, not lineage ordering** — deliberately. A stored
reference that differs means the data was authored by a formula this build does
not implement, in either direction: older, or newer from a parallel branch.
Ordering references would require a version history the records do not carry,
and no ambient counter can stand in for it — a batch or pass number is a
store-wide counter that any unrelated enrichment advances. Two further rules:

- **Unstamped is not a conflict.** A record with no reference carries no claim to
  contradict; stamping it is an improvement, never a regression. Count and
  report unstamped records, but do not block on them.
- **Override is explicit and named.** The refusal message names both references,
  the recompute path that resolves the conflict correctly, and the exact
  supersede flag a human passes to declare this write the winner. An override
  that exists but is unnamed just teaches operators to disable the guard.

## Decision rules

- When the scorer's *output* changes for any input — new component, changed
  weight or cap, counting fix — change the reference. When only performance,
  logging, or non-output code changes, do not: reference churn that forces
  no-op recomputes trains everyone to batch "later", which is the exact latency
  the technique exists to remove.
- Ship formula change and recompute as one operation wherever possible; where
  not, the mismatch label is the product's honesty during the gap.
- The methodology surface prints only what the store actually carries — the
  current stored reference and whether it matches the deployed code. Do not
  render an invented version history the records cannot attest.

## When not to use this

Skip the machinery only when scores are computed at read time from source data
with nothing stored — there, code and output cannot diverge and the deploy is
the recompute. The moment scores are materialized (for ranking performance, for
stability, for cross-referencing), the two-arm divergence exists and the stamp
is the only edge across it. Do not substitute a code-version identifier for the
reference: most deploys do not change the formula, and a reference that changes
on every release makes "mismatch" meaningless.

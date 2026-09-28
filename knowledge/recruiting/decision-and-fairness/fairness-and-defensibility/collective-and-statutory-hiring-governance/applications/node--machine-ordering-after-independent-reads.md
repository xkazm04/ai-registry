---
layer: application
type: application
subject: collective-and-statutory-hiring-governance
technique: machine-ordering-after-independent-reads
stack: node
status: forged
verified_on: 2026-09-28
verified_against: node@24
applied: simulation
ab_verdict: better
---

# A committee mode with no member reads, and half a reliance monitor (Node)

kp at `aa43bceb0` has a committee governance mode that seals nothing, and a
decision log that can already tell when the machine's advisory lead was the
person moved forward. It has no way for a committee member to record a read,
so it cannot sequence one before the ordering. This page walks three real paths
with the packet technique as it stood (A) and with the new technique (B).

## The three paths

**1. The committee opens the comparison.** In committee mode the modal renders
the full ordering to whoever opens it: the comparison table in rank order, the
fairness panel, the per-candidate tabs. Since `aa43bceb0` there is no crown on
column one (`GroupEvalModal.tsx`, `hasLead` now reads `sealsLead`). The banner
above it reads: "the AI comparison is ADVISORY input for the search committee —
it does not pick or seal a hire. Capture each evaluator's assessment and the
committee's decision in your governance process."
(`app/_lib/group-eval-governance.ts:63-66`).

- **A passes it.** The ordering carries its separation and robustness, there
  is no crown, and the ceiling sentence hands per-evaluator capture to the
  process outside.
- **B finds the gap.** Nothing stops the ordering from being the first document
  the committee sees. The banner names the capture step but not its order: a
  member following it would record their assessment *after* reading the
  machine's ranking, which is the anchoring the capture exists to prevent. B's
  rule for a tool that cannot host reads is to name the sequence: the members'
  assessments are recorded, outside the tool, before the comparison is shared
  with them. That is one clause in the committee banner, in four catalogues.

**2. The sealed advisory record.** The `group_eval_advisory` record
(`group-eval-run.ts:873-888`) carries the governance mode, cohort provenance,
separation, robustness, prompt versions and the lead's clipped reasoning.

- **A passes it.** It is the reconstruction shopping list, sealed.
- **B finds the gap.** The record can reconstruct what the machine said. It
  cannot show how strongly the committee drew on it, because there is no read
  that predates the ordering to compare against. Under the weight test, whether
  this advisory run was advice or the decision is a fact about the committee,
  and kp holds none of it.

**3. The follow signal.** kp writes a `group_eval` pipeline event at seal time
in both branches, and joins an `advanced` or `auto_advanced` event of the same
entry back to it (`app/_lib/decision-attribution.ts:338-367`). The comment
names the advisory case explicitly: the event gives provenance "a visible log
row when the lead is never advanced (an advisory/committee run) or is advanced
hours later by someone else".

- **A has no rule here** and passes by silence.
- **B credits it.** This is step 6's follow-rate, already computable: across
  committee-mode runs, the share whose advisory lead was the entry advanced.
  It is the positive control, found in the tree unprompted. The other half,
  post-reveal movement, is not computable, for the reason in path 2.

## Verdict

B finds a gap on 2 of 3 real paths that A certifies, and finds half of its own
monitor already built on the third. **Better**, at simulation.

The falsifier is a committee-mode deployment whose follow-rate is low: a body
that routinely departs from the machine's first position is visibly not
drawing strongly on it, and the sequencing buys that deployment little. kp has
no committee-mode volume on record to compute it. The return for code is the
banner clause (path 1), then a follow-rate line in the decision analytics from
the existing join (path 3). Per-member locked reads (path 2) are the larger
change, and they wait for a committee user who asks for them.

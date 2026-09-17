---
layer: technique
type: technique
subject: blind-judging-of-agent-runs
technique: facts-beside-the-work
status: draft
laws: [measure-the-tree-not-the-summary, the-repository-outranks-the-instruction]
shared_with: []
use_when: [assembling a judging packet, deciding which measured facts a reviewer sees, explaining why two reviewers rated the same run differently]
---

# Facts beside the work

The concern: a reviewer reading only a diff and a confident summary rates the run's prose.
The defects that matter most in unattended work — an overridden exclusion, a disabled
check, an artefact left uncommitted, a claim the tree contradicts — are invisible at that
distance, and a well-written run hides them without intending to. **The packet carries the
harness's measured facts next to the work, stated as measured, or the verdict is a review
of the writing.**

## What the packet contains

1. **The task** as the run received it, and what the repository is.
2. **The measured facts**: completion, gate results against the baseline, contract
   fulfilment, rule overrides with counts and paths, leftovers, evasions, whether cited
   locations resolve.
3. **The work**: the committed diff, and the artefacts the run wrote — including the ones
   the repository ignores, which no diff shows, and tracked edits it left uncommitted.
   Anything the run produced but the packet omits is work the judge scores as absent.
4. **The run's own summary**, positioned as a claim to be checked against the facts, not as
   a description of what happened.

## Rules that keep the packet honest

- **State facts as measured, not as accusations.** "Committed 39 paths excluded by the
  repository's ignore rules" is a fact; "cheated" is a verdict the judge is there to form.
- **Add new facts as they are discovered, but only where they found something.** A fact key
  that appears with an empty value in every packet changes every packet and forces a
  re-judge that learns nothing; a fact that appears only when it fired keeps clean packets
  byte-identical to their earlier form.
- **Show the run's artefacts even when they were not committed.** For proposal-shaped tasks
  the uncommitted document *is* the deliverable.
- **Do not narrate a mechanical check into a judged dimension.** The judge weighs the facts;
  it does not re-derive them, and asking it to re-check a gate invites disagreement with a
  measurement that is simply true.
- **Keep the packet stable across re-judges** except where the facts genuinely changed, so a
  score movement can be attributed to evidence rather than to formatting.

## Decision rules

- **When reviewers disagree sharply, look at the packet before the reviewers.** A wide
  spread usually means one of them weighed a fact the other did not see, or the task's
  own contract is ambiguous.
- **A fact the packet omitted is a measurement failure, not a judging failure.** Re-judge
  with it present, and record both verdicts: what moved is a direct measurement of what the
  panel weighs.
- **Budget the artefact space explicitly.** Large artefacts must be clipped, and the packet
  says so at the clip point, so a judge never reads truncation as absence.

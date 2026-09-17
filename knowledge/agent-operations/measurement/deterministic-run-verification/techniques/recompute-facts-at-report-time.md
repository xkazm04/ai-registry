---
layer: technique
type: technique
subject: deterministic-run-verification
technique: recompute-facts-at-report-time
status: draft
laws: [measure-the-tree-not-the-summary]
shared_with: []
use_when: [fixing a harness definition while a benchmark is running, deciding whether stored results survive a measurement change, designing what a run record must keep]
---

# Recompute facts at report time

The concern: a fleet's definition of "passed", "left behind" or "overrode a rule" is
refined while runs are already stored — usually because a run did something the definition
never anticipated. If facts were frozen when each run finished, the stored corpus becomes a
patchwork of definitions, and the only honest way to compare anything is to re-run
everything. **Store artefacts, derive facts; re-derive every fact when a report is
produced.**

## What the record must keep

Enough to re-derive any fact without the agent: the clone at the revision the run produced,
the committed diff, the uncommitted diff, every non-code artefact the run wrote (including
the ones the repository ignores, which no diff shows), the gate output, the run's own final
message, and the identity of the task, configuration and starting revision.

A record that keeps only conclusions is a record that must be re-run after every fix, which
in a fleet whose cells cost real minutes means the fixes stop happening.

## The recompute pass

1. **Re-derive the facts** for every stored run under the current definitions, reusing
   stored gate results unless the fix touched the gate path.
2. **Diff what changed**, per run, and keep the list — it is the audit trail explaining why
   a published number moved.
3. **Rebuild anything downstream that a reviewer saw.** If the facts shown to a judge
   changed materially, the verdict was formed on different evidence and must be re-formed;
   if they changed only cosmetically, keep the verdict and note it.
4. **Distinguish material from cosmetic explicitly**, in code. A relabelled field or an
   empty key that a newer definition adds is cosmetic; a new fact, a changed count or a
   changed eligibility is material. Without that distinction a fleet either re-judges
   everything constantly or never re-judges at all.
5. **Leave runs that cannot be recomputed alone, and say so.** A run whose clone was
   deleted keeps its stored facts and is marked as measured under an older definition.

## Decision rules

- **Never edit a stored fact by hand.** Change the derivation and re-derive; a hand-edited
  record is invisible to the audit trail and will disagree with the code that produced its
  siblings.
- **A fix mid-flight is normal; a fix that cannot be applied backwards is a design defect.**
  When a fix can only apply to future runs, say so in the report and treat the corpus as two
  populations.
- **Recompute before every publication**, not only after known fixes: it is cheap, and it
  catches definition drift nobody remembered to flag.

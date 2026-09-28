---
layer: application
type: application
subject: deterministic-run-verification
technique: recompute-facts-at-report-time
stack: process
status: forged
verified_on: 2026-09-27
applied: simulation
ab_verdict: better
---

# Process: sixteen stored runs, one judge name, four judge versions

A memory benchmark stores each run's answers and verdicts, and has a re-judge command that
re-scores cached answers under the current judge without calling any model again. It is the
recompute pass this technique asks for, and it is cheap, so it gets used. Each run's header
records the judge by configuration: model and effort, plus the time it was last re-judged.
The re-judge rewrites the verdicts in place.

## Three cases from the store, walked under both policies

A = the store as it is: judge named by configuration, verdicts overwritten on re-judge.
B = the technique's condition: each verdict set stamped with the judge's code revision
(marked when the working copy differed), the replaced verdicts kept beside the new ones.

1. **Re-judged before the judge was committed.** Five runs were re-judged on 2026-09-04
   between 15:57 and 16:07. The judge fix those re-judges applied was committed at 16:09.
   The verdicts were produced by working-copy code that no commit names exactly. A records
   the same judge name as every other run. B would record the revision before the fix,
   marked as a modified working copy, so nobody could mistake it for either commit.
2. **Two populations in one table.** The judge's code changed on 09-03 (twice), 09-04 and
   09-17. Of the 16 stored runs, seven were last re-judged on 09-04 or 09-07 and nine never
   were, judged under whatever was current when each ran. Every header reads the identical
   judge name, and the comparison command puts all 16 in one table. B splits them by
   revision before any comparison is read.
3. **A fix that moved 16 verdicts, and a store that cannot say so.** On 2026-09-27 two
   judge fixes moved exactly 16 verdicts across the stored runs. That was established by
   running old and new judges side by side outside the store, because the store keeps only
   one verdict per answer. Under A, a re-judge now would replace them silently. Under B, the
   16 moves stay readable as a delta beside the old verdicts, which is the audit trail the
   recompute pass exists to produce.

What would falsify the prediction: judge revisions that produce identical verdicts on every
stored answer, so that the stamp distinguishes nothing material. Case 3 already rules that
out for the latest revision.

Verdict `better`, simulation over three real cases. No code was changed: the harness
belongs to its owner, and the change it needs is two fields in the run header and a second
verdict column on re-judge.

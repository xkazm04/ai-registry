# Compression brief

The judgment half of the compression lane (`docs/compression-lane.md`). The
deterministic half — `scripts/compression-scan.mjs` — has already ranked the
corpus; this brief is what a worker follows on **one document it picked**.

Read the lane document first. The one thing to carry from it: this protocol can
destroy a document while reporting success, and the guard against that is the
order of the two phases below. Do not reorder them.

## Phase 1 — Screen the questions (cheap, and usually decisive)

1. **Do not read the target document.** Everything in this phase depends on
   that. Once you have read it you are contaminated and cannot run the screen;
   a second worker must.
2. From the document's **path and slug alone**, plus the bundle's conventions,
   write down the load-bearing claims you expect it to make. Write them to a
   file before proceeding, so the scoring cannot drift afterwards.
3. **Now** read the document, and score: which of your predictions were right,
   which were partial, and — the number that matters — which of the document's
   major claims you did not anticipate at all.

The surviving set is the document's **irreducible content**: what a reader
gains that they did not already have. A question you answered without the
document measures the model, not the document
([unaided-baseline-screening](../knowledge/software-engineering/llm-agent/evaluation-and-cost/eval-harness/techniques/unaided-baseline-screening.md)).

**Stop here if the irreducible share is high.** A document whose content a
strong reader cannot reconstruct is a document doing its job, and compressing
it trades the exact thing it exists to carry for tokens. Report the share and
close the run. This is the expected outcome for this corpus and it is a
success, not a null result.

## Phase 2 — Compress, and overshoot (only if Phase 1 licensed it)

Run only where Phase 1 found a large reconstructible share.

1. Turn the surviving irreducible claims into checkable questions. These, and
   only these, are the suite.
2. Reduce the document. Keep the file's voice — this corpus reads as one
   author, and a compression pass that flattens it has broken something the
   gates cannot see.
3. **Do not stop while everything passes.** An agent told to shrink under a
   green suite will shrink barely, because the null edit is always green.
   Push until at least one question fails
   ([overshoot-and-restore](../knowledge/software-engineering/llm-agent/evaluation-and-cost/eval-harness/techniques/overshoot-and-restore.md)).
4. Restore the minimum that clears the failure — targeted at what broke, not a
   revert — and re-run to green.
5. Report the **pair**: the last-failing state and the first-passing one. A
   report containing only the final green state cannot distinguish a bound that
   was found from one that was never approached.

## What to hand back

- The predictions file from Phase 1, and the irreducible share.
- If Phase 2 ran: the diff, the token delta (the scan's estimator, named as an
  estimate), the failing question that bounded the run, and what was restored.
- The break-even, stated in inclusions rather than tokens, per
  [context-budgeting](../knowledge/software-engineering/llm-agent/prompt-and-context/prompt-assembly/techniques/context-budgeting.md).
  A pass that will not repay before the document changes again should be
  reported as unprofitable even when it succeeded technically.

## Calibration from the first trial (2026-08-26)

Run against the highest-scoring entry document in the corpus at the time —
`llm-agent/prompt-and-context/structured-output`, ~4,400 estimated tokens, no
measurable repetition. Twelve predictions were written blind: four were right,
four partial, four wrong. Of the document's nine major claims, three were
anticipated in substance, and the document's **spine** — that syntactic
tolerance must be high while semantic strictness is total — was predicted
backwards.

Roughly two-thirds irreducible. Phase 2 was not licensed and did not run.

Read alongside the scan's corpus-wide figure from the same day: mean measurable
repetition **0.94%**, no document above 25%, six above 10% out of ~3,350. The
published prototype this lane is modelled on halved its evaluation article; that
article was synthetic and written with the redundant texture of ordinary
documentation. This corpus does not have that texture, and the lane's honest
default is therefore **do not run Phase 2**. The scan exists to keep it that
way cheaply — and to notice if it ever stops being true.

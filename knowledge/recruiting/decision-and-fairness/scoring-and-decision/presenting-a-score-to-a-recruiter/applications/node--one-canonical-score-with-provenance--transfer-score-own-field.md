---
layer: application
type: application
subject: presenting-a-score-to-a-recruiter
technique: one-canonical-score-with-provenance
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# A transfer score is not a match score: three decisions, three places

The technique says a figure that answers a different question "gets its own caption".
This tree shows why a caption alone would not have held. Its "match" column was
carrying a number that answered a different question, and the fix took three separate
decisions, each made in a different file. (kp at `70dd2319d`; the fix is `3fefc55cb`,
2026-08-28, nine days after the first application on this subject was verified.)

## The incident

`promoteSubmission` moved a work-sample candidate onto the pipeline board by writing the
assignment's **transfer score** (how well the skills the person demonstrated on the task
carry to the role) into `pipeline_entries.match_score`. The board then rendered that
column through `canonicalScoreOf` with provenance `snapshot`, which is to say as a plain
match. The commit message names the second defect: the write was
`sub.transferScore ?? Number(transfer.transferScore ?? 0)`, so a submission whose
evaluation carried no transfer score arrived stamped with a genuine-looking 0, in the
column a `score < threshold` auto-reject reads.

Two defects in one line, and the second is the one the null-score policy at the top of
`app/_lib/match-score.ts` already banned. The policy held for the reads and was bypassed
by a **producer writing a different quantity into the column**. A producer map that lists
three producers (`match-score.ts:46`) had a fourth one nobody had listed, and it wrote to
the only field every surface trusts.

## Decision 1: storage. The number lives where its question lives

`match_score` goes back to meaning "match" and promote writes null. The transfer score is
**not copied** onto the entry under a new name either: it stays on
`dev_submissions.transfer_score`, and the entry reaches it through the
`dev_submission_id` link (with a `ds-` prefix fallback for rows written before the
column). The stated reason (`match-score.ts:173`) is the technique's own rule one level
down: a copy is "a second producer of one number and would drift from the submission the
moment it is re-evaluated". `pipeline-transfer-score.ts` resolves it in one batched read
and stamps `transferScore` on the `/api/pipeline` payload, `null` "never 0-for-absent".

The sweep that fills unscored entries stopped skipping these candidates at the same
time, because they now have a real profile row: a promoted candidate is *unscored for
match* until a real match run scores them, and the run now happens.

## Decision 2: ranking. The match-only read stays match-only

`canonicalScoreOf` and `provenanceOf` were left alone (`match-score.ts:146`, `:152`).
Every ranking, banding and threshold read goes through them (board bands and sort,
decisions peer rank, screen-wave), and the comment gives the reason for not widening
them: doing so "would silently re-create the conflation with better labels on it".
A caption on a mixed read path is a caption on a ranking that has already mixed the
numbers. The separation has to be in the read path, before the caption.

## Decision 3: display. A labelled fallback, out of every ranking

A candidate row still needs to say something for a candidate with no match score, and an
em dash throws away real evidence. `displayScoreOf` (`match-score.ts:215`) is the read
for a surface that shows one number per candidate and can say what kind it is: match
when there is one, else the transfer score, tagged `kind: "match" | "transfer"` either
way, never both and never blended. `PipelineCandidateRow.tsx` renders the kind chip only
on the non-match case (a bare badge means match) and puts the kind in the row label; its
comment states the boundary: "a transfer score is shown, never ranked."

The provenance union grew a member, `{ source: "transfer" }`, and `scoreKindOf` maps
each provenance to its kind. The kind is data the row carries, not a string a component
guesses from the number's origin.

## What tests hold it

`pipeline-transfer-score.test.ts` runs the three decisions as separate assertions. A
submission whose evaluation has no transfer score, the exact input of the old `?? 0`,
lands with `matchScore` null and `transferScore` null, and `displayScoreOf` returns null
(no number at all rather than a zero). A submission with a score of 82 displays as
`{ score: 82, provenance: { source: "transfer" }, kind: "transfer" }` while
`canonicalScoreOf` stays null on the same entry, and once a real match score exists it
wins the slot and keeps its own kind. A legacy `ds-` row still resolves through the
prefix, and one team's entry cannot resolve another team's submission.
`pipelineBoardProjection.test.ts` pins the payload fields so a projection cannot drop the
kind.

## Deviations still open

- Producer (C), the fresh `score_job` recomputed at draft-offer time, is still not
  persisted and still drifts from the snapshot (`automation.py`, `draft_offer`). Its
  containment is the offer card's own label, exactly as before.
- **The rubric version now exists, and nothing shows it.** The first application here
  recorded that no rubric version rides with the resolved score. Since
  `0c6993773` (2026-09-24) `pipeline_entries.rubric_version` holds "the frozen
  `role_rubrics.version` this entry's evaluation was produced against. NULL = unknown
  standard, never 'the current one'" (`db/core.ts:609`), and `rubricVersion` is in the
  board allowlist with a comment that the drawer "must be able to say WHICH standard a
  score was produced against". No component under `app/features` reads it. The column
  is also the *role* rubric's version, not the matcher's own scoring version, so a
  change to the weights in `matching.py` still marks nothing historical as superseded.
  The half that is honest by construction is the NULL: an unknown standard is stored as
  unknown.

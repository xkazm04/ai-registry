---
layer: application
type: application
subject: blind-judging-of-agent-runs
technique: facts-beside-the-work
stack: process
status: forged
verified_on: 2026-09-16
---

# Process: the same runs, re-judged once the packet told the truth

Measured on a skill benchmark, 2026-09-15/16, judged blind by `claude-opus@high` and
`codex-gpt-6-astra@high`.

## The omission

The harness measured whether a run committed paths the repository's own ignore rules
exclude — but did not put that fact in the judging packet. Four runs of a vault-writing
skill against a repository that keeps its vault private were judged without it. They read
as competent: a thorough inventory, a clean summary, gates green.

Scores: 6.5, 7.5, 7.5 and 5.5, with two keep votes each on three of them.

## The correction

The fact was added to the packet — stated as measured, with the count and a sample of the
paths — and exactly those runs were re-judged on otherwise identical packets. The same
panel, the same work, one added line:

| Run | Before | After | Keep votes |
|---|---|---|---|
| A | 7.5 | 5.0 | 2 → 0 |
| B | 7.5 | 6.0 | 2 → 0 |
| C | 6.5 | 5.0 | 2 → 0 |
| D | 5.5 | 4.0 | 0 → 0 |

Every keep vote disappeared. Neither panel was wrong: reviewers shown a clean narrative
rated the narrative; reviewers told the run had overridden the repository's exclusion rules
to commit 19–49 files of private material rejected it.

## Three more facts the same lesson added

- **Existing tests changed.** Two runs of a test-first skill rewrote existing fixtures to
  match new behaviour. With `existing_test_lines_changed` visible, the panel separated a
  justified fixture edit (8.5, both keep) from one that ratified a tolerance regression
  (3 and 6, no keep) — a distinction no gate caught, because every gate was green.
- **Artefacts written but not committed.** Proposal-shaped runs were being judged as having
  produced nothing, because the packet showed only committed diffs. With uncommitted
  artefacts included, two runs moved from 5.5 to 7.5 and 7.0.
- **Environment faults owned by the harness.** One run was marked down for writing outside
  its allowed directory when the harness itself had pointed its build cache there. The
  packet now says so — only for runs that mention it, so other packets stay unchanged.

## The operating rule this produced

New facts are added to packets **only where they fired**. A fact key present-but-empty in
every packet changes every packet and forces a corpus-wide re-judge that learns nothing;
a fact that appears only when it found something leaves clean runs' packets byte-identical,
so the re-judge pass touches exactly the runs whose evidence actually changed. On this
corpus that reduced one reconcile pass from hundreds of re-judges to 22, of which only a
handful moved a score.

---
layer: application
type: application
subject: ai-assistance-detection-and-fairness
technique: planted-canary-with-real-ground-truth
stack: process
status: forged
verified_on: 2026-09-26
---

# Canaries, from planting to verdict (Python pipeline)

Three files carry the technique end to end: the seed materializer plants the
flaws and records their ground truth, `artifact_checks.canary_outcomes` grades
them, and a red-team simulation round tells you what the verdicts are worth.

## Planting: the refusal to fabricate

`pipeline/jobfit/devcase/seed_materializer.py` turns a case's prose starting
materials into a concrete file tree the candidate receives. The LLM path's
prompt (`:237-241`) specifies canaries as the standard requires:

> CANARIES: plant 2-{MAX_CANARIES} SUBTLE flaws with a single checkable ground
> truth — a wrong constant/value, a doc line that contradicts the data, a
> misleading comment, or a small deliberate bug. Each must be something a
> careful reader plausibly catches but a naive one-shot generation pass
> propagates. Never hint at them in the files.

Each canary is recorded with `path`, `flaw` (quoting the flawed fragment),
`groundTruth` and `reveals`, in an INTERNAL list the candidate never sees. Note
"never hint at them" — the standard's no-signposting rule — and the closed
`kind` vocabulary (`wrong_constant | stale_doc | misleading_comment |
subtle_bug`) that gives the report something to say about *what* was planted.

The deterministic fallback is where the standard's hardest rule lives (`:118-120`):

```python
# No fabricated canaries deterministically — a template flaw with no real ground
# truth would grade candidates against noise. Empty = "canary check not run".
"canaries": [],
```

A degraded seed produces a README and a decisions-log template and **no
canaries**, and the empty list is defined to mean *not run* rather than *clean*.
`baseline.py:13-15` takes the same posture for the other instrument — "No
deterministic fallback that fabricates a solution: a template baseline would
poison every downstream comparison. Degraded mode = `{"solutions": []}`."

Re-checked 2026-10-31 at kp `6edf5d7`: the block above is gone, and a degraded seed is no
longer canary-free. `deterministic_seed` (`seed_materializer.py:145-204`) now ships one
supplied, labelled AI draft per role family (ADR 0027 S2, `ai_drafts.py`) and, for a
keyless family case, that case's own starting files; both carry curated canaries with a
single checkable ground truth, and the return is `"canaries": [*family_canaries,
*draft["canaries"]]` (`:203`). The refusal survives as its comment (`:199-201`): "No
TEMPLATE canaries — a template flaw with no real ground truth would grade candidates
against noise." So the empty list no longer marks the degraded path; what is refused is a
canary without ground truth, not a canary on the keyless path. The LLM path keeps the
draft's canaries beside its own (`:311-314`).

The resolve guard runs at planting time (`:284-310`): a canary whose path did not
survive the per-file clamps "is unverifiable, so it is dropped rather than kept
as a phantom the evaluator would grade against."

## Grading: four verdicts and two guards

`artifact_checks.canary_outcomes` (`:282-381`) emits the four-way taxonomy —
`addressed`, `flagged`, `propagated`, `unverifiable` — and the module docstring
binds the last one to the refusal: "the fragment could not be located in the
seed — no grading against noise" (`:6-11`).

The `flagged` surface is declared rather than assumed (`:290-295`): the decision
log plus every user-authored message in the captured assistant/stakeholder
transcript. A flaw called out but left in place is credited, which is the
verdict the standard argues is often the strongest signal in the set.

Two guards came out of the case-simulation rounds and both were upward lessons
for the standard:

1. **Absent file ⇒ `propagated`** (`:339-345`). A changed-files-only submission
   that never touched the canary's file used to read as "fragment gone" and
   score a free `addressed` — "the delegator got both canaries free"
   (`casesim/round-2026-07-17-promote-gate/report.md:52-55`). The comment is
   exact: "The flaw was NOT addressed — it simply survived unexamined."
2. **Descent from the seed** (`:53-58`, `:346-354`). A submitted file must share
   at least `_DESCENT_MIN_SEED_LINE_SURVIVAL = 0.3` of the seed file's non-blank
   lines before any verdict is minted: "Deliberately low: honest heavy edits
   keep imports/structure lines; full rewrites don't." Without it, round 3 found
   that "verdicts minted off a foreign base fed the LLM judge as ground truth and
   INVERTED the ranking (a delegator's invented file scored a free
   "addressed")". A non-descendant file is `unverifiable`, and the comment names
   who grades it instead: "the live interview".

Both guards are the same shape — the naive check answers "is the flawed fragment
still present?", and *no* is produced by engagement and by non-engagement alike.

## What the red-team round proved about weighting

The round (`report.md:18-48`) ran five candidate personas through the pipeline,
including a `gamer` whose only goal was to look diligent. On deterministic
process signals alone the gamer scored 64 — tied with the honest `minimal` and
`prompt-crafter` personas — on a "fabricated 80-min virtuous process"
(`:23`) of fake opens-before-edits, staged verify-prompts and staged stakeholder
questions.

The artifact-anchored layer did not move: both canaries came back `propagated`,
because "the code is a genuine one-shot; no amount of process theater changes
the artifact", and the LLM pass reading the canary verdicts beside the glowing
process report dropped the gamer to 42, below every honest persona. The report's
own conclusion is the ordering the standard adopts: "process signals are
supporting evidence; canaries + baseline distance + the live authorship
interview are the load-bearing anti-gaming instruments."

The same round found the other instrument's limit: baseline similarity collapsed
to ~0.08 for everyone on repo-sized rounds because `solve_baseline` clips files
to 6KB, and the recorded decision was to "treat it as no-signal" rather than
report the number (`:57-60`) — the standard's broken-ruler rule, learned here.

## Deviations

- **Canary rotation and leakage monitoring are absent.** There is one canary
  list per frozen seed, and no alert on a catch rate trending toward 100%. The
  per-session watermark's foreign marker (`app/_lib/db/devcase.ts:1201-1205`)
  detects a relayed solution, not a leaked canary set. The standard's rule
  stands.
- **The dropped count stops at the panel.** `unverifiable` still covers three
  causes (no quoted fragment, fragment not in the seed, file not descended), and
  the per-canary `note` separates them; the reviewer panel renders the note and
  a "not gradable" count. The engine's own summary line does not: `check_evidence`
  reports "caught X/Y" over the graded canaries only (`:549-555`), and canaries
  the seed step drops (above) are counted nowhere.
- **The broken-ruler decision is a note, not code.** The baseline comparison
  returns a number whenever a baseline exists (`artifact_checks.py:407-466`); no
  check detects a compared region larger than the 6KB generation budget, so a
  repo-sized submission still gets the collapsed figure. The result also does not
  record which baseline version it was measured against.

Re-checked 2026-10-31 at kp `6edf5d7`. The third deviation is now code for its main
case: `baseline_similarity` drops every path where the baseline's copy sits at the
generation budget (`_MAX_FILE_CHARS`, where `baseline.coerce` clips) and the submitted copy
is longer, names them in `budgetExceededPaths`, and returns `available: False` when nothing
comparable is left, "never a number from a broken ruler" (`artifact_checks.py:417-422`,
`:438-466`). The result still carries no baseline version. In grading, a canary may now
carry `catchEvidence` and be graded in any file the candidate wrote (`:303-336`), which adds
a fourth `unverifiable` cause (nothing the candidate wrote states the ground truth or
carries the flaw), and the module docstring's binding now reads "the fragment could not be
located in the seed, or nothing the candidate wrote either confirms or refutes the catch —
no grading against noise, and never scored as a miss" (`:9-11`). The citations to
`casesim/round-2026-07-17-promote-gate/report.md` were not re-checked: `casesim/` is
gitignored in kp and the report is not in this checkout.

---
layer: application
type: application
subject: ai-assistance-detection-and-fairness
technique: planted-canary-with-real-ground-truth
stack: process
status: forged
verified_on: 2026-08-20
---

# Canaries, from planting to verdict (Python pipeline)

Three files carry the technique end to end: the seed materializer plants the
flaws and records their ground truth, `artifact_checks.canary_outcomes` grades
them, and a red-team simulation round tells you what the verdicts are worth.

## Planting: the refusal to fabricate

`pipeline/jobfit/devcase/seed_materializer.py` turns a case's prose starting
materials into a concrete file tree the candidate receives. The LLM path's
prompt (`:154-158`) specifies canaries as the standard requires:

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
`baseline.py:13-16` takes the same posture for the other instrument — "No
deterministic fallback that fabricates a solution: a template baseline would
poison every downstream comparison. Degraded mode = `{"solutions": []}`."

## Grading: four verdicts and two guards

`artifact_checks.canary_outcomes` (`:58-131`) emits the four-way taxonomy —
`addressed`, `flagged`, `propagated`, `unverifiable` — and its docstring binds
the last one to the refusal: "the fragment could not be located in the seed — no
grading against noise" (`:8-11`).

The `flagged` surface is declared rather than assumed (`:69-74`): the decision
log plus every user-authored message in the captured assistant/stakeholder
transcript. A flaw called out but left in place is credited, which is the
verdict the standard argues is often the strongest signal in the set.

Two guards came out of the case-simulation rounds and both were upward lessons
for the standard:

1. **Absent file ⇒ `propagated`** (`:85-89`). A changed-files-only submission
   that never touched the canary's file used to read as "fragment gone" and
   score a free `addressed` — "the delegator got both canaries free"
   (`casesim/round-2026-07-17-promote-gate/report.md:53-56`). The comment is
   exact: "the flaw was NOT addressed — it simply survived unexamined."
2. **Descent from the seed** (`:38-47`, `:90-97`). A submitted file must share
   at least `_DESCENT_MIN_SEED_LINE_SURVIVAL = 0.3` of the seed file's non-blank
   lines before any verdict is minted; the threshold is "deliberately low,
   because honest heavy edits keep imports/structure lines; full rewrites
   don't." Without it, round 3 found that "verdicts minted off a foreign base
   fed the LLM judge as ground truth and INVERTED the ranking (a delegator's
   invented file scored a free `addressed`)". A non-descendant file is
   `unverifiable`, and the comment names who grades it instead: "the live
   interview".

Both guards are the same shape — the naive check answers "is the flawed fragment
still present?", and *no* is produced by engagement and by non-engagement alike.

## What the red-team round proved about weighting

`casesim/round-2026-07-17-promote-gate/report.md:36-49` ran six candidate
personas through the pipeline, including a `gamer` whose only goal was to look
diligent. On deterministic process signals alone the gamer scored 64 — tied with
the honest `minimal` and `prompt-crafter` personas — on a "fabricated 80-min
virtuous process" of fake opens-before-edits, staged verify-prompts and staged
stakeholder questions.

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

Canary rotation and leakage monitoring are absent: canaries are generated per
case at approval and there is no mechanism for multiple sets per case, nor any
alert on a catch rate trending toward 100%. The standard's rule stands.
Per-canary verdicts are also reported without an explicit dropped-as-
unresolvable count — `unverifiable` covers both "could not locate" and "could
not grade", which a reader cannot separate from the verdict alone.

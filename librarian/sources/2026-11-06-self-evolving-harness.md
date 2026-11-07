---
source: https://www.youtube.com/watch?v=pW2ktrJlsyE
kind: youtube
url: https://www.youtube.com/watch?v=pW2ktrJlsyE
title: "Harness² Explained: Self-Improving Agents Without Training"
author: "Prompt Engineering"
words: 1752
extracted: 17
accepted: 3
declined: 0
leads: 3
already_covered: 4
untriaged: 6
dispatched: 0
applied: 2
shipped: 0
run_id: shift-harness
siblings: 1
---

# Self-evolving harness, one video and its paper, mined under /shift, 2026-11-06

Plan `plan-20261106-150931`, cluster `self-evolving-harness`. Batch of one, with one voice, so
no channel convergence is counted. The video is a second-hand review, and the extraction is the
paper it points at: "Harness2: Recursive Agent Harnessing for an Open World", arXiv 2610.14224v1,
9 Oct 2026, Google Cloud AI Research and Northwestern, an unreviewed preprint. Phase 7.7:
gate=skipped (unattended shift); nothing was asked.

| Voice | Video | Read |
| --- | --- | --- |
| Prompt Engineering | pW2ktrJlsyE | transcript whole (1,752 words); quotes re-checked by the lander |

Primaries opened in this run by the lander, separately from the miner: the paper's PDF through
`pdftotext` (main body, appendices C, D, E, F and the composer and reflector prompts). The
arXiv HTML omits figure text, and the checker case exists only in Figure 14. `research-ingest`
exits 2 on the local PDF path. The personas tree was read at 312e3ecb2d and not changed. The
paper's code repository was not opened.

## Triage

Upper-layer rows ran under Phase 5, G/R/C. Skill and doc rows ran under judgment. Currency and
leads ran under the corroboration table.

| # | Candidate | Shape, rule | Read | G/R/C | Decision |
|---|---|---|---|---|---|
| 1 | Accept a harness edit by contrast, and call it adoption | technique, Phase 5 | real gap | 2/0/2 | **landed**, `contrast-before-adoption`, with a section from its own failed floor |
| 2 | One component per round buys knowledge, not the task's result | amendment, Phase 5 | partial | 2/2/1 | **untriaged**, was 2/0/1: fails the rewrite test. Proposal 1 |
| 3 | A reviser's store is worth what its runs explored | amendment, Phase 5 | real gap | 2/0/1 | **landed** in `diagnosis-withheld-from-the-executor`, two figures corrected |
| 4 | Record judge family and draws on every evaluation | skill, judgment | real gap | n/a | **landed** in harvest 0.7.0, as note-cell fields rather than columns |
| 5 | Say what a lesson rests on | doc, judgment | real gap | n/a | **untriaged**: stamped into every shared skill. Proposal 2 |
| 6 | Several draws per arm where a check is all-or-nothing | skill, judgment | partial | n/a | **untriaged**: the number would be ours, and the price rises. Proposal 3 |
| 7 | Blinding removes provenance bias, not rubric bias | amendment, Phase 5 | partial | 1/0/1 | **untriaged** |
| 8 | A check red at base, green at head can still carry the author's premise | amendment, Phase 5 | partial | 1/1/1 | **untriaged**, rests on an inference about the base run |
| 9 | Self-written checker echoes its author | catch | likely catch | n/a | already covered: `oracle-frozen-during-repair`, `candidate-write-access` opened. The new technique cites the instance |
| 10 | Keep always-on text small | catch | likely catch | n/a | already covered: `capability-before-steering`, `line-earning` |
| 11 | Put hard rules in the loop | catch | likely catch | n/a | already covered: `enforcement-demotion`, opened, which the miner had not. The premise is corrected below |
| 12 | A harness transfers across models | catch | likely catch | n/a | already covered: `procedure-promotion`, third source |
| 13 | Harness and model now compare in size, on some benchmarks | currency, table | dated fact | n/a | **note only**: no application carries this comparison. Dated to 2610.14224v1 |
| 14 | An agent fetched the benchmark's rubric during validation | lead, table | thin | n/a | lead |
| 15 | A forced edit may be what loses | lead, table | partial | n/a | lead |
| 16 | Trace-driven harness patching, second implementation | lead, table, `reconsider?` | partial | n/a | lead: an earlier return condition fired |
| 17 | Write verified facts into a per-task harness | amendment, Phase 5 | partial | 1/2/1 | **untriaged**, prompt prose alone |

Admission: auto=2/4/0, fp=1 on the miner's accepts (row 2). Row 2 dies at the rewrite test, the
Phase 6 stage, and row 5 moves to a proposal on its blast radius. Rows 4 and 5 are outside the
score.

**The rewrite test on row 2, as dispatched.** The miner placed the amendment after "a random walk
with a good narrator", read the rule as local to a section titled as an experiment, and scored R 0.
Three standing sentences say otherwise. "A round changes exactly one of them" has no carve-out. "The
shape holds whether the experimenter is a person or an agent" extends it to the very loop the paper
ran. "Its improving headline is the same theatre" would be false of a loop that bundles and gains in
twelve of twelve pairs, which is what the amendment says is legal. Telling a reader that such a loop
"may change several components at once" narrows the scope, so the row takes +2. 2/2/1 falls below
threshold on arithmetic, and it stays untriaged. Nothing in `failure-attribution` was edited. The new
technique states its own side and links across: a candidate may be bundled, nothing it shows is
evidence about a component, and a loop that means to learn needs one change per round.

**G and R on row 1.** G 2: `eval-harness` is not in `librarian-scan`'s top 15 (32 points, line 64 of
the scan). R 0: the paper and every home were opened. The home is not contested.
`probe-confirmed-model-proposals` states "an instrument exists that can test each line" as its entry
condition, and `procedure-promotion`'s door requires recurrence, which a one-task edit never has.

## Which of the video's claims the paper corrected

Twelve claims were compared. The paper corrected eight, did not test one, and left two standing
with a limit. It is silent on a thirteenth, row 14.

| Video | Paper | Status |
| --- | --- | --- |
| The agent rewrites itself "while it works" [00:00:54] | Frozen executor; a separate editor session edits between whole rollouts; the improver is fixed during the task | corrected |
| Only "proven edits" merge | One rollout per candidate, "weak evidence either way"; "adoption rather than verified optimality"; "do not guarantee correctness" | corrected |
| Small model "flat-out beat" the frontier model [00:01:20] | 1 of 3 benchmarks. GLM-5 against base Gemini: WorkBuddy 75.7 vs 72.4 and 75.3 vs 74.5; JobBench 24.2 vs 31.5 and 24.8 vs 33.9; LAB 71.4 vs 79.9 and 65.9 vs 71.6. Still behind at k=5 on the other two | corrected |
| Blind self-edits lost "10%" | 10.2 points on Code, 4.9 on Web, one configuration, with no reference run, probes or library | corrected |
| "35 to 50 points in a single step" [00:08:14] | Hand-picked tasks: +34.7, +50.1. Benchmark maxima are 11.5 points and 11.8 pp | corrected |
| A purpose-built harness "always beats" a generic one | Per-task revision is below its stock base in 7 of 12 pairs (recounted) | corrected |
| A watchdog "forced it to stop", a task "blocked itself" [00:03:54] | The watchdog "never blocks; only appends" (Fig. 19). The editor prompt says a plugin must not block valid completion | corrected. "Enforce your rules in the loop" is not what the case did |
| "Researchers tested" prompt rules getting worse | No such experiment; an assertion in the editor prompt. Nearest measure: removing the prompt group loses 1.5 (Table 6) | corrected |
| Use your first 10-20 tasks, then reuse cheaply [00:09:33] | Not tested at that size; streams are 25-100 tasks | unsupported |
| Harness "handed unchanged" gains 17 points [00:08:39] | GLM-5 Code only; Gemini 3.7 Flash +0.3, Opus 4.8 +2.6 on Code. Editor prompts carry workspace facts, and no other tasks are stated | true, narrow |
| Self-written checker passed three times | Figure 14 only. The check was written by the editor, and the paper's remedy is motivated, not tested | true, narrow |
| 4 to 20 full runs per task | 1+2+1 at k=1, 5+10+5 at k=5, editor sessions extra | correct |

## Promotion read: what it contradicted in the report

- **Row 1, "many gains inside spread".** Recounted across all twelve pairs: 3 of 12 gains do not
  exceed the larger of the two arms' standard deviations. The table's text extraction scrambles rows,
  so assignment was checked against the prose figures (5.1, 11.5, 4.5, 1.4, 3.6, 1.2, 11.8).
- **Row 3, "inside the 2.3 to 2.5 spread".** 1.8 is inside 2.3, and 3.1 is not inside 2.5. Fixed.
- **Row 3, "one probe per task".** k=1 is one candidate per scope, so two per task. "Not how many
  entries it holds" was cut, because entry counts are unreported.
- **Row 3, "tests the reviser alone".** Adopted library lines reach executors: 22-47% of modified
  files carry library provenance (Fig. 10). Reworded.
- **Row 4, the ledger template.** Two new columns before `verdict` break `evaluationDebt`, which reads
  the column by the header's position. Note-cell fields landed instead. The counts held: 18 settled
  rows, 1 records a judge's family.
- **Row 1, "no contrast", and the judge clause.** Reworded to what App. C and B state: an edit that was
  forced and deployed unprobed; a judge who was the executor in half the configurations and the editor
  in all of the other benchmark's.
- **Row 1's seam.** `run_prompt_ab_test` is not where an edit is proposed. `lab_improve_prompt` is, and
  the miner did not find it. Row 3's seam was left unnamed in the report, and it stays unapplied.

## Phase 7.5

| Row | Mode | Verdict | Read |
| --- | --- | --- | --- |
| 1 | blind-ab | not-better | Personas, chosen to falsify, since a cold agent might say all of this unaided. Two draws per arm, rubric first, one blind GPT judge, once. 8/10 against 5/10; governed checks 4/4 against 0/4. Floor: the fit check 0/2 against 1/2, and both draws with the technique built adoption on a tag call that leaves the live prompt untouched, while both without it read that correctly. Target moved, floor fell. No tolerance was declared in advance. Details in the application |
| 3 | none | unapplied | No project reviser reads a store: the personas improver reads scores and ratings alone. Return when a project keeps one. No `blind-ab` was run: a design probe would test wording, and the claim is about a store's history |

Rows 1 and 3 land as passed Phase 5 with the mode stated. Row 1 gained the "Read the seam" section,
as `not-better` requires. One more `not-better` from another project demotes it to a lead.

No held row was banked. This cluster owes no GPU proof, and no unattended proof here is specific
enough: the useful re-run of row 1 needs an operator's choice of draws and a declared tolerance.

## Row 4: why it landed and row 5 did not

Row 4 is two bullets and a sentence in one reference, and it applies text the corpus already has:
the agent-operations law, L16, `blind-judging-of-agent-runs`, and the golden path's k of N. It costs
one clause per row. Row 5 is one sentence too, but it is stamped into every shared skill, intake's
Phase 11 restates it by hand, and its rule that a single-run lesson may not edit a method would
change every skill's reflection. So it stays a proposal.

## Proposals, not landed

1. **`failure-attribution` boundary (row 2).** Banked wording, after "a random walk with a good
   narrator": "One component per round is what a search needs to learn which part was load-bearing.
   A loop adapting a harness to one task it will not see again is after that task's output, and it may
   change several components at once. What it may not do is learn from the bundle. The question is who
   reads the record: if a later round will treat it as evidence about a component, change one." Needs
   someone to rule on "the shape holds whether the experimenter is a person or an agent" and "the same
   theatre". Merging beat picking by 1.6 and 1.9, inside spread, so the case is not strong.
2. **`docs/skill-clauses/skill-reflection.md` (row 5).** Add to the lesson bullet: "Say what the lesson
   rests on: `contrast`, `repeat` with N, or `single-run`. A `single-run` lesson is a hypothesis: it
   does not edit a method by itself. If several things changed and nothing isolates one, write that it
   is confounded." Regenerate, and restate in intake Phase 11. The paper made this a design choice and
   did not ablate it, so it is judgment.
3. **Draws per arm in `/harvest evaluate` (row 6).** Two per arm is what this run paid, and two was
   enough to see the floor drop and not enough to size it. A minimum raises an evaluation from about 3
   sessions to 5 or 7. An operator trade.
4. **"Never evaluate against the registry itself"** in `evaluation.md` against the ledger's eight
   `method:` rows routed to ai-registry. They test methods, not recall, so a carve-out would fit.
   Unresolved, and observed rather than caused by this source.
5. **L16's remedy list (row 8, a law).** "A deterministic check" is a remedy, and the validator case had
   one its author wrote. The law's other clause covers it only if "producer" means the premise's author.
   One source cannot move a law (V3). Listed, not written.
6. **Personas, not changed.** (a) The prompt lab's production tag does not write the prompt to the
   persona, so a future improver must adopt through the rollback path. Worth reading against what the
   UI calls. (b) The improver saves an experimental version with no comparison, and a persona with no
   scenarios cannot reach it. `contrast-before-adoption` is the design if the product wants that path.

## Leads: return conditions

- **Row 14, an agent fetched the rubric.** The video attributes this to "the repo"; the paper's guard
  refuses a working directory holding "a grader verdict, rubric, or score". *Return when* the repository
  is opened and the run can be cited.
- **Row 15, a forced edit may be what loses.** It differs in four ways at once. *Return when* a study
  ablates the forced edit alone.
- **Row 16, `reconsider?`.** The return condition on `2026-08-28-autosaddler-harness-optimization` fired:
  this is a second implementation with gains. The paper's fixed stage instructions put it on the state
  side of the architecture-or-state lead in `2026-08-29-future-of-ai-harness-to-rsi`. No new subject,
  since rows 1 and 3 follow subjects the corpus already has. *Return when* a connected project runs such
  a loop over its own configuration.

## Could not verify, and what was not done

- The paper's repository, so whether its code matches its prompts is unknown.
- The counter-evidence lane: no competing benchmark was fetched, and comparisons rest on the authors'
  own ports.
- Figure 7's Office bars at k=1 are scrambled in extraction, so only stated values are used. Figure 14
  does not name the validator case's executor.
- One judge read and one model per arm. The judge's vendor differs from the arms', and the arm model
  differs from the lander's. Judge output stayed in scratch. No project test suite, build or GPU ran.

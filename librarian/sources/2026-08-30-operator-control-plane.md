---
source: repo
url: https://github.com/blue-az/operator-control-plane
title: "operator-control-plane - local ledger for claims, evidence and verification across agents"
author: solo practitioner (267 commits)
kind: practitioner build-walkthrough in repository form
mined_on: 2026-08-30
commit: fe9ef5548d6b1cc75374664aded27e1fe5c613af
words: 2639 (README as ingested) / 168969 in-tree markdown / 40828 lines Python
skill_version: 1.2.0 (bumped from 1.1.0 mid-run, by this run)
extracted: 22
picked: 5
accepted: 5
already_covered: 3
declined: 0
leads: 2
untriaged: 8
dispatched: 0
fetches_spent: 0
applied: 1
shipped: 0
---

# operator-control-plane, 2026-08-30 - the run that changed the method before it changed the corpus

This run's first triage table was built from 2,639 words of rendered GitHub
landing page. The operator asked one question - *did you go through the repo
or only the readme?* - and the answer was the readme. The tree holds
**168,969 words of markdown and 40,828 lines of Python**; the README is 1.5%
of its prose and rank 6 among its own markdown files.

So the run's first output is a method change, not a finding. `SKILL.md`
1.2.0 adds **Phase 2b**: a repository source is mined from a clone, swept in
the order operating documents -> instrument -> measurement -> types -> tests
-> README last, and swept a second time for engineering worth reusing rather
than claims worth quoting. Five class rows had each said the README is that
class's least reliable surface, in five different vocabularies, which is why
no run had generalised it.

**Audit of the tell.** A repository note whose `words:` is one small number
and whose body cites no file from the source's tree read the advertisement.
Fourteen repository sources mined in nine days, audited in about two minutes:
ten had cloned, one is class-exempt (a paper aggregator, whose tree is a link
list), and three had not - `autosaddler` (which says so in its own note),
`openwiki`, and this run. Two re-runs were dispatched under 1.2.0.

## Class read and expected yield, said before the triage

**Practitioner build-walkthrough in repository form.** Expected yield stated
up front: 1-3 real findings, all from the operating half - the "Known
limitations" section, the measured eval sweep, the honest refutation - with
the 23-subcommand command tour producing catches and proper nouns only. No
fetch, because a practitioner codebase corroborates corpus-internally.

That prediction held for the README half and badly understated the tree. The
three strongest findings in this repository are not mentioned in the README
at all, and the single densest artifact is a confound analysis that revises
the author's own published results three times.

**0 of 3 fetches spent.** Tenth consecutive run where the corpus was its own
second source.

## Accepted

### 1. `prose-rule-drift` - new technique, quality-gates

The subject is thorough from stage two onward: a gate can be decorative
(`severity-by-construction`), dead (`gate-liveness`), or unbound from the
decision it governs (`enforcement-binding`). Stage one - a rule written down
and never mechanised at all - is named in the golden path's opening sentence
and owned by nothing. That is the missing-stage shape.

The source supplies the diagnostic, and it is the absence of a symptom: the
forbidden action succeeds normally, so a violation is indistinguishable from
compliance at every surface anyone would check. Its own instance is a rule
that "existed in prose for months and was violated continuously" because the
prohibited command "simply worked and nothing checked". The technique carries
the risk region (prohibitions, on rare setup-shaped actions, whose violations
land where no gate reads), the remedy (refuse at the action, not at review),
and a three-answer audit.

**Amended after the apply step** with a third state the drafted version did
not have - see Applied below.

### 2. `measurement-revision` - new technique, eval-harness

From `evals/local_lane_ladder/PILOT_CONFOUND_FINDINGS.md`, a document that
revises its own published results across three passes and keeps every
error visible.

Pass 1 (n=1) reported a per-condition pattern. Pass 2 (n=1) disagreed and was
accepted as a *correction*; the ratios were revised on its authority. Pass 3
(n=5) returned pass 1's ratios exactly. The source's own sentence is the
technique: *"a caution against treating any single n=1 pass as a correction
of another."* A re-run at the same sample size is a second sample, and
chronology is not evidence.

Two companions land with it: report a concentrated effect as its
distribution rather than its mean (six of seventeen cells carried the entire
effect, ten carried none, and the average misleads in both directions at
once), and state the revision's direction - this one made the prior negatives
**more** defensible, not less, by shrinking an over-broad retraction.

### 3. `failure-attribution` - amendment, eval-harness (the eighth owner)

The seven-owner funnel is an enumeration, and enumerations invite exactly one
question. The source demonstrates a case it does not contain: **the harness's
own loop-termination policy**. Its agent loop ended on the first successful
state-changing command, so an agent that ran a read-only discovery step
before acting was cut off and scored as a failure.

Walk that case through the funnel and it defeats every tell - the raw output
and the recorded outcome agree, the tool contracts were fine, a person
reading the prompt would have done the same thing - so it falls through to
**model**, the residual bucket, which is the funnel's most expensive outcome
reached by following it correctly. The general form: the funnel's tells are
written from inside a completed run, so any owner that can end a run early is
invisible to all of them.

The amendment also carries the epistemics the source paid for: when a harness
artifact and the hypothesis under test predict the *same observation*, the
records stand and the causal reading is withdrawn. The source did exactly
that - "The 0/9 record stands; the causal reading does not."

### 4. `brief-carries-the-session` - amendment, fleet-orchestration

The asymmetry hunt found this one. The corpus models reviewer independence on
**one axis only**: `heterogeneous-model-panels` decorrelates the review seat
by model family and fixes the routing constraint at "producer's family !=
reviewer's family". Meanwhile `brief-carries-the-session` treats a fuller
brief as monotonically better, mentions bias exactly once, and that mention
is about whether to fork rather than about what the brief contains.

The source scoped its briefs by role for a stated reason: brief output
carrying builder-authored text meant "a reviewer would read the builder's
narrative before forming an independent verdict", which weakened the
cross-audit boundary. So there are two decorrelation channels - provenance
and content - closed by two different mechanisms, and the corpus had built
one. The amendment states the split, and the boundary is written on both
sides: a fourth rule in `heterogeneous-model-panels` points back.

The load-bearing sentence: **the identical content is a head start for a
continuation worker and a thumb on the scale for a reviewer**, so the split
is by the receiver's role, not by content type.

### 5. `task-envelope` - amendment, prompt-assembly (XL downgraded)

Proposed as an XL spec and **downgraded after reading the file**, which is
the outcome Phase 6 exists to produce. `task-envelope` is a mature 200-line
technique already owning Locate / Done / Check and "state the wanted
behaviour, not the forbidden one" - R1, R4 and R5 of the source's contract in
the corpus's own words. Writing a competing subject beside it would have
misfiled the work.

What survived as genuinely absent is the amendment: specificity is a **graded
dial**, its rungs do not pay evenly (locating is categorical - a task that
names no path has no floor, while every other refinement improves a run that
was already going to reach the right file), and the ladder is **non-monotonic
below a capability floor**. In a 216-cell grid the pass rate rose with
specificity for three models and *fell* for the smallest across two separate
tasks: added structure is itself instruction-following load, and below some
capacity it competes with the work rather than substituting for it. Plus
deterministic pre-dispatch linting, with the linter's own paid-for failure -
an unanchored ban-list matched a vague word inside an ordinary filename and
refused to start a correct run.

## Applied (Phase 7.5)

`prose-rule-drift` -> **ascent**, `experiment`, verdict **better**.

The audit was run rather than argued. Two rules from one repository's
standing document:

- A hard ceiling on component file length, unbacked - no lint rule, no gate,
  no script. Counting directly: **zero violations across 785 files.** The
  technique's prior was wrong here, and the reason is that the rule sits
  outside its own stated risk region on all three axes (an artifact not an
  action, inside the reviewed tree, governing the most frequent edit in the
  repo). **A confirmation of the boundary rather than the headline.**
- A rule governing shared-tooling attachment, whose standing document names
  the checker *and its exact invocation*. Grepping that filename across
  hooks, pipeline definitions and task-runner scripts: **no match anywhere.**
  Running it by hand: **27 violations across four repositories**, none
  reported anywhere.

Paired, same instrument, same tree, one invocation apart: arm A observes 0,
arm B observes 27.

**This produced the technique's third state**, which the drafted version did
not have: an instrument nobody invokes is still prose. Distinct from
`gate-liveness` (runs, checks nothing) and `enforcement-binding` (runs, sees,
verdict not joined) - here the checker is correct and has never run outside
the session that wrote it. The audit question had to be sharpened from "is
there a check?" to **"what invokes it, on what event?"** Writing the checker
is what retires the rule from everybody's attention.

The fix is **filed, not shipped** - touching a project tree needs the
operator's confirmation and the triage pick named no project.

## Already covered (catches)

- **Never sum unlike units in an aggregate.** The source keeps a subtree
  aggregate in distinctly-named fields so unlike units are never summed;
  `cost-metering` and `llm-call-telemetry-model` hold this, and the
  registry's own scan says it in the same breath.
- **A capability table naming the file that decides each answer.** Strong
  document, but `agent-cli-transport/dated-capability-matrix` owns the shape
  and `fleet-capabilities`-style scope docs are a `docs/` concern, not a
  bundle one.
- **Remote evidence is uncheckable, not tampered.**
  `portable-candidate-credentials/unverifiable-before-tampered-never-accuse`
  says it, and better.

## Leads (with return conditions)

1. **Execution identity and authorization identity are each other's blind
   spot.** Kernel-attested UID isolation proves *who ran this* and stops at
   the machine edge; a signature scheme proves *who authorized this* and
   travels - "a key holder can sign a claim about work it never did." A
   machine-scoped trust attribute also degrades silently when work moves,
   which is worse than refusing to move it because nothing looks wrong.
   Real, and larger than one technique. **Return when a second independent
   source reaches the same split**, or when a managed project needs
   cross-machine attribution.
2. **A record that stores disagreement but does not adjudicate it.** Reject
   and defer are first-class and do not delete the proposal, so both
   positions survive with reasons - and there is no tie-break, no escalation,
   and no way to mark a dispute *resolved* as opposed to merely rejected.
   The source names this as its own gap. **Return when a managed project runs
   two agents that must proceed past a disagreement.**

## Untriaged - 8 rows, anchors recorded, nobody verified them

Extracted, reached the table, never picked. No judgment attached.

- Replaceability and trustworthiness are inverse design goals - "a runtime in
  which an agent can replace the component that records what the agent did
  has made the recording layer answerable to the thing being recorded".
- Grade the weak mode, do not refuse it: same-identity verification still
  works and is recorded `advisory`, never silently upgraded.
- Reject before writing - "rejections occur before artifacts or ledger
  records are written".
- A handoff records dispatch outcome, not acceptance.
- Run the worked example in CI, including its failure cases - the example
  "is executed on every CI run, so it cannot quietly stop working", and two
  of its steps are things that *should* fail, shown failing.
- A profile asserting flags nobody confirmed is worse than its absence -
  every flag checked against the tool's own `--help`.
- Harness roles are not ranks; nothing infers supervisor from brand name.
- Sequential record ids foreclose merging, by construction, on purpose.

## Not swept

`owners-manual/` (9,307 words), `OPERATIONS_RUNBOOK.md`, the twelve
`docs/specs/`, `AGENTS.md`, the 5,657-line policy installer and the
5,265-line test suite. The four documents swept were chosen by the Phase 2b
order and were enough for five findings; the rest is a return condition, not
a claim of exhaustion.

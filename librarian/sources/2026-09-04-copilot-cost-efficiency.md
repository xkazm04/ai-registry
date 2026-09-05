---
source: web
kind: first-party practitioner account
url: https://github.blog/ai-and-ml/github-copilot/how-we-make-ai-coding-more-cost-efficient-without-sacrificing-task-quality
title: How we make AI coding more cost efficient without sacrificing task quality
author: two staff engineers at the vendor, named
words: 2225
extracted: 10
accepted: 1
declined: 0
leads: 1
already_covered: 3
untriaged: 5
dispatched: 0
applied: 1
shipped: 0
run_id: intake-ghcost
siblings: 1
---

# Copilot cost efficiency (2026-09-02)

Operator focus: **library skills and their design.** The operator picked one row
and the run landed one technique; everything else is recorded below unverified.

## Class and calibration

First-party practitioner account: two named engineers describing their own
harness, with four independent A/B experiments on one shared credit metric,
offline benchmarks plus online experiments, one shipped negative (a change that
helped one surface and raised cost in another, not shipped) and one rolled-back
regression. Unusually design-dense for a blog post — every change carries its
forces, its rejected alternative and a number — so the design read (Phase 2d)
was run despite the source not being a tree, with quote anchors in place of
`file:line`.

Expected yield stated before triage: 2-4 landings against a mature
neighbourhood, a high catch rate, 0 fetches. **Actual: 1 landing, 3 catches, 1
lead, 5 untriaged, 0 of 3 fetches spent** — a first-party account corroborates
corpus-internally, and the strongest corroboration for the pick was two files
inside the target subject.

## Routing count (Phase 2d)

One system (a coding-agent harness), six design decisions, **2 with no home**
(`corpus: NONE`) and they do not share a home-if-new. Neither clause of the XL
trigger fires. **No forge handoff is possible in any case: the source is a
2,225-word article, not a tree** — the count is recorded so a later pass over
the same vendor's engineering writing does not re-derive it.

| # | Decision | Corpus |
| --- | --- | --- |
| D1 | Evaluate efficiency end-to-end, never per tool call | `eval-harness/metric-role-contract` — partial; folds into D2 |
| D2 | Class-based lossy compression whose recovery path is also its loss signal | **NONE** at the ingest stage; `prompt-assembly/elision-to-a-refetch-pointer` is the history-stage neighbour and does not measure |
| D3 | Audit payload decorations against their current consumer | boundary case of `substrate-coupled-expiry` |
| D4 | A bulk instruction rewrite is gated by behavioural tests | **NONE** — landed |
| D5 | Batch clustered completions; deliver the result with the signal | boundary case of `bounded-projection-of-external-work` |
| D6 | Evidence is local to the workload | covered |

## Landed

**`rewrite-behavior-pinning`** (technique, `agent-instruction-files`) — the
subject's three maintenance instruments (`line-earning`, `substrate-coupled-expiry`,
`instruction-freshness`) are all per line and all read a diff. The subject had
already drawn this enumeration itself: `sibling-floor-ownership` states the
funnel "is never run per install, because an install produces no diff for anyone
to read." That is the case where the diff is *absent*. The article supplies the
mirror: a diff that is *total*. A bulk machine-authored rewrite leaves no line
to withhold, no per-line origin story, and a review that degrades to a judgement
about prose while the property at risk is behaviour (`gate-sees-target`).

Row 4 of the triage table was folded in rather than banked, because it is this
technique's causal half: **compression deletes hedges before facts.** Hedge
tokens carry almost nothing about *what* to do and almost everything about *how
strongly*, so a compressor reads them as filler and the residue of an advisory
is a bare imperative. The measured instance is the source's own rollback —
cautious parallelism guidance compressed into a hard scheduling rule,
independent sub-agents ran strictly sequentially, and nothing errored
(`silent-state-is-ungoverned`). The corrective inverts the instinct: the fix was
**shorter than the compressed version and less restrictive than either**, an
allowlist plus denylist collapsed into one sentence handing the choice back to
the model. Length and strictness are independent axes.

`capability-coverage-contract` stays green through the whole failure, which is
the sharpest evidence the gap is real: the capability was still named; only the
guidance about when to reach for it changed.

## Applied — `experiment`, `not-better`, and the run's most useful row

Swept the complete revision history of **12 always-loaded instruction assets in
7 repositories** (6 method files in the registry's own skill lane, plus one
repo-owned instruction file per fleet project): 152 revisions, 35 bulk rewrites
replacing at least a quarter of the file.

Arm A is the review that actually happened — all 35 shipped. Arm B is a
modality-delta detector, asserted first against three known positives (one per
inversion shape) and four known negatives. **Mid-state: 10 flagged. Confirmed: 0.**
Every candidate was a pairing artifact of a prose-to-table restructure or a
re-wrapped line; the highest-scoring one matched a sentence against its own
continuation, and the phrase it claimed was deleted is in the file today.

`not-better`, and the technique gains the amendment the verdict owes — because
the lexical pin is what everybody builds first, and the technique's own rule
predicted its failure: a check that greps the text has re-implemented the
per-line funnel it exists to escape. The bias runs the wrong way too: **the
strongest inversions rewrite the most words**, so every similarity threshold
that made the detector quiet also made it blind.

**Two structural facts nobody designed.** Of the 35 bulk rewrites, **24 grew the
file** and every shrinking one is a restructure, a re-wrap or a whole-file
deletion later restored — *not one* was undertaken to reduce per-turn cost. The
technique's trigger has never fired in this fleet; the population was missing,
not the instrument. And the largest asset in the sweep is a 114 KB method file
at 30 revisions that has never once been reduced, which makes the fleet a live
instance of the accretion `line-earning` publishes a rule against. Second: the
registry's own skill gate (307 lines) asserts shape only — presence, frontmatter,
ASCII, kebab-case, a routing cap — and nothing about behaviour, so the run that
landed the technique found its own tree unpinned.

## Direction pass (Phase 7.6) — ran, zero fired, trigger diagnosed

Round 15's declared focus required this lane be resolved in writing rather than
skipped a sixth time. It was run. `librarian/fleet-map.json` reports
`absent: []` for `agent-instruction-files`: **all eleven fleet projects already
carry a context governed by this subject**, so the set of `candidate` absences
the phase is defined over is empty — not by judgement, mechanically.

The diagnosis generalises and is the useful half. The pass's eligibility test is
**presence**, and this subject governs a file every repository has. A subject
with universal presence has no absences ever, and the subjects intake lands in
most often (`llm-agent/*`) are precisely the universal ones. The lane is not
being skipped by bad luck; **it is inert by construction for this skill's modal
landing.** Proposed fix, stated for the operator and not applied: make
eligibility *coverage-depth* based rather than presence-based — a project whose
context predates N of a subject's techniques is a candidate even though it is
present. Also noted: every one of the 76 contexts the map lists for this subject
is in state `unknown`, so the map records presence and no adoption state at all.

## Caught — the corpus winning

- **A completion notification carrying its result** is already owned:
  `bounded-projection-of-external-work` delivers "a task you submitted has
  completed; here is its result." Only the *batching* of clustered completions is
  uncovered (untriaged below).
- **Evidence is local to the workload** — `count-carries-predicate` plus the
  re-measurement discipline several bundles already carry.
- **The recovery path exists** — `elision-to-a-refetch-pointer` builds exactly
  that fallback, at the history stage. What it does not do is *measure* it.

## Untriaged — extracted, reached the table, never picked

Recorded with anchors so a later run does not re-derive them. **Nobody verified
these**; they are not declines.

1. **Class elision by producer, not by size.** Source-like and arbitrary output
   returned unchanged, search results reorganized losslessly, only predictable
   repetitive noise compressed. Inverts `elision-to-a-refetch-pointer`'s "the
   threshold is policy, not judgment" — a size threshold compresses exactly the
   outputs most likely to be re-read. Anchor: "we initially compressed `git diff`
   but removed that filter after benchmark tasks showed agents reopening the
   original output."
2. **The recovery path is the loss signal.** Instrument how often the consumer
   opens the saved original, reruns the command, repeats exploration, narrows
   searches or takes extra turns; frequent recovery means the transform removed
   something valuable. Anchor: "That recovery path is both a safety mechanism and
   an evaluation signal." Home would be `prompt-assembly`.
3. **The measurement boundary must contain the recovery loop** (the local metric
   trap). Folds into 2. Anchor: "We saved tokens locally and spent more globally."
4. **A third expiry axis: the peer tool changed.** A per-item payload decoration
   minted for a consumer that has since changed its method — line-number prefixes
   kept after edit tools moved to matching surrounding code. Neither the repo nor
   the model changed. Boundary case of `substrate-coupled-expiry`. Measured ~5%
   offline inference cost, ~3% online daily cost per user.
5. **Batch clustered completions into one delivery run.** Boundary case of
   `bounded-projection-of-external-work`, whose delivery is per task and keyed per
   task identity; a batched delivery needs a key over the *set*. Measured ~2.3%
   of credit usage. Contended at triage — sibling `intake-exo` held
   `agent-runtime-assembly`.

## Lead

**The fallback rate is a two-sided diagnostic.** Second sighting. This source
uses recovery frequency to detect a lossy transform that removed too much;
`game-production/production-prompt-architecture/domain-scoped-knowledge-injection`
§ "Measure the fallback rate" uses it to detect that routing never happened and
the safe superset is masking a gap. Shared root: *a fallback that is correct is
also silent, and its usage rate is the only observable of the defect it masks.*
Law candidate at two sightings, in two bundles, from two runs. **Return** on a
third independent sighting, or on a run that finds the two polarities in one
system.

## Board

1 sibling live at claim (`intake-exo`, an agent-harness repository), holding
`agent-runtime-assembly` and `companion-identity`. That contention is why
untriaged row 5 was not landed. The gate went red mid-run on
`execution-state-checkpointing`, an untracked subject belonging to that sibling —
named, not fixed, and `index.json`/`catalog.json` were deliberately left
uncommitted rather than bake a neighbour's WIP into a hash under this run's name.

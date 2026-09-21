---
domain: game-production
subject: production-work-prioritization
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# production-work-prioritization

## Architecture review - 2026-09-10

Read and assessed all 14 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/production-work-prioritization",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:247ac0522f5693f1",
  "disposition": "reverify",
  "coverage": "All 14 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "An acceptance dependency need not force all authoring to wait; staged checks and test doubles can make upstream work judgeable. Granularity and sparsity bands are policies, not proofs that an edge is invalid.",
    "A ceiling is not a target and should not be hidden from the producer. Eleven can satisfy up to twelve without being deficient. Allocate a total by normalized weights, not ambiguous division by a role weight; under-budget work can be efficient and complete.",
    "Max is not invariant to candidate partition and can undercount disjoint outputs. Dependencies still blocked by other work are not necessarily unblocked; completed outputs must not lend their maximum to one unfinished output. Union of actual newly eligible dependents answers a different, stronger question."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/production-governance/production-work-prioritization/production-work-prioritization.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    }
  ],
  "documents": {
    "production-work-prioritization.md": {
      "disposition": "reverify",
      "reason": "Reverify unsupported universal ladder ordering, absent evidence as zero value, graph constraints that prohibit useful parallel work and max fan-out invariance. The mixed-known/unknown readiness rule is repaired; other ranking policy remains uncalibrated."
    },
    "techniques/blocked-if-any-produced-feature-is-blocked.md": {
      "disposition": "clarify",
      "reason": "Repaired required-output conjunction, mixed unknown handling, explicit eligibility policy and partial work scope. Empty bindings do not establish zero real-world value; waiting is hard or soft according to the actual prerequisite."
    },
    "techniques/curriculum-prerequisite-graph.md": {
      "disposition": "reverify",
      "reason": "An acceptance dependency need not force all authoring to wait; staged checks and test doubles can make upstream work judgeable. Granularity and sparsity bands are policies, not proofs that an edge is invalid."
    },
    "techniques/declared-scope-as-a-shaping-budget.md": {
      "disposition": "reverify",
      "reason": "A ceiling is not a target and should not be hidden from the producer. Eleven can satisfy up to twelve without being deficient. Allocate a total by normalized weights, not ambiguous division by a role weight; under-budget work can be efficient and complete."
    },
    "techniques/fan-out-max-not-sum.md": {
      "disposition": "reverify",
      "reason": "Max is not invariant to candidate partition and can undercount disjoint outputs. Dependencies still blocked by other work are not necessarily unblocked; completed outputs must not lend their maximum to one unfinished output. Union of actual newly eligible dependents answers a different, stronger question."
    },
    "techniques/five-factor-weighted-scoring.md": {
      "disposition": "reverify",
      "reason": "Zero contribution for missing evidence is a ranking policy that penalizes unknowns, not an empirical zero. State missingness and correlated factors; override logs are useful but not the only trustworthy calibration evidence."
    },
    "techniques/fixed-deadline-scope-triage.md": {
      "disposition": "reverify",
      "reason": "Scope is not the only variable under a fixed date: resources and delivery design may change. Cutting optional work cannot repair a must-only overload; protect required non-path obligations and allow evidence-driven re-planning, not only checkpoint ritual."
    },
    "techniques/null-success-odds-with-sample-provenance.md": {
      "disposition": "reverify",
      "reason": "Rate times capped count is a selection heuristic, not calibrated confidence or freshness. A very low twenty-run rate can lose to a perfect one-run rate. Label priors and null policy; do not present a missing weighted component as an observed rate."
    },
    "techniques/urgency-ladder-for-what-next.md": {
      "disposition": "reverify",
      "reason": "Determinism does not establish correct urgency. A trivial failure need not outrank new critical work; missing comparison data is unmeasured rather than evidence of no disagreement. Ranking never-produced last is separate from its progress display."
    },
    "techniques/vertical-slice-as-the-first-milestone.md": {
      "disposition": "reverify",
      "reason": "Slice completion needs the declared end-to-end observation, but components can be built in parallel. Authored static input is not inherently a stub. Cuts must preserve the agreed milestone, and previous integration does not eliminate new project risk."
    },
    "applications/node--five-factor-weighted-scoring.md": {
      "disposition": "reverify",
      "reason": "The historical score shares fan-out between urgency and impact, requiring explicit policy. Zeroing readiness alone is not an eligibility filter; confirm blocked exclusion and mixed unknowns. A heuristic binding label does not establish its accuracy. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--null-success-odds-with-sample-provenance.md": {
      "disposition": "reverify",
      "reason": "The displayed capped-rate product does not guarantee a one-run perfect pattern loses to every twenty-run pattern or account for sample age. The 0.7/0.3 blend needs explicit normalization with a missing component; nullable types do not enforce rendering truth. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--vertical-slice-as-the-first-milestone.md": {
      "disposition": "reverify",
      "reason": "The displayed 30%-of-all-items slice metric does not establish a playable path. However, per-item ranking is not inherently unable to prioritize path work; its inputs and policy decide that. Source search alone cannot establish every consumer absent. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--urgency-ladder-for-what-next.md": {
      "disposition": "reverify",
      "reason": "The shared ladder reduces duplication but does not prevent bypasses. The glossary calls pending not started while the technique calls it produced/in flight. Missing drift input must remain visible as unmeasured, and never-produced ordering does not determine progress. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```

## Architecture re-review after the compression revert - 2026-09-10

Read all fourteen documents at their reverted bytes, then checked the four `node`/`process`
applications against the live Proof of Fun checkout at `C:/Users/kazda/kiro/pof` (HEAD
`d823bffe`) rather than against the commit they were forged from. Reading source, not
executing it: no PoF build, no test run, no engine session.

**Retraction.** The earlier 2026-09-10 entry on this note graded eleven of fourteen
documents `reverify` on semantic objections. Most of those objections do not survive
re-reading. Its complaint against `blocked-if-any-produced-feature-is-blocked` is answered
in the document's own "When not to use this" (soft blockers get their own rung; coarse
candidates get split). Its complaint that `declared-scope-as-a-shaping-budget` hides a
ceiling from the producer is contradicted by step 4, which keeps the hard ceiling as a
separate labelled number. Its complaint that a very low twenty-run rate can lose to a
perfect one-run rate under `null-success-odds` is arithmetically true and is not a defect:
a 5% rate over twenty runs *is* worse evidence of success than one clean run, and the
technique's stated purpose for the cap is to stop a large stale sample outranking a small
current one, which it does. I retract those inferences. What does survive from that entry
is the objection to the scope derivation wording, restated below.

Three findings I can defend. `fan-out-max-not-sum` claims the maximum is "invariant to how
the outputs were bundled - the same underlying work scores the same however it is
partitioned into candidates". That is too strong. Max is invariant in the weaker and
still-valuable sense that bundling cannot *inflate* a candidate (unlike the sum), but
partition does change scores: split a candidate whose outputs have 5 and 3 dependents and
the second piece now scores 3 where the bundle scored 5. The document's own "When neither
max nor sum is right" section concedes the disjoint case, so the invariance sentence
contradicts a section three paragraphs later.

`declared-scope-as-a-shaping-budget` states the derivation as "a division of that amount by
the weight of the part's role". Read literally that is amount divided by weight, which grows
as the weight shrinks - the opposite of the intent. The correct statement is a normalised
share: the whole's amount times the role weight over the sum of role weights. Everything
else in the technique is right and this one clause will be implemented wrong by someone.

`fixed-deadline-scope-triage` opens with "scope is the only variable" and its own "When not
to use this" concedes "there the movable variable is the date or the resourcing". Both
cannot be flat. The honest claim is that scope is the only variable *the planner controls*;
date and resourcing are escalations, which is what the technique's own escalate rule does.

On the applications: PoF has moved under three of them, in the direction this subject
recommends. `predictMilestones` in `src/lib/health-engine.ts` no longer computes the slice
as `completionPct / 30` - it now returns `currentProgress: null` with a note that cites this
subject by name and says nothing in the repo declares a slice path. `computeNBA` now carries
a bounded deadline term (`src/lib/nba-deadline.ts`), so the application's central claim that
grepping `nba-engine.ts` for `deadline` returns nothing is false at HEAD. The application is
pinned to commit `9aa31407` and is honest about that, but its "What the correction looks
like against this tree" section describes work that landed; a reader will take it as current.

The other two `node` applications are not commit-pinned and their line citations have
drifted by roughly 18 to 45 lines. I re-verified their substantive claims at HEAD and all of
them hold: `W` is still `30/25/20/15/10`; urgency is still `Math.min(dependentCount * 6,
W.urgency)`; readiness is still zeroed as a reduction; `moduleSuccessRate` is still
`number | null`; the capped-confidence comparison still uses `Math.min(sessionCount, 10)`
and the blend is still 0.7/0.3. Only the coordinates are stale.

`process--urgency-ladder-for-what-next` reports the coach ladder and `labGlossary.ts` as
"single-sourced against each other". They are not, and the document quotes the evidence
without noticing it: the ladder's `pending` rung means produced-and-resolving while the
glossary's `pending` means "not started", which is the ladder's separate `unproduced` rung.
I confirmed both at HEAD - `COACH_LADDER` is `['fail','drift','pending','deferred',
'unproduced']` and `STATUS_GLOSSARY.pending` is `{ short: 'not started' }`. They are two
different type domains (`AcceptanceStatus` vs `CoachPriority`) that share a word, which is
the opposite of single-sourced.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/production-work-prioritization",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:7fe8a0d9a34ea372",
  "disposition": "clarify",
  "coverage": "All 14 documents read in full at reverted bytes. The four applications were re-checked by reading the live PoF checkout (HEAD d823bffe) for drift against their pinned or implied citations. Not evaluated: any PoF build, test or engine run; the weight table's calibration against real override logs; whether the urgency ladder's rung order is right for any pipeline other than PoF's.",
  "counterexamples": [
    "Fan-out max is not partition-invariant as claimed: splitting a candidate whose outputs have 5 and 3 dependents leaves the second piece scoring 3 where the bundle scored 5. The defensible claim is that bundling cannot inflate a score, which is weaker and is what the sum fails.",
    "A part's scope read literally as the whole's amount divided by the role weight grows as the weight shrinks. A 0.2-weight part would be allotted five times the whole.",
    "Under a fixed date, resourcing and delivery design are also variables - the technique's own exclusions say so - so 'scope is the only variable' holds only for what the planner itself controls.",
    "The subject offers no guidance for a candidate that is on the declared slice and blocked. Slice membership is a filter above the ranking and blocked-ness excludes before ranking, so the two filters can empty the candidate list with no stated escalation."
  ],
  "sources": [
    {"path": "C:/Users/kazda/kiro/pof/src/lib/health-engine.ts", "result": "Establishes that the slice milestone now reports currentProgress: null with a note citing this subject, so the application's headline defect is fixed upstream. Does not establish that any slice path is declared - the note says none is."},
    {"path": "C:/Users/kazda/kiro/pof/src/lib/nba-engine.ts", "result": "Confirms the weight table, the per-factor clamps, the readiness reduction, the nullable success rate, the capped-confidence pattern selection and the 0.7/0.3 blend all still hold. Also shows a new bounded deadline term that the vertical-slice application asserts does not exist. Read only; not executed."},
    {"path": "C:/Users/kazda/kiro/pof/src/components/layout-lab/labGlossary.ts", "result": "Confirms STATUS_GLOSSARY.pending is 'not started', contradicting the ladder's pending rung. Does not establish which vocabulary is correct for PoF - only that two exist."}
  ],
  "documents": {
    "production-work-prioritization.md": {"disposition": "keep", "reason": "The two-stage split, the curriculum-versus-build-order distinction, the binding-caps-everything rule and the ladder-before-score ordering are all internally consistent and independently argued. The earlier entry's objections to ladder ordering and to zero-for-absent-evidence are policy disagreements, not defects; both are stated as declared policies in the text."},
    "techniques/blocked-if-any-produced-feature-is-blocked.md": {"disposition": "keep", "reason": "Conjunctive readiness, the three-state vocabulary and the empty-binding fourth case are coherent, and the soft-blocker and coarse-candidate cases the prior entry raised are already handled in 'When not to use this'. Retracts the prior clarify."},
    "techniques/curriculum-prerequisite-graph.md": {"disposition": "keep", "reason": "The three-question edge test is falsifiable and the granularity and density bands are explicitly labelled as workable ranges rather than proofs. The prior entry's staged-checks objection is a reason to justify an edge differently, not evidence any edge test is wrong."},
    "techniques/declared-scope-as-a-shaping-budget.md": {"disposition": "clarify", "reason": "The derivation clause reads as amount divided by the role weight, which inverts the intent - a small-weight part would receive more than the whole. Restate as a normalised share of the whole. The rest of the technique, including the separately labelled hard ceiling that the prior entry said was hidden, is correct."},
    "techniques/fan-out-max-not-sum.md": {"disposition": "clarify", "reason": "The claim that the maximum is invariant to how outputs were bundled is too strong and is contradicted by the document's own disjoint-downstream section. Narrow it to the true claim: bundling cannot inflate a max, which is exactly what the sum fails at."},
    "techniques/five-factor-weighted-scoring.md": {"disposition": "keep", "reason": "The shares sum to 100, the saturation worked example is arithmetically right (six points per dependent against a thirty-point ceiling saturates at five), and the urgency/impact correlation is disclosed as a deliberate double-weighting rather than hidden. The override-log calibration is presented as the best available evidence, not the only possible one."},
    "techniques/fixed-deadline-scope-triage.md": {"disposition": "clarify", "reason": "The opening 'scope is the only variable' contradicts the document's own exclusion naming date and resourcing as the movable variables in an all-or-nothing deliverable. Qualify it to the variable the planner controls. The tiering distribution and the path-walkability cut rule are sound."},
    "techniques/null-success-odds-with-sample-provenance.md": {"disposition": "keep", "reason": "Null-on-no-sample, the reachability assertion and the provenance sentence are all defensible and the capped-confidence rule does what it claims. Retracts the prior entry's objection: a low rate over twenty runs losing to a perfect one-run rate is the selection heuristic working, and the technique already requires the sample size to travel with the number."},
    "techniques/urgency-ladder-for-what-next.md": {"disposition": "keep", "reason": "Every rung carries a written justification, the disagreement rung's absence is named as the dangerous omission, and the ladder-versus-score boundary is stated with the reason. Determinism is claimed for reproducibility, not for correctness, which the prior entry misread."},
    "techniques/vertical-slice-as-the-first-milestone.md": {"disposition": "keep", "reason": "The two conditions for a slice, the furthest-contiguous-real-step reporting rule and the argument about why automation drifts horizontal are all specific and checkable. Nothing in it forbids parallel component work; it forbids counting a stubbed step as complete."},
    "applications/node--five-factor-weighted-scoring.md": {"disposition": "clarify", "reason": "Every substantive claim re-verified at PoF HEAD and holds, but the document is not commit-pinned and its line citations have drifted by roughly twenty lines. Pin it to a commit or refresh the coordinates; the deviations it records (undated weights, unstated fan-out double-weighting, uncapped heuristic bindings) are still true."},
    "applications/node--null-success-odds-with-sample-provenance.md": {"disposition": "clarify", "reason": "The nullable type, the three-tier evidence union, the capped-confidence comparison and the 0.7/0.3 blend all still hold at PoF HEAD, as does the recorded deviation on sample dating. Same defect as its sibling: unpinned document, drifted line numbers."},
    "applications/node--vertical-slice-as-the-first-milestone.md": {"disposition": "reverify", "reason": "Both defects it documents have been fixed upstream since commit 9aa31407. The slice milestone now reports null with a note citing this subject, and the ranking engine now carries a bounded deadline term, so the claim that grepping for deadline returns nothing is false at HEAD. The document is honestly pinned but reads as a description of the present; re-anchor it."},
    "applications/process--urgency-ladder-for-what-next.md": {"disposition": "clarify", "reason": "It reports the coach ladder and the plain-language glossary as single-sourced against each other while quoting the evidence that they are not: the ladder's pending rung means produced-and-resolving, the glossary's pending means not started, which is the ladder's separate unproduced rung. Confirmed at HEAD. The stated deviation about no build-time check on surfaces is accurate and stands."}
  }
}
```

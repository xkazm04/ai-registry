---
subject: quality-regression-gating
domain: llm-observability
last_touched: 2026-09-10
touched_by: external-reconcile
dry_streak: 0
---

# quality-regression-gating

First touch: [[2026-08-23-6]], external reconcile against
`promptfoo/promptfoo` @ `679e7ec` (0.122.0). Gained
`node--unverified-vs-regressed-exit-states` (uncovered); single-stack debt
cleared. Hint confirmed. Executed evidence: five exit-code cases through the
real decision function via the tree's own vitest harness.

## The sharpest sightings

- The tree COMPUTES the unverified discriminator (findTargetErrorStatus) and
  spends it on the console banner while the exit code ignores it - rule 3
  violated with the fix already in a local variable.
- The green hole: zero verified cases -> passRate NaN -> NaN < 100 false ->
  exit 0. Upstream-reportable; reachable via --filter-failing
  warn-and-proceed.
- Both gate constants are env-remappable per invocation - fixed-alpha
  discipline applied to the verdict vocabulary itself; the vendor's own agent
  skill zeroes the exit code and rebuilds the gate outside the tool.

## Technique-edit candidates (single-sighted, banked)

- "Gating is opt-in per invocation" should admit a second split: a flag OR a
  distinct entry point, visible in the invocation (cli-vs-sdk sighted).
- New rule: when the verdict is COMPUTED rather than looked up, enumerate the
  degenerate inputs (no cases, zero denominator) as unverified explicitly - a
  NaN comparison silently takes the pass branch. Possible second sighting
  beside the rust partial-run application; director's call whether it counts.
- fixed-alpha-discipline: extend the discipline to the verdict vocabulary
  (remappable exit codes mean no contract at all).
- partial-run-never-green: promptfoo hard-fails truncation as regressed and
  its own tooling neutralized the exit code - the field witness that
  technique's decision rule predicts.

## Open leads

- Two contradicting official CI recipes ship in-repo (a jq line omitting
  errors from the denominator vs the newer skill reading s.errors).
- Docs advertise a nonexistent --fail-on-error flag; small upstream doc fix.
- --resume incomplete-run semantics untraced.

## 2026-09-01 — intake, adaptive-harness-review

Added `baseline-carries-its-conditions`, amended `paired-per-case-testing`'s
comparability predicate to include the judge model and version, and extended the golden
path's "Honesty about what the test cannot see" enumeration with the baseline's
currency.

The gap was found by the asymmetry hunt, not by the source. The subject was already
mature on sampling noise and silent on comparator decay: four comparability conditions
that all describe the experiment and none the instrument; three stated baseline
limitations that are all standard-error limitations; and a routing rule that waives the
predicate on the floor test — the test whose comparator is oldest — and reaches it
precisely when comparability has already failed.

Boundary held rather than linked: `judge-calibration-and-drift` owns the judge's own
drift and its recalibration schedule; this subject owns whether a stored number produced
by that judge may still be compared against. Recruiting's
`an-organisation-owned-manual-baseline` reaches "the baseline value and its provenance
travel with it" from the opposite side — a *declared* counterfactual baseline that never
decays because no instrument produced it. That inversion is the technique's "when not to
use it" and is stated in prose on this side only; no cross-bundle link.

Applied to tracklight, `experiment`/`better`, on the collective-ingest canonicalization
table. The apply step added the technique's normalization-surface discriminator.

## Open leads

- The gate's own arm is unmeasured anywhere in the fleet: no connected tree can produce
  two runs spanning a judge change, because the one implementation makes a benchmark row
  immutable. Return when a project grows a re-baseline or benchmark-update path.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/quality-regression-gating",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:1f4812e2649a117a",
  "disposition": "reverify",
  "coverage": "All 12 owned documents read and assessed in table order. 4 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Two paired observations with identical nonzero differences do not justify a distribution-free p-value of zero.",
    "A noisy third-ranked model may not be distinguishable from the leader even when the less noisy runner-up is.",
    "A new failed status reaches wildcard exit zero in the displayed Rust gate."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/quality-scoring/quality-regression-gating",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.itl.nist.gov/div898/handbook/prc/section3/prc311.htm",
      "scope": "Primary paired-difference t statistic and degrees of freedom."
    },
    {
      "url": "https://www.itl.nist.gov/div898/handbook/prc/section4/prc473.htm",
      "scope": "Primary Bonferroni inequality and finite-family simultaneous confidence control; no method uniformly best."
    }
  ],
  "documents": {
    "quality-regression-gating.md": {
      "disposition": "reverify",
      "reason": "Pairing does not eliminate all case heterogeneity or guarantee several-fold power. OR composition adds false-positive opportunities requiring joint control; retiring an invalid detector is legitimate. No detected regression is not demonstrated noninferiority. Scalar fallback cannot inherit statistical assurance, and superiority over the runner-up does not establish global best."
    },
    "techniques/baseline-carries-its-conditions.md": {
      "disposition": "reverify",
      "reason": "Provenance and separate measured/display identities are useful. Previous does not imply recent; same named judge can drift. A harder/easier dataset does not universally move a floor in the stated direction. Historical comparisons can remain valid under a disclosed controlled question, and declared targets still depend on measurement semantics. Full instrument identity includes rubric, settings and packet construction."
    },
    "techniques/family-wise-correction.md": {
      "disposition": "clarify",
      "reason": "Repaired independence assumption in 26 percent illustration, incomplete OR-test family, absolute ban on longitudinal correction and conflation of Holm with FDR. Bonferroni also changes thresholds when targets are added."
    },
    "techniques/fixed-alpha-discipline.md": {
      "disposition": "reverify",
      "reason": "Precommitment is sound but versioned reviewed configuration can enforce it as well as code. A constant can be patched and does not make manipulation impossible. Alpha is not the probability a finding is real; more cases improve power rather than generally reducing type-I rate. Minimum effect and sample-size adaptation must also be prespecified to avoid outcome shopping."
    },
    "techniques/paired-per-case-testing.md": {
      "disposition": "clarify",
      "reason": "Repaired variance cancellation, automatic p zero, test assumptions and unconditional scalar fallback. Require case content/protocol comparability and explicit estimand; distinguish noninferiority from failure to reject."
    },
    "techniques/partial-run-never-green.md": {
      "disposition": "reverify",
      "reason": "Incomplete planned coverage cannot imply full assurance, but partial data can reveal a deterministic blocker or support a prespecified sequential decision. Estimated priced cost is not necessarily a lower bound and case-boundary checks can overshoot without reservations. Judge failures need severity and missingness policy, not volume alone."
    },
    "techniques/tested-superiority-claims.md": {
      "disposition": "clarify",
      "reason": "Repaired nonsignificance as interchangeability, runner-up as proof of global best and nontransitive significance clusters. Report only supported contrast and uncertainty."
    },
    "techniques/unverified-vs-regressed-exit-states.md": {
      "disposition": "clarify",
      "reason": "Repaired unknown statuses default green even within one codebase. Separate completed, policy-passed, unverified and infrastructure failures; a gate-specific entry point can declare gating without a flag."
    },
    "applications/node--unverified-vs-regressed-exit-states.md": {
      "disposition": "reverify",
      "reason": "Historical promptfoo exit harness retained, not rerun. Zero denominators yield NaN and can skip failure; errors omitted from the guide denominator inflate success. Exit 100 indicates threshold failure, not necessarily a statistical regression claim. Keyword absence does not prove all statistical logic absent. CLI versus SDK is a valid explicit contract split."
    },
    "applications/rust--baseline-carries-its-conditions.md": {
      "disposition": "reverify",
      "reason": "Historical Rust arms retained, not rerun. Frozen flag is only a proxy and immutable named judge can still change remotely. Table explicitly changes regressed to no_baseline, contradicting adds detection and disarms nothing. Family aggregation is task-dependent and should not conceal actual variant quality. Creation-time fields do not prove baseline measurement provenance."
    },
    "applications/rust--paired-per-case-testing.md": {
      "disposition": "reverify",
      "reason": "Historical Rust statistics retained, not rerun. Equal lengths do not establish case identity; normal z approximations can be poor for small n, and zero spread cannot manufacture calibrated p zero. OR tests need joint multiplicity control; a caveat does not fix omitted baseline uncertainty."
    },
    "applications/rust--partial-run-never-green.md": {
      "disposition": "reverify",
      "reason": "Historical Rust gate retained, not rerun. Wildcard status maps unknown and potentially failed states to exit zero; same codebase is no protection from schema drift. Preflight estimate is not a certified lower bound, unpriced cost is unknown rather than zero, and case-boundary checks do not guarantee a hard spend cap."
    }
  }
}
```

## 2026-09-10 — architecture re-review after the compression revert

All twelve documents read in full at restored bytes: golden path, seven
techniques, four applications. Nothing under `knowledge/` was edited.

The subject is in good shape. Its spine — pair, correct, fix alpha, test the
superiority sentence, give the pipeline three states, never let a fraction speak
for the whole — is stated in a fixed order with a reason per step, and the
composition doctrine ("adding statistical rigor is allowed to trade a false alarm
for a real detection; it is never allowed to disarm the gate") is the load-bearing
claim and is correctly identified as the thing to check any refactor against.
`baseline-carries-its-conditions` is the deepest document here: the observation
that the *least*-governed comparator is reached by exactly the condition that
proves comparability has already failed is a real inversion, and the
one-normalization-function section (aggregate on the canonical identity, compare
on the measured one, keep both fields) is a genuine second-order finding that its
own application says was learned from the arms rather than assumed.

**Where a naive reading over-reaches, checked.** `techniques/family-wise-correction.md`
opens with `1 − 0.95⁶ ≈ 26%`. The arithmetic is right (0.95⁶ = 0.7351). The
inference is not unconditional: six targets tested against one shared baseline
over one shared case set produce positively correlated test statistics, so 26% is
an **upper bound under independence**, not the rate. The document is careful about
independence where it matters most — it says correctly that the division-based
correction "controls the family-wise error rate with no independence assumptions"
— which makes the motivating figure the one place the assumption slips in silently.
A clause naming it as a bound costs one sentence.

The same shape sits under the paired-testing power claim. "Typically several times
more power at the same sample size" is a function of the within-case correlation
between the two runs, and where cases are uncorrelated across runs the paired test
can be no better (it spends a degree of freedom). The technique hedges with
"typically"; the golden path repeats it flatter. Naming the correlation as the
condition would make the claim checkable on a reader's own corpus rather than
taken on authority.

**The one place absence maps to green.** `techniques/unverified-vs-regressed-exit-states.md`
decides that an unrecognized status maps to non-blocking, "acceptable only because
statuses come from the same codebase", and `applications/rust--partial-run-never-green.md`
confirms the wildcard `_ => 0` with a pinning unit test. That is the subject's own
forbidden substitution — absence rendered as pass — sanctioned by a trust argument
about a code boundary rather than by the doctrine everything else here rests on.
The cost of the safer default is close to zero, because the unverified code is
already non-blocking unless a channel chooses otherwise; the benefit is that a
misspelled or newer status cannot silently unguard the gate. I do not think the
document is wrong to raise the trade-off; I think it resolves it in the direction
its own composition doctrine forbids, and the resolution should be stated as the
deliberate exception it is.

**One vocabulary collision across applications.**
`applications/rust--partial-run-never-green.md` describes the pre-flight as showing
unpriced models' "share shown as `$0`", while the sibling subject's
`rust--budget-preflight-and-ceiling.md` and this subject's
`cheapest-sufficient-configuration` both insist an unresolved cost is null and
never zero. The rendering is defensible in context (a `$0` contribution beside a
`≥$` total is disclosed, not laundered), but two documents describing one code
path in opposite vocabulary is how the distinction erodes.

**Line anchors.** `applications/rust--partial-run-never-green.md` cites
`BENCHMARK_FRAMEWORK.md:462-480` for the section that the sibling subject's
`rust--budget-preflight-and-ceiling.md` cites at `:427-445`, both `verified_on:
2026-08-30` against the same tree. At most one is right; this checkout cannot say
which.

I re-read the promptfoo application closely because the previous entry's objections
to it were the sharpest in that record, and I retract none of its findings: the
NaN green hole (`totalTests === 0` → `passRate` NaN → `NaN < 100` false → exit code
never set) is real arithmetic, and the environment-variable exit table is exactly
the `fixed-alpha-discipline` failure applied to the exit contract. What I could not
re-verify is the executed vitest table and the grep-scoped negatives, so it stays
`reverify` on evidence rather than on reasoning.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/quality-regression-gating",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:625763675c86f196",
  "disposition": "clarify",
  "coverage": "All 12 owned documents read in full at restored bytes: golden path, 7 techniques, 4 applications. Statistical claims checked by re-derivation (the 1-0.95^6 figure, the paired-power conditionality, the zero-stderr edge case, the promptfoo NaN path). Not evaluated: the promptfoo vitest harness and grep-scoped negatives, the LightTrack line anchors, the eight-case paired arms in rust--baseline-carries-its-conditions, and any application maturity or verified_on refresh. No knowledge/ file was edited.",
  "counterexamples": [
    "Six targets tested against one shared baseline over one shared case set are not independent tests, so the 26% spurious-red figure is an upper bound under independence rather than the rate the paragraph presents.",
    "Where two runs' per-case scores are uncorrelated, the paired test buys no power over the unpaired one and spends a degree of freedom, so 'several times more power' is conditional on a correlation the documents never name.",
    "A promptfoo run with zero total tests exits 0 because NaN < 100 is false, so the technique's first forced failure mode is reachable in shipped software.",
    "An unrecognized run status maps to exit 0 by documented decision, so a newer writer than reader silently unguards the gate — absence rendered as pass, inside the subject that forbids it.",
    "A baseline that is a declared target rather than a measurement never expires, so the predicate's whole apparatus is inert on exactly the contractual floors an auditor is most likely to ask about."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/quality-scoring/quality-regression-gating",
      "result": "Every owned document read at restored bytes; the statistical claims re-derived by hand where they are arithmetic (0.95^6 = 0.7351, so 1 - 0.95^6 = 0.2649) and traced to their stated conditions where they are inferential. It did not establish whether the LightTrack or promptfoo code still reads as cited, and no test, gate or benchmark was executed."
    },
    {
      "path": "knowledge/llm-observability/quality-scoring/cross-provider-benchmark-operations/applications/rust--budget-preflight-and-ceiling.md",
      "result": "Read as a cross-check on this subject's rust--partial-run-never-green.md. Established that the two applications cite the same BENCHMARK_FRAMEWORK.md section at incompatible line ranges (427-445 versus 462-480) under the same verification date, and that they describe the unpriced-model disclosure in opposite vocabulary ('contribute zero, named' versus 'share shown as $0'). It did not establish which anchor set is correct."
    }
  ],
  "documents": {
    "quality-regression-gating.md": {
      "disposition": "clarify",
      "reason": "The spine, the composition doctrine and the honesty-about-limitations section all hold. One claim is repeated flatter than its technique states it: 'This is typically several times more statistical power at the same sample size' presents as unconditional a gain that depends on the within-case correlation between runs. Name the condition and the sentence becomes checkable on the reader's own corpus."
    },
    "techniques/paired-per-case-testing.md": {
      "disposition": "keep",
      "reason": "The procedure, the refuse-to-pair rule, the zero-stderr treatment as maximal evidence rather than a discard, and the distribution-free alternatives keyed to data shape are all correct. The baseline-uncertainty asymmetry section is the honest core of the subject. The power claim is hedged here as 'typically', which is where the hedge belongs."
    },
    "techniques/family-wise-correction.md": {
      "disposition": "clarify",
      "reason": "The correction, the family-counting rule, the disclose-by-name requirement and the argument for a conservative procedure over verdict-coupling step-down and FDR variants are all sound. The motivating figure (1 - 0.95^6 = 26%) is arithmetically right but assumes independence among tests that share a baseline and a case set; state it as an upper bound so the one place the document leans on independence is visible."
    },
    "techniques/fixed-alpha-discipline.md": {
      "disposition": "keep",
      "reason": "The constant-versus-default distinction is argued from what each makes possible rather than from taste, the three consequences are each a mechanism, and the routing of legitimate flexibility elsewhere (logged override, more cases, an operator-owned minimum effect) is what makes the discipline survivable. The separation of alpha from effect size in 'when not to use it' is exactly right."
    },
    "techniques/tested-superiority-claims.md": {
      "disposition": "keep",
      "reason": "The argmax-is-a-fact-about-a-sample framing, the selection-inference correction for the pair the argmax hid, the two permitted sentences with the honest degradation, and the render-layer rule (never re-derive, never strengthen) hold as written. 'Ties are information; a tool that cannot say tie will manufacture winners' is the operative sentence and it earns its place."
    },
    "techniques/unverified-vs-regressed-exit-states.md": {
      "disposition": "clarify",
      "reason": "The three-state contract and its two forced failure modes are correct and well argued. The unrecognized-status rule maps unknown to exit 0 on a trust argument about the code boundary, which is the subject's own forbidden substitution — absence rendered as pass — and is the one rule here that its composition doctrine would refuse. The safer default costs nothing because unverified is already non-blocking by policy; if the current default stays, mark it as the deliberate exception it is."
    },
    "techniques/partial-run-never-green.md": {
      "disposition": "keep",
      "reason": "The doctrine is one sentence and the document earns it: halting must exist because cost is multiplicative, the unjudged remainder is correlated with the conditions quality problems live under, and skipped is neither zero nor droppable. The designed-subsample exemption is correctly conditioned on the plan being recorded with the run, which is what stops it becoming a loophole."
    },
    "techniques/baseline-carries-its-conditions.md": {
      "disposition": "keep",
      "reason": "The deepest document in the subject. The inversion it names is real — the least-governed comparator is reached by exactly the condition proving comparability failed — the two rot directions are shown to be individually invisible, refuse-rather-than-degrade is the right resolution, and the one-normalization-function section (aggregate on canonical identity, compare on measured identity, store both) is a second-order finding its own application says was learned rather than assumed."
    },
    "applications/node--unverified-vs-regressed-exit-states.md": {
      "disposition": "reverify",
      "reason": "The reasoning survives re-reading: the NaN green hole is arithmetic anyone can check (totalTests 0 gives passRate NaN, NaN < 100 is false, exitCode never set), and the environment-variable exit table is fixed-alpha-discipline's failure applied to the exit contract. What could not be re-verified from this checkout is the executed vitest table, the grep-scoped negatives, and whether promptfoo 0.122.0 still reads as cited. Source reasoning kept, evidence unresolved."
    },
    "applications/rust--baseline-carries-its-conditions.md": {
      "disposition": "reverify",
      "reason": "Unusually honest about its own bounds — it ships one condition rather than the predicate, says the frozen flag is a proxy for the condition rather than the condition, and states that immutability rather than a check is what makes judge drift undetectable here. The eight-case paired arms and the 11-entry canonicalization table were not re-run. One tension worth stating: the arms move three cases from pass/regressed to no_baseline, which is a change of verdict, and the 'adds detection and disarms nothing' framing holds only if an unverified refusal counts as detection."
    },
    "applications/rust--paired-per-case-testing.md": {
      "disposition": "reverify",
      "reason": "Reads as a faithful realization of the technique including its refusal paths, the pub(crate) const alpha, and the caveats pushed mechanically into the artifact rather than documented. Not re-executed, and the cited line anchors were not checked against the tree. The normal-approximation z test is used at eval-suite n, where the technique's own distribution-free advice would often apply; the application does not say which regime it is in."
    },
    "applications/rust--partial-run-never-green.md": {
      "disposition": "reverify",
      "reason": "Two unresolved items. It cites BENCHMARK_FRAMEWORK.md:462-480 for the section the sibling subject's application cites at :427-445, both under verified_on 2026-08-30, so at most one anchor set is right. And it renders the unpriced-model disclosure as 'share shown as $0' where the sibling document and cheapest-sufficient-configuration insist an unresolved cost is null, never zero — one code path described in two vocabularies. The exit table and the ceiling machinery were not executed."
    }
  }
}
```

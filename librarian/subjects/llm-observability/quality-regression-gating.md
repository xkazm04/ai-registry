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

---
subject: agent-chaining
domain: software-engineering
last_touched: 2026-09-09
touched_by: external-reconcile
dry_streak: 0
---

# agent-chaining

First touch: [[2026-08-22-11]], external reconcile against `n8n-io/n8n`
@ `fbd9449` (2.36.0 - the register's new #1 at L5/89, adoption 92). Gained
`node--cycle-and-depth-guards` (uncovered); single-stack debt cleared. Hint
locus refuted: the sub-workflow chaining path has NO depth guard at all; the
real guard lives in the agent module, where depth is made UNREPRESENTABLE by
a template-literal type.

## Open leads (banked, convergence rule applies)

- Make depth unrepresentable: a path type plus a tool-attachment profile
  beats a counter, because there is no counter to disarm.
- The guard identifies its target by identity metadata, never by name - the
  tool is renameable.
- A bound RATCHETS across resume: a continuation may not lower a persisted
  bound.
- Rollup without enforcement is a named posture, not an omission - n8n states
  it in a comment; distinguish no-accounting from
  accounting-deliberately-non-blocking.
- Deviation lead: max-iterations erased to status completed at the handoff
  (confirming sighting of verdict-survives-boundary).
- Two chaining mechanisms, one hard-capped, one unbounded - THIRD SIGHTING of
  the one-mechanism-or-two-that-agree family (Prisma's two transaction
  wrappers, Argo's two expression dialects). Placement-ready for cycle 5.

## Cross-subject proposals

- De-wire discipline (dedupe refs before wiring; reap references from every
  parent on unpublish; deliberately unpinned child version) -> a strong
  node--graph-to-wiring-translation.
- Emit-site forward budget with silent truncation -> a confirmed-plus-
  deviation pair for a future node--handoff-payload-contracts.
- Task path as human-readable chain identity + child telemetry nested under
  the delegate span -> chain-identity-and-rollup.

## Applied to the technique layer

- 2026-08-23-1: **the guard covers every chaining mechanism** (one-mechanism family) applied to `cycle-and-depth-guards` ([[2026-08-23-1]]).

### 2026-08-31 - `/intake`, from danluu.com (2026 posts)

`grounding-over-deliberation` added - the subject's first technique about what a step
is *worth* rather than how steps are wired. The asymmetry that found it: every
existing technique here models the plumbing (graphs, payloads, cycle guards, run
conditions, identity, stop reasons) and none prices a step, even though the commonest
reason a chain grows one is to raise confidence in a claim.

The rule is an ordering: a **grounding** step (something that can refuse the claim -
execution) dominates a **deliberating** step (another reader), and N deliberating
steps do not sum to one grounding step, because they share a model family and a
prompt lineage so their agreement measures similarity rather than truth. Measured in
the source: causal explanations wrong ~50% of the time with multiple independent
analysis rounds failing to fix it, and forced execution removing most - with forced
checking alone beating independent cross-checking alone.

The corollary is the expensive half and came from the source's opening story: an
agent asked to prove a claim builds the apparatus that proves it, so the fabrication
moves into the apparatus. A grounding step therefore reviews a **different view** than
the one the artifact advertises. Home was contested - `remediation-handoff` is
explicitly about the agent you cannot watch, and `plan-review` is pre-authorship;
this subject owns the chain you own, which is where inserting the step is the
affordance you have. Source: [[../../sources/2026-08-31-danluu-2026]].

Applied same-run as a read-only experiment against a managed tree's memory-reflection
eval: **better**. That harness separates the two step kinds cleanly, and all 14 of its
deterministic assertions check *integrity* while quality routes entirely to a human
reading a side-by-side the producing step composed. Arm A refused 0 of 2
fabricated-citation proposals; a 20-line arm that recomputes support instead of
trusting the declared sources refused 1 of 2 with no false positive.

## Architecture review - 2026-09-09

The original open leads above are historical. This pass retracts the type-only
depth and non-loosening resume interpretations after reading the pinned source.
The current decision record covers every document; `reverify` preserves explicit
limits where runtime evidence was unavailable. No maturity or verification clock
was promoted.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/agent-chaining",
  "date": "2026-09-09",
  "baseline": "e76c81d7",
  "digest": "sha256:32359a36eb321c82",
  "disposition": "clarify",
  "coverage": "All 13 current documents read in full; source checks are explicitly narrower than corpus reading.",
  "counterexamples": [
    "A delayed successor can arrive after all visible leaves have stop rows.",
    "A dynamic join can terminate with bounded registration and an explicit closed-membership event.",
    "A test can execute successfully against the wrong requirement; a reviewer can refute its premise.",
    "A path template with a string suffix permits slash-containing suffixes; the runtime regex supplies the one-segment guard.",
    "Raising maxIterations from 30 to 60 passes the cited resume comparison and loosens the ceiling."
  ],
  "sources": [
    {
      "url": "https://danluu.com/ai-coding/",
      "result": "Read relevant primary practitioner account; it supports scoped checking/review benefits, not universal dominance."
    },
    {
      "url": "https://github.com/n8n-io/n8n/blob/fbd9449/packages/%40n8n/agents/src/runtime/tools/sub-agent-task-path.ts",
      "result": "Read pinned helper; template type and runtime regex have different acceptance sets."
    },
    {
      "url": "https://github.com/n8n-io/n8n/blob/fbd9449/packages/%40n8n/agents/src/runtime/loop/agent-runtime.ts",
      "result": "Read both pinned resume branches: lower ceiling rejected; higher ceiling accepted."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated reports retained; private runtime evidence not re-executed. Original verification dates unchanged."
    }
  ],
  "documents": {
    "agent-chaining.md": {
      "disposition": "clarify",
      "reason": "Scope event-wired terminology; allow bounded dynamic join registration with closure; qualify empirical grounding claims."
    },
    "techniques/chain-identity-and-rollup.md": {
      "disposition": "clarify",
      "reason": "Concurrent root creation needs atomic identity; finality also requires closed membership and drained pending work."
    },
    "techniques/cycle-and-depth-guards.md": {
      "disposition": "clarify",
      "reason": "Static analysis depends on graph availability; disabling an individual guard must preserve an overall resource ceiling. Numeric depth advice lacks a universal cost basis."
    },
    "techniques/graph-to-wiring-translation.md": {
      "disposition": "keep",
      "reason": "Owned-row reconciliation, deletion cleanup and actual-row drift checks address distinct failures; transactional scope remains a target design with existing application deviations disclosed."
    },
    "techniques/grounding-over-deliberation.md": {
      "disposition": "clarify",
      "reason": "Primary account supports a scoped recommendation, not universal dominance or zero value from correlated reviewers. Preserve relevant refuting checks and review of the apparatus."
    },
    "techniques/handoff-payload-contracts.md": {
      "disposition": "clarify",
      "reason": "Required structured data cannot be arbitrarily truncated; inspectability needs retention and access boundaries."
    },
    "techniques/run-conditions.md": {
      "disposition": "keep",
      "reason": "Mode-before-predicate and explicit unevaluable outcomes remain useful within event-wired scope; operands must follow the envelope retention boundary."
    },
    "techniques/stop-reason-ledgers.md": {
      "disposition": "clarify",
      "reason": "Separate vocabulary evolution from database migration, cancellation from failure, suppression from terminal outcome, and visible leaves from complete membership. Real-source parity tests are valid."
    },
    "applications/node--cycle-and-depth-guards.md": {
      "disposition": "clarify",
      "reason": "Pinned source contradicts type-only depth protection and a non-loosening resume ceiling. Corrected both; remaining source anchors not exhaustively rerun."
    },
    "applications/node--grounding-over-deliberation.md": {
      "disposition": "clarify",
      "reason": "Two constructed fixtures demonstrate only their checks; the account did not evaluate reviewer blindness. Preserve original experiment metadata, with the inference corrected."
    },
    "applications/node--stop-reason-ledgers.md": {
      "disposition": "reverify",
      "reason": "Retain dated parity-check account and explicit parser/production limitations; private consumer and historical execution artifacts were not reopened."
    },
    "applications/rust--graph-to-wiring-translation.md": {
      "disposition": "reverify",
      "reason": "Retain clear partial-reconciliation and shared-listener counterexamples; source checkout and current API behavior were not independently verified."
    },
    "applications/rust--stop-reason-ledgers.md": {
      "disposition": "reverify",
      "reason": "Retain explicit best-effort, missing-happy-path and predicate-collapse deviations; no current runtime witness was produced."
    }
  }
}
```

## 2026-09-18 - intake, small-business plugin ([[2026-09-18-kwp-small-business]])

New technique `handoff-figures-carry-their-population`: a figure in the handoff
envelope was measured over some population, and a receiver may divide by it or
compare it against a limit only when that population is its own. It is the
missing stage behind handoff-payload-contracts, which governs shape, size and
origin but not what a number measured. One sentence was added to
chain-identity-and-rollup: its alternative (increment at each handoff) was listed
as failing only on a crash, but under fan-out it is wrong without one.

Applied to personas, shipped `1ce23dde3`: the cost ceiling read a path-carried
total while the breadth guard beside it counted the whole trace. The paired test
fired at 1.20 spent against a 1.00 ceiling on HEAD and halts after the fix. A third
reading in the same tree (the live summary shows the max over paths as the
chain's spend) was left as found.

## Architecture review - 2026-10-31

Re-review against `140c101d`. The 2026-09-09 clarify changes are in the text.
Since then the subject gained `handoff-figures-carry-their-population` and a rust
application of it. Re-reading the Dan Luu account partly retracts the 2026-09-09
source result. The account does report an ordering: forced execution removed most
incorrect explanations, cross-checking trailed it, and the combination did best.
It reports this as one practitioner's experience, not a controlled study. The
rewrite that followed the old record dropped that ordering. The new technique's
worked example puts the inflated figure in the denominator, where it would deflate
the ratio. No verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/agent-chaining",
  "date": "2026-10-31",
  "baseline": "140c101d",
  "digest": "sha256-b2:596d59ae9fc2d310",
  "disposition": "clarify",
  "coverage": "All 15 current documents decided. The 13 carried from the 2026-09-09 record were checked by diff against baseline e76c81d7; the seven clarify changes that record asked for are present in the text. The two documents added since (handoff-figures-carry-their-population and its rust application) were read in full. Relative links resolve. One primary source was re-read. Not evaluated: any connected-project runtime, the n8n tree beyond the prior record's two files, every private application witness. No verification date was refreshed.",
  "counterexamples": [
    "A return-on-ad-spend figure computed over a company-wide revenue total is inflated because the broader figure sits in the numerator. A larger denominator would shrink the ratio, so 'the denominator is forty times too large' cannot produce 194 from 4.7.",
    "A tree-wide spend sum over recorded links can still under-read a fan-out whose current hop is not yet booked. Taking the larger of the carried and summed figures tightens the guard but does not close the gap.",
    "A practitioner can report that forced execution beat cross-checking in their workflow without that ordering holding for a design review, where nothing executable exists yet.",
    "A delayed successor can arrive after every visible leaf has a stop row (retained from 2026-09-09)."
  ],
  "sources": [
    {
      "url": "https://danluu.com/ai-coding/",
      "result": "Re-read. It reports agent bug-origin explanations wrong 'maybe 50% of the time or so', that asking agents to confirm a hypothesis 'by actually executing code' 'removed most incorrect explanations', that independent cross-checking trailed forced checking, and that combining both 'seems to have an even higher success rate'. It also reports a fabricated reproduction built in 'an artificial browser environment'. On models, it says a stronger model without a false-positive rejection process did worse than a weaker one with a reasonable setup, and that setup 'is a least as important as having the latest and greatest model'. So the source does state an ordering, as one practitioner's experience. This partly retracts the 2026-09-09 reading, which credited it only with 'scoped checking/review benefits'."
    },
    {
      "source": "Arithmetic in techniques/handoff-figures-carry-their-population.md",
      "result": "971,794 / 23,653 is about 41.1, and 4.7 x 41.1 is about 193, so the worked example's magnitudes are consistent. The online share is 2.4% ('about 2%'). The text names the wrong side of the ratio."
    },
    {
      "source": "applications/rust--handoff-figures-carry-their-population.md",
      "result": "Internally consistent: 0.20 + 0.50 = 0.70 on each path, which stays under 1.00, while the tree total is 1.20. The private tree at 1ce23dde3 was not reopened and nothing was re-executed."
    }
  ],
  "documents": {
    "agent-chaining.md": {
      "disposition": "clarify",
      "reason": "Prior clarifies applied. Two changes are still owed. (1) The grounding paragraph now says only that the account 'reports benefits ... as well as from independent review'. Restore the ordering the source does report (forced execution removed most errors, cross-checking trailed it, combined was best), labelled as one practitioner's observation. (2) 'a receiver that divides by it' should read 'a receiver that uses it as an operand in a ratio or comparison', to match the corrected technique."
    },
    "techniques/chain-identity-and-rollup.md": {
      "disposition": "keep",
      "reason": "The atomic root get-or-create, the finality condition (closed membership plus drained pending work) and the new fan-out sentence are all present and correct."
    },
    "techniques/cycle-and-depth-guards.md": {
      "disposition": "keep",
      "reason": "The 2026-09-09 clarifies landed: static checks only where a complete graph exists, a numeric depth chosen from a cost model, and an overall resource ceiling that individual guards may not remove."
    },
    "techniques/graph-to-wiring-translation.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-09 keep, and that reasoning still holds."
    },
    "techniques/grounding-over-deliberation.md": {
      "disposition": "clarify",
      "reason": "The 2026-09-09 rewrite over-corrected. The Evidence section says 'independent and combined reviews also helped' and leaves out the source's stated ordering. Restore that ordering as a scoped practitioner observation, plus the removed sizing lesson (a weaker model behind a false-positive rejection stage against a stronger model without one), which the source does contain. Keep the counterexamples and the no-universal-ranking caveat."
    },
    "techniques/handoff-figures-carry-their-population.md": {
      "disposition": "clarify",
      "reason": "The rule and decision rules are sound. The worked example inverts the ratio: revenue is the numerator of return on ad spend, so 'the denominator is roughly forty times too large' should say the numerator. Rule 2's 'before it divides by the figure' should cover the numerator too ('before it uses the figure in a ratio or comparison'). Optionally say 2.4% instead of 'about 2%'."
    },
    "techniques/handoff-payload-contracts.md": {
      "disposition": "keep",
      "reason": "The truncation-preserves-contract and access-controlled-inspection clarifies landed."
    },
    "techniques/run-conditions.md": {
      "disposition": "keep",
      "reason": "Unchanged since the 2026-09-09 keep."
    },
    "techniques/stop-reason-ledgers.md": {
      "disposition": "keep",
      "reason": "All five separations the prior record asked for landed: vocabulary change versus migration, outcome classes including cancellation, edge suppression versus terminal outcome, visible leaves versus closed membership, and parity tests that read the real producer."
    },
    "applications/node--cycle-and-depth-guards.md": {
      "disposition": "reverify",
      "reason": "The type-only depth and non-loosening resume claims are corrected, with a dated source-review note. The remaining anchors at fbd9449 were not reopened."
    },
    "applications/node--grounding-over-deliberation.md": {
      "disposition": "reverify",
      "reason": "The reviewer-blindness inference was corrected. The ab_verdict 'better' still rests on two constructed fixtures in a private tree that was not re-run."
    },
    "applications/node--stop-reason-ledgers.md": {
      "disposition": "reverify",
      "reason": "Unchanged. The private consumer artifacts were not reopened."
    },
    "applications/rust--graph-to-wiring-translation.md": {
      "disposition": "reverify",
      "reason": "Unchanged. No current runtime witness."
    },
    "applications/rust--stop-reason-ledgers.md": {
      "disposition": "reverify",
      "reason": "Unchanged. No current runtime witness."
    },
    "applications/rust--handoff-figures-carry-their-population.md": {
      "disposition": "reverify",
      "reason": "The paired arms are internally consistent and the floor is stated with identical failure sets. It openly records a two-surface 'chain cost' deviation. The private tree and its test runs were not reopened."
    }
  }
}
```

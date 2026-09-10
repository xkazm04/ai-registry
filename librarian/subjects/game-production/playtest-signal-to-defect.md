---
domain: game-production
subject: playtest-signal-to-defect
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# playtest-signal-to-defect

## Architecture review - 2026-09-10

Read and assessed all 9 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/playtest-signal-to-defect",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:f6c116a591a48e70",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Never-used and missed-exit complaints have multiple plausible causes. Assign a triage owner and confidence without claiming causal ownership from one observation; shared vocabulary can use an explicit mapping.",
    "Keep frequency denominators, exposure and severity separate. Ordinal multiplication is not expected loss, but calibrated cardinal loss times probability can be meaningful. Small fractions and percentages encode the same estimate and need uncertainty.",
    "Separate observations and interpretations while preserving useful quotations and hypotheses. Two calls do not guarantee independence or truth; causal words inside a player quote are not automatically an interpretation error."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/craft-judgment/playtest-signal-to-defect/playtest-signal-to-defect.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    }
  ],
  "documents": {
    "playtest-signal-to-defect.md": {
      "disposition": "reverify",
      "reason": "Reverify observation-to-cause routing, unreproduced reports dismissed as rumour, guaranteed independence of two-step extraction and all-category coverage as closure proof. The unreproduced-state technique is repaired; historical consumer closure remains unverified."
    },
    "techniques/complaint-to-owning-subject-routing.md": {
      "disposition": "reverify",
      "reason": "Never-used and missed-exit complaints have multiple plausible causes. Assign a triage owner and confidence without claiming causal ownership from one observation; shared vocabulary can use an explicit mapping."
    },
    "techniques/frequency-and-severity-as-separate-axes.md": {
      "disposition": "reverify",
      "reason": "Keep frequency denominators, exposure and severity separate. Ordinal multiplication is not expected loss, but calibrated cardinal loss times probability can be meaningful. Small fractions and percentages encode the same estimate and need uncertainty."
    },
    "techniques/observation-before-interpretation.md": {
      "disposition": "reverify",
      "reason": "Separate observations and interpretations while preserving useful quotations and hypotheses. Two calls do not guarantee independence or truth; causal words inside a player quote are not automatically an interpretation error."
    },
    "techniques/repro-minimization-protocol.md": {
      "disposition": "reverify",
      "reason": "Reduction commonly establishes local or one-minimality, not a globally shortest repro. Negative trials provide scoped evidence; aggregate and experiential defects can have explicit statistical or human oracles."
    },
    "techniques/session-instrumentation-contract.md": {
      "disposition": "reverify",
      "reason": "Idle observation can legitimately have no input events. Planned coverage is not exercised coverage, and partial notes remain evidence with limitations. Align raw input, accepted actions and observation clocks."
    },
    "techniques/unreproducible-is-a-state-not-a-dismissal.md": {
      "disposition": "clarify",
      "reason": "Repaired corroboration versus reproduction, scoped negative evidence, exercised coverage, stable finding identity and fixed versus expired or accepted-risk resolutions."
    },
    "applications/node--unreproducible-is-a-state-not-a-dismissal.md": {
      "disposition": "reverify",
      "reason": "The historical key including a newly minted finding ID is not idempotent across re-analysis by itself. Category coverage does not establish a fix; similar titles may conflate different causes. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--observation-before-interpretation.md": {
      "disposition": "reverify",
      "reason": "Defaulting absent provenance to simulated invents an origin; use unknown with a separate eligibility policy. Default confidence 80 is unmeasured, and separate output fields do not enforce an observation/interpretation boundary. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```

## Architecture re-review after the compression revert - 2026-09-10

Read the golden path, all six techniques and both applications at their reverted bytes, then
opened the PoF checkout at `C:/Users/kazda/kiro/pof` (HEAD `d823bffe`) to check the two
applications, both of which are pinned to commit `9aa31407`. Reading source, not executing
it: no session harness, no agent playtest, no database run.

The subject is coherent and its central move - separating the unavoidable, lossy compression
from experience to observation from the avoidable, irreversible compression from observation
to proposed cause - is the load-bearing idea and everything else is downstream of it. The
treatment of an automated tester as testimony with different biases, rather than as a higher
grade of evidence, is exactly right and the schema-constraint consequence (two requests, not
one prompt with two sections) follows from it. The four-state vocabulary in
`unreproducible-is-a-state-not-a-dismissal`, and the reason the *not reproduced* / *not
attempted* split matters, is the part of this subject most queues lack.

One finding I can defend. `unreproducible-is-a-state-not-a-dismissal` defines **Reproduced**
as "the trigger was pulled and the failure occurred, with an attempt count", and then a
decision rule says: "When the same observation arrives from an automated tester and a human
within one build, treat it as reproduced." Those two sightings are corroboration, not
reproduction. No trigger was pulled, there is no attempt count, and the state the rule
assigns is the one the technique defines as carrying an attempt count. This also cuts against
the golden path's own position that a machine's report is testimony with its own biases
rather than an independent instrument in the sense the rule assumes. Two independent
sightings are genuinely stronger evidence than one, and that is worth a rule - but the
honest one raises confidence or frequency, not the reproduction state. As written it lets a
finding enter `reproduced` with an empty denominator, which is the exact shape the same
document forbids two sections earlier.

I checked and did not carry forward two possible objections. The frequency technique's ban on
multiplying ordinal labels is correct as stated, and its reach rule is explicitly allowed as
a derivation with both inputs visible, which is the honest form. The routing technique's
no-default-bucket rule together with `unrouted` as a named state does not create a dumping
ground, because the size of that queue is stated as a measurement of the router.

On the applications: PoF has closed both of the deviations they record. `TriageStatus` in
`src/types/game-director.ts` now includes `unreproducible`, documented as "a durable state,
not a dismissal", with an attempt-series record beside it - which is exactly what
`node--unreproducible-is-a-state-not-a-dismissal` says is absent. And
`game_director_findings.confidence` is now nullable with a `confidence_basis` column
constrained to `observer` or `unattributed`, where the application records
`confidence INTEGER NOT NULL DEFAULT 80` as an unmeasured quantity rendering as a number.
Both documents are honestly pinned, so they are not wrong; they are stale, and their "What a
consumer should copy" sections end by naming work that has since landed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/playtest-signal-to-defect",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:b9e1aa724c895b57",
  "disposition": "clarify",
  "coverage": "Golden path, six techniques and two applications read in full at reverted bytes. Both applications' pinned citations re-checked by reading the live PoF checkout (HEAD d823bffe). Not evaluated: any session run, agent playtest, database query or minimization executed; the neighbouring runtime-observation ladder the subject inherits rather than restates; whether the marker channel's claimed yield has ever been measured.",
  "counterexamples": [
    "The rule that a matching observation from an automated tester and a human within one build is 'treated as reproduced' contradicts the technique's own definition of reproduced (a trigger pulled, with an attempt count). Two sightings with no trigger and no denominator are corroboration.",
    "The session contract requires build identity derived from the artifact and world identity including every option in force, but a live-service build whose server-side configuration changes underneath a session satisfies both records and is still not minimizable, because the thing that varied was never client state.",
    "Routing requires the observation to discriminate between candidate classes, but the golden path's own worked example ('I never used the shield') is discriminated by an absence in the recording - and a session whose instrumentation does not record ability usage cannot produce that absence as evidence, so the finding is unrouted for an instrumentation reason the routing table cannot express."
  ],
  "sources": [
    {"path": "C:/Users/kazda/kiro/pof/src/types/game-director.ts", "result": "Establishes that TriageStatus now carries unreproducible with an attempt-series record, closing the deviation the node application records as absent. Does not establish that any code path sets it or that attempt counts are populated."},
    {"path": "C:/Users/kazda/kiro/pof/src/lib/game-director-db.ts", "result": "Confirms confidence is now nullable with a confidence_basis column constrained to observer or unattributed, closing the deviation the process application records. Does not establish how existing rows were migrated beyond the comment saying preserved values are stamped unattributed."}
  ],
  "documents": {
    "playtest-signal-to-defect.md": {"disposition": "keep", "reason": "The two-compressions argument, the treatment of an automated tester as testimony with different biases, the routing-is-where-this-pays section and the boundary statements against crash forensics, review doctrine, verdict integrity and runtime observation are each specific and mutually consistent. It names what it inherits rather than restating it."},
    "techniques/complaint-to-owning-subject-routing.md": {"disposition": "keep", "reason": "The discriminator column is correctly identified as the one people omit, the three orderings (teaching before tuning, legibility before layout, pacing before numbers) each carry their reason, and the no-default-bucket rule with unrouted as a measured queue is the mechanism that makes the rest work. A wrong route costing more than none is argued by the inoculation effect, not asserted."},
    "techniques/frequency-and-severity-as-separate-axes.md": {"disposition": "keep", "reason": "Three independent objections to the composite, any one sufficient, and the denominator rules (count only sessions that could have met the defect; report the literal fraction on a small sample) are the honest form. Borrowing the severity ladder from review doctrine rather than inventing a parallel one is the correct seam and is stated as such."},
    "techniques/observation-before-interpretation.md": {"disposition": "keep", "reason": "The observation/interpretation definitions are operational rather than the objective/subjective distinction, and the internal-state case is handled correctly. The two-request protocol for a machine tester follows from the stated mechanism - a theory already in context writes the observation to support it - rather than from a general preference for structure."},
    "techniques/repro-minimization-protocol.md": {"disposition": "keep", "reason": "The oracle-first rule, the baseline reliability as a denominator, per-decision attempt counts scaled to the baseline rate, and stopping at either minimal or budget-exhausted with the reason stated are all sound. The removals-are-evidence section is the half most practitioners omit and it is argued with a concrete routing consequence."},
    "techniques/session-instrumentation-contract.md": {"disposition": "keep", "reason": "Four required records each with the specific downstream capability it enables, and the fifth (declared coverage in the same partition findings are classified in) with the join it makes possible. The empty-capture-is-an-instrument-failure rule and the anecdotes-stay-out-of-denominators rule are both correct and both are commonly missing."},
    "techniques/unreproducible-is-a-state-not-a-dismissal.md": {"disposition": "clarify", "reason": "The decision rule treating a matching observation from an automated tester and a human within one build as reproduced contradicts the document's own definition of reproduced, which requires a pulled trigger and an attempt count. It admits a finding to that state with an empty denominator, which the same document forbids. Two independent sightings deserve a rule; make it strengthen confidence or frequency, not the reproduction state."},
    "applications/node--unreproducible-is-a-state-not-a-dismissal.md": {"disposition": "reverify", "reason": "Its central recorded deviation - no unreproducible state and no attempt count anywhere in either schema - is closed at PoF HEAD: TriageStatus now carries unreproducible documented as a durable state, with an attempt-series record. The total-coverage sweep and unknown-scope-is-not-covered findings it contributes upward are unaffected, but the deviation list is a description of the past. Re-anchor it."},
    "applications/process--observation-before-interpretation.md": {"disposition": "reverify", "reason": "Its confidence deviation is closed at PoF HEAD - the column is nullable with a confidence_basis constrained to observer or unattributed, which is the shape the document itself prescribes. Its other two deviations (unvalidated description column, single-pass generation) were not re-checked in detail this run. Re-anchor and re-state which deviations still stand."}
  }
}
```

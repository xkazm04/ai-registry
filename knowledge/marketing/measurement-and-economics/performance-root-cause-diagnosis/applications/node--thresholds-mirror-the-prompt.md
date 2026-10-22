---
layer: application
type: application
subject: performance-root-cause-diagnosis
technique: thresholds-mirror-the-prompt
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# An unknown model cause falls to the twin, not to the last rung

Verified against the Czech-first marketing workspace at its origin master tip of
2026-10-22 (`7bbd1cab`), Node 24 per `package.json` engines. Anchors: the cause coercion
and the deterministic picker in `src/lib/ai/tools/ads-diagnosis.ts` (`coerceCause`,
`pickAdsCause`, `normalizeAdsDiagnosis`) and in
`src/lib/ai/tools/lead-source-diagnosis.ts` (`coerceCause`, `pickCause`,
`normalizeLeadSourceDiagnosis`).

## What the tree already did right

Both diagnoses carry the pairing this technique asks for. The ads tool declares its
five ratio thresholds in one block, with a comment saying the code floor and the prompt
wording move together. The lead-source tool does the same and labels its currency
floors as Czech small-business anchors. Each deterministic picker is the demo's output
and the floor for an empty model cause. Severity comes from the cause actually shown,
so a badge cannot contradict its text.

## Where it broke the rule

The technique's decision rule: *when a model returns a cause outside the set, coerce to
the deterministic pick, not to a fixed catch-all.* Both tools coerced to a catch-all
instead. The ads tool used `budget-misallocation`, described in the code as "the
neutral, always-actionable catch-all". The lead-source tool used `mis-targeting`, "a
safe, non-accusatory catch-all". The deterministic picker sat one function away and was
used only when the model left the field empty.

The catch-all is the ladder's last rung, the answer when nothing else fires. Using it
for "the model said something unknown" replaced the numbers' verdict with the
weakest one. A portfolio spending with zero measured conversions showed as a
medium misallocation instead of a high tracking gap. A 12-lead source showed as
mis-targeting instead of too little data.

The seam was chosen to falsify the rule. If the catch-all equalled the deterministic
pick on most real shapes, the rule would be decoration here. It equals the pick on one
of the six ads rungs and on two of the six lead-source fixtures, so it does not.

## Proof

Paired replay through the real normalisers, with the model mocked. There is one fixture
per ladder rung (six ads, six lead-source), and each gets three out-of-set causes: an
invented one, a near-miss spelling and a Czech label. That makes 36 cases.

| Measure | A (catch-all) | B (deterministic pick) |
| --- | --- | --- |
| shown cause differs from the pick | 27 / 36 | 0 / 36 |
| shown severity differs from the pick's | 18 / 36 | 0 / 36 |
| in-set model cause altered (floor) | 0 / 12 | 0 / 12 |

The new test fails on A (9 of 12) and passes on B. The 3 that pass on A are the rungs
where the catch-all happens to be the pick. B also logs each out-of-set cause, which is
the technique's "check" use of the twin. Floor: typecheck, lint, the contract snapshots
and the LLM gate are green. The unit suite passed 4395 of 4399; the only red file was
`patterns-embeddings`, which was already failing on master. Project commits `988815da` + `38202064`
are on branch `cur/tmtp-coerce` (pushed). Master's pre-push gate is red on its own
suite, so the fast-forward waits on that.

## What this realization cannot do

It cannot tell whether the model's unknown cause carried a nuance the predicates miss.
It shows the twin's cause next to the model's own summary and recommendation, which can
still disagree with the badge. The live rate of out-of-set causes is not measured. The
new warning makes it countable. The cohort diagnosis in the same tree still states an
LTV:CAC target of three in its persona prompt as a fact, and has no deterministic
check on the cohort the model picks. That is the benchmark case the technique names,
and it is not changed here.

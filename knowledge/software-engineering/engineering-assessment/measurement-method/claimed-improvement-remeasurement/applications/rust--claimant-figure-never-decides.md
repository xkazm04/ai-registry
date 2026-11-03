---
layer: application
type: application
subject: claimed-improvement-remeasurement
technique: claimant-figure-never-decides
stack: rust
status: forged
verified_on: 2026-11-03
verified_against: rust@1.96
---

# The promoter's override, the fixed confidence level, and an allow with no reason (tracklight)

Project `tracklight`, https://github.com/xkazm04/lighttrack at origin/main, commit 5aa119f. The
same promotion gate as [rust--queued-runs-as-head-sample](./rust--queued-runs-as-head-sample.md),
read for the other side of the subject: which of the gate's parameters the person asking for the
promotion can reach.

## The confidence level is a constant, on purpose

The significance level behind every verdict is fixed in code
(`crates/runner/src/stats/paired.rs:25`). The reason given is the technique's tolerance leak,
stated for α: a confidence level that is configurable
`crates/runner/src/stats/paired.rs:24 "knob invites tuning it until the answer is the desired one"`.
The technique takes its tolerance from reviewed policy and clamps it to a ceiling. Here the
parameter is removed from configuration altogether, which is the stricter form and suits a
quantity with one defensible value. When one run compares several targets, the code corrects
for the family size instead of letting each comparison spend the full α (Bonferroni,
`crates/runner/src/stats/paired.rs:210`). A claim checked over many series needs the same
correction, or one primary metric declared in advance.

## The override belongs to the claimant, so it cannot clear policy

The gate has a `force` flag. Its order of checks says who may waive what:
`crates/api/src/prompts_gate.rs:103` returns the judge-trust refusal before
`crates/api/src/prompts_gate.rs:106` consults `force`. The doc comment gives the reason
(`crates/api/src/prompts_gate.rs:89 "is checked first, and"` force does not clear it): the flag is
`crates/api/src/prompts_gate.rs:92 "set by exactly the person who wants the promotion"`, the trust
requirement is a policy an admin set, and letting one override the other would make the policy
`crates/api/src/prompts_gate.rs:94 "decorative"`. That is an **upward lesson** now in the
technique's leak list: an override flag on the claim's own request is a parameter the claimant
fills, so it may waive evidence refusals but never a policy refusal. The ordering has no test
of its own: every `gate_promotion` call in `crates/api/src/tests_prompt_gate.rs` passes no
trust refusal, so nothing pins `force` failing to clear one.

## Where it departs: an allow that hides the third state

The gate refuses only a proven regression. A run whose interval still reaches the floor is
allowed (`crates/api/src/prompts_gate.rs:195` returns no refusal for any recorded upper bound at
or above the baseline). The test pins it with mean 0.79 against a floor of 0.80 and an upper
bound of 0.88 (`crates/api/src/tests_prompt_gate.rs:133-134`), allowed as
`crates/api/src/tests_prompt_gate.rs:139 "a dip inside the noise"`. For a gate that stops a
deploy, letting undecidable evidence through is a defensible direction of burden.

Two things sit against the three-way verdict, though. First, the doc comment says a noisy run
`crates/api/src/prompts_gate.rs:85 "run is not waved through either"`, yet the pinned test lets
exactly such a run through. Second, the allow is a bare `Allow`: an interval that straddles the
floor and an interval wholly above it produce the same outcome, though the gate already has
`crates/api/src/prompts_gate.rs:23` `AllowWithWarning` for a promotion it lets through on weak
grounds. In the technique's terms the first case is *inconclusive: noisy*, and a no-regression
gate may let it pass but should say that it did. Recorded here as the gate's departure and
banked as a lead; no code was changed in this pass.

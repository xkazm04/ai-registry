---
layer: technique
type: technique
subject: ai-assistance-detection-and-fairness
technique: behaviour-matched-peer-test-for-over-reliance
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, uncertainty-resolves-toward-the-candidate, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [deciding whether an over-reliance flag is discriminatory, auditing flag rates that differ between model users and non-users, defending an authenticity flag in a dispute]
---

# Behaviour-matched peer test for over-reliance

This is the sharpest fairness definition in the subject, and it is worth
stating with no hedging:

> An over-reliance flag is unfair **only** when it lands on a model-using
> candidate while a **behaviour-matched** non-model-using peer — same
> verification habit, who would show the same evidence in their artifact — is
> **not** flagged. In that pair, the only thing that differs is that a model was
> used, so the tool is what was punished.
>
> If both are flagged, the justification is the shared behaviour, not the tool,
> and that is fair.

Everything else people say about this — that flag rates differ between groups,
that model users get flagged more often, that the flag "feels" like a tool
penalty — is not evidence of unfairness. Model users may genuinely verify less
on average; if so, flagging them more often is the flag working. Only the
matched pair isolates the variable.

## Constructing the matched comparison

You cannot literally clone a candidate, so match on the behaviour the flag
claims to be about, and compare group means rather than individuals.

1. **Fix the flag's stated basis.** Write down what behaviour the flag asserts
   — "propagated planted flaws without addressing or flagging them", say. That
   sentence is now the matching key, and it must be artifact-anchored. A flag
   whose basis cannot be stated as an observable behaviour cannot be tested and
   should not exist.
2. **Partition the cohort by that behaviour**, not by outcome: candidates who
   showed the behaviour, and candidates who did not.
3. **Within the behaviour-matched group**, compute the flag rate for model
   users and for non-users.
4. **Compare against a declared discrimination margin.** If the model-using
   subgroup's flag rate exceeds the matched non-using subgroup's by more than
   the margin, the flag is discriminating on the tool and must be suspended
   until its basis is repaired.

The margin is not zero, for the same reason as elsewhere: two rates over finite
groups differ by noise. Declare it in advance with a rationale, alongside the
minimum subgroup size below which the comparison returns *inconclusive*
([a claim carries its sample](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## The three ways the test is faked

- **Matching on the flag instead of the behaviour.** If you partition by "was
  flagged", both subgroups have a 100% flag rate and the test always passes.
  The matching key must be the underlying behaviour, independently observed.
- **Matching on a behaviour that is downstream of tool use.** "Produced a long
  polished write-up" is not a verification habit; it correlates with assistance
  by construction, and matching on it launders a tool penalty into a
  behavioural one. Ask of every matching key: could a non-model-using candidate
  plausibly show this? If not, it is not a behaviour, it is a tell.
- **Running it where the flag cannot fire.** Most assessment stacks have two
  paths: a rich path that assigns flags, and a cheap deterministic fallback
  that structurally never assigns any. Guard the test to the fallback — by
  accident, because that path is easier to run in bulk — and the invariant is
  *vacuously* true: no flags exist, so no unfair flag exists, and the check
  reports a permanent green that everyone reads as evidence. Run it on the path
  that actually assigns flags, and prove the check can fail by making it fail
  once deliberately.
- **Running it on the cohort that the flag already filtered.** If flagged
  candidates were removed upstream, the surviving cohort cannot show the
  disparity. Compute over everyone who was assessed, including those the flag
  removed.

## Verdicts

- **pass** — subgroups large enough; the matched flag-rate gap sits within the
  declared margin.
- **fail** — the gap exceeds the margin. The finding is about the flag, not
  about the candidates: suspend the flag's influence on outcomes, re-examine
  its basis for tool-correlated inputs, and review the flags already issued.
- **inconclusive** — the check ran and could not decide; typically one subgroup
  below the minimum size.
- **not evaluable** — the check could not run: no behaviour labels, no tool-use
  labels, or no flags issued in the period.

Distinguish the last two in the record, and never let either read as unfair. A
report that says "fairness: unknown" because nobody was flagged this quarter is
correct; one that renders that as a warning teaches the organisation to fear
the absence of data, which is how manufactured checks get born.

## What the flag may do once it survives the test

A surviving over-reliance flag is an input to a human conversation and nothing
more. It names a behaviour, cites the artifact evidence for it, and goes to a
named reviewer who reads the submission
([no adverse outcome is solely automated](../../_laws.md#no-adverse-outcome-is-solely-automated)).
It never rejects, never posts an integrity note to a candidate record, and
never travels to another requisition. The most common resolution in practice is
that the candidate saw the issue, made a defensible call, and did not document
it — which is a feedback point, not a finding.

Where any input to the flag is missing or ambiguous, the flag does not fire
([uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).
An unreached canary is not a propagated one; an unlabelled tool-use status is
not "used a model"; a missing decision log is not an absence of verification.

## Wording the flag so it stays testable

Two phrasings, same underlying data:

- *"Shows signs of over-reliance on AI."* Untestable, unmatched, and it names
  the tool. It cannot be defended in a dispute and it cannot be audited by this
  technique.
- *"Propagated two of three planted flaws without addressing or flagging them;
  see regions cited."* Testable, artifact-anchored, matchable, and it survives
  being read back to the candidate.

Only the second form belongs in a record. The discipline of writing flags in
that form is what makes this technique possible at all — a flag vocabulary that
names behaviours is a prerequisite, not a presentation choice.

## When not to use it

- **When no over-reliance flag exists.** Do not build one so that you can test
  it. The canary and baseline verdicts are findings; a flag is an escalation
  and many processes do not need one.
- **As a per-candidate defence.** It audits the flag across a cohort. An
  individual candidate's flag is defended by its cited artifact evidence, not
  by a group statistic.
- **On a cohort assembled after the fact from disputed cases.** Selecting the
  cohort by dispute selects for the flag's own errors and answers a different
  question than the one you asked.

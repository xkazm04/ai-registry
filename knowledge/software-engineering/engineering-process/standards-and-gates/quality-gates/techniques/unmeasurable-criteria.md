---
layer: technique
type: technique
subject: quality-gates
technique: unmeasurable-criteria
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [a policy condition has no data to evaluate, deciding whether missing evidence blocks or skips, a gate reports a verdict over a partly failed assessment]
---

# Unmeasurable criteria

A policy is a list of conditions; an assessment is a bag of measurements;
and the two never line up perfectly. Some condition will always face a
value that is missing — the credential could not read the setting, the
sample never reached its floor, the scorer produced nothing for that
dimension. The upstream discipline of *distinguishing* unmeasurable from
zero belongs to measurement honesty. This technique is the downstream
half, and it is the gate's own decision: **what does refusal machinery do
with a condition it cannot evaluate?**

There are exactly three honest resolutions, and picking the wrong one is
the failure mode:

- **SKIP** — the condition does not participate in this verdict, and says
  so out loud.
- **FAIL-CLOSED** — the missing value counts as a violation.
- **REFUSE** — the gate declines to return a verdict at all.

## The deciding question

> Does the absence describe the **subject's world**, or the **gate's own
> vision**?

Absence that is a fact about the subject — it has not done enough of the
thing for a rate to exist, the setting is not visible to the access the
gate was granted — is not evidence of a violation. Gate on it and the
policy inverts: a bar reading "at least this share of machine-authored
changes carried a human approval," applied to a subject with three such
changes and no computable rate, fails the subject *for having little
activity*, which rewards not doing the thing at all. That is not a strict
gate; it is a gate enforcing the opposite of its own intent. **SKIP.**

Absence that is a hole in the gate's own instrument — a dimension the
scorer was supposed to produce and did not, a value that arrived
non-finite — is not evidence of anything, and must never read as
compliance. The naive comparison is the trap: `value < floor` with a
missing or non-finite value evaluates to *false*, so an unscored dimension
sails through the exact floor that exists to enforce it. Absence of a score
must be treated as *below every floor* by construction, in the comparison
helper, not by remembering to null-check at each call site.
**FAIL-CLOSED.**

And when *nothing* could be measured — every detector failed, the
dimension set came back empty — the assessment's renormalized floor
(a zero, a lowest level) is not a measurement, and a gate that reads it
certifies or condemns on an ingestion failure wearing a verdict's clothes
([gate-sees-target](../../../../_laws.md#gate-sees-target)). **REFUSE**: emit a
distinct outcome that is neither pass nor fail, with a message that names
the ingestion problem and the remedy. Where the calling protocol admits
only two states, refusal is spelled as failure — a gate that cannot see
the subject blocks, it does not wave through
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Derive the unmeasurable state; do not merely read a flag

The "this run measured nothing" condition is usually stamped by the
current engine as a field. Persisted or reconstructed assessments predate
that field, and an empty dimension set means exactly the same thing. A
predicate that trusts only the flag passes every historical record through
the hole. Write it as a derivation over every observable that implies the
condition, and put it in one function every surface calls — the moment two
surfaces decide "incomplete" differently, one of them is certifying runs
the other refuses.

## A skip must be loud, and counted

Silent skipping is how a policy becomes decoration without anyone editing
it. Three rules keep it honest:

- **Render the skip.** Every surface that shows the policy shows which
  conditions were evaluated, which were skipped, and *why* — "not
  measurable: no read access to the setting" is a finding about the
  assessment, not a blank.
- **Track the skip rate per condition.** A bar skipped over most of the
  population is not enforcing; it has become advisory by data starvation,
  and the response is fixing the instrument or the access, not raising the
  threshold. This is the same audit as severity-by-construction, run on
  the data channel rather than the exit-code channel.
- **Skip identically on every surface.** When a rollup view and the
  blocking gate evaluate the same policy over the same population from two
  code paths, a condition that one path skips and the other enforces makes
  the dashboard advertise subjects as passing that the gate refuses. The
  skip decision belongs to the shared evaluator; a second evaluator that
  omits an input silently converts that condition into a skip for
  everything it judges.

## When SKIP is the wrong answer

The rule is not "unmeasurable always skips." For controls where **absence
of evidence is itself the risk**, skipping is the vulnerability: an
unsigned artifact, a dependency set nothing scanned, an audit trail that
does not exist. There the missing measurement is the finding, and the
condition fails closed with a message demanding the evidence. The
distinction is whether a competent, compliant subject could plausibly
produce no data. If yes, skip; if the only way to produce no data is to
have skipped the control, fail.

Finally, a skipped condition never silently changes the *shape* of the
verdict. A pass with two conditions skipped is a weaker claim than a pass
with all conditions evaluated, and the verdict says so — otherwise the
first one gets compared against the second, and the comparison is
meaningless in the direction nobody checks.

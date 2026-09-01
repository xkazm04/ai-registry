---
layer: technique
type: technique
subject: quality-gates
technique: unmeasurable-criteria
status: forged
laws: [gate-sees-target, failure-not-empty-success, absent-guard-is-loud]
shared_with: []
use_when: [a policy condition has no data to evaluate, deciding whether missing evidence blocks or skips, a gate reports a verdict over a partly failed assessment, a guard sits in the path of the work rather than beside it, deciding what a check does when its own runtime is missing]
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

## Where the gate stands changes the direction

The three resolutions are correct for a gate that stands **beside** the work:
it judges an artifact, and refusing costs that artifact its advancement while
leaving everything else — including every capability needed to repair the
instrument — untouched. That is the shape almost every gate in this subject
has, and under it "a gate that cannot see the subject blocks" is right.

A gate placed **in** the work's execution path inverts one branch of it. Such
a gate does not judge a finished artifact; it stands between an actor and a
capability, and it is consulted on every use. Now the cost of refusing on a
broken instrument is not one blocked advancement. It is the capability, for
as long as the instrument stays broken — and the repair path runs *through*
the capability being denied. A guard on a shell invocation that fails closed
because its interpreter is missing denies the commands that would install the
interpreter. Fail-closed there is not strictness; it is a deadlock whose exit
is outside the system.

So split the branch this technique currently states as one. The deciding
question is not only *whose world does the absence describe* but **which of
the two failed**:

- **The instrument did not run.** A missing runtime, an unparseable payload,
  a policy component that is absent or returned nothing intelligible. The
  gate has no verdict because it never executed. For a gate beside the work,
  this is REFUSE, spelled as failure. For a gate in the path, it **must not
  block the actor** — the guard withdraws rather than bricking the surface it
  was mounted on, because the blast radius is total and the remedy is inside
  it.

  Withdrawing is not the same as going quiet, and the distinction is the
  whole craft here: the two audiences are different, and only one of them can
  repair an instrument. A field implementation of exactly this gate resolves
  it with **three exit codes rather than two** — checked-and-clean,
  checked-and-violated, and *could-not-check* — where the third is routed to
  the operator as a non-blocking error while the actor's work proceeds. That
  is the correct shape: **open to the actor, loud to the operator, on a code
  of its own.** A gate that folds could-not-check into clean has bought the
  deadlock's cure at the price of a green that means nobody looked; one that
  folds it into violated has bought the loudness at the price of the
  deadlock ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).
- **The instrument ran and could not decide.** It executed, read the input,
  and the input is outside what it can model. That is a *result*: a verdict
  of "I cannot classify this particular thing." **FAIL-CLOSED**, unchanged,
  and for the original reason — it is a hole in the gate's vision and must
  never read as compliance. The blast-radius argument does not rescue it,
  because refusing this one input leaves every other input allowed and the
  remedy path intact.

The pairing is what makes it safe: an in-path gate may open on its own
breakage precisely because it still closes on every input it can see and does
not like. A design that fails open on both has no gate; a design that fails
closed on both removes its own repair path. And a withdrawal that reaches
nobody is a **liveness** claim gone false
([gate-liveness](./gate-liveness.md)) — the third code is what keeps the
withdrawal on the record instead of letting the fleet converge quietly on an
unguarded default.

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

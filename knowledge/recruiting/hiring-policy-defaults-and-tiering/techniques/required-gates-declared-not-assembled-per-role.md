---
layer: technique
type: technique
subject: hiring-policy-defaults-and-tiering
technique: required-gates-declared-not-assembled-per-role
status: forged
laws: [no-adverse-outcome-is-solely-automated, every-decision-names-its-actor, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [defining which steps every hire must pass through, a requisition proposes skipping a human step, designing the default interview plan a hiring system ships with]
---

# Required gates declared, not assembled per role

## The concern

If the mandatory shape of a hiring process is assembled by each requisition from a
palette of optional steps, then it is mandatory only for the requisitions that chose it.
The steps that exist to protect candidates — a human looking at a person before a machine
round decides anything, a named human approving an offer, an adverse action that only a
person applies — are exactly the steps that a hiring manager under deadline pressure will
leave out, and their absence is invisible because the process still looks complete.

The technique: **the organisation declares the required gates once, centrally; the
requisition composes its loop from what remains.** A required gate is not a step with a
default of "included". It is a step the requisition cannot express the absence of.

## What belongs in the declared set

Keep it small. Every gate in the required set applies to every hire in the organisation,
so the bar for inclusion is that its absence would be indefensible for *any* role. In
practice that yields a short list of the shape:

- **A human screening gate before any machine-decided round.** Someone sees the person
  before the process narrows around a score. This is the gate that makes
  [no adverse outcome solely automated](../../_laws.md#no-adverse-outcome-is-solely-automated)
  structural rather than aspirational — it puts a human at the front of the funnel, where
  the population is largest and the machine's error rate is highest.
- **At most one gated machine-run round, and never the last word.** A machine-conducted or
  machine-scored round may narrow a field; it may not be the step after which no human sees
  the candidate again. Gated means it runs only for candidates a human already passed
  forward.
- **A human-approved offer.** No offer leaves the organisation without a named approver,
  because an offer is a commitment and
  [every consequential decision names its actor](../../_laws.md#every-decision-names-its-actor).
- **A human-applied adverse action.** Rejection is applied by a person, not by the
  pipeline. This one is enforced by the fairness gate too — the required-gate declaration
  is the policy statement of it, the gate is the enforcement, and having both is deliberate.

Everything else — how many technical rounds, whether there is a portfolio review, who sits
on the panel, what a debrief looks like — is the requisition's to compose, and its design
belongs to the interview-round-design subject rather than to this one.

## One step runs one activity

The doctrine that makes any of this enforceable: **a step in a hiring plan runs exactly one
activity.** A step that bundles a screening conversation, a technical exercise and a values
discussion cannot be checked against a policy requiring a human screen, cannot be scored
against a single rubric, cannot be removed without losing two other things, and cannot be
audited — the record says one step happened while three things were judged, and
[a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)
becomes unverifiable.

This is why stacked rounds are retired as a matter of policy rather than of scheduling
taste. The arguments for stacking are real: fewer calendar invitations, less candidate
travel, faster elapsed time. They are outweighed by four properties the unbundled form has
and the stacked form cannot have:

1. **Checkability.** A policy can require the presence of an activity only if activities are
   individually addressable.
2. **Attributability.** Each verdict names one activity, one rubric and one set of
   assessors. In a stacked round, the outcome is a blend nobody can decompose, and a weak
   signal on one dimension silently disqualifies on all three.
3. **Substitutability.** A candidate who needs an accommodation, or who has already
   demonstrated one activity through a work sample, can have that one activity waived. In a
   stacked round the only available granularity is the whole block.
4. **Measurability.** Which steps actually predict outcomes is answerable only if steps are
   distinct. Stacked rounds make every funnel metric a composite.

Unbundling does not mean more of the candidate's time — the same activities in separately
recorded steps can still be scheduled back to back. What changes is that the *record* has
one row per judgment.

## The procedure

1. **Ship a default plan that already satisfies the required set.** The out-of-the-box
   interview plan is a policy artifact like any other default: a human screening gate, a
   single gated machine round, human-approved offers. Most organisations will run what
   arrives, which is the argument for making what arrives correct rather than minimal.
2. **Mark required steps as required in the data, not in the documentation.** The plan
   validator rejects a configuration missing a required gate, with a message naming the gate
   and the reason. Guidance in a help page is not a gate.
3. **Validate at the requisition boundary and again at execution.** A plan can become
   non-compliant after it was valid — a step deleted, a policy tightened, a plan cloned from
   an old requisition. Re-check before the loop runs, not only when it is saved.
4. **Model a waiver explicitly, or not at all.** If any required gate can ever be waived,
   the waiver is a first-class object with an approver, a reason and an expiry, and it is
   visible on the candidate's record. A gate that can be skipped by leaving a field empty is
   not required; a gate with no waiver mechanism at all is often the better design.
5. **Make step types single-activity by construction.** Give a step one activity field, not
   a list. Constraints that are structural do not need enforcing.
6. **Version the required set with the rest of the policy** so that a decision made under an
   older required set can be replayed against it, and a tightening does not retroactively
   invalidate completed processes.

## Absence is a real answer, never a fabricated gate

A plan that says nothing about a step has **no policy for that step** — not a defaulted
one. The distinction matters most exactly where it is most tempting to paper over: a step
added after the plan was written, a step whose column the plan never governed, a plan
loaded against a process that has changed shape. Inventing a gate for it claims an approval
rule nobody chose, and that claim will be read later as a decision the organisation made.

The correct behaviours are: render the step as ungoverned and say so; block the process
from running if the ungoverned step is one the required set covers; and prompt the operator
to state a rule rather than assuming one on their behalf. An unstated gate is a question,
and the system's job is to ask it.

The one place a conservative fill-in is legitimate is when *reconstructing* an old plan
into a new shape: a step that ends up with nothing to say about its gate takes the
human-run reading, because that is the position that adds a person rather than removing
one.

## Decision rules

- **When a requisition asks to skip a required gate, the answer is a policy change or a
  waiver, never a plan edit.** The two legitimate answers both leave a record; the third
  leaves none, which is why it is the one that gets used.
- **When a machine round is proposed as the first step, refuse.** The gate exists because the
  first step touches everyone, and an unscreened population is where automated error does the
  most damage.
- **When a step description contains "and", suspect a stacked round.** It is a crude test and
  it works.
- **When a new step type is added, it must declare its single activity and whether it is
  human-run.** Steps whose human-run status is ambiguous cannot be counted toward a human
  gate, and ambiguity here resolves against counting.
- **When an organisation genuinely needs a different required set — a regulated industry with
  extra mandatory checks — extend the set at the baseline, never per requisition.** Statutory
  requirements enter as constraints the baseline may add and no lower layer may remove.
- **When a required gate is consistently the bottleneck, fix the capacity, not the
  requirement.** A human screening gate that nobody has time to work becomes a stall, and
  a stalled candidate is a harm of its own; the correct responses are triage, staffing and
  better tooling for the reviewer, not removing the review.

## When NOT to use it

- **Not as a way to standardise the whole loop.** The required set is a floor with a few
  members, not a company-wide fixed process. Over-declaring produces a uniform loop that fits
  no role well and gets circumvented with off-system conversations, which is worse than a
  short list of gates everyone honours.
- **Not for guidance-shaped preferences.** "Panels should include someone outside the team"
  is good practice that belongs in interview design, not in the validator. Reserve hard
  validation for gates whose absence is indefensible.
- **Not as a substitute for the enforcement points.** Declaring that rejection is
  human-applied does not make it so; the apply boundary does. The declaration is what lets
  the organisation state its policy and what lets an auditor check the two against each
  other.

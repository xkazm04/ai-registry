---
layer: technique
type: technique
subject: hiring-policy-defaults-and-tiering
technique: a-default-is-a-policy-position
status: forged
laws: [no-adverse-outcome-is-solely-automated, every-decision-names-its-actor]
shared_with: []
use_when: [choosing a shipped value for a hiring setting, reviewing a change to a default, arguing that a behaviour is safe because it is configurable]
---

# A default is a policy position

## The concern

A default in a hiring system is not a starting point. It is the operative rule for the
overwhelming majority of the organisations and teams that will ever run the system, and
for the entire life of most of them. Treating it as a convenience — a value chosen so the
software works before anyone configures it — means the most consequential hiring decisions
in the product were made by whoever typed the constant, with no review, no owner and no
record.

The technique is to give every default the standing of a policy decision: chosen with a
stated reason, reviewed by whoever is accountable for its consequences, and changed
through a path that leaves a record.

## The evidence for the premise

Nobody needs a study to accept that most settings are never touched, but two structural
facts make hiring configuration worse than the average case, and both are worth naming
when someone argues that the customer will tune it:

- **The accountable person and the capable person are different people.** The person who
  owns the organisation's fairness posture usually does not have the administrative access
  or the vocabulary to move a screening threshold; the person who has both usually does
  not believe the value is theirs to move. The gap is where shipped values survive.
- **The feedback signal for a bad default points one way only.** A default that is too
  strict produces a visible complaint — the queue is empty, the shortlist is thin, someone
  escalates. A default that is too permissive produces nothing: the rejected candidate does
  not know, the recruiter sees a plausible list, and the defect is invisible to everyone
  with the power to fix it. So the errors that survive are systematically the harmful
  ones.

## The procedure

1. **Classify the setting by the direction of its harm.** For each value, ask: what does
   the wrong setting cost, and to whom? Sort into (a) costs the organisation throughput,
   (b) costs the organisation money, (c) costs a candidate an opportunity or a fair
   process. Class (c) is governed by this technique; the others are ordinary product
   decisions.
2. **For every class-(c) setting, ship the position that produces no adverse outcome.**
   Not the middle. Not the typical. The inert one. Enabling it is then an act with a date
   and an actor, which is the only thing that makes
   [no adverse outcome solely automated](../../../_laws.md#no-adverse-outcome-is-solely-automated)
   defensible at the organisation level.
3. **Write the reason beside the value, not in a document.** One sentence, stating what
   the value is protecting against and what would justify changing it. The audience is the
   engineer six months from now who is looking at this constant while optimising something
   else.
4. **Route default changes through policy review, not code review.** A diff that changes a
   shipped threshold changes future outcomes for every organisation on the version. The
   reviewer set includes the person accountable for hiring outcomes. A one-character diff
   is not a small change; it is the largest change the product can make.
5. **Make the effective policy legible in one screen to a non-engineer.** Every governed
   value, its current setting, whether it is inherited or overridden, and who last moved
   it. If the answer to "what does this system do on its own" requires reading source, the
   setting is not governed however carefully it was chosen.
6. **Constrain the range, not just the value.** A default is protected by bounds: refuse to
   load a configuration whose thresholds cross, whose reserve is negative, whose confidence
   floor is zero. A bound is a default that cannot be cleared by a form.

## Decision rules

- **When a setting can produce an adverse outcome for a candidate, the shipped position is
  the inert one — no exceptions for "our customers all want it on".** Customers who want it
  on can turn it on, and the turning-on is the artifact you need.
- **When someone argues a risky behaviour is safe because it is configurable, treat that as
  an unmet requirement.** Configurability distributes a decision the vendor already made;
  it does not unmake it.
- **When a value has no stated reason, it has no owner — assign one or delete the knob.**
  An unexplained number will be changed by the next person who finds it inconvenient, and
  that change will also be unexplained.
- **When two settings interact such that a combination is unsafe, encode the combination as
  a validation, not as guidance.** Documentation does not survive a form submission.
- **When a default's correct value genuinely differs by organisation, ship no value and
  require a choice at setup** rather than guessing. A forced choice at onboarding has an
  actor; a guess does not. Use this sparingly — a setup wizard with thirty required choices
  is answered by clicking through, which returns you to defaults with extra ceremony.
- **When the number of governed settings passes what a person will read in one sitting,
  stop adding and start removing.** Policy that nobody has read is not policy, and every
  additional knob lowers the odds that any of them was considered.

## A new default does not enter the stored configuration

When you add a governed value to a system that already has stored configurations, there
are two places the default could live: written into every stored row by a migration, or
resolved at the point of use from an absent key. **Resolve at the point of use.** Writing
it into the rows creates a phantom key — configurations that were saved before the
dimension existed now differ byte-for-byte from configurations that were not, every
policy version moves, and a stored shape that validated yesterday may not validate today.

That gives you a three-state model, and all three states are meaningful:

- **absent** — nobody has an opinion; the shipped default applies, and it may be improved
  later without touching anyone's stored policy;
- **explicitly set** — including explicitly set to the value that disables the control,
  which is how an organisation opts out *with an actor and a date* rather than by leaving
  a field blank;
- **malformed** — a negative, non-finite or wrong-typed value, which resolves to the
  fail-closed position for that particular setting and raises.

Keep those distinct and the "silent zero" failure disappears: clearing a field returns you
to the default, and disabling a control requires saying so.

## Direction of safety is per-setting, not global

The fail-closed value is not always the smaller number, or the larger one. It is whichever
position causes the control to do less to a candidate, and that has to be worked out per
setting. A malformed *confidence floor* fails closed by going high, so nothing acts. A
malformed *calibration reserve* fails closed by going to zero, because the reserve spares
candidates from a wave and an unbounded reserve would silently exempt an entire cohort from
a process people are waiting on. Two protections, opposite fail-closed directions.

This is why the direction-of-safety note must sit beside the value: it is not derivable
from the type, and the next person to add a clamp will guess.

## Changing a shipped default must not move anyone who chose

When you improve a default, the change applies only where nothing was chosen. An
organisation that ever saved this policy keeps exactly what it saved, and the improvement
reaches only those still inheriting. Anything else is a vendor silently rewriting a
customer's hiring policy — and it is also the reason storing resolved defaults into rows is
so damaging: once the default has been materialised everywhere, there is no longer a
population that can be moved, and no way to tell a choice from an inheritance.

## What a good default statement looks like

A defensible shipped value carries four things in the place it is defined: the value, the
unit and direction of safety (which way is more protective), the reason for this
particular level, and the condition under which changing it would be justified. Anything
less and the next reader has only the number, which tells them nothing about whether
halving it is a tuning or an incident.

The direction-of-safety note is the one teams omit and the one that prevents the worst
class of mistake — a value mirrored in two places where a later change to one of them
inverts the guarantee, silently, because neither site said which way was safe.

## When NOT to use it

- **Not for cosmetic, throughput or convenience settings.** Page sizes, sort orders,
  notification cadence, retry counts: choose a good value and move on. Applying policy
  ceremony to every constant devalues the ceremony where it matters.
- **Not as a reason to ship a system that cannot function.** The inert position must still
  leave a working product — a hiring system whose defaults make it useless is not safe, it
  is unadopted, and the organisation will route around it with spreadsheets that have no
  gates at all.
- **Not as a substitute for the fairness gate itself.** A safe default and an enforced
  invariant are different controls: the default decides what happens when nobody chose, the
  gate decides what is permitted even when someone did. A team that has one and calls it
  the other has a single point of failure.
- **Not as an argument against ever changing a default.** Defaults should improve as
  evidence accumulates. The requirement is that the change is reviewed and recorded, not
  that it never happens.

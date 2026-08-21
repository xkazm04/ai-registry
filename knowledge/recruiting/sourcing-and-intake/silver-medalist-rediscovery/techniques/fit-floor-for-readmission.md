---
layer: technique
type: technique
subject: silver-medalist-rediscovery
technique: fit-floor-for-readmission
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, every-decision-names-its-actor]
shared_with: []
use_when: [deciding which past candidates enter a rediscovery sweep, setting the threshold a talent pool view shares with a matching job, auditing why a re-surfaced name looks wrong]
---

# Fit floor for readmission

Rediscovery needs an admission rule: which of the thousands of people in the
history are worth putting in front of a recruiter for this opening. The rule
is a floor on fit *for the new role*, and its two properties are more
important than its value. It is computed against the current opening, not
inherited from the old one. And it is expressed once, in one place, shared by
the sweep and by every surface that lists pool candidates.

## The floor judges this role

The temptation is to admit on history: they interviewed well, so show them.
This fails on the law that a verdict is bound to what it judged
([a-verdict-is-bound-to-what-it-judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
A strong showing against a data-engineering opening is not an admission
ticket to a design role, and a system that admits on prior score will produce
exactly that recommendation, confidently, in front of a recruiter who has
thirty seconds to judge it.

So: score the person against the new requirement set the same way a fresh
applicant would be scored, and admit on that score. Prior history is not part
of the admission test at all — it enters later, bounded, as an ordering
influence only ([band-limited-prior-depth-boost](./band-limited-prior-depth-boost.md)).
This separation is what makes the whole mechanism defensible: every name on
the list is there because it clears the bar for this job, and the order among
them reflects what you additionally know.

The corollary is that the admission score must be the *honest* score. If the
familiarity adjustment is applied before the threshold test, the floor has
been quietly lowered for known people and the separation is fiction. Compute
raw, admit on raw, adjust for ordering afterwards.

## One expression, or the two drift

The same predicate — "is this person a promising fit for this role" — is asked
in at least three places: the sweep that generates matches, the pool view a
recruiter browses, and any count or badge that says how many candidates are
available. Implement it three times and it will disagree three ways within a
quarter, usually because one copy was tuned during an incident and the others
were not.

The symptom is characteristic and confusing: a recruiter is notified about a
re-surfaced person who does not appear in the pool list when they go to look,
or a count says four and the list shows two. The recruiter concludes the
system is broken, which it is, and stops trusting the whole feature — a much
larger loss than the mis-threshold that caused it.

Share the predicate as a single named function or a single stored definition
that both paths call. If the two genuinely need different thresholds — a
notification may reasonably be stricter than a browsable list, because it
spends attention without being asked — then express that as one predicate with
an explicit level parameter, so the relationship between the two is visible in
one place and a change to the shared part cannot miss a caller.

## Choosing the value

The floor is a policy number, and it should be chosen by what it costs to be
wrong in each direction:

- **Too low** spends recruiter attention and, worse, spends candidate goodwill.
  Every re-approach to a marginal fit is a message to a real person who was
  already turned down once, and a weak second approach is what teaches someone
  to opt out.
- **Too high** produces an empty feature, which is the more common failure and
  the less visible one. A rediscovery sweep that returns nothing for months is
  usually read as "we have no silver medalists" rather than "the bar is set
  above where anyone scores".

Calibrate against a known population rather than by intuition: take a role you
recently filled, run the floor across the history, and read the names. If the
list is people the hiring manager would recognise as plausible, the floor is
about right. If it is dominated by people whose relevance you must explain,
it is too low.

Two guards worth building in: a floor that admits more than a working-session's
worth of people per role is not a floor, it is a list — cap and rank rather
than loosening. And the floor's value belongs in configuration with an owner,
because a threshold that gates who gets contacted is a policy decision and
policy decisions name their actor
([every-decision-names-its-actor](../../../_laws.md#every-decision-names-its-actor)).

## Decision rules

- Compute fit against the current opening's requirements; never admit on a
  prior role's score.
- Apply the threshold test to the unadjusted score, before any familiarity
  influence.
- Use one shared expression of the predicate for the sweep, the pool view and
  every count; parameterise strictness rather than forking the rule.
- Apply the eligibility gates — terminal outcomes, suppression, anonymisation —
  before the floor, not after, so a high score can never bring an ineligible
  person into view even momentarily.
- Record which floor value produced a given match, so a list that looks wrong
  in retrospect can be explained without re-running history.

## When not to use it

A fit floor is the wrong instrument for a role whose requirements are not yet
stable. During the first days of an intake, the requirement set churns, and a
sweep run against a half-formed brief produces confident matches against a
specification nobody agreed to. Gate rediscovery on the brief being settled.

It is also the wrong instrument when the population is small enough to read.
Fifty past candidates for a niche role do not need a threshold; they need a
recruiter to look at fifty names. Thresholds are for when attention is the
scarce resource, and imposing one on a small pool mostly hides people for no
gain.

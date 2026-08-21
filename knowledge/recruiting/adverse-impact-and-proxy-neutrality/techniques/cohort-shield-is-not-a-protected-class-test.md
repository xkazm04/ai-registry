---
layer: technique
type: technique
subject: adverse-impact-and-proxy-neutrality
technique: cohort-shield-is-not-a-protected-class-test
status: forged
laws: [uncertainty-resolves-toward-the-candidate, no-adverse-outcome-is-solely-automated, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [shielding non-standard career profiles from automated rejection, reviewing whether a cohort metric is being read as a fairness result]
---

# The cohort shield is not a protected-class test

A useful pattern: classify candidates into cohorts derived from their own
documented careers — career-changer, returner after a long absence,
self-taught, non-linear path, early-career, over-qualified — and exempt some of
those cohorts from automated adverse action, routing them to a human instead.
It works because a pattern-matching screen is worst exactly where a career does
not match the pattern, and those are the people a screen rejects for the
weakest reasons.

And a hard boundary: **this is not a fairness test, it produces no fairness
claim, and it must be impossible to read as one.** The two live near each other
in the code and in the interface, and the distance between them has to be
written down in both, because the substitution is what an employer's counsel
will find first.

## Why the distinction is load-bearing

A cohort is **inferred from evidence the candidate supplied about their work**.
A protected class is a **legal category**, and in a well-designed system it is
data you do not hold. They differ in origin, in error profile, in what they
license, and in what happens when they are wrong.

- **Coverage says nothing.** "94% of shielded candidates were reviewed by a
  human" is an operations number. It contains no group rates, no reference, no
  sample of any protected population, and it cannot indicate or exclude adverse
  impact.
- **Correlation is not permission.** Some cohorts do correlate with protected
  characteristics — a long-absence returner cohort correlates with sex in most
  markets. That correlation makes the shield *more* sensitive, not more
  probative: it means the label is proxy-adjacent, so it must not be tuned
  toward the characteristic, must not be exposed as a filter a recruiter can
  select on, and must not be described in words that name the underlying life
  event. The label describes the shape of a career, never the reason for it.
- **A label is not a meaning.** Renaming a cohort does not change what it
  measures, and a report that lists cohort balance under a heading about
  fairness has made a claim its data cannot carry, whatever the field was
  called.

## The rules for the shield itself

1. **Shield, do not score.** The cohort changes the *route* — to a human — not
   the candidate's score, band or rank. A cohort that adds points is a
   thumb on the scale and it will be found.
2. **Unclassifiable is shielded.** A candidate the classifier cannot place goes
   to the protective branch, never to the unshielded default. Uncertainty
   resolves toward the candidate, and this is the exact place where a null
   quietly becomes an automated rejection.
3. **Shielding routes to a person, and the person decides.** The shield is one
   more reason no adverse outcome is solely automated; it is not an alternative
   to that rule and it does not extend to advancing anyone automatically.
4. **The shield is auditable.** Which candidates were shielded, by which
   cohort, under which classifier version, and what the human then decided.
   A shield whose outcomes nobody reviews is a queue.
5. **A refused automated action downgrades to hold, with an alert.** When the
   shield refuses a reject the upstream rule proposed, the candidate lands at
   the human gate and someone is told it happened. A silently dropped action is
   a candidate stalled in a queue nobody is watching, which is the shield
   failing in the direction that looks like success.
6. **A display fallback must never launder into a stored classification.** An
   unclassifiable candidate shown under a readable placeholder must keep the
   uncertain value on the wire. Collapse the placeholder into a concrete cohort
   for display, let that display value get persisted, and the shield is stripped
   downstream by a system that now believes the candidate was classified — the
   shield disappears through a rendering decision, which is exactly how nobody
   notices.
7. **Do not infer sensitive facts to build it.** Deriving "on parental leave"
   or "has a disability" from a gap in employment is inference about a
   protected characteristic; the honest cohort is "an employment gap of N
   months", with no cause attached, and the gap gets a human, not an
   explanation.

## The reporting rule

Where both exist, they are reported in **separate sections with separate
headings**, and the cohort section carries an explicit line stating it is not a
protected-class analysis. Where the protected-class analysis does not exist —
because no demographic data is held — the cohort section carries that line
twice as loudly, since it is the only fairness-adjacent number on the page and
will be read as the answer unless it says it is not.

## When not to use this

- **Never as evidence in a discrimination inquiry.** Offering cohort coverage
  where a selection-rate analysis was requested reads as evasion and will be
  treated as one.
- **Never as a reason to skip the outcome analysis.** The shield reduces the
  harm of an automated screen; it does not measure the screen. A system with a
  strong shield and no ratio is a system with one control and no measurement.
- **Never as a permanent classification.** A cohort is a reading of one
  application at one moment. It does not follow the person across
  requisitions, it does not persist as a profile attribute a recruiter can
  browse, and it expires with the evidence that produced it.

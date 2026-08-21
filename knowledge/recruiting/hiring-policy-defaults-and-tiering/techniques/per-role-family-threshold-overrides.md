---
layer: technique
type: technique
subject: hiring-policy-defaults-and-tiering
technique: per-role-family-threshold-overrides
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, a-verdict-is-bound-to-what-it-judged, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [one threshold is producing bad outcomes for a particular kind of work, deciding whether hiring bars should vary by occupation, a hiring manager asks for a lower bar for their role]
---

# Per-role-family threshold overrides

## The concern

A single organisation-wide screening threshold is indefensible in both directions at once.
The score that separates a strong from a weak candidate is a property of the *instrument
and the occupation*, not of the company: a rubric reading structured professional careers
produces a different distribution for a licensed clinical role, a high-volume operations
role, an apprenticeship, and a research position. A bar set where the median engineering
requisition looks sensible will reject viable warehouse candidates in bulk and wave through
unqualified specialists, and both failures are invisible in the aggregate because they
cancel.

The technique is a small, named set of **role families**, each able to override specific
policy floors, resolved against the baseline, and reviewed as policy rather than requested
per requisition.

## Why the family and not the role

The unit of variation is the occupational family, not the individual role or requisition,
for three reasons that all reduce to reviewability.

- **Sample.** A threshold is only defensible if someone can point at the distribution it
  was derived from. A family has enough candidates to have a distribution;
  a single requisition does not, and a bar set from a handful of applications is a number
  with no basis
  ([a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
- **Pressure.** A per-requisition bar is settable by the person under the most pressure to
  lower it, in the week the pressure is highest. A per-family bar is set once, in the cold,
  by someone who will not personally benefit from the next hire closing faster.
- **Legibility.** A dozen named families can be printed on one page and defended. Hundreds
  of per-role numbers cannot be reviewed, cannot be compared, and cannot be shown to
  anyone as a policy.

## The procedure

1. **Define the families from the work, not from the org chart.** Group roles that share an
   evidence shape — what a strong candidate's record looks like, what the rubric can
   actually observe. Two roles in different departments that both hire on demonstrable craft
   with portfolios belong together; two roles in one department where one is licensed and
   one is not do not.
2. **Anchor families to a recognised occupational taxonomy where one exists.** Borrowing a
   public classification rather than inventing one makes the grouping explicable to an
   outsider and comparable to external data, and it protects against the family boundary
   being drawn, after the fact, around whichever roles a particular manager wanted to treat
   differently.
3. **Override floors, not the structure.** A family may raise or lower a numeric floor
   within a declared band. It may not change which cohorts are shielded, which verdicts are
   routable, or which gates are required — those are structural and centrally fixed. Keep
   the overridable key set explicit and small.
4. **Derive each override from that family's own distribution and record the derivation.**
   The stored artifact is the value, the sample it came from, the period, and the intended
   effect. A family threshold with no derivation is a preference, and it will be read as one
   the first time someone asks why this occupation is held to a different standard.
5. **State the resolution rule once and apply it everywhere.** Effective floor for a
   candidate equals: the family override if one exists for the family this requisition
   belongs to, otherwise the baseline value. Where a team override and a family override
   both apply, declare which wins — and prefer the *stricter* of the two for any value that
   gates an adverse action, so that neither layer can be used to reach a weaker outcome than
   the other permits.
6. **Fail to the baseline, never to the permissive end.** An unrecognised family, a role
   with no family assigned, a family removed while requisitions still point at it: all
   resolve to the baseline. An unmapped occupation is not a licence to run without a floor,
   and treating a missing mapping as "no restriction" is the
   [absence of evidence](../../_laws.md#absence-of-evidence-is-not-evidence) error at policy
   scope.
7. **Monitor outcome rates by family, not only by threshold.** The value is a means; the
   thing to watch is pass rate, hold rate and downstream success per family, because a
   threshold that looked defensible can produce a rate that is not. Watch it against the
   protected-characteristic breakdown too — this is where a family override quietly becomes a
   proxy, since occupations are not evenly composed, and the adverse-impact subject owns the
   test you run.

## Decision rules

- **When a hiring manager asks for a lower bar for their requisition, the answer is a family
  review, not an exception.** If the family's bar is wrong it is wrong for everyone hiring
  that work; if it is right, this requisition does not get to be different.
- **When a family override exists only to speed up one urgent hire, delete it.** Urgency is
  not an occupational property, and an override created under deadline outlives the deadline
  by years.
- **When the family's sample is too small to derive a threshold, do not invent one — inherit
  the baseline and say why.** A number with no basis is worse than the general number,
  because it looks specific.
- **When an override moves a floor down, require the stronger review.** Raising a bar is
  self-limiting; lowering one increases the population exposed to adverse automated
  handling, which is exactly the change that needs the accountable owner in the room.
- **When two families' bars differ substantially, be able to say why in occupational terms.**
  "This work is licensed and the record is verifiable, so the instrument is more reliable"
  is a reason. "This family scores lower" is not — it is a description of the very thing
  being explained.
- **When the scoring instrument changes, every family override is stale until re-derived.**
  A verdict is bound to what it judged; a threshold is bound to the instrument that produced
  the scores it was set against
  ([a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
  Re-derive on instrument change and version the result.

## The trap: different bars are not different standards

The legitimate reason for family variation is that the *measurement* behaves differently
across occupations. The illegitimate reason is that the organisation wants a different
quality of person for one kind of work than another and would rather express that as a
threshold than say it out loud. The distinction shows up in the derivation: a legitimate
override is justified by the score distribution and the instrument's behaviour on that
family; an illegitimate one is justified by an opinion about the people.

The test to apply before shipping a family override: could you show this table, with its
derivations, to the candidates it applies to? A per-family threshold set from a documented
distribution survives that. One set from a hiring manager's sense of who is worth reviewing
does not.

## When NOT to use it

- **Not for a first implementation.** Ship one baseline, measure per-family outcome rates,
  and add overrides where the data shows the single bar failing. Families invented in advance
  encode assumptions with no evidence and are hard to remove later.
- **Not for structural protections.** Cohort shields, required gates, jurisdictional
  constraints and the automation posture do not vary by occupation. If you find yourself
  wanting a family exemption from a gate, the gate is wrong or the request is.
- **Not as a substitute for a better instrument.** Persistently needing a much lower floor
  for a family usually means the rubric reads that family's evidence badly. Overriding the
  threshold treats the symptom and leaves the population being scored by something that does
  not understand their work.
- **Not at a granularity nobody reviews.** If the family list has outgrown one page, it has
  become per-role configuration with a nicer name and has lost every property that justified
  it.

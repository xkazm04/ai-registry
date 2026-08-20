---
layer: technique
type: technique
subject: judgment-guardbands
technique: self-audit-budget
status: forged
laws: [one-validation-door, gate-sees-target, deletion-is-not-repair]
shared_with: []
use_when: [the model believes a detector is wrong, granting a model extra room on a dimension, designing how disagreement with the evidence is handled]
---

# Self-audit budget

Detectors have blind spots, and the reading model is usually the first
component in the system to notice one. A regime that gives the model no way
to say "your evidence is wrong here" discards that signal entirely; a regime
that lets it say so freely has no regime. The resolution is a **budget**: the
model may nominate a small, fixed number of dimensions where it believes the
deterministic evidence is mistaken, and only those dimensions get a widened
band.

## The mechanism

The verdict schema carries, per dimension, an optional flag meaning *the
computed evidence for this dimension is wrong, and here is why*. After the
verdict is parsed and before any correction is applied, a policy step counts
the flags and decides which — if any — are honoured. Honoured flags widen
that dimension's band (see [score-guardband](score-guardband.md)); everything
else proceeds under the base band.

Three structural properties make this safe rather than merely polite.

**Only eligible dimensions count against the budget.** Flags naming
dimensions that could not have been widened anyway — a narrate-only
dimension, a detector that failed and was dropped, an identifier the rubric
does not define — are filtered out *before* the count. Counting them spends
the budget on claims that never moved a number, which turns an unlucky
verdict into a suppressed one and makes the enforcement look capricious to
anyone reading the record. Filter first, then count, then decide.

**The policy is one door.** All flags, from all dimensions, are evaluated in
a single place with full knowledge of the whole verdict
([_laws: one-validation-door_](../../_laws.md#one-validation-door)). A
dimension cannot widen its own band by inspecting its own flag; the decision
is global by construction, because the *count* of flags is the evidence the
policy runs on.

**Widening changes the band, not the weight.** "The evidence is thin" and
"the evidence is wrong" are different claims with different remedies, and
they must move different knobs. Collapsing them means a dimension with poor
coverage automatically gets treated as one where the detectors are broken —
two very different situations, one of which is routine and one of which is a
bug report.

## Two outcomes: widen the band, or declare the dimension unmeasurable

The channel is more useful — and safer — when it can produce a second verdict
besides "give me more room."

**Widen.** The detector measured the wrong thing; grant a wider band and let
the correction move the number, still clamped.

**Unmeasurable.** The detector is blind here: the control exists but runs
through a channel this instrument cannot observe, so the computed value is
not a low measurement, it is an absent one. The right response is to exclude
the dimension and renormalize the composite over what was actually measured,
publishing the dimension as not-applicable rather than as a floor.

Prefer the second wherever it fits, because it is the cheaper grant to make.
Exclusion cannot manufacture a high score — the most an attacker gains is the
removal of a penalty they were going to argue about anyway — while a widened
band directly buys movement in a number. And exclusion is more often the
*correct* correction: the classic detector failure is not mis-grading, it is
not seeing, and a system that can only respond by nudging the number will
publish an instrument artefact as a subject property.

Both outcomes live under the same budget, and both are suppressed together
when the budget is blown. An audit distrusted for over-flagging does not get
to keep its exclusions.

## All-or-nothing, not keep-the-first-N

If the model flags more dimensions than the budget allows, honour **none** of
them. Not the first N, not the N most confident, not the N most severe. None.

This is the rule practitioners argue with, so here are the two independent
reasons it is right.

**The evidential reason.** A self-audit claiming that most of the
deterministic layer is broken is not an audit that has earned more trust. It
is one of two things: a genuinely broken run — bad inputs, a failed
extraction, a mis-shaped context — or a capture attempt, where the cheapest
way to unlock more room is to declare the evidence invalid everywhere. In
*both* cases the correct response is identical and is not "grant most of the
requests": fall back entirely to the backbone, publish under base bands, and
raise the run for review. The audit channel exists to catch a specific,
narrow detector miss. A universal claim is not that signal; it is a claim
about the instrument, and an instrument that reports itself broken is a
reason to stop trusting the reading, not to widen it
([_laws: gate-sees-target_](../../_laws.md#gate-sees-target)).

**The structural reason, which is the stronger one.** *Any* keep-N rule
requires a tie-break, and every tie-break is a control surface the model can
steer. Keep the first N — the model orders its output. Keep the N with the
highest stated confidence — the model writes the confidences. Keep the N with
the longest justification — the model writes the prose, and length is exactly
the feature judgment models over-reward anyway. Keep the N with the largest
proposed delta — you have rewarded the most aggressive claims. There is no
tie-break that is not model-controlled, because everything the policy could
sort on came from the model. All-or-nothing needs no tie-break, so there is
nothing to steer, and that is the property being bought.

Write this reasoning down in the code that enforces it. It looks like an
arbitrary harshness to the next maintainer, who will "improve" it into
keep-the-first-two during a bug fix and quietly reopen the control surface.

Write down, too, what the budget is standing in for. The ideal handling of
"the detector is wrong" is not rationing — it is **corroboration**: re-run
the detector, or run an independent one, and let the evidence settle the
claim. Where the correcting stage receives already-computed signals and
cannot re-measure, corroboration is unavailable and the budget is the
enforceable half of the same principle. Saying so at the definition site
tells the next reader what would replace the budget if the architecture ever
allowed re-measurement, which is a better outcome than tuning the constant
forever.

## Disclose the budget in the prompt

Tell the model the rule: at most K dimensions may be flagged, and if more are
flagged, none count. This costs nothing and does real work.

For an honest auditor, disclosure improves the signal — it forces a
prioritization that makes the flag mean "this is the one detector I am
confident is wrong" rather than "here are some doubts." For a captured one,
disclosure removes the payoff of the obvious attack: flagging everything now
yields strictly less than flagging nothing. The incentive gradient points the
same way for both, which is the design goal. A defence that only works
because the adversary does not know about it is not a defence; here, knowing
about it makes the attack worse.

Set K small — one or two out of a full dimension set. K large enough that
"most dimensions" is within budget defeats the evidential argument above.

## Decision rules

- **When flags exceed the budget, honour none and mark the run for review.**
  The over-flagged run is itself a finding; do not discard it silently.
- **When a flag is honoured, require a justification and store it.** A
  widened band with no stated reason is unauditable, and the justifications
  are the raw material for fixing the detector — which is the channel's
  actual purpose.
- **When the same detector is flagged repeatedly across runs, fix the
  detector.** The channel is an instrument for finding backbone bugs; a flag
  that keeps recurring and keeps getting honoured means the system has
  learned something and not acted on it.
- **When flag rates spike after a prompt or model change, treat it as a
  regression in the audit channel**, not as a sudden improvement in the
  model's diagnostic ability.
- **When a run abuses the channel, shrink the budget or the widened band —
  do not delete the channel**
  ([_laws: deletion-is-not-repair_](../../_laws.md#deletion-is-not-repair)).
  Removing it does not fix the blind spots; it makes disagreement invisible
  instead of budgeted.

## When not to use this

Skip the channel entirely where the backbone is fully authoritative by
definition — regulatory checks, contractual thresholds, anything where "the
detector is wrong" is a claim to be filed as a defect rather than acted on
inside a scoring run. In those settings the model's disagreement still gets
recorded, but it never widens anything; it becomes a ticket. Also skip it
while the deterministic layer is young and genuinely unreliable: with a weak
backbone, flags will be correct constantly, the budget will bind constantly,
and you will be tempted to raise it until the guardband regime is gone.
Stabilize the detectors first, then open the channel to catch the residue.

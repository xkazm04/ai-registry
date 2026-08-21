---
layer: golden-path
type: golden-path
subject: hiring-policy-defaults-and-tiering
status: forged
use_when: [choosing the shipped defaults for a hiring system, deciding what hiring policy is set centrally versus per team, adding a threshold or a toggle that changes candidate outcomes, answering "what is our hiring policy" with something other than a document]
techniques:
  - automation-ships-off-by-default
  - organisation-baseline-with-a-team-override
  - per-role-family-threshold-overrides
  - a-default-is-a-policy-position
  - required-gates-declared-not-assembled-per-role
  - policy-version-sealed-into-every-decision
---

# Hiring policy defaults and tiering

There is a set of decisions an organisation must make **once, centrally, before any
individual requisition exists**: what the machine may finish on its own, where the bars
sit, which steps every hire must pass through, who may move any of it, and how a change
to any of it is recorded. This subject is about that set — its shape, where it is stored,
who owns each layer of it, and the single most consequential fact about it, which is that
almost nobody will ever change it.

That last fact is the whole subject. **Defaults are where hiring policy actually lives.**
Not in the policy document, not in the talent handbook, not in the training deck — in the
values the system was shipped with. A threshold set to a convenient number by whoever
wrote the configuration becomes the organisation's de facto standard, applied to every
candidate, for years, and no minute was ever spent deciding it. The decision was made; it
was just made by a stranger, in a hurry, for a different company.

## The naive reading, and why it fails

The naive reading is that a default is a convenience — a sensible starting value so the
product works out of the box, which serious users will tune. Three things are wrong with
it.

**Serious users do not tune.** Change rates on configuration defaults are brutally low
everywhere, and hiring configuration is worse than average because the people accountable
for the policy are rarely the people with access to the settings. The talent lead who owns
the fairness posture cannot find the screen; the operations person who can find it does not
believe the numbers are theirs to move. The shipped value survives.

**A default that can end an application is not a convenience.** A default that costs
throughput gets discovered and fixed, because someone complains the queue is slow. A
default that costs a candidate their application cannot be discovered at all — the
candidate does not know, the recruiter sees a shorter list and assumes the market was thin,
and the only person who could report the defect has been rejected by it.

**"Configurable" is not an answer to "is it right".** Shipping a dangerous behaviour and
calling it configurable moves the responsibility to a customer who has not read the
option and does not know it exists. The vendor of a hiring system does not get to
outsource a fairness decision to a checkbox nobody looked at.

## The one-sentence standard

**Every default that can produce an adverse outcome ships in the position that produces
none, so that turning it on is a recorded act with an owner.**

Everything else in this subject is machinery for holding that line while still shipping a
system people can actually use. It is not a counsel of caution. It is a claim about where
accountability comes from: an organisation running unattended rejection because it
decided to is answerable and can defend itself; an organisation running unattended
rejection because a checkbox arrived pre-ticked has nobody to put in the room, and
[no adverse outcome is solely automated](../_laws.md#no-adverse-outcome-is-solely-automated)
is unmeetable by a system whose adverse behaviour nobody chose.

The corollary is the asymmetry rule for defaults generally: **when a setting's two
positions have unequal consequences, the shipped position is the reversible one.**
Auto-advance ships on if you like — its failure mode is a person reading a résumé that
did not need reading. Auto-reject ships off, always, because its failure mode is a person
who never hears back and cannot appeal a decision nobody made.

## The four layers, and what belongs in each

Hiring policy configuration is not flat. It has four layers, and the discipline is
knowing which layer a given knob belongs to — because a knob at the wrong layer either
fragments the policy or ossifies it.

1. **The product's shipped defaults.** What the system does before anyone touches it. Set
   by the people who built it, changed by nobody, in force everywhere. This layer must be
   *safe*, not *typical* — its job is not to guess what most organisations want but to
   guarantee that an organisation which decided nothing has consented to nothing.

2. **The organisation baseline.** One configuration for the company: the thresholds, the
   automation posture, the required gates, the calibration reserve. This is the layer that
   answers "what is our hiring policy" with a value rather than an anecdote. Owned by a
   named person accountable for hiring fairness, not by a team.

3. **The team or department override.** A deliberate, inheriting deviation for one part of
   the organisation, expressed as a delta against the baseline rather than a fresh copy of
   it. Present because real organisations are heterogeneous; constrained because an
   unconstrained version of this layer is how a company ends up with forty policies and no
   policy.

4. **The role-family adjustment.** Bars that differ by occupation, because a threshold
   defensible for one kind of work is indefensible for another — a small set of named
   occupational families with named overrides, not a per-role free-for-all, which is what
   keeps the variation reviewable.

There is deliberately no fifth layer. **The individual requisition does not get to set
policy.** A hiring manager may write the brief, choose the rounds from the permitted set,
and describe the work; they may not lower the bar for automated action, remove a required
gate, or opt their requisition out of the calibration reserve. The moment policy is
settable at the requisition, there is no policy — there is a distribution of hiring
managers' judgment under deadline pressure, and the pressure only points one way.

## Inheritance, not fragmentation

The failure this tiering exists to prevent has a specific and recognisable shape: **every
team quietly running its own thresholds, with nobody able to state what the company's
policy is.** It does not arrive as a decision. It arrives as a series of reasonable local
adjustments — engineering runs a bit stricter, the support org runs looser because volume
is high, a regional team was set up during a launch and copied someone's numbers — and it
is discovered years later, usually by counsel, usually as the answer to a question the
company cannot answer.

The mechanism that prevents it is inheritance with resolution, not duplication. A team's
configuration is a *sparse* delta resolved against the baseline at read time, so that
changing the baseline moves every team that did not deliberately deviate, and the set of
deviations is enumerable in one query. A team configuration stored as a full copy of the
baseline is the same fragmentation with extra steps: it looks governed, it drifts
silently, and a baseline change reaches nobody.

Two rules keep the layer honest:

- **A deviation must be visible as a deviation.** Any surface that shows a team's
  effective policy shows which values are inherited and which were overridden, by whom and
  when. A number with no provenance cannot be reviewed, and unreviewable local policy is
  the thing this layer was supposed to make safe.
- **Not everything is overridable.** Some values are baseline-only by construction: the
  automation posture, the required gates, anything the law fixes for a jurisdiction. The
  set of overridable keys is itself part of the policy and is declared, not implied by
  whichever fields a form happens to render.

## Defaults as a review artifact

Because the shipped values are the operative policy, they deserve the review that policy
gets, not the review that constants get. Three practices make that real.

**Every default carries the reason it is that value, next to the value** — in the place
the value is defined, where the next person to change it will read it. "Thirty percent,
because below roughly this the calibration sample is too small to detect drift at our
monthly volume" is a decision; "0.3" is a number the next optimisation pass will quietly
halve.

**Changing a default is a change to policy and is reviewed as one.** It changes the
outcome of every future decision in every organisation running that version, so the
reviewer set includes whoever is accountable for the outcome, not only whoever is
accountable for the code.

**A new default is resolved at the point of use, never written into stored
configurations.** Materialising it into every saved row makes a dimension nobody set
indistinguishable from one somebody chose, moves every policy version at once, and can
invalidate stored shapes that were valid the day before. Leave the key absent and resolve
it when read, and you keep three distinguishable states — nobody decided, somebody decided,
and the value is malformed — which is the minimum vocabulary a governed setting needs.

**The whole policy must be readable in one screen by a non-engineer.** If answering "what
does this system do on its own, and where are the bars" requires reading code, the
human-oversight obligation is already unmet — oversight of a rule you cannot state is not
oversight. This is a hard constraint on the design of the configuration, and it is the
main argument for keeping the policy small: a policy with ninety knobs is not more
governed than one with twelve, it is less, because nobody has read it.

## Structural policy: gates are declared, not assembled

The bars are only half of what is set centrally. The other half is the **shape of the
process**: which steps every hire passes through regardless of who is hiring or for what.
A human screening step before any machine round, a human-approved offer, an adverse action
that only a person applies — these are not per-requisition preferences that most managers
happen to select. They are declared once as required, and the requisition composes its
loop from what remains.

The doctrine that makes such a declaration enforceable is **one step runs one activity.**
A step that bundles a screening call, a technical exercise and a culture conversation
cannot be checked against a policy that requires a human screen, cannot be scored against
a rubric, cannot be dropped without losing two other things, and cannot be audited,
because the record says one step happened and three did. Stacked rounds are convenient to
schedule and impossible to govern, which is why the retirement of stacked rounds is a
policy move rather than a scheduling preference. The design of the loop itself — what the
rounds should measure, how they sequence, how many are too many — belongs to the
neighbouring subject on interview round design; what this subject owns is only that the
*required* subset is declared centrally and cannot be assembled away.

## The seams

This subject is a hub, and most of its neighbours own something that is *configured* here
but *defined* elsewhere. Naming those seams precisely is part of the craft, because the
temptation is to re-teach the neighbour's standard inside the policy layer and end up with
two divergent versions of it.

- **What may be automated at all** — which cohorts are shielded, which verdicts are
  routable, what happens to an unclassifiable candidate — belongs to the
  automated-screening-fairness-gates subject. This subject owns only where the automation
  switch ships and who may move it. The seam is sharp: the gate decides what the toggle is
  *allowed* to enable; the default decides whether it is enabled to begin with.
- **How a human safely executes many adverse actions at once** — the approval token, the
  tie-safe cutoff, the drift check — belongs to bulk adverse action governance. The policy
  layer supplies the version those mechanics seal; it does not implement them.
- **The holdout reserve** — why a proportion of decisions is withheld from automated
  handling, how it is sampled, what it measures — belongs to selection score calibration.
  What lives here is that the reserve is a *default expressed as a number*, and that the
  number is policy: setting it to zero silently disables the organisation's only
  independent check on its own thresholds, which is why zero must be a deliberate,
  recorded act and never a value someone can reach by clearing a field.
- **The sealed decision record** — what is snapshotted, how it is chained, what it proves
  — belongs to decision audit and traceability. This subject owns the production of the
  one field that record cannot manufacture for itself: a stable, canonical version of the
  policy in force.
- **What the law requires per region** belongs to multi-jurisdiction hiring compliance.
  Where a statutory floor exists, it enters this system as a value that the baseline may
  raise and no lower layer may lower — a constraint on the tiering, not another tier.
- **Configuration storage, tenancy and access control** are ordinary engineering. What
  stays here is the judgment about *which* of those values is dangerous — a hiring judgment
  wearing engineering clothes.

## Versioning: the policy must be able to say which version it was

A policy that changes is only defensible if every decision it produced can be replayed
against the rules that were actually in force. That requires the configuration to have a
**canonical, stable, content-derived version** — one that is byte-identical for two
configurations that differ in no dimension anyone is using, and different the moment any
live dimension changes.

Two properties are hard-won and both matter:

- **Adding a new policy dimension must not invalidate existing approvals.** If the version
  is computed by serialising every field including the ones that are absent, then shipping
  a new knob changes the version for every organisation on earth, invalidating every
  in-flight approval and forcing a re-review of work nobody touched. Omit absent values
  from the canonical form and the new dimension is invisible until someone sets it.
- **Changing a dimension that is in use must invalidate them.** The mirror property, and
  the reason the version is not just a monotonically bumped integer someone forgets to
  bump. If the bar moved between the moment a human reviewed a cohort and the moment they
  approved it, the approval is about a different cohort and must be re-earned.

The version then travels: into the approval token, into every decision record, into the
audit export. This is what makes a decision replayable and what makes
[a verdict bound to what it judged](../_laws.md#a-verdict-is-bound-to-what-it-judged)
enforceable at policy scope rather than only at candidate scope.

## Failure modes this standard exists to prevent

- **The convenient constant** — a threshold set to a round number for a demo, never
  revisited, now the company's hiring bar.
- **Default-on adverse automation** — an irreversible action against a person, enabled by
  a value nobody chose, in an organisation with no record of choosing it.
- **The forty policies** — every team on its own numbers, none of them wrong individually,
  no answer to "what is our policy" collectively.
- **The copied baseline** — team configurations stored as full copies, so a central change
  reaches nobody and drift is invisible.
- **The requisition-level bar** — policy settable by the person under the most pressure to
  lower it.
- **The assembled-away gate** — a required human step that was technically optional, and
  so was optioned out on the requisition that most needed it.
- **The unversioned rulebook** — decisions defended a year later against today's
  thresholds, because nothing recorded yesterday's.
- **The knob that invalidated everything** — a new configuration dimension whose mere
  existence changed every policy version and forced a re-review nobody could explain.
- **The silent zero** — a calibration reserve or a confidence floor cleared to zero by a
  form, disabling a control with no event, no owner and no alert.

## The techniques

- [a-default-is-a-policy-position](techniques/a-default-is-a-policy-position.md) — the
  governing idea: how to choose a shipped value, and how to review one.
- [automation-ships-off-by-default](techniques/automation-ships-off-by-default.md) — the
  asymmetry rule applied to the switches that can end an application.
- [organisation-baseline-with-a-team-override](techniques/organisation-baseline-with-a-team-override.md)
  — the two-tier model, sparse deltas, and the resolution rule.
- [per-role-family-threshold-overrides](techniques/per-role-family-threshold-overrides.md)
  — occupational variation that stays reviewable.
- [required-gates-declared-not-assembled-per-role](techniques/required-gates-declared-not-assembled-per-role.md)
  — the mandatory shape of a hiring process, and one step per activity.
- [policy-version-sealed-into-every-decision](techniques/policy-version-sealed-into-every-decision.md)
  — canonical versioning that survives new dimensions and catches changed ones.

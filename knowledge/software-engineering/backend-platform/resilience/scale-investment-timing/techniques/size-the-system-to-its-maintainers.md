---
layer: technique
type: technique
subject: scale-investment-timing
technique: size-the-system-to-its-maintainers
status: forged
laws: [count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [a design is being sized for growth, the team operating a system has shrunk, delivery has slowed on a system nobody changed, deciding whether to consolidate or automate an operational surface]
---

# Size the system to its maintainers

**The maintaining headcount is a design input. Write it down beside the load figures,
and treat a fall in it as a design event.**

An established rule of ownership practice says a subsystem should not be allowed to
grow beyond what the team responsible for it can hold in their heads. That rule is
correct and it is usually applied in one direction only — as a constraint on the
system's growth. This technique supplies the other direction, which is the one that
actually bites: **the team's size is not a constant, and it far more often moves
down.**

## The clocks are mismatched, and that is the whole mechanism

Architecture moves on a multi-year clock. Headcount tracks funding, and funding moves
on a quarterly one. A reorganisation, a budget cycle, a shift in company priority or
ordinary attrition can halve the people responsible for a system in a period during
which the system itself does not change at all.

Nothing about the architecture was wrong when it was built. A design that thirty
people could operate comfortably was a good design for thirty people. The same design
operated by eight is a different object with the same shape: every boundary that
bought parallel work now buys coordination overhead against people who do not exist,
every service that had an owner now has a rota, and the operational surface that was
distributed across a large group is now held by a small one that also has a roadmap.

## What to count, and what not to

"Number of engineers" is the input everyone reaches for and it is the less useful
half. What determines whether a system is operable is the **operational surface per
maintainer**: how much a single person must hold to be useful during an incident at
three in the morning.

Count the things that must be understood, not the things that exist:

- independently deployable units, and the order they must be deployed in
- distinct datastores, and the consistency relationships between them
- external integrations whose failure modes must be known
- distinct runtimes, languages and build toolchains
- on-call rotations the person appears in, and the runbooks they are expected to know
- the number of places one change must land to be complete

Divide by the people genuinely available to operate it — not the headcount on the org
chart, which includes people who have never deployed this system and will not be woken
for it. That ratio is the number this technique governs, and like every number that
travels it carries its predicate per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate): what was
counted, over what period, and who was included in the denominator. A maintainer count
that quietly includes a shared platform team is the same failure as a ceiling without
its axis.

It is a derived value and it names its recomputation per
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation).
Recompute on any staffing change large enough to notice, at every reorganisation, and
whenever a new deployable unit or datastore is added. The recomputation is minutes of
work; its absence is why the ratio is usually discovered during a resignation.

## The diagnostic: over-built or under-staffed

These two conditions produce **identical symptoms** — slow delivery, services nobody
owns, alert fatigue, changes that need three people in a room — and they have opposite
remedies. Nearly every organisation defaults to reading the symptoms as a people
problem, because the people are the part that is visibly struggling.

The discriminator is a comparison, and it needs the number to have been written down
at design time, which is the practical argument for writing it down at all:

> Compare the operational surface per maintainer **now** against the same ratio when
> the system was designed. If the surface grew, the system is over-built. If the
> denominator shrank, the system is under-staffed. If both, say both, and say which
> moved further.

The remedies diverge from there. An over-built system is consolidated — boundaries
merged, deployable units combined, an operational surface deliberately made smaller
than the design once justified. An under-staffed one is either restaffed, automated
down, or handed to somebody else, and if none of those is available the honest move is
to shrink the system's ambition rather than to keep reporting the gap as a morale
issue. The structural half of consolidation — which boundaries are cheap to remove and
which are load-bearing — is
[module-design](../../../../engineering-process/codebase-stewardship/module-design/module-design.md).

## Generation capacity and operating capacity are different, and only one of them moved

The obvious current objection is that a small team with capable agent assistance can
produce and maintain far more than a small team could before, so the ratio has moved
and the constraint is looser than it was. Half of that is true and the half that is
not is the important one.

Cheap authorship raises how much code a team can **produce**. It does not, on its own,
raise how much a person can **hold** — the mental model needed to judge whether a
proposed change is safe, to know which of six services is implicated by a symptom, or
to make a correct decision under time pressure with a customer waiting. Those remain
bounded by one person's attention, and an operational surface generated faster than it
can be understood is a surface that will be operated by people who do not understand
it.

So the input this technique takes is the **operating** capacity, not the producing
one, and a team whose output has risen sharply without a corresponding rise in
comprehension has moved further from this technique's constraint rather than closer to
it. The delivery-side consequences of cheap authorship — verification throughput,
review capacity, what a machine-authored change costs to check — belong to
[machine-paced-delivery](../../../../engineering-process/continuous-integration/machine-paced-delivery/machine-paced-delivery.md);
what this technique contributes is the reminder that its gains do not transfer
automatically to the incident path.

## When not to apply it

**When the maintaining team is genuinely stable and funded.** Some systems sit inside
organisations with a long, credible commitment to staffing them. Write the number
down, recompute on schedule, and do not manufacture a design event out of ordinary
turnover.

**Not as an argument against every boundary.** Boundaries have real payoffs and this
technique is easily misused as a licence to collapse a system into one unit because
the team is small. The claim is that the operational surface must fit the operators,
not that fewer boundaries is always better — a single unit that no one can safely
change is also unoperable.

**Never as an input to a staffing recommendation.** This technique reads the headcount
as a constraint on design. It does not get to argue about who should be hired, which
team should own what, or how an organisation should be shaped. Where the analysis
concludes that the system cannot be operated by the people who have it, the output is
a design decision and a stated risk — not a proposal about people.

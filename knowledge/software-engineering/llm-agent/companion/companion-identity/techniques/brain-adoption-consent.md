---
layer: technique
type: technique
subject: companion-identity
technique: brain-adoption-consent
status: forged
laws: [gate-sees-target, failure-not-empty-success, unknown-is-not-a-value, one-validation-door]
shared_with: []
use_when: [a second application finds a companion brain already on the machine, deciding whether an agent may read a memory it did not write, adding a consent gate to a memory that already has users, offering a companion that works with no memory at all]
---

# Adopting a mind that is already there

A companion's self is a folder on somebody's machine, and folders outlive the
application that wrote them. So the second surface that wants a companion on that
machine does not arrive at an empty disk — it finds a self already standing,
with a constitution, a written identity and a year of episodes. What it does next
is a **consent decision**, and this technique is that decision: how to look
without creating, what the person is actually being asked, what counts as having
already said yes, and what the companion is when they say no.

The naive reading is that this is a detection. The code looks, finds a brain,
and starts using it, because the brain is right there and remembering is
obviously better than not remembering. That reasoning is precisely what makes it
a failure: it pulls a self accumulated in one context into a different one — a
work surface, a shared machine, an application the person has just installed and
does not yet trust — and nobody was asked. The memory is not the application's
to adopt. It belongs to the person, and it was written under a different roof.

## Looking must not create

The first obstacle is structural, and it is why most systems never ask the
question at all: **the ordinary read path creates.** A well-built brain module
routes every reader through an `ensure`-shaped function that seeds the tree when
it is missing, which is correct everywhere except here. Under that design,
*looking* births the thing the question was about, and a probe that creates has
already answered the question it was sent to ask.

So exactly one door is exempt, and its exemption is its whole contract: **a probe
that creates nothing, opens no index, and treats an absent brain as an answer
rather than an error.** It returns the small set of facts a person needs in order
to decide, and nothing else:

- **Whether a brain is present at all** — an identity, a law, or an episode
  directory is enough; the probe does not require a complete tree before it will
  admit one exists.
- **How much is in it**, as a count that is deliberately **capped**. A person
  reads "hundreds of memories" exactly as well as an exact five-digit count, and
  the walk should not pay for precision nobody uses. The cap has a consequence
  the presentation layer must honour: a count *at* the cap means "at least this
  many", and rendering it as a number the system knows is wrong converts a bound
  into a false fact ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
  Say it in words.
- **How much of a self is written down** — a section count over the self-model,
  which distinguishes a brain that was created last week from one that has been
  lived in.
- **Whose law it is running on**, derived from a marker each application stamps
  into the baseline constitution it ships.

That last field is **provenance, not authorship**, and stating it that way keeps
it honest. The verdict the caller needs is "was this mind made somewhere else",
and a brain another application wrote and a brain the person rewrote by hand
answer that identically — both are a self this application did not author. A
marker is sufficient evidence for a question that coarse, and trying to sharpen
it into real authorship attribution buys nothing the decision uses.

The probe's output crosses a process or network boundary before a human sees it,
so it is shaped rather than trusted at the far side, and an unrecognisable
payload resolves to **no brain**. That is the conservative direction: the person
is then offered creation, and creation is idempotent and overwrites nothing.

## The question, in its three shapes

The probe decides which question is asked, and there are only three.

**A brain is present** — offer to connect to the one that is there. **No brain
exists** — offer to make one. **Memory is already on for this surface** — ask
nothing and say so. That third case is not a courtesy; a control offering to
connect what is already connected is a control with nothing to do, and a person
who presses it and observes no change has learned that the consent question is
decorative. A fourth outcome, the probe failing, is stated as a failure to look
and lets the person past.

Two rules bind every shape of the question. **Never offer a second brain
alongside the first.** One mind per person per machine is the doctrine of
[one-mind-many-mouths](./one-mind-many-mouths.md); a second tree started because
the first was somebody else's splits the companion's continuity in two, and
neither half is the companion afterwards. And **the step never blocks** — a
consent question that will not let the person past is not a question, it is a
toll.

## Implicit consent comes only from your own writes

An application that adds a consent gate after it has shipped has installs whose
people have been using the memory for months. Switching those off because a new
column is null is a regression wearing a safeguard's clothes. So the rule has a
second arm: **existing use is consent.**

The whole difficulty is in what counts as use, and there is exactly one correct
answer — **records that only this application's own write path could have
produced, carrying its own scope.** Not "a brain exists". A brain that exists
because a different application made it is somebody else's mind, and its
existence enables nothing at all; keying the implicit arm to it reproduces
precisely the silent adoption the gate was built to stop. The evidence must be
the application's own episodes, tagged with its own tenant or workspace, so that
another team's memories in the same folder on the same disk grant nothing here.

The arm has to be cheap, because every turn asks it — one indexed count, not a
scan — and it has to be *stable under refusal*. That property is worth checking
deliberately rather than assuming: with memory off no episode is written, so
nothing accumulates that the implicit arm would later read as a yes. An implicit
arm keyed to something the memoryless path still touches is a gate that opens
itself on the second turn, and nobody notices, because the observable behaviour
is a companion that remembers — which is what everyone expected in the first
place.

## There is no stored "declined"

Skipping stamps nothing. The pressure to add a third state is constant and it
should be refused: a null record and an explicit refusal **behave identically**,
since both mean memory is off and no write happens, and persisting the
distinction is therefore a claim about which one a pre-existing null was. Every
row that predates the gate is a pre-existing null. Writing "declined" over one is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) at its most
ordinary: an absent answer rendered as a definite one, at exactly the boundary
where the system stopped knowing.

State the cost rather than hiding it. A person who declines is asked again the
next time the question naturally arises, because nothing remembers that they said
no. That is the right trade while the question is rare, cheap and re-askable. It
stops being right the moment the surface starts nagging — and the remedy then is
to ask less often, not to record a refusal you cannot tell apart from silence.

## Memory off is working software

The third rule is what makes the refusal honest, and it is the one most often
skipped, because a memoryless companion looks like a broken one to the engineer
building it. **It is not a degraded mode. It is a mode.** The companion answers,
keeps every rule it is bound by, and is recognisably itself. It simply has no
accumulated self to read — and, critically, **it does not acquire one by
accident.**

That clause carries all the engineering content. A memory-off turn must not read
the identity documents from the brain either, because the read path creates: a
companion that loads its constitution from disk in order to behave correctly has
just birthed the tree the refusal was about. The **shipped** baseline
constitution and an empty self-model skeleton stand in — the same texts a first
run would have written — so behaviour is unchanged and the disk is untouched.
This is the one place a second copy of the law is legitimate, and it is legitimate
because it is not a copy: it is the source the seeded file would have come from,
read from the application's own package rather than from the person's folder.

The surface then **says so, in one quiet line**, in the same register as the rest
of its status, naming where the switch is. Two disciplines sit behind that line.
A limitation with no stated remedy reads to the person as a defect. And "it
remembered nothing" and "it may not remember" are different facts of which only
one is fixable, so the mode travels in the payload as its own field and is never
inferred from an empty recall result
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Where the rule lives, and when it is checked

Consent is one function that every turn passes through
([one-validation-door](../../../../_laws.md#one-validation-door)), on the side of
the boundary that can see both arms — the explicit record and the application's
own writes. A companion process spawned per turn usually cannot see either, so
the caller resolves the rule and ships the answer as a flag, and an **absent**
flag means yes, which keeps every caller written before the gate existed
behaving exactly as it did.

The check happens where the write happens, not where the person answered. A
choice made in a wizard some minutes ago is a proposal about the disk; the state
of the disk at the moment of the write is the guarantee
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Re-probe at
execution. And **create first, record second** — consent stamped before the brain
exists names a mind that may never have been made, and a stored yes pointing at
nothing is worse than no record, because everything downstream believes it.

Note the two scopes are different and must stay different. The brain is a fact
about the **machine**; the consent record is a fact about the **tenant or
surface** that agreed. Storing consent as a machine-wide fact silently answers
for tenants that were never asked.

## When not to use this

A companion whose memory lives inside its own application's private storage has
nothing to find and nobody to ask: its first run is creation, not adoption, and
the consent question it should be asking is a different one. Likewise a
server-side multi-tenant assistant — the question there is data-processing
consent, asked at a different layer and about a different asset.

This technique also stops short of what the companion may *conclude* about the
person once it does have a memory. Consent to keep a memory is not consent to be
profiled from it; the evidence bar, the citation shape and the separate opt-in
for behavioural synthesis belong to
[operator-profile-synthesis](./operator-profile-synthesis.md).

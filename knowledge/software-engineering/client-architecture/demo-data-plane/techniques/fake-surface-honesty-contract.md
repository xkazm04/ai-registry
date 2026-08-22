---
layer: technique
type: technique
subject: demo-data-plane
technique: fake-surface-honesty-contract
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [shipping a fabricated surface a customer can reach, deciding whether a demo may render a badge or alert count, a real tenant reported numbers that do not match their account]
---

# The fake-surface honesty contract

The contract is a **closed set of obligations** a fabricated surface must meet.
Closed, and written down, because the moment disclosure becomes a matter of
taste, the next contributor's taste differs and the clause they drop is the one
that mattered.

Two directions of harm define it. A viewer must never mistake fabricated data
for real data — that is the disclosure half. A real tenant must never be shown
fabricated data at all — that is the containment half, and it is the half teams
do not design for, because it feels impossible right up until the first fallback
is added.

## The seven clauses

**1. A persistent visible marker.** The surface says it is a demo, on every
screen, permanently. Not a modal the viewer dismissed four screens ago, not a
line in a footer below the fold. The marker sits in the product's own chrome —
beside the identity, in the navigation, wherever a real account's name would
be — because that is the region a viewer reads to answer "whose data am I looking
at." The test that matters is the screenshot test: a viewer will encounter this
surface as a cropped image in a document, and the marker must survive the crop
of the region that is being demonstrated. A marker that only exists at the top
of the page fails that test for every screenshot of anything below it.

**2. Never auto-entered.** The demo is reached by an explicit act and by nothing
else. No inference from an empty dataset, no fallback when a request fails, no
"this visitor seems anonymous" heuristic, no remembered preference. Every one of
those is the same bug: a viewer who did not ask for fabricated data receives it,
and receives it in the moment they are least equipped to notice — a new tenant
during onboarding, or an existing one during an outage. Emptiness and failure
are different facts and both are honest to render
([_laws: failure-not-empty-success_](../../../_laws.md#failure-not-empty-success));
substituting fixtures for either destroys the fact and fabricates a replacement.
Availability is the other side of this clause: the demo is *always* offered
where a signed-out viewer would otherwise see a locked door, because a demo that
is hard to find gets replaced by a fallback that is automatic.

**3. Not persisted across sessions.** Entry lives in session state and dies with
it. A demo that survives a reload or returns days later puts a viewer in a state
they did not choose and do not remember, which is precisely the state in which
somebody screenshots a number and sends it to a colleague as fact.

**4. Excluded from indexing.** The demo route is kept out of search indexes and
out of link previews. Otherwise the fabricated surface becomes the product's
public face: a search result whose snippet quotes an invented metric, indefinitely,
with the product's name above it.

**5. Lying controls are removed, not disabled.** A sign-out for a session that
was never signed in. A save that will not persist. An invite that sends nothing.
A billing page for an account that does not exist. The instinct is to render
them disabled, "so the demo shows the full product." A disabled control makes a
claim — *this exists and you may not have it* — and invites a click that will
never be answered; an absent one asks nothing and misleads nobody. Removal is
also the honest signal about the session's nature: the absence of a sign-out is
how a viewer learns they were never signed in. The removal leaves a hole in the
chrome, and the best thing to put in it is the **conversion action**: where a
real session offers the identity control, the demo session offers the way to
become a real account, on every screen. That turns the most awkward clause of
the contract into the surface's strongest affordance — the viewer who is
convinced is one click from an account, from wherever they were convinced.

**6. The data source is named in the interface.** Wherever the product would
name a real source — a connection, a workspace, an account, an environment —
the demo names itself, in the viewer's own language, unmistakably. A viewer who
goes looking for "where is this coming from" must find an answer, not an
ambiguity. The strongest form is a value shaped like the real one and impossible
to mistake for it: where a real deployment shows an address, the demo shows an
address that announces itself as fabricated. It fits the surface's existing
layout and type, so it needs no special rendering, and it is unambiguous in a
screenshot. This is disclosure, not dispatch: it is a descriptive value the
surface renders, and no consumer branches on it.

**7. No fabricated count on any surface that provokes an action.** This is the
clause with teeth and it outranks the others, including how complete the demo
looks.

## The count rule, and why it outranks the rest

A badge on a navigation item, an alert tally, an unread marker, a "needs
attention" chip, a health indicator — these are not decoration. They are
**instructions**. Their entire purpose is to move a person toward a screen and a
task, and they work: a viewer who sees a red badge counting three incidents goes
and looks at the three incidents.

A count is meaningless without its predicate
([_laws: count-carries-predicate_](../../../_laws.md#count-carries-predicate)), and a
fabricated count's predicate is *nothing at all*. So the harm is not that a
number is decorative and wrong. The harm is that a real customer, on a real
screen, sees a badge counting incidents in a fleet they operate, believes their
fleet has incidents, and acts — investigates, escalates, wakes someone. That is
the incident this whole subject exists to prevent, and it is caused by one
plausible-looking integer.

The rule, therefore: **a surface that provokes an action renders a count only
when it can name what was counted.** In the fake plane it may render the demo
world's honest count, since the demo world is a declared, coherent world and the
number is a true statement about it. In any other plane it renders **nothing**
until a real source answers — not a zero, not a placeholder, not a plausible
small integer, not a value carried over from the last tenant.

Three corollaries that are the same rule in other clothes:

- **A comparison series with no real counterpart stays empty.** Drawing a
  fabricated "previous period" line over a genuine current one is the most
  persuasive lie a chart can tell, because the fabricated series is what the
  reader is looking at when they decide whether things are improving.
- **A trend with no synced source shows no trend.** A sparkline invented to fill
  a tile communicates a direction, and direction is what people act on.
- **A panel with no faithful source renders in the demo and nothing at all
  otherwise.** Not a skeleton that never resolves, not lorem-shaped filler — the
  panel is absent, and the layout is built to be correct without it.

## Where the contract is enforced

Not in review. Review catches the clause the reviewer remembers, and this
contract has seven of them.

**Gate on the declared plane, never on the shape of a result.** Every conditional
that decides whether to render fabricated content reads the session's plane
**first**, as its outermost term. The instant emptiness appears at the top of one
of those conditions, the containment half of the contract is gone, and it is gone
for the exact audience it was protecting. Write the condition so that the honest
branch is the default: real mode renders whatever the real source said, including
nothing.

The distinction that keeps this rule usable rather than absolute: an emptiness
test *nested inside* the demo branch is harmless and often right. Choosing to
show real data to a demo session that happens to have some, and the fixtures
otherwise, is a choice between two honest sources within a plane the viewer
explicitly entered. What is forbidden is emptiness *promoting* a session into
the fake plane. The shape of the condition carries the whole rule: plane
outermost, everything else beneath it.

**Assert it end to end, against the shipped artifact.** A test that drives the
real product into the demo and asserts the marker is present, the lying controls
are absent, the data source is named, and no fabricated badge appears — and,
from the other side, that a real session with an empty dataset renders empty
rather than populated. These assertions are cheap, they are the only thing
standing between a refactor and a leak, and they must run against the artifact
that ships rather than against a demo-only build, or they are testing a proxy
for the thing they exist to protect.

**Name the harm at the site.** The one comment worth writing in this whole
subject sits at each suppressed surface and says what the number would have made
someone do. A rule with its consequence attached survives a cleanup; a bare
conditional with no explanation is deleted by the next person simplifying the
component, who will reasonably conclude the branch was defensive noise.

## When not to use it

There is no case where a fabricated surface a user can reach is exempt from the
contract. There are cases where clauses are *satisfied differently*: a demo
behind an internal-only deployment still needs the marker and the count rule,
because screenshots escape, but the indexing clause is moot. A demo route in a
public repository that nobody hosts still needs the count rule and the marker,
because someone will host it.

The one place the contract genuinely does not apply is a fixture set consumed
only by tests, which no human reads and about which nobody forms a belief. That
is the neighbouring subject's ground, and importing these obligations into it is
pure cost.

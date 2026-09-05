---
layer: golden-path
type: golden-path
subject: demo-data-plane
status: forged
use_when: [shipping a demo, tour or sandbox built on fabricated data, an unauthenticated visitor must see a fully populated product, deciding whether a surface may render a fixture-derived number, documentation screenshots need a populated account]
techniques:
  - one-interface-many-planes
  - runtime-dispatch-not-build-flag
  - fixture-self-consistency
  - seeded-determinism
  - network-faithful-mocks
  - fake-surface-honesty-contract
---

# The demo data plane

A demo data plane is a **second, fully functional data source living inside the
shipped product**: a fabricated world served through the same interface the real
world is served through, so that every screen, every chart, every list, every
loading state and every empty state works for a viewer who has no account, no
tenant, and no data of their own.

Almost every product eventually ships one. A sales team needs a populated
account to walk a prospect through; documentation needs screenshots of a product
in use rather than of an onboarding wizard; a public repository needs to run for
someone who cloned it two minutes ago; a product tour needs numbers on the
dashboard. Each is the same engineering problem wearing different clothes, and
each is usually solved twice, badly, by different people.

It deserves a subject because it asks for two things that pull against each
other. The fake plane must be **faithful enough to be the product** — the same
interface, the same latency shape, the same failure modes — because a demo that
behaves differently from the real thing teaches the viewer something untrue and
rots the instant the real client changes. And it must be **contained
absolutely** — no real tenant may ever be shown a fabricated number, and no
viewer may ever mistake fabricated data for their own. Fidelity pushes toward
making the fake indistinguishable; containment demands that it be unmistakable.
The subject is the set of moves that get both at once, and the reason teams get
neither is that they never noticed there were two goals.

## The naive shape, and the three bills it comes with

The naive shape is a flag read from the environment, checked wherever data is
needed, returning objects assembled at the call site. It works on the first
screen and fails in three predictable ways.

**The numbers move.** Fixtures drawn from an unseeded random source, or from the
current time, produce a different world on every render. The viewer opens two
tabs and sees two different companies; the screenshot in the documentation does
not match the page it documents; a demo walked twice in one meeting shows
different revenue. Nobody files this as a bug, because each individual number
looks plausible.

**The surfaces disagree.** One screen hand-writes a list, another a chart, a
third a detail page — each plausible alone, and together a world where the
header's totals do not add up from the rows beneath them and clicking a row
reaches something that was never meant to be its child. A fixture set that
contradicts itself is worse than no fixture set at all: an empty product is
honest about being empty, while an incoherent one asks the viewer to believe
something and then, screen by screen, withdraws it.

**The fake escapes.** This is the expensive one, and when it happens it does not
look like a data bug — it looks like a customer acting on information. The
classic form is a fallback: *if the real fetch returns nothing, show the
fixtures, so the page never looks broken.* A brand-new tenant, whose account is
legitimately empty, now sees a populated product, and a monitoring surface shows
them a badge counting incidents that do not exist in their fleet. They act on
it. The cost is not a support ticket; it is the customer's belief that the
product's numbers mean anything.

Every technique in this subject exists to kill one of those three.

## Where this subject stops

Four neighbours own adjacent ground, and the seams are worth stating precisely
because three of them look like this subject from a distance.

**Test fixtures** are the closest relative and the most important distinction.
[Test-harness](../../engineering-process/build-and-release/test-harness/test-harness.md)
owns fixture economics through
[fixture-economics](../../engineering-process/build-and-release/test-harness/techniques/fixture-economics.md)
— building an environment once and copying it per test, keeping the template
fresh, seeding through the product's own write path — and all of that concerns a
fixture consumed by an *assertion*, which never reaches a human. The moment a
fixture set becomes a **product surface**, every obligation changes. A test
fixture may be ugly, inconsistent between suites, and named after its index, and
none of it matters because nobody believes it. A demo fixture is read by a person
deciding whether to trust the product, and is therefore governed by coherence,
determinism and disclosure rules no test fixture has ever needed. The rule for
picking: if the only consumer is a test, it is the neighbour's; if a human looks
at it and forms a belief, it is this subject's.

**Hosting somebody else's live application** is
[embedded-preview](../../integration/embedded-surfaces/embedded-preview/embedded-preview.md), whose
guest is *real* — separately served, separately built, with its own process and
its own trust boundary — and whose problem is talking to it safely across a
frame. This subject's fake plane is neither separate nor live: it is the
product's own code, in the product's own process, serving invented data. Nothing
here crosses a trust boundary; everything here crosses a *truth* boundary.

**Numbers presented honestly** belong to
[measurement-honesty](../../engineering-assessment/measurement-method/measurement-honesty/measurement-honesty.md),
which governs real measurements whose evidence is thinner than their rendering
suggests — a rate over four samples, a rollup missing three inputs, a tally that
can only be an undercount. Its whole apparatus assumes there *is* an underlying
truth and asks how much of it the number has earned. This subject governs numbers
with **no underlying truth at all**, where the honest disclosure is not a sample
floor or a confidence band but the fact that the entire plane is invented. The
two meet at exactly one rule, which this subject enforces rather than derives: a
real tenant's empty dataset renders as empty, never as fixtures. The adjacent
question of whether an outward-facing figure was derived from the shipped
artifact or typed by a person belongs to
[public-claim-provenance](../../ui-surfaces/published-surfaces/public-claim-provenance/public-claim-provenance.md);
a hand-authored figure on a marketing page is a claim about the real product and
is not a demo fixture, even when both are written by hand.

**Whether a feature is available** is
[plan-entitlements](../../operations/service-operations/plan-entitlements/plan-entitlements.md),
including its
[deployment-mode-short-circuit](../../operations/service-operations/plan-entitlements/techniques/deployment-mode-short-circuit.md)
— a build that sells operation rather than capability opens every gate. That is a
decision about *feature availability* and it never touches provenance. A demo
viewer may well see every feature open; the question this subject answers is
where the bytes behind those features came from, and who may be told they are
real.

## The interface is the contract, and parity is a type error

The structural commitment everything else rests on: there is **one declared
interface** describing what the product can ask for, and each data plane is a
complete implementation of it. Not a subset — a complete implementation. A
consumer holds the interface and cannot tell which implementation it received.

The payoff is that parity stops being a review comment and becomes a compile
error. The interface carries no method saying which plane is active — with one
condition, stated in the technique: when fabricated values can arrive in the
same result as real ones, provenance moves onto the value as a required field,
because there is no longer a session to carry it. Add a capability to the real client and every other plane fails to
satisfy the interface until it too can answer. Without that, the fake plane
decays by omission: the real client grows three methods, the fake one grows
none, and the demo breaks on exactly the screens that were added most recently
— which are the screens most worth demonstrating. This is
[one authority per vocabulary](../../_laws.md#one-authority-per-vocabulary)
applied to the client's surface, and the test for whether a product has it is
mechanical: **delete a method from the fake plane and see whether anything
fails before runtime.** The mechanics — where the interface lives, what belongs
in it, and the third implementation almost every product eventually needs —
are [one-interface-many-planes](./techniques/one-interface-many-planes.md).

Three planes, not two, is the usual steady state. Alongside the fake plane and
the full live client there is typically a **read-mirror**: a reduced client
that can answer queries from a secondary store but cannot perform writes. Its
existence forces a decision the two-plane design lets you dodge — what an
implementation does when it genuinely cannot honour a method. It refuses,
loudly and by name. It does not return an empty success.

## The plane is chosen at runtime, and that costs something

The choice of plane is made **per call, from live session state** — not by a
build variant, not by an environment variable read once at module load. The
demo is a route the product serves and a choice a visitor makes, in the same
artifact that serves real tenants.

State the cost plainly, because a technique that hides its price gets adopted by
people who would have declined: **the fake plane and its entire fixture set ship
to production.** They occupy bytes in the payload, they are readable by anyone
who looks, and they are a live code path in the artifact that serves paying
customers. That is a real cost, and it is not the largest one available.

The alternative — a demo build produced by a flag — buys a smaller production
bundle and pays for it worse. A build variant is a second artifact the pipeline
must produce, deploy and keep current, which means it drifts, and the demo
breaks in a way nobody sees until somebody demonstrates it. It cannot be
exercised by the tests that run against the artifact you actually ship, so the
contract keeping the fake surface honest goes unenforced exactly where
enforcement matters
([_laws: gate-sees-target_](../../_laws.md#gate-sees-target)). And it makes the
demo a *place* hosted elsewhere rather than a door inside the product, so a
visitor who is convinced cannot become a customer without leaving.

Runtime dispatch also buys the property that makes containment tractable: the
plane is a function of state you can inspect, assert on, and render. A build flag
is invisible at runtime; a session field can be shown to the viewer, tested end
to end, and refused where it must never be true. The dispatch point, what the
session state may and may not be derived from, and the one-way doors between
planes are
[runtime-dispatch-not-build-flag](./techniques/runtime-dispatch-not-build-flag.md).

## A fixture set is a world, projected once

The rule that separates a demo people trust from one they quietly stop using:
**every fixture projects from one source**. There is a single declaration of the
world's entities — the accounts, the people, the devices, the documents,
whatever the product is about — and every other fixture is derived from it. The
chart of activity per entity is computed from the roster. The detail page is a
lookup into the roster. The counts in a header are a fold over the same rows the
table below renders. Nothing is re-declared, ever.

The failure this prevents is not exotic; it is the default outcome of adding
demo data screen by screen. The second author writes a plausible list for their
own screen because the first author's fixture was in a file they did not think
to open, and the world quietly splits in two. It is
[one authority per vocabulary](../../_laws.md#one-authority-per-vocabulary) again,
and it carries an identity obligation with it: an entity's identifier is minted
once in the root declaration and carried by every projection, never re-derived
from position in an array or from a display name that a copy edit will change
([_laws: identity-survives-reuse_](../../_laws.md#identity-survives-reuse)).
Projection order, what belongs in the root, and how to make the root's
authorship obvious to the next contributor are
[fixture-self-consistency](./techniques/fixture-self-consistency.md).

The world must also be *inhabitable*. A roster of ten tidy rows certifies nothing
about the shapes the product must survive — the entity with no activity, the name
long enough to wrap, the record missing its optional fields, the state that only
occurs after a failure. Build those into the root, because the demo is the only
population most viewers will ever see, and a demo composed entirely of happy
paths sells a product that does not exist.

## Determinism is a viewer-facing property

Fixture variation is desirable — a demo where every row holds the same number
looks like a placeholder — but it must come from a **seeded generator**, so that
the same world is produced on every render, in every tab, on every machine, on
every reload.

The reason is not engineering tidiness: it is that viewers **compare**. They open
the demo in two tabs, they screenshot it and set the screenshot beside the live
page, they walk the same tour twice in one meeting, they send a colleague a link
and describe what to look at. Every one of those is a comparison a
non-deterministic fixture set fails, and each failure reads to the viewer as the
product being unreliable rather than the demo being carelessly built. The seeded
stream is also a stored derivation and must name its recomputation, because a
fixture set nobody can regenerate is one nobody dares to change
([_laws: derivation-names-recomputation_](../../_laws.md#derivation-names-recomputation)).
Seed placement, the inputs that must never enter the stream, and the difference
between deterministic and static are
[seeded-determinism](./techniques/seeded-determinism.md).

## A fake plane that never fails teaches a false product

The fake plane returns instantly, always succeeds, and hands back the same
objects it holds. All three are wrong, and each one hides a class of defect
until a real user finds it.

Returning instantly means the loading states are never rendered, so nobody
notices they were never built, and the first real network delay produces a blank
region the team has never seen. Always succeeding means the error branches are
dead code in the demo and untested everywhere
([_laws: failure-not-empty-success_](../../_laws.md#failure-not-empty-success)).
Handing back the held object means a consumer that mutates its result silently
corrupts the shared fixture for every subsequent screen — a bug that presents as
"the demo gets weird after you use it for a while" and is nearly unfindable
because it depends on what the viewer clicked.

So: simulated latency in a plausible band, per-call defensive copies, a way to
provoke errors deliberately, and writes that pass the same validation the real
plane applies. The bands, the copy discipline and the write-path rule are
[network-faithful-mocks](./techniques/network-faithful-mocks.md).

## The honesty contract

Everything above makes the fake plane good. The contract makes it *safe*, and it
is a closed set of obligations rather than a sensibility — a checklist, because
the moment it becomes a matter of taste the next contributor's taste differs and
the clause they drop is the one that mattered.

Six of the clauses are ordinary disclosure hygiene, each with a specific failure
behind it: a **persistent visible marker** in the product's own chrome, because
the surface will be encountered as a cropped screenshot; **never auto-entered**,
because every inference from an empty dataset or a failed fetch hands fabricated
data to the one audience that must not have it; **not persisted across
sessions**, because a demo that survives a reload is a state the viewer forgot
they were in; **excluded from indexing**, so the fabricated surface never becomes
the product's public face; **lying controls removed rather than disabled**, since
a disabled control still claims the feature exists and invites a click nothing
will answer; and the **data source named in the interface**, wherever the product
would name a real one.

The seventh has teeth, and it outranks every other consideration including how
complete the demo looks: **no fabricated count on any surface that provokes an
action.** A badge, an alert tally, an unread marker, a "needs attention" chip —
these are not decoration, they are instructions, and a viewer who cannot see
whose fleet they describe will act on them. A count is meaningless without its
predicate ([_laws: count-carries-predicate_](../../_laws.md#count-carries-predicate)),
and a fabricated count's predicate is *nothing at all*. Where a plane cannot
supply an honest number for an action-provoking surface, the surface renders
nothing — not a zero, not a placeholder, not a plausible small integer. The full
contract, the reasoning behind each clause, and how to hold it by assertion
rather than by review are
[fake-surface-honesty-contract](./techniques/fake-surface-honesty-contract.md).

## Failure modes of the naive reading

- **"Fall back to demo data when the real fetch is empty."** This is the single
  most expensive line in the subject. It conflates *this tenant has no data*
  with *we could not load this tenant's data* with *this viewer is exploring*,
  and it resolves all three in favour of showing invented numbers to the one
  audience that must never see them. Gate on the session's declared plane, never
  on the shape of a result.
- **"It is obviously fake, look at it."** Obvious to the author, who knows. Not
  obvious to a viewer who arrived from a link, and not obvious at all in a
  screenshot, which is how most people will encounter it. Disclosure travels with
  the pixels or it does not travel — which is also why a banner is a fine first
  clause and a poor whole contract: it is dismissed, cropped and scrolled past,
  and it does nothing about the badge on the navigation.
- **"The demo build keeps the fake code out of production."** It also keeps the
  demo out of your test pipeline and out of your deploy cadence. Choose which
  risk you prefer with both costs on the table, rather than by reflex.
- **"Fixture data is throwaway."** Demo fixtures are read more times, by more
  people making higher-stakes judgments, than most production code. They earn the
  same review, the same ownership, and the same coherence rules.

## What good looks like, compressed

- One declared client interface; every plane implements it completely, and a new
  method breaks the fake plane at build time.
- The plane is resolved per call from live session state, and can be inspected,
  asserted on, and rendered to the viewer.
- One root declaration of the demo world; every other fixture is a projection
  of it, carrying identifiers minted in the root.
- All fixture variation comes from a seeded stream with a named recomputation;
  two tabs agree.
- Simulated latency, per-call copies, provocable errors, and writes that meet the
  real validation.
- A persistent marker, an explicit entry, no persistence across sessions, no
  indexing, lying controls removed, the data source named — and not one
  fabricated count on any surface that asks a viewer to act.

## The techniques

- [one-interface-many-planes](./techniques/one-interface-many-planes.md) — one
  declared interface, complete implementations, parity as a build failure, and
  the read-mirror that refuses rather than empty-succeeds.
- [runtime-dispatch-not-build-flag](./techniques/runtime-dispatch-not-build-flag.md)
  — resolving the plane per call from session state, what that costs, and why
  the cost is worth paying.
- [fixture-self-consistency](./techniques/fixture-self-consistency.md) — one
  root declaration of the world, every other fixture projected from it,
  identifiers minted once.
- [seeded-determinism](./techniques/seeded-determinism.md) — variation from a
  seeded stream, the inputs that must never enter it, and determinism as a
  property the viewer checks.
- [network-faithful-mocks](./techniques/network-faithful-mocks.md) — simulated
  latency, per-call copies, provocable failure, and writes through the real
  validation door.
- [fake-surface-honesty-contract](./techniques/fake-surface-honesty-contract.md)
  — the closed set of disclosure obligations, and the rule that no fabricated
  count may appear on a surface that provokes an action.

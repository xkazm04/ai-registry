---
layer: technique
type: technique
subject: build-economics
technique: dev-variant-design
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [choosing the default variant for daily work, default quietly reverts to the expensive build, green test on a build that never ran the code]
---

# Dev-variant design

Feature gates (see capability-feature-gating) are the mechanism; the **variant
is the product**. A variant is a named, supported combination of gates,
settings, and profiles that a developer invokes as one command — and the
central design act is choosing the *default*: the variant people run without
thinking, whose cost is the de facto build tax of the whole team. This
technique is about designing that default deliberately, routing work to
variants explicitly, and keeping each variant's blind spots written down.

## The default is a frequency argument

The default variant should cover the overwhelming majority of daily work at
the lowest cost that covers it. The reasoning is arithmetic, not taste: if 95%
of iterations touch surface logic, state, wiring, and storage — and 5% touch
the heavy gated subsystems — then a default that includes the heavy subsystems
taxes 95% of iterations for the benefit of 5%. The correct default is the
*lite* variant, and the correct posture is stated as policy: **default to
lite; switch to full when your task is on the full-only list; the switch costs
one recompile of the gated units.**

Getting the default adopted is part of the design. Developers follow the path
of least surprise: the lite variant must be the shortest command, the one in
the onboarding text, the one example everyone copies. A cheap variant that
exists but is not the default saves nobody anything.

## The routing table

Alongside the variants lives a routing table: *which kind of work needs which
variant*, in one authoritative place, phrased by task rather than by flag
("working on semantic search → full; everything else → lite"). Its absence has
a specific failure signature — a developer either pays for the full build
permanently "to be safe" (the default silently reverts to expensive), or gets
twenty minutes into a lite-variant session before discovering their code path
is compiled out. The table also names the switch cost both ways, because a
developer who knows crossing over costs one bounded recompile treats variants
as a dial; one who has been surprised treats them as a minefield.

One authority, though: the routing table, the variant definitions, and the
build entry points must derive from the same source or reference each other.
A routing table maintained by hand next to independently maintained variant
definitions is two copies of one vocabulary, and they will disagree exactly
when a new gate is added — which is the moment the table is consulted.

## Honest blind spots — documented, not discovered

Every variant below full has blind spots: capabilities that are compiled out,
code paths that cannot execute, integrations that are stubbed. The lite
variant is *honest* when those blind spots are enumerated where the variant is
defined — "this build cannot exercise X, Y, Z" — so a developer verifying a
change knows whether their verification means anything. The dishonest version
is silent: a test that passes on lite because the code under test never ran,
a demo on the lite build that "proves" a gated feature works, a bug closed as
unreproducible because the reproducer needs the full variant. What the cheap
build cannot see must be written down, because a green result on a variant
that cannot exercise the target is a gate that never saw its target.

The same honesty applies to *fidelity* differences short of absence: a dev
profile with optimization off, checks on, and instrumentation enabled has
different timing, different memory behavior, and occasionally different bugs
than the release shape. Performance conclusions drawn on the dev variant are
provisional by default, and the variant map should say so.

## Keeping variants few and alive

Variants multiply combinatorially if allowed — each new axis (gates × profile
× instrumentation × target) doubles the space. Hold the *named, supported* set
to a handful: a lite daily driver, a full variant, possibly a test-focused
variant with instrumentation hooks, and a release shape owned by the release
pipeline. Every named variant carries two ongoing duties: something routine
**builds it** (an unbuilt variant rots into a broken command someone hits at
the worst time), and something **measures it** (each variant has its own cost
curve; the lite variant's advantage over full is a number that should be
re-earned occasionally, because if the gap has collapsed, the complexity of
having two variants is no longer buying anything).

Retire variants that lose their constituency. A variant kept "because it
might be useful" but unbuilt and unrouted is not an option — it is a latent
support incident with a name.

## When the variants form a ladder, three rules change

Everything above assumes a *set* of variants distinguished by which subsystems
they contain, routed by the kind of work in hand. A different shape appears
when the variants are ordered along one axis — most often startup or build
cost traded against steady-state performance — and are named by position
rather than by content: rung zero, rung one, rung two, rung three. A ladder is
not a routing-table problem, because there is nothing to look up: a consumer
picks a rung by how much they are willing to wait. Three of the rules above
change shape, and one of them inverts.

**The default rung is chosen by constituency, and when the constituency is
operators the frequency argument points the other way.** The "default to lite"
conclusion is not a preference for cheapness; it is arithmetic over who runs
the build and how often. Where the variants ship to *developers*, the
overwhelming majority of invocations are iterations and the cheap rung wins.
Where the same ladder ships to *operators*, the overwhelming majority of
invocations are long-lived production processes that pay the expensive rung's
cost once at startup and recover it on every request afterwards — so the
default is the expensive rung, and the cheap rungs are the ones a reader must
opt into for debugging. Same reasoning, opposite answer, because the
denominator changed. State the constituency next to the default; a ladder
whose default was inherited from someone else's constituency is the failure
this rule exists to prevent.

**A rung sets defaults; an explicit setting always wins.** In the set shape a
variant is a command and the question does not arise. In a ladder it arises
constantly, because a rung is a *bundle of underlying settings* that remain
individually addressable, and a reader will inevitably pick a rung and then
override one thing inside it. Write the precedence down where the ladder is
defined — explicit beats rung, always, with no exceptions and no warning —
because the alternative is a reader who cannot tell whether their override
took effect, and the debugging session that follows costs more than the
feature saved. The corollary is worth stating too: every rung's effect must be
reachable by setting the underlying knobs by hand, or the rung is not a preset,
it is a hidden code path.

**A rung may be deliberately empty, and that is a design act rather than an
oversight.** The top rung of a ladder can be documented as currently identical
to the one below it, reserved for optimizations that are too slow or too
experimental to enable yet. This looks like clutter and is the opposite: it
gives future expensive work a name that consumers are *already* targeting, so
the work lands without a migration and without anyone having to re-choose a
rung. The condition that makes it honest is disclosure — the document must say
the rung is currently equivalent, or a reader will measure the two, find no
difference, and conclude the ladder is decorative. An undisclosed empty rung is
a broken promise; a disclosed one is an option with a published strike price.

What does not change is the blind-spot duty. A cheap rung disables checks,
instrumentation or whole compilation stages, and a conclusion drawn on it —
especially a performance conclusion — is provisional in exactly the way this
technique already says it is.

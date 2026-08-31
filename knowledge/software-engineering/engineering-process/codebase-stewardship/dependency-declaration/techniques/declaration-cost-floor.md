---
layer: technique
type: technique
subject: dependency-declaration
technique: declaration-cost-floor
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [adding the first dependency to a project requires choosing and configuring a build pipeline, deciding whether a capability belongs in the platform or in a dependency, newcomers stall at the point of reusing something, judging whether a mechanism's tooling requirement is proportionate]
---

# The declaration cost floor

One number describes a declaration mechanism better than any qualitative account
of it:

> **What does it cost to add the first dependency to a project that has none?**

The first is the one that matters, because it is where every fixed cost of the
mechanism is paid at once — the tool to choose, the configuration to write, the
build step to introduce, the deployment change to make. The second dependency
costs almost nothing by comparison, which is precisely why teams that already have
a working setup cannot see the number and consistently underestimate it.

## Advanced tools for advanced needs is correct

The rule this technique rests on is a distinction, not a complaint about tooling.

Requiring specialist tools for specialist needs is entirely right. Optimisation,
static analysis, strict typing, cross-target packaging, staged deployment — these
arrive later in a project's life and later in an author's learning, they are
genuinely complex, and demanding a real tool for them is proportionate. **Nobody
is owed a zero-config path to an advanced capability.**

The defect is narrower and worth stating exactly: **a foundational capability
whose price of admission is an advanced tool.** Reuse is not an advanced need. It
is roughly the second thing anyone does, it is the mechanism by which everything
else gets built, and a system in which it is the expensive step has put its cliff
at the point where the most people are standing.

The diagnostic question is about *ordering*: in a healthy system, does
optimisation come after composition, or is it the entry fee for it? Where
optimisation tooling must be adopted before the first dependency can be used, the
sequence has inverted, and every later stage inherits the inversion.

## Make the number countable

Do not estimate it. Count it, against a stated predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)), because
the estimate is always made by someone whose setup already exists:

**Predicate: starting from an empty project, what is required before one line
that uses a third-party unit will run?**

- **Decisions** the author must make before proceeding — which tool, which
  configuration format, which output mode. Count decisions with no obvious default
  separately: those are where people stall, and they are not proportional to their
  number.
- **Files** created or edited that are not the author's own code.
- **Concepts** that must be understood to make the above choices correctly, rather
  than by copying.
- **Steps** that must be repeated on every subsequent build or deploy.

Four decisions and three configuration files to use one utility is a number worth
having in a design discussion. "It's a bit of setup" is not.

Two corollaries fall out of the count. First, **a mechanism that requires a
generator to be usable has not achieved a low floor** — it has moved the cost from
the author's understanding into a tool's, which is a real improvement for the
second dependency and no improvement at all for the first. Second, the number is a
property of the *default* path, not of the best available one. If a low-cost route
exists but the ecosystem's documentation assumes the expensive one, authors pay the
expensive one; the floor is what people actually encounter.

## The inversion an expensive floor causes

The cost does not stay contained, and this is the part that makes it a design
concern rather than an onboarding one. When declaring a dependency is expensive,
the system routes around it, in two directions that compound:

**Capabilities migrate into the platform.** Things that should have been ordinary
shared units get absorbed into the standard library or the runtime, because that is
the only way to make them cheap to use. The platform grows surface it did not need,
on a slower release cadence and with stronger compatibility obligations than a
replaceable unit would have carried.

**The platform starts being designed around the workaround.** This is the
expensive one. Once the pipeline is universal, the platform can no longer rely on
its own primitives behaving predictably — the tool rewrites references, moves
files, and erases the identity of locations — so new capabilities get designed to
work *through* the tool rather than through the primitives it disturbs. Features
arrive in shapes that make no sense from the platform's own model and only make
sense given the intermediary, and each one deepens the assumption that the
intermediary is present.

That is the terminal state worth naming: **a system where the workaround is
load-bearing, and its own primitives are the special case.** From there the floor
cannot be lowered by improving the mechanism, because the rest of the design has
been fitted around its absence.

## The floor is a product decision, not a purity contest

The point is not that dependency-free is virtuous, and a system that makes
dependencies *hard* has not made them safe — it has made them expensive, which is
a different thing and mostly costs the people least equipped to pay. Nor is the
answer to eliminate tooling: tools that are optional and additive are exactly
right, and the failure mode is specifically the mandatory one.

The claim is narrow. **The floor should be low enough that "should I take this
dependency?" is answered on the merits of the dependency** — its size, its
maintenance, its licence, its fit — rather than on the cost of the mechanism that
would admit it. When the mechanism's cost dominates that decision, the mechanism is
making architectural choices that belong to the author, and it is making them in
the direction of less reuse and more duplication.

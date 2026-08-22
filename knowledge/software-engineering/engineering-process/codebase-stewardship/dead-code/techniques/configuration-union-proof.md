---
layer: technique
type: technique
subject: dead-code
technique: configuration-union-proof
status: forged
laws: [deletion-is-not-repair, gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [deleting code in a codebase with compile-time capability gates, a reachability report was produced under one build configuration, deciding between removing a symbol and exempting it]
---

# Configuration-union proof

Reachability is not a property of a codebase. It is a property of a codebase
**as compiled under one configuration**. Wherever capability gates, platform
branches or target selection remove whole regions from a build, the analyzer
sees the region that survived preprocessing and is silent — not uncertain,
*silent* — about everything the configuration excluded. Its output reads
identically either way: a list of unreferenced symbols, with no field saying
which universe it was computed in.

So the candidate list from one configuration is a **sample**, and the deletion
it authorizes is a claim about a population it never observed
([a count carries its predicate](../../../../_laws.md#count-carries-predicate)).

## The measured failure

The shape, from a wave that deleted a large set of unreachable entry points and
everything the analyzer said they held up: verification ran under the default
configuration, where every gate in the repository stayed green. The shipping
configuration — the default plus two optional capabilities — then failed to
compile, in the dozens of errors, because roughly two dozen symbols had all
their consumers behind one of the excluded gates. Nothing was wrong with the
analyzer. It answered the question it was asked, over the code it was given,
and the code it was given was not the code that ships.

The generalization is blunt enough to hang on a wall: **a linter cannot see
code it does not compile, and neither can the person reading the linter's
output.**

## The rule

> A symbol is dead only if it is unreachable in **every** configuration
> anybody builds. Anything less is a sample, and a sample does not authorize
> a deletion.

Three practical consequences.

**1. Enumerate the configurations before you enumerate the candidates.** The
set includes the shipping configuration (frequently *not* the developer
default, which is usually the cheap one), each named tier, each platform
target, and — the one always forgotten — the **minimal** shape, where every
optional capability is off. That shape is often what a constrained target
builds and often what nothing has ever compiled.

**2. Compile the union before you believe the analysis.** Compilation, not
the full test suite: the failure class is "this shape no longer builds", and
a type-check pass catches all of it at a fraction of the cost. This belongs
in the automated pipeline as a standing matrix, but at minimum it is a manual
step in the deletion protocol — run *after* the deletion, *before* the change
is believed.

**3. Restore verbatim, not from memory.** When the union proves a deletion
wrong, recover each symbol from the pre-deletion revision rather than
reimplementing it. The restored code is then the code that worked, and the
diff of the restoration is reviewable as a restoration. Reimplementation
smuggles new behavior into a change everyone will read as an undo.

## Gate the symbol, do not exempt it

Once the union says a symbol lives only in some configurations, there are two
ways to make the analyzer stop complaining about the others, and they are not
equivalent:

- **Gate it** — the symbol exists only in the configurations that use it.
  Preferred, always. A symbol absent from a build cannot rot in that build,
  and its gate is a statement about where it belongs that the compiler
  re-checks on every run.
- **Exempt it** — the symbol is present everywhere and annotated as
  permitted-unused. This leaves the code compiled, unwatched, and quiet: the
  exemption suppresses exactly the signal that would have told you it finally
  died. It is the suppression surface growing by one, with all the rot that
  implies.

The field test that settles it: check whether the symbol's *readers* are also
gated. When every reader sits behind the same gate, the exemption idiom is
needed zero times — and a wave that reached for it repeatedly was reaching for
it because nobody had checked.

**Exemptions attached to a condition are worse than they look.** An annotation
whose condition is inverted suppresses in the shape that had nothing to say
and stays silent in the shape that warns — dead in one direction, useless in
the other, and indistinguishable from correct by reading. Compile both ways
rather than reason about it; a conditional suppression that has never been
observed doing its job is not doing its job
([the gate must see its target](../../../../_laws.md#gate-sees-target)).

## Attribute the survivors too

Not every deletion the union breaks was wrong. When the restoration lands,
say explicitly which removals were **left standing** because the compiler
judged them correctly in every shape, and why. Without that record the next
reader assumes the whole wave was reverted and re-deletes the genuinely dead
half a month later — the deletion protocol's attribution duty, applied to the
repair rather than to the original act. And a restoration that quietly brings
back a symbol which warned under *both* shapes before the deletion has
restored a real finding along with the fix
([deletion is not repair](../../../../_laws.md#deletion-is-not-repair), read
backwards: neither is an indiscriminate undo).

## When this does not apply

A codebase with one build configuration owes this nothing — the sample is the
population. The technique's cost scales with the size of the configuration
matrix, which is one more reason to keep that matrix small and named rather
than letting independent switches multiply. Where the matrix is genuinely
large, the honest minimum is the union of the shapes that are *built by
someone*: the shipping tiers and the minimal shape. Configurations nobody
builds are not part of the population, and pretending otherwise makes the
proof unaffordable and therefore skipped.

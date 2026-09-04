---
layer: technique
type: technique
subject: engine-host-contract
technique: spec-mirrored-hook-surface
status: forged
laws: [one-authority-per-vocabulary, silent-state-is-ungoverned]
shared_with: []
use_when: [designing the override surface an embedder customises an engine through, an embedder overrode a hook and conformance broke in a way the engine could not have detected, adding an engine-specific hook the specification does not name, reviewing whether a default implementation is the specification's or a convenience]
---

# Spec-mirrored hook surface

A language specification that expects to be embedded lists the operations it leaves to
the host. The list is short, it is named, and every entry carries requirements — some
hooks must be deterministic for a given input, some must never throw back into the
engine, some must give the same answer for the same pair of arguments on every call. The
requirements exist because the engine's own algorithms assume them: a module graph is
built on the promise that resolution is idempotent; a rejection tracker that throws
would surface an exception from inside a step the specification declares cannot fail.
The engine cannot verify a single one of them at run time. That is the design problem
this technique answers: where do obligations live that only the implementor can keep?

## One method per hook, named after the hook

The override surface is one trait or interface whose methods mirror the specification's
host-hook summary one to one, in the specification's own names or the closest the host
language allows. Not a struct of optional callbacks; not a builder with a method per
convenience; not a grab-bag of "customisation points" that grew as embedders asked. The
mirror is the point. A reader with the specification open finds the override for a
hook in one lookup, and a reader with the code open finds the specification clause in
one lookup, and neither has to trust the other's summary. Per
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary), the
specification's hook list is the authority on what the surface contains, and the surface
derives from it: an engine that adds a "convenient" second override for something a
specification hook already decides has two paths deciding one thing, and they diverge
the first time only one of them is updated.

The unit of the mirror is the host *decision*, and the specification sometimes spreads
one decision across several named operations. It defines an enqueue operation per job
kind — promise, timeout, generic, finalization cleanup — that differ in nothing but the
job's kind; it defines a get-properties operation and a finalize operation on the same
import-metadata object that one host will always implement together. Where that is the
case, expose one method, name in its documentation every specification operation it
stands for, and carry the difference as a closed variant type — a job enumeration, say —
that the host matches on. The rule is not "one method per specification heading"; it is
"one method per decision, and no decision split across two". A host that has to keep
five enqueue methods consistent with each other will not, and the specification's
requirements that span them (jobs run in the order they were enqueued, across kinds)
become the host's to reconstruct.

## The obligations sit on the override point

Each method's documentation carries a requirements section that restates, in the
engine's own words, what the specification obliges the implementor to keep true — and
states it as an obligation, not a description. "Must be deterministic for the same
source" and "must complete normally" are the register; "returns whether the source is
available" is not. The reason is the reader. An embedder overriding one hook reads the
one method they are replacing; they do not read the specification, the engine's
architecture document, or the other hooks. If the obligation is anywhere but on that
method, the embedder learns it from a conformance failure, and a conformance failure
caused by a host hook is the hardest class to diagnose because the engine's own test
suite passed. This is [silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)
at the override: the engine's assumption about the hook is internal state that shapes
correctness, and it is governed only once it is written where the implementor will read
it.

Three refinements make the section honest rather than merely present. Where the engine
discharges some of a hook's obligations itself — it prepares the realm and the active
script before every job, so an executor need only preserve order — the documentation says
which obligations are the engine's and which remain the implementor's, because a
restated list the implementor must guess their way through is read once and then
skipped. Where the specification restricts *who* may override — an operation only a
particular class of host should replace — the restriction is part of the obligation and
is written with it. And where the specification only recommends a default rather than
requiring one — a ceiling on buffer allocation, say — the recommendation is quoted beside
the number, so the embedder who raises it knows what they are trading.

## The default is the specification's default

Every method has a body, and the body is what the specification says happens when the
host has no opinion: the rejection tracker does nothing, source text is reported as
available, import metadata is an empty object, the job is enqueued on whatever executor
the context holds. A host that overrides nothing runs a conforming engine. Two rules
follow. First, the default must never be a *convenient* behaviour that the specification
does not require — a default that logs unhandled rejections to standard error is a
behaviour the host did not ask for and cannot remove without overriding the hook, which
means the engine has made a host decision. Second, a default that *cannot* satisfy the
specification is an error, not a placeholder: a hook whose only correct behaviour needs
something the engine does not have (a filesystem, a network) is defaulted to a failure
that names the missing capability, so the seam is visibly unfilled rather than
silently wrong.

## Engine-added hooks follow the same rule

An engine will need hooks the specification does not name — a way for the host to read
the current call depth, a hook to promote a host's typed error into a guest exception, a
value the host attaches to an import's metadata. Add them to the same surface, by the
same rule: an obligations section stating what the engine assumes, a default that
satisfies it, and a note saying the hook is the engine's own and which engine behaviour
depends on it. What must not happen is a second surface — a "host callbacks" struct
beside the "host hooks" trait — because the embedder then has to know which surface a
concern lives on, and the answer changes as the engine grows.

Engine-added hooks are also the ones that migrate. A hook that started on this surface
and turns out to belong to a seam of its own — the wall-clock reader that becomes one
half of a clock interface — is not removed; it is deprecated in place with a pointer to
where the concern now lives, and its body forwards there. The deprecation notice is the migration guide. The counterpart failure is an engine-added hook shipped with no obligations section at all,
because it was "obvious" — which is exactly the hook whose obligations nobody wrote down
and whose override will therefore break something.

## Decision rules

- When the specification names a host hook, expose exactly one override for it, named
  after the hook, because two overrides for one decision diverge on the first update to
  either.
- When the specification spreads one host decision across several operations, expose
  one method that names all of them and carries the difference as a closed variant type,
  because a requirement spanning the operations is otherwise the host's to reconstruct.
- When the engine discharges part of a hook's obligations itself, say which part, because
  a list the implementor cannot tell their share of is skipped whole.
- When an engine-added hook migrates to a seam of its own, deprecate it in place with a
  pointer and a forwarding body, because a removed override breaks every embedder at
  once and a deprecated one carries its own migration guide.
- When writing an override's documentation, restate the specification's requirements as
  obligations on the implementor in that method's own doc, because the embedder reads
  the method and not the specification, and the engine cannot check the obligation.
- When writing a default body, implement the specification's default and nothing more,
  because a convenient default is a host decision the engine has made without being
  asked.
- When the specification's default needs a capability the engine lacks, default to a
  failure that names the capability, because a silently wrong default passes every
  engine test.
- When the engine needs a hook the specification does not name, add it to the same
  surface with the same documentation shape, because a second surface makes the
  embedder guess which one a concern lives on.
## When not to use it

An engine for a language whose specification does not enumerate host operations has no
table to mirror, and inventing one from the engine's convenience points inverts the
technique: the surface becomes the authority and the obligations are whatever the engine
happened to assume. Such an engine should still document obligations on each override,
but it should not claim the mirror. Nor does the technique apply to a host's *own*
extension registry — a surface many contributors register against, where the host and
not a standards body authors the obligations; that is the agent-runtime neighbour's
honest-hook-registry, and it carries timeouts and failure lanes this surface has no use
for, because an engine cannot proceed without the answer a hook returns.

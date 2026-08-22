---
layer: technique
type: technique
subject: agent-addressable-ui
technique: opt-in-instrumentation-gate
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [deciding what a development-only capability may cost the product, a development config object gets reused by a production build, arguing to keep an instrumentation feature that nobody can price]
---

# Opt-in instrumentation gate

Development instrumentation survives in a codebase in proportion to how easy it
is to price. Anything with a nonzero cost gets renegotiated — at the next bundle
audit, the next build-time complaint, the next security review that notices
source paths in shipped markup — and eventually it loses one of those
arguments and is deleted. The gate exists so that the answer to "what does this
cost us?" is *nothing*, and so that answer survives inspection.

The target is not small. **The target is that a normal run and every production
build never load the instrumentation toolchain at all.** Zero is qualitatively
different from small: it needs no budget, no measurement, no benchmark to defend
it, and no exception in the release checklist. A capability that costs two
percent is a standing negotiation; a capability that costs nothing is furniture.

## Gate one: registration

The build transform is added to the build's configuration **only when a flag is
set**. Under a normal invocation the configuration does not mention it, the
build graph does not contain it, and its module is never required — so there is
no import cost, no dependency to install, no parse pass, and nothing to
discover when someone reads the config in six months and wonders what is
slowing the build down.

This is the gate that buys the zero. A transform that is registered and then
declines to act still costs its own loading, still participates in the build's
plugin ordering, and still shows up in any accounting of what the build does.
Registration-level gating is the difference between "runs quickly" and "does not
exist".

## Gate two: the transform re-checks

The transform itself reads the same flag on entry and returns its input
untouched when the flag is absent. This looks redundant and is not.

A build registration is *configuration*, and configuration does not stay where
it was written. It gets copied into a second config for a second target,
imported by a test runner, extended by a downstream tool, merged into a
deployment pipeline's build, or evaluated in a mode its author never enumerated.
Each of those paths can reach the registration without reaching the reasoning
that surrounded it. The second gate is the one that holds when the first is
bypassed by a route nobody classified, and it holds for a specific reason: it
observes **the actual invocation**, not the configuration's stated intent
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Gate one asserts
what should happen; gate two checks what is happening.

Both gates read one flag from one declaration. Two spellings of the flag name is
the classic version of this bug — the config checks one, the transform checks
the other, and the build appears to be instrumented while producing nothing
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

**Where the second gate sits inside the module decides whether it buys
anything.** The expensive part of instrumentation is not the transform's own
code, it is the compiler toolchain the transform drives — a large dependency
whose load time is measurable on its own. If that dependency is imported at the
top of the module, the gate below it saves only the transformation, and the cost
of loading the toolchain has already been paid by every build that merely
*reached* the module. Require it lazily, inside the branch the gate opens, and
the claim "the toolchain is never loaded" becomes literally true rather than
nearly true. This is the difference between the gate producing zero and the gate
producing small.

## Gate three: the overlay is application code

The transform runs in the build; the overlay runs in the product. They are
different artifacts on different sides of the boundary and they need different
gates. The overlay's gate is a build-mode check at the mount site — mounted only
outside production — so that the production bundle contains no overlay code, no
event listeners, and no path by which the capability could be reached.

Do not fold this into the flag. The flag is a per-invocation developer choice;
the production exclusion is an absolute property of the shipped artifact, and
tying an absolute to a variable is how the absolute stops being one.

## A runtime switch is not a gate

The tempting simplification is to ship everything and guard it with a condition
evaluated at runtime — a query parameter, a stored preference, an environment
value read in the browser. That is a *switch*, not a gate, and it fails on all
three counts the gate was built for: the code is in the bundle so the cost is
not zero; the code is reachable so the capability is an attack and surveillance
surface in the product; and source paths for your entire codebase are now
present in shipped markup, which is a disclosure nobody agreed to. The
distinction is worth stating as a rule: **a gate removes code from an artifact;
a switch chooses a branch inside one.** Instrumentation needs the former.

## The flag itself

Make it an environment value supplied at invocation, not an entry in a checked-in
configuration file. The choice is per-developer and per-session — one person
debugging one screen this afternoon — and a file entry is a choice that gets
committed, gets forgotten, and ends up on someone else's machine or in a
pipeline. An invocation-scoped flag also makes the relaunch instruction
possible, which the overlay's absent-instrumentation state depends on: there is a
single command a person can be told to run.

Name it for what it does rather than for the tool that reads it, and put the
exact relaunch command in three places that all derive it from the same
declaration: the build configuration's comment, the project's development notes,
and the overlay's own uninstrumented state.

## The cost of gating badly

Two failure modes are worth naming because they are opposite and both common.
A gate that is *too hard to reach* — a rebuild of a dependency, a config edit, a
second checkout — means nobody uses the capability, and an unused capability is
deleted with less discussion than an expensive one. A gate that is *too soft* —
a default-on flag, a mode inferred from something incidental — means the
instrumentation ships, and the first time it does the whole feature loses its
licence permanently. Aim for one command with one extra token in front of it,
and check the production artifact for the stamp attribute in the release
pipeline so the soft failure is caught by something other than luck.

## When not to use this

If the stamping is genuinely free — an attribute that would exist regardless,
or a build step whose cost is below measurement noise — the ceremony of a double
gate is worse than the thing it guards, and one production exclusion is enough.
The double gate earns its complexity when the instrumented path costs a full
extra parse of every module, which is exactly when the "what does this cost us"
conversation was going to happen anyway.

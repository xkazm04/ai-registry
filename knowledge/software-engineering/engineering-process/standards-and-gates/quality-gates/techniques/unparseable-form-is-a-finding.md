---
layer: technique
type: technique
subject: quality-gates
technique: unparseable-form-is-a-finding
status: forged
laws: [failure-not-empty-success, absent-guard-is-loud, gate-sees-target]
shared_with: []
use_when: [a source-pattern gate can be evaded by writing the same access a different way, deciding whether a check without a parser can block rather than merely warn, a gate reports a plausible complete answer over a language it only pattern-matches, choosing between improving a matcher and constraining what it must match, a negative-space rule is described as a ratchet against accident, a regex-based checker is being promoted from advisory to blocking]
---

# The unparseable form is itself a finding

A gate that matches source text carries a blind spot that its own output
never shows. The scan reads every file it was pointed at, finds nothing, and
exits clean — and the clean exit is indistinguishable from the one it would
produce over a codebase that genuinely complies, because the construct that
would have failed was written in a form the matcher does not recognise. There
is no could-not-run to route here
([gate-liveness](./gate-liveness.md) owns that case, and it does not reach this
one): the instrument did run, over inputs it parsed successfully, and returned
an answer that is wrong and confident.

[chokepoint-tag-registry](./chokepoint-tag-registry.md) states the classical
position on this and states it as final — a negative-space check implemented as
a source pattern match is defeated by a dynamic import, an alias, a re-export or
a computed name, and buying the stronger property means leaving the source layer
for a linker, a package boundary or a capability-restricted runtime. The
position is right about the *matcher* and wrong about the *gate*, and the
difference is what this technique owns.

## The asymmetry that makes the hole closable

The matcher cannot enumerate what it is hunting. It can enumerate how it can be
evaded, and those two sets have completely different shapes:

- **The target set belongs to the codebase.** Names, paths, symbols, keys — it
  grows with every commit, it is unbounded, and no finite pattern covers it.
- **The escape set belongs to the language.** The ways to reach a value other
  than by the literal form — destructuring, aliasing, spread, reflective access,
  enumeration of the container, a computed key — are fixed by the grammar. They
  are finite, they are writable down, and they do not grow when the codebase
  does.

So the gate stops trying to see through the escape and instead **refuses the
escape**: the presence of an unrecognised access form is itself a violation,
reported against the file, with the build red. The matcher does not become
complete. The *scanned world* becomes closed, which is the property the gate
actually needed — either every access is in a form the check can follow, or the
check says so out loud.

This is [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
turned on the gate's own reach.
[chokepoint-tag-registry](./chokepoint-tag-registry.md) already applies exactly
this move in the positive direction, where a renamed door must redden the gate as
a broken instrument rather than silently reclassify code as compliant. The same
move closes the negative direction; it was only ever missing because the escape
set was assumed to be as open as the target set.

## The precondition, and it is the whole boundary

**You must own the code being scanned.** The technique buys its closure by
constraining how the scanned file may be written, and a constraint is only
available where someone can be told to satisfy it. That precondition is not a
detail — it is the line between where this works and where the classical
position stands unamended:

- **Your own tree, a file with a named owner, a generated artifact** — the ban
  is enforceable, and the cost is a style rule the owner accepts.
- **A dependency, a vendored fork, a foreign repository under assessment, any
  tree you only read** — you cannot forbid a construct in code you do not
  control, so the scan stays a ratchet against accident and must be described as
  one. This is the case
  [evidence-scoping](../../../codebase-stewardship/codebase-scanning/techniques/evidence-scoping.md)
  is written for, and its rule — emulate the structure rather than approximate it
  with adjacency — remains the right answer there.

A gate that bans forms in a tree it does not own has not closed its world; it
has written a finding nobody can act on, which
[refusal-names-a-reachable-remedy](./refusal-names-a-reachable-remedy.md) rules
out on its own terms.

## What the refusal has to say

The ban is a false fail every time an author writes a legitimate construct the
matcher has simply not been taught, so the message carries both remedies and
does not pretend the matcher is sacred: *keep to the recognised form, or teach
the checker the new one.* Naming the second remedy is what keeps the rule from
calcifying into a style preference — the enumeration is the gate's own
limitation, openly, and extending it is a normal change rather than a defeat.

Two obligations travel with it, and without them the technique is worse than the
weakness it replaces:

- **The blanking pass must be verified, not assumed.** A matcher that ignores
  comments, strings and regex literals needs those regions neutralised first, and
  the neutralisation is itself code that can be wrong. Assert that it preserves
  offsets and line count, and assert that a mention of the banned form inside a
  comment or a string does *not* trip the ban — otherwise the gate's own
  documentation cannot describe it.
- **The ban needs its own false-positive fixtures.** The list of forbidden forms
  is a detector like any other and is subject to
  [false-positive-economics](./false-positive-economics.md); a ban that fires on
  the compliant form teaches the team the gate is noise, and it does it faster
  than an ordinary rule because the remedy looks arbitrary.

## What it does not buy

It is not containment. A determined author reaches the value through a
construct nobody enumerated, and the ban is silent about it exactly as the
original matcher was — the escape set is finite *per grammar*, not per
imagination, and a language with dynamic evaluation has an escape that cannot be
spelled out. What the technique converts is the **accidental** evasion, which is
the overwhelming majority and the one that ships: a maintainer refactors a
literal read into a destructure, no rule mentions it, and the check quietly stops
covering that file for a year. Where the property must hold against intent, the
classical answer stands and the boundary has to be bought somewhere the source is
not the authority.

The honest claim is therefore narrower than "a control" and much stronger than
"a ratchet against accident": within the enumerated grammar the gate is closed,
and the enumeration is auditable because it is finite and lives beside the rule.

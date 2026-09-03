---
layer: technique
type: technique
subject: build-economics
technique: capability-feature-gating
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [deciding whether a heavy capability deserves a build-time gate, everyone pays compile cost for a capability few ever touch, gated code rots because the default build never type-checks it]
---

# Capability feature-gating

Some capabilities cost far more to *compile* than their usage share justifies:
an inference runtime with a native acceleration library, a peer-to-peer
transport with its cryptography stack, an embedded media pipeline. When such a
capability sits in the default build, every developer pays its compile and
link cost on every iteration — including the majority who never touch it. The
technique moves the heavy capability behind a **build-time gate**: excluded
from the default variant, included in a full variant, selected by a flag at
build invocation.

## The switch-cost argument

The economics are a simple inequality. Without the gate, the capability's
compile cost is paid by *everyone, always*. With the gate, it is paid by *the
few who need it, when they cross over* — one recompile of the gated units at
the moment of switching variants, plus that variant's ongoing cost while they
stay there. The gate wins whenever

> (developers not needing it × iterations × per-build cost of the capability)
> ≫ (developers needing it × switch events × switch cost)

which for genuinely heavy, genuinely optional capability is not close — usage
shares under a quarter and per-build costs in whole minutes are typical. State
the switch cost honestly when advertising the gate ("crossing to the full
variant recompiles the gated subsystems once, ~N minutes"): a developer who
discovers the cost by surprise concludes the lite variant is a trap and stops
using it, which silently reverts everyone to the expensive default.

## Gate design rules

1. **Gates are additive, never subtractive.** A flag *adds* a capability to a
   working base; there is no flag whose absence breaks the default build. In
   ecosystems where enabling a feature anywhere in the graph enables it
   everywhere, subtractive or mutually exclusive flags produce configurations
   that exist only in the union of what several components asked for — a
   variant nobody chose and nobody tests.
2. **Tiers, not a flag soup.** Individual gates compose into a small set of
   named tiers — a default tier and one or two supersets — and the tier names
   are the vocabulary developers and build scripts speak. Ten independent
   flags is 1,024 configurations; nobody budgets, tests, or reasons about
   1,024 configurations. The tier definitions live in exactly one place, and
   every build entry point derives from it; a second hand-maintained copy of
   the tier list is a drift race.
3. **The cut respects the dependency graph.** A gate at the capability's
   consumption site while its heavy dependencies remain unconditional saves
   nothing — the gate must sever the *dependency edge*, so the heavy library
   is not merely unused but **absent from the build graph** in the default
   tier. Verify by inspecting what the default build actually compiles, not
   by trusting the flag's name.
4. **Runtime behavior at the gap is designed, not accidental.** The default
   variant must fail the gated capability's entry points explicitly — a
   clear "built without this capability" signal — rather than a missing
   symbol, a silent no-op, or a crash. A developer on the lite variant will
   eventually wander into gated territory; the gate decides whether that
   costs them thirty seconds or an afternoon.

## Keeping the gated side alive

Code that is compiled out of the default variant is code the everyday build
never type-checks. Left alone, it rots: an interface change on the shared side
breaks the gated side, and nobody notices until the next person pays the
switch cost and inherits a broken full build on top of it. The countermeasure
is mechanical: something routine — continuous integration at minimum, ideally
a scheduled or pre-release full-variant build — compiles **every tier**, so a
break on the gated side is caught the day it is made. A gate whose far side no
routine process observes is a gate that has stopped seeing its target.

The same duty covers the *combinations* that ship: each named tier is built,
not just the extreme ends. Feature unification means a tier's actual content
can differ from the sum of its parts as the graph evolves; only building it
proves what it contains.

## The second motive: buying a verification budget

The switch-cost argument prices a gate in *compile* time. There is a second
motive with the same shape and a different currency, and it is the one that
turns an unaffordable safety practice into an affordable one.

Some verification instruments cost one to two orders of magnitude in execution
time — a checker that re-executes the program's own semantic representation, a
runtime memory verifier, an exhaustive explorer of concurrent orderings. Over a
whole codebase that is not a lane anyone keeps; it is deleted after the first
week it makes the pipeline late. The way to afford it is not to make the
instrument cheaper, which nobody can do. It is to **shrink its target**:
concentrate the code that actually needs it — the manual memory management, the
hand-written synchronisation, the calls across a foreign boundary — behind one
build-time gate, so the expensive lane builds and runs only that variant and
sees a fraction of the tree.

The economics restate cleanly: without the gate, the expensive instrument's
cost is (whole tree × its multiplier), which exceeds the budget, so the
instrument is not run at all and the risky code is unverified. With the gate it
is (gated fraction × the same multiplier), which fits, and the risky code is the
part that gets verified. The comparison is not slow-lane versus fast-lane; it
is a lane versus no lane.

Three obligations come with this motive specifically:

- **The gate must be the verification boundary, not merely a compile boundary.**
  If the risky construct also appears outside the gated units, the expensive
  lane's clean result says nothing about those occurrences while looking like it
  covers them. Assert that the construct occurs only inside the gated units —
  that assertion is what makes the reduced target honest.
- **The default variant is the safe one.** The gated capability is the one with
  the sharp edges, so its absence must leave a working, conservative
  implementation behind — a slower path through a supervised interface rather
  than a missing symbol.
- **The rot-watch above is not optional here.** Everywhere else, an unbuilt
  gated side is a broken build discovered late. Here the gated side is the
  dangerous code, so a routine process compiles *and verifies* every tier, or
  the arrangement has quietly moved the risk somewhere nothing looks.

The same inversion applies to this motive as to the first, and it is already
stated at the end of this document: the gate is a ratchet on a self-inflicted
axis. If the risky code is not already isolable — if the boundary is tangled
through the codebase — the gate follows the tangle, the expensive lane's target
is the whole tree again, and the flag has bought nothing but a tier to maintain.
The compilation-unit split comes first, and it does most of the work.

## When not to gate

Gating has overhead — conditional compilation branches, a tier matrix, the
rot-watch above — so it is reserved for capability that is both heavy and
optional. Cheap-to-compile code is simpler left unconditional even when
optional; heavy code that *everyone* exercises daily belongs in the default,
because a gate nobody stays on the light side of is pure complexity. And a
gate is not an architecture: if the capability's boundary is tangled through
the codebase, the gate will be too — the compilation-unit split that isolates
the capability into its own unit usually comes first and does most of the
work.

Finally, keep the honest frame: **a gate is a ratchet on a self-inflicted
axis, not a law of nature.** The flag exists because the dependency graph
acquired heavy optional members; a codebase that keeps its variance at
runtime (configuration, adapters, a service boundary) instead of at compile
time has no flags to forget, no tier matrix to build, and no gated side to
rot. Before adding a gate, price the alternative of not taking the heavy
dependency at all — hosting the capability out-of-process, or behind a
runtime-selected implementation with a lightweight default. The cheapest
feature gate is the dependency you declined.

---
layer: technique
type: technique
subject: vendored-patch-stack
technique: least-invasive-carrier
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [deciding how a local change should be carried against a third-party tree, an upstream bump is producing more conflicts every release, someone proposes replacing an upstream source file with a modified copy, a local override stopped taking effect and nothing reported it]
---

# The least-invasive carrier

Before asking how to write a patch, ask whether the change has to be a patch.
Every local change is carried by some **mechanism**, and the mechanisms are not
equivalent: they differ by an order of magnitude in what they cost at the next
upstream bump. Ranking them and always taking the highest one that works is the
only lever that reduces the cost of *every* future bump at once, and it is
available exactly once per change — at the moment the change is written, before
anyone has anything to conserve.

The ranking, most preferred first:

1. **Your own code, calling upstream.** The behaviour lives in a first-party
   module that consumes upstream's public surface. Upstream can refactor its
   internals freely; nothing of yours is in the blast radius. Cost at a bump:
   zero, unless the public surface itself changed.
2. **An override upstream's own resolution already honours.** Many trees resolve
   a name through a search order, a mirrored directory, a registry, a plugin
   point, or a configuration layer. A file of yours placed where that resolution
   looks first wins without upstream's file being edited at all. Cost at a bump:
   zero for the mechanism, and non-zero only where the thing being overridden
   changed shape.
3. **A minimal mechanical edit at a seam, with the logic elsewhere.** Upstream
   is patched, but the patch is a hook: one call inserted, one symbol renamed,
   one guard added — a change with no logic in it. The logic lives in your code
   and is not exposed to upstream's refactors. Cost at a bump: a reoffset, and a
   port only when the seam itself is deleted.
4. **An in-place edit to upstream logic.** A real change to real upstream code.
   Cost at a bump: proportional to how much upstream touched that region, and
   unbounded when upstream restructures it.

And one option that is not on the ladder: **replacing an upstream file with a
modified copy.** It is the most tempting form because the resulting diff is
trivially small and the file is easy to read. It is the worst outcome available,
because the copy is frozen at the version it was taken from and stops receiving
every subsequent upstream change to that file — bug fixes, security fixes,
interface updates — with nothing anywhere reporting that it has fallen behind.
The patch keeps applying, the build keeps passing, and the fork quietly starts
shipping old code inside a new tree. Prefer rung 4 over a whole-file copy even
though the diff is uglier; the ugly diff is the thing that will conflict when
upstream changes, and conflicting is the desired behaviour.

## The decision rule

**Carry the change at the highest rung that can express it, and record the rung
in the change's ledger entry.** When a change is proposed at rung 4, the review
question is not "is this patch correct" but "what stops this from being rung 3" —
and the answer is often a hook upstream would accept, which is also the answer
that eventually retires the patch entirely.

The rule has a companion that is easy to skip: **the rung is re-asked at every
bump, not only at authoring time.** Upstream adds extension points, splits
modules, and exposes internals over time. A change carried at rung 4 for three
years is frequently expressible at rung 2 today, and the bump is when somebody
is already reading that code with its intent reconstructed — the cheapest moment
this question is ever asked.

## An override that stops overriding says nothing

Rung 2 has one failure mode, and it is severe enough to need its own check. An
override works because upstream's resolution finds your file *instead of* one of
theirs. When upstream deletes, renames, or moves the file being overridden, your
file is no longer in front of anything. It is not an error — resolution simply
finds nothing to shadow, or shadows a path nobody asks for any more. The build
succeeds, and the behaviour the override existed to provide is gone.

This is the shape [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)
describes: the mechanism degraded to *absent* silently, and absent looks exactly
like present-and-passing from outside. So an override mechanism requires an
inventory check that reads the tree rather than the intent
([gate-sees-target](../../../../_laws.md#gate-sees-target)): **for every file in
the override set, the upstream path it shadows exists in the materialized tree.**
An orphan is a hard failure at the bump, where the information to fix it is
still available, rather than a behaviour regression discovered by a user later.

The same check is why rung 2 needs a real behavioural verification recorded in
the ledger entry. "The file is present" and "the override took effect" are
different claims, and only the second one is worth anything.

## Ranking is also how a stack shrinks

A fork's patch count is not a fact about how much behaviour it changes; it is a
fact about which rungs it used. Two forks making the same set of changes can
differ by an order of magnitude in patch count, and the one with more patches
will be the one that becomes unable to take upstream releases. When a stack's
bump cost is growing, the productive intervention is almost never better
conflict tooling — it is a pass over the existing set asking which patches were
authored at rung 4 out of convenience and can be lifted, because each lift
removes a permanent recurring cost rather than a one-time one.

## When not to use it

When the upstream is pinned and will never move — a dead project, a frozen
release, a vendored copy taken deliberately as a final snapshot — the ranking
optimizes a cost that will never be paid, and rung 4 is simply the clearest way
to express the change. The ladder's entire justification is future bumps; where
there are none, take the most readable option.

Do not climb the ladder past the point where the change stops being
comprehensible either. A rung-2 override that reimplements half of upstream's
module through the resolution mechanism to avoid a three-line patch has traded a
cheap recurring cost for an expensive permanent one. The rung is a tiebreaker
among carriers that all express the change honestly, not a licence to contort
one.

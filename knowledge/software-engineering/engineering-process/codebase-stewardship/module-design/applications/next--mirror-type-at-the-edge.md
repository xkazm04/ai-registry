---
layer: application
type: application
subject: module-design
technique: mirror-type-at-the-edge
stack: next
status: forged
verified_on: 2026-09-04
verified_against: next@16.3.1
applied: code
ab_verdict: better
proof: ab-paired
---

# Next — a request-scoped cookie jar, and the branches behind it

A server-rendered React framework supplies the current request's cookies
through an ambient accessor rather than a parameter. The accessor is the
canonical host-bound input from
[mirror-type-at-the-edge](../techniques/mirror-type-at-the-edge.md): it reads
an async-local store the framework populates per request, and calling it
anywhere else throws by design — *"`cookies` was called outside a request
scope"*. There is no constructor, no fake, and no documented way to stand one
up in a unit process. `verified_against` is the framework version this tree's
`package.json` pins (`next@16.3.1`); the test runner is the one the repository
already ships.

## The measurement

The tree carried a four-verdict authorization gate for an internal operator
console — a decision whose whole subtlety is that "nobody has signed in yet"
and "someone presented the wrong token" must not render the same message, and
that an unconfigured environment must say so rather than pretend to be open
or under attack. The verdict was computed inline, immediately after the
ambient cookie read.

**Arm A** was not a prediction. A probe importing the gate function and
asserting each of its four verdicts was added to the repository's own unit
lane and run: **one of four passed.** The passing one was `not-configured`,
which returns *before* the cookie read; the other three threw the
out-of-request-scope error at the same line. Reachability stopped exactly at
the host-bound read — which is the technique's claim, measured rather than
assumed, and a sharper statement than "the file is untestable".

**Arm B** mirrored the cookie jar down to the single string the decision
actually reads (`{ expected, submitted }`, both plain optional strings), moved
all four verdicts into a pure function over that mirror, and left the ambient
read in place. Same runner, same lane: **four of four verdicts reachable**,
six assertions, and the whole unit lane still green at 221 files / 3040 tests.

The measurable is the technique's own: *branches of the decision the
project's own test runner can reach.* **1 → 4.**

## What the tree corrected in the technique

The technique says the shim that remains "contains no branches, because a
branch there is a branch nothing can reach." This tree produced a counterexample
that is worth carrying: the shim kept **one** branch, and keeping it was right.

The original short-circuited before touching the cookie accessor when the
console was unconfigured. In this framework, reading cookies is not free of
consequence — it opts the route out of static prerendering. A branchless shim
that read cookies unconditionally would therefore have changed the rendering
mode of an unconfigured route, which is a behaviour change smuggled in under a
testability refactor. So the shim retained the guard, and the guard decides
*whether to call the host*, not what the verdict is. All four verdicts still
live in the core, and the check that the extraction was honest is that no
`return` of a status remains outside it.

The refinement the technique should be read with: **the shim must take no
verdict branch.** "No branches at all" is the common case, not the rule. Where
touching the host has a side effect on the host — a prerender opt-out, a
transaction start, a permission prompt — a guard that avoids the call is part
of the shim's job and does not put a decision back into the untestable region.

## What this realization cannot do

The extraction proves the four verdicts; it does not prove the **wiring**.
Nothing in the unit lane checks that the ambient read actually pulls the right
cookie name, that the cookie is scoped and `httpOnly` as the surrounding code
claims, or that every route in the console calls the gate at all. Those are
properties of the shim and of the call sites, and they remain in the region
this technique deliberately empties of decisions rather than of risk — a
reader copying this pattern should expect an integration or end-to-end check
to still owe them the wiring.

---
layer: technique
type: technique
subject: ship-pipeline-gating
technique: preflight-before-an-expensive-cook
status: forged
laws: [structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a long content-conversion or packaging run is about to start, adding a check to an expensive pipeline, deciding where in a pipeline a check belongs]
---

# Preflight before an expensive cook

## The concern

An expensive stage — content conversion, full-tree recompilation under a shipping
configuration, artifact layout — reads a handful of declarations at its very end and
fails on them. The declarations were readable at rest, in milliseconds, before the stage
started. Preflight is the named practice of pulling every such check to the front, and
of stating the economics that justify it so nobody removes it as "trivia".

## The economic argument, stated once

A check placed before an expensive stage pays for itself when the expected cost it avoids
exceeds its own. With `f` the fraction of runs where the failure class occurs, `C` the
cost of the expensive stage, and `c` the check's cost: run it early when `f · C > c`.
For declaration-level checks `c` is milliseconds against a `C` of tens of minutes, so the
inequality holds for essentially any nonzero `f`. State this in the code comment. It is
the reason the check survives its first review by someone who thinks it is beneath the
pipeline.

## What belongs in preflight

Include a check when **all three** hold:

- It reads state that already exists, without producing anything.
- Its failure would otherwise surface only after the expensive stage has largely
  completed.
- Its verdict does not depend on any artifact the expensive stage creates.

The third is the test that keeps preflight honest. A check that needs the packaged output
is not a preflight check no matter how cheap it is; its placement is bounded below by
when its evidence comes into existence. Cheapest *capable* observer, not cheapest.

The recurring inhabitants:

- **Identity and naming declarations** the packager consults when laying out the
  distributable — an empty identifier string is a classic late failure.
- **Entry-point declarations**: a default starting scene or world, a default mode of
  operation. Unset means the packaged artifact starts into nothing — and note that the
  packaging run *succeeds*: this failure class is discovered by launching, never by
  packaging, which is why it belongs to preflight rather than to any post-stage check.
  Check the *referent*, not just non-emptiness: a declaration that names a target which
  does not exist on disk is a harder failure than one left blank, and only a resolution
  attempt distinguishes them.
- **Target declarations**: platforms, architectures, configuration names — each checked
  for being present and being one of the known set, not merely non-empty.
- **Toolchain reachability**: the build tool exists at the resolved location and is
  executable. Cheap, and it fails the expensive stage in the first second otherwise.
- **Source-level audits** that need no build (see the companion capability audit).
- **Downstream gate configuration**, parsed now so a later gate does not discover its
  own thresholds are unreadable at the moment it is asked for a verdict.

## Procedure

1. Enumerate the failure classes the expensive stage has actually produced — from its
   own logs, not from imagination.
2. For each, ask what the cheapest observer capable of seeing it is, and when its
   evidence first exists. That pair determines placement.
3. Implement each check as an independent rule that returns a structured result — rule
   identity, verdict, and a message naming the setting and the value found. A preflight
   that returns a single boolean is unusable: the engineer needs to know which of twelve
   rules fired without reading the source.
4. Run all rules and report all failures. Do not short-circuit on the first. The cost of
   the run is milliseconds; the cost of a fix-one-rerun-fix-the-next cycle is one
   expensive stage per rule.
5. Separate *fatal* from *advisory*. A missing entry point is fatal. A configuration
   that is unusual but valid is advisory: report it, do not block. Mixing these teaches
   people to bypass the gate.
6. Emit the whole result set even on success, so that a passing preflight is a record of
   what was checked rather than a bare green.

## Decision rules

- **When a check's evidence exists before the expensive stage, it runs before the
  expensive stage.** No exceptions for "it's already covered later".
- **When a rule cannot evaluate** — a file it needed is absent, a parse failed — that is
  neither pass nor fail but a third value, and it must render as unevaluated. A rule
  that silently returns pass when it could not read its input is worse than no rule.
- **When two checks observe the same failure class**, gate at the cheaper one and reduce
  the expensive one to the residue only it can see.
- **When a required environment is half-configured, treat it as unconfigured, not as
  partially usable.** Two settings that only make sense together resolve as a pair or
  not at all; a resolver that returns a half-populated environment pushes the failure
  into whichever gate happens to dereference the missing half first.
- **When a rule fires more than occasionally and is trivially auto-correctable**, do not
  auto-correct it inside the gate. Report it and let a separate, explicitly invoked
  action fix it — a gate that mutates the thing it judges has stopped being a gate.

## When not to use this

- When the expensive stage is not actually expensive. Under a minute or so, the
  ceremony costs more than it saves and a single ordered run is clearer.
- When the check requires the expensive stage's output. Then it is a post-stage gate;
  forcing it early produces a check that reads stale artifacts from the previous run and
  reports last week's verdict as today's.
- As a substitute for the later gates. Preflight proves that the declarations permit a
  build to be attempted. It proves nothing about what the build produces, and a pipeline
  that treats a green preflight as licence to skip artifact-level gates has confused a
  statement about inputs with a statement about output.

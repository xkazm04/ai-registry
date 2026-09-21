---
layer: application
type: application
subject: agent-instruction-files
technique: write-back-sink-class
stack: bun
verified_on: 2026-09-16
verified_against: bun@1.3.11
applied: experiment
ab_verdict: unmeasurable
proof: structural-only
---

# Four named sinks, four dead lanes, and the one that survived was the one something read

The witness for the version is the monorepo's own `packageManager` field,
`bun@1.3.11`, in the root manifest of the tree read here — a public
integration-layer monorepo for agent tooling, pinned at one commit. The
version is what the tree states about itself, not what a dispatch guessed.

This is a **source-tree** application: the tree was opened, swept and
classified, but nothing was changed in it and no arm was run against it.
The verdict is `unmeasurable` for a reason the technique names — the
damage from a write-only sink lands in a *different* checkout than the one
that produced it, and there is only one checkout of this tree. The
instrument that would measure it is a second installation; see the return
condition.

## What the tree names, and where it lands

The repository's standing policy file is a short, well-disciplined
document: it delegates setup to a second file, e2e invariants to a third,
and closes with one line naming three write-back destinations by kind —
mistakes to one file, missing capabilities to a second, environment
discoveries to a third. The harness file beside it is two lines and a
pointer, so the topology is single-source and the outbound line is the
only one of its kind in the tree.

All three destinations are in the ignore rules. None of the three exists.

A fourth sink sits in an installed sibling — a security-review runbook that
directs every scan's findings to per-skill machine-readable files under an
ignored run directory, with five scans enumerated and a command for each.
None of those files exists either. What the runbook *does* carry is a
hand-maintained prose section, "Current Known Findings", listing two real
findings and three clean scans against a date some months before the commit
read here, with an explicit caveat that the clean scans are scoped results
and do not certify the codebase.

That contrast is the whole finding, and it is a selection pressure rather
than an oversight. The machine-readable half is written by a tool, read by
nobody, and ignored by the repository; the prose half is written by hand,
read by every agent that loads the skill, and committed. **The part
something read is the part that lasted.** It also aged: a dated summary
whose underlying scans are discarded cannot be re-derived, so the only way
to know whether those findings still hold is to re-run everything.

## The classification, applied

Running the technique's three checks over this tree's config corpus —
twenty-three instruction and skill documents, enumerated from the tracked
file list rather than by reading — turns up eight write destinations, all
of them outside the shared artifact, and none of them named anywhere in the
same corpus as something to *read*. By the technique's rule, that is eight
journals and zero lanes.

The class question sharpens one of them. The three sinks in the policy
file's closing line are not one class:

- mistakes and environment discoveries are records **about this checkout
  and this machine** — properly local, and the ignore rule is right;
- missing capabilities are a claim **about the product**, which is what
  every other contributor would want and what no other checkout can see.

The three were named in one clause and inherited one decision, which is
exactly the one-clause trap. The repository has a strong reason for the
default it chose — its own policy file forbids private names, internal
context, customer-derived data and model attribution in anything committed,
and this repository is public — so "share them all" is not the correction
here. The correction the technique prescribes is the cheap half: say in the
line that the sinks are per-checkout, so the next author does not write an
instruction that assumes accumulation.

## What this tree does better, and it is worth stealing

The same repository holds the inverse pattern done well, one directory
over. Its end-to-end scenarios declare what they need by *yielding* the
services they use; there is no parallel needs list, so the declaration
cannot drift from the use. A target that cannot provide a service surfaces
as the injection framework's own missing-dependency defect, which the
runner converts into a recorded skip carrying the missing service's name,
written to a per-run result file that feeds the scenario-by-target matrix.
A non-run is a row, not an absence.

Read beside the sinks, the two halves say the same thing from opposite
ends: the skip survives because the matrix reads it, and the sinks die
because nothing does.

## What this cannot do

It cannot say whether any of the eight sinks was ever *written* and later
cleaned, because an ignored file leaves no history. Absence here is
consistent with "never followed" and with "followed and swept", and only
the first is a defect. The enumeration is also line-based: a write
instruction split across a line break is missed, and one was — the third
sink in the policy file's closing sentence had to be added by hand after
the scan returned two.

## Return condition

Re-verify when a second installation of this repository exists on another
machine, or when any of the four sink paths appears in the tracked file
list. The first makes the technique's central cost observable rather than
argued; the second changes the class and the audit result.

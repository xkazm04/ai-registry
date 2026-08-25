---
layer: technique
type: technique
subject: agent-instruction-files
technique: machine-owned-regions
status: forged
laws: [derivation-names-recomputation]
shared_with: []
use_when: [a tool writes or rewrites blocks inside a hand-written instruction file, deciding whether generated content belongs in the always-loaded file, a hand edit inside a generated block keeps reappearing reverted, two generators claim the same derived content]
---

# Machine-owned regions

Instruction files accrete machine-written content: a framework stamps its
own advisory block on dev-server start, a context-scan tool maintains a
generated map of the repo between markers, registry tooling stamps a
standard access block. The result is a single file with two kinds of
author — and every failure of the pattern comes from blurring which lines
belong to whom.

## The fence contract

A machine-owned region is legitimate exactly when it honors three rules:

1. **Fenced by markers.** Explicit begin/end comments delimit the region.
   Everything inside is the generator's; everything outside is
   hand-territory the generator must never touch. A tool that rewrites
   outside its fence — or a human who edits inside one — is writing into
   someone else's file.
2. **The block names its generator** — which tool, invoked how, and when
   it last ran
   ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
   A generated block is a stored derived value; without its recomputation
   path it is a future discrepancy with no arbiter — nobody can tell a
   stale block from a wrong one, or knows what to run to find out.
3. **Edits go through regeneration.** The block should say so in its own
   text ("edits between the markers are overwritten on the next scan —
   edit the source, or rescan"), because the person most likely to hand-
   edit it is an agent reading the file mid-task. A hand edit inside the
   fence is not a small fix; it is work scheduled for silent deletion.

## Admission is not waived for machines

A generator writes with the authority of tooling and none of the
restraint of an author — and generated content is precisely the class the
field measured as net-negative when it restates what the repo already
shows. The fence contract governs *how* a machine block lives in the
file; [line-earning](./line-earning.md) still governs *whether*. A
generated block earns always-loaded placement only if agents act on it in
most sessions; a block consulted occasionally belongs behind a pointer to
the artifact it renders ("the full map lives in the JSON at the root;
read it at task start"), with the in-file block reduced to the pointer
and the invariant. The pointer form has a second virtue: the heavy
artifact stops being a second copy of the truth — the block cites the
authority instead of duplicating it.

## One region, one owner

Two generators writing overlapping content into one file — or one
generator's block describing another's artifact — reproduces the
vocabulary fork inside the machine layer: two derived views of the same
truth, regenerated on different schedules, guaranteed to disagree and
each wearing the authority of tooling when they do. One derived artifact
has one generator; a second tool that wants the same content consumes the
first tool's output or replaces it, never parallels it. When a fleet's
files show two map blocks with different counts for the same repo, that
is not two data points — it is one broken ownership.

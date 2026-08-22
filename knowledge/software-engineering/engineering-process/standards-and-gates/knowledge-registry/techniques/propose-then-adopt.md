---
layer: technique
type: technique
subject: knowledge-registry
technique: propose-then-adopt
status: forged
laws: [one-validation-door, deletion-is-not-repair]
shared_with: []
use_when: [deciding where an automated contributor stops, a tool merged its own proposal, an unmapped category silently filed as catch-all]
---

# Propose, then adopt

A registry that any tool can write to has no owner. The write path is therefore
the entire governance model, and it compresses to one sentence:

> **Tools propose. People adopt. Merging is what adoption means.**

Everything else is detail about where the proposing stops.

## The same rule, read in the other direction

"Tools propose, people adopt" is usually read as a constraint on writing into a
registry. It constrains *reading out of one* just as hard, and that half is
easier to lose because the mechanism looks like convenience rather than
governance.

A subscription that pulls updates automatically — a managed bundle, a plugin
that refreshes, a pinned reference that silently follows a moving branch — moves
the adoption decision to the publisher. When the artifact is instructions that
execute against a live codebase, that is the same act the write path forbids,
performed from the other end: a merge in the publisher's repository changes what
a consumer's agent does, remotely, with nobody present on the consuming side to
review it. The publisher did not do anything wrong; the distribution channel
made the decision for both of them.

The distinction that keeps this tractable:

- **Data may follow.** A catalog, an index, a list of what exists — refreshing
  these changes what a consumer can *see*.
- **Instructions are adopted.** A skill, a policy, a rule the agent executes —
  refreshing these changes what a consumer *does*, and it is a decision
  somebody there has to make.

Auto-pull is not thereby forbidden; it is a **declared** choice with a cost, and
the consumer is the one entitled to make it. What must never happen is the
choice arriving as a side effect of how the artifact was installed. Where a
channel offers only auto-pull, the honest arrangements are to pin a version
explicitly, or to treat the subscription as a notification — tell me a newer
version exists, and let a human here decide — which is the read-side mirror of
proposing rather than merging.

## Where an automated contributor stops

A tool may do all of the preparatory work — read the source material, generalize
it, rewrite it to the destination's conventions, place it in the right lane,
create a branch, commit. Each of those is reversible, local, and reviewable.

It stops at the commit. Pushing and opening a request for review are the first
outward-facing acts, and merging is the decision itself. A contributor that
pushes and merges its own proposal has not automated the paperwork around a
decision; it has removed the decision, and it will look exactly like a working
system right up until the first bad proposal lands.

Say this in the instruction the tool follows, not just in the design document.
An agent told to "publish this into the registry" without an explicit stopping
point will helpfully complete the whole path, and it will be right to — nothing
told it otherwise.

## One door, and the door does the conversion

Content arriving from a consumer is written in that consumer's terms: its
category vocabulary, its version format, its assumptions about what the reader
already knows. The registry has its own. Conversion has to happen somewhere, and
the only place it can happen reliably is the door
(`_laws.md#one-validation-door`).

Two vocabularies are worth calling out because they fail silently rather than
loudly:

- **Closed sets.** If the destination normalizes an unrecognized category to a
  catch-all instead of rejecting it, an unmapped value is not an error — it is a
  quiet loss of the categorization, and the item looks filed rather than
  unfiled. Spell the destination's set out in the instruction and require a
  mapping decision.
- **Version formats.** A two-part version arriving where three parts are expected
  is not invalid enough to reject and not right enough to compare. State the
  conversion, including the case that gains a component.

The general rule: anywhere the source and destination disagree about a *closed*
vocabulary, the door must convert explicitly, because the failure mode is a
value that passes validation and means something else.

## The proposal must not damage what it did not come for

A contribution touches one item. The working copy it lands in may contain other
people's uncommitted work, another consumer's configuration, and the
repository's own declarations. An automated contributor should be told
explicitly, in the instruction it follows, to:

- commit **only** the paths it created or changed;
- leave every other consumer's files alone, including the root declaration;
- **stop and report** if the working copy carries changes it did not make,
  rather than committing around them.

The last one matters most in a shared working copy, where "unexpected changes"
usually means a person is mid-edit. Committing around them is how someone else's
work is swept into a commit that does not mention it.

## Merging is adoption, so record it as such

Because merge *is* the decision, the merge history is the adoption record — which
means the message has to carry the reasoning, not just the change. A merged
proposal whose message says only what it did leaves the "why we accepted this"
unrecorded in the one place it would be found later.

## Withdrawing is not the same as deleting

An adopted item that turns out to be wrong should be corrected or superseded, and
its history left intact (`_laws.md#deletion-is-not-repair`). Consumers have
already synchronized it; a silent removal presents to them as content that
vanished, with nothing explaining whether it was retired, renamed, or lost. State
the withdrawal in the item or in whatever supersedes it.

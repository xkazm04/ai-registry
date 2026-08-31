---
layer: application
type: application
subject: machine-paced-delivery
technique: mutating-local-gates
stack: node
verified_on: 2026-08-31
verified_against: node@24.12.0
applied: experiment
ab_verdict: better
proof: structural-only
---

# The advisory that still needs the guard, and the gate that detected nothing for its whole life

This project runs one turn-end gate: a hook that reads the session transcript, finds the files
the turn edited, and reminds the agent when a source file changed without its coupled feature
document. It is read-only, it never blocks, and it is the case that corrected the technique
twice.

## It is the weakest tier, and it still guards re-entry

The technique as first drafted said the termination contract is created by mutation. This gate
mutates nothing. It was then redrafted to say blocking creates it. This gate does not block
either — its own header says so outright, and its three exit codes are a reporting contract
rather than a control one:

| exit | meaning | who receives it |
|---|---|---|
| 0 | checked, and this turn is consistent | nobody |
| 2 | checked, and a mapped document was not updated | the model, in-session |
| 3 | could **not** check | the operator, as a non-blocking error |

And its first executable statement is a re-entry guard: on a re-fired turn end it exits 0 without
checking.

That guard is not defensive programming. Exit 2 feeds a reminder back to the model; the model
acts on it; acting ends another turn; the turn end fires the hook again. **A purely advisory gate
whose output re-enters the agent's loop is already a feedback loop**, with no blocking and no
mutation anywhere in it. The tier list in the technique — advisory, then blocking, then mutating
— is this tree's correction, and the ordering matters because the advisory tier is the one most
likely to ship unguarded, on the reasoning that it cannot hurt anything.

## The measured silence

The same file records the failure the technique's liveness paragraph describes, with numbers its
author paid for. The hook's turn-boundary detection was wrong in a way that made the edited-file
set always empty:

> replayed over all 31 recorded transcripts of this project: **1,136 Edit/Write tool calls, zero
> detections**

The gate ran on every turn of the project's life, exited 0 every time, and reported a clean
repository. Its output was byte-identical to a working gate finding nothing wrong. Nobody noticed,
because there is nothing to notice — the technique's rule that a gate which had nothing to do must
say so is the *only* thing that separates those two states, and this gate did not say so.

The cause is worth recording because it generalizes past this ecosystem: the backward scan for the
turn boundary stopped at the first user-role entry, and **3,837 of 4,187 user-role entries in
those transcripts are tool results**, which the transcript records in exactly the user-role shape.
A turn's last entries are almost always tool results, so the scan terminated on line one, every
time. Any gate that reconstructs "what did this turn do" from a transcript is exposed to the same
class: the envelope's shape is an internal detail, and reading it as a boundary marker is a
proxy that agrees with its target everywhere except at the boundary
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The repair layers three independent signals with the public wire format primary and the two
internal annotations corroborating, and rejects on any of them — the conservative direction,
because a missed boundary merely widens the scan while a false boundary re-creates the original
silent failure.

## The three-state contract, arrived at independently

The instrument now asserts itself before reporting: an unreadable rule map and a missing
transcript both used to answer 0, and both now answer *could-not-run* on a separate exit code with
a message naming the repair and addressed to the operator rather than the model. Its own comment
states the reason in the vocabulary this bundle uses — "the distinction is between a green that
means something and a green that means nobody looked."

That is `gate-liveness` reached without reference to it, in a tree that had been burned by exactly
the failure the law describes. It is corroboration for the standard rather than an application of
it, and the direction is the useful one: the rule was expensive enough to learn that a
single-maintainer project paid for it and wrote it down.

## What this realization cannot do

The gate is advisory by design, so nothing here exercises the blocking or mutating tiers, the
snapshot rule, or the patch-as-block-reason rule — this tree has no fixing gate to test them
against. The re-entry guard is present but has never been *observed* firing: no counter records
how often a turn re-enters, so the guard's value is argued from the mechanism rather than measured.

The 1,136-call replay is the strongest number here and it is a count of the gate's silence, not of
drift: how many of those turns actually left a document stale is unknown, and the repaired gate has
not yet run long enough to say.

**Return condition:** a counter on the re-entry path and on the could-not-run path, both of which
are currently unobservable — a gate that has never reported a skip and a gate whose skip path is
broken look identical, which is the failure this file is about, one level up.

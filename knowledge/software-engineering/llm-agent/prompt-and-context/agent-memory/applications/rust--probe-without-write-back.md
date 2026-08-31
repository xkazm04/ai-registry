---
layer: application
type: application
subject: agent-memory
technique: probe-without-write-back
stack: rust
status: forged
verified_on: 2026-08-31
verified_against: rust@1.80
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Auditing the usage counter from both ends (Rust)

The persona memory store realizes the technique's core rule already, and states
it as a numbered clause in a written memory contract
(`src-tauri/core/src/models/memory.rs`, clause 3): the usage columns are
"incremented EXCLUSIVELY" by one named function, whose "single legitimate
caller" is the prompt-injection path, and every other read path "MUST NOT
increment". That is the read-path discipline, written down and argued, before
this corpus described it.

The amendment claims a second audit is not optional beside it. This realization
is the paired test of that claim: both audits were run against one tree, on one
instrument (call-site enumeration), and their findings compared.

## The two arms

**Arm A — the reader-side audit.** Enumerate the callers of the read path and
decide which reads are evidence. Four production call sites read the tiered
selection: two dispatch paths, one prepared-run cache, and one file projection.
The arm's stated default is that a new machine caller is suppressed until it
argues its way into counting. Under that default all four sites are consistent
and the arm returns **no findings**.

**Arm B — the writer-side audit.** Enumerate what writes the usage columns and
confirm the delivery boundary is among the writers. One writer exists, as the
contract says. It has **three** callers, not one, in two modules the contract
does not name. Three of the four read sites resolve correctly. The fourth does
not, and the arm returns **one finding**.

## The finding arm A structurally cannot reach

`src-tauri/engine/src/claude_md_projection.rs` selects through the same tiered
call and renders the result into a file the consumer imports. Its own module
header states what that means: the file is one the consumer "prepends to *every*
turn and re-reads on `/compact`". By any reading of the term, that is a delivery
— at a higher rate than the prompt path it was built to back up. It does not
increment.

Arm A cannot flag this, and the reason is its default rather than its diligence.
A projection job is a machine caller; the reader-side rule says machine callers
default to suppressed; a suppressed machine caller is the correct state. The
question that separates a delivery from a warmer is not *who called* but
*whether material crossed into a consumer's context*, and only the writer-side
audit asks it.

The consequence is the one the amendment names. `memory_recall::decay_score`
anchors age at the last-access instant and boosts on the count, so every memory
delivered through the projection ages as though it had never been read. The
module's header plans for the prompt-path injection to be removed "once the
projection is verified in production" — at which point the store's usage signal
goes to zero while delivery continues at full rate, and the value model's third
axis, which exists to rescue exactly the load-bearing items, has nothing left to
rescue them with.

## Honest scope: this is staged, not live

`install_projection` has no production caller in the tree — every reference
outside the module is its own test — and it is gated behind an environment
variable that makes it a no-op when unset. So nothing is currently miscounted.
The finding is that the defect is one wiring commit away and sits in the path
the module documents as its eventual replacement for the correct one. Catching a
staged defect is the audit working, not a smaller result than catching a live
one; reporting it as live would be the larger error.

## The deferral that must not be flagged

The prepared-run cache (`src-tauri/src/commands/execution/executions.rs`) reads
the selection, appends it to a prompt, and stores the identifiers in a cache
without incrementing. The dispatch path that later consumes the prepared blob
increments them. That is correct — the prepared run may never execute, so the
boundary is the consumer — and a naive form of arm B flags it as a second
omission. The audit therefore has to trace each selection forward to its point
of no return rather than test each read site in isolation; the technique now
carries that refinement, which this tree is where it was learned.

## What this realization cannot tell you

The audit is static. The amendment's two cheap runtime tests — comparing the
counter against revision recency, and looking for an unedited item with a
non-zero count — were not run, because that needs a populated store and this
pass read only source. A tree whose static enumeration is clean can still be
miscounting through a path the enumeration classified generously, and only the
runtime comparison would say so.

## The structural fact

The tree proves something it was not built to prove: **the contract clause is
the most confident sentence about the usage columns anywhere in the repository,
and it is the least accurate.** It names one caller in a module that contains
none of them; the three real callers live elsewhere; the missing fourth is
invisible to it entirely. Nothing drifted through carelessness — each caller was
added correctly, and the clause was true when written. The enumeration decayed
because it was prose, and prose has no failure mode. That is the argument for
putting the writer set somewhere a check owns it, made by a codebase that did
the harder half — writing the rule down at all — and still lost the list.

## What shipped, and what did not

The behavioural fix did not ship, and the reason is neither authorization nor
size. It is that the fix is **not yet determinate**: the projected file is
re-read by the consumer on every turn, so "one delivery" is not obviously one
increment, and the surface has no production caller against which to settle the
question. Shipping a guess into a path that never runs would harden the wrong
semantics before anyone can observe them.

What did ship is the half that is determinate — the contract's caller
enumeration, corrected to the three real call sites in the two modules that hold
them, with the deferral explained and the projection gap recorded where the next
reader will run the audit. Comment only; no behaviour changed, so the proof for
that commit is structural rather than paired.

That split is worth stating because it is the technique's own second section
proving itself in one motion: the audit found the gap, and the artifact that let
the gap hide — a prose enumeration with no failure mode — is the thing that was
cheap enough to repair today.

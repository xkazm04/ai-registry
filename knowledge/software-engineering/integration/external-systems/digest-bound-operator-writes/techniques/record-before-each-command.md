---
layer: technique
type: technique
subject: digest-bound-operator-writes
technique: record-before-each-command
status: forged
laws: [record-precedes-effect, unknown-is-not-a-value]
shared_with: []
use_when: [a confirm sends several commands to an external system, answering who sent what and which of a plan's commands landed, the local record store can fail while the remote is healthy]
---

# Record before each command

Each command a confirm sends is written to the tool's own record before it is sent,
and finished with its outcome after. The record is per command because plans are
sequences, sequences fail part-way, and the question afterwards is always which
steps landed.

## Procedure

1. **Open the row.** Before sending command *n*, insert a row: the acting identity
   (as the remote will record it), the target project or resource, the exact
   argument vector, its readable rendering, its risk class, the local item it
   settles, and the time. The row has no exit yet; an open row means "sent or about
   to be sent".
2. **Refuse if the row did not land.** When the insert fails, the command is not
   sent and the confirm ends with an error. A tool that sends anyway and logs the
   failure has a write with no line, which is the one thing the record exists to
   prevent.
3. **Send the command.** Exactly once, with no automatic retry (see the
   unknown-outcome technique).
4. **Finish the row** with the outcome: the remote's refusal status when it refused,
   success when it answered, and what the write made when the answer names it (a
   request number, a resulting commit id). Where the remote's answer does not name
   what was made, read it back immediately and record what the read says, or record
   nothing; never guess.
5. **Stop at the first failure.** Later commands in a plan depend on earlier ones (a
   request needs its branch). Mark the confirm as not done; the rows already show
   exactly where the sequence stopped.

## Decision rules

- When finishing the row fails after the command ran, do not answer "failed". The
  command's effect may well be in place; the record merely lacks its exit. Let the
  confirm end with no answer, so it is recorded and recalled as unknown, per
  [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value). "Failed"
  here would read as "safe to send again".
- When the plan is multi-command, never collapse it into one row. A single row per
  confirm cannot say that the branch was created and the request was not, and that
  is the state a person most needs to see before trying again.
- When the remote may have changed even though a later command failed, still refresh
  the tool's view of the remote after the confirm. The answer stands as given; the
  view catches up on the next read.
- When the tool has a demonstration or dry-run mode, write no rows and send nothing,
  and mark every result as simulated. A dry run that leaves records is
  indistinguishable from a real one in the audit.
- When the record lives in a store that can be read by the person later (an audit
  screen), the acting identity on the row is the identity the remote will record,
  not the tool's service identity, so "who did this" agrees across both systems.

## Why per command, before the send

The order is [record-precedes-effect](../../../../_laws.md#record-precedes-effect)
at its smallest scale. Act-then-record leaves a crash window in which the remote
holds an effect and the tool holds nothing; record-then-act leaves at worst an open
row whose command may or may not have gone out, which is honest and recoverable: a
person reads the remote, and the row tells them exactly what to look for.

## When not to use it

A pure read sends nothing worth recording here. A write the tool makes to its own
transactional store is better covered by doing the effect and the record in one
transaction; this technique is for effects outside the tool's transaction, where
"before" is the only order that can be made true.

---
layer: technique
type: technique
subject: digest-bound-operator-writes
technique: plan-twice-run-if-unchanged
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [a confirm must run exactly the commands a person was shown, the remote state can move between preview and click, the client renders or edits command text]
---

# Plan twice, run if unchanged

The preview and the confirm are two calls to the same planner. The first returns the
exact commands and a digest of them. The second plans again from fresh reads, digests
the result, and runs it only if that digest equals the one the person confirmed.
Nothing about the plan travels from the client to the server except the person's
intent and the digest they saw.

## Procedure

1. **The client sends an intent, never a command.** The intent names what the person
   wants ("lower class X on project P to tier 1", "open a gap request for stage S")
   and the item it settles, if any. It is validated at one door into a closed set of
   kinds before anything is planned.
2. **The server plans the exact commands.** Each planned command is an argument
   vector the executor will send byte for byte, plus a readable rendering for the
   screen, plus its risk class. Where a command writes a file, the plan also carries
   the diff the person will review. The planner reads the remote state it needs
   (current file content, the file's last commit, whether a branch exists) and
   refuses with a reason rather than planning around a missing fact.
3. **The digest covers everything the confirm will do.** Hash a canonical
   serialization of the intent's kind, the local item it will settle, and every
   command's argument vector, in order. Leave out the readable rendering (it is
   derived) and anything that changes on every call (a timestamp the plan does not
   send). Leave in anything the confirm acts on, including local side effects: if
   two plans send identical remote commands but close different inbox items, they
   are different plans.
4. **The preview returns the commands, the digest as the preview id, and the
   overall risk** (the highest of the commands'). The screen shows the vectors.
5. **The confirm carries the intent and the preview id.** The server plans again
   exactly as in step 2, digests, and compares.
6. **Equal: run. Different: run nothing**, and answer with a distinct `changed`
   status that carries the new preview. The screen shows it in place of the old one
   and the person confirms again or walks away. A plan that now refuses (the class
   is already at that tier, the branch now exists) answers with the refusal.

## Decision rules

- When the client could send the commands, it must not: a server that executes
  client-supplied argument vectors has made the client the author of the write, and
  the preview the server showed is decoration. The server plans; the client names
  intent.
- When command text appears anywhere in the client's code, treat it as a defect and
  keep a test that scans the client's sources for hand-spelled writes (a file edit
  expression, a direct commit endpoint, a create command for the remote's objects).
  Hand-written command text drifts from the server's planner in exactly the fields
  nobody reviews: a path into a file shape that changed, a field the schema never
  had.
- When the second plan differs, never "run the new one because it is close". The
  person authorized a specific set of effects; a close plan is a different
  authorization, and only the person grants it.
- When planning is expensive or the remote is slow, still plan twice. Caching the
  first plan for the confirm reintroduces the exact staleness this technique
  removes; the cost of a second read is the price of the promise.
- When the digest is computable from public inputs, it proves equality of plans,
  not that this person saw this preview. Where that matters (a confirm must follow
  a preview the server actually issued), keep a server-side issue record of preview
  ids with an expiry, and refuse a confirm for an id the server did not issue or
  issued too long ago as stale.
- Canonicalize before hashing: a stable key order and an explicit array of vectors.
  Two serializations of one plan that hash differently produce spurious `changed`
  answers; the person learns to click through them, and the check is dead.

## The window it does not close

Re-planning moves the stale window from "preview to click" (minutes) to "the
confirm's own read to its send" (milliseconds to seconds). That residual window is
real on any busy target and is closed only by the remote system refusing a write
whose precondition no longer holds; that is the precondition-token technique, and
this one is incomplete without it. Per
[gate-sees-target](../../../../_laws.md#gate-sees-target), the check that matters is
the one evaluated at the target at the moment of the write; the digest is the check
that keeps the person's authorization honest, and the token is the check that keeps
the target honest.

## When not to use it

Reads need none of this. A write whose effect is genuinely idempotent and
order-free (setting a personal display preference in the tool's own store) can skip
the second plan. A bulk operation over hundreds of targets is a poor fit for an exact
command preview and belongs to a job with its own dry run and change report; the
person cannot meaningfully review a thousand vectors, and a digest over them binds
nothing they read.

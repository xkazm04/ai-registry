---
layer: technique
type: technique
subject: digest-bound-operator-writes
technique: precondition-token-on-every-write
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
use_when: [a write updates state another person or process can change, the read that planned a write is seconds or minutes old, a write could land over a revoke or a demotion it never saw]
---

# Precondition token on every write

Every write that updates existing state carries the token of the state the plan read
(a file's last commit id, an entity tag, a resource version, an expected revision),
so the remote system refuses the write if that state has moved. A write whose read
returned no token is not planned.

## Why the digest is not enough

Re-planning at confirm time catches every change that landed before the confirm's own
read. A change that lands between that read and the send (another person's commit, an
automated demotion, a second tool) is invisible to the tool and visible only to the
remote. Optimistic concurrency puts the check where the state lives: the writer says
"I believe the current version is V", and the owner applies the write only if it is.
This is the remote-side form of [gate-sees-target](../../../../_laws.md#gate-sees-target):
the predicate is evaluated against the target at the moment of the write, by the only
party that can see it.

## Procedure

1. **Read the token with the content.** The plan's read of the file or resource
   returns both, from one response. A token from a separate, later read can belong to
   a newer version than the content the plan was built on.
2. **Validate its shape.** A token that is absent, empty, or not of the remote's
   documented form (a commit id of the expected length and alphabet) is no token.
3. **No token, no plan.** Refuse with a reason the person reads: the remote did not
   say which version it holds, so a stale write could not be refused, and nothing is
   planned. Per [absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud), the
   unguarded write is never the silent fallback.
4. **Put the token in the command.** It is part of the argument vector, so it is part
   of the digest; a plan from a newer read has a different digest and the confirm
   answers `changed`.
5. **Map the refusal.** The remote's precondition failure (a conflict, a "precondition
   failed", or whatever status the remote documents for a stale token) is a refused
   write, reported as `failed` with the reason "the file moved since it was read".
   It is not unknown: the remote said no.
6. **Share one read between a decision and its edit.** When the plan decides from the
   content (is this class above the requested tier?) and then edits it, the decision
   and the edit use the same read and the same token, so the remote refuses the write
   if the fact the decision rested on has changed.

## Writes with no prior state

A creation (a new branch, a new request, a new file) has no version to name. Guard it
two ways instead. Before: the plan checks that the name is free and refuses if not,
and the remote's own uniqueness rule refuses a racing duplicate. After: read back what
the write made and check it is what the plan intended, for instance that the request
just opened is headed by the commit this plan just made, and that the branch it starts
from was the version the plan read. A post-condition that fails turns a `done` into a
`failed` with the mismatch named.

## Decision rules

- When the remote offers a token on the endpoint, use it on every write through that
  endpoint, not only on the ones that feel risky. The risky write is the one nobody
  flagged.
- When the remote offers a token only on some endpoints, plan through those endpoints
  where an equivalent exists, even when another endpoint is more convenient.
- When a stale-token refusal arrives, never retry with a freshly read token
  automatically. A fresh token on the old plan is a write the person did not see;
  re-plan and show the new preview.
- When a multi-step write starts a new branch from a base, the base version the plan
  read is the precondition of the whole sequence; name it in the first command.

## When not to use it

Appends that commute (adding a comment, posting an event) have no version to
conflict with and need no token; the idempotency of their retry is the journal's
concern. A remote that offers no conditional write at all leaves this technique
unavailable; say so in the preview's notes, keep the stale window as short as the
second plan allows, and prefer a read-back post-condition over silence.

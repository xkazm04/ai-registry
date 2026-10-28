---
layer: technique
type: technique
subject: digest-bound-operator-writes
technique: preview-id-claim-and-recall
status: forged
laws: [record-precedes-effect, unknown-is-not-a-value]
shared_with: []
use_when: [a confirm's answer was lost and the person wants to know if it ran, a double click or a second tab confirms the same preview, deciding when the same plan may run again]
---

# Preview id: claim and recall

Each confirm is journaled under its preview id. The confirm claims the id
atomically before its first command and finishes it with the response it sent. A
repeat answers from the journal, a concurrent confirm is refused while the first is
running, and a client that got no answer asks the journal what the id did.

## The journal row

One row per preview id, with a state of `running`, `done`, `failed`, or `cut` (the
confirm ended without an answer: it threw, or the process died), the response for
`done` and `failed`, when it started, when it finished, and an identity for the
process that claimed it.

## Procedure

1. **Read before planning.** On a confirm, look the id up first. A `done` within the
   recall window answers with its stored response and runs nothing. A `running`
   claimed by this live process is refused as still running, with the same wording
   whichever guard caught it.
2. **Plan twice and compare digests** (the plan-twice technique). Only an unchanged
   plan proceeds.
3. **Claim atomically.** An insert-or-take-over that succeeds only when no live
   confirm holds the id: no row; or a row that is `failed` or `cut`; or `running`
   under a process that is gone; or `done` older than the recall window. Exactly one
   of two racing confirms wins; the loser answers from the journal.
4. **Run, then finish.** On return, store the state and the response. On a throw,
   finish as `cut` with no response; a throw is not an answer.
5. **Recall on request.** A client that sent a confirm and got nothing asks the
   server what the id did: `ran` (with the response), `running` (here, now),
   `never` (no confirm claimed it), or `unknown` (a `cut` row, or a `running` row
   left by a dead process: the commands may or may not have run).

## Decision rules

- When the client's confirm got no answer, its button stays closed. Its next step is
  a recall, not a resend. `ran` shows the stored answer and never reopens the button
  on the same preview. `running` stays unsure and asks again shortly. `never` and
  `unknown` lead to a *fresh preview*, which re-plans against the remote as it now
  is; if the lost write had landed, the fresh plan differs (or refuses), and the
  precondition token refuses any write that would have stacked on top of it.
- When the preview id is the plan's digest, two people or two days asking for the
  identical write produce the same id. That is useful (a repeat is recognized
  without any client-side key) and has a cost (a legitimate second run of the same
  plan is blocked). Bound the cost with a recall window: within it, a repeat answers
  from the record; after it, the same plan may run again. Choose the window as the
  time a person plausibly retries a lost answer, minutes, not days.
- When the process holds an in-memory set of ids running now, keep it in addition to
  the durable claim: it refuses a double click before any read or plan, and the
  durable claim covers a second process and a restart. Neither alone is enough.
- When a `running` row names a process that no longer exists, it is unknown, not
  running. Treating it as running blocks the id forever; treating it as never
  claimed reopens a write that may have half-landed.
- When the tool has no durable store (a demonstration mode), keep no journal and
  answer recall with `never`: nothing was ever sent.

## Why this is not a general idempotency key

An idempotency key is minted by the client per logical request and carried to the
remote, which dedupes. Here the remote usually offers no such header for these
writes, so the dedupe must live in the tool, and the key is the content digest
rather than a minted token, because what must not run twice is *this plan*, and
what may run again later is the same plan once its window has passed. Where the
remote does accept an idempotency key, send the preview id as that key as well; the
journal still answers the person's "did it run".

## When not to use it

A write that is naturally idempotent at the remote (setting a field to a value, with
a precondition token) is protected from doubling by the remote and needs the journal
only for recall. A tool with a single user on a single process may make do with the
in-memory set, accepting that a restart loses recall.

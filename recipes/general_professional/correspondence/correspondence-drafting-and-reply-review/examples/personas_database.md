# The built-in database as the `database` connector

What was learned mapping this recipe onto the consuming application's own local store.
Nothing here is part of the recipe: swap the connector and this file stops applying while
the recipe does not change.

## What the mapping has to decide

**Store the edits, not the approved text.** The obvious schema keeps the final sent
message per contact, and it makes this recipe's central rule impossible: graduation is
decided on how much a human changed the draft, and the change cannot be recovered from
the result. Keep the draft as generated and the version as sent, both, per message. The
store's cost is a second copy of some short text; the alternative is a graduation rule
that silently reverts to counting approvals, which is the rule the recipe exists to
replace.

**Record when the draft was shown and when the verdict came back.** The criterion about
an approval returned faster than the draft could have been read needs two timestamps, and
neither is a property of the message. If the store only holds the approval, that criterion
is unenforceable and nothing about the recipe will look wrong.

**Profiles are keyed by platform and contact, and the access pattern is read-modify-write
per key.** Every reply reads one profile and writes it back changed, which makes an
append-only log the wrong shape and makes concurrent replies to the same contact a real
collision rather than a theoretical one. Establish at adoption that a profile row can be
updated under a lock or a version, not merely appended to.

**Local is a property worth keeping deliberately.** The profile is a model of how one
person writes to another, assembled from their private correspondence, and it is more
revealing than any single message in it. The built-in store was chosen because that model
never leaves the machine. Any other database chosen at adoption inherits the obligation
rather than escaping it, and the question to ask is not whether it can hold the data but
who else can read it.

**The holdback window needs a queue, not a delay.** A message held so it can still be
stopped has to be visible somewhere while it waits, or the reversal path is a timer nobody
can see. That is a small table with a due time and a cancel flag, and it is the thing that
turns graduation from irreversible into merely fast.

## What transfers to any database connector

- If a rule is stated on how much something changed, the store must hold both versions.
  A store of outcomes cannot answer questions about deltas.
- Timestamps that make a rule checkable are part of the schema, not telemetry.
- A per-key read-modify-write profile needs a concurrency answer before it needs a bigger
  schema.
- A delay is only a reversal path if the waiting item is visible and cancellable.
- Ask who can read the store, not only whether it can hold the data.

---
layer: technique
type: technique
subject: streaming-platform-api-custody
technique: revoke-then-purge-then-stop
status: forged
laws: [refusal-is-a-state]
shared_with: []
use_when: [implementing "disconnect account" in a streamer tool, reacting to the platform revoking the tool's authorisation, deciding what platform-derived data a tool deletes when a grant ends]
---

# Revoke, then purge, then stop

Ending a grant is an ordered teardown: ask the platform to revoke the token, then delete the
tokens and every store of platform-derived data the grant justified, then stop the event
connections and refuse further calls. Each step is reported with what was actually confirmed.

## Why the order matters

Every other order leaves a window. Stop first, and a crash before the purge leaves a valid
token on disk that nothing will clean up. Purge first, and the tool has deleted the token it
needed to authenticate its own revocation request - the grant lives on at the platform with
a copy possibly in a backup or a leaked log. Revoke last, and between the purge and the revoke
the tool has told the streamer "disconnected" while the grant still works. Revoke-first means
that from the first step onward, any copy of the token anywhere is dead at the source.

## The procedure

1. **Revoke.** Call the platform's revocation endpoint with the access token (and the refresh
   token where the platform revokes them separately). Record the platform's answer.
2. **Purge.** Delete the token pair from the secret store and verify absence by reading it
   back. Delete or anonymise data the tool held only because of the grant: cached chat
   messages, viewer identities linked to actions, payment and subscription events - except
   records the streamer has a separate reason to keep (a moderation audit trail they asked to
   keep, a draw's published proof), which are kept under that reason and stripped of what the
   reason does not need.
   Block further use of the credential at the start of this step, so nothing new is sent
   while the purge runs.
3. **Stop.** Close event connections, cancel refresh timers, and put the broker into the
   disconnected state, where every operation returns "disconnected" at once. Publish the stop
   signal only after the purge has returned: the workers that obey it may be the very tasks
   carrying the purge, and stopping them first leaves deletion half finished.
4. **Report what was confirmed.** Revoked (platform confirmed), revocation unconfirmed (network
   error, platform error), purged (verified absent), stopped. When revocation is unconfirmed,
   say so and tell the streamer to remove the connection in the platform's own settings.

## When the platform ends the grant

A revocation can arrive from the other side: a subscription revoked because authorisation was
withdrawn, a validation call that fails, a refresh that answers invalid-grant. The tool runs
the same teardown minus the revoke call - there is nothing left to revoke - and reports it as a
state the streamer sees ("the platform disconnected this tool"), not as an error dialog that
closes into a half-working tool.

## Decision rules

- **When the revoke call fails**, still purge and stop; the order protects against leaks, it is
  not a precondition that blocks the local teardown. Return the unconfirmed revocation to the
  caller as a state, not only to a log line the streamer never reads.
- **When the purge or the secret-store deletion fails**, report an error, not success, and let
  the streamer retry the disconnect. Make the purge idempotent, so a retry after a partial
  success is safe.
- **When the tool is constructed**, require the purge handler; a default that does nothing
  makes every teardown report a purge that never happened.
- **When the tool is uninstalled**, the uninstaller runs the same sequence if it can reach the
  broker; if it cannot, it at least purges the secret store and says revocation was not done.
- **When the streamer switches accounts**, the old grant is torn down completely before the new
  one is obtained; two live grants in one tool is two custody problems.

## When not to use it

A temporary scope upgrade - re-consenting to add a scope - replaces the token pair through the
normal grant flow and does not purge data; the old tokens are still revoked once the new pair
is stored.

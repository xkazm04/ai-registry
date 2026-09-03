---
layer: technique
type: technique
subject: settings
technique: config-backup-and-restore
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [a crash mid-save left the settings file empty and the app booted as if freshly installed, an operator-owned configuration file has no server copy to recover from, deciding what happens when the settings file does not parse, choosing how many backups of a config file to keep and when to write them, a user asks how to get yesterday's settings back]
---

# Config backup and restore

A settings file that lives only on the machine that writes it has exactly one
copy of the operator's decisions, and the application overwrites that copy on
every save. The subject's rule that malformed is a stop, not a skip
([cross-source-precedence-chain](./cross-source-precedence-chain.md)), says
what the load must *not* do with a file that fails to parse: it must not fall
through to defaults and boot as if nothing happened, because a store that
cannot fail loudly turns a truncated file into a fresh install with accounts,
bindings and rules all quietly gone. What that rule does not say is what the
load should do *instead*. Stopping at a corrupt file with no way forward is
honest and useless; the operator is looking at an application that will not
start and a file they cannot repair by hand.

This technique is the way forward: the store keeps its own recent history,
writes it before every overwrite, and when a load fails it offers that history
back.

## The write side: rotate, then replace atomically

Before every save, the current file is moved into a **bounded rotation** of
numbered backups beside it - the newest at slot one, each older slot shifted
down, the last one deleted. Then the new content is written to a temporary
file in the same directory and renamed over the primary. The order matters and
so does each half:

- **The backup is taken from the file that was loaded, not from memory.** It
  is the last state known to parse, because it was parsed. Serializing the
  in-memory state twice does not produce a backup; it produces two copies of
  whatever is about to be wrong.
- **The write is atomic.** Truncate-then-write, interrupted, leaves an empty
  file, and an empty file is the single most common corruption a settings
  store ever sees. Temporary file plus rename means the primary is always
  either the old complete content or the new complete content.
- **The rotation is bounded at creation**
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)):
  the slot count is the reaper, and the oldest backup is deleted by the same
  save that creates the newest. A rotation with no cap is a directory that
  grows by one file per save until someone asks why the profile is large.
- **Save only on change, and save deliberately.** A store that rewrites an
  unchanged file on a timer pushes real history out of the rotation with
  identical copies; by the time the operator needs yesterday, the nine slots
  hold nine copies of this morning. Compare before writing, and let the slot
  count mean *nine distinct states*, not *nine minutes*.

How many slots is a product decision with a floor: enough that a corruption
noticed after several saves still has a good state behind it. Single digits
are usual.

## The load side: stop, list, offer

On load, a parse failure is classified before anything else - cannot open,
cannot read, does not parse - because the message the operator will see comes
from that classification and "settings failed to load" is not a message
anyone can act on. Then:

1. If no backups exist, stop with the classified error. There is nothing to
   offer, and booting on defaults here would be
   [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
   in its purest form: a reset presented as a welcome.
2. If backups exist, **enumerate them with their own state**. Each backup is
   test-parsed and labelled - parseable, unreadable, or malformed - alongside
   its timestamp and size. A backup that does not parse is still listed, as
   unavailable, so the operator sees the history exists and why it cannot be
   used; a list that silently drops the bad ones reads as "you only ever had
   two backups".
3. **Offer the choice.** The default selection is the newest parseable
   backup, described in the operator's terms: which file, what it holds, when
   it was last good. Restoring copies the chosen backup over the primary and
   retries the load; declining proceeds with an explicit acknowledgement that
   the current file will be overwritten on the next save; aborting quits
   without touching anything. The third option is the one implementations
   forget, and the one an operator who wants to copy the file away first
   needs.
4. Retry the load after a restore, through the same door. A restored backup
   that also fails goes back to step 2 with that backup now labelled.

The surface is what distinguishes this technique from a rotation alone. A
rotation without a restore path is a directory of files the operator does not
know about, named by a convention they cannot guess, that support will one day
tell them to rename by hand. The surface must exist at the point of failure -
a boot-time choice - and should also exist as a command reachable when nothing
is wrong, for the operator who broke their configuration in a way that still
parses.

## The decision rule

> When a configuration file is owned by one operator, has no authoritative
> copy elsewhere, and is overwritten in place by the application, keep a
> bounded rotation of backups taken from the last parsed state before every
> save, write the new file atomically, and on a load failure stop and offer
> the newest parseable backup by name - never defaults, never silence.

## Boundaries

- **This is not a migration.** A file that parses but carries an older shape
  is the version chain's problem
  ([persistence-and-migration](../../../../client-architecture/client-state/techniques/persistence-and-migration.md));
  a file that does not parse is this technique's. The two are consulted in
  that order: parse, then version, and a backup is never the answer to a
  version mismatch.
- **This is not a server-held store.** A settings space with a durable
  backend copy recovers from the backend and does not need local rotation;
  the technique applies where the local file *is* the authority.
- **Backups inherit the primary's classification.** A settings file is
  plaintext by design and holds no secrets; a backup of it holds none either.
  Where a file would need encryption, the rotation would multiply the
  exposure, and the value did not belong in the settings store to begin with.
- **The restore surface is a product moment, not a developer tool.** The
  message says which file, what it contained, and what each button will do.
- **The version chain is not replaced.** Restoring an older backup can hand
  the chain an older shape, and the chain runs on it as on any load: restore
  first, migration second, never the reverse.

## Testing for the property

Fault injection against a real profile directory, each case a boot:

- **Truncate the primary to zero bytes.** The boot stops with a classified
  error and a list whose first entry is the newest backup, marked parseable.
  Choosing it restores and the boot completes with the prior settings intact.
- **Corrupt the primary and the newest backup.** The list shows the newest
  backup as malformed and the default selection moves to the next parseable
  one.
- **Delete every backup and corrupt the primary.** The boot stops with the
  classified error and no restore offer - and does not proceed on defaults.
- **Kill the process during a save**, repeatedly. The primary is never empty
  and never half-written; the rotation never exceeds its cap.
- **Save an unchanged state ten times.** The rotation is unchanged.

A product that passes the first case and fails the fourth has a restore
surface protecting a file its own save path can still destroy.

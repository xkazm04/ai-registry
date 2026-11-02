---
layer: technique
type: technique
subject: isolated-broadcast-software-test-lane
technique: byte-exact-config-restore
status: forged
laws: []
shared_with: []
use_when: [a test run must write a configuration file the broadcasting software shares with the owner's setup, restoring configuration after a test instance exits, checking that a restore actually happened]
---

# Byte-exact config restore

When the test instance shares a configuration file with the owner's setup, the harness keeps
the file's original bytes before it writes, puts the same bytes back after the instance has
exited, and checks the result by hash. The restore is the identity function on the owner's
disk: the same bytes, or the same absence.

## Procedure

1. **List the restore set before launching.** Every file the run may write that the owner's
   setup also reads: the global settings file at minimum, plus any profile or collection
   index the software updates when a new one appears. Build the list from what the software
   is known to write, not from what the test intends to change, because the program writes
   files the test never asked it to - control-socket settings given at launch are persisted
   into the global settings on exit, and a per-session marker the program uses to detect a
   crash appears in the shared root while it runs. Record the set of such markers too, so
   the ones this run created can be told from the owner's.
2. **Snapshot raw bytes.** Copy each file's bytes, unparsed, to a backup location the
   harness owns, and record its hash; read the copy back and compare hashes before going on,
   because a backup that was never checked is a hope. Record "absent" for a file that does
   not exist; absence is a state to restore. The backup location is outside every directory
   the run publishes from: the owner's global settings hold the owner's control password,
   so the backup is a secret.
3. **Run, then stop the instance and wait for its exit.** The program writes its settings
   back on exit. A restore before exit is overwritten by it.
4. **Restore by replacement.** Write the backed-up bytes over the file through a temporary
   file and a rename, so a crash mid-restore leaves either the old or the new file, never half
   of one. Delete files recorded as absent. Remove the crash markers that appeared during
   the run, and only those, so the owner's next launch does not offer safe mode for a crash
   that was the lane's.
5. **Verify.** Hash each file again and compare it with the snapshot. Only a matching hash
   is a restore; a mismatch is a failed run regardless of what the tests said.
6. **Then, and only then,** delete the backups and the recovery manifest. Deleting the
   backups is not tidiness: they are copies of the owner's credentials and have no reason
   to exist once the restore is proven. On a failed verification they stay, in their
   private location, and the run says where.

## Why bytes and not documents

The software's settings files are line-oriented key-value documents that the program writes
in its own order, with its own encoding and line endings, including keys a parser written
against last year's version does not know. Parsing a file, changing one key and writing it
back produces a document that is "the same" to the parser and different to the program: a
dropped unknown key resets a setting; a changed encoding marker or line ending changes a
file the owner may keep under their own backup tool; a re-ordered section is a diff the
owner did not make. Restoring a document the harness re-wrote is restoring the harness's
opinion. Bytes are the only form in which "unchanged" is checkable.

The same rule forbids a "merge" restore - keeping the owner's file but undoing just the keys
the test changed. It is tempting because it would survive the owner editing settings during
the run. It cannot be verified, and the honest answer to that race is not to run while the
owner's instance is active.

## The race nobody wins

Between snapshot and restore the owner might start their software, change a setting and
close it. A byte-exact restore then reverts the owner's change. The harness narrows that
window - it refuses to start while the owner's instance runs, and re-checks before restoring
- and it compares the file's hash just before restoring with the hash it expected the test
instance to leave. When neither the original nor the expected test state is on disk,
somebody else wrote the file: the harness stops, keeps both copies, and reports instead of
choosing.

## Decision rules

- **When the restore set cannot be listed with confidence**, use a separate configuration
  root instead; a restore set that is a guess will miss the file that matters.
- **When the instance will not exit**, terminate it, then confirm it is gone before
  restoring; if it survives even a forced termination, do not restore under it - keep the
  manifest and report, because the survivor will overwrite the restore when it finally dies.
- **When a backup already exists for this file** from an earlier, unfinished session, keep
  it and do not snapshot over it; the earlier copy is the owner's state and the current
  file may be the lane's.
- **When verification fails**, the run fails and the manifest stays, so the next start
  retries the restore.

## When not to use it

With a separate configuration root the owner's files are never written; the restore set is
empty, and the hash check of the owner's files belongs to the inventory instead.

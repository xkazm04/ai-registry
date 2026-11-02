---
layer: technique
type: technique
subject: isolated-broadcast-software-test-lane
technique: metadata-only-inventory
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [proving a test run left the owner's broadcasting-software setup unchanged, deciding what a test report may record about the owner's configuration]
---

# Metadata-only inventory

The harness proves it left the owner's setup alone by taking an inventory before and after
the run and comparing them. The inventory records the **shape** of the owner's setup - which
files exist, their sizes and hashes, which profiles and scene collections exist and which are
active, how many scenes and sources each collection holds - and never its **content**.

## Why the content must stay out

The owner's broadcasting-software configuration is not neutral data. A profile's streaming
service settings can hold the stream key, which lets anyone broadcast on the owner's
channel. Browser sources carry addresses, and overlay services put access tokens in those
addresses. Text sources hold whatever was pasted into them. Capture sources name devices
and windows, which says what is on the owner's machine. An inventory that copies settings
into a report has made a portable copy of all of it, and reports are the artefacts that get
uploaded to job runs, attached to bug reports and pasted into chats.

So the inventory never opens the owner's files at all. It reads the directory: each
profile's and scene collection's path relative to the configuration root, its size and its
modification time. That record cannot carry a secret because no secret was read to make it,
and it catches the failure it exists for - a write by the lane changes a modification time
even when it restores the same size. A content hash would be a stronger witness against a
same-size, same-time rewrite, but it requires reading the stream key into the harness's
memory to prove the harness did not touch it; the files the lane backed up for restoring
are hashed anyway, and the rest are better left unopened. Where a finer question is needed -
did a scene disappear from a collection - it is asked on the owner's own screen after a
mismatch, not recorded in a published report.

The lane's own reserved profile and collection are excluded from both inventories by their
reserved names, so the lane creating and removing them does not register as a change - and
anything else under the configuration root that changed does.

## Procedure

1. Before launching, inventory the owner's configuration root: for each profile and scene
   collection, the path relative to the root, the size and the modification time, from the
   directory listing alone. The global settings file is not inventoried here; it is in the
   restore set and proved by hash there.
2. After the restore is verified, take the same inventory again.
3. Compare. Equal means the owner's setup is byte-identical where it was measured. Any
   difference fails the run, whatever the tests said, and the report names the file that
   differs - not its content.
4. Report the coverage: which parts of the owner's setup the inventory read. Plugin
   directories, a portable copy elsewhere on disk, the operating system's credential
   store - whatever was not inventoried is listed as not checked.

The inventory itself is written with the same discipline as every other output: it passes
the leak scan before it is published.

## What the comparison does and does not show

An equal inventory is evidence for the files it covers and says nothing about anything
outside them. A lane that inventoried only profiles and scene collections and reports
"owner setup unchanged" has overclaimed; the report says "profiles and scene collections
unchanged by name, size and modification time; plugins and credential store not checked". A lane that skipped the inventory reports **not checked**, not
"no changes found" ([_laws: unmeasured-is-not-pass_](../../../../_laws.md#unmeasured-is-not-pass)).

## Decision rules

- **When a check needs a setting's value** - "is the stream key empty in the test profile?"
  - read it in memory and record a boolean, never the value.
- **When names would identify the owner's content**, record counts and hashes and keep
  names to the local diagnostic on a mismatch.
- **When the inventory itself fails to read a file**, that file is not checked; it is not
  equal.

## When not to use it

On a disposable machine with no owner's setup there is nothing to protect; the inventory
of the test's own configuration is then an ordinary fixture assertion and may record
whatever the test needs.

---
layer: application
type: application
subject: settings
technique: config-backup-and-restore
stack: cpp
status: forged
verified_on: 2026-09-03
verified_against: cpp@23
---

# Config backup and restore - the settings file of a desktop chat client

How the Chatterino 2 desktop client realizes
[config-backup-and-restore](../techniques/config-backup-and-restore.md) for
its main settings file, read at commit
`fda51f0d3a4a5cd15f099b951b796e299d566e9e`. The version witness is the tree's
own build file: `CMakeLists.txt:71` declares `VERSION 2.5.5`, `CMakeLists.txt:30`
and `:100` make Qt 6 the required toolkit, and `CMakeLists.txt:281` sets the
C++ standard the tree compiles against, which is what `verified_against`
names. The restore surface is new in this release line: `CHANGELOG.md:36`
records "Added backup restore dialog if settings fail to load" against 2.5.5.

The forces are the technique's. One operator, one machine, no server copy; a
file that holds accounts, hotkeys, highlight rules and filters; and an
application that overwrites it in place whenever anything changes. The file
description the product itself shows the user says as much: "This file
contains the main application settings such as accounts and hotkeys"
(`src/singletons/Settings.cpp:192-193`).

## The write side

`Settings::Settings` (`src/singletons/Settings.cpp:175-226`) configures the
store after the load: backups enabled, **nine slots** (`:219-220`), and a save
method that is *manual* and *only if changed* (`:221-226`), combined as a bit
set. That is the technique's "save deliberately, save on change" - a settings
save is requested explicitly by the application (`src/RunGui.cpp:286`
requests one at shutdown) and an unchanged file is not rewritten, so the nine
slots hold nine distinct states rather than nine copies of the latest one.

The rotation itself is not in this tree. Backup numbering and the save
mechanics live in the vendored settings library under `lib/settings/`, which
is a submodule this checkout did not fetch; what the tree states about it is
the file naming - backups are `settings.json.bkp-N`, matched by the pattern at
`src/util/Backup.cpp:22-23` - and a load-error member named
`SavingFromTemporaryFileFailed` (`src/util/Backup.cpp:91-92`), which is evidence
that a temporary-file save path exists in the library but is not, by the
adjacent comment, enabled here ("temporary file loading/saving is not
enabled"). Whether the primary is written atomically therefore cannot be
confirmed from this tree, and the comment suggests it is not.

## The load side

`backup::loadWithBackups` (`src/util/Backup.hpp:59`, `src/util/Backup.cpp:109-139`)
is the technique's stop-list-offer loop, generic over the file. The caller
passes a `FileData` (name, directory, kind, description; `Backup.hpp:42-50`)
and a load callback returning an expected-or-error. `Settings.cpp:187-217`
supplies the classification the technique asks for: the library's `LoadError`
enum is mapped, case by case, to a message - cannot open, file handle error,
read error, seek error, "File contained malformed JSON".

The loop (`Backup.cpp:111-138`): call load; on success return; on failure log
it, and if no backup file exists (`:123-127`) return - the application
proceeds. If backups exist, construct the restore dialog with the error text
and block on it (`:129-130`); if the operator rejected, return without
retrying (`:131-134`); otherwise loop and load again.

`findBackupsFor` (`Backup.cpp:45-107`) enumerates the slots with their own
state, exactly as the technique specifies: every matching file is
**test-parsed** with a throwaway settings-manager instance (`:58-60`, `:73`)
and labelled `Ok`, `UnableToRead`, or `BadContents` (`Backup.hpp:23-31`),
alongside its modification time and size (`:97-103`). The list is ordered by
time, newest first.

## The restore surface

`RestoreBackupsDialog` (`src/widgets/dialogs/RestoreBackupsDialog.cpp`) is the
product moment. The description names the file kind, quotes the load error,
repeats the file's own description of what it holds, and asks whether to
restore the selected backup (`:72-77`). The combo box lists only parseable
backups, each with its timestamp and a relative age (`:182-215`); backups in
any other state are counted and surfaced as one warning line, "Some backups
are damaged or otherwise unreadable" (`:63-64`, `:194-198`, `:216`), so the
operator sees that history exists even where it cannot be used.

Three buttons, and they are the technique's three: **Restore Backup** copies
the chosen slot over the primary with a retry loop on copy failure
(`:92-131`), then accepts so the caller reloads; **Ignore** asks for a second
confirmation that says plainly the current file will be overwritten and any
previous settings discarded (`:133-142`); **Abort** closes the application
(`:144`). The default is the newest parseable slot because the list is
time-ordered.

## Where the realization falls short

The surface exists only at the point of failure. `RestoreBackupsDialog` is
constructed in one place (`Backup.cpp:129`), inside the load loop; there is no
menu item or command that opens it when the file parses, so an operator who
damaged their configuration in a way that still loads - deleted every
highlight rule, say - has nine good backups on disk and no way to reach them
from the product. The technique's "should also exist as a command reachable
when nothing is wrong" is unmet.

The helper is generic but has one caller. `Backup.hpp:44` lists
`window-layout.json` as an example file kind, and the design read for this
run stated that the layout file shares the helper; it does not. `grep
loadWithBackups src` returns `Settings.cpp:187` only, and `WindowManager.cpp`
loads `window-layout.json` (`:75`) through its own path with no backup
enumeration. That correction is recorded here so the next reader does not
inherit it.

And the "no backups" branch is silent toward the user. When the primary fails
to load and no slot exists (`Backup.cpp:123-127`), the loop logs at debug
level and returns, and the settings library's load failure leaves the store
empty - the application boots on defaults with no visible statement that
anything was lost. That is the exact case the technique's step 1 forbids, and
it is the state every installation is in until its first successful save
creates a slot.

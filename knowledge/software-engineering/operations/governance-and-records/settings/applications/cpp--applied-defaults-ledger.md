---
layer: application
type: application
subject: settings
technique: applied-defaults-ledger
stack: cpp
status: forged
verified_on: 2026-09-03
verified_against: cpp@23
---

# Applied-defaults ledger - the hotkey registry of a desktop chat client

How the Chatterino 2 desktop client realizes
[applied-defaults-ledger](../techniques/applied-defaults-ledger.md) for its
user-rebindable keyboard shortcuts, read at commit
`fda51f0d3a4a5cd15f099b951b796e299d566e9e`. The version witness is the tree's
own build file: `CMakeLists.txt:71` declares `VERSION 2.5.5`, `CMakeLists.txt:30`
and `:100` make Qt 6 the required toolkit (Qt 5 builds are warned as
unsupported), and `CMakeLists.txt:281` sets the C++ standard the tree compiles
against, which is what `verified_against` names.

The collection is the technique's canonical case. Every shortcut is a row
under `/hotkeys/<name>` in the settings file - category, key sequence, action,
arguments - and the user may rebind, edit, or delete any of them from the
settings page, shipped defaults included. The product ships several dozen
defaults across widget categories and adds new ones in most releases. So an
absent row cannot say whether the user removed the binding or their build
never offered it, which is exactly the ambiguity the technique exists to
resolve.

## The ledger

The ledger is a string list at `/hotkeys/addedDefaults`, stored inside the
same settings file as the rows it governs. `HotkeyController::loadHotkeys`
(`src/controllers/hotkeys/HotkeyController.cpp:239-299`) is the load procedure
from the technique almost line for line:

- `:241-248` reads the ledger into a set and records its size ("defaults
  added in settings").
- `:251` calls `addDefaults(set)` (`:333-589`), which invokes
  `tryAddDefault` once per shipped binding. `tryAddDefault` (`:591-606`) is
  the whole idempotency rule: if the name is in the set, return; otherwise
  append the binding to the in-memory list *and* insert the name into the
  set. The check is on the **name**, never on the presence of a row, which is
  what keeps a deleted default deleted.
- `:256-258` writes the grown set back to `/hotkeys/addedDefaults`,
  compare-before-set so an unchanged ledger is not a dirty write.
- `:261-292` then loads the user's rows, skipping the ledger key itself
  (`:263`) and skipping rows whose category no longer exists (`:284-288`).
- `:294-298` compares the ledger's size before and after: if any default was
  new to this installation, it forces a save, with the comment "some default
  that the user was not aware of has been added to the application, force a
  save to ensure shared state between hotkey controller and settings".

`saveHotkeys` (`:301-331`) shows the ordering discipline the technique asks
for. It reads the ledger, wipes the whole `/hotkeys` object (`:308-309`),
re-writes the ledger first (`:311-315`, with the comment explaining that the
wipe deleted it), then writes one section per binding. Ledger and rows land in
one save, so the file never carries a ledger entry without the boot that
produced it also having written the corresponding row.

`resetToDefaults` (`:558-589`) is the technique's inverse read: it clears the
ledger (`:562`), clears the in-memory list, and calls `addDefaults` again, so
every shipped binding returns.

## The cost, stated in the tree

`src/controllers/hotkeys/README.md` § "Renaming defaults" is the technique's
identity clause written by someone who hit it: "Renaming defaults is currently
not possible. If you were to rename one, it would get recreated for everyone
probably leading to broken shortcuts, don't do this until a proper mechanism
has been made." The tree has no tombstone mechanism, so the only safe change
to a shipped default's name is none. The name is also the row's key in the
settings file, so the same string carries both identities the technique says
must survive.

What the tree has instead of tombstones is `warnForRemovedHotkeyActions`
(`:582-589`, `:621`): when an *action* is retired, bindings that still name it
are collected as removed-or-deprecated and surfaced to the user rather than
deleted, which matches the technique's "the ledger is not a licence to delete".

## Where the realization falls short

The ledger and the rows share a file and a save, which is the right coupling,
but the ledger is the *only* migration mechanism the settings store has:
`Settings::migrate` (`src/singletons/Settings.cpp:81-83`) is an empty function.
Every shape change to a stored value therefore has to be absorbed by lenient
reads - `loadHotkeys` skips a row whose category, key sequence, or action is
empty (`:278-281`) rather than transforming it - which is the failure the
technique's decision rule warns about: the ledger is being asked, by absence
of any alternative, to cover changes it cannot express. A rename of a hotkey
*category*, for instance, would drop every binding under the old name
silently at `:284-288`. The technique's "version chain owns shape, ledger owns
membership" has only its second half here.

Two smaller gaps. Nothing checks at build time that shipped default names are
unique; `tryAddDefault` would silently skip the second of two defaults sharing
a name. And the reset path clears the ledger before re-adding, so a crash
between `:562` and the save leaves an empty ledger beside a full collection -
harmless on the next boot only because `tryAddDefault` is keyed by name and
the in-memory list is rebuilt from scratch, not because the order was chosen
for it.

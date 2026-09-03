---
layer: application
type: application
subject: untrusted-extension-host
technique: safe-mode-registration
stack: cpp
status: forged
verified_on: 2026-09-03
verified_against: cpp@23
---

# The record is created before the check, and the settings button cannot hide

`Chatterino/chatterino2` at `fda51f0d3a4a5cd15f099b951b796e299d566e9e`,
version 2.5.5 per `CMakeLists.txt:71`, built against Qt 6
(`CMakeLists.txt:30,100`) in C++23 (`CMakeLists.txt:281`), starts with a
`--safe-mode` switch whose help text is the technique's decision rule in
twelve words: "Starts Chatterino without loading Plugins and always show the
settings button" (`src/common/Args.cpp:157-159`). The flag is parsed into a
boolean on the argument object (`:273-276`) and read from there by exactly
four consumers - the plugin loader, the tab bar, the settings page, and the
window title - none of which is the settings store.

## Register everything, run nothing

`PluginController::load` (`src/controllers/plugins/PluginController.cpp:313-353`)
is where the order matters. A fresh interpreter state is created, the `Plugin`
record is constructed from the parsed manifest, inserted into the plugin map,
and the change notification is queued (`:316-321`) - all before the safe-mode
check at `:323-329`. The comment at `:325` gives the reason the technique
gives: "This isn't done earlier to ensure the user can disable a misbehaving
plugin." Only after that return does `openLibrariesFor` run (`:330`), and only
after the per-plugin and global enable checks (`:332-338`) does `luaL_dofile`
execute the entry file (`:344`). In safe mode the record exists, the settings
page can list it, and no library was opened.

The predicate on the settings page carries what the count alone would not.
`PluginsPage` (`src/widgets/settingspages/PluginsPage.cpp:81-88`) disables the
global "Enable plugins" checkbox and adds a label: "Plugins will not be fully
loaded because Chatterino is in safe mode. You can still enable and disable
them." The per-plugin enable toggles remain live and write
`enabledPlugins` (`PluginController.cpp:438-441` reads it back). The Reload
button is disabled (`PluginsPage.cpp:273-276`), because reload erases and
re-runs `tryLoadFromDir` (`PluginController.cpp:356-389`), which is code
execution. Live for persisted decisions, muted for run-now: the split the
technique draws, drawn here control by control.

## The entry cannot be hidden

The tab bar owns the settings button, and its visibility normally follows a
`hidePreferencesButton` setting. `Notebook.cpp:1569-1573` overrides that
unconditionally in safe mode, with the comment "This is to ensure you can't
lock yourself out of the settings". The window title appends " (safe mode)"
(`src/widgets/Window.cpp:822-825`), so the state travels in a screenshot.

## The flag lives on the launch surface

`safeMode` is a field of `Args` (`src/common/Args.cpp:273-276`), populated by
the command-line parser and never written to `Settings`. A corrupt settings
file cannot prevent safe mode from engaging, and a safe-mode session cannot
leave the client in safe mode: the next start without the switch is a normal
start. Both properties fall out of the placement rather than of any code that
enforces them.

## What the realization cannot do

The tree has no host-initiated skip to keep this distinct from - plugins are
one in-process tier with no isolation runner - so the technique's "two states,
not one" rule is untested here. `tests/src/Plugins.cpp` drives the loader
through a test-only accessor and never sets the flag; the recovery path is
exercised by hand. Safe mode also does not
reach the manifest-invalid case in the same way: a plugin whose `info.json`
fails validation is registered as an `UnloadedPlugin` (`PluginController.cpp:127-141`)
regardless of the flag, which is correct, but the two "registered, not
running" states - operator-requested and manifest-refused - are distinguished
only by which log line fired, not by a field the settings page renders. And
the outermost surface is the window title (`Window.cpp:809-827`); an
invocation that loads no main window (`Args.hpp:64`, `dontLoadMainWindow`)
carries no indication that safe mode is on.

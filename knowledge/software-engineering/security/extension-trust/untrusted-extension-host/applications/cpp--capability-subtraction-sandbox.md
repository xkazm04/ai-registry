---
layer: application
type: application
subject: untrusted-extension-host
technique: capability-subtraction-sandbox
stack: cpp
status: forged
verified_on: 2026-09-03
verified_against: cpp@23
---

# A full standard library, seven survivors, and a ceiling the docs admit is absent

`Chatterino/chatterino2` at `fda51f0d3a4a5cd15f099b951b796e299d566e9e` is a
C++ desktop chat client, version 2.5.5 per `CMakeLists.txt:71`, built against
Qt 6 (`CMakeLists.txt:30,100`) in C++23 (`CMakeLists.txt:281`). Its plugins are
Lua 5.4 scripts loaded in-process through sol2, and its sandbox is the
technique in its purest form: the interpreter's standard library is opened
and then cut down, module by module, with the reason for each cut written as
a comment beside it. The plugin documentation opens with the honest ceiling -
"while there are attempts at making this decently safe, we cannot guarantee
safety" (`docs/wip-plugins.md:3-5`) - which is the sentence the technique asks
for and the one most hosts never write.

## The subtraction, with its reasons

`PluginController::openLibrariesFor` (`src/controllers/plugins/PluginController.cpp:146-233`)
is the whole runtime construction. A static table at `:151-165` lists what is
opened: base, coroutine, table, string, math, utf8, package. The operating
system module is present in that table as a commented-out line with its
reason stacked beneath it - "fs access", "environ access", "exit"
(`:158-161`) - which is the written-reason-per-denial rule realized as source
rather than as a wiki page. The debug module gets the strongest warning in the
file (`:167-169`): "Do not add debug library to this, it would make the
security of this a living nightmare due to stuff like registry access". What
the plugin sees as `debug` is a fresh table holding one function, `traceback`
(`:227-230`).

The dynamic loaders go next. `loadfile` and `dofile` are set to nil
(`:192-193`); `package.path` and `package.cpath` are emptied (`:197-199`); the
three default searchers are popped from `package.searchers` by index, leaving
only preload, and two host searchers are appended (`:201-210`).
`searcherAbsolute` (`src/controllers/plugins/LuaAPI.cpp:202-216`) resolves a
module name under the plugin's own load directory; `searcherRelative`
(`:218-243`) resolves it beside the calling file; both funnel into
`loadfile` (`:156-169`), which refuses anything outside the plugin directory
and, per the comment at `:167`, deliberately withholds the resolved path from
the error message so the refusal does not leak the profile layout.
`package.loadlib` is a stub that throws (`:257-260`), and the string-to-code
`load` is replaced by `g_load` (`:139-154`), which in release builds throws
"load() is only usable in debug mode" and in debug builds forwards to the
real loader stashed in the registry as `real_load` (`PluginController.cpp:187-189`).

## The retained capability behind a shim

File access is the capability the tree keeps, and it keeps it exactly as the
technique prescribes. The real io module is opened with the global flag false
and stored in the registry under a private name (`PluginController.cpp:176-177`);
the plugin-visible `io` is a new table carrying only `type` from the original
(`:214-217`); the loaded-module cache entry is overwritten so that
`require("io")` returns the shim (`:219`); and the interpreter's default input
and output streams are nulled so the plugin cannot write into the host's
console (`:222-223`). Every shim function is then bound in `initSol`
(`:281-300`). The one to read is `io_open`
(`src/controllers/plugins/api/IOWrapper.cpp:110-141`): it resolves the
requested filename against the plugin's `data/` directory first (`:123-124`),
then asks `Plugin::hasFSPermissionFor` (`src/controllers/plugins/Plugin.cpp:111-124`),
which checks that the absolute path is a child of the data directory *before*
it looks at the declared permission. A grant can therefore only widen access
to a location already inside the plugin's own space, and the same predicate
guards `io.lines` (`IOWrapper.cpp:170`) - one door for every path the shim
opens.

## What the realization cannot do

The ceiling is empty and the tree says so, but it says so in prose only.
Plugins run on the GUI thread - `SignalCallback::operator()` asserts it
(`src/controllers/plugins/SignalCallback.hpp:61-63`) - so an infinite loop is a
frozen client and there is no instruction-count hook, wall-clock bound or
memory ceiling anywhere in the plugin controller. The subtraction contains
reach, as the technique promises, and nothing else.

Three smaller shortfalls. The published allowlist and the loaded one have
already drifted: `docs/wip-plugins.md:122-129` lists `_G`, `io`, `math`,
`string`, `table`, `utf8`, and omits `coroutine` and `package`, both of which
`openLibrariesFor` opens - the drift the technique's enumeration test exists
to catch. `tests/src/Plugins.cpp` tests the shim's refusal without a grant
(`ioNoPerms`, `:554-597`) and that a file under `data/` cannot be required as
code (`requireNoData`, `:599-620`), but nothing in the suite walks the
plugin's globals and compares them to a published set. The searchers are removed
by position (`PluginController.cpp:204-208` pops three times), which is
correct for the interpreter version pinned today and silently wrong the day an
upstream release reorders or extends the list. And the author's own doubt is
in the tree - "this might not be fully secure? some kind of metatable fuckery
might come up?" (`:185`) - which is precisely the class of escape only a walk
of the reachable globals would settle.

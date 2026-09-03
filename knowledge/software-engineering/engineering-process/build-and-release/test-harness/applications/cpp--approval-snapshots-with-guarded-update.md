---
layer: application
type: application
subject: test-harness
technique: approval-snapshots-with-guarded-update
stack: cpp
status: forged
verified_on: 2026-09-03
verified_against: cpp@23
---

# 130 JSON snapshots over the message builder, with a constant the pipeline asserts

Read against Chatterino 2.5.5 (`CMakeLists.txt:71`, Qt 6 required per
`CMakeLists.txt:30,100`) at commit `fda51f0d3a4a5cd15f099b951b796e299d566e9e`.
The approval-test library is `tests/src/lib/Snapshot.hpp` / `Snapshot.cpp`;
the cases live under `tests/snapshots/` in four categories -
`IrcMessageHandler` (111 files), `PluginMessageCtor` (9), `EventSub` (8,
nested one level), `ImageUploader` (2). The design read's count of 214 is
not what this checkout holds; 130 is.

## The decision, as the tree makes it

Each case is one JSON file with `input`, optional `params`, optional
`settings` (merged over a base settings document by `mergedSettings`,
`Snapshot.cpp:251-263`) and `output` (`Snapshot.cpp:216-224`). The suite
discovers cases by listing the category directory (`Snapshot::discover`,
`Snapshot.cpp:171-180`) and instantiates one parameterized test per file
(`tests/src/IrcMessageHandler.cpp:662-664`). The output under test is the
built message serialized with `toJson()` - the rich element tree the
technique names as the case for approval testing over field assertions
(`IrcMessageHandler.cpp:648-652`).

The record switch is the technique's third shape exactly:

```cpp
/// Controls whether snapshots will be updated (true) or verified (false)
///
/// In CI, all snapshots must be verified, thus the integrity tests checks for
/// this constant.
constexpr bool UPDATE_SNAPSHOTS = false;
```

(`IrcMessageHandler.cpp:56-63`.) `Snapshot::run(got, updateSnapshots)`
writes and returns `true` when the flag is on, compares when it is off
(`Snapshot.cpp:205-214`) - so record mode is a pass for every case, and the
guard is the integrity test beside the suite:

```cpp
TEST(TestIrcMessageHandlerP, Integrity)
{
    ASSERT_FALSE(UPDATE_SNAPSHOTS);  // make sure fixtures are actually tested
}
```

(`IrcMessageHandler.cpp:666-669`.) The library's own documentation ships
the pair as its minimal example (`Snapshot.hpp:42,57-59`). The switch is
per category, not global: each of the four snapshot-using test files
declares its own constant and its own integrity test
(`tests/src/EventSubMessages.cpp:31,361`, `ImageUploader.cpp:24,347`,
`Plugins.cpp:46,1721`), so re-baselining the message handler cannot
re-record the uploader. The pipeline runs the whole suite through `ctest`
on every push and pull request (`.github/workflows/test.yml:80`), which is
where a forgotten `true` becomes a red build.

The comparison is structural with a path: `compareJson` walks arrays and
objects, requires equal sizes at every object so an added key fails, names a
type mismatch as such, and reports the first divergence with a dotted path
such as `output[3].elements.text` (`Snapshot.cpp:19-90`). The assertion
message also prints both documents in full (`IrcMessageHandler.cpp:656-659`).

The ritual is documented as four steps plus the reading: flip, run, flip
back, run, "take a look at the changes made to the snapshot json files to
ensure that it looks correct" (`tests/README.md:17-27`); a new case starts
as `{ "input": "..." }` and is recorded once with the instruction "Make sure
to verify the output!" (`IrcMessageHandler.cpp:60-62`).

## Where it falls short of the technique

**The written README names one switch; the tree has four.** `tests/README.md:22`
points the re-baseliner at the constant in `IrcMessageHandler.cpp` only.
Someone changing the plugin message constructor or the uploader will find
the documented switch does nothing for their category and has to discover
the sibling constants by grep. The per-category design is right; the
document describing it is a quarter complete.

**Record mode reports success.** `run` returns `true` after writing
(`Snapshot.cpp:207-211`), so a category in record mode passes every case;
the only signal is the integrity test. That is the design the technique
describes, but it means the guard is exactly one assertion deep - a
`--gtest_filter` that excludes `*Integrity*` runs a record-mode suite green.
Nothing in the tree filters that way; nothing prevents it either.

**No second-path check.** The technique asks that the constant be the only
input to the record decision. It is, today, by inspection (`Snapshot::run`
takes a bool and reads nothing else), but no test asserts it, and a future
convenience such as an environment override would not be caught by anything
but review.

**Nondeterminism is handled outside the comparison.** The serialized message
carries no timestamps or generated identifiers in the recorded output, so the
suite is stable without normalization; that is a property of `toJson()`, not
of the snapshot library, and a new field with run-to-run variance would fail
on every run until someone noticed.

**A neighbouring harness choice worth one sentence.** The same pipeline runs
`ctest --repeat until-pass:4` (`test.yml:80`), retrying any failing test up
to four times before calling it red. That is a flake-masking retry, not the
recording retry this subject's flake-lifecycle technique asks for; it does
not touch the snapshot guard (an integrity failure is deterministic and
fails all four times), but it is the kind of retry a snapshot with a
nondeterministic field would hide behind.

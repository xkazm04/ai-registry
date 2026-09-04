---
layer: application
type: application
subject: test-input-generation
technique: inside-out-invariants
stack: cpp
verified_on: 2026-09-04
verified_against: cpp@14
proof: structural-only
---

# A 194-line checking entry point, asserted 775 times across fourteen suites (C++/Qt, a video editor's timeline model)

Version witness: `src/CMakeLists.txt:310`, `CXX_STANDARD 14`, commit `b7124d97`.
This tree implements the technique's four procedural steps closely enough to be
worth reading as a reference realization, and it diverges on one — which is the
part worth writing down.

## Step 2, done the way the technique says to do it

The technique's second step is the one teams get wrong: *expose a checking
entry point, not the state.* This tree exposes `checkConsistency()` as a member
of the model that must maintain the invariant, at every level of the hierarchy:

| Level | Declaration |
| --- | --- |
| Whole timeline | `src/timeline2/model/timelinemodel.hpp:1062` |
| Group hierarchy | `src/timeline2/model/groupsmodel.hpp:157` |
| Individual clip | `src/timeline2/model/clipmodel.hpp:268` |
| Effect stack | `src/effects/effectstack/model/effectstackmodel.hpp:145` |
| Generic tree model | `src/abstractmodel/abstracttreemodel.hpp:101` |
| Keyframe list | `src/assets/keyframes/model/keyframemodellist.hpp:172` |
| Whole document | `src/doc/kdenlivedoc.h:308` |

The top-level checker is 194 lines and reaches across components exactly as the
technique describes: it verifies the model's own state against the underlying
engine's playlist state, which is the cross-component relationship no caller
can observe. It also takes an argument — `checkConsistency(const
std::vector<int> &guideSnaps)` — so the caller supplies the external facts the
model cannot know, rather than the checker reaching for a global.

The parallel access mechanism is `friend class KdenliveTests`, declared in
fifteen production classes. `tests/test_utils.hpp:25` carries the previous
approach as a commented-out line — `// #define private public` — which makes
this tree a recorded migration from the blunt instrument to a single named
door, and the corpus's own preference (one narrow, named, reviewable surface)
is what it migrated *to*.

## Step 3, at a frequency the technique calls affordable in a slow lane

775 `checkConsistency()` assertions across fourteen test files, concentrated at
transitions rather than at idle points: after each operation and again after
its undo. `tests/modeltest.cpp` carries 138, `tests/trimmingtest.cpp` 64,
`tests/groupstest.cpp` 52, and the machine-generated `tests/regressions.cpp`
448. The technique's cost discipline says continuous checking is O(state)
against an O(1) operation and is worth its runtime in a slow lane; this tree
pays it unconditionally in a suite that is not the fast gate.

## Where it diverges: step 4 is only half done

The technique's fourth step — *assert both directions of every relationship* —
is where it predicts teams under-invest, and the prediction holds here.
`groupsmodel.hpp` declares

```cpp
bool checkConsistency(bool failOnSingleGroups = true, bool checkTimelineConsistency = false);
```

The second parameter defaults to **false**: the group hierarchy checks itself
by default and only optionally checks that it agrees with the timeline. So the
direction "every group member is a live timeline item" is verified on request,
and the inverse direction is the one a caller has to remember to ask for. The
technique names this exactly — *"teams write the first overwhelmingly more
often than the second, and the missing half is where the silent data loss
hides"* — and the default value of a boolean parameter is where it hid.

This is a confirmation rather than a criticism of the tree. A default that
makes the weaker check the cheap one is precisely the shape the technique
predicts, found in a codebase that otherwise implements the technique unusually
well.

## What this realization cannot do

- Nothing measures whether the invariant checker itself is correct. There is no
  negative control — no test that mutates the model into a known-bad state and
  asserts that `checkConsistency()` returns false — so the 775 assertions
  establish that the checker did not fire, not that it can.
- The checker is not gated out of release builds; it is simply not called
  there. A team copying this should decide whether they want the compile-time
  gate the technique's step 2 mentions.

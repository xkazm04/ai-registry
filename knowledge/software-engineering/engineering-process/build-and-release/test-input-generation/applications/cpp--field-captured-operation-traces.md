---
layer: application
type: application
subject: test-input-generation
technique: field-captured-operation-traces
stack: cpp
verified_on: 2026-09-04
verified_against: cpp@14
proof: structural-only
---

# One reflection table, 92 trace sites, and a regression file where 448 of the suite's 775 invariant assertions live (C++/Qt, a video editor's timeline model)

The tree is a desktop non-linear video editor; the version witness is
`src/CMakeLists.txt:310`, which pins `CXX_STANDARD 14` on the library target,
read at commit `b7124d97`. It carries the fourth input lane in full: a logger
instrumenting the production model, a fuzzer drawing from the same vocabulary,
a reproducer that consumes either, and a regression file the reproducer writes.

## The four pieces and the single vocabulary

| Piece | Where | What it does |
| --- | --- | --- |
| The vocabulary | `RTTR_REGISTRATION` blocks in `src/definitions.cpp`, `src/bin/projectclip.cpp`, and the model classes | Registers model classes and their mutating methods in a runtime reflection table |
| The logger | `src/logger.hpp`, `src/logger.cpp` | Records top-level calls against that table; 92 `TRACE*` sites in `src/` |
| The generator | `fuzzer/fuzzing.cpp` | Composes random operation sequences in the same vocabulary |
| The reproducer | `fuzzer/main_reproducer.cpp` | Reads a trace on stdin and executes it |
| The corpus | `tests/regressions.cpp` | 1,567 lines of emitted cases, in the ordinary suite |

The registration table is the load-bearing part and it is what makes this an
instance of the technique rather than of "log user actions". The logger does
not know about the user interface at all; it names operations the way the model
names them, which is the way the fuzzer names them, which is why one reproducer
consumes both.

## The three mechanisms the technique specifies, each confirmed

**Depth suppression exists and is documented as the reason.** `logger.hpp`
states it in the class comment: *"many modifier functions of the models are
nested. We are only interested in the top-most call, and we must ignore bottom
calls."* `Logger::start_logging()` returns false for a nested call and the
caller must not log. Without this the trace of a group move would contain the
per-item moves as siblings of the group move, and replaying it would perform
each item's move twice.

**The persisted artifact is generated source, not a seed and not a blob.**
`Logger::print_trace()` (`src/logger.cpp:150`) walks the recorded calls and
renders each argument as a C++ literal by type — `int`, `double`, `bool`,
enumerations as `Enum::VALUE`, strings quoted, sets as brace-initializers — and
objects created earlier in the trace as the generated names they were filed
under. The output is compilable test code. This is the strongest available form
of the subject's own rule that a failure is persisted as the derived input:
when the model's vocabulary changes, the stored cases fail to *compile*, which
is the loud outcome, rather than deserializing into a neighbouring case that
passes.

**Reversal is in the vocabulary.** `Logger::log_undo(bool)` records undo and
redo as trace events, and the emitted regression cases open with
`undoStack->undo(); undoStack->redo(); undoStack->redo(); undoStack->undo();`
before the operations begin. A trace that omitted reversal would replay a
history the user did not have, and this model's compositional defects live
precisely there.

## The count that makes the economic argument

The suite asserts a whole-model invariant — `TimelineModel::checkConsistency()`,
194 lines, the subject's `inside-out-invariants` technique realized — after
state transitions. Across `tests/`:

- **775** `checkConsistency()` assertions in total
- **448** of them in `tests/regressions.cpp` alone, the machine-emitted file
- **327** across all fourteen hand-written test files combined

The generated lane asserts more about this model than every hand-written case
put together, and it cost no author time per entry. That is the technique's
economic claim, measured: the entries were pre-filtered by having actually
broken something, and the minimizer wrote them.

## The structural fact, and it is the negative one

`fuzzer/main_reproducer.cpp` installs handlers for `SIGINT`, `SIGTERM`,
`SIGABRT` and `SIGSEGV`, and every one of them calls `Logger::print_trace()`
before exiting. The crash prints its own reproduction. Nothing else in the tree
does this — it is a property the defect-capture loop has and the application
does not.

Which is exactly the gap. The `TRACE` macros are compiled into the fuzzer and
the reproducer; the shipped application does not install the signal handlers
and does not emit a trace when a user's session dies. So this tree implements
the *mechanism* of the fourth lane completely and does not currently run the
lane: the sequences it captures are the fuzzer's, and the field's are still
arriving as prose bug reports. The technique's third cost — *"instrumentation
that is not always on is not a field lane"* — is not a hypothetical here; it is
this tree's actual state, and it is one signal-handler registration and a
consent prompt away from not being.

That is worth writing down plainly, because the reason to copy this design is
the lane, and the tree that demonstrates the design best has built everything
except the lane.

## What this realization cannot do

- No privacy or redaction machinery exists. `print_trace` renders file paths
  and clip names as quoted literals with no per-type redaction, which is fine
  for a developer running the fuzzer and is the blocking issue for shipping the
  capture to users. The technique's fourth prohibition has no realization here.
- There is no assertion that a stored regression case still reproduces the
  defect it recorded. The cases compile and pass; nothing checks that any of
  them would fail against the code before its fix.
- The vocabulary is maintained by hand. A model method added without an
  `RTTR_REGISTRATION` entry is invisible to both the fuzzer and the logger, and
  nothing in the build detects it.

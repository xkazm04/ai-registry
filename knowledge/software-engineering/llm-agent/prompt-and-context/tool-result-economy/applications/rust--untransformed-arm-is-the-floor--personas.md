---
layer: application
type: application
subject: tool-result-economy
technique: untransformed-arm-is-the-floor
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.80.0
applied: code
ab_verdict: better
proof: ab-paired
---

# A KPI reading taken from a program that never started

The tree is personas, an open-source desktop agent platform, read and changed
on its `master` at commit `3de69f5027`; its desktop manifest declares
`rust-version = "1.80.0"`. This application is the technique's failure-shape
section at a transform that is not a compressor: a parser that reduces a
command's output to one number - a lint count, a coverage figure - which is
stored as a KPI reading with the output's tail as evidence and read back by
the operator and the agents that work on the project. It stands where the
technique's rule says it must: between a tool's output and the verdict a
reader takes from it.

## The seam

The measurement path deliberately ignores the exit code, and the comment says
why: `src-tauri/src/engine/kpi_eval.rs:252 "Exit code is NOT a failure by itself"`
- lint counters exit non-zero when they find what is being counted. The parse
strategies are a first-number regex by default,
`src-tauri/src/engine/kpi_eval.rs:180 "regex:([\\d.]+)"`, and a count of
non-empty lines,
`src-tauri/src/engine/kpi_eval.rs:280 "return Some(output.lines().filter(|l| !l.trim().is_empty()).count() as f64);"`.
Neither recognises a run; both read whatever text arrived. With the program
missing, the shell's own message was that text. Measured on this machine:

| Command, program missing | Exit | What was recorded |
| --- | --- | --- |
| POSIX shell, `tool . \| wc -l` | 0 | `0` - a clean reading |
| POSIX shell, `tool .` | 127 | `1`, the line number in the shell's message |
| platform shell, `tool .`, line count | 1 | `2`, the message's two lines |
| platform shell, `tool . \| find /c /v ""` | 255 | `2` by line count |

The seam was chosen to falsify the obvious fix, an exit-code check. It did:
the platform shell exits 1 for a missing program, the code a linter uses for
"errors found", and the POSIX pipeline exits 0. Only the shell's own line on
standard error tells "did not run" apart.

## The change

A predicate that reads that line, plus the reserved 126 and 127 off the
platform where they are not reserved,
`src-tauri/core/src/utils/process.rs:139 "pub fn shell_reported_not_run(exit_code: Option<i32>, stderr: &str) -> bool {"`,
consulted before the parser can see the text,
`src-tauri/src/engine/kpi_eval.rs:241 "if personas_core::utils::process::shell_reported_not_run(out.status.code(), &stderr) {"`.
A run it flags returns the same validation error as a parse that matched
nothing, so no reading is stored.

## The proof

Paired over the captured runs. Arm A is the shipped parse over the captured
output: 0, 1 and 2 recorded for runs that never started. Arm B is the error
for all four, pinned in
`src-tauri/core/src/utils/process.rs:222 "fn a_missing_program_is_reported_whatever_the_exit_code() {"`.
The floor is the runs that must still parse - a linter that found errors with
nothing on standard error, a tool's own "config file not found", a package
registry's 404 - pinned in
`src-tauri/core/src/utils/process.rs:241 "fn a_program_that_ran_is_not_reported() {"`.
Core tests passed, clippy with warnings denied was clean on the library, and
the desktop crate compiled.

## What this realization cannot do

It recognises the platform shell's English message only; that message follows
the display language. And it covers a program that never started, not one that
started and failed: a package runner that fetched nothing still prints its own
error, and the first-number parse still takes the 404 from it. The technique's
stronger rule - issue a reading only when the exit status and a recognised
summary agree - needs a per-tool notion of what the summary looks like, which
the configurable parse strategies do not have.

---
layer: application
type: application
subject: tool-result-economy
technique: untransformed-arm-is-the-floor
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.91
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# A floor held per call and lost at the invocation

The tree is rtk, an open-source command proxy that rewrites a coding agent's
shell commands to run through it and compresses their output, read at commit
`f53e6033` on its default branch. The version is the one every manifest
declares, `rust-version = "1.91"`; the binary measured below was built from
that commit with rustc 1.97.1. Its changelog carries roughly 88 fixes for
output that hid something the agent needed and about 40 for a false status or
count, which is why three of this technique's four places are visible in it.

## The per-call guard, and why it is a comparison

The guard is one function at the printer,
`src/core/guard.rs:21 "pub fn never_worse<'a>(raw: &'a str, filtered: &'a str) -> &'a str {"`,
stated as an invariant in the module's first line,
`src/core/guard.rs:1 "Never-worse output guard: RTK never emits more tokens than the raw command."`.
Its comment records the rejected alternative and why it was rejected - an
allowance above raw sat below the shortest useful message,
`src/core/guard.rs:9 "fixed allowance above raw was tried and could not be met by construction"` -
and its two exceptions are named by case, not by count. It landed as a fix,
`CHANGELOG.md:456 "never-worse output guard so RTK never exceeds the raw command"`.

## Failed and unrecognised runs

The false clean is in the history in so many words,
`CHANGELOG.md:403 "stop reporting a failed tool run as clean"`: a type checker
that was not installed was reported as finding no issues, and a test runner's
collection error as "no tests collected", until both fell back to raw output
when the process failed and nothing was recognised. The commit's own message
names an open residue - a count parser with no error branch still reports a
fixture error as passes - so the rule is applied per filter, not structurally.

The unparsed stream is handled the way the technique states it. A
stdout-parsing filter forwards stderr whole when the run failed or stdout came
back empty, `src/core/runner.rs:374 "Whole, whenever stderr is the report: the command failed, or the filter had nothing to show"`,
decided at `src/core/runner.rs:399 "if exit_code != 0 || shown_stdout.trim().is_empty() {"`,
and on a successful run caps it from the end,
`src/core/runner.rs:383 "The cap keeps the END. A tool resolves and downloads before it builds, so its chatter comes"`.

## The crash path the documents describe and the code does not take

Both contributor documents promise the fallback:
`docs/contributing/ARCHITECTURE.md:36 "If filtering fails, fall back to original output"`
and `docs/contributing/TECHNICAL.md:61 "Graceful degradation: filter failure falls back to raw output"`.
The main path calls the filter with no catch around it,
`src/core/runner.rs:323 "let filtered = filter_fn(text_to_filter, exit_code);"`.
The only catch in the capture layer prints
`src/core/stream.rs:630 "filter panicked"` and lives in a buffered mode,
`src/core/stream.rs:244 "Buffered(Box<dyn Fn(&str) -> String + 'a>),"`,
that only a test constructs. The release build does keep unwinding, but for a
different catch - the post-tool hook's -
`Cargo.toml:115 "as the fail-open net that keeps a panicking filter"`. Read
from the code, not run: a filter panic on the main path unwinds out of the
command with neither captured stream printed.

## The arm the injected format moved

For a test runner and a linter the proxy asks the tool for its structured
format and parses that,
`src/cmds/go/go_cmd.rs:56 "if !skip_json {"` and
`src/cmds/python/ruff_cmd.rs:79 "--output-format=json"`. The guard's raw arm
is then the structured output. Measured on this machine with the built binary,
on a five-test suite with one failure:

| Arm | Bytes |
| --- | --- |
| plain test runner, as the agent would have run it | 73 |
| structured form the proxy injected (the guard's raw) | 3,024 |
| what the proxy emitted | 224 (about 170 without a one-line install notice) |

The guard did not fire, because 224 is below 3,024, and the run was booked as
a 95.1% saving. Against the untouched path the agent read about three times
what it would have read without the proxy. The same tree knows the remedy and
applies it once: for one command it runs the plain form separately to have an
honest baseline, `src/cmds/git/git_cmd.rs:2332 "let mut raw_cmd = git_cmd_c_locale(global_args);"`.

## What this realization cannot do

The guard compares estimates, not tokens, so a near-tie can resolve either
way; and it cannot see an arm the code never produced. Where the invocation is
the consumer's own, it holds the floor on every call. Where the proxy changed
the invocation, it holds a floor the consumer never stood on.

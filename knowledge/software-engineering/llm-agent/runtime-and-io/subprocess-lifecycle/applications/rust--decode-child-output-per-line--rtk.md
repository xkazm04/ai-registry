---
layer: application
type: application
subject: subprocess-lifecycle
technique: decode-child-output-per-line
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.91
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# The right walk under the wrong page

The tree is rtk, an open-source command proxy that compresses the output of
the commands a coding agent runs, read at commit `f53e6033` on its default
branch. The version is the one the tree witnesses: every manifest declares
`rust-version = "1.91"`; the experiment below was built with rustc 1.97.1.

## The walk is the technique, almost clause for clause

The decode lives in one function every capture site is meant to call,
`src/core/utils.rs:783 "pub fn decode_process_output(bytes: &[u8]) -> String {"`.
A buffer that is valid UTF-8 returns untouched; otherwise the walk splits on
the newline, keeps valid lines and hands only the rest to a legacy decoder. Its
comment gives the reason the unit is the line rather than a byte run - a
four-byte legacy sequence embeds bytes in the ASCII range, so a run boundary
splits characters - and a legacy result is accepted only when it is clean,
`src/core/utils.rs:820 "A code page result is only accepted when it decodes cleanly."`.
An unmapped page warns once rather than silently,
`src/core/utils.rs:849 "fn warn_unmapped_codepage(cp: u16) {"`.

The testability decision is stated twice, once where it is made and once in
the manifest that pays for it: the code page arrives as a parameter,
`src/core/utils.rs:803 "Takes the code page as a parameter so the walk and the mapping are"`,
and the decoding crates are deliberately not platform-gated,
`Cargo.toml:57 "Console code page decoding for child-process output. Kept off the"`,
so the walk and the tables compile and are tested on every runner while only
the lookup is platform-specific.

The streamed path carries the failure that motivated it as a doc comment: a
reader that chains `map_while` over line results stops at the first undecodable
line and drops everything after it,
`src/core/stream.rs:16 "so one invalid-UTF-8 line"`.
The changelog records the decoder landing as a fix, not a feature,
`CHANGELOG.md:233 "decode process output using Windows console code page"`.

## The page it picks when there is no console

The lookup asks for the console's output page and, when that returns zero,
falls back to the ANSI page,
`src/core/utils.rs:890 "windows_sys::Win32::Globalization::GetACP()"`,
on the belief stated in its comment,
`src/core/utils.rs:872 "console program writing to a pipe uses the ANSI code page instead, so"`.

A tool in this position runs with no console of its own most of the time -
under an agent's hook, output piped - so that fallback is the common path, and
it was measured. On a machine with OEM page 852 and ANSI page 1250, from a
parent with no console, the system shell's `echo` of a nine-letter Czech word
arrived as the bytes `A6 6C 75 9C 6F 75 9F 6B EC`. Three decodes of those
bytes:

| Arm | Result | What the reader sees |
| --- | --- | --- |
| lossy UTF-8 (the tree's previous behaviour) | four of nine letters replaced | visibly damaged |
| page 1250 (the tree's console-less fallback) | decodes with **no error**, four letters wrong | plausible, wrong |
| page 852 (the page the shell wrote in) | exact | correct |

The decode is accepted because single-byte page 1250 maps every byte; the
"accepted only when it decodes cleanly" guard cannot fire. So on this machine
the fallback replaced a visible loss with an invisible one, which is why the
verdict above is `not-better` for the fallback and not for the walk: the walk
is right, and the page choice under it is a claim about what children write
that the measurement contradicts for the system shell's own output. Which page
a given program writes in is per program; the corrective the technique states
is to capture a known word from the tools actually spawned and decode it under
the chosen page.

## Adoption inside the tree

The decoder is called at 15 sites; `String::from_utf8_lossy` over a child's
captured output is still used at 15 others, including the task runner,
`src/core/task_cmd.rs:158 "content.push_str(&String::from_utf8_lossy(&output.stdout));"`.
One decision point that half the capture sites do not call is the shape the
technique's first rule exists to prevent.

## What this realization cannot do

It cannot know what a child wrote; it can only know what the child did not
write, which is valid UTF-8. Every legacy page it picks is a guess, and its own
comment says so. The guess is only ever consulted for bytes that already failed
UTF-8, which bounds the damage to those lines - but within them a wrong
single-byte page turns a visible loss into an invisible one.

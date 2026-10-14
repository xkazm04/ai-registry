---
layer: application
type: application
subject: subprocess-lifecycle
technique: decode-child-output-per-line
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.80.0
applied: code
ab_verdict: better
proof: ab-paired
---

# One decode for the shell's own lines, in a host with no console

The tree is personas, an open-source desktop agent platform, read and changed
on its `master` at commit `5ab86317e9`. The version is the one its desktop
manifest witnesses, `rust-version = "1.80.0"`. It is a graphical
application: it has no console of its own, and two of its paths run an
operator-supplied command string through the platform shell - KPI measurement
commands, whose output is parsed into a number and kept as evidence, and
pipeline command steps, whose output is shown and passed to the next step.

## The seam, and why it was chosen to falsify

Both paths decoded the captured bytes with the host's lossy default. On this
machine (OEM page 852, ANSI page 1250) the shell's own `echo` of a nine-letter
Czech word, run from a parent with no console, arrived with four letters
replaced. The obvious fix - decode the whole buffer in the legacy page - was
tested first and failed on a stream that mixed a UTF-8 tool's line with a
shell built-in's: the UTF-8 half became box-drawing glyphs. And the console
lookup a console program would use returned zero here, so a decoder that only
asked for the console's page would have fallen straight through to the lossy
decode. The seam could have refuted the technique twice; it confirmed it, and
it fixed the lookup order for a host without a console.

## The change

One decode in the crate at the bottom of the workspace graph,
`src-tauri/core/src/utils/process.rs:59 "pub fn decode_output(bytes: &[u8]) -> String {"`,
whose line walk takes the decoder as a parameter so it is tested on every
platform,
`src-tauri/core/src/utils/process.rs:65 "fn decode_output_with(bytes: &[u8], legacy: impl Fn(&[u8]) -> Option<String>) -> String {"`.
The lookup is the only platform-specific part, and its comment carries the
measurement that ordered it,
`src-tauri/core/src/utils/process.rs:84 "A GUI process has no console, so"`,
falling back to the system page,
`src-tauri/core/src/utils/process.rs:91 "0 => unsafe { windows::Win32::Globalization::GetOEMCP() },"`.
The two call sites now go through it,
`src-tauri/src/engine/kpi_eval.rs:236 "let mut text = personas_core::utils::process::decode_output(&out.stdout);"`
and `src-tauri/src/engine/pipeline_executor.rs:702 "let stdout = personas_core::utils::process::decode_output(&output.stdout);"`,
and the dependency gained the two API families it needs,
`src-tauri/core/Cargo.toml:101 "Win32_Globalization"`.

## The proof

Paired, in one test over the captured bytes,
`src-tauri/core/src/utils/process.rs:196 "fn oem_852_output_keeps_the_letters_the_lossy_decode_lost() {"`:
arm A, the lossy decode, yields four replacement characters; arm B yields the
exact word, and a UTF-8 line ahead of it in the same stream is left alone. The
floor - an all-UTF-8 buffer returned byte-for-byte - is its own test. The core
crate's tests passed, its clippy run with warnings denied was clean on the
library, and the desktop crate compiled with its desktop feature set.

## What this realization cannot do

The page is the system's legacy page as seen from a console-less parent. A
child that writes in a different page - a program that emits the graphical
page, or one that sets its own - decodes without error into wrong letters, and
nothing in the decode can tell. The verification the technique asks for, a
known word captured from each kind of tool the host spawns, was done for the
shell built-ins only. Roughly 138 other lossy decodes of child output remain
in the workspace; most read tools that write UTF-8, and they were left alone
rather than converted on assumption.

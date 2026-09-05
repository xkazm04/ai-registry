---
layer: application
type: application
subject: error-handling
technique: exit-contract-is-a-taxonomy-projection
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@2021
---

# The exit contract as a taxonomy projection, in cargo-make

Verified against `sagiegurari/cargo-make` at commit
`95dcc545db8cf08af6fbec524e200e7c80b06027`, package version 0.37.24; toolchain
witness `Cargo.toml:9`, `edition = "2021"`, CI matrix at
`.github/workflows/ci.yml:18`. Every line below was re-opened on the date above.

cargo-make is a build-tool binary whose callers are shells, CI runners and other
build scripts — the exact consumer class that receives an integer and nothing
else. It implements the projection form of this technique, and it also
demonstrates the coverage failure the technique warns about, in the same tree.
Both halves are worth recording.

## The projection, implemented as the declaration

`src/lib/error.rs:4-72` declares the taxonomy with the exit code attached to
each member, via an explicit discriminant on a `#[repr(u16)]` enum:

```rust
#[derive(strum_macros::AsRefStr, strum_macros::Display,
         strum_macros::EnumDiscriminants, strum_macros::IntoStaticStr, Debug)]
#[repr(u16)]
pub enum CargoMakeError {
    #[strum(to_string = "A cycle between different env variables has been detected ...")]
    EnvVarCycle(String) = 100,
    #[strum(to_string = "Detected cycle while resolving alias {0}: {1}")]
    AliasCycle(String, String) = 101,
    ...
    #[strum(to_string = "{0}")]
    NotFound(String) = 404,
    // ************************
    // * Library level errors *
    // ************************
    #[strum(to_string = "`std::io::Error` error. {error:?}")]
    StdIoError { error: std::io::Error } = 700,
    ...
}
```

Everything the technique asks for is present in one declaration. There is no
mapping table anywhere in the crate: a kind cannot be added without its code,
because the discriminant is part of the variant. The human-readable message
rides the same declaration via `strum`, so the message and the code cannot
disagree about which failure they describe either.

The numbering is banded deliberately — 100-110 for the tool's own semantic
failures, a comment-separated 700-731 block for errors adopted from dependencies
— so a caller can branch on a range. `NotFound(String) = 404` borrows a
well-known code, which is the technique's "recognisable number" payoff at zero
cost.

The projection is read at the boundary by `impl std::process::Termination`
(`error.rs:119-133`), which pulls the discriminant off the value rather than
looking anything up.

## The narrowing rule, implemented correctly

The platform's exit space is one byte; the taxonomy's is `u16`. `error.rs:126-132`:

```rust
let status_code = self.discriminant();
if status_code > u8::MAX as u16 {
    eprintln!("exit code {}", status_code);
    std::process::ExitCode::FAILURE
} else {
    std::process::ExitCode::from(status_code as u8)
}
```

This satisfies the technique's three narrowing rules exactly: the collapse is
decided once at the boundary, an out-of-range code maps to the **generic
failure** value rather than to its own low bits, and the real number is written
to the error stream so the operator reading the log can recover what the caller
cannot see. Without that branch, `NotFound = 404` would truncate to 148 —
a specific, wrong, plausible answer, and the `unknown-is-not-a-value` failure the
law names.

## The coverage failure, in the periphery, as predicted

The technique says the projection binds only what the type covers, and that the
leak is nearly always a peripheral subcommand. This tree has exactly one, and it
is a subcommand.

`src/lib/completion.rs:27` and `:46`:

```rust
pub fn generate_completions(shell: &str) -> Result<(), Box<dyn std::error::Error>> {
```

`Box<dyn std::error::Error>` — not `CargoMakeError`. The module constructs its
failures with `Box::from(format!("Unsupported shell for completion: {}", shell))`
(`completion.rs:34-38`), a string with no kind and therefore no discriminant.
Across the non-test sources, 94 sites use `Result<_, CargoMakeError>`; the shell
completion path is the outlier that leaves the type before the boundary, so its
failures cannot carry a code and collapse to the generic failure value. A caller
scripting `cargo make --completions <shell>` gets *something failed* from a
program built specifically to say *what*.

The module knows it is thin — its own doc comment at `completion.rs:14-21` lists
"Improvements to Consider", including item 3, "**Enhanced Error Handling**:
Provide more informative error messages for file operations". The author
diagnosed the message quality and not the contract breach, which is the shape of
this failure: from inside, the module reports its errors fine.

The repair is one type change and two `From` impls the crate already has the
pattern for; `CargoMakeError` would gain a completion-specific member with a
code in the 100-band.

## The audit as a standing check for this tree

The technique's audit — count the fallible exit paths that do not return the
taxonomy's type — is one grep here and currently returns one module. Run as
`grep -rn "Box<dyn std::error::Error>" src --include=*.rs | grep -v _test`, it
is a two-second gate that would have caught the completion path at the commit
that introduced it. Nothing in `.github/workflows/ci.yml` or `Makefile.toml`
runs such a check today.

## What this realization cannot show

The repository publishes no exit-code table in `README.md` — the codes are
discoverable only from `error.rs` — so the technique's last decision rule
("a published exit-code table states the paths it governs") cannot be evaluated
against a document that does not exist. That absence is itself worth noting: the
projection is implemented well and is not documented as a contract, so callers
branching on these numbers are relying on an undeclared surface, and the `= 404`
that reads as deliberate to a source reader is invisible to the shell script that
would use it.

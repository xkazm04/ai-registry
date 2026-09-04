---
layer: application
type: application
subject: tool-result-economy
technique: escape-hatch-usage-as-the-safety-metric
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.80
applied: code
ab_verdict: unmeasurable
proof: structural-only
---

# A truncation with a real way back and no advertisement (Rust)

A desktop agent platform folds a persona's long-term coaching notes into the
evaluation payload it sends the reviewing model, cut to 4,000 characters. The
cut is implemented by a small char-safe helper that appends a bare ellipsis
(`src-tauri/src/engine/director.rs:657-664`, called at `:853`).
`verified_against` names the version the tree witnesses:
`rust-version = "1.80.0"` in `src-tauri/Cargo.toml:115`.

This is the technique's advertisement precondition, found in the wild and
failing in the direction the technique predicts is invisible.

## The recovery path exists; nothing says so

The notes are not synthesized for the payload. They are markdown files in a
vault the platform mirrors, read back per persona from a stable folder
(`director_brain.rs:202-206`, folder from `director_vault_folder`), and the
reviewing persona runs with file-reading capability. So the material is
addressable at its source and re-reading it is a normal action the model can
take — which is precisely
[elision-to-a-refetch-pointer](../../prompt-assembly/techniques/elision-to-a-refetch-pointer.md)'s
recoverability test, passed.

What the model receives is `{head}…`. That string is structurally incapable of
carrying either fact the technique requires: it cannot say **how much** was
dropped, and it cannot say **where the rest lives**. Not "it happens not to" —
the format has no room for it. The consequence is the one the technique calls
the metric's most dangerous value: the recovery rate here is zero **by
construction**, and a team reading that zero as evidence the cut is safe would
be reading a number that no possible behaviour could have moved.

The neighbouring standard already demanded the notice from the other side —
[context-budgeting](../../prompt-assembly/techniques/context-budgeting.md)'s
"the bottom rung is a notice, not silence", with its worked example
*"twelve older reports omitted"*. This tree implements that subject's ladder
carefully elsewhere and reaches the bottom rung here without the notice.

## The arms

The change adds `truncate_with_notice(s, max, source)` beside the existing
helper and switches the one brain-history call site to it. The head is
identical byte for byte; the difference is a bracketed sentence naming the
dropped count against the total and the vault folder holding the full notes.
A paired test asserts the discriminating property on the same 5,000-character
input:

- **Arm A** (`truncate`) ends in `…`, contains neither `1000` nor the folder.
- **Arm B** (`truncate_with_notice`) starts with the same 4,000 characters,
  contains `1000 of 5000`, and contains the folder.

The count is 2 of 2 assertions separating the arms, and it is a structural
count, not a behavioural one.

## Why the verdict is `unmeasurable` and the change is on a branch

The change compiles cleanly under the project's `desktop` feature. The library
test binary then **fails to launch on the machine this was run from** —
`STATUS_ENTRYPOINT_NOT_FOUND` (0xc0000139), a native-dependency fault that
occurs before any test executes, so neither the new test nor the two existing
truncation tests were observed running. No gate saw the change, and per the
project's own commit convention it therefore sits on a branch rather than in
the trunk.

**The instrument that would settle it is named and it already exists:**
`cargo test --lib --features desktop engine::director::tests::truncate` on a
machine where the test binary launches. That measures the structural claim.
The *behavioural* claim — that a model told what it is missing goes back for it
when the missing part matters — needs the recovery counter the technique asks
for, and nothing in this tree counts vault re-reads today.

## What this realization cannot show

Nothing here demonstrates that the coaching gets better. It demonstrates that
one of the two states the technique says must be distinguishable currently is
not: this system cannot tell "the model did not need the older notes" from "the
model was never told the older notes existed". That is the precondition, not
the payoff, and the payoff is unobservable until the precondition holds. An
application claiming otherwise from this tree would be inventing the half the
technique exists to protect.

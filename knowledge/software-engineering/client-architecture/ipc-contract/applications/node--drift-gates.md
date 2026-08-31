---
layer: application
type: application
subject: ipc-contract
technique: drift-gates
stack: node
verified_on: 2026-08-29
verified_against: node@24
---

# Drift gates over the generated IPC contract (Node tooling + CI)

The repo runs two generated vocabularies across the Rust↔TypeScript boundary —
ts-rs type bindings in `src/lib/bindings/` and the command-name union in
`src/lib/commandNames.generated.ts` — and gates each with the
generate-then-diff spine plus, in one case, the closed blind spots. This
surface is also where two of the standard's three blind spots were *measured*
before being fixed, which is why the CI comments read like the technique.

## The spine: the binding-drift job

`.github/workflows/ci.yml:494-586` (re-resolved 2026-08-29; the job moved down the file as jobs were added above it). Regenerates with the exact documented
command —

```
cargo test --workspace --manifest-path src-tauri/Cargo.toml --features desktop export_bindings
```

— then checks the whole contract directory. The job's inline comments are the
blind-spot catalog with dates:

- **Silent no-op generator** (`ci.yml:548-566`): without `--workspace` the
  crate split leaves ~200 exported types unregenerated; without
  `--features desktop` the build script aborts and **zero** bindings
  regenerate — while exiting 0. Both were live failures ("which is exactly how
  the six files fixed alongside this change drifted in the first place"). The
  job also stopped wrapping the regen in `2>/dev/null || true`, which had been
  masking Rust-side breakage — the instrument asserted before the result.
- **Untracked new file** (`ci.yml:568-585`): the comment records the
  verification — "`git diff` sees TRACKED files only, so it exits 0 for a
  brand-new binding — verified 2026-08-14 by creating one." The fix is the
  standard's one extra check: `git ls-files --others --exclude-standard
  src/lib/bindings/` must be empty before the `git diff --quiet` runs.

## The orphan hole — measured, and still the open one

> **Superseded 2026-08-22.** The population below was re-measured by an
> inventory walk rather than by grep, and the figures here are wrong in both
> the count and the class description — see
> [rust--drift-gates](./rust--drift-gates.md) for the walk (35 orphans, split
> 13 / 22), the mirror direction, and the inventory gate that finally closed
> this hole. The paragraph is kept because the *shape* of the defect it
> describes, and the reference-checker inversion below it, both held.

ts-rs never deletes. The measured population (CLAUDE.md ts-rs section, three
independent implementations converging on the count): **29 orphan bindings**
whose Rust source is gone, producing no diff and no untracked file — invisible
to the job above by construction. **26 are still imported and 22 are still
the declared return type of a live `invoke`**, including
`invoke<VaultStatus>("vault_status")` against a Rust fn now returning
`serde_json::Value`, with no `VaultStatus` type in any of 963 `.rs` files —
the standard's "standing claim with no witness", agreeing with the runtime
today by coincidence.

`scripts/check-unused-bindings.sh` illustrates why reference-shaped checks
cannot close this: it asks "is this binding referenced?" (a bare `grep -rw`
per file, `:17`), so it *protects* the 26 referenced orphans — usage is
evidence of danger here, not health. It is also satisfied by a shadow: the
legacy sweep measured **105 bindings that pass its word-match only because a
hand-written duplicate type of the same name exists** in `src/api/**`. The
missing inventory walk (bindings ↔ `#[ts(export)]` sources, both directions,
with a floor assertion) is specified in the legacy corpus but not yet built.

## The command-name vocabulary: the parity checker

`scripts/check-command-contract.mjs` is the three-set parity gate plus the
signature extension, four assertions in one pass:

1. **D ≡ R** — `commandNames.generated.ts` must equal the parsed
   `generate_handler![]` block, both directions (`missing from generated` /
   `stale in generated`, `:248-249`).
2. **I ⊆ R ∪ overrides** — every frontend command literal (scanned through
   `invokeWithTimeout`/`safeInvoke` call sites) must be registered or
   declared as a known-unregistered forward reference (`:252-254`).
3. **The escape hatch's covenant** — an override naming a command that is
   *implemented* in Rust but unregistered fails (`:260`, `:283-286`,
   `implementedButUnregisteredOverrides`), and
   `scripts/generate-command-names.mjs:265-290` auto-prunes overrides the
   moment they appear in the registered set.
4. **Parameter parity** (`:290-311`) — for every analyzable literal payload,
   the keys sent must cover every required (non-`Option`, non-injected)
   parameter the Rust fn declares, camelCased. The header records why: "Tauri
   resolves arguments BY NAME too, so a payload missing a declared parameter
   is rejected at the boundary with the name check fully green" — found when
   a whole `dev_tools_reorder_*` command family shipped unexecutable.
   Spread/variable payloads are counted unanalyzable and skipped, not guessed.

CI Job C (`command-name-drift`) additionally regenerates and diffs the two
name files per commit — safe against the untracked blind spot only because
these files are always modified in place, never newly created.

## A live deviation worth copying nothing from

> **Resolved by 2026-08-29.** The generator now walks every non-test Rust
> file, bracket-matches every `generate_handler!` block, unions them, and
> fails below a `MIN_COMMANDS` floor — see
> [node--command-registration](./node--command-registration.md), whose header
> comment (`generate-command-names.mjs:15-40`) is this paragraph rewritten
> as a post-mortem. The text below is kept as the dated specimen of the
> defect.

The two tools derived R independently with different regexes:
`check-command-contract.mjs:57` matches the real
`ipc_auth::wrap_invoke_handler(tauri::generate_handler![` shape, while
the generator matched bare
`invoke_handler(tauri::generate_handler![` — which succeeded **only because
"wrap_invoke_handler(" happens to end in "invoke_handler("**. Rename the
wrapper and the generator exits 1 loudly; insert a different call between
them and it silently parses another block. One registration source, two
hand-rolled parsers — the standard's "extract once and share" corollary,
violated in the exact spot that teaches why it exists. The contract checker
still carries its own private regex at `:57`; the registration gate imports
the generator's walk instead, so R now has two derivations rather than
three.

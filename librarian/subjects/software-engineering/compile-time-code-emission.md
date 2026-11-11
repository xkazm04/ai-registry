---
subject: compile-time-code-emission
domain: software-engineering
last_touched: 2026-11-11
dry_streak: 0
---

# compile-time-code-emission

First touch: [[2026-09-04-rust-proc-macros]] - an E4 escalation (three mechanisms, no
home) answered yes by the operator on 2026-11-11. Forged by shift run
`forge-codegen-1111`; spec at `librarian/specs/2026-11-11-compile-time-code-emission.md`.
Class: NEW.

## State

New subject, 7 techniques, 2 applications (both `rust`, one tree). Placed in
`engineering-process/build-and-release` (7 -> 8 subjects, under the cap), beside `codegen`,
verified against `taxonomy.json`; entry appended.

Techniques: `target-syntax-templates` (backlog 8-009), `representation-strength-from-input-contract`
(8-010), `call-site-diagnostics`, `pure-expansion`, `additive-expansion-with-declared-names`,
`expansion-tests`, `lossless-tree-codemods`. The first two are the tutorial's mechanisms;
the other five came from the primaries, which is what the return condition asked for -
the source originated the subject, the primaries authorized it.

## Evidence base

Primaries read on the web, 2026-11-11 (the source note's return condition):

- Procedural macros, language reference: https://doc.rust-lang.org/reference/procedural-macros.html
- Span hygiene API: https://doc.rust-lang.org/proc_macro/struct.Span.html
- Quasi-quoting library: https://docs.rs/quote/latest/quote/macro.quote.html
- Parser library error type: https://docs.rs/syn/latest/syn/struct.Error.html
- Compile-fail harness: https://docs.rs/trybuild/latest/trybuild/
- Expression macros design (SE-0382): https://github.com/swiftlang/swift-evolution/blob/main/proposals/0382-expression-macros.md
- Attached macros design (SE-0389): https://github.com/swiftlang/swift-evolution/blob/main/proposals/0389-attached-macros.md
- Incremental generators design: https://github.com/dotnet/roslyn/blob/main/docs/features/incremental-generators.md
- Incremental generators cookbook: https://github.com/dotnet/roslyn/blob/main/docs/features/incremental-generators.cookbook.md
- Quotes and splices: https://docs.scala-lang.org/scala3/guides/macros/quotes.html
- Concrete syntax trees for codemods: https://libcst.readthedocs.io/en/latest/why_libcst.html
- Lossless semantic trees: https://docs.openrewrite.org/concepts-and-explanations/lossless-semantic-trees
- Codemod toolkit: https://github.com/facebook/jscodeshift

The golden path's own Sources section lists the eight that pass the software purity
check. The `docs.rs` addresses trip the source-extension pattern (`.rs/`) and the two
generator-vendor addresses trip the repo-path pattern (`/docs/`), so those five live here
and in the applications. Recorded so the next touch does not read it as an omission.

Tree: Personas `src-tauri/macros/src/lib.rs` at `8d076db46a`, read only.

## Where the primaries disagreed, and how the subject resolved it

- **Text writer or syntax templates.** One generator vendor's cookbook recommends an
  indentation-aware string writer over syntax-tree construction. That is not a
  counterexample to 8-009: its generators emit whole files the compiler reparses, not
  tokens spliced into a caller. The discriminator, *where the output goes*, is stated in
  `target-syntax-templates`.
- **Who reports diagnostics.** The same vendor discourages diagnostics from generators
  (caching cost) and routes them to an analyzer; the macro designs make the emitter
  report. `call-site-diagnostics` keeps the rule and moves the reporter.
- **Additive or replacing.** Two hosts forbid in-place rewrite; procedural attribute macros
  in a third may replace their item. The technique allows replacement only as
  re-emission with additions, every original token kept.

## Boundaries recorded

- `module-design/emitted-code-names-from-a-root` (backlog 8-002, landed 2026-09-25,
  applied `better`) already owns the note's first mechanism, hygiene. It is linked from
  the golden path, **not borrowed and not moved**: a borrow needs a `shared_with` edit in
  a file this run did not write, and a move would rewrite links into an applied technique.
  A later librarian pass may decide to borrow it (`emitted-code-names-from-a-root@module-design`
  in `techniques:` plus `shared_with: [compile-time-code-emission]` on the owner).
- `codegen` owns committed derived files. Discriminator: is the output a file in the tree.
- `import-normalization/intermediate-representation` owns an import waist, not parse
  strength.
- `supply-chain/build-time-dependency-tier` owns pricing build-time code; linked.
- `module-design/mirror-type-at-the-edge` owns testing logic over host-bound types; linked.
- Cross-bundle: game-production's `visual-script-to-code-transpilation` emits code from a
  visual graph and holds `declaration-definition-parity`. Same family, other bundle; not
  linked (cross-bundle links are forbidden). A later run seeing emission in a game tree
  should compare the two rather than re-litigate.

## Reconciliation (Personas, read only)

- Confirmed: both macros report located compile errors, never panics; the full tree for
  guaranteed host code and a narrow grammar plus token pass-through for the framework's
  little language.
- Deviation: `#[requires]` depends on a caller parameter named `state` and does not check
  for it; the user gets the compiler's unresolved-name error. Deviation: no compile-fail
  fixtures for three diagnostics 240 call sites rely on.
- Upward lessons: validate what the expansion depends on, not only what it parses (now
  step 5 of `call-site-diagnostics`); a module emitted by a macro is invisible to the
  formatter, so editable structure stays in source (now a section of
  `additive-expansion-with-declared-names`).

## Not done

- Not applied. No seam was changed in a tree; the two deviations above are the obvious
  seam (`requires` state check + `trybuild` fixtures) for a later apply run.
- No architecture-review record: the forger does not review its own subject
  (claimant-does-not-adjudicate). Review is pending.

## Open leads

- **Codemods may outgrow this subject.** `lossless-tree-codemods` is here as the boundary
  case. If two more codemod mechanisms arrive (staged rollout of a large rewrite, ownership
  of a codemod's residue), they are a subject of their own in `codebase-stewardship`.
  Return condition: a second codemod-shaped source.

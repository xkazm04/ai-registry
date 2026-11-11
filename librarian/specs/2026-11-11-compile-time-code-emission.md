---
status: EXECUTED (2026-11-11, forge-codegen-1111; overrides - 8-010 folded in beside 8-009/8-011, hygiene linked not moved, spec landed here as well as in the run folder)
source: librarian/sources/2026-09-04-rust-proc-macros.md
run_id: forge-codegen-1111
bundle: software-engineering
category: engineering-process/build-and-release
subject: compile-time-code-emission
resolved_path: knowledge/software-engineering/engineering-process/build-and-release/compile-time-code-emission/
category_count: 7 subjects before, 8 after (cap 10). Read taxonomy.json, entry appended, nothing reordered.
clone: none - the personas fleet checkout at 8d076db46a, read only
---

# Spec: compile-time-code-emission (software-engineering) - forge-codegen-1111

Origin: `librarian/sources/2026-09-04-rust-proc-macros.md` (E4 escalation, operator yes 2026-11-11).
Backlog: 8-011 (the subject), 8-009 and 8-010 folded in as techniques. 8-002 already landed
elsewhere and is linked, not moved (see Boundaries).

## Why XL, and why it is executed now

Three mechanisms from one tutorial shared one home-if-new and none of the existing homes
fits (argued in the note). One educator's sixteen minutes cannot authorize a subject, so the
note banked it with a return condition: a macro-system design document or a compiler-plugin
API's own guidance. The operator kept that condition. This spec meets it with vendor
primaries read on the web this session (listed below), and executes in the same session per
the intake method.

## Placement (verified against taxonomy.json, not a count)

- Bundle `software-engineering`, layout `nested`.
- Category `engineering-process` (subcategories only), subcategory `build-and-release`:
  7 subjects before this one (build-economics, packaging, release-pipeline, codegen,
  test-harness, test-input-generation, vendored-patch-stack) -> 8, under the cap of 10, no
  re-split.
- Resolved path: `knowledge/software-engineering/engineering-process/build-and-release/compile-time-code-emission/`.
  Link depth: golden path to `_laws.md` is `../../../_laws.md`; from `techniques/` it is
  `../../../../_laws.md`.
- Why here and not `codebase-stewardship` (9, where module-design lives) or
  `backend-platform/language-runtime` (10, full): the subject's contract is with the
  build's compiler, and its nearest neighbour `codegen` is in this subcategory. Taxonomy
  entry is appended to the end of the subcategory's list.

## Definition

A program that writes program text which the host toolchain then compiles as if a person
had written it: macros (declarative and procedural), compiler plugins and source
generators, and - as the boundary case where the emitted text lands in the author's own
file - codemods. The subject is the contract between the emitter and the two worlds it
touches: the host compiler (what representation it reads, what it rejects, how it reports)
and the caller's source (its names, its formatting, its authorship).

## Techniques (each must carry the decision rule named)

1. `target-syntax-templates` (8-009). Emit through the target's own syntax with typed
   interpolation holes, not by concatenating text. Rule: when emitted code is spliced into
   a caller as tokens, a template; identifiers are built by the template system's own
   constructor, never pasted. Boundary: a whole-file generator that re-parses its output
   may legitimately use an indentation-aware text writer (one vendor recommends exactly
   that), provided a test parses the output.
2. `representation-strength-from-input-contract` (8-010). Choose how much structure to
   parse from what the input promises: a weak token tree when the input is a little
   language that may not be host syntax; a full syntax tree only when the input is
   guaranteed host code; a lossless tree when the output goes back into the author's file.
3. `call-site-diagnostics`. Failures are diagnostics spanned to the caller's tokens, never
   crashes and never silent empty expansions; collect several; keep expanding where a
   partial result helps the next error.
4. `pure-expansion`. Expansion is a function of its declared inputs only: no clock, no
   undeclared files or environment, no network; models compared by value so the host can
   cache; build-time code carries the compiler's privileges.
5. `additive-expansion-with-declared-names`. Emitters add beside the author's code; they do
   not rewrite it in place; the names they introduce are declared up front; and what the
   author must edit stays in source where tools can see it.
6. `expansion-tests`. Three layers: snapshot the expansion, compile-fail fixtures pinning
   each diagnostic's text and span, and use-site compilation from a foreign caller.
7. `lossless-tree-codemods`. A one-shot emitter that writes into authored files works on
   a tree that round-trips byte for byte, reprints only what it changed, is idempotent and
   has a dry run.

## Boundaries (must NOT absorb)

- `module-design/emitted-code-names-from-a-root` owns hygiene (row 8-002, landed and
  applied). Linked in prose, not borrowed: borrowing needs a `shared_with` edit in a file
  this seat did not write.
- `codegen` owns committed derived files: registry, triggers, drift gates, headers.
- `import-normalization/intermediate-representation` owns an import waist and its loss
  ledger, not the parse strength of an emitter's input.
- `supply-chain/build-time-dependency-tier` owns pricing build-time code as a dependency;
  `pure-expansion` links it for the privilege point.
- `module-design/mirror-type-at-the-edge` owns testing logic over a host-bound type;
  `expansion-tests` links it.
- `declarative-object-graph-configs/textual-macro-prepass` owns config-file includes.
- game-production's `visual-script-to-code-transpilation` is cross-bundle: noted in the
  subject note only.

## Primaries (web budget)

- Language reference, procedural macros: https://doc.rust-lang.org/reference/procedural-macros.html
- Compiler span hygiene API: https://doc.rust-lang.org/proc_macro/struct.Span.html
- Quasi-quoting library docs: https://docs.rs/quote/latest/quote/macro.quote.html
- Parser library error type: https://docs.rs/syn/latest/syn/struct.Error.html
- Compile-fail harness: https://docs.rs/trybuild/latest/trybuild/
- Expression macros design (SE-0382): https://github.com/swiftlang/swift-evolution/blob/main/proposals/0382-expression-macros.md
- Attached macros design (SE-0389): https://github.com/swiftlang/swift-evolution/blob/main/proposals/0389-attached-macros.md
- Incremental generators design: https://github.com/dotnet/roslyn/blob/main/docs/features/incremental-generators.md
- Incremental generators cookbook: https://github.com/dotnet/roslyn/blob/main/docs/features/incremental-generators.cookbook.md
- Quotes and splices guide: https://docs.scala-lang.org/scala3/guides/macros/quotes.html
- Concrete-syntax-tree codemods rationale: https://libcst.readthedocs.io/en/latest/why_libcst.html
- Lossless semantic trees: https://docs.openrewrite.org/concepts-and-explanations/lossless-semantic-trees
- Codemod toolkit: https://github.com/facebook/jscodeshift

## A tree with the gap

`personas` (read only), `src-tauri/macros/src/lib.rs` at 8d076db46a: two procedural macros,
one attribute (full syntax tree of a function) and one function-like (a handler list parsed
with a narrow custom grammar, then re-emitted token for token). Applications: `rust` stack,
`call-site-diagnostics` and `representation-strength-from-input-contract`.

## Open questions decided by the drafter

- Is a codemod compile-time? No, and it stays in anyway as the boundary technique: it is the
  same emitter-to-host contract with the output landing in the author's file, and the
  research map returned empty for it. Decided in the golden path's scope paragraph.
- Hygiene technique: link, do not move (see Boundaries).
- Review record: not written by the forger (claimant-does-not-adjudicate); subject note
  carries state and leaves review pending.

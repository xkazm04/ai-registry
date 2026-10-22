---
layer: application
type: application
subject: authoring-block-vocabulary
technique: enum-guarded-block-payloads
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19
applied: code
ab_verdict: better
---

# The guard was right; the vocabulary had four copies and the tables could not see the fifth label

`personas-web` already follows the technique's first half. The callout-stack and
cards item grammars admit only their declared literals in the label position,
case-insensitively, and a stray label such as `[planned]` lands in the existing
per-item skip path. Tree read at the commit before this change; witness for the
stack is the project's React 19 dependency.

## What the tree said about the second half

Each of the two vocabularies existed as hand-written copies in different files:
the item regex, the type union in the parser, and a style table in each renderer.
Two of the three tables were keyed by `string` and ended in a `?? info` fallback,
so the table was total by construction and could never report a missing label.

Measured with a declaration-only mutation (one label added to the union, nothing
else touched):

- **A (as found):** `tsc` clean, the parser drops the new label's line, the block
  renders nothing. The label is in the type and unreachable from any body, the
  "survives for years because nothing fails" direction of drift.
- **B (one tuple per vocabulary, grammar and unions derived, tables keyed by the
  union):** the same mutation is two `tsc` errors, one per style table, and the
  grammar accepts the label with no second edit.

Target: copies a maintainer must keep in step, 4 per vocabulary to 1; mutation
caught at build 0/1 to 1/1. Floor: 2417 unit tests, `tsc`, lint (0 errors) and the
guide content gate over 1,526 topic bodies, all unchanged. The seam was chosen to
falsify the technique's own claim that the grammar-level guard is sufficient; it
held, and the drift the technique predicts was found in the tables instead.

## What this realization cannot do

The parser module is read by a build script through Node's type stripping, so it
must stay dependency-free and cannot import a shared vocabulary file. The tuples
therefore live in the parser, and the renderers import types from it. That makes
the parser the authority, not a neutral third module. The author documentation
and the translator's do-not-translate list remain separate hand-written copies and
are not derived. Behaviour keyed to a label (the warning role) is still a literal
comparison in the renderer.

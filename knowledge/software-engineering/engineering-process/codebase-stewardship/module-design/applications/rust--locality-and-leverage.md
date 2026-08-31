---
layer: application
type: application
subject: module-design
technique: locality-and-leverage
stack: rust
status: forged
verified_on: 2026-08-31
verified_against: rust@1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Rust — the duplication that the scatter diagnostic cannot see

[locality-and-leverage](../techniques/locality-and-leverage.md) claims that
both payoffs are collected by people who already found the module, that hiding
a module's *existence* is a separate act from hiding its *internals*, and —
the falsifiable part — that the technique's own scatter diagnostic is
structurally blind to what the second act costs, because independent copies
produce single-place edits rather than scattered ones.

That is a claim about what an instrument cannot see, so it was tested with two
instruments on one tree: the desktop agent platform in the `personas` project
(MIT, `github.com/xkazm04/personas`), Rust workspace under `src-tauri/`, read
at commit `fe48e30e6` on the `verified_on` date. 1,200 `.rs` files, 16,199
function definitions parsed.

## The two arms

Both arms ran over the same tree and the same parsed definition set.

- **Arm A — change scatter**, the diagnostic this technique already carries:
  do the files holding these definitions ever change in the same commit?
  Counted over the full history (20,761 files).
- **Arm B — the amendment's signature**: one function name defined in two or
  more distinct files *and* two or more distinct top-level regions, where at
  least one definition is not `pub`.

The predicate both arms travel with
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
name length ≥ 6, 59 conventional trait-and-lifecycle method names excluded
(`new`, `fmt`, `from`, `poll`, `deref_mut` …), tests **not** excluded,
co-change counted over all commits touching two or more of a candidate's
files. The instrument asserted its own parse — file count, definition count,
and the presence of both visibility classes — and was written to refuse to
report rather than print a zero it could not distinguish from a parse failure.

| | count |
| --- | --- |
| Arm B raw candidates | 232 |
| — of which Arm A also sees (they co-change) | 165 |
| — of which Arm A is blind to (zero co-change) | **67** |
| Arm-A-blind, refined: forwarding wrapper (false positive) | 15 |
| Arm-A-blind, refined: independent implementation | **52** |

The refinement matters more than the headline, and it was forced by the first
run being wrong. Arm B's highest-ranked candidates — six `validate_*`
functions and `is_private_ip` — were **not** duplication at all. They are
private adapters that forward to the public implementation
(`validate_check(pv::validate_name(name))`;
`super::url_safety::is_private_ip(*ip)`), which is the single-door discipline
[seams-and-adapters](../techniques/seams-and-adapters.md) prescribes. Name
collision plus visibility is not a detector; a body that calls a function of
the same name is forwarding, and only what survives that filter is a candidate.

## What survived, and what it shows

Three of the 52 were opened by hand. They fall into the two branches the
technique's discriminator predicts, which is the result that matters:

**Waste caused by invisibility.** `strip_html_tags` exists three times.
`core/src/validation/mod.rs:18` is `pub` and uses the sanitizer library with a
four-entity decode pass whose ordering carries a comment. `db/src/repos/core/
memories.rs:23` is private and is that same implementation, comment and all.
`engine/src/chunker.rs:357` is private and is a hand-rolled `<`/`>` state
machine: it decodes no entities and terminates a tag at the first `>`, so an
attribute containing one truncates the text. The three have never appeared in
one commit. `now_ms` is the same shape without the divergence — three
byte-identical bodies, one of them `pub` in `core/src/utils/mod.rs:10`.

**Correct divergence.** `hours_since` is defined privately in
`db/src/repos/dev/attention.rs:719` and `src/engine/kpi_eval.rs:151`, and the
two are different jobs: one takes an injected `now` and returns
`Option<i64>`, the other parses a timestamp format and returns `f64`. Applying
the discriminator — would a change to one require a change to the other —
returns no, and this technique's existing rule already governs it: the
similarity is in the shape of the steps, not in their meaning.

## The verdict

**Better, on the claim actually tested.** Arm A surfaced none of these, and
not by accident of sampling — the invisible set is *defined* by zero
co-change, so the structure whose duplication is worst scores best on the
diagnostic. The divergent chunker copy is the concrete cost: a text-extraction
rule was corrected once in the public module and never reached a private
reimplementation nobody was looking for.

## What this realization cannot do

- **It reads names, not behaviour.** Two functions doing the same thing under
  different names are invisible to it, and that is the larger population. The
  measured 52 is a floor on this tree, not an estimate.
- **The sample behind the two branches is 3 of 52**, hand-read. The counts are
  measured; the *ratio* of waste to correct divergence is not.
- **`pub` is not the same as findable.** The visibility keyword is a proxy for
  discoverability, and a `pub` function in an unpublished internal crate can be
  just as invisible as a private one. The instrument would score it findable.
- **It cannot see the defect ledger**, which is where the technique says the
  real signal lives — the same fix requested twice from unrelated regions.
  Co-change absence is a weaker stand-in, available because it needs no issue
  tracker. Making the stronger measurement would take a defect history joined
  to touched paths, and that is the instrument this tree does not have.

---
layer: application
type: application
subject: declared-process-graph
technique: bounded-expansion
stack: rust
status: forged
verified_on: 2026-09-02
verified_against: rust@1.95
---

# Bounding a module expander, and the two bounds that were wrong first

A dataflow middleware written in Rust expands `module:` nodes in a YAML
descriptor into inner nodes before validation runs
(`libraries/core/src/descriptor/expand.rs`, commit `bdd1516`). Every bound in
the technique is present, and two of them are implemented against the shape the
obvious version gets wrong.

## The three bounds, as constants

```rust
const MAX_MODULE_DEPTH: u8 = 8;            // expand.rs:29
const MAX_MODULE_FILE_SIZE: u64 = 1_048_576; // expand.rs:32
const MODULE_INPUT_SOURCE: &str = "_mod";    // expand.rs:36
```

They are constants, not configuration, which is the technique's rule. The depth
comment states the reason in the technique's own terms — "prevents unbounded
recursion from deeply nested or circular module graphs **that evade the
path-based cycle check**" — so the tree had already concluded that the cycle
check is not a bound. The check is enforced twice, once in the linter
(`:189`) and once on the real expansion path (`:582`), because the two entry
points recurse separately.

## The size cap is a bounded read, not a stat

The technique says the metadata answer is untrustworthy; this tree says why, in
`load_module_file` (`expand.rs:1250-1268`):

> `metadata().len()` reports 0 for FIFOs/character devices (e.g. `/dev/zero`)
> and is racy against a file being appended to, so it would sail past the cap
> and then `std::fs::read` unboundedly — exactly the "infinite files" DoS the
> limit is meant to prevent.

The implementation is `file.take(MAX_MODULE_FILE_SIZE + 1).read_to_end(&mut
buf)` followed by a length comparison — the cap plus one byte, and the extra
byte is the evidence. Tests pin both sides of the boundary: a file padded to
`MAX + 16` is rejected (`:1381`) and one padded to exactly `MAX` is accepted
(`:1391-1397`).

## Containment is rooted at the project, and the linter declines the check

`expand_module_node` canonicalizes the module path and compares it against
`canonical_base` — a project root computed once (`:106`) and threaded through
every recursive call (`:578`, `:747`, `:781`) — refusing with "module path `{}`
escapes the project directory" (`:616-618`). Node-relative source paths inside a
module get the same treatment through `resolve_module_relative_path`
(`:895-917`).

The linter, `check_module_file_inner`, deliberately does **not** apply
containment (`:273-285`), and the comment is the technique's corollary written
out: the lint runs on a module file in isolation, has no project root to bound
against, and a `module_dir` containment check "would spuriously reject
cross-directory references that `dora run` / `dora build` accept and run fine
(see #2851)" — a module in `modules/a/` legitimately reaching a shared body via
`../shared/base.yml`. It keeps the checks that hold without a root: absolute-path
rejection (`:253-260`), existence via `canonicalize()` (`:267`), size, and depth.

## The cycle check is per-branch and earns its place on the message

`seen.insert(canonical)` refuses a repeat (`:196`, `:624`) and `seen.remove` runs
on the success path (`:332`). The two tests are paired and state the reason
directly: `check_module_file_rejects_self_referencing_module` (`:3443`) asserts
the message contains "circular module reference", with the doc comment noting
that without the guard "this recurses to the depth limit and reports a misleading
depth error instead of naming the cycle"; the test immediately after it
(`:3464`) exists so that `seen.remove` keeps a diamond (`a -> b -> d`,
`a -> c -> d`) legal.

## What this tree adds to the technique

`MODULE_INPUT_SOURCE` is a reserved *source* token (`_mod/port_name`), not only a
reserved identifier prefix: inner nodes name the module's own input ports through
it and expansion substitutes the parent's wiring (`docs/modules.md:71`). The
expander also asserts what prefixing is supposed to guarantee rather than
assuming it — a post-expansion uniqueness sweep over the flattened ids
(`expand.rs:141-151`) whose message names both sources of a collision, "conflicting
node names across modules and top-level nodes".

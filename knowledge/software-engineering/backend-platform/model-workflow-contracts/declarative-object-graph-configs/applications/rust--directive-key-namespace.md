---
layer: application
type: application
subject: declarative-object-graph-configs
technique: directive-key-namespace
stack: rust
status: forged
verified_on: 2026-10-22
verified_against: rust@1.96.1
applied: experiment
ab_verdict: better
---

# A typed rule node with one directive key, and a guard written for a different node

Pumper's extraction engine takes a rule set from operator JSON: a map from output
field to a rule node. The node type is `FieldRule` in `crates/core/src/extract.rs`:
a `Rule` enum flattened into the node (`#[serde(flatten)]`, tagged by `type`, whose
variant fields are the constructor arguments: `selector`, `attr`, `all`, `html`,
`pattern`, `group`, `pointer`, `xpath`, `value`) beside one key that is not an
argument at all, `transforms`, which tells the loader what to do with the result.
The toolchain witness is the pinned channel in `rust-toolchain.toml` (1.96.1). The
format is the technique's setting in miniature: no generic instantiator and no
reserved spelling, one closed tag, one directive.

## What the tree does, against the technique

- **The vocabulary is closed and lives in one place per node, as the technique
  asks.** The variants and `transforms` are declared once, and the server's preview
  route (`crates/server/src/routes/runtime.rs`, the per-field `from_value::<FieldRule>`
  loop) and the batch compiler both go through that one type.
- **The mistyped directive does not reach a constructor that fails; it vanishes.**
  The technique's rule is that a misspelled directive must fail where it lands. Here
  the parse is serde's default, which drops unknown keys, and `FieldRule` has no
  `deny_unknown_fields` (flatten and deny cannot be combined on the struct anyway).
  The rule node that carries the operator's intent therefore accepts `transform`,
  `Transforms`, `tranforms`, and an argument belonging to another variant, and
  returns a node with the key gone.
- **The tree already knows this failure and fixed it for the sibling node.**
  `unknown_transact_fields` (`crates/core/src/engine.rs:660`) is the same guard the
  technique describes, pinned by the test `unknown_field_not_silently_dropped`
  (`engine.rs:1826`) whose comment names the harm: a typo'd `"step"` "deserialized
  into an EMPTY step list, and ran a zero-step flow that produced a perfectly
  plausible landing-page evidence bundle". Its own rule is the technique's reserved
  spelling: "Underscore-prefixed keys are host-owned and always allowed; everything
  else must be a field the request declares", because the trigger runtime injects a
  `_trigger` envelope. It is applied at the transact app only
  (`crates/apps/transact/src/lib.rs:221`); the rule set, which is the larger
  operator-authored surface, has no counterpart.

## The paired check

Seam chosen to falsify the claim that the rule node is already safe: serde flatten is
the nearest thing in a typed format to the technique's stripping step, and a flatten
can silently swallow what a loader would have rejected. A caught outcome would have
taught that the type system already enforces the vocabulary; it did not.

The harness is a standalone crate holding the `Rule`, `FieldRule` and `Transform`
shapes copied from the tree (five of the rule variants and two transforms) and the
guard of `unknown_transact_fields` pointed at a rule node, with the declared keys per
variant as its set and the underscore prefix as the host-owned spelling. Arm A is
`serde_json::from_value::<FieldRule>` as the tree ships it. Arm B adds the guard.

- **Target: constructed directive and argument typos silently accepted.** A 5 of 5,
  B 0 of 5 (all five flagged, with the offending key named). The cases: `transform`
  for `transforms`, `Transforms`, `tranforms` on a constant rule, `attribute` for
  `attr`, and `all` on a regex rule (an argument that belongs to a different
  variant). The first parsed to 0 transforms where 1 was written, so a number the
  operator meant to coerce comes back as text.
- **Floor: valid nodes unchanged.** Four valid nodes (css with transforms, regex with
  group, xpath with `all`, and a json rule carrying a `_note` key) were accepted by A
  4 of 4 and flagged by B 0 of 4. The underscore rule is what keeps the fourth clean.

`better` at mode experiment. Nothing was shipped: the change is a set of declared
keys per variant that has to stay in step with the enum (the transact guard solves
that with a test pinned against the struct), and an enforcement point to choose
between the parse and the compile. The ledger on this surface is silent: the
project's applied ledger holds no row for rule-node parsing.

## What this application cannot show

- It runs a replica of the types, not the crate. The behaviour measured is serde's,
  but whether the production compile path rejects some typo later (for example by an
  empty required field) was not driven; the five cases were chosen so that none
  carries a required field, and a typo of a required key such as `selector` already
  fails at parse.
- It does not show the loss in a real rule set. No stored rule set was replayed, so
  how many production nodes carry a dropped key is unknown; the instrument is the
  rule-set table export run through arm B once it can be read.
- The tree has no collision to report. No variant has an argument spelled like
  `transforms` or `type`, and user field names are map keys, so they sit in a
  different namespace from the directives. The technique's namespace problem does not
  arise here; only its second half, the failing of a misspelled directive, does.

Return condition: run the guard over the stored rule sets, and reopen if a variant
gains an argument named `transforms`.

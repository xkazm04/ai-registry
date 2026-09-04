---
layer: application
type: application
subject: object-shape-representation
technique: transition-tree-with-shared-table
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# A shared-shape tree whose public door opens onto dictionary mode

Boa (`boa-dev/boa`, commit `665f03924a54e5162be227e7e909612e36f6e35a`, workspace
`0.22.0`) implements the transition tree in `core/engine/src/object/shape/`.
The version witness is `Cargo.toml:30` (`rust-version = "1.91.0"`), with the
workspace version at `Cargo.toml:29`. `docs/shapes.md` is the design's own
walkthrough and agrees with the tree everywhere this application cites it.

## The tree, the table and the fork

`SharedShape::root()` (`shared_shape/mod.rs:175-186`) is the prototype-less
root with `property_count: 0`, `transition_count: 0`, no `previous`, and a
`PropertyTable::with_capacity(4)` whose comment at line 180 states the
derivation: "Most of the time the root shape initiates with between 1-4
properties." `insert_property_transition` (`shared_shape/mod.rs:215-245`) is
the technique's edge reuse: it looks up the `TransitionKey` - a `PropertyKey`
plus `SlotAttributes`, so the attributes are part of the key - in the forward
transitions, returns the child when the weak pointer upgrades, prunes when it
does not, and otherwise mints `Inner` with `property_count + 1`,
`transition_count + 1` and `previous: Some(self.clone())` - the strong back
edge.

The fork rule lives in `PropertyTable::add_property_deep_clone_if_needed`
(`property_table.rs:95-118`). The table is shared when
`property_count == inner.keys.len() && !inner.map.contains_key(&key)` (line
105); otherwise `deep_clone(property_count)` copies the prefix up to the
caller's count (`property_table.rs:120-125`) and inserts into the copy. Both
halves of the technique's fork test are on that one line: the sibling-owns-
the-next-row half and the name-already-present half. The bound on lookup is
`SharedShape::lookup` (`shared_shape/mod.rs:436-450`): the map hit is
accepted only if `*property_table_index < self.property_count()`, with the
comment "Check if we are trying to access properties that belong to another
shape" at line 443. `docs/shapes.md:133-138` says the same in prose, and
`docs/shapes.md:187` narrates the fork.

## Deletion is rollback and a condensed replay

`rollback_before` (`shared_shape/mod.rs:359-413`) walks `previous` until it
finds the insert transition for the deleted key and returns the base, the
latest prototype transition it passed, and an ordered map of the later
transitions. The two condensations the technique names are the tree's, with
their reasons in comments: only the latest prototype change is kept (line
377, "We only take the latest prototype change"), and attribute changes are
folded into their property's entry via `entry().or_insert` (lines 403-406,
"Only take the latest changes to a property. To try to build a smaller
tree"). `remove_property_transition` (`shared_shape/mod.rs:416-433`) applies
the prototype first, then replays the transitions in reverse of the
collection order - oldest first - through `insert_property_transition`, so
existing forward edges are reused. `docs/shapes.md:218-220` describes exactly
this.

## The cap is checked after every transition kind

`Shape::TRANSITION_COUNT_MAX` is `1024` as a `u16` (`shape/mod.rs:79-83`,
"before the shape will be converted into a UniqueShape"). The check is not
insertion-only: `insert_property_transition` (`shape/mod.rs:109-120`),
`change_attributes_transition` (`126-146`), `remove_property_transition`
(`151-162`) and `change_prototype_transition` (`165-176`) each compare the
resulting shape's `transition_count()` against the cap and call `to_unique()`.
That is the structural reason the technique needs no separate deletion
trigger: the replay's result is counted like any other shape.

## The structural fact: the public constructor does not enter the tree

`Shape::default()` is `UniqueShape::default().into()` (`shape/mod.rs:71-75`).
`JsObject::from_proto_and_data` - the `pub` constructor an embedder calls -
builds its `PropertyMap` with `from_prototype_unique_shape`
(`jsobject.rs:211-227`, line 219). Only the `pub(crate)`
`from_proto_and_data_with_shared_shape` (`jsobject.rs:236-256`) takes a
`RootShape` and enters the tree, and its callers are the engine's own
builtins (`builtins/array/mod.rs:366`, `builtins/boolean/mod.rs:73`,
`builtins/date/mod.rs:344`, `builtins/error/mod.rs:250`, and so on). The
tree is therefore an engine-internal privilege: every object a host creates
starts in dictionary mode, and nothing in `docs/shapes.md` says so. That is
the upward lesson recorded in `dictionary-mode-fallback` - unique mode is a
deliberate start for objects built once by the host, not only an exit for
objects that outgrew sharing.

## What the tree does not do

The technique's alternative design - convert to unique on any deletion that
is not of the last property - is not this tree's. The shared path always
replays and relies on the cap. A second deviation is in the unique shape
rather than the shared one: `UniqueShape::remove_property_transition`
(`unique_shape.rs:76-117`) carries a comment at lines 87-89, "The property
that was deleted was not the last property added. Therefore we need to
create a new unique shape", but the code mints `Self::new(prototype,
property_table)` unconditionally at line 116, last property or not. The
conservative behaviour is correct under the identity rule; the comment
describes an optimisation the code does not perform.

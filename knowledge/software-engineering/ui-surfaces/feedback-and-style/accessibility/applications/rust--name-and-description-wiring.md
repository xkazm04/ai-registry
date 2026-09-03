---
layer: application
type: application
subject: accessibility
technique: name-and-description-wiring
stack: rust
status: forged
verified_on: 2026-09-01
refresh_by: 2027-03-01
source: "AccessKit/accesskit"
---

# Name and description wiring — a cross-platform native a11y schema (AccessKit)

`AccessKit/accesskit` @ `00b517c24b037a7d20bcbf9b28e75cd622fe7fa3`, crate
`accesskit` 0.25.0 with `accesskit_consumer` 0.39.0; citations re-opened
2026-09-01. AccessKit is how a native or GUI-toolkit application publishes an
accessibility tree: a serializable schema of nodes, roles and properties
(`accesskit/src/lib.rs`), a consumer-side tree computing derived values
(`accesskit_consumer/`), and five adapters pushing those values into UI
Automation, NSAccessibility, AT-SPI, the Android node API and UIKit. It is the
non-browser second source this subject wanted: the same contract with none of
the browser's free machinery, every step visible as code.

**Fate: confirmed, with the technique's precedence outline refuted as a general
law and one of its rules found enforced structurally.**

## The chain exists, and it runs in the opposite order

The technique's outline is "an explicit reference to labeling elements wins over
a direct label attribute, which wins over an associated visible label, which
wins over the element's own content." AccessKit has all four sources and orders
the top two the other way round: `write_label`
(`accesskit_consumer/src/node.rs:773-790`) tries the node's own `label` string
property first via `write_label_direct` (`:764-771`), walking `labelled_by` only
when that is absent. The schema says so itself — `Label` "doesn't need to be
set" *if* the label comes from the relation
(`accesskit/src/lib.rs:2098-2099`). The relation is the fallback, not the winner.

`labelled_by` (`accesskit_consumer/src/node.rs:718-739`) carries the fourth
source inside it: with an empty explicit id list **and** one of eight roles
(`Button`, `CheckBox`, `DefaultButton`, `Link`, `MenuItem`, `MenuItemCheckBox`,
`MenuItemRadio`, `RadioButton`) it synthesizes the relation from descendants
filtered to `Role::Label | Role::Image` (`descendant_label_filter`, `:709-715`)
— content-as-name is a per-role opt-in, not a universal tier. Multiple targets
concatenate space-separated (`SpacePrefixingWriter`, `:779-782`), the one web
rule that survives unchanged.

One more inversion: a `Role::Label` node's own text lives in `value`, not
`label` (`label_comes_from_value`, `:744-746`), so every name consumer branches
on it first — windows, macos and atspi identically
(`adapters/windows/src/node.rs:404-412`, `adapters/macos/src/node.rs:328-334`,
`adapters/atspi-common/src/node.rs:37-44`). **What the technique should keep**
is not the ordering but the claim beside it: *know which source is naming each
control*. The ordering belongs to the platform abstraction, not the domain; a
product shipping a browser surface and a native one wires two chains that
disagree at the top.

## Description: the relation is declared and resolved by nobody

The hint expected `described_by` in the computation. It is not.
`Node::described_by` exists in the schema as the `aria-describedby` equivalent
(`accesskit/src/lib.rs:2043-2048`), but the consumer's `description()`
(`accesskit_consumer/src/node.rs:796-800`) returns the plain `Description`
string property (`accesskit/src/lib.rs:2105-2109`) and nothing else — grep-
scoped over the consumer and all five adapters:

```
$ grep -rn "described_by\|DescribedBy\|\.tooltip()" --include=*.rs \
    accesskit_consumer/src adapters/*/src
(no output; exit=1)
```

`Tooltip` (`accesskit/src/lib.rs:2178`), reserved for "a node's only label comes
from a tooltip", is equally unread — two declared sources of the description
channel that reach no platform.

The description that *does* travel diverges by adapter —
[assistive-tech-divergence](../techniques/assistive-tech-divergence.md) meeting the
error-wiring contract. Windows maps it to `UIA_FullDescriptionPropertyId`
(`adapters/windows/src/node.rs:1311`), macOS to `accessibilityHelp`
(`adapters/macos/src/node.rs:543-547`), AT-SPI to the accessible description
(`adapters/atspi-common/src/node.rs:46-48`) — and **Android drops the channel
entirely**: its `content_description` is the *label*
(`adapters/android/src/node.rs:73-75`), `description` never read
(`grep -rn "\.description()" adapters/android/src` → no output, `exit=1`).

**The placeholder rule is enforced by the tree, not by review.** The
technique's sharpest small rule — never name a control by its placeholder,
because it vanishes exactly when the user acts — is structural here.
`Placeholder` is a separate property whose doc says it "should not be used
instead of `Node::label`" (`accesskit/src/lib.rs:2155-2161`), is never consulted
by `write_label`, and is exposed only while the input is empty
(`accesskit_consumer/src/node.rs:834-838`): a design rule in the browser, a
data-model invariant here.

## Executed evidence

Existing suite, from the clone root: `cargo test -p accesskit_consumer` →
`206 passed; 0 failed`, cargo 1.97.1; its two placeholder tests
(`accesskit_consumer/src/node.rs:1781`, `:1849`) pin the empty/non-empty split.
A fresh harness in the worker's scratch namespace then built a tree with a
`Role::Button` carrying **both** `set_label("Save")` and `set_labelled_by` onto
a label node valued `"Cancel"`:

```
$ cargo test        # scratch crate namewire, path deps on the pinned clone
test tests::described_by_is_never_resolved_into_a_description ... ok
test tests::direct_label_beats_labelled_by ... ok
test result: ok. 2 passed; 0 failed
```

Asserted and passing: `label()` is `Some("Save")` — the direct property beats
the relation; `description()` is `None` and `has_description()` `false` on a
button whose only description is a `described_by` relation; with both present
the value is the property's. A first draft also asserted that label node's own
`label()` was `"Cancel"`, and **failed** with `None` — the cheapest proof of
the `label_comes_from_value` finding above.

## Leads

- **The announcement channel is wired to the name, and inherits.** `live()`
  falls back to the parent's grade (`accesskit_consumer/src/node.rs:906-909`),
  and every adapter that speaks refuses to fire without a computed name —
  `adapters/windows/src/adapter.rs:256`, `adapters/macos/src/event.rs:236-237`,
  `adapters/ios/src/event.rs:213-214`. A nameless live region is silent on all
  three: a live-region-architecture finding on this same pin. Return condition:
  a free slot on this subject.
- **`role_description` / `state_description`** (`accesskit/src/lib.rs:2168`,
  `:2173`) are the schema's answer to "no role words in names"; unexamined.

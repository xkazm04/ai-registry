---
layer: technique
type: technique
subject: native-shell-integration
technique: host-forwarded-key-contract
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success]
shared_with: []
use_when: [a page must be driven by a remote or controller whose keys the host browser keeps for itself, a native wrapper passes hardware keys into an embedded page, deciding when the back key leaves the application, a back press either traps the user or exits mid-flow]
---

# The host-forwarded key contract

## The concern

Some hosts keep their input for themselves. A television's built-in browser spends the
directional keys, select, back and menu on its own cursor and chrome, and hands a page only
the media keys. A web application that must be driven by that remote is then shipped inside
a thin native wrapper around an embedded web view, and the wrapper's job looks like a
passthrough. It is not. It is a contract with three clauses - which keys, who consumed them,
and where they land - and each clause left implicit fails in a way the user meets at once:
a key the page never hears, or a back press that exits from the middle of a task.

## Procedure

1. **One table, tested on the native side.** Map each hardware key code to the key name the
   page's own input handling already uses. Anything unmapped (volume, home, power) stays
   with the system. A unit test walks every row and asserts the name is one the page's
   mapping knows, so the two vocabularies cannot drift apart silently.
2. **Read consumption back; never assume it.** Dispatch each forwarded key as a cancelable
   event, and have the page cancel every key it handles. The wrapper reads back whether the
   page took the key.
3. **Back goes to the page first.** Leave the application only when the page did not take
   back, or when back is held past a fixed threshold - a long press leaves at once and is not
   forwarded. Without the readback, back either traps the user on a page with no handler or
   exits mid-flow, and neither shows up in a desktop test.
4. **Target and edges are part of the contract.** Deliver to the focused element, falling
   back to a known stage element when focus sits on chrome the page ignores. Send key-down
   then key-up, so listeners on either edge fire.
5. **Walk the table on the device**, every row, once per release of the wrapper.

## Decision rules

- When a key works in a desktop browser and not on the television, suspect the host kept it
  before suspecting the page.
- When back exits unexpectedly, check that the readback exists before tuning the threshold.
- When a page has no handler for a key, it must not cancel it - an uncancelled key is how
  the wrapper learns to fall through.

## Boundary

Key events created by script are untrusted: they run the page's handlers but no default
action, so Tab and the arrows move no focus and Enter activates nothing the page did not
handle itself. A page driven this way must own its focus model in state (the
keyboard-navigation model in the accessibility subject). Dispatching through the embedded
view's native key path keeps default actions but loses the clean consumption readback;
choose one path deliberately, never both.

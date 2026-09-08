---
layer: application
type: application
subject: guest-execution-bounding
technique: nested-liveness-ceilings
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@1.75
proof: structural-only
---

# A four-rung liveness ladder over an embedded script engine

## What was read

The same nine-crate Rust headless browser engine at commit `14ce5178`:
`crates/obscura-browser/src/page.rs` for the script-phase bounding, the operations
guide's "Reliability and timeouts" section, and the environment-variable reference that
publishes every rung as a tunable.

The witness for `verified_against` is the floor the workspace actually compiles under: the project declares no `rust-version` of its own, its container build pins the `1.x` line, and the vendored text-shaping crate it builds as part of the workspace declares `rust-version = "1.75"`. That is the most precise version this tree witnesses, and it is a floor rather than the version any build used.

## The ladder as this tree ships it

Four rungs, innermost first, each with a published default and an environment variable:

| Rung | Default | Scope |
| --- | --- | --- |
| per-module budget | 3000 ms | one enhancement module's graph load and evaluation |
| script phase deadline | 30000 ms | the whole script-execution phase of one navigation |
| per-command deadline | 60000 ms (`0` disables) | one CDP command, armed by the dispatcher |
| process hard deadline | — | the one-shot CLI's absolute backstop |

The ordering constraint the technique calls an invariant is stated in the operator
documentation rather than checked at startup: the per-command deadline must be kept
above the navigation ceiling. That is the weaker half of the rule — a convention a
reader can violate — and it is the one thing this tree does not enforce mechanically.
The navigation ceiling itself (30000 ms) is a fifth bound sitting beside the script
deadline rather than above it, which is why the documentation has to spell the
relationship out.

## Why each rung exists, in the tree's own words

The source comments name the escapes, which is the part the technique says most ladders
omit:

- The per-module budget exists because one slow non-essential module can block
  navigation completion. The comment cites a real site whose top-level module evaluation
  idle-waits about ten seconds.
- The script phase deadline exists because inline scripts "run back-to-back with no
  await between them", so neither a soft check nor a per-module bound sees the
  accumulation — the escape is precisely the one the technique predicts for a per-item
  budget.
- The per-command deadline exists because a runaway page could otherwise hold the V8
  lock and wedge other sessions. It is armed by the dispatcher, which is the component
  the guest's execution cannot reach — the technique's rule about who arms the outermost
  rung, satisfied.
- The process deadline exists as "a final backstop" for the one-shot path.

## The structural fact

The rung that most confirms the technique is the one that is *not* a time at all. The
per-module budget is not simply the smallest number: it is selected at run time between
3000 ms and the full 30000 ms script deadline, by counting the descendants of `body`
before the modules run. Over 50 descendants means the page already rendered and the
modules are enhancement, so the short budget applies; at or under 50 the body is still
an unmounted single-page-app shell, the module *is* the application, and truncating it
would return a blank page. The comment records the issue number that produced the rule.

A ladder whose innermost rung is chosen by observing the host's own output is a stronger
claim than the ladder alone, and it is documented in
[budget-tier-from-observed-output](../techniques/budget-tier-from-observed-output.md).
Its threshold is derived the way that technique asks: the two populations are an order
of magnitude apart — "a rendered body has hundreds of descendants; an unmounted shell is
`<root>` plus maybe a spinner" — and the comment states the range rather than only the
number.

## What this realization cannot do

The ladder reports which bound fired through log lines and error text, not through a
typed outcome class per rung, so an operator distinguishing "this module was slow" from
"the whole phase overran" is reading prose. And the ordering invariant between the
per-command deadline and the navigation ceiling is documented, not enforced: a
deployment that raises the navigation timeout past the command timeout gets a system
where the outer rung always fires first and the inner diagnostic disappears, with
nothing at startup to say so. That is the gap this subject's technique names and this
tree has not closed.

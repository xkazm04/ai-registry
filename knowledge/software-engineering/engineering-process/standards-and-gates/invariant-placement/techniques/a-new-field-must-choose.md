---
layer: technique
type: technique
subject: invariant-placement
technique: a-new-field-must-choose
status: forged
laws: [absent-guard-is-loud, failure-not-empty-success]
shared_with: []
applied: experiment
ab_verdict: unmeasurable
use_when: [an operation must decide about every field of a type such as a reset or a snapshot, a reset between runs missed a field added later, a match has a default arm over a type the same repository owns, deciding whether a closed type should be marked open for future variants, a state struct has fields that must survive a sweep and fields that must clear]
---

# A new field must choose

Some operations must decide about every field of a type: a reset between runs, a snapshot for warm
restart, a serializer, a clone that drops caches. Written as a list of the fields to touch, such an
operation is right on the day it is written and wrong the first time someone adds a field, because the
new field needs no edit there and nothing notices. No search or review rule finds it, since the defect is
a line nobody wrote.

This is the shape altitude applied to a decision rather than to a value. The rule is not "this field is
valid". It is "someone decided what happens to this field here", and the only moment that can be enforced
is when the field is added.

## Make the addition stop the build

Where the language checks that a pattern names every field, bind them all in the operation with no rest
pattern, and mark the ones left alone explicitly, each with its reason. Adding a field now stops the build
at that operation until its author decides.

Group the bindings by class: reset always, reset on this path only, must survive. The grouping is the
documentation, and it cannot go stale without failing to compile. The classes matter as much as the check.
Sweeping a field that had to survive is as bad as keeping one that had to clear, and the failure usually
shows far from the sweep.

Naming a field is not handling it. An author can add the name to the pattern to quiet the error and do
nothing with it. A lint on unused bindings closes that gap, but only where the lint fails the build; as a
warning it compiles and runs.

## Enumerations have the same move

A match with no default arm is the same check, with the variants that deliberately do nothing listed and
their reasons written beside them. A default arm is the list of fields again: a new state reads as whatever
the default says. [action-catalog-single-source](../../../../llm-agent/companion/companion-runtime/techniques/action-catalog-single-source.md)
states this for one table of actions; it holds for any total fold over state.

Attributes that keep a type open for outside users cost this property. They force a default arm in every
other compilation unit, including your own. Inside one repository that compiles together the attribute gives
up the compile error and buys nothing: one tree's new paused state displayed as running until someone added
an arm by hand and pinned it with a test. Keep the attribute for dependents you do not build with, which is
the published-boundary case in
[consumer-decides-error-shape](../../../../backend-platform/resilience/error-handling/techniques/consumer-decides-error-shape.md).

A reader that picks a few events out of many keeps its wildcard by nature. That is where a wrong selection
stays silent, and this technique does not reach it.

## What it does not prove

It proves a decision was made, not that it was right. It does nothing in a language with no such check,
where the fallback is a test that enumerates the fields by reflection or a generated list.

## When not

Small types whose operations change with every field anyway. A two-field type with one reset site gains a
longer pattern and little else, so the price of the pattern starts paying when fields outnumber what a
reviewer holds in mind, or when some fields must survive for a reason the code does not show.

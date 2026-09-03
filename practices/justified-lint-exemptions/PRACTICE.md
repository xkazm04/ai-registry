---
id: justified-lint-exemptions
dimension: D6
applies-when: "The repo runs a linter or static analyser in a strict configuration, and its suppressions - file-level allows, inline disables, ignore entries - carry no recorded reason for existing."
---

# Justified lint exemptions

**What it gives you:** a strict analyser configuration that stays strict, because every
suppression in the tree states the reason it exists and can therefore be re-tested later
instead of being inherited forever.

**Dimension:** D6. **Starter:** [`starter/LINT-EXEMPTIONS.md`](starter/LINT-EXEMPTIONS.md).

## The shape

Two halves, and neither works without the other.

1. **Turn the strict rule set on, at the top, denying rather than warning.** A rule set that
   emits warnings is a rule set nobody reads after the first hundred. The configuration
   declares the strict group as an error, in one place, for the whole unit - so the default
   answer to "should this fire?" is yes, and every exception is visible as an exception.
2. **Every suppression carries a reason on the line above it.** Not a ticket number, not a
   category name: a sentence saying what produces the finding and why it is not a defect.
   The two reasons that recur are the only two that are ever legitimate - *the finding comes
   from generated code we do not author*, and *the finding is a false positive of this
   analyser version on idiomatic code*. Both are claims that can go stale, which is the
   entire point of writing them down.

The suppression and its reason live together, in the file the suppression governs. A central
registry of exemptions decays into a list nobody maps back to code; a comment beside the
directive is read by everyone who reads the directive.

## Why this shape

A suppression is a decision made under pressure - the build is red, the finding is
uninteresting, the fix is elsewhere. The decision is almost always correct at the moment it
is taken and almost never revisited, because the information needed to revisit it left with
the person who took it. Six months later a reader sees a bare directive and has three
choices: leave it (the default), delete it and discover why it was there from a red build,
or spend an hour reconstructing the argument. All three are worse than reading one sentence.

The reason also converts the suppression into a **testable claim**. "Triggered by the derive
macros we use" is falsifiable: upgrade the macro library, delete the suppression, run the
analyser. If it stays green, the exemption is spent and goes. Without the sentence there is
nothing to falsify, and the exemption list only grows - which is how a strict configuration
becomes a permissive one without anybody deciding to make it permissive.

There is a second-order effect worth naming: a convention that every suppression is
justified makes an unjustified one conspicuous in review. That is cheaper than any tooling,
and it is the only enforcement most repos will ever need.

## Rules

- One reason per suppression, or one reason per contiguous group that shares a cause.
- The reason names the **cause**, not the effect. "Noisy" is not a reason; "triggered by the
  code the derive macro generates" is.
- A suppression with no plausible re-test - "we will never fix this" - is not an exemption,
  it is a decision to not enforce the rule. Take it out of the strict group instead, where
  it is visible as policy rather than hidden as an exception.
- Scope each suppression as narrowly as the tool allows. A file-level suppression with a
  good reason still silences findings the reason does not cover.
- Never suppress to make a red build green without reading the finding. That is the failure
  the practice exists to prevent, and the reason comment is where the lie would have to be
  written down.

## How to tell it is working

- Count suppressions in the tree and count the ones carrying a reason. The practice is
  working when the second number equals the first. A repo that has never counted should
  assume a gap.
- The count of suppressions is flat or falling across releases, not rising.
- At least one exemption has been deleted after a dependency or analyser upgrade, with the
  deletion citing its own reason comment.
- A new contributor can answer "why is this rule off here?" by reading the file.

## Adopting it

1. Turn the strict rule set on as an error and see what fires. Do not fix anything yet.
2. Suppress the findings you are not going to fix now, each with its reason, at the
   narrowest scope that works. This is one commit and it is allowed to be large.
3. Copy [`starter/LINT-EXEMPTIONS.md`](starter/LINT-EXEMPTIONS.md) into the repo's
   contributing guide, or inline its two rules there, so the convention is stated where a
   contributor meets it.
4. Add one line to the review checklist: a new suppression needs a reason. No tooling
   required; a reviewer reading a diff sees a bare directive immediately when every
   neighbouring one has a sentence above it.
5. Re-test the exemptions when you upgrade the analyser or the libraries the reasons name.
   That is the only cadence this practice needs, and it is event-driven, not scheduled.

## Anti-patterns

- **The bare suppression.** The whole failure, in one line of code.
- **A ticket number as the reason.** It points at a system with a different retention policy
  than the repo, and the ticket usually says less than the sentence would have.
- **A blanket suppression at the top of the file to buy quiet.** It silences the findings
  nobody has looked at yet, and its reason - if written honestly - would say so.
- **Warnings instead of errors, so no suppression is ever needed.** This looks like the
  absence of exemptions and is in fact the absence of enforcement; the findings accumulate
  in the log where the practice cannot see them.
- **A central exemptions file.** It drifts from the code, and nobody deleting a function
  remembers to delete its row.

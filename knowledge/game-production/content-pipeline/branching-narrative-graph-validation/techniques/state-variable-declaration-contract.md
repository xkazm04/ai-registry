---
layer: technique
type: technique
subject: branching-narrative-graph-validation
technique: state-variable-declaration-contract
status: forged
laws: [one-authority-per-quantity, law-and-check-share-one-source, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a condition reads a flag that is sometimes unset, declaring the state a conversation may touch, catching misspelled narrative variables before they ship]
---

# The state variable declaration contract

The named concern: every piece of state a conversation reads or writes is declared once,
with a type, a domain, an initial value and an owning writer — and every read is proven to
have a reaching write on every path that can arrive at it. Without the declaration, a
narrative variable is an untyped, undefaulted global with dozens of authors, which is
precisely the construct every other discipline abandoned decades ago.

## The declaration

One row per variable, and each field earns its place by making a specific check possible.

- **Name**, canonical and unique. The whole graph refers to the variable by this and only
  this.
- **Type** — boolean, a small enumeration, a bounded integer, a counter. Most narrative
  state is a boolean or an enumeration, and both are checkable; an unconstrained string is
  not, and it is where the misspellings live.
- **Domain** — the permitted values, stated. For an enumeration this is the value list; for
  a counter it is a range with both ends. This is
  [a number carries its unit and its basis](../../../_laws.md#a-number-carries-its-unit-and-basis)
  in narrative clothing: `reputation` is not a quantity until somebody says whether it runs
  zero to a hundred or minus three to plus three, and two authors will assume differently.
- **Initial value**, or an explicit declaration that there is none — which is a stronger
  statement, because it means every read must be dominated by a write.
- **Owning writer** — which node, scene or system is allowed to set it. Others read.
- **Scope and lifetime** — does it live for this conversation, this quest, this playthrough.
  A variable whose lifetime nobody stated will eventually be read after the thing that set
  it was reset.

The owning writer is the field teams leave out and the field that pays most, because it is
[one authority per quantity](../../../_laws.md#one-authority-per-quantity) applied to
narrative state. When four scenes may all write `trustsTheCaptain`, the value at any read is
the outcome of a race between authors who never met, and the resulting bug — the character
warm to a player who betrayed them — is diagnosed by reading four scenes.

## The checks the declaration buys

**Read without a reaching write.** For each read, walk backwards from its node over all
paths to the entries; if any path contains no write to that variable and the variable has no
initial value, the read is undefined on that path. Report the path, not just the node.
This is the analysis a compiler calls definite assignment, and it fails in the same place: a
join where one predecessor wrote and another did not. It is the single highest-value check
here and it is not expressible as a rule about any one node, which is why per-node review
never finds it.

**Write outside the declared domain.** Cheap, total, and catches the enumeration value a
generator invented — a mood set to a word that no condition anywhere tests for, so the
branch it was supposed to open never opens and nothing reports an error.

**Singleton names.** Count occurrences of every name. A name occurring exactly once in a
graph that uses forty names is, in practice, either a misspelling of a real one or dead
state, and both are defects. The check takes ten lines and finds the class of bug that is
otherwise found in play, by a tester who notices a door that never opens.

**Read of a variable no reachable writer owns.** A read whose declared owning writer sits in
a scene the player may not have played is not a defect of this graph — it is a cross-scene
dependency, and it must be declared as an entry precondition or defaulted. Silently
defaulting it to false makes the conversation play the "never happened" version to a player
who did the thing.

## Where the declaration lives

It lives with the graph, in the same artifact, and the checker reads it from there. A
declaration maintained in a separate design document drifts from the graph within one
sprint, and the drift is invisible from both sides — the document says the flag has three
values, the graph sets a fourth, and nothing compares them. That is exactly
[the law and the check that enforces it share one source](../../../_laws.md#law-and-check-share-one-source):
the domain the checker validates against must be the same text the author reads when
choosing a value. A parse failure of the declaration is a loud error, never a fallback to
"unconstrained", because a silent fallback turns the whole contract off at the moment it
matters most.

## Decision rules

- **When a variable is read, require a declaration; when it is written, require the same.**
  An undeclared name is a failure, not an implicit declaration. The permissive default is
  what allows a misspelling to become a new variable.
- **When state has no initial value, every read must be dominated by a write.** Prefer this
  to a default where the two states genuinely differ — a defaulted flag makes "not yet
  decided" indistinguishable from "decided no", and characters will treat them the same.
- **When two variables would need to be consistent with each other, make one derived.** Two
  independent booleans that must never disagree will disagree.
- **When a generator authors the graph, hand it the declaration table as part of the
  prompt**, not as a post-hoc check. A generator that has not been told the value set will
  invent values that read beautifully and match nothing; a generator that has been given the
  set uses it. Filtering afterwards spends a rejection on every artifact and improves
  nothing about the next one.
- **When a variable's domain changes, re-run the whole graph's checks, not the changed
  nodes.** Domain changes invalidate conditions anywhere.

## When not to use this

- **On state the conversation only reads from a live simulation** — a health value, a time
  of day, an inventory count owned by another system. Declare those as external inputs with
  their domain, and check the domain; do not attempt reaching-write analysis on a value this
  graph does not write, because the answer is always "no reaching write" and the finding is
  noise.
- **On a scratch draft with three nodes.** The contract's cost is real and it pays at the
  scale where a person can no longer hold the flag set in their head, which arrives sooner
  than authors expect but is not node one.
- **As a way to forbid unbounded state.** Some narrative state genuinely is free-form —
  a remembered player-entered name, a chosen title. Declare it as unconstrained and
  deliberately, so that the singleton-name check can still run over the names of the
  variables themselves, and accept that its *value* is not checkable.

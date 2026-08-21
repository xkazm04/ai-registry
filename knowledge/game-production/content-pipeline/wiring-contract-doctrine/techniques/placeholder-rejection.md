---
layer: technique
type: technique
subject: wiring-contract-doctrine
technique: placeholder-rejection
status: forged
laws: [compiling-is-not-wiring, unmeasured-is-not-a-pass]
shared_with: []
use_when: [checking a filled-in wiring contract, designing the acceptance rule for a declaration field, a catalog that passes every check and nobody can play]
---

# Placeholder rejection

A field that has been filled but not answered must fail the same way an empty
field fails. This is the rule that keeps the wiring contract from decaying into a
form: the adversarial reading of every declaration, where the question is not
"is there text here" but "does this text name something".

Without it, the contract's lifecycle is predictable. Version one: the fields are
required, and are answered. Version two: a deadline arrives, somebody writes "TBD"
to get past the checker, and it passes. Version three: the generator, having seen
version two in its own corpus or its own examples, produces "TBD" natively.
Version four: the contract is a ritual, every artifact is green, and the catalog
is unreachable. The rejection rule is what makes version two impossible, which is
the only version where intervention is cheap.

## What counts as a placeholder

Three distinct shapes, and they need different detection:

**Literal markers.** `TBD`, `TODO`, `FIXME`, `N/A`, `none`, `?`, `-`, an empty
string, a single word. These are cheap to catch with an exact list and should be
caught with an exact list, because a regex over prose produces false positives on
legitimate text that happens to contain the word.

**Structural hedges.** Text that has the grammar of an answer and names no
referent: "the appropriate system", "handled elsewhere", "as needed", "standard
setup", "via the usual mechanism", "will be wired later". The detector here is
referential, not lexical: **does the field contain at least one concrete noun that
could be looked up?** An identifier, a named table, a named tier, a named event, a
named catalog entry. A field of pure common nouns names nothing.

**Self-referential verification.** The verification field's special placeholder,
and the most common one: "test in game", "verify it works", "confirm correct
behaviour". These describe the act of verifying rather than the observation, and
they pass any check that looks for text. The rule is a shape rule: a verification
must contain an *action* and an *observable consequence*. "Verify it works" has
neither.

## The procedure

1. **Reject the literal markers first**, by exact match against a maintained list,
   case-insensitively, on the whole trimmed field. Cheap, unambiguous, catches the
   deadline-pressure case.
2. **Require a resolvable referent** in each field that has one. Dependencies must
   contain identifiers that resolve; granting and activation must name at least
   one entity, table, tier, event or binding that exists in the project's
   vocabulary. This is where placeholder rejection hands off to link resolution.
3. **Require the action-plus-consequence shape** in verification, and reject the
   field otherwise.
4. **Apply a minimum specificity floor, and derive it from the corpus rather than
   from taste.** Measure the shortest *genuine* answer already present across the
   existing artifacts, then set the floor well below it — roughly a third — so the
   gate admits every real answer and still rejects a stub. In one production
   catalog the shortest real activation claim ran about thirty characters and the
   floor was set at twelve; that gap is what makes a hard reject safe. Derived that
   way the floor is a hard reject, not a warning. Set arbitrarily it becomes a
   padding incentive, which is why the measurement is not optional and why the
   floor's basis should be recorded next to the number.
5. **Report the rejection with the reason and the field**, never as a generic
   failure. "Verification is a placeholder: names no observable consequence" is
   fixable in thirty seconds. "Artifact invalid" starts an investigation.

## Decision rules

- **When a placeholder is genuinely the truth — the wiring really is not done —
  the correct value is a named blocker, not a marker.** "Granted by: NOT YET
  WIRED, awaiting the tier-three progression slot" states the same fact and states
  what is missing. Accept that form explicitly and route the artifact to a blocked
  state; a doctrine with no legal way to say "not yet" gets lied to.
- **When the rejection rate on a field spikes across a batch, fix the authoring
  prompt, not the artifacts.** A systematic placeholder is a signal about the
  instruction, and repairing the outputs one at a time treats the symptom two
  hundred times.
- **When a human overrides a rejection, record the override and who made it.** An
  override that leaves no trace is indistinguishable from the check never having
  run, and the aggregate cannot tell the difference either.
- **Never soften a rejection to a warning to unblock a release.** A warning in a
  content pipeline is read exactly once. The honest lever is to move the artifact
  to a declared deferred state, which keeps it out of the "done" count.

## Why this cannot be left to review

Human review catches placeholders reliably in the first fifty artifacts and
unreliably after that, because the reviewer's attention is the scarce resource and
a well-formed hedge is specifically designed — by grammar, not by malice — to
consume none of it. Machine authors make this worse in a particular way: their
hedges are *fluent*, which is exactly the property that makes a reviewer's eye
slide past. A generator asked for a section it has nothing to say in will produce
confident, well-punctuated, entirely referent-free prose, and it will do so
consistently. The check must be mechanical for the same reason spell-check is
mechanical.

## When not to use it

- **Not on free-text fields that are meant to be free text.** A designer's intent
  note is allowed to say "feels floaty, revisit". Apply rejection only to
  declaration fields whose entire purpose is to name something real.
- **Not as a lexical blocklist over prose.** Banning the *word* "appropriate"
  catches sentences that legitimately use it and misses "handled by the relevant
  subsystem". The durable test is referential — is there a lookup-able name — and
  the lexical list exists only for the small set of exact markers.

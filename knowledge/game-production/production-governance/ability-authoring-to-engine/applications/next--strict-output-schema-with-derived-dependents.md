---
layer: application
type: application
subject: ability-authoring-to-engine
technique: strict-output-schema-with-derived-dependents
stack: next
status: forged
verified_on: 2026-10-14
verified_against: next@16
applied: code
ab_verdict: better
---

# A reply schema that typed every field alone and let the artifact contradict itself

The PoF ARPG project's Ability Forge asks a model for one JSON object carrying two
generated C++ files plus structured stats, tags, combo timing and radar values. The
server route already met the first half of the technique: JSON-only output, an explicit
truncation report, and a validator naming every absent or wrongly typed field before the
payload reaches the UI. Step 5 was the gap. Each field was checked on its own, so
relationships were left to the prompt's advice.

## The seam, chosen to falsify "the schema is strict"

Three kinds of internally impossible reply passed the validator:

- A damage window ending after the animation it lives inside, a recovery longer than the
  whole action, a reversed window, a negative cooldown or damage, a radar axis of 7.
- A radar value outside its declared 0-1 range, which the chart clamps silently.
- One quantity authored twice. `stats.manaCost` is read by the adopt path that builds the
  engine effect; the constructor's `AbilityManaCost` literal is read by the shipped code.
  The model writes both, nothing compares them, and the two surfaces then disagree.

The third kind is the technique's "quantity at two layers" rule in a form the corpus
had not named: the second layer is a literal inside a generated text artifact, not a
second structured field, which is why a field-by-field validator cannot see it.

## What A and B were

- **A**: the validator as it stood. Six new contradiction cases, each shape-valid:
  accepted 6 of 6, one failing test.
- **B**: a relationship pass that runs only after the shape check is clean, naming each
  contradiction (bounds, window containment, recovery against action length, radar range,
  manaCost against the constructor literal when that literal is readable), plus one
  prompt rule stating the same constraints and the rejection. 6 of 6 rejected, a
  consistent ability still accepted.
- **Floor**: the existing validator tests, the forge adopt, spec and component suites
  (3,927 tests), type check and lint clean.

## What was left alone

The duplicated stats were not removed from the schema. Dropping `stats` and deriving it
from the generated code would be the technique's default answer, but the UI and adopt
path read `stats` as a unit, and the code literals are not reliably parseable for the
damage and cooldown values. The check is the advisory-plus-divergence form of step 3 for
the one field whose literal is stable. Return condition: derive damage and cooldown from
a typed constants block the generator must emit, then drop them from the schema.

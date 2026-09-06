---
layer: technique
type: technique
subject: metric-gates
technique: proxy-metric-counts-its-own-satisfiers
status: forged
laws: [gate-sees-target, count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [a coverage or parity metric reads zero gaps, a metric can be satisfied by an artifact built to satisfy it, publishing a number whose predicate is weaker than the claim readers make from it, deciding what a generated status artifact must say about itself, two sides of a comparison report totals that are not comparable]
---

# A proxy metric counts its own satisfiers

[deterministic-proxy-gate](./deterministic-proxy-gate.md) swaps a noisy
instrument for a deterministic one, keeping the standard. The substitution this
technique governs is the other kind, and it is usually not a decision anyone
made: a metric that is **cheap to compute and weaker than the claim it is read as
making** — name existence standing in for feature parity, file presence for
documentation, a route's declaration for its enforcement, a symbol's export for
its behaviour.

Such a metric is not wrong. It is a proxy, and
[gate-sees-target](../../../../_laws.md#gate-sees-target) says a proxy passes
exactly when it diverges from the target. What makes this class distinct from an
ordinary proxy is that **the population can be moved toward the proxy directly.**
Nobody has to cheat. When a tracker says a name is missing and the cheapest way
to clear the row is to export the name, the row clears — and the tracker,
truthfully, reports progress.

## The three-part corrective

### 1. The artifact states what a green cell does not mean

The disclaimer belongs **in the generated artifact**, above the table, not in a
design document readers of the table will never open. It says what was actually
matched and what that does not establish. A measured instance, in its own words:
a green cell means "the name is exported — not that it works", and the tracker
"does not verify that the capability is reachable, wired up, or behaves like its
counterpart."

The same paragraph is where a metric admits **which of its numbers are not
comparable to each other**. That instance's summary reported 411 features on one
side and 2,018 on the other, and said plainly that the second figure includes
re-exports, "reflects module structure, not distinct capabilities, and is not
directly comparable". Two totals side by side in one table are read as a ratio
whether or not one was ever meant to be
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)); the
only cheap defence is for the artifact to refuse the comparison itself.

### 2. A strictly stronger tier stands behind it, and it is the one that gates

The weak metric is kept — it is fast, it runs on every change, and it catches the
crude regression. What it does not get is the authority to say *done*. Behind it
runs a narrower, more expensive instrument over a **curated** surface, checking
the property the proxy only gestures at.

The instance's second tier compares, per curated surface, every parameter's
presence, its required-ness, and its effective default, and it found **28
mismatches across 222 parameters on 17 surfaces at the moment the first tier
reported zero gaps.** That number is the technique's whole argument: the tiers
disagreed, in the direction the proxy is structurally unable to disagree in.

Two design rules keep the strong tier from decaying into the weak one:

- **Unevaluable reads as unknown and needs a waiver, never as a pass.** Where the
  extractor cannot determine a value, the row is not quietly satisfied — it fails
  until someone waives it by name. This is the boundary that decides whether the
  strong tier stays strong, and it is exactly
  [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) in
  the extractor's vocabulary: "no difference found" and "could not look" must be
  spelled differently.
- **Every gap is waived explicitly or the check fails.** The waiver file is the
  strong tier's suppression surface and inherits
  [suppression-hygiene](../../../codebase-stewardship/dead-code/techniques/suppression-hygiene.md)
  entire — reasons with substance, stale entries failing the run, and a count of
  what each entry ate.

### 3. The metric counts the artifacts that exist only to satisfy it

This is the part that is almost never built, and it is the cheapest of the three.

When a proxy can be satisfied directly, some rows *will* be satisfied directly,
and the honest response is neither to forbid it nor to ignore it, but to **make
it a separate column in the same table.** The measured instance carries a `stub
exported` count beside its gap count: rows whose only provider is a shim module
that exists, in the artifact's own words, "to satisfy this tracker's name
matching rather than to implement the feature."

The value is not the enforcement — it is the arithmetic it enables in front of
whoever reads the number. `0 gaps` and `0 gaps, 40 of them stubs` are different
states of the world, and a reader who is shown both can price the metric without
being told to distrust it. Three properties make the column work:

- **It is produced by the same instrument.** A separate audit of stub-ness is a
  second thing to maintain and will drift; the tracker already knows which
  module provided each name, so the classification is a lookup it is doing
  anyway.
- **The satisfier is structurally identifiable, or the column is a guess.**
  Concentrating the shims in one module, one naming convention, or one
  annotation is what makes them countable. A codebase where satisfiers are
  scattered indistinguishably among real implementations cannot have this column,
  and that is itself the finding.
- **It is a review trigger, not a gate.** Stubs are legitimate — they hold a
  place, they keep an import compiling, they stage a migration. The finding is
  the stub count rising while the gap count falls, which is the population
  moving toward the proxy rather than toward the standard.

## The tell, when none of this exists yet

A proxy metric that has reached zero and stayed there is the state to be
suspicious of, not reassured by. Ask what the cheapest possible action is that
would clear one row, and whether anything in the repository would look different
if that action had been taken instead of the intended one. Where the answer is
*nothing would look different*, the metric has no way to tell the two apart, and
neither does anybody reading it.

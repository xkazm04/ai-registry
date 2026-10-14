---
layer: application
type: application
subject: copy-quality-gates
technique: severity-as-declared-data
stack: process
status: forged
verified_on: 2026-10-14
applied: experiment
ab_verdict: unmeasurable
---

# Dispositions are declared, but the declaration accepts what the technique forbids (kp)

The seam hunt chose the check that could falsify the technique's two hard rules: "a statistical
verdict never blocks" and "a structural check is error by law, not by configuration".

## What the tree showed

- The catalog gate (`scripts/i18n/catalog-check.mjs`) returns a flat list of message strings. Its
  checks (brace balance, ICU parse, control characters, dashes, carried literals, list parity,
  placeholders) are all deterministic and all block; none is statistical, so the first rule holds
  vacuously and no disposition exists to declare. A finding carries no rule identifier.
- The copy layer (`native-copy`) does declare dispositions: every rule has a default severity and the
  contract's `rules` object overrides it. kp's contract has `"rules": {}`, so no override exists to lack
  its reason.

## A and B (experiment, harness only, no product code changed)

Arm A: feed the contract normalizer two overrides no declared policy should accept.
`{"EN-ARTIFACT": "off"}` (markup residue: a structural corruption check) and
`{"EN-PUFFERY": "error"}` (a style heuristic). Both returned zero errors and were stored verbatim.
The technique's step 3 asks configuration to refuse the second class an error tier and the structural
class an off switch; the contract has neither guard and no reason or count field beside an override.

## Verdict

Target (illegal dispositions refused) measured at A only: 0 of 2 refused. No B arm was built: the guard
is a skill change (a `structural` flag on rules, a refusal in `normalizeContract`) that belongs in the
`native-copy` skill's own review, not in a project. `unmeasurable`; the instrument is the same two-case
fixture run against the guarded normalizer. Floor not exercised (no change). Return condition: when
a contract first carries a non-empty `rules` object, or a model-based rule gets a configurable tier.
The technique held; the finding is that the declaration is data but not yet governed data.

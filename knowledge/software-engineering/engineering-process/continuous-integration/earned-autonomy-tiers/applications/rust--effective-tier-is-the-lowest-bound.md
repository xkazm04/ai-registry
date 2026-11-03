---
layer: application
type: application
subject: earned-autonomy-tiers
technique: effective-tier-is-the-lowest-bound
stack: rust
status: forged
verified_on: 2026-11-03
verified_against: rust@1
applied: simulation
ab_verdict: better
---

# A ladder in a SQLite store: the minimum is taken once, at promotion

The `personas` desktop app (https://github.com/xkazm04/personas), read at `origin/master`,
commit 73888ab73a, runs a scanner's autonomy ladder in its Rust store. A slice is
`<category>|<lens>|<risk_class>|<size>`. Its level moves on an append-only event table, and the
gate that lets the machine decide reads that level. This application traces
[effective-tier-is-the-lowest-bound](../techniques/effective-tier-is-the-lowest-bound.md) through
the store and the gate. The companion application
[rust--demotion-attribution-integrity](./rust--demotion-attribution-integrity.md) covers the
demotion path in the same tree.

## What the store states

The module header states the whole policy:

- start (technical at 2, product at 0): `src-tauri/db/src/repos/dev/scan_trust.rs:14 "capped by the ceiling."`
- ceilings (secret, authz and money at 1): `src-tauri/db/src/repos/dev/scan_trust.rs:15 "1, everything else 3."`
- earn: `src-tauri/db/src/repos/dev/scan_trust.rs:21 "*Earn*: agreement >= 0.9 over a window of n >= 20 -> up one level."`
- lose: `src-tauri/db/src/repos/dev/scan_trust.rs:22 "*Lose*: a human reversal of a machine decision, or a proof re-measured"`

The design follows the registry's own `scan-finding/1` contract (`docs/skill-clauses/finding-contract.md`
in this registry). Several deviations below are therefore the contract's, not the tree's.

The tree gets the location right. The gate computes the level from the store, never from the
filing:
`src-tauri/src/commands/infrastructure/scan_contract.rs:245 "let level = trust::slice_level(db, project_id, &trust::slice_key(idea))?;"`.
That honours [gate-sees-target](../../../../_laws.md#gate-sees-target), and the contract says the
same: a scanner's claim of a level is never trusted.

## Deviation 1: the ceiling is applied at promotion, not at read time

The current level is the newest event's level, with nothing above it:
`src-tauri/db/src/repos/dev/scan_trust.rs:454 ".unwrap_or_else(|| start_for_slice(slice)))"`.
The ceiling is consulted only to stop a climb:
`src-tauri/db/src/repos/dev/scan_trust.rs:541 "if level >= ceiling {"`.
The ceiling is a function of code (a lens-to-risk-class table), so it moves when that table moves.
A lens reclassified as `authz` after its slice reached L3 keeps L3, which is exactly what the
technique's "applied at read time rather than baked into each standing" warns of. The L1 gate
only asks `level < 1`
(`src-tauri/src/commands/infrastructure/scan_contract.rs:246 "if level < 1 ||"`), and every
ceiling is at least 1, so the auto-triage rung cannot be hurt. The exposure is the level the
filing response reports to the scanner, which the scanner uses for the build and merge rungs.

## Deviation 2: an unknown class gets the highest ceiling

The risk-class table is described as "deliberately pessimistic where a ceiling is at stake", and
it is pessimistic for the lenses it names. A lens it does not know returns no class,
`src-tauri/db/src/repos/dev/scan_trust.rs:280 "_ => return None,"`, and no class maps to the top
ceiling, `src-tauri/db/src/repos/dev/scan_trust.rs:336 "_ => MAX_LEVEL,"`. The technique's rule
is the opposite: a class the policy does not declare is human-only.

The lens comes from the filer, sanitized but not checked against a declared set:
`src-tauri/src/commands/infrastructure/scan_contract.rs:179 "lens: raw.lens.map(sanitize_lens).filter(|l| !l.is_empty()),"`.

## Deviation 3: enrolment is implicit and starts above the bottom

A slice with no events reads its start, and a technical slice starts at the third rung:
`src-tauri/db/src/repos/dev/scan_trust.rs:343 "=> 2,"`.
Taken together with deviation 2, a filer that sends a new lens id mints a new slice. That slice
starts at auto-build with an auto-merge ceiling and an empty window, and none of the demotions
recorded against the old lens carry over. In this tree the class is minted by the claimant.

## Promotion is automatic

`src-tauri/db/src/repos/dev/scan_trust.rs:555 "to: level + 1,"` is appended by the store when the
window clears. No person approves it. Per
[asymmetric-promotion-and-demotion](../techniques/asymmetric-promotion-and-demotion.md), that is
defensible only under a reviewed rule, and only up to a rung that still shows each action to a
person. The bar is a raw rate:
`src-tauri/db/src/repos/dev/scan_trust.rs:42 "pub const PROMOTE_AGREEMENT: f64 = 0.9;"` over
`src-tauri/db/src/repos/dev/scan_trust.rs:40 "pub const TRUST_WINDOW: usize = 20;"`. Eighteen of
twenty clears it, with a two-sided 95% Wilson lower bound of about 0.70; see
[recomputable-promotion-trial](../techniques/recomputable-promotion-trial.md).

The tree does get the cooldown right without naming it. Every event resets the window, so a
demoted slice needs twenty fresh human decisions before it can climb again.

## Simulation: three real slices under the contract and under the conditioned rule

| slice | contract (as built) | technique (conditioned) |
| --- | --- | --- |
| `product\|security-auditor\|-\|-`, L0 to L1 | promotes on 18 of 20; L1 shows each decision with a 24 h veto, and the ceiling is 1 | allowed: declared class, people's verdicts, the rung still shows each action to a person |
| `technical\|error-handler\|-\|S`, L2 to L3 | promotes on 18 of 20 into auto-merge | refused: the rung lands a change unread, so a person promotes |
| `technical\|<new-lens>\|-\|M`, first filing | starts at L2 with ceiling 3 | refused: undeclared class, human-only until declared |

The conditioned rule agrees with the contract where the contract keeps a person in the path, and
it differs on the two slices where the contract lets a filer-chosen or bar-cleared class land
work nobody read. **Falsifier:** an auto-merged slice whose merges are reverted at a rate the
0.70 bound excluded would show the contract's bar too weak even where the rule allows it. A
declared, never-reverted L3 slice would show the refusal costing review for nothing. This pass
did not read any project's live trust report, so which of the two is happening is not known.

These deviations belong to the contract, which this registry owns. They are recorded as a
proposal against it, not patched in the tree.

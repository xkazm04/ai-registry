---
layer: application
type: application
subject: metric-gates
technique: proxy-metric-counts-its-own-satisfiers
stack: python
status: forged
verified_on: 2026-09-06
verified_against: python@3.10
applied: simulation
ab_verdict: better
---

# A parity tracker reading zero gaps, beside a stronger tier finding 28 mismatches on the same surfaces

The version witness is the tree's own pin: `src/praisonai-agents/pyproject.toml:10`
declares `requires-python = ">=3.10"` (package `1.7.4` at line 7; the TypeScript
side is `1.7.4` in `src/praisonai-ts/package.json`). Read at commit `54244695b`,
tree unmodified.

## Both tiers exist here, and they disagree

A multi-agent SDK maintains a Python core and a TypeScript port. Two generated
artifacts measure the port's fidelity, and the technique's three parts are all
present — which is why this is a confirming application rather than a
prescriptive one.

**Tier 1, `src/praisonai-ts/PARITY.md`** — exported-name existence, parsed from
the public barrel following re-exports. It reports:

| Metric | Value |
| --- | --- |
| Gap count | **0** |
| Stub exported (parity shim only) | **0** |
| P0/P1/P2/P3 | 0 / 0 / 0 / 0 |

**Tier 2, `src/praisonai-ts/SIGNATURE_PARITY.md`** — per-parameter conformance
over 17 curated surfaces from `_dev/parity/signatures/surface.yaml`. Over the
same port it reports **222 parameters, 0 missing, and 28 mismatches, 28 waived**
— on `Agent.__init__` alone, 8 mismatches out of 42 parameters.

Zero gaps and 28 mismatches are both true. They are answers to different
questions, and the first one is the one a reader reaches for.

## Part 1 — the artifact states what a green cell does not mean

`PARITY.md` carries the disclaimer above its own table, not in a design document:
a green cell "means the name is exported — not that it works", and the tracker
"does not verify that the capability is reachable, wired up, or behaves like its
counterpart."

It also refuses its own comparison. The summary shows **Python Core Features 411**
against **TypeScript Features 2018**, and says in the same block that the second
figure includes barrel re-exports, "reflects module structure, not distinct
capabilities, and is not directly comparable to the Python count." Two totals in
one table are read as a ratio; this artifact is the case where the instrument
pre-empts the reading.

## Part 2 — the stronger tier, with unevaluable failing closed

`SIGNATURE_PARITY.md` checks presence, required-ness and effective default per
parameter, matching exact → camelCase → flattened → alias. Two rules keep it
strong, both stated in the artifact:

- **"A TypeScript default the extractor cannot evaluate reads as `unknown` and
  needs a waiver rather than passing as `undefined`."** This is the closed-fail
  boundary the technique names, present verbatim.
- **"Every gap must be waived in `waivers.yaml` or the check fails."** The waiver
  file exists at `_dev/parity/signatures/waivers.yaml`, and all 28 mismatches are
  waived through it — so the tier is green *and* the 28 are enumerated by name,
  which is the arrangement that keeps a green tier honest.

The artifact also states its own place in the ladder: "This complements
`PARITY.md`, which only tracks whether an export exists" — and, for the strongest
tier, "for a capability with a testable contract, rely on its conformance suite
rather than this table."

## Part 3 — the column that counts the satisfiers

`PARITY.md` carries **`Stub Exported (parity shim only)`** as a summary row and
`⚠️ stub exported` as a per-cell state, defined as a row whose only provider is
`src/parity` — a module that exists, in the artifact's words, "to satisfy this
tracker's name matching rather than to implement the feature."

This is the part the technique argues is almost never built, and this tree has it,
with the structural precondition the technique requires: **the satisfiers are
concentrated in one identifiable module**, so the classification is a lookup the
generator is already doing rather than a second audit.

Its current value is **0**, which is the useful reading. `0 gaps` on its own is
ambiguous between "the port is complete" and "the shim module cleared the rows";
`0 gaps, 0 stubs` distinguishes them, and no other artifact in the tree can.

## A/B and verdict

**A** — tier 1 alone, the arrangement most ports have.
**B** — tier 1 with its disclaimer and stub column, plus tier 2 gating.

Three concrete surfaces from this tree, walked under both:

1. `Agent.__init__` — A reports parity complete. B reports 8 default mismatches,
   including `name` defaulting to a random identifier on one side and null on the
   other. A consumer writing cross-language fixtures is misled by A. **B better.**
2. `Task.__init__` (60 params, 7 mismatches) — same shape, larger surface. A is
   silent. **B better.**
3. A hypothetical row cleared by adding an export to `src/parity` — A moves the
   gap count down and reports progress. B moves the gap count down *and* the stub
   count up, and the pair is legible in review. **B better.**

Verdict **better** on all three. What would falsify it: a tier-2 mismatch that is
a false positive at a rate high enough that the waiver file becomes a rubber
stamp — the failure mode the technique inherits from `suppression-hygiene`. The
observable would be waiver count rising while mismatch count stays flat; here
they are equal (28/28) at a single reading, so the trend is not yet measurable
from one commit. That is the return condition.

## What this realization cannot do

Neither tier reads behaviour. The artifact says so and names the conformance
suite as the thing that would — so the tree's own ladder has three rungs and only
two are built. A reader copying this arrangement gets a metric that cannot be
gamed silently; they do not get evidence that the port works.

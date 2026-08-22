---
layer: application
type: application
subject: content-acceptance-tiering
technique: tier-ladder-design
stack: process
status: forged
verified_on: 2026-08-20
---

# A five-rung ladder crossed with three acceptance kinds

`docs/catalog/WIRING-AND-ACCEPTANCE.md` §2 in the PoF repo is the doctrine document
behind this subject: *"Acceptance model — three kinds, four tiers"* (the title
undercounts; the table lists five). It is the clearest worked example of the
evidence-kind axis available in the codebase, and it was written as operator research
before any of the code existed.

## The two axes, as the document states them

> Acceptance is **derived** (never a manual toggle) but the *source* of the derivation
> differs by step. Three kinds:
>
> - **A. Data-derived** — read the artifact in SQLite (char-count ≥ N, all schema fields
>   populated, power within ±10%, cost on curve). No external dependency.
> - **B. Human-selection** — generation produces candidates; **the user selects one from
>   the gallery**, and the selection (+ chosen asset) persists. Acceptance grades the
>   **selected candidate**.
> - **C. UE-verified** — proven against the UE project, on a tiered ladder.

The tier table then names each rung by what it proves, how, and — the column most
ladders omit — whether it contends for a shared resource:

| Tier | Proves | Shared resource? |
|---|---|---|
| L0 Data | the spec is complete and in-budget | none — always available |
| L1 Selection | a human chose the asset | none — user action |
| L2 Config/Static | the claimed class / row / asset path exists in source | none — read-only, parallel-safe |
| L3 Runtime | it loads, spawns, applies | **yes** — one editor/PIE on the shared tree |
| L4 Visual | it renders correctly | **yes** — RHI capture + a vision model verdict |

The "shared resource?" column is the deferral line, derived rather than declared: the
two rungs that contend for a single engine instance are exactly the two that may report
`deferred`. `src/lib/catalog/rollup.ts:17` then hard-codes that line as `L3`/`L4`, and
`src/lib/catalog/lifecycle.ts:52` names the same pair `GATE_TIERS`.

The document closes §2 with both predicates in one sentence:

> Two meaningful milestones fall out: **config-complete** = L0–L2 reached;
> **runtime-verified** = L3 (+L4 for presentation). A step at L2 with L3 `deferred` is
> *legitimately progressed*, not failed.

## The mutation probe, and what it found

The repo runs the rung-bites test this technique's step 6 prescribes, and the first run
is documented in the same file (2026-07-29, "The gallery grades the ASSET"). The L1
selection rung's checker was `selected()`, which tested `typeof v === 'number' && v >= 0`
and examined nothing about the candidate the index named:

> a gallery step went green whether or not anything had ever been generated — **44 of the
> 47** registered gallery steps were provably insensitive to any change in their own
> content (measured with the two mutation probes of `step-facts-derived.test.ts`).

`selected()` now delegates to `gradeGallerySelection` (`acceptance/galleryArtifact.ts`),
which resolves the index against `data.genHistory` and grades the candidate: a real
generated asset passes at L1; a deterministic placeholder swatch **defers at L4** with a
reason; an index pointing at no kept candidate **fails**. The ratchet lives in
`src/__tests__/catalog/galleryGrading.test.ts` — 0 of 47 shape-only, down from 44.

Two craft notes fall out of that entry, both generalizable:

- The placeholder case defers at **L4**, not at L1 where the check is composed, "because
  what is missing is a *visual* asset". Tag the deferral by what would resolve it.
- "Compose `selected(...)` **LAST** in an `allOf`, because `allOf` reports the first
  non-pass and a swatch deferral would otherwise mask a genuinely failing link / value /
  wiring check."

## The deviation this repo did not close

The same document records, honestly, that the L1 rung does not require a human:

> **Auto-picked is not human-chosen (2026-07-27).** `appendBatch` auto-selects the new
> batch's first candidate, so the `selected(...)` gate (~47 gallery steps) is satisfied
> the instant Produce is clicked once. Acceptance is deliberately **unchanged** —
> requiring a click would break the e2e walker's terminal-status rule — but the CLAIM is
> now honest.

The honesty mechanism is `selectionSource(history)` returning `none | auto | human |
unrecorded`, rendered by `ProvenanceStrip` as a colourblind-safe `SELECTION: AUTO` /
`SELECTION: HUMAN` chip, with pre-flag histories reading `unrecorded` and explicitly
"never back-filled as human". The standard in the technique is unchanged — a
human-selection rung whose verdict does not depend on a human is measuring nothing — and
this repo's choice to keep the gate satisfied while labelling the claim is the correct
*interim* position, not the destination.

## Rung legality is linted, not trusted

`src/__tests__/catalog/pipeline-spec-linter.test.ts` enforces two rules that a ladder
design otherwise relies on discipline for. Rule (i) "runs every step's `accept` under a
seed-backed context and asserts a cleanly-produced step never grades `fail`, and that no
L0–L2 step defers on unresolved links" — the clean-run invariant and the deferral line,
both machine-checked. Rule (k) requires every `balance`-archetype step to compose at
least one content invariant, ratcheted by `INVARIANT_ADOPTION_FLOOR` (20 of 32
pipelines at the time of writing).

## The artist-facing translation

`src/components/layout-lab/labGlossary.ts:24` carries the full four-family glossary the
plain-language technique describes, generated from the same `AcceptanceTier` and
`AcceptanceStatus` types the evaluator uses:

```
L0: 'data check'        L1: 'human pick'   L2: 'rules check'
L3: 'live test'         L4: 'looks-good test'
```

with `config-complete` → *"all set up"*, `tier` → *"proof level"*, and `drain` → *"run
waiting tests"* — "Send every step that is waiting on Unreal through the live runner so
they get a real verdict." The `deferred` status's plain definition names its own remedy:
*"waiting on a live Unreal run; queue it with 'Run deferred gates'."*

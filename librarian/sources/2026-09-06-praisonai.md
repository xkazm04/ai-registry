---
source: praisonai
kind: repository
url: https://github.com/MervinPraison/PraisonAI
title: "PraisonAI — multi-agent AI framework (Python / TypeScript / Rust SDKs)"
author: MervinPraison
words: 4888 landing page / 159943 in-tree markdown
extracted: 9
accepted: 4
declined: 0
leads: 2
already_covered: 1
untriaged: 1
dispatched: 0
applied: 2
shipped: 1
run_id: 2026-09-06-praisonai
siblings: 1
commit: 54244695b997536c038f778699fd47ab1a605242
rescan_when: order 06 (`refactor/delete-dead-adapter-surface`) lands on main and
  `test_every_adapter_method_has_a_call_site` runs green — that is the outcome
  this run's dead-code application explicitly could not confirm; or the
  `src/parity` shim count in `PARITY.md` rises above 0, which is the trend the
  metric-gates application named as its return condition; or 8 weeks elapse
  (2026-11-01)
---

# PraisonAI

## Class and expected yield

**Vendor repository** — a company's repo over a multi-engine agent framework,
nine published Python packages plus TypeScript, Rust and mobile ports. Class
rule: the README is its least reliable surface, mine from a clone, expect the
yield in the operating documents and the instruments.

Expected yield stated before triage: *two to four techniques from the operating
documents and the test/gate instruments, one or two applications against the
source tree, and a routing decision.* That held almost exactly.

**The ratio that justified the clone: 4,888 words on the landing page against
159,943 words of in-tree markdown — 33×.** A run that extracted from the ingest
would have mined 3% of the source, and the 3% written to be quoted.

## Board

One sibling live at claim time (`2026-09-06-openclaude`, intake, phase 0). No
subject contention: `check` returned clear on all four target files. The
`content` lock was taken once for the four golden-path edits and released
immediately; no ledger contention observed.

## Swept

In the class's stated yield order, at commit `54244695b`:

1. **Operating documents.** `docs/local-model-layer/` — a seven-part work-order
   ledger (00-ground-truth, 04-test-gating, 05-live-ci-job, 06-adapter-revival,
   07-local-package-spec, README), ~24,000 words; `ARCHITECTURE.md` (3,002);
   `src/praisonai-agents/AGENTS.md` (5,061); `.agent/workflows/`.
2. **Instruments.** `tests/_pytest_plugins/test_gating.py`; the `KNOWN_DEAD`
   ratchet spec in `06-adapter-revival.md` §; `_dev/parity/signatures/` (compare,
   extractors, `surface.yaml`, `rules.yaml`, `waivers.yaml`).
3. **Measurement.** `00-ground-truth.md` §1-3 (live-server probes, AST census over
   595 files / 238,936 lines); `benchmarks/BENCHMARK_RESULTS.md`;
   `terminal_bench/RESULTS.md`.
4. **Types and config.** `PARITY.md`, `SIGNATURE_PARITY.md`, the nine-package
   tier table and its lazy-bridge edges.
5. **Tests.** The gating plugin's own reproductions R1-R5.
6. **README last.**

This tree is unusually strong material and the reason is worth recording: **its
design documents record their own errata inline.** Four separate corrections are
stated as corrections rather than edited away — the adapter count (18→17), a
capability set attributed to the wrong model, a compensation gap overstated
(7→16 divergences, three running the other way), and a root-cause diagnosis that
measurement inverted. A source that publishes what it got wrong is corroborating
its method, not just its claims.

## Phase 2d — the design record and the routing count

Nine entries, grouped by system. Per-system `corpus: NONE` counts and the
`HOME IF NEW` cluster count, both written before the routing decision:

| System | Entries | NONE | Home |
| --- | --- | --- | --- |
| LLM/adapter layer | 3 (D3 adapter triage, D7 constraint/tool exclusion, D8 leaf sink) | 0 | dead-code, structured-output, module-design — three *different* existing subjects |
| Test gating | 1 (D6) | 0 | test-harness |
| Cross-language parity | 1 (D1) | 0 | metric-gates |
| Exemption ratchet | 1 (D2) | 0 | dead-code (covered) |
| Work-order ledger | 1 (D4) | 1 | — |
| Package tiers | 1 (D9) | 1 | — |
| Ground-truth errata | 1 (D5) | 0 | docs-sync / machine-authored-documentation (unverified) |

**Routing count: no system reaches three with no home, and no three entries share
one `HOME IF NEW`** — the four accepted rows land in four different existing
subjects. **Decision: stay in intake, no forge handoff.** The tree is
forge-shaped by size and is not forge-shaped by corpus gap: the registry already
owns the subjects its decisions belong to, and what was missing was mechanisms
inside them.

### The declared focus applied to the design record

Round 26 asked that the measurement test be applied to design entries, not only
to papers: *what would this tree have to show for this decision to be wrong, and
does it show it?*

It did real work, and it cut two rows:

- **Carried a falsifier and answered it (5):** D1 (the weaker tier read 0 gaps
  while the stronger found 28 mismatches on the same surfaces), D3 (per-item AST
  call-site census that overturned the ledger's own first plan), D6
  (reproductions R1-R5, one of which falsifies the audit's stated cause), D7
  (two-arm run, one variable), D8 (65 subpackages / 212 edges / 26 mutual pairs,
  enforced by a test).
- **Stated forces, showed no falsifier (2 → leads):** D4, the work-order ledger
  with per-order file ownership — nothing in the tree records whether two agents
  ever collided or would have. D9, the nine-package tiered model — the tiers are
  stated and enforced, but no alternative was measured against them. Both are
  plausible and neither is evidenced, so they are leads with return conditions
  rather than candidates. **This is the first run in which the design lane
  rejected an entry on the same rule the paper lane uses.**

## Triage table

Vetoes: none fired. V1 checked before scoring — target categories at 6, 8, 6 and
9 children against a cap of 10. Escalations: none (no direction, no taxonomy
change, no law, no XL).

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | Constraint and tool channel contend for one surface | structured-output | new-technique | real gap | 3/0/2 | **accept** |
| 2 | K | technique | M | Unadopted extension point: wire or delete | dead-code | new-technique | real gap | 2/0/2 | **accept** |
| 3 | K | technique | M | Derived selection must be measured | test-harness | new-technique | real gap | 2/0/2 | **accept** |
| 4 | K | technique | M | A proxy metric counts its own satisfiers | metric-gates | new-technique | real gap | 2/0/2 | **accept** |
| 5 | K | — | — | KNOWN_DEAD's three-test self-cleaning exemption | dead-code/suppression-hygiene, metric-gates/counted-set-snapshot | none | **likely catch** | — | already covered |
| 6 | K | technique | M | Leaf dependency sink for a cyclic import graph | module-design/io-free-core | none | partial | — | **untriaged** |
| 7 | K | practice | M | Work-order ledger for stateless agents | fleet-orchestration | none | partial | — | **lead** |
| 8 | K | design | L | Nine-package tiers with lazy reverse bridges | — | none | partial | — | **lead** |
| 9 | K | practice | S | Design documents that record their own errata | docs-sync | none | partial | — | **lead** |

`auto=4/0/0`, `fp=0` — no accepted row died at Phase 6.

### Row 5 — the catch, in detail

The tree's `KNOWN_DEAD` frozenset is guarded by three tests: the ratchet itself,
one asserting no exempted name has become live, and one asserting no exempted
name has ceased to exist. It is a genuinely good instrument and the corpus owns
all three, better:

- shrink-only, identity-keyed baseline → `metric-gates/counted-set-snapshot`
  ("commit a normalised map of the counted items alongside the count").
- a stale entry fails the run → `dead-code/suppression-hygiene`, "A stale
  suppression fails the run."
- an entry naming something now live must fail → the same technique's "prefer
  the suppression that fails when the defect is repaired", which is the stronger
  general form (the instrument is the reaper).

Recorded as a catch, and the tree's instance is cited from the new
`unadopted-extension-point` technique as the seed-the-ratchet step rather than
re-landed.

### Row 6 — untriaged, not declined

`local/` is specified as a stdlib-only leaf because an AST pass found 65
subpackages, 212 directed edges and 26 mutually-importing pairs, so a helper
placed in `llm/` cannot be adopted by the 21 modules that would need it. The
neighbour is `module-design/io-free-core`, which governs IO purity rather than
import-graph position, so the claim may be a seam rather than a duplicate. The
promoting question — *does module-design own adoption-driven placement in a
cyclic graph?* — was not answered, because the run's verification budget went to
rows 1-4. Anchors: `docs/local-model-layer/README.md` §2 I6 and §"I6 in detail";
`07-local-package-spec.md` §3. Nobody verified this; it carries no judgment.

## Corroboration

**Fetch budget: 0 of 3 spent.** Every accepted row was corroborated
corpus-internally or from code read in a tree — four registry files opened in
full (`suppression-hygiene`, `counted-set-snapshot`, `quarantine-vs-delete`,
`constrained-decoding-is-a-shared-budget`) plus the source's own measurements and
one managed project's source. The class rule predicted this: a practitioner
codebase corroborates internally, and reaching for the web here would have been a
sign the claim had no home.

Row 1 is the run's only row that **refutes** something the corpus asserts. The
golden path says of constrained decoding: "where the producer supports it, use
it", qualified only by "syntax was never the contract". The source measured a
case where using it silently disables the tool channel and the model fabricates
at HTTP 200. The corpus was not wrong about the mechanism; it was unqualified
about a precondition, which is the boundary the new technique states.

## Leads

- **Work-order ledger for stateless agents** (row 7). One order per agent,
  per-order file ownership, a one-line shared status row, "each order is
  independently revertible by design and that property is worth more than
  convenience", explicit "do not fix while you're in there". Converges with this
  registry's own run-board and lock discipline, which is what makes it
  interesting and also why it needs a second independent sighting rather than a
  landing. *Return condition: when a second independent source describes
  per-order file ownership for parallel agents, or when a fleet project adopts
  one and the collision rate is measurable.*
- **Nine-package tiers with lazy reverse bridges** (row 8). Strict dependency
  direction with `_x_bridge` lazy imports for the reverse edge, and
  `alias_package` shims preserving every legacy import path across seven
  extractions. *Return condition: when the tree records what the tiering cost or
  prevented — a measured import time, a broken-dependency incident, a failed
  extraction — rather than only that it holds.*
- **Design documents that record their own errata** (row 9). Four inline
  corrections across this tree's ledger, each stating what the earlier draft said
  and why measurement inverted it. *Return condition: when a second source in the
  machine-authored-documentation neighbourhood does the same, since one tree's
  habit is not yet a technique.*

## Landed

| # | Where | What |
|---|---|---|
| 1 | `structured-output/techniques/constraint-and-tool-channel-exclusion.md` | + golden-path bullet qualified and techniques list |
| 2 | `dead-code/techniques/unadopted-extension-point.md` | + golden-path prose and techniques list; carries the not-better boundary from the apply step |
| 3 | `test-harness/techniques/derived-selection-must-be-measured.md` | + golden-path prose and techniques list |
| 4 | `metric-gates/techniques/proxy-metric-counts-its-own-satisfiers.md` | + golden-path prose and techniques list |
| A1 | `structured-output/applications/python--constraint-and-tool-channel-exclusion.md` | both trees, `applied: code`, `proof: ab-paired` |
| A2 | `dead-code/applications/python--unadopted-extension-point.md` | source tree, `applied: simulation` |
| A3 | `test-harness/applications/python--derived-selection-must-be-measured.md` | source tree, `applied: simulation` |
| A4 | `metric-gates/applications/python--proxy-metric-counts-its-own-satisfiers.md` | source tree, `applied: simulation` |

## Shipped

One commit to **kp** (`0301c4f9`, on `main`, pathspec, not pushed):
`fix(gemini): mark schema_enforced false when grounding drops the mime type`.

The seam: `pipeline/jobfit/gemini.py` excluded a grounding tool and a response
schema by construction (`if`/`elif`) — the technique's rule, reached
independently — but the analysis path passes both, so the schema was shed
silently and the caller could not observe it. `GroundedAnswer` gained
`schema_enforced`. Four tests pin the shed arm and three no-shed controls; arm A
fails 4/4 with the observable absent (mid-state printed: zero occurrences in the
arm-A source), arm B passes 4/4; wider slice 135 passed / 1 skipped.

The commit-message hook rejected the first subject as "a session narrative"; the
second, written as a claim about the diff, conformed. Recorded because it is the
second run to meet this hook and the failure mode is the same each time.

## Gate state at hand-off

`check-bundles.mjs` is **red on four files this run does not own** —
`conformance-checking/applications/bash--*` and `deno--*` (unknown stacks),
`measurement-honesty/applications/process--*` and
`diff-comparison/applications/rust--*` (malformed `verified_against`). The set
*changed* between two runs of the checker during this session, which is direct
evidence a sibling is mid-write. Named, not fixed; the index and catalog were
therefore left unregenerated rather than baking a neighbour's in-flight state
into a committed hash.

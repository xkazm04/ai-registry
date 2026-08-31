---
source: genesis-agi
kind: vendor repository (first-party practitioner account in repo form) - a 24/7
  personal AGI stack; README is the ad, `docs/architecture/*` and `docs/decisions/*`
  are first-party operating documents, `src/genesis/memory/` is 20,905 LOC of the
  subsystem those documents describe
url: https://github.com/WingedGuardian/GENesis-AGI
title: GENesis-AGI
author: WingedGuardian
commit: 41382e76e7854b17b12062f68796086e82f10be8
words: 5767 (README) / ~8200 (the memory operating documents actually mined)
extracted: 13
accepted: 3
declined: 0
leads: 2
already_covered: 1
untriaged: 6
dispatched: 0
applied: 3
shipped: 0
run_id: genesis-agi
siblings: 1 live at Phase 0 (grew to 8 by Phase 7)
focus: operator-directed - "knowledge regarding memory system we can improve"
---

# GENesis-AGI - a 20k-line agent memory subsystem with its operating documents

Operator gave a directed focus (memory), and it aligned with the standing
worklist: `software-engineering/agent-memory` was the **#1 attention point**
(56 points, 14-28 consumer deviations) at scan time. That alignment is the
reason this run's yield is high; it is not a property of the source class.

## Sibling context

One sibling live at Phase 0 (`intake-tigerbeetle-0831`, holding `quality-gates`,
`release-pipeline`, `docs-sync`, `admission-queue`). By Phase 7 the board held
**eight** other runs. None held `agent-memory`, `retrieval` or `health-checks`;
`check --run` came back clear immediately before the first write.

The gate was **red at Phase 1** on two `admission-queue` files owned by the
tigerbeetle sibling (mid-Phase-7). Named, not fixed. It went green before my
first write and red again by Phase 7 on four *other* siblings' declared-but-
missing techniques (`reference-parity-gating`, `machine-authored-documentation`,
`model-routing`, `admission-queue`). My own files are clean in every run of the
checker. **Caveat on the regeneration:** `build-index`/`build-catalog` ran once
under the `index` lock after my content landed, and the corpus grew from 151 to
152 subjects and 1007 to 1018 techniques between my Phase 1 and that
regeneration - so the artifacts I committed necessarily cover siblings' content
as well as mine. The lock serialized it; it cannot make it mine-only.

## What was swept, by name

Per the last run's declared focus - state which of the source's own documents
were opened and which were not.

**Opened:** `docs/architecture/memory-deep-dive.md`,
`docs/architecture/memory-quality-scope.md`, `docs/decisions/004-memory-wings-rooms.md`,
`docs/decisions/003-no-salience-gate-reflections.md`,
`docs/reference/memory-resilience.md`; and in `src/genesis/memory/`:
`recall_probe.py`, `integrity.py`, `connection_pass.py`, plus the headers of
`drift.py`, `adversarial_review.py`, `dream_shield.py`. Directory listings of
`docs/architecture/` (29 files), `docs/decisions/` (8), `docs/reference/` (22).

**Not opened, by name:** `README.md` (deliberately - the ad),
`CHANGELOG.md` (372KB), `AGENTS.md`, `CLAUDE.md`, `docs/architecture/CURRENT.md`,
`genesis-v3-memory-collections.md`, `post-v3-knowledge-pipeline.md`,
`genesis-knowledge-autonomy.md`, `routing-deep-dive.md`, the whole
`docs/case-studies/` and `docs/journey/` trees, `docs/eval/`, `tests/` (~70
directories), `config/`, and the remaining ~45 files under
`src/genesis/memory/` including its two largest (`retrieval.py` 1820 LOC,
`dream_cycle.py` 1698 LOC).

That is an honest ~15% sample of the memory subsystem, chosen by the yield
ordering in Phase 2b (operating documents, then the instrument, then the
measurement). **The two largest memory files were never opened**, which is the
single biggest limit on this run's claims - see the leads.

## Fetch budget

**0 of 3 spent.** Every landed finding corroborated corpus-internally or against
a second managed tree. This is the third consecutive run where a first-party
practitioner codebase needed no web fetch, which the class row already predicts.

## Accepted

### 1. `lane-reconciliation` - new technique, `agent-memory`

**Anchor:** `src/genesis/memory/integrity.py:1-60` - a read-only cross-backend
consistency checker with a six-class failure taxonomy already enumerated
(`lying_mirror`, `ghost_points`, `fts_ghosts`, `fts_invisible`,
`unexpected_vector`, `deprecated_divergence`), split into severe search-path
absences and lower-severity pollution with different thresholds.

**The gap it fills.** Every one of `agent-memory`'s eleven techniques governs
*what belongs in the store*. None governs whether the store's own indexes agree
with its record. A memory written to a record and half-written to its retrieval
lane has provenance, is live, is in-window, is not redundant - and is
unretrievable. `coverage-instrumentation` reports it **covered**, because
coverage joins the record, which is exactly where the item still is. The subject
treats the store as one logical thing throughout: a grep for `index|backend|
dual|reconcil` across all eleven techniques returns only benchmark-predicate
mentions.

**What the source got right and what a second tree corrected.** Genesis supplies
the taxonomy and three disciplines worth taking verbatim: the record declares
its lane membership (there is a legitimate `fts5_only` state, so "missing from
the vector lane" is ambiguous without a declaration); an absence class under a
truncated enumeration reports `-1` not-computed, clamped out of totals; an
unreachable backend reports `unknown`, never corruption; and `total_rows == 0`
deliberately does **not** early-return healthy, because a wiped record store
beside populated lanes is the worst case and presents as zero rows.

It does **not** supply the severity discriminator. That came from the A/B tree:
severity is decided by whether the lane's *readers* have a fallback that reaches
the record without it. The same discriminator explains why Genesis's classes are
severe at a count of 5 and a client-side index is not.

### 2. `probe-without-write-back` - new technique, `agent-memory`

**Anchor:** `src/genesis/memory/recall_probe.py:31-40` -
`skip_writeback=lambda _r: True`, with the comment: "recall() normally bumps
activation on hits... A daily probe that entrenched its golden memories would
distort the very ranking it measures."

**The gap it fills - an asymmetry, not an omission.** The corpus already holds
both halves and never joins them. `retrieval-evaluation` requires the eval to
exercise the production path (`gate-sees-target`) and models eval-to-system
contamination in detail - but only through the *human tuning* channel (tuning
leak, corpus leak). `memory-value-model` models the retrieval -> score -> rank ->
retrieval loop and bounds it against organic traffic. Neither asks **who else
calls recall.** A memory system's read path is not read-only, so an eval obeying
the first rule is automatically pumping the loop described by the second - over
a fixed query set whose expected answers are precisely the items it inflates.
The bound stops runaway; it does not stop a scheduled instrument putting its own
ground truth on a retention drip.

**Corrected premise (the source implements it, and gets one part backwards).**
Genesis returns `status="healthy"` during its observation period, before enough
baseline runs exist to call drift. That is the exact collapse `three-state-
outcomes` names - *unverifiable rendered as verified* - and it means a store
already broken on install day reads green for its whole observation window. The
technique is written with the corrected rule: the drift verdict is unavailable
and renders as its own state. Per the method, a source that implements a good
idea imperfectly is the more valuable one; this is the boundary it handed over.

### 3. Per-class not-computed - amendment to `health-checks/three-state-outcomes`

**Anchor:** `integrity.py` truncation path - `lying_mirror = None` -> reported
`-1`, and `total_findings` clamps `max(count, 0)` so the sentinel cannot
arithmetic into the headline.

`three-state-outcomes` is thorough at the *check* level (render, retry,
transient vs structural, the counting retrofit trap). It does not reach the case
where the check completed, the dependency was reachable, the overall verdict is
honest, and **one finding class was never computed** because an enumeration hit
a budget. Zero is the natural accumulator value and a truncated loop exits
holding it. Three obligations added: a marker distinct from zero, exclusion from
every total, exclusion from every threshold.

## Already covered (catch)

- **Three-valued health status (`healthy`/`degraded`/`unknown`), dependency
  outage never reported as data corruption.** Present in both `integrity.py` and
  `recall_probe.py` and it looked like a strong candidate. `health-checks/
  three-state-outcomes` covers it completely and better - it splits transient
  from structural unverifiability, specifies render and retry semantics per
  state, and names the retrofit trap where a legacy boolean folds "never probed"
  into "passed". Proposed again by nobody, please. The *only* thing left over was
  the per-class case, which became accepted #3.

## Untriaged (extracted, reached the table, nobody verified - not declined)

Unattended run, so only `real gap` rows advanced (operator rule 2026-08-28).
These carry anchors so a later run does not re-derive them.

| Candidate | Anchor | Read | Why it stopped here |
| --- | --- | --- | --- |
| Consolidation must shield high-salience *members*, with non-redundant signals (activation / absolute-confidence floor / betweenness centrality - each named as catching what the others structurally cannot) | `dream_shield.py:1-30` | partial | `rollup-compaction` has three exemptions, all **family-level** ("value is their multiplicity", trust grades, capture defect). This is **member-level** exemption from a legitimate family. Plausible new technique, arguable amendment. |
| Freeze the threshold at enqueue, read the kill-switch live at drain | `dream_shield.py:22-26` | partial | A deferred pass judges against a stable population bar while an operator can still stop it mid-flight. Sharp, small, no obvious home yet. |
| Adversarial review by a *different provider*, defaulting to block on any error or ambiguity; prompt instructs "your default assumption is that something was lost" | `adversarial_review.py:1-50` | partial | Likely overlaps `judge-calibration-and-drift` and `proposal-quality-review`; not opened. |
| Honest-scope document: a shipped doc enumerating what the quality gates **don't** catch, plus a "Known Bypass Patterns" section and a defense changelog | `docs/architecture/memory-quality-scope.md` | partial | Genuinely excellent artifact (names sycophancy bias, confidence-ceiling arbitrage, slow vocabulary rotation evading Jaccard dedup). Home is `docs-sync` or a `practices/` entry; a live sibling holds `docs-sync`. |
| Source-aware decay half-lives (60/45/30d by extraction source) with a 2x multiplier for proper-noun-tagged memories | `memory-deep-dive.md` | likely catch | `memory-value-model` already has per-kind half-lives. The proper-noun multiplier is the only novel part. |
| Two-level wing/room taxonomy with tiered-confidence classification (path 0.9 > keyword 0.7 > tag 0.6 > pipeline 0.5 > fallback 0.1) | ADR 004 (241 words) | likely catch | Thin ADR; `memory-governance` territory. The tiered-confidence classifier is the interesting half. |

## Leads

- **The two largest memory files were never opened.** `retrieval.py` (1820 LOC,
  the RRF fusion pipeline) and `dream_cycle.py` (1698 LOC, the consolidation
  pass) are 17% of the subsystem by line count and were skipped for the
  operating documents and the smaller instruments. `agent-memory` is still the
  #1 attention point after this run.
  **Return when:** the next memory-focused run has budget for one file - open
  `dream_cycle.py` first, because `rollup-compaction` and `consolidation` are the
  two techniques this run mapped candidates onto and could not verify against
  real consolidation code.

- **Resource ceilings expressed as pressure percentages rather than absolute
  bytes**, so one config right-sizes from a small VPS to a workstation; plus a
  live fire-drill record establishing that the kernel OOM killer, not the
  userspace one, fires first at hard exhaustion, and that thresholding on the
  `full` PSI metric rather than the `some` line is what makes the userspace
  layer's window narrow by design. `docs/reference/memory-resilience.md`, 1777
  words, first-party, with an incident series behind it.
  **Return when:** a run is working an infrastructure or capacity subject - this
  is off the memory focus and has no mapped home. Note it is *machine* memory,
  not agent memory; the slug collision is the only reason it surfaced here.

## Applied (Phase 7.5)

Three landings, three rows, all `experiment`, no project tree modified.

| Technique | Project | Mode | Verdict | What A and B were |
| --- | --- | --- | --- | --- |
| `lane-reconciliation` | goat | experiment | **better** | 4 category fixtures through the shipped key derivations + the shipped sync helper. A: 2/4 diverge, 2 lose the write on reload, **0 detected**. B (+ read-only reconcile predicate): same 2 diverge, **2 detected, 0 false positives**. |
| `probe-without-write-back` | goat | experiment | **better** | Call-site enumeration of a rank-feeding counter. A (count on read path, suppress per caller): 3 machine caller classes reach the counter, 3 flags required, new readers default to counting. B (shipped: uncounted read + explicit write): 0, 0, default correct. |
| `three-state-outcomes` per-class amendment | goat | experiment | **not-better** | A = shipped ratchet, B = ratchet + the amendment. **Zero edits required to reach B** - the tree already implements all three obligations. Not a defect in the amendment: independent corroboration from a tree with no connection to the source. |

**The `better` verdicts both changed the corpus, not just the ledger.** goat's
blueprint gallery reached `probe-without-write-back`'s rule independently, in a
domain with no agent and no memory, and by the *opposite* structural route -
Genesis suppresses the write-back with a flag on one entry point, goat splits
the counted write onto its own endpoint. The second shape makes the correct
behaviour the default for readers nobody has written yet; the first requires a
correct decision at every call site forever. **The technique gained a section it
would not have had from the source alone** (`absent-guard-is-loud`), and that
section is the tree's, not the source's.

Same shape on the first: goat's two derived lanes are structurally identical -
both projections of one array - and land in *opposite* severity classes purely
because of what their readers do. One has linear-scan fallbacks; the other is
promoted back into the record on rehydration. Nothing in either lane's own code
says which it is, and the one named "cache" is the dangerous one. That is the
severity discriminator the technique now carries, and the source could not have
supplied it.

## Ship: 0, and why

No project tree was modified. The operator's directive named a focus, not a
project, and Phase 8 step 2 requires confirmation before touching a project tree
at all. The `lane-reconciliation` finding in goat is a **real, reachable
defect** with a paired measurement behind it - a silent-no-op cache sync that
loses writes across a reload whenever a UI category string differs from its
resolved API form - and it is filed here rather than fixed.

Consequence to state plainly: the seams were **not** recorded in goat's
`.ai/applied.jsonl` either, because that is also a project-tree write. Those
three rows are owed the next time a run has project confirmation.

**Return condition:** operator confirms the goat lane; the fix is either
one key derivation shared by both sites, or making the sync's no-op path
observable - the application argues the second is the cheaper half.

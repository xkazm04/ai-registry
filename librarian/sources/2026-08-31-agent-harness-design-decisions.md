---
source: web:arxiv.org/abs/2604.18071
kind: paper
url: https://arxiv.org/abs/2604.18071
title: Architectural Design Decisions in AI Agent Harnesses
author: Hu Wei
words: 16055
extracted: 10
accepted: 3
declined: 0
leads: 1
already_covered: 1
untriaged: 5
dispatched: 0
applied: 1
shipped: 0
run_id: intake-arxiv-260418071
siblings: 4
fetches_spent: 0
---

# Architectural Design Decisions in AI Agent Harnesses

A 35-page, 13-table cross-sectional study of 70 agent-system projects, corpus
frozen 2026-03-23. Class: **paper** — authoritative for its measurement in its
protocol, weak for its framework. This one is a taxonomy paper, so its five
dimensions and five patterns are the framework half and were treated as such.
Expected yield was stated before triage: 1–2 findings from the measurement
half, many catches against a 29-subject `llm-agent` bundle, and the strongest
candidate most likely a negative result or a methodological defect. That is
what it produced.

**Read fraction.** The abstract landing page is 661 words; the full text is
16,055 (24x). The ingest of the `/abs/` URL returns the former. Mining that
page would have yielded the abstract's own summary of itself — the paper-class
analogue of reading a repository's README. The `/html/<id>v1` sibling URL is
the source.

**Fetch budget: 0 of 3 spent.** The finding that carried the run is checkable
entirely inside the paper, against its own tables, and the identity it rests on
is arithmetic — training-data convergence in the strongest available form.

**Board.** 4 live siblings at claim time (two repository runs, two blog-post
runs); none held `measurement-honesty` or any `engineering-assessment` subject,
so no contention. The regenerated index at Phase 7 referenced four sibling
techniques not yet in `HEAD`, so `index.json` and `catalog.json` were left
uncommitted per the v1.4.0 rule.

## The source refutes its own headline statistics

The run's substance, and the reason the source was worth mining despite being a
taxonomy paper. §5.1 defines support, confidence and lift correctly. Table 10
then reports four relationships whose **support values exceed the marginal
frequency of their own antecedents**, as measured by the paper's own
distribution tables one section earlier. Support for A∧B cannot exceed P(A);
the set with both properties is a subset of the set with either.

| Table 10 row | reported support | max possible P(A) | source of P(A) | over by |
| --- | --- | --- | --- | --- |
| container isolation → policy security | 0.89 | 0.31 | Table 7 | 2.87x |
| tool-protocol tooling → stronger discovery | 0.62 | 0.143 | Table 6 | 4.34x |
| subagent complexity → memory sophistication | 0.73 | 0.70 | Table 4 (most generous reading) | 1.04x |
| project scale → architectural complexity | 0.68 | — | no marginal published | unverifiable |

Recomputing the highest-lift row from the paper's **own** conditional statement
("100% of container-isolated projects implement policy engines versus 23% of
those without") gives support 0.31 and lift **2.13**, against a reported 3.4 —
so the ordering Table 10 was used to justify is wrong as well.

A second, independent defect in the same table: three of the four "compact
evidence statements" are **differences of continuous mean scores** (4.62 vs
3.86; 4.1 vs 2.8; 6.2 vs 2.3), while support/confidence/lift are defined only
over binary co-occurrence. The metric and its stated evidence are different
objects, and neither is computable from the other.

Per the method's rule that a source implementing a good idea badly is worth
more than one implementing it well: the paper located something real (design
commitments do arrive in bundles) and the arithmetic offered as proof refutes
itself. The finding was written from the identity, not from the paper.

## Accepted

**1. `co-published-numbers-must-reconcile`** — new technique on
`software-engineering/engineering-assessment/measurement-method/measurement-honesty`.
The constraints a set of numbers published together creates; the identity that
bounds a joint by its marginal; the related defect of evidencing a metric with
an object it is not defined over; and why a failed reconciliation is a finding
about the **pair**, not about either number. Cites `count-carries-predicate`
and `derivation-names-recomputation`.

Home chosen on a **missing stage**, per Phase 6 step 2. The subject is entirely
producer-side — every one of its six prior techniques governs a system
computing and reporting its own numbers — and its opening thesis is that a
dishonest number is *unfalsifiable*. The gap is the inversion: some numbers
**are** falsifiable, by their neighbours, and nothing owned that check.
`peer-benchmarking` was the contested alternative and was read and rejected —
it owns cross-tenant ranking, a manufactured position, not internal consistency.

**2. Golden-path amendment: a datum has six states, not five.** Found by the
enumeration hunt (Phase 6 step 3) — the subject declares its own completeness
in a section heading. The sixth state is **refuted**: the instrument ran,
returned a well-formed in-range value, and another number the same system
publishes proves it cannot be true. It is absorbed by none of the five —
nothing errored (not *measurement failed*), the instrument saw fine (not
*unmeasurable*), and the value cannot stand (not *measured*) — and its honest
handling is unique, because you do not know which of the two conflicting
numbers is wrong.

**3.** Row 3 (metric evidenced by the object it is defined over) landed as a
section inside technique 1 rather than as a second technique; it is the same
reconciliation discipline applied to a metric's definition rather than to its
value.

## Applied — `goat`, experiment, better

Seam found via the project's own `.ai/registry-map.json`, which already joined
a collection-panel context to `measurement-honesty`. The panel computes a
completion percentage whose numerator is counted over the whole grid and whose
denominator is a page size used, per the code's own comment, as a *proxy* for
grid size — and clamps the result at 100%. The same application computes the
same quantity correctly in the store that owns the grid, where numerator and
denominator share a predicate and **no clamp is needed**.

A/B ran as an `experiment` (no product code changed): both computations
transcribed verbatim into a harness, with the store's version as a ground-truth
arm. Over 120 states enumerated from the tree's own parameters, arm A published
a well-formed percentage in **all 120**; arm B flagged **101 (84%)** as
refuted; the displayed figure disagreed with the application's own ground truth
in **66 (55%)**, and `isComplete` in 21.

**A prediction was falsified and the correction is the useful part.** The clamp
looked like the defect; it fires in only 9 of 101 flagged states and never in
the shipped configuration. The defect is the denominator; the clamp is its
fingerprint. Removing the clamp would have changed nothing and looked like a fix.

**Structural fact** (Phase 8 step 6): the consumer subscribes to the grid store
directly and reads the placed-item ids off the very state object that also
carries the grid's real capacity *and* the already-correct percentage. The
correct denominator was on the object the consumer already held. Nobody designed
that; it is better evidence for the technique than the arithmetic is.

**Ship: 0. Blocker class: `confirmation`.** Per the run's declared focus, named
rather than left as a bare zero. The change is a few lines and the tree has no
foreign WIP in the file, so it is not `size`; the store's own statistic shows
the project's intent, so it is not `indeterminacy`. The operator's triage pick
named registry rows only, and Phase 8 step 2 requires explicit confirmation
before touching a project tree. Return condition: operator says go.

## Already covered

- **Documentation overstates architecture; the code enforces the narrower
  limit.** §4.1 reports that several projects advertising deep recursion were
  found on inspection to enforce depth limits, and concludes that code-based
  analysis is what settles it. This is `/intake` Phase 2b in the paper's own
  words — cross-run convergence with our own method rather than new content.
  Worth noting as a third-party sighting of a rule this skill already carries.

## Untriaged — extracted, reached the table, nobody picked

Recorded with anchors so a later run does not re-derive them. **Nobody verified
these; they are not declines.**

| # | Claim | Anchor | Candidate home |
| --- | --- | --- | --- |
| 4 | Containment maturity does not imply accountability maturity: 83% of the corpus has at least process isolation, but 40% has no audit trail at all and only 5% is tamper-evident | Tables 7+8; §5.3 NC-3 | `operations/…/audit-logging` or `llm-agent/orchestration/hitl-approval` |
| 5 | Introducing delegation creates a context-persistence obligation: file persistence present in 85% of orchestrator-worker projects against 20% of single-agent ones | §5.2 co-occurrence 1 | `llm-agent/prompt-and-context/agent-memory` (top worklist subject, 56 points) |
| 6 | Token awareness turns memory from passive storage into an active control mechanism — reserving budget for future tool calls and subagents before assembling the prompt | §4.2, fourth recurring decision | `llm-agent/prompt-and-context/prompt-assembly` (has `context-budgeting`) |
| 7 | A sampled read of a large tree must publish a **coverage statement** naming which surfaces were read closely enough to support each coded claim, plus a confidence note for ambiguous boundaries | Table 3 | our own `docs/forge-brief.md` / `harvest-brief.md`; skills lane, no gate |
| 9 | Explicit registries are the modal tool system at 34.3%; protocol-based registration is still a minority at 14.3%, corpus frozen 2026-03-23 | Table 6 | `llm-agent/runtime-and-io/mcp-tools` — a clock reset, not a gap |

Row 7 is the one most worth a later run: it is a directly portable instrument
for our own repository sweeps, and it sits in the judgment lane where no
corroboration gate applies.

## Leads

- **Coarse external descriptors do not predict architectural depth.** The
  paper's non-co-occurrences 1 and 2 report that neither implementation language
  (advanced-pattern share ranges only 40%–57% across four language families)
  nor use-case label fixes a project's architectural complexity. If true it
  bears on how we route a source's claims by its stack tag, and on whether a
  single-stack subject's `stack:` field carries any predictive weight at all.
  **Return condition:** when a second independent source measures architectural
  depth against language or use-case, or when a librarian sweep asks whether
  `stack:` predicts anything about a subject's technique count.

## Notes on the source's own method, for the class file

Three things this paper does that make it more useful than its arithmetic
deserves, and that a future paper-class run can look for directly:

- It publishes a **coverage statement** and a **confidence note** per coded
  project rather than forcing certainty (Table 3) — the untriaged row 7 above.
- It ran a **21% audit sample** (15 of 70) with 94% initial field-level
  agreement before consensus coding, and says so.
- It used agents as research assistants under a written protocol with the rule
  that "candidate evidence surfaced by the agents was used only as a pointer for
  further inspection, and final coding judgments remained the responsibility of
  human researchers" — independently the same rule as this skill's *workers
  return proposals, the director writes*.

That a paper this careful about its protocol still shipped a Table 10 nothing
reconciled is itself the argument for the technique that came out of it.

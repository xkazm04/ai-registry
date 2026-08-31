---
source: awesome-agentic-patterns
kind: curated pattern catalogue with a machine-generated research substrate (queue graded it "paper aggregator / reference index" — CORRECTED, see below)
url: https://github.com/nibzard/awesome-agentic-patterns
commit: 388b55dcc8bf7685b80c4d9a830e825e1a0cc81e
title: "A curated catalogue of awesome agentic AI patterns"
author: Nikola Balic (@nibzard) + contributors
words: 1748 landing page / ~996000 in-tree (patterns 135495 · research 843699 · operating docs ~16800)
extracted: 11
accepted: 2
declined: 0
leads: 1
already_covered: 1
untriaged: 7
dispatched: 0
applied: 1
shipped: 0
run_id: intake-agentic-patterns-0831
siblings: 4 at claim (pgsql-hackers, semantica, pgrust, ripgrep); 6 by Phase 7
---

# Awesome Agentic Patterns

Pulled from the harvest queue as SEA-001 after `/intake` was invoked with no source.
Queue grade: `reference-repo / paper aggregator`, priority 1, expected yield `content`.
The operator picked it over two first-party accounts specifically to exercise the
`--wave` lane, because the last scorecard's declared focus is about waves losing
candidates between Extract and Test.

**No waves were run, and the ratio is why.** Phase 2c's own test — outbound links
over the source's own word count — is what a reference index has to invert:
hundreds of links across a few thousand words. This tree gives **5,080 links over
~996,000 words, one link per 193 words**, which is a code-repository ratio. The
`patterns/` directory is 194 authored documents averaging ~700 words, not a
one-line-annotation bibliography, and `research/` is 221 machine-generated reports
averaging ~3,800. The links are references *inside* prose, not the product.

So the honest class is a **curated pattern catalogue with a machine-generated
research substrate and its own verification layer** — closest to a vendor
repository (it has operating documents, an instrument, a measurement, a schema)
crossed with a paper aggregator. That reading changed the whole run: the 193
pattern documents are second-hand syntheses carrying self-declared evidence grades,
which is low authority and yields catches and leads; the yield is in the parts that
cannot hedge, which are the schema census, the instrument, and the two verification
result artifacts. That is exactly where it landed.

Swept in the Phase 2b order: operating documents (`SPECIFICATION.md` 3,497 words,
`SCHEMA.md`, `TODO.md` 7,431, `CLAUDE.md`, `AGENT.md`, `TEMPLATE.md`,
`MIGRATION-TO-GIT-LABELS.md`), the instrument (`scripts/claude-research-loop.sh`,
`arxiv_scanner.py`), the measurement (`research/*-verification-results.json`), the
schema and its census, then the README last.

## The finding: identity and attributes fabricate at different rates

The repository ships two verification passes over the references its generated
research corpus cites, both dated 2026-03-10, both with per-item verdicts:

| Pass | Checked | Verified | Fabricated | Unresolvable |
| --- | --- | --- | --- | --- |
| resolvable identifier | 413 | 408 | **0** | 1 |
| venue + year attributes | 617 | 277 | **36** | 280 |

The identifier — the half every citation gate already checks — came back with zero
fabrications. The attributes bundled with those same identifiers came back 45%
verified with 36 judged fabricated. And the mechanism is visible in the per-item
notes: the generator attaches a plausible prestigious venue and an *earlier* year to
a real, resolving identifier. Membership passes, because the document genuinely
exists. What was invented is the claim's authority.

The cheapest possible refutation was sitting inside the citation. Where an
identifier encodes its own issuance date, a claimed year earlier than that date is
not suspicious, it is arithmetically impossible — no lookup, no known set. The
source's own notes say it in as many words: *"is a May 2025 preprint, not ICLR 2023.
Impossible claim."*

**Landed** as an amendment to `civic-intelligence/accountability-method/
llm-forensic-gating/techniques/hallucinated-reference-sweep`, which checks reference
*existence* thoroughly and bounds itself at "not a truth check on prose" — leaving a
real, resolving reference wearing fabricated attributes unnamed between the two.
Plus `scripts/check-citation-dates.mjs`, the arithmetic as a zero-dependency
instrument with a seeded-failure self-test.

## Corroboration

Zero web fetches. The corroboration is in-tree measured data — 1,083 extracted
references with per-item verdicts against outside authorities — which is the
strongest thing a repository holds and the class the corroboration table admits as
"real code you read". The identifier-encodes-its-date fact reaches training-data
convergence independently; the technique states it as a general property of
identifier conventions and names no scheme, so nothing rests on the source's wording.

## A correction the source earned by being wrong

The repository's own quality gate contains the one check its author deliberately
made non-waivable — `invalid_arxiv_placeholder` is the single issue in
`report_quality_issues()` with no override gate and no warning downgrade, while the
completeness and unresolved-marker checks have both. It is aimed at malformed
identifiers, which the measurement above says is the class with **zero** incidents.
The class with 36 incidents has no gate at all; it was caught by a one-off manual
pass and annotated `⚠️ INCOMPLETE` in prose. The unwaivable check guards the safe
half. That observation is what made the amendment's shape obvious, and it is the
run's clearest instance of a source implementing a good idea badly being worth more
than one implementing it well.

## Candidates

### Accepted

1. **Verify the attribute, not the identity** — `technique amendment`, landed in
   `hallucinated-reference-sweep`. Anchors: `research/arxiv-verification-results.json`
   (413/408/0), `research/venue-verification-results.json` (617/277/36/280).
2. **The date-encoded identifier refutes a claimed year for free** — `script`, landed
   as `scripts/check-citation-dates.mjs`. Anchor: *"arXiv:2505.21577 is May 2025 —
   cannot be NeurIPS 2024"*.

### Already covered (caught)

3. **Retroactive gate liveness** — the idea that a gate which has passed a corpus
   containing the very pattern it blocks is dead, no fixture required. 24 masked
   placeholders survive in `research/` under a gate that claims to block them.
   `software-engineering/.../quality-gates/techniques/gate-liveness` already owns
   this and owns it better: "prove it red: the seeded-failure test", "a rule's test
   fixtures that never contain the pattern the rule exists to catch certify
   nothing", and "time since last red" as a standing metric. Do not re-propose.

### Lead

4. **An undocumented convention at 25% coverage.** 48 of 193 patterns carry an
   `## Evidence` section with a grade and an explicit "Unverified / Unclear" list.
   `SCHEMA.md` documents no such section, so nothing validates it, and the grade
   vocabulary has leaked: freeform prose, `status` values, and — committed
   literally — `high | medium | low | mixed | unknown`, the template's own
   enumeration left unfilled. *Return condition:* when a second source shows a
   generated per-document confidence field, so the pair can carry a technique about
   self-declared evidence grades rather than one repository's habit.

### Untriaged — extracted, reached the table, never picked

Nobody verified these. They carry no judgment and must not be read as declines.

| # | Candidate | Anchor | Nearest prior art |
| --- | --- | --- | --- |
| 5 | The unwaivable check guards the class with zero incidents | `report_quality_issues()` override asymmetry | `quality-gates/fabrication-economics` |
| 6 | A waiver token accepting 13 synonyms cannot be audited | `pass\|manual-pass\|manual\|approved\|accepted\|allow-warnings\|...` | `quality-gates/enforcement-binding` |
| 7 | Optional schema fields decay while features depend on them | `signals` 18/193, `anti_patterns` 3/193, against a spec building Compare and a Decision Explorer on them | `docs-content-model` |
| 8 | The enumeration committed as a value | `Evidence Grade: high \| medium \| low \| mixed \| unknown`; `status: proposed # One of: ...` | `status-vocabulary`, law `one-authority-per-vocabulary` |
| 9 | Dual-granularity machine-readable export | `llms.txt` (index) + `llms-full.txt` (full content), both generated | `docs-content-model` |
| 10 | Research loop with crash recovery and a state tracker | `recover_running_states`, `recover_inconsistent_done_reports`, `pattern-research-tracker.json` | `job-coordination/terminal-state-recovery` |
| 11 | Provenance recorded, relationships not | `based_on` 190/193 vs `related` 15/193 | — |

## What the sweep cost, and what it would cost again

The expensive half was not reading — it was refusing to trust three consecutive
first numbers, and every one of them was wrong:

- The gate's arXiv regex is over-escaped (`\\.` inside single quotes). I could not
  settle its behaviour from this shell — a quoted heredoc collapsed the bytes twice
  — so I stopped reconstructing the instrument and measured the **artifact**
  instead: 24 placeholders survive in a corpus the gate has passed. That answered
  the question the regex could not.
- My own checker's first number was **7** contradictions in our corpus and **576**
  in the source's. Nearly all were a neighbouring bibliography entry's year leaking
  across a proximity window. Two rounds of binding — nearest-citation boundary, then
  entry-separator trimming — took it to 0 and 29.
- The statute convention's first number was **1797** on the connected project, and
  the cause was my own bug: the boundary set knew preprint and DOI shapes but not
  the statute shape, so an adjacent statute's own year leaked. Fixed: 114. Then
  hand-inspection took the *true* positives to about one.

Three instruments, three wrong first numbers, and in each case the correction came
from opening the thing. The scorecard already carries this as a rule; this run is
its fourth and fifth confirmations in a single session.

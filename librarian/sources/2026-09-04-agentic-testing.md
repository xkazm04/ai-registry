---
source: web
kind: second-hand practitioner listicle (concept explainer over four primaries; thin first-party half; two first-party comments)
url: https://theaiengineer.substack.com/p/what-is-agentic-testing-fa2
title: "What is Agentic Testing? Goals Instead of Recorded Steps"
author: Paolo Perrone
words: 3133
extracted: 13
accepted: 2
declined: 0
leads: 1
already_covered: 8
untriaged: 3
dispatched: 0
applied: 2
shipped: 1
run_id: agentic-testing-0904
siblings: 1
---

# What is Agentic Testing? — intake note

**Class: second-hand practitioner listicle.** A weekly concept explainer that
relays four primaries (an industrial LLM unit-test-improvement paper, an
industry-scale multi-agent test-generation paper, a large test-migration
engineering post, and a metrics write-up) and welds on a thin first-party half:
the author ran five checks three times each against a stubbed status source, and
generated one implementation's agent definitions to inspect its tool lists.
Unusually, the comment thread carries **two first-party practitioner accounts**
that function as a dialogue — one drawing a discriminator against the article's
thesis, one shipping a tool built from the opposite direction and arriving at
the same conclusion.

**Expected yield, stated before the triage table:** 1–2 landings at most, and
mostly catches. The corpus already holds a 23-technique `quality-gates`, a
17-technique `test-harness` whose `context-starved-executor` *is* this article's
thesis at greater depth, and an `eval-harness` that owns the metrics half. That
is what came out: 8 catches, 2 landings, 3 untriaged, 1 lead.

**Fetch budget: 1 of 3.** Spent on the industry-scale generation paper, to check
a number and its causal gloss. Worth recording why it was spent at all — for
this class every quoted number is a lossy pointer, and the one candidate whose
whole value was a number was exactly the one that needed the primary.

**Siblings: 1 live** (`vibevoice-peer-0904`, holding a peer study over an
unrelated bundle). No contention; the `content` lock was taken once for the
golden-path line and released immediately.

## The corrected premise

The article reads a measured 20% / 40% / 80% viable-test spread across three
languages as **setup cost** — build steps, injected dependencies, mocking — and
draws the operating rule "point your first agent wherever your tests are
cheapest to run in isolation".

The primary corroborates the numbers and does **not** carry that causal
attribution in anything the fetch could reach; the PDF's text layer did not
extract and the accessible summary attributes the spread to build complexity in
the summarizer's own words, not the paper's. So the causal story is the
newsletter's gloss on somebody else's measurement, and a technique asserting it
would rest on a relay.

The numbers alone still authorize a weaker and more useful rule — *a generator's
viable-output rate is a property of the target ecosystem rather than of the
generator, since one pipeline spans 20% to 80% inside one company, so a pilot's
rate is not transferable and adoption is decided on a locally measured number* —
and that rule survives without the mechanism. It is **untriaged, not declined**:
the promoting question was executed and came back clean (nothing in
`test-harness` or `test-input-generation` states isolation cost as the piloting
axis), so the gap is real and the only blocker is corroboration. See row 10.

## Triage

Vetoes checked first. V1: `standards-and-gates` holds 5 of 10 child dirs, and
both landings go *inside* an existing subject, so no new directory at all.
`auto=2/0/0`, `fp=0`.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | A gate keyed on a renameable name is satisfiable by concealment | quality-gates/self-reported-gate-inputs | new-technique | real gap | 4/1/2 | **accept** |
| 2 | K | amendment | S | The variant instrument, not the moving input | quality-gates/blocking-by-input-determinism | new-technique | real gap | 3/1/1 | **accept** |
| 3 | K | catch | — | Report pass^k, not pass@k, for a release gate | eval-harness/reliability-aggregation | none | likely catch | — | caught |
| 4 | K | catch | — | The agent finds the route; the suite holds the destination | test-harness/context-starved-executor | none | likely catch | — | caught |
| 5 | K | catch | — | Re-invented cases lose the regression contract | context-starved-executor § the boundary with the deterministic suite | none | likely catch | — | caught |
| 6 | K | catch | — | Three automatic gates around an untrusted generator | machine-authored-documentation/three-gate-acceptance | none | likely catch | — | caught |
| 7 | K | catch | — | A repair agent's give-up condition is `skipped` | oracle-frozen-during-repair + `deletion-is-not-repair` | none | likely catch | — | caught |
| 8 | K | catch | — | Structure, not pixels, survives a rename | context-starved-executor | none | likely catch | — | caught |
| 9 | K | catch | — | Agent at authoring, model out of CI | blocking-by-input-determinism | none | likely catch | — | caught (fed row 2) |
| 10 | K | technique | M | A generator's yield is a property of the target, not the generator | test-harness/fixture-economics | new-technique | **real gap** (promoted) | 2/2/2 | untriaged — V2 |
| 11 | K | technique | M | Re-prompt with the specific failure; the tail costs context | — | new-technique | partial | 2/2/2 | untriaged |
| 12 | K | currency | S | Per-step inference cost of agent-driven CI | llm-observability/operator-surfaces-for-llm-spend | none | thin | — | untriaged |
| 13 | K | catch | — | Agentic testing inherits the eval problem | eval-harness/assertion-vs-judgment | none | likely catch | — | caught |

**Both `partial` rows had their promoting question executed.** Row 10 promoted
to `real gap` (the corpus does not own isolation cost as the piloting axis) and
is still blocked by V2, so it is banked with everything needed to land it. Row
11 did not promote: `retry-backoff` covers transport retries and the delta —
that the retry ladder's cost is a long tail consuming context rather than a
uniform per-attempt price — would be written from prose alone.

## The two landings

### 1. `quality-gates/renameable-detector-keys` — the key the author can change

Originated by a **commenter**, not by the article: a practitioner describing
their own shipped tool wrote that the failure mode is not the agent doing bad
work but "the agent making the finding disappear — a suppression, a delete, a
rename that dodges the detector", and that their duplicate detection compares
bodies structurally with identifiers anonymised for exactly that reason.

That converges, from an independent voice, with the article's own thesis about
locators: **a name is a fragile key**, and the article spends its first third on
one consequence (an innocent rename breaks a working test, a false red) while
the commenter names the other (a deliberate rename clears a real finding, a
false green). One root, two signs, two voices — which is why this scored a
convergence point and why it landed as a mechanism rather than a paragraph.

The corpus had the neighbours and not this: `self-reported-gate-inputs` owns the
case where the *record* is author-written, `oracle-frozen-during-repair` owns
the actor's write access to the *check*, and `vacuous-by-evaluation` owns a rule
no input can violate. None covers a complete honest record read by a detector
whose *key* the author can change for free. Verified by uncapped grep across
`engineering-process` and `llm-agent`; the nearest hit is
`mcp-tools/tool-identity-vs-tool-name`, which holds the same root for accounting
identity rather than for evasion — a discriminator worth recognising, not a
link.

### 2. `quality-gates/blocking-by-input-determinism` — a third variance

Found by the **enumeration hunt**. The technique's section is titled "Two
advisory-nesses, and only one of them expires", and an enumeration invites
exactly one question. Its list of moving inputs already includes "a model", so
the placement is nearly right — and it gives the wrong diagnosis twice, because
its practical test is temporal ("the input changes without the repository") and
a sampled judge does not move, it *varies*. Same commit, same feed, same
instant, two answers.

The amendment adds the third bucket without touching a standing sentence: the
two advisory-nesses remain a complete account of *input* variance, and the
addition is that the instrument is a separate axis, on which the remedies differ
— splitting the invocation recovers nothing, and filing it permanent writes off
a fixable gate. The reachable moves are pin, assert, or aggregate, and the
aggregation rule is the whole decision (`reliability-aggregation`).

## Applied

Two rows, both against real trees, both written up.

**Row 1 — `code` / `better` / `ab-paired`, this registry.** The seam is the
bundle checker's own purity denylist: a list of literal product names guarding a
rule about transplantability. Paired A/B, same document, same instrument, the
measurable being reported violations. Arm A (the product named) → 1 violation,
red. Arm B (the same product described unmistakably and not named, identical
referent, identically non-transplantable) → 0 violations, `bundle integrity OK`.
A first arm B tripped on a *different* listed word, which is worth recording:
the floor is real and catches careless evasion; it took one revision to walk
around, by a writer not trying hard.

No invariant key exists for this property — reference is semantic — so detection
was not improved and cannot be. What shipped is the technique's actual
prescription for that case: the verdict now states its own predicate, in one
appended line beside the two disclaimers already there. Detection rate
unchanged, by construction; predicate coverage moved from absent to present.
The line is additive, so every existing substring match on `bundle integrity OK`
still holds — checked before shipping, because eleven sessions grep it.

**Row 2 — `simulation` / `better` / `structural-only`, three trees.** Three real
checks sorted twice, with the falsifier stated first: if the two-way axis were
sufficient, these trees should have filed their variant instruments as
permanently advisory. None did. This registry's judged transplant test, a
consumer's scoring-card benchmark (seeded composition, no clock, no random, no
network, the schema half split into a deterministic contract test whose header
says *no LLM*), and a third tree's long-lane certifier whose own header states
that long lanes judge statistically and that the unit of value is the trend
rather than one run. **No consumer code was changed and none was warranted** —
both had already reached the amended prescription, which is why this row ships
nothing and why that zero is a result rather than a gap.

## Untriaged (nobody verified these; anchors kept so a later run need not re-derive)

- **Row 10 — a generator's viable rate is a property of the target.** Anchor:
  "20% of the time in Java, 40% in Go and 80% in Python", one pipeline, one
  company. Numbers corroborated against the primary; the causal gloss is the
  newsletter's. **Return condition:** a readable text layer for the industry-scale
  generation paper, or any second independent measurement of a per-language
  generator spread. Home would be `test-harness`; the promoting question already
  confirmed no prior art.
- **Row 11 — the repair ladder's long tail.** Anchor: "Most files land inside ten
  attempts. The long tail took between fifty and a hundred, with prompts growing
  to 100,000 tokens and up to fifty related files pulled in as context."
  **Return condition:** a fleet project runs a bounded-retry repair loop whose
  attempt distribution can be read.
- **Row 12 — per-step inference cost of agent-driven CI.** Anchor: "500 tests
  firing on every commit becomes a line item somebody will ask you about."
  Thin; `operator-surfaces-for-llm-spend` likely owns the shape already.

## Caught (do not re-propose)

- **pass@k vs pass^k.** `eval-harness/reliability-aggregation` owns it and is
  stronger: it names the observed/modelled distinction the article elides, and
  the independence assumption a modelled any-of-N carries. The article reports
  "pass@3 of 0.6 and pass^3 of 0.4" over a *suite of five checks*, which is a
  third object again — an aggregation across tests, not across trials of one.
- **The agentic-testing thesis itself.** `test-harness/context-starved-executor`
  is this article at greater depth: the starvation is the instrument and must be
  enforced rather than requested, the oracle stays outside the executor, a
  five-member outcome vocabulary carries an inconclusive state, and a case whose
  preconditions are unmet refuses to run rather than improvising.
- **The regression contract** (the commenter's objection). Answered by the same
  technique's boundary section: the deterministic suite catches regressions on
  known paths, the starved suite catches discoverability failures, neither
  subsumes the other. The objection assumes replacement; the corpus already
  denies it.
- **Three automatic gates around a generator nobody trusts.**
  `machine-authored-documentation/three-gate-acceptance` owns it with the
  conjunction argument and a standing counter-example per pairwise substitution.
  The industrial gates differ in membership (compiles / passes reliably /
  raises coverage) and the second has no analogue in the document case, because a
  document does not run — a real delta, too thin to land.
- **A repair agent's documented give-up is `skipped`.**
  `oracle-frozen-during-repair` already lists skip and quarantine directives as
  part of the oracle, so an agent that skips is doing the forbidden thing as its
  fallback; `deletion-is-not-repair` covers the rest.
- **Structure, not pixels.** Covered by the same starved-executor lane.
- **Agent at authoring, model out of CI.** This is
  `blocking-by-input-determinism` and the corpus states it more generally. It
  fed row 2 rather than landing on its own.
- **Agentic testing inherits the eval problem.**
  `eval-harness/assertion-vs-judgment` owns the boundary.

## Lead

- **The reviewer's cue is what the generator optimises.** The article's sharpest
  unlanded observation: a generator emits tests that look exactly like the ones
  the team writes, so a reviewer waves them through at the speed they wave
  through their own, and "an assertion that checks the build started, instead of
  checking the tests inside it passed, looks fine in a diff". The corrective
  offered is an ordering — read the assertions first and the steps second. There
  is something general here about review-by-familiarity failing precisely where
  the artifact is machine-authored to be familiar, and the corpus does not state
  it (uncapped grep found nothing). **Return condition:** a second independent
  source reaching it, or a fleet project measuring review time or defect
  escape on machine-authored versus hand-authored diffs.

## Method notes

- The **repeated-denial search** (round 22 focus item 2) was run deliberately
  rather than stumbled into, and it is what produced row 2: grep the candidate's
  home subject for a claim another subject cites, then read the escape clause
  under it. Aiming beat stumbling — the hunt landed on a section heading that
  declares its own completeness ("Two advisory-nesses"), which is the cheapest
  form of the enumeration hunt and is mechanically greppable.
- The **peer study owed for a media-domain project** (focus item 3) does not
  apply to this source and is not discharged here. This is a 3,000-word
  newsletter about testing; there is no peer system to compare a tree against.
  The debt stays open against a source that is one.
- **`ship` is `1/tested`** under the split proposed as focus item 1: one commit
  shipped here, and the two consumer trees examined for row 2 were tested and
  needed nothing — which is a different zero from "no seam was reached".

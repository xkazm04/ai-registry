---
source: awesome-ai-agent-papers
kind: reference-index
url: https://github.com/VoltAgent/awesome-ai-agent-papers
title: "Awesome AI Agent Papers"
author: VoltAgent (curated)
commit: a2ffba2be2752f22e151619cd3d5a0447a1d4372
words: 16346
refs_found: 1159
refs_distinct: 382
refs_ranked: 382
refs_read: 16
waves: 2
refs_untriaged: 366
fetches: 31
extracted: 40
accepted: 7
declined: 0
leads: 9
already_covered: 11
untriaged: 366
dispatched: 0
applied: 2
shipped: 0
run_id: 2026-08-31-voltagent-papers
siblings: 7
---

# Awesome AI Agent Papers - first run of the reference-wave lane

The lane's first real source, and it behaved as designed. 382 distinct documents,
16 read across two waves, the other 366 ranked and recorded rather than discarded.
Ranked tail: [`2026-08-31-voltagent-agent-papers.refs.md`](./2026-08-31-voltagent-agent-papers.refs.md).

Seven live siblings on the board at start. They held `agent-memory`, `retrieval`,
`eval-harness`, `model-routing`, `quality-gates`, `measurement-honesty` and
`fleet-orchestration` - most of the ground a 2026 agent-paper index maps onto. That
steering is recorded because it changed what was read, not only what was written.
It also killed the top-ranked paper in the whole index: its only home is
`retrieval`, which a sibling held.

## What the index is, and its one finding about itself

A pure bibliography: one 175KB README, no other file, 16,346 words that are almost
entirely link text plus a ~23-word curator annotation per row. Five sections, zero
papers cross-listed, all arXiv, all 2026-01 onward.

Signal mix across all 382 annotations - the class's marketing half, quantified:
**28 claim a negative result (7%), 126 claim a measurement (33%), 167 propose a
framework with nothing measured (44%)**, 68 neither.

Its own finding, a bibliography being a stated opinion about a field's edge, is a
divergence: the curator puts ~47% of 2026 agent-paper output in tooling and
security, while our `llm-agent` bundle has 29 subjects of which one is agent
safety. Recorded as a lead, not acted on.

## Three annotations were materially wrong

The lane exists because titles and annotations cannot rank references. First
contact confirmed it at a measurable rate - 3 of 16 read:

- one named random seeds as a dominant effect; the paper measures seeds as the
  *smallest* effect (~3%) and the large ones as deterministic implementation
  choices (6-14.5 points). Acting on the annotation would have sent a reader to add
  seeds and measure nothing.
- one said "56 scenarios across 8+ disciplines"; the paper says 53 and exactly 8,
  and only 3 of the 53 were quantitatively evaluated.
- one said "48,000 simulated failure scenarios"; it is 300 base cases under ~160
  conditions, with the taxonomy induced from 170 hand-coded traces.

A fourth sent a worker to the wrong paper entirely - which became that lane's
second-best finding.

## Accepted (7 amendments)

**Family A - the damage floor is false where the deliverable is the text.**
Three independent sightings, verified disjoint on authors, institutions and
benchmark lineage, with the earliest predating the others so it cannot be a relay.
Landed as a bounding of `prompt-safety`'s own ranking, not a deletion of it:
capability is the last fence *when the payoff is an action*; where the deliverable
is the payload, the second half is least privilege on the **read** side. The
strongest support is internal - the subject already calls a secret recalled into
prose "the attack proper", two sections above the ranking that ignores it.

- `prompt-safety.md` - golden path, the read-side half of the last fence
- `techniques/payoff-removal.md` - a fourth payoff class, **persuasive**: a prose
  channel that works to lower its reader's chance of rejecting it. The inert
  assignment rests on the reader noticing the text has gone strange, which holds
  only while the text is not trying to look normal.
- `techniques/untrusted-span-fencing.md` - a second residual, structurally unlike
  the first: harm that is a property of a *pair* of spans, where each is
  individually unobjectionable. Every operation in the subject is per-span, so the
  whole remedy ladder runs clean and buys nothing. Not an inventory gap - the
  inventory names retrieved memory explicitly. A remedy gap, which is worse.

**Family B - the corpus's degradation triggers test shape, not truth.**
Substantially revised mid-run (see below). What survived: the tool/transport lane
has no trigger for a response that parses, validates and is wrong, and no document
states the cross-bundle boundary.

- `mcp-tools/techniques/untrusted-result-handling.md` - the premise selects one
  direction; every mechanism lowers a result's weight and none raises it. The
  excluded case is the honest tool contradicting the model's prior, where the prior
  wins by default. The literature disagrees on which side wins, and that
  disagreement is the finding: the tiebreaker is not conservative, it is
  unpredictable.
- `model-routing/techniques/failover-horizon.md` - a seventh form of unusable
  success the six enumerated forms cannot reach, plus the only portable instrument
  (agreement across repeated draws, canonicalized) and its honest price (n x tokens,
  n x latency). Came from the *baseline column of a paper whose thesis failed*.

**Held for a sibling, landed when the board cleared:**

- `fleet-orchestration/techniques/coordination-failure-triage.md` - corrects a
  sentence we publish. An agent judge labels the observable effect at ~0.86-0.90 F1
  and the root cause at ~0.45-0.57 on the same artifacts. The bulk pass is
  automatable on the symptom axis only, and the cause axis routes the fix.
- `eval-harness/techniques/failure-attribution.md` - the funnel's tells are written
  from inside a run that executed, so owners preventing the run from *starting* fall
  through to Model and get the most expensive response for problems no model can
  fix. Symmetric to the eighth owner's own argument, run backwards.

## Already covered (11) - and twice we are ahead of the published field

- verdict cardinality: a published state-of-the-art grounding check runs binary
  supported/not-supported, penalizing *unstated* and *contradicted* identically.
  `failure-not-empty-success` and our three-valued discipline are ahead.
- trajectory vocabulary: `worker-trajectory-anatomy` (1,794 annotated trajectories,
  63,000+ steps, plus an independent 20,574-session field corpus) is better
  evidenced than either wave-2 paper offering one.
- benchmark admitted on the outcome it reports -> `unaided-baseline-screening`
- windowed drop detection -> `windowed-score-drop-alerting` (ours relative, theirs
  absolute; ours is better)
- composite metric over a fixed denominator -> `renormalize-over-present`
- schema drift at the seam -> `untrusted-result-handling`
- aggregate blame before acting on one failure -> `coordination-failure-triage`
- block taxonomy -> `agent-chaining`
- self-reported confidence is uncalibrated -> `confidence-weighted-blend`
- similarity matching rejected for claim binding -> `citation-required-per-claim`
- causal provenance is not blame -> `chain-identity-and-rollup`

## Corrected mid-run - a premise this run got wrong

Wave 1 concluded the corpus "owns nothing that scores a trajectory" and "has no
material on agentic workflow selection". **Both were false, and the verification
that confirmed them was invalid.** The check was a grep for `ReAct` and
`Plan-and-Execute` over `knowledge/` - scaffold proper nouns, which
`check-bundles.mjs` *forbids* in upper-layer documents. A proper-noun grep over a
purity-gated corpus is guaranteed to return empty; it measures the gate, not the
coverage. A manufactured total empty, which Phase 4 already warns is more dangerous
than a near-empty.

Two wave-2 lanes caught it independently. `worker-trajectory-anatomy` is exactly
the missing thing and is better evidenced than either paper proposing one;
`assertion-vs-judgment` already names correct-shape-but-false; and the full
groundedness build exists in eight techniques under
`civic-intelligence/accountability-method/llm-forensic-gating/`.

**Root cause, and the run's most valuable output: `research-map` matches slugs.**
Director test, in-run: `research-map "evidence conditioned faithfulness"
"groundedness verification"` returns six subjects and `llm-forensic-gating` is not
among them. An eight-technique build that directly owns the concept is invisible to
the instrument that decides prior art. Every "we have no material on X" this corpus
has drawn from that instrument is suspect.

## Leads (9)

1. **`research-map` cannot see a concept filed under an unrelated slug.** Owed work,
   not a lead waiting on the world. Proposed: a `use_when`/prose pass (`--deep`
   exists and was not enough here), or an embedding index beside the slug index.
2. **Blame attribution for a step in a failed multi-step run** - nothing in
   `agent-chaining` or `fleet-orchestration` assigns it; four near-misses each
   decline the job. Counter-refutation in hand: forced total ordering is noise at
   fleet size, because ~42% of failures are specification defects and the brief is
   not a step. Return: a second source ranking components under a fixed
   representation with the judge ablated.
3. **`hibernation-and-resume` states "warm context is the asset" unqualified** - no
   discriminator for when carried context is the liability. Return: a second
   independent sighting that a persisting session's context degrades its output.
4. **The mid-run health verdict on a persistent fleet member** - alive, responsive,
   inside every guard, getting worse. `cycle-and-depth-guards` says out loud that
   its convergence check is unowned.
5. **No fault-injection subject anywhere in `operations/`.** XL. Return: an SRE
   first-party account, or a platform's own fault-injection docs.
6. **Tool description/schema as an attacker-controlled span** - our inventory names
   tool *results*; the manifest reaches the model first and is never fenced.
   `failure-attribution` treats the contract as a distinct artifact but asks only
   whether it is wrong, never whether it is hostile.
7. **A reported n of executions is not a denominator of subjects.** Clustering
   invalidates the swing-width argument; `minimum-sample-floors`' four stated
   exceptions do not include it, and the corpus holds the idea in the *recruiting*
   bundle only. The run's strongest new-technique candidate; not landed (scope).
8. **A rising inter-rater kappa is protocol drift, not reliability.** Observed
   0.000 -> 1.000 monotonic with annotation order, headline reported as ~0.99.
9. **The Family B base rate is structurally unobtainable from bug-report corpora.**
   Nobody files a ticket saying the agent gave them a well-formatted answer they
   believed. Two corpora over the same technology reported *inverted* symptom
   distributions because the reporting channel decides what gets filed. Return: an
   instrumented trace corpus with per-step ground truth, or our own.

## Wave-3 references, ranked and unread

- `2604.23588` FinGround - atomic claim verification against **table cells**, with a
  detection base rate (43% of computational errors). Likely the runtime remedy the
  finance paper was not. Highest-value unread reference in the set.
- `2603.04663` VeNRA - deterministic fact ledgers; retrieve variables, not prose.
- `2605.25338` CausalFlow - causal attribution and counterfactual repair for agent
  failures; the natural counterpart to `failure-attribution`. Not in this index.
- `2603.16475` Breaking the Chain - faithfulness to intermediate structures.

## Untriaged (366)

Ranked, unread, recorded with class, score band and map hit in the companion file.
Nobody verified them. They are not declines.

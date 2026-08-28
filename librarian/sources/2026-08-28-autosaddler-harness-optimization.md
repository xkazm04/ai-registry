---
source: web:github.com/microsoft/AutoSaddler
kind: research-code release (paper + real implementation, one squashed commit) — ingested at its README, which is this class's least reliable surface
url: https://github.com/microsoft/AutoSaddler
title: "AutoSaddler: Automatic Harness Optimization with Durable Updates from Agent Execution Traces"
author: corporate research lab (13 authors, arXiv 2608.23041, released 2026-08-24)
words: 1696
extracted: 14
accepted: 3
declined: 0
leads: 1
already_covered: 1
untriaged: 9
dispatched: 0
---

# AutoSaddler — automatic harness optimization

A lab's paper-plus-implementation drop about **optimizing an agent harness from its
own failed traces**. The class row predicted the shape of this run accurately and
was wrong about one thing worth recording.

## The class read: right about reliability, wrong about where the yield was

The `research-model release` row says the README is an advertisement and the least
useful file present, with yield sitting in the first-party prompt artifacts, then
config-plus-the-code-that-reads-it. **The ingest returned only the README**, so this
run worked the advertisement surface exclusively — and still landed three findings,
which the row does not predict.

The reason is a property the row should carry: **a research release's README is an
advertisement for a *method*, and a method's advertisement is made of its
distinctions.** This one lists a patch taxonomy, a session-type taxonomy, and a
four-way outcome classification, because those are what the paper is claiming as
novel. Every one of those is a candidate that survives the strip test, because a
taxonomy is portable in a way a benchmark number is not. Compare the vendor
repository, whose README advertises a *product* and is therefore made of names.

The benchmark table (+9.0, +9.6, +10.0 pp Pass@1 across three agent benchmarks) is
exactly the part this class is least reliable for and was proposed as nothing. It
is recorded below as a currency signal only.

**1 of 3 fetches spent** — on a primary, and it was extraction rather than
corroboration: it settled the mechanism the whole of finding 1 rests on. The other
two findings corroborated corpus-internally, which is now the ninth consecutive run
where the corpus was its own second source.

## Accepted

### 1. `workspace-ancestry-isolation` — new technique in `agent-instruction-files`

**Anchor:** "Run from the external working directory so generated workspaces cannot
inherit repository-level agent instructions through Git ancestry."

One sentence of operational hygiene, buried in step 3 of a reproduction recipe,
stating a hazard the corpus had the mechanism for and had never drawn the
consequence of. The subject models instruction files entirely from the author's
chair — what a line earns, where the canonical file lives, which regions the
machine owns — and its loading model (`single-source-topology`) sorts into
always-loaded, loaded-on-touch and per-user. **All three categories describe files
an author placed deliberately.** A directory a program creates has no author, and
is governed anyway.

The **seven-item failure-mode enumeration** in the golden path is what confirmed
this as a hole rather than a seam: generated overview, style guide in prose, the
fork, the 25k floor, the confident stale line, the phantom gate, the two-audience
document. Every one is *the file's content being wrong*. Not one is *a correct file
governing a directory nobody meant to brief*. The enumeration hunt pays a ninth
consecutive run.

**The fetch made the finding bigger than the source did.** The primary states the
discovery rule precisely — files load from the working directory "and every
directory above it", concatenated rather than overridden, with **no boundary at the
repository root** — and adds a half the source never mentions: per-directory files
*below* the launch point load lazily when the agent reads a file in them. So the
hazard is not a chain but a cone, and it runs in two directions. The source's case
is upward inheritance; **downward injection is the sharper one** — a third-party
tree cloned under the working directory ships its own instructions into context the
moment the agent reads anything in it, authored by people the team never reviewed.
The source's own recipe clones exactly such a tree, and does not mention this.

Two further gifts from the primary, both now in the technique: a **path-exclusion
setting** exists as a fallback and fails the way configuration fails
(`absent-guard-is-loud`); and the harness can **report which instruction files a
session resolved**, which converts the isolation claim from an assertion about the
layout into an assertion about what actually loaded. The technique ends there
deliberately — this subject already refuses to let an enforcement claim go
unverified, and an isolation claim is the same kind of claim.

### 2. `capability-before-steering` — new technique in `agent-instruction-files`

**Anchor:** "structured Capability patches (code or infrastructure) and Steering
patches (textual behavior changes)" applied on a "phased Capability-to-Steering
schedule".

The source's best idea, and it lands as a **question that precedes the subject's
existing admission test**. `line-earning` asks: is the content unreachable, does
its removal change behavior. `enforcement-demotion` asks: could a program decide
compliance — yes demotes to a gate, no stays prose. **Both branches of the demotion
sort presuppose an agent that can perform the behavior**, and differ only on how
reliably it is made to. Neither asks whether the agent could have complied at all.

That is an enumeration denial, and it is the second one this run found in a
subject's own structure rather than in its prose.

The cost argument is corpus-internal and is what makes this a technique rather than
a nicety: this subject's whole foundation is the measured finding that **compliance
falls with instruction count, roughly uniformly**. A line written against a
capability gap cannot work *and* charges that tax to every line that could — so it
is the one instruction-file edit that is strictly negative. The observable
signature, which the corpus can now name: **a rule restated with escalating force
across several revisions is nearly always a capability gap being sharpened as
though it were a wording problem.**

Written above the source's altitude in two places the source does not reach. The
mechanical discriminator — *attempt the behavior outside the agent with exactly the
means the agent had* — is the corpus's, not the source's, and it carries a
`gate-sees-target` citation because asking the agent whether it could have complied
reads a proxy, and a model will readily accept blame for an impossibility. The two
short-circuit tells (uniform-across-sessions means capability, since genuine
steering failure is probabilistic; persistence at the top of a minimal file
excludes steering by construction) are derived from the dilution model the subject
already owns.

### 3. Seventh owner in `eval-harness/failure-attribution` — amendment

**Anchor:** "searches over prompts, tool definitions and implementations, middleware
hooks, and agent-loop logic."

Triaged as a technique, resolved as an amendment, which is the cheaper and more
honest landing. `failure-attribution` enumerates six owners of a red case — label,
dataset, input construction, pipeline, prompt, model — and says a case is "owned by
exactly one of these". Complete for a single-call system: something is asked,
assembled, sent, answered, handled. **An agent is not that shape**, and the source's
patch taxonomy treats tool definitions and implementations as a first-class patch
surface separate from prompts, which is the observation that opened the check.

The finding is not that a row is missing. It is that **the funnel's own tells route
tool failures to the wrong owner, and the wrong owner is the expensive one.** An
agent that calls the right tool with wrong arguments because a field name was
ambiguous fails the prompt's tell (*a person reading only the prompt would make the
same mistake* — they would not; the prompt was fine) and fails the pipeline's tell
(*the raw output and the recorded outcome disagree* — they agree; the agent
genuinely did the wrong thing). Failing both, it falls through to **model**, the
residual bucket, whose prescribed response is "a different model, or an accepted
limit written down as one."

**So a strictly correct application of the technique produces the exact
mis-attribution the technique exists to prevent** — and prescribes a model
migration for what a rewritten tool description would have fixed. That is the
reusable form of this catch, and it is why the amendment had to name the tells
rather than just add a bullet.

Placed between pipeline and prompt: the tool contract is a separately versioned,
separately owned artifact injected by the harness, and it constrains what the
prompt can even ask for. The golden path's "six layers" sentence and the technique
list were corrected in the same change; "two of the six are not the system" and
"classes resist all six" became seven.

## Already covered

**The `XL` subject proposal (row 14) dissolved on verification.** The triage read
the README as describing a subject nobody owns — automated harness self-improvement
— and it does not. Its material decomposes cleanly across two mature subjects that
already exist: the diagnosis-and-selection half is `eval-harness`, and the
patch-taxonomy half is `agent-instruction-files`. This is worth writing down
because the near-empty signature was present and misleading: `research-map` found
no subject whose slug matches "harness optimization", and the concept lives inside
two subjects under different names. **A method with a paper is not automatically a
subject**; it is often a route through subjects the corpus already has.

## Lead

**Harness self-optimization has an open reference implementation, and its numbers
are unverified here.** A corporate lab published a system that optimizes agent
harnesses from failed traces, reporting +9.0/+9.6/+10.0 pp Pass@1 improvements over
three different base harnesses on three agent benchmarks, with an open MIT-licensed
implementation and a V2 plugin interface for adding harnesses. The repository is one
commit old and lists integrations for further harnesses as "coming".

*Return condition:* when a second independent implementation reports gains from
trace-driven harness patching, or when a connected project runs an optimization
loop over its own agent configuration — at which point the Capability/Steering
ordering in finding 2 becomes measurable rather than argued, and the four-way
reflection classification (fixed / regressed / still-failing / still-passing) can
be checked against `quality-regression-gating`'s `paired-per-case-testing` for
whether the regressed cell is genuinely already owned.

## Untriaged

Extracted, reached the table, never picked. **Nobody verified these and no judgment
attaches to them** — recorded with anchors so a later run does not re-derive them,
and so the convergence check has something to match against.

| # | Candidate | Anchor | Nearest prior art |
| --- | --- | --- | --- |
| 4 | Classify a patch four ways, not two: fixed / regressed / still-failing / still-passing | "classifies fixed, regressed, still-failing, and still-passing cases" | `llm-observability` quality-regression-gating (`paired-per-case-testing`) |
| 5 | Gate a fix on cases that did not motivate it; disjoint train/dev splits | "validates updates beyond the motivating trajectories" | `eval-harness` (`scenario-design`, `comparison-modes`) |
| 6 | Resume a run only when all resolved inputs are byte-identical; reject otherwise | "reused only when all resolved inputs are byte-identical" | `backend-platform/work-execution` |
| 7 | Force the dataset loader offline so evaluation cannot silently re-fetch | "Evaluation runs with Hugging Face clients forced offline" | `cross-provider-benchmark-operations` (`dataset-sampling-anonymize-freeze`, `determinism-stamping`) |
| 8 | Optimizer model need not be the optimized model — spend capability at the meta level | a cheap model for the task agent and judge, a frontier model for optimization | `llm-agent/orchestration/model-routing` |
| 9 | Agent execution traces are a secrets-bearing artifact class | "traces may contain prompts, responses, tool arguments, working directories" | `telemetry-and-data/trace-rollup-and-attribution` |
| 10 | Content-addressed candidate spaces for immutable harness variants | "immutable, content-addressed component-map and Git candidate spaces" | `llm-agent/orchestration/fleet-orchestration` (`durable-fleet-state`) |
| 11 | Single writer per durable run id | "Never run two processes against one run ID" | `work-execution/delivery-guarantees` (`atomic-claiming`) |
| 12 | Forking a run from a checkpoint may vary only the budget | "Only optimization.budget.max_iterations may differ" | `work-execution` |

Row 4 is the one most likely to be a real finding on a second look: the **regressed**
cell is the one a shallow reflection loop never computes, and it was marked
`partial` rather than `likely catch` at triage.

## Declines

None. The operator picked three of fourteen and left the rest unpicked rather than
rejecting them, so the decline ledger is untouched by this run.

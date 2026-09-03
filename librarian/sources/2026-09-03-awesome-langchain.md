---
source: github:kyrolabs/awesome-langchain
kind: reference index
url: https://github.com/kyrolabs/awesome-langchain
title: "Awesome LangChain — curated list of tools and projects"
author: kyrolabs (curator)
commit: 9796b1d50c20c65cccbf4ccd2dc1497a8b15cd79
words: 3665 README / 382 contributing — landing surface only; the references are the source
references_total: 214 entries / 211 distinct documents
extracted: 21
accepted: 21
declined: 0
leads: 7
already_covered: 4
untriaged: 187 tail + 15 wave-2 pool + 3 rows the gate never offered
dispatched: 1 forge worker (executed), 3 apply lanes, 7 reference-wave lanes
run_id: intake-awelc-0903
siblings: 4 live at claim time (vllm, microsoft/mcp, voicebox, RustTraining)
fetches: 0 run-wide by the director; per-reference, spent by lane workers
---

# Awesome LangChain — reference index

**Class: reference index.** The ratio decided it before any content was read:
**413 outbound links over 4,047 words.** A code repository has a handful of links
across tens of thousands of words; this inverts that, which is the tell that the
value is the bibliography and the prose is annotation.

## The honest total, and the class profile

Enumerated by instrument over the whole tree, normalized, deduped by URL and then
by document. The shallow clone carried no history, so removed entries — a
curator's judgment, and often the most interesting rows — were **not**
recoverable. Noted as a limit, not skipped silently.

| | count |
|---|---|
| list entries → distinct documents | 214 → **211** |
| repositories | **198** |
| relays (notebook links, video playlists, social) | 9 |
| first-party (the framework vendor's own blog/docs) | 3 |
| primary | 1 |
| **papers** | **0** |
| **standards / specifications** | **0** |
| annotations claiming a mechanism, failure mode or measurement | **13 (6%)** |
| annotations empty or pure marketing | 19 |
| already in this ledger | 1 (`Portkey-AI/gateway`) |

**Two consequences shaped the whole run, and both are methodic rather than
incidental.**

**1. The wave lane assumes a reference is a document readable in ~2 fetches.
Here 94% of references are repositories** — each one is itself a Phase 2b source
needing a clone and a tree sweep. Fetching them would have mined 211 READMEs,
which is the anti-pattern this method names first, at scale. Wave 1's workers
were therefore given **clone briefs** with the full sweep order (operating docs →
the instrument → the measurement → types → tests → README last). Every lane
reported that the README was the least useful surface it read; one found 46,000
words of in-tree operating documentation behind a 2,000-word landing page.

**2. The rankable band is 13 entries wide, not 211.** Ranking on the curator's
annotations is the lane's prescribed method, and it is right, but it has a
false-negative class this run hit: **the under-annotated primary.** `Gorilla` is
annotated in five words ("An API store for LLMs") while actually carrying a paper
and a function-calling benchmark. A five-word annotation on a substantial
reference is indistinguishable from a five-word annotation on a toy. That is a
lesson for the lane, recorded in `LESSONS.md`.

## The curator's own finding — the one a reference index carries

A bibliography is a stated opinion about a field's boundary, and this one says:
**the field is an ecosystem of implementations.** Every row is a tool; 82 of 211
sit in a single section of competing frameworks; every entry carries a star
badge. There are no papers and no specifications at all.

Where it converges with ours: nothing. Where it diverges is the finding. Our
corpus is organized by **decisions**, and this index cannot express one — it has
no row shape for "the reason a system is built this way", only for "a system".
That is why nine references produced 21 candidates: the knowledge was in the
trees, not in the list, and the list's own organizing principle cannot see it.
**A field's canonical index being unable to represent its own design knowledge is
corroboration for a registry organized the way this one is** — recorded once,
here, and not mistaken for the source's yield.

## Board and contention

Four siblings live at claim time. Three of my four claimed subjects were
contended — `llm-observability/telemetry-and-data` (a serving-engine run),
`llm-agent/runtime-and-io` (two runs), `mcp-tools` (an MCP monorepo run). The
board steered the run rather than merely warning it: the MCP-flavoured wave-2
candidate was routed away from `mcp-tools` instead of racing it, and the
telemetry landings were re-checked immediately before the write (clear at that
moment) rather than at map time.

A red gate appeared mid-run on `invariant-placement`, `scale-investment-timing`
and `security/supply-chain` — all **untracked sibling WIP**, none of them mine.
Reported, not fixed. The consequence for this run: a global green gate was not
available as verification, so verification was scoped to my own paths, and
`catalog.json` (modified by a sibling) was deliberately left uncommitted.

## Findings

Every contradiction below was verified by the director against the registry file
itself, not taken from the worker's report.

### A — Semantic cache: the corpus denied a live category

`admission-hypothesis` claims **"There are only a few bets available"** and
enumerates four — recency of access, recency of creation, proximity, co-writing
in time. All four are bets about *time or adjacency*, and all four assume the key
is an identity, so a hit is a proof. The technique then denies the category by
example: *"a search keyed on free text the user will never retype."*

A working system runs on a fifth bet — **paraphrase recurrence**, the user *will*
re-ask, in different words — under which a hit can be **wrong** rather than
merely old. The denial denied too much.

- **`similarity-keyed-admission`** (new technique, `client-fetch-cache`): the
  fifth bet, the two knobs (metric and cut-point, only the second usually
  exposed, commonly expressed as a fraction of the first's range so a metric swap
  silently re-tunes correctness), the vetoing confirmation ladder on one declared
  range, and the eviction failure an identity-keyed cache cannot have — **a wrong
  hit refreshes recency exactly as a right one does, so an attractive wrong entry
  is reinforced by the traffic it corrupts.**
- **`admission-hypothesis`** amended: the fifth bet named, the free-text rule
  scoped to identity keys.
- **`cache-key-discipline`** amended: *"a duplicate fetch costs milliseconds; a
  collision costs correctness"* is conditional on cost(miss) ≈ 0 and inverts
  where the authority is slow and metered.
- Also recorded: the third defect class. The prescribed axis audit passes clean
  on a similarity cache while it serves wrong answers, because the collision
  boundary is in the cut-point, outside every axis the audit walks.

### B — Extraction: a second stack against a four-day-old rust-only subject

- **`structure-saturation-guard`** (new): the mirror of everything else in the
  subject. Not text *missing* but text that **gained structure the document never
  had** — a heading detector calibrated from a per-page font census, on a page of
  display type where the census has no body to be modal about, promoting the
  whole page and reporting high confidence. The general rule: **an
  over-production failure is invisible to any measure whose denominator is the
  source.** Yield measures ratio recovered against present; they structurally
  cannot see output the input did not contain.
- **`escalation-adjudication`** (new): a retry produces a candidate, not a
  replacement, and it is admitted only if it scores higher **on the measure that
  condemned the original**. Adjudicating on output volume selects *for* the
  failure mode of a reconstructive reader, which wins on volume whether right or
  wrong. Observed in one tree implemented correctly at one site and by volume at
  another.
- **`band-calibration-by-construction`** (new): label fixtures by how they were
  built, never by running the system under test; the generator must verify its own
  damage is present; a **flat precision curve is a broken instrument, not a robust
  one**; no threshold meeting the target is a result, not a number to lock.
- **`extraction-yield-bands`** amended: *"a document's band is the worst of its
  regions"* serves the re-acquisition consumer and breaks a **document admission
  gate** — a third consumer the technique never names, under which one bad page
  condemns a four-hundred-page file.

### C — Failover: fault injection is owned for testing and retirement, never for liveness

- **`failover-path-liveness`** (new, `model-routing`): a failover path executes
  only during an incident, so it is tested by an incident. Classify a fallback's
  trigger as **ambient** or **exceptional**; injection bounded by window, rate
  ceiling and enabled class set, fail-closed; never inject into a call already
  failing; assert the *transition*, not the destination. Exploration is the
  corpus's de facto liveness instrument and is **defined to suspend when the
  healthy pool is thin** — it withdraws exactly during the incident it would have
  prepared for.
- **`fallback-retirement-condition`** amended: *"a number that fell to zero says
  delete the code"* is right for an ambient trigger and inverted for an incident
  one, where zero is the healthy steady state. Retiring on it deletes a safety net
  because there has not yet been a fire.

Absence established uncapped: two files corpus-wide mention fault injection, both
read, neither in this lane.

### D — Telemetry: a missing stage between two bundles

Three observability subjects defer builder-side emission to a fourth subject in
another bundle; that subject requires the schema live in "one authority" and
**never entertains that the authority could be an external published convention.**
The decision was made by default because nobody asked.

- **`vocabulary-source-selection`** (new, `tracing`): in-house vs adopted
  vocabulary, decided on **who controls both ends of the version skew** — not on
  builder-vs-receiver. Adopt the core, extend only in a namespace you own, never
  squat in the convention's namespace, and assert borrowed spellings in tests
  **presence and absence**, because a rename fails silently by writing a column no
  query reads.
- **`attribute-precedence-lists`** amended twice: the builder-side exemption's
  discriminator is wrong (a library pins neither end and needs the list); and the
  settled core carries only the two mandatory token counters while every class
  **priced differently** — cached input, cache creation, reasoning — sits in
  extension namespaces with incompatible spellings deployed simultaneously, one
  implementation shipping two spellings of one counter in a single file.

**Catch, and a good one:** the corpus states the convention's pre-stable status
at *higher resolution* than either reference. No currency finding — we are ahead.

### E — Quality scoring: an unstated premise load-bearing across a category

**XL trigger fired mechanically.** Four verified enumerations across five
subjects all presuppose a **judge**, and the premise is stated nowhere:

- *"Every quality number ... flows through one instrument: the judge."*
- *"One pipeline, two sources of score."* (judged, or a deterministic check)
- *"The scoring loop is ... read-only against the serving path"* — justified
  solely by *"The judge is a metered model call."*
- *"agreement is judge-vs-human, drift is judge-now-vs-judge-then, repeatability
  is judge-vs-itself."*

A score computed from the generator's own output distribution is neither source,
falsifies the invariant's premise, and adds a fourth quantity.

**Landed: new subject `generator-uncertainty-scoring`** (5 techniques):
`score-source-kinds`, `scorer-cost-class`,
`probability-calibration-is-not-agreement`, `generator-vs-itself`, and
`score-source-ensembling` (the forge worker's own addition, accepted — it owns the
combination rule and the label-scope condition, which nothing else did).

**The headline claim was refuted in-session, and this is the run's most important
process result.** The wave worker's comparative — judge-free scorers
"consistently outperform" judges, ROC-AUC 0.88 vs 0.51 — was marked `[H]` (read
through a summarizer). The forge worker re-derived it from the papers directly
and found: the spec's citation conflated two documents; the 0.88/0.51 pair is in
neither; and among non-ensemble scorers **a model judge was best in 11 of 24
scenarios**, the plurality. The corpus would have published an inversion of the
truth. The subject now carries a section titled *"This is not a demotion of
judges, and the measurement says so."*

Director-verified from the primary artifact: **ECE 0.428037 → 0.030675 while MCE
moved 0.511129 → 0.500000.** Average calibration honesty bought; worst-bin
honesty unbought — and a gating floor is a worst-bin claim.

## Already covered — catches (4)

- **Tool risk taxonomy** — a category-keyed lookup table of 11 rows against
  `mcp-tools/egress-argument-gating`, which decides from a call's *arguments*.
  Ours is strictly the stronger instrument. Recorded so nobody proposes it again.
- **The convention's pre-stable status** — corpus ahead of both references.
- **Per-region extraction granularity and mixed provenance** — already owned.
- **The chaos failure taxonomy** — three classes against `failover-horizon`'s
  six-plus-one. Ours is richer; the injector cannot even make a call fail, so it
  exercises downstream content handling and not a failover trigger at all.

## Leads (7)

Each with a return condition.

1. **A precision harness for a similarity cache.** Labelled negative pairs ship
   in one tree; a real precision measurement is one harness away. *Return when a
   fleet project runs a similarity-keyed cache.*
2. **A practitioner's own account of running fault injection in production** —
   the highest-value unread artifact attached to that reference; the host
   returned 403. *Return with an archive route.*
3. **Reading-order reconstruction**: a full negative-result document — three
   attempts, all measured regressions, with root causes. A concern
   `document-text-extraction` does not model at all. *Return when the subject
   grows a layout lane.*
4. **Signed extraction manifests** (offline-verifiable provenance) → a
   supply-chain/attestation subject. *Return when that ground is opened.*
5. **Static-benchmark insufficiency** ("bring your own prompts") →
   `cross-provider-benchmark-operations`. *Return on a wave into that subject.*
6. **Emitter-side redaction surface** with a stated precedence order →
   a telemetry-PII subject. *Return when that subject is opened.*
7. **Long-form claim decomposition and per-claim verification** — a whole design
   lane no prior-art path owns; forge-shaped, not wave-slot-shaped. *Return as a
   scoped forge dispatch.*

## Untriaged — nobody looked, and that is not a decline

**Three rows the triage gate never offered.** I tabled six clusters and the
question presented four options; cluster F (agent security) was in the table and
not on the ballot. It carries no operator judgment and is recorded here in full
so it is not re-derived:

| # | shape | title | prior art | anchor |
|---|---|---|---|---|
| 19 | technique | A standing adversarial probe corpus with per-fixture success conditions | `prompt-safety` | `canary-tripwires` `use_when:9` carries *"zero trips and no proof the tripwire fires"*; the body answers it in one clause at `:90`. Seven techniques, all constructive, none owning verification. Mentioned in one place, measured nowhere. |
| 20 | amendment | A mitigation ladder must not score prose and an executable gate at the same rung | `enforcement-demotion` | A shipped scanner scores an advisory instruction and an executing guard as equal halves of one credit, and prints it as a posture. |
| 21 | amendment | The guard exempted from its own scan | `prompt-safety` | An agent used *as* a guardrail is skipped by the vulnerability pass — the correlated-collapse failure with an explicit switch. |

**A seventh wave-1 lane returned after the gate closed** and is the largest
single result of the run: a first-party vendor agent framework whose design read
produced **three `corpus: NONE` decisions sharing one missing home** — the
agent's externalized working substrate as an addressable namespace. That is the
Phase 2d routing count met, i.e. a forge job. Its detail is banked in the design
record; it is untriaged, not declined.

Plus **15 ranked wave-2 candidates** and **187 tail references**, tabled below.

## The ranked list

The lane's most durable artifact: every reference, classified, banded. A tail
nobody wrote down is a tail that gets re-earned forever.

### Band A - read in wave 1 (9)

| ref | class | section | outcome |
|---|---|---|---|
| [GPTCache](https://github.com/zilliztech/GPTCache) | repository | Services | see findings |
| [ChatAbstractions](https://github.com/andrewnguonly/ChatAbstractions) | repository | Services | see findings |
| [LangFair](https://github.com/cvs-health/langfair) | repository | Services | see findings |
| [Agentic Radar](https://github.com/splx-ai/agentic-radar) | repository | Services | see findings |
| [UQLM](https://github.com/cvs-health/uqlm) | repository | Services | see findings |
| [pdfmux](https://github.com/NameetP/pdfmux) | repository | Knowledge Management | see findings |
| [deepagents](https://github.com/langchain-ai/deepagents) | repository | Agents | see findings |
| [Openllmetry](https://github.com/traceloop/openllmetry) | repository | Platforms | see findings |
| [traceAI](https://github.com/future-agi/traceAI) | repository | Platforms | see findings |

### Band B - ranked, unread, wave 2 pool (15)

| ref | class | section | why ranked |
|---|---|---|---|
| [Gorilla](https://github.com/ShishirPatil/gorilla) | repository | Services | An API store for LLMs |
| [Auto-evaluator](https://github.com/rlancemartin/auto-evaluator) | repository | Services | a lightweight evaluation tool for question-answering using Langchain |
| [LangWatch](https://github.com/langwatch/langwatch) | repository | Services | An Open Source tool for observing, evaluating and optimising your llm  |
| [Promptfoo](https://github.com/promptfoo/promptfoo) | repository | Other LLM Frameworks | Test your prompts. Evaluate and compare LLM outputs, catch regressions |
| [Chidori](https://github.com/ThousandBirdsInc/chidori) | repository | Other LLM Frameworks | A reactive runtime for building durable AI agents |
| [MicroAgent](https://github.com/aymenfurter/microagents) | repository | Other LLM Frameworks | Agents Capable of Self-Editing Their Prompts / Python Code |
| [Promptise Foundry](https://github.com/promptise-com/foundry) | repository | Other LLM Frameworks | Production Python framework for agentic AI — controllable reasoning, a |
| [DB GPT](https://github.com/eosphoros-ai/DB-GPT) | repository | Other / Chatbots | Interact your data and environment using the local GPT, no data leaks, |
| [LMQL](https://github.com/eth-sri/lmql) | repository | Other LLM Frameworks | A programming language for large language models. |
| [Outlines](https://github.com/dottxt-ai/outlines) | repository | Other LLM Frameworks | Fast and reliable neural text generation. |
| [Letta](https://github.com/letta-ai/letta) | repository | Other LLM Frameworks | Platform for stateful agents with advanced memory that learn and self- |
| [Mem0](https://github.com/mem0ai/mem0) | repository | Templates | Universal memory layer for AI agents. |
| [Instrukt](https://github.com/blob42/Instrukt) | repository | Other / Chatbots | A fully-fledged AI environment in the terminal. Build, test and instru |
| [LangStream](https://github.com/LangStream/langstream) | repository | Other LLM Frameworks | Framework for building and running event-driven LLM applications using |
| [TypeChat](https://github.com/microsoft/TypeChat) | repository | Other LLM Frameworks | TypeChat is a library that makes it easy to build natural language int |

### Band C - untriaged tail (187)

Nobody looked. Recorded with class and section so the next pass diffs instead of re-deriving.

| ref | class | section |
|---|---|---|
| [LangChain](https://github.com/langchain-ai/langchain) | repository | LangChain Framework |
| [LangChain.js](https://github.com/langchain-ai/langchainjs) | repository | LangChain Framework |
| [Concepts](https://docs.langchain.com/docs) | first-party | LangChain Framework |
| [Twitter account](https://x.com/LangChainAI) | relay | LangChain Framework |
| [Youtube Channel](https://youtube.com/channel/UCC-lyoTfSrcJzA1ab3APAgw) | relay | LangChain Framework |
| [Langchain Blog](https://blog.langchain.dev) | first-party | LangChain Framework |
| [Langchain Go](https://github.com/tmc/langchaingo) | repository | Ports to other languages |
| [LangchainRb](https://github.com/patterns-ai-core/langchainrb) | repository | Ports to other languages |
| [LangChain4j](https://github.com/langchain4j/langchain4j) | repository | Ports to other languages |
| [LangChainDart](https://github.com/davidmigloz/langchain_dart) | repository | Ports to other languages |
| [Langchain-hs](https://github.com/tusharad/langchain-hs) | repository | Ports to other languages |
| [Langchain](https://github.com/brainlid/langchain) | repository | Ports to other languages |
| [Langchain-rust](https://github.com/Abraxas-365/langchain-rust) | repository | Ports to other languages |
| [Flowise](https://github.com/FlowiseAI/Flowise) | repository | Low-code |
| [Langflow](https://github.com/langflow-ai/langflow) | repository | Low-code |
| [Flock](https://github.com/Onelevenvy/flock) | repository | Low-code |
| [Langchain visualizer](https://github.com/amosjyng/langchain-visualizer) | repository | Services |
| [LLM Strategy](https://github.com/BlackHC/llm-strategy) | repository | Services |
| [datasetGPT](https://github.com/radi-cho/datasetGPT) | repository | Services |
| [Dify](https://github.com/langgenius/dify) | repository | Services |
| [Chainlit](https://github.com/Chainlit/chainlit) | repository | Services |
| [Langchain Decorators](https://github.com/ju-bezdek/langchain-decorators) | repository | Services |
| [AilingBot](https://github.com/ericzhang-cn/ailingbot) | repository | Services |
| [Swiss Army Llama](https://github.com/Dicklesworthstone/swiss_army_llama) | repository | Services |
| [MindSQL](https://github.com/Mindinventory/MindSQL) | repository | Services |
| [Llama-github](https://github.com/JetXu-LLM/llama-github) | repository | Services |
| [CopilotKit](https://github.com/CopilotKit/CopilotKit) | repository | Services |
| [Private GPT](https://github.com/zylon-ai/private-gpt) | repository | Agents |
| [Colossal-AI](https://github.com/hpcaitech/ColossalAI) | repository | Agents |
| [CrewAI](https://github.com/crewAIInc/crewAI) | repository | Agents |
| [Local GPT](https://github.com/PromtEngineer/localGPT) | repository | Agents |
| [GPT Researcher](https://github.com/assafelovic/gpt-researcher) | repository | Agents |
| [ThinkGPT](https://github.com/jina-ai/thinkgpt) | repository | Agents |
| [RasaGPT](https://github.com/paulpierre/RasaGPT) | repository | Agents |
| [SkyAGI](https://github.com/litanlitudan/skyagi) | repository | Agents |
| [PyCodeAGI](https://github.com/chakkaradeep/pyCodeAGI) | repository | Agents |
| [SuperAgent](https://github.com/superagent-ai/superagent) | repository | Agents |
| [Voyager](https://github.com/MineDojo/Voyager) | repository | Agents |
| [ix](https://github.com/kreneskyp/ix) | repository | Agents |
| [DuetGPT](https://github.com/kristoferlund/duet-gpt) | repository | Agents |
| [Multi-Modal LangChain agents in Production](https://github.com/steamship-core/langchain-production-starter) | repository | Agents |
| [DemoGPT](https://github.com/melih-unsal/DemoGPT) | repository | Agents |
| [SuperAGI](https://github.com/TransformerOptimus/SuperAGI) | repository | Agents |
| [Autonomous HR Chatbot](https://github.com/stepanogil/autonomous-hr-chatbot) | repository | Agents |
| [BlockAGI](https://github.com/orgexyz/BlockAGI) | repository | Agents |
| [AI](https://github.com/vercel/ai) | repository | Templates |
| [create-t3-turbo-ai](https://github.com/zckly/create-t3-turbo-ai) | repository | Templates |
| [Streamlit Template](https://github.com/hwchase17/langchain-streamlit-template) | repository | Templates |
| [Codespaces Template](https://github.com/lostintangent/codespaces-langchain) | repository | Templates |
| [Gradio Template](https://github.com/hwchase17/langchain-gradio-template) | repository | Templates |
| [AI Getting Started](https://github.com/a16z-infra/ai-getting-started) | repository | Templates |
| [Quivr](https://github.com/QuivrHQ/quivr) | repository | Knowledge Management |
| [DocsGPT](https://github.com/arc53/docsgpt) | repository | Knowledge Management |
| [Chaindesk](https://github.com/gmpetrov/databerry) | repository | Knowledge Management |
| [Anything LLM](https://github.com/Mintplex-Labs/anything-llm) | repository | Knowledge Management |
| [DocNavigator](https://github.com/vgulerianb/DocNavigator) | repository | Knowledge Management |
| [ChatFiles](https://github.com/guangzhengli/ChatFiles) | repository | Knowledge Management |
| [DataChad](https://github.com/gustavz/DataChad) | repository | Knowledge Management |
| [Second Brain AI Agent](https://github.com/flepied/second-brain-agent) | repository | Knowledge Management |
| [examor](https://github.com/codeacme17/examor) | repository | Knowledge Management |
| [Repochat](https://github.com/pnkvalavala/repochat) | repository | Knowledge Management |
| [SolidGPT](https://github.com/AI-Citizen/SolidGPT) | repository | Knowledge Management |
| [Minima](https://github.com/dmayboroda/minima) | repository | Knowledge Management |
| [AudioGPT](https://github.com/AIGC-Audio/AudioGPT) | repository | Other / Chatbots |
| [Paper QA](https://github.com/Future-House/paper-qa) | repository | Other / Chatbots |
| [Chat Langchain](https://github.com/langchain-ai/chat-langchain) | repository | Other / Chatbots |
| [Langchain Chat](https://github.com/zahidkhawaja/langchain-chat-nextjs) | repository | Other / Chatbots |
| [Book GPT](https://github.com/fraserxu/book-gpt) | repository | Other / Chatbots |
| [Doc Search](https://github.com/namuan/dr-doc-search) | repository | Other / Chatbots |
| [Fact Checker](https://github.com/jagilley/fact-checker) | repository | Other / Chatbots |
| [MM ReAct](https://github.com/microsoft/MM-REACT) | repository | Other / Chatbots |
| [QABot](https://github.com/hardbyte/qabot) | repository | Other / Chatbots |
| [FlowGPT](https://github.com/nilooy/flowgpt) | repository | Other / Chatbots |
| [Langchain Chat Websocket](https://github.com/pors/langchain-chat-websockets) | repository | Other / Chatbots |
| [langchain_yt_tools](https://github.com/venuv/langchain_yt_tools) | repository | Other / Chatbots |
| [ThoughtSource⚡](https://github.com/OpenBioLink/ThoughtSource) | repository | Other / Chatbots |
| [Chat Math Techniques](https://huggingface.co/spaces/JavaFXpert/gpt-math-techniques) | repository | Other / Chatbots |
| [Notion QA](https://github.com/hwchase17/notion-qa) | repository | Other / Chatbots |
| [QNimGPT](https://huggingface.co/spaces/rituthombre/QNim) | repository | Other / Chatbots |
| [Entaoai](https://github.com/akshata29/entaoai) | repository | Other / Chatbots |
| [Chat with Scanned Documents](https://github.com/tony-xlh/Chat-with-Scanned-Documents) | repository | Other / Chatbots |
| [snowChat ❄️](https://github.com/kaarthik108/snowChat) | repository | Other / Chatbots |
| [TutorGPT](https://github.com/plastic-labs/tutor-gpt) | repository | Other / Chatbots |
| [Cheshire Cat](https://github.com/cheshire-cat-ai/core) | repository | Other / Chatbots |
| [CSV-AI 🧠](https://python.langchain.com/en/latest/modules/indexes/document_loaders/examples/snowflake.html) | first-party | Other / Chatbots |
| [MindGeniusAI](https://github.com/xianjianlf2/MindGeniusAI) | repository | Other / Chatbots |
| [Robby-Chatbot](https://github.com/yvann-ba/Robby-chatbot) | repository | Other / Chatbots |
| [AI Chatbot](https://github.com/vercel/chatbot) | repository | Other / Chatbots |
| [GPT Migrate](https://github.com/joshpxyne/gpt-migrate) | repository | Other / Chatbots |
| [Code Interpreter API](https://github.com/shroominic/codeinterpreter-api) | repository | Other / Chatbots |
| [LobeHub](https://github.com/lobehub/lobehub) | repository | Other / Chatbots |
| [Funcchain](https://github.com/shroominic/funcchain) | repository | Other / Chatbots |
| [PersonalityChatbot](https://github.com/minhbtrc/langchain-chatbot) | repository | Other / Chatbots |
| [XAgent](https://github.com/OpenBMB/XAgent) | repository | Other / Chatbots |
| [MemFree](https://github.com/memfreeme/memfree) | repository | Other / Chatbots |
| [Langchain Tutorials](https://github.com/gkamradt/langchain-tutorials) | repository | Notebooks |
| [LangChain Chinese Getting Started Guide](https://github.com/liaokongVFX/LangChain-Chinese-Getting-Started-Guide) | repository | Notebooks |
| [Flan5 LLM](https://colab.research.google.com/drive/1AVh9dOsG9DKzfK7gOFrJuitPIcLPqlbO) | relay | Notebooks |
| [LangChain Handbook](https://github.com/pinecone-io/examples) | repository | Notebooks |
| [Query the YouTube video transcripts](https://colab.research.google.com/drive/1sKSTjt9cPstl_WMZ86JsgEqFG-aSAwkn) | relay | Notebooks |
| [llm-lobbyist](https://github.com/JohnNay/llm-lobbyist) | repository | Notebooks |
| [Langchain Semantic Search](https://github.com/venuv/langchain_semantic_search) | repository | Notebooks |
| [GPT Political Compass](https://colab.research.google.com/drive/1xt2IsFPGYMEQdoJFNgWNAjWGxa60VXdV) | relay | Notebooks |
| [TextWorld ReAct Agent](https://colab.research.google.com/drive/19WTIWC3prw5LDMHmRMvqNV2loD9FHls6) | relay | Notebooks |
| [LangChain <> Wolfram Alpha](https://colab.research.google.com/drive/1AAyEdTz-Z6ShKvewbt1ZHUICqak0MiwR) | relay | Notebooks |
| [BYO Knowledge Graph](https://github.com/prof-frink-lab/slangchain) | repository | Notebooks |
| [Large Language Models Course](https://github.com/peremartra/Large-Language-Model-Notebooks-Course) | repository | Notebooks |
| [Learn LangChain (JS)](https://github.com/iparesh18/Learn-LangChain) | repository | Notebooks |
| [LangChain Series by Sam Witteveen](https://youtube.com/watch) | relay | Videos Playlists |
| [LangChain Tutorials Playlist](https://youtube.com/playlist) | relay | Videos Playlists |
| [Transformers Agents](https://huggingface.co/docs/transformers/transformers_agents) | primary | Other LLM Frameworks |
| [LlamaIndex](https://github.com/run-llama/llama_index) | repository | Other LLM Frameworks |
| [Botpress](https://github.com/botpress/botpress) | repository | Other LLM Frameworks |
| [Haystack](https://github.com/deepset-ai/haystack) | repository | Other LLM Frameworks |
| [Semantic Kernel](https://github.com/microsoft/semantic-kernel) | repository | Other LLM Frameworks |
| [Promptify](https://github.com/promptslab/Promptify) | repository | Other LLM Frameworks |
| [PromptSource](https://github.com/bigscience-workshop/promptsource) | repository | Other LLM Frameworks |
| [AGiXT](https://github.com/Josh-XT/AGiXT) | repository | Other LLM Frameworks |
| [LLM Agents](https://github.com/mpaepper/llm_agents) | repository | Other LLM Frameworks |
| [MiniChain](https://github.com/srush/MiniChain) | repository | Other LLM Frameworks |
| [Griptape](https://github.com/griptape-ai/griptape) | repository | Other LLM Frameworks |
| [llm-chain](https://github.com/sobelio/llm-chain) | repository | Other LLM Frameworks |
| [OpenLM](https://github.com/r2d4/openlm) | repository | Other LLM Frameworks |
| [Dust](https://github.com/dust-tt/dust) | repository | Other LLM Frameworks |
| [e2b](https://github.com/e2b-dev/e2b) | repository | Other LLM Frameworks |
| [SmartGPT](https://github.com/Cormanz/smartgpt) | repository | Other LLM Frameworks |
| [TermGPT](https://github.com/Sentdex/TermGPT) | repository | Other LLM Frameworks |
| [ReLLM](https://github.com/r2d4/rellm) | repository | Other LLM Frameworks |
| [OpenDAN](https://github.com/fiatrete/OpenDAN-Personal-AI-OS) | repository | Other LLM Frameworks |
| [OpenLLM](https://github.com/bentoml/OpenLLM) | repository | Other LLM Frameworks |
| [FlagAI](https://github.com/FlagAI-Open/FlagAI) | repository | Other LLM Frameworks |
| [AI.JSX](https://github.com/fixie-ai/ai-jsx) | repository | Other LLM Frameworks |
| [MetaGPT](https://github.com/FoundationAgents/MetaGPT) | repository | Other LLM Frameworks |
| [Hyv](https://github.com/blib-la/hyv) | repository | Other LLM Frameworks |
| [Autochain](https://github.com/Forethought-Technologies/AutoChain) | repository | Other LLM Frameworks |
| [Marvin](https://github.com/PrefectHQ/marvin) | repository | Other LLM Frameworks |
| [LLMFlow](https://github.com/stoyan-stoyanov/llmflows) | repository | Other LLM Frameworks |
| [Axflow](https://github.com/axflow/axflow) | repository | Other LLM Frameworks |
| [TextAI](https://github.com/neuml/txtai) | repository | Other LLM Frameworks |
| [AgentFlow](https://github.com/simonmesmith/agentflow) | repository | Other LLM Frameworks |
| [SimpleAIChat](https://github.com/minimaxir/simpleaichat) | repository | Other LLM Frameworks |
| [LLFn](https://github.com/orgexyz/LLFn) | repository | Other LLM Frameworks |
| [LLMStack](https://github.com/trypromptly/LLMStack) | repository | Other LLM Frameworks |
| [Lagent](https://github.com/InternLM/lagent) | repository | Other LLM Frameworks |
| [Embedbase](https://github.com/different-ai/embedbase) | repository | Other LLM Frameworks |
| [Rivet](https://github.com/Ironclad/rivet) | repository | Other LLM Frameworks |
| [RestGPT](https://github.com/Yifan-Song793/RestGPT) | repository | Other LLM Frameworks |
| [Magentic](https://github.com/jackmpcollins/magentic) | repository | Other LLM Frameworks |
| [Autogen](https://github.com/microsoft/autogen) | repository | Other LLM Frameworks |
| [AgentVerse](https://github.com/openbmb/agentverse) | repository | Other LLM Frameworks |
| [Agentlabs](https://github.com/agentlabs-dev/agentlabs) | repository | Other LLM Frameworks |
| [bondai](https://github.com/krohling/bondai) | repository | Other LLM Frameworks |
| [Langroid](https://github.com/langroid/langroid) | repository | Other LLM Frameworks |
| [Langstream](https://github.com/rogeriochaves/langstream) | repository | Other LLM Frameworks |
| [Agency](https://github.com/neurocult/agency) | repository | Other LLM Frameworks |
| [OpenAgent](https://github.com/the-open-agent/openagent) | repository | Other LLM Frameworks |
| [Fructose](https://github.com/bananaml/fructose) | repository | Other LLM Frameworks |
| [R2R](https://github.com/SciPhi-AI/R2R) | repository | Other LLM Frameworks |
| [uAgents](https://github.com/fetchai/uAgents) | repository | Other LLM Frameworks |
| [Codel](https://github.com/semanser/codel) | repository | Other LLM Frameworks |
| [Plandex](https://github.com/plandex-ai/plandex) | repository | Other LLM Frameworks |
| [Maestro](https://github.com/Doriandarko/maestro) | repository | Other LLM Frameworks |
| [GPT Pilot](https://github.com/Pythagora-io/gpt-pilot) | repository | Other LLM Frameworks |
| [SWE Agent](https://github.com/SWE-agent/SWE-agent) | repository | Other LLM Frameworks |
| [Gateway](https://github.com/Portkey-AI/gateway) | repository | Other LLM Frameworks |
| [AgentRun](https://github.com/tjmlabs/AgentRun) | repository | Other LLM Frameworks |
| [LLama Cpp Agent](https://github.com/Maximilian-Winter/llama-cpp-agent) | repository | Other LLM Frameworks |
| [FinRobot](https://github.com/AI4Finance-Foundation/FinRobot) | repository | Other LLM Frameworks |
| [Groq Ruby](https://github.com/drnic/groq-ruby) | repository | Other LLM Frameworks |
| [AgentScope](https://github.com/agentscope-ai/agentscope) | repository | Other LLM Frameworks |
| [Memary](https://github.com/kingjulio8238/memary) | repository | Other LLM Frameworks |
| [Llmware](https://github.com/llmware-ai/llmware) | repository | Other LLM Frameworks |
| [Pipecat](https://github.com/pipecat-ai/pipecat) | repository | Other LLM Frameworks |
| [Agno](https://github.com/agno-agi/agno) | repository | Other LLM Frameworks |
| [Rigging](https://github.com/dreadnode/rigging) | repository | Other LLM Frameworks |
| [Vision agent](https://github.com/landing-ai/vision-agent) | repository | Other LLM Frameworks |
| [llama-agents](https://github.com/run-llama/llama-agents) | repository | Other LLM Frameworks |
| [Claude Engineer](https://github.com/Doriandarko/claude-engineer) | repository | Other LLM Frameworks |
| [AI Scientist](https://github.com/SakanaAI/AI-Scientist) | repository | Other LLM Frameworks |
| [DSPy](https://github.com/stanfordnlp/dspy) | repository | Other LLM Frameworks |
| [Eino](https://github.com/cloudwego/eino) | repository | Other LLM Frameworks |
| [Bifrost](https://github.com/maximhq/bifrost) | repository | Other LLM Frameworks |
| [Mastra AI](https://github.com/mastra-ai/mastra) | repository | Other LLM Frameworks |
| [Open LLMs](https://github.com/eugeneyan/open-llms) | repository | Complement to this list |
| [Awesome LLM](https://github.com/Hannibal046/Awesome-LLM) | repository | Complement to this list |
| [LLaMA Cult and More](https://github.com/shm007g/LLaMA-Cult-and-More) | repository | Complement to this list |
| [Awesome Language Agents](https://github.com/ysymyth/awesome-language-agents) | repository | Complement to this list |

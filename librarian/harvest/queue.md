---
kind: harvest-queue
created: 2026-08-28
updated: 2026-08-28
entries: 177
statuses: queued
---

# The harvest queue

Read [`index.md`](index.md) first: the contract, the statuses, the dedupe rule.
`pri` is the founding grade (1 = consume first); the live scan decides what actually
gets batched. `class` uses the intake source-class taxonomy
([`source-classes.md`](../../.claude/skills/intake/references/source-classes.md));
`yield` is the honest expectation - `content` (new techniques), `currency` (updates
existing claims), `lead` (watch, return later).

## software-engineering / llm-agent + AI-native (39)

| id | pri | source | type | class | target | why it is here | yield | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SEA-001 | 1 | https://github.com/nibzard/awesome-agentic-patterns | reference-repo | paper aggregator | llm-agent/* | 150+ curated production agent patterns across orchestration, security, evals, UX; 4.6k stars, active | content | queued |
| SEA-002 | 1 | https://github.com/humanlayer/12-factor-agents | reference-repo | first-party practitioner account | llm-agent/orchestration + companion | 25.5k stars; THE production-reliability principles doc for agent builders, incl. human-in-loop | content | queued |
| SEA-003 | 1 | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | article | first-party practitioner account | llm-agent/prompt-and-context (also: knowledge-ops) | canonical first-party context-engineering doctrine from Claude Code's builders | content | queued |
| SEA-004 | 1 | https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus | article | first-party practitioner account | llm-agent/prompt-and-context | KV-cache, file-as-context, recitation lessons; most-cited practitioner context-engineering writeup | content | queued |
| SEA-005 | 1 | https://cognition.com/blog/dont-build-multi-agents | article | first-party practitioner account | llm-agent/orchestration | Devin team's contrarian single-thread context doctrine; one pole of the architecture debate | content | queued |
| SEA-006 | 1 | https://claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them | article | first-party practitioner account | llm-agent/orchestration | Anthropic's multi-agent research lessons - the opposing pole, orchestrator-worker patterns | content | queued |
| SEA-007 | 1 | https://github.com/Meirtz/Awesome-Context-Engineering | reference-repo | paper aggregator | llm-agent/prompt-and-context | 300+ papers with formal taxonomy, tied to arXiv 2507.13334 survey | content | queued |
| SEA-008 | 1 | https://github.com/anthropics/skills | reference-repo | vendor repository | skills/plugin ecosystems | first-party canonical Agent Skills artifacts - the reference format for coding-agent skills | content | queued |
| SEA-009 | 1 | https://github.com/obra/superpowers | code-repo | first-party practitioner account | skills/plugin ecosystems + agentic methodology | Jesse Vincent's skills framework + TDD/planning methodology; most influential community skills system | content | queued |
| SEA-010 | 1 | https://github.com/github/spec-kit | code-repo | vendor repository | spec-driven development | GitHub's official spec-driven development toolkit (specify/plan/tasks workflow) | content | queued |
| SEA-011 | 1 | https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools | reference-repo | app/tutorial aggregator | llm-agent/prompt-and-context (prompt artifacts) | ~134k-star corpus of real system prompts/tool defs from 28+ production coding agents | content | queued |
| SEA-012 | 1 | https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/ | article | first-party practitioner account | security (agent security) | defining threat-model framing for agent prompt-injection risk; universally cited | content | queued |
| SEA-013 | 1 | https://arxiv.org/abs/2503.18813 | paper | research-model release | security (agent security) | CaMeL (DeepMind): defeating prompt injection by design via capability-based dataflow | content | queued |
| SEA-014 | 1 | https://github.com/SWE-agent/mini-swe-agent | code-repo | vendor repository | llm-agent/orchestration + runtime-and-io | 100-line agent scoring >74% SWE-bench Verified; distills the minimal agent loop | content | queued |
| SEA-015 | 1 | https://github.com/laude-institute/terminal-bench | code-repo | vendor repository | llm-agent/evaluation-and-cost | the frontier terminal-agent benchmark (Terminal-Bench 2.0 + Harbor) | content | queued |
| SEA-016 | 1 | https://github.com/princeton-pli/hal-harness | code-repo | vendor repository | llm-agent/evaluation-and-cost | Princeton HAL: cost-aware agent leaderboard harness (arXiv 2510.11977, ICLR 2026) | content | queued |
| SEA-017 | 1 | https://github.com/UKGovernmentBEIS/inspect_ai | code-repo | vendor repository | llm-agent/evaluation-and-cost (also: llm-observability/quality-scoring) | UK AISI's eval framework; gold-standard agent eval infra (sandboxing, scorers, logs) | content | queued |
| SEA-018 | 1 | https://github.com/sierra-research/tau2-bench | code-repo | research-model release | llm-agent/evaluation-and-cost | tau2-bench: canonical tool-agent-user interaction benchmark with simulated users | content | queued |
| SEA-019 | 2 | https://github.com/SWE-bench/SWE-bench | code-repo | research-model release | llm-agent/evaluation-and-cost | the seminal coding-agent benchmark; harness + Verified subset methodology | currency | queued |
| SEA-020 | 1 | https://www.anthropic.com/engineering/code-execution-with-mcp | article | first-party practitioner account | llm-agent/runtime-and-io | code-execution-over-MCP pattern; reshaped tool-use token economics | content | queued |
| SEA-021 | 2 | https://github.com/zed-industries/agent-client-protocol | code-repo | vendor repository | llm-agent/runtime-and-io (transport) | ACP: the editor-agent protocol standard (Zed); JSON-RPC session/streaming design | content | queued |
| SEA-022 | 2 | https://github.com/ag-ui-protocol/ag-ui | code-repo | vendor repository | llm-agent/companion + runtime-and-io | AG-UI: agent-user interaction event protocol; the human-in-loop transport standard | content | queued |
| SEA-023 | 2 | https://github.com/e2b-dev/infra | code-repo | vendor repository | llm-agent/runtime-and-io (sandboxing) | production Firecracker microVM sandbox infra powering E2B; teaches agent isolation architecture | content | queued |
| SEA-024 | 1 | https://github.com/getzep/graphiti | code-repo | vendor repository | llm-agent/prompt-and-context (memory) | temporal knowledge-graph memory (14k+ stars); the reference graph-memory implementation | content | queued |
| SEA-025 | 2 | https://github.com/NirDiamant/Agent_Memory_Techniques | reference-repo | app/tutorial aggregator | llm-agent/prompt-and-context (memory) | 30 runnable notebooks: buffers -> MemGPT/Letta/Zep/Graphiti + LoCoMo benchmarks | content | queued |
| SEA-026 | 2 | https://www.letta.com/blog/benchmarking-ai-agent-memory/ | article | first-party practitioner account | llm-agent/prompt-and-context (memory) + evaluation | MemGPT team empirically benchmarks memory designs ("is a filesystem all you need?") | currency | queued |
| SEA-027 | 2 | https://github.com/stanfordnlp/dspy | code-repo | vendor repository | llm-agent/prompt-and-context (optimization) | THE framework for programmatic prompt/pipeline optimization; declarative signatures + optimizers | content | queued |
| SEA-028 | 2 | https://github.com/gepa-ai/gepa | code-repo | research-model release | llm-agent/prompt-and-context + evaluation | GEPA reflective prompt evolution (arXiv 2507.19457); outperforms RL for agent optimization | content | queued |
| SEA-029 | 2 | https://github.com/openai/openai-agents-python | code-repo | vendor repository | llm-agent/orchestration | OpenAI's minimal multi-agent SDK; handoffs/guardrails/sessions primitives, excellent docs | content | queued |
| SEA-030 | 2 | https://github.com/pydantic/pydantic-ai | code-repo | vendor repository | llm-agent/orchestration + runtime-and-io | type-safe agent framework with durable execution (Temporal), tool validation patterns | content | queued |
| SEA-031 | 2 | https://github.com/NVIDIA-NeMo/Guardrails | code-repo | vendor repository | security (agent security) | the reference programmable-guardrails toolkit (Colang rails, jailbreak/injection checks) | content | queued |
| SEA-032 | 2 | https://github.blog/security/vulnerability-research/safeguarding-vs-code-against-prompt-injections/ | article | first-party practitioner account | security (agent security) | GitHub security team's real vuln-research on hardening a shipping coding agent | content | queued |
| SEA-033 | 2 | https://github.com/anthropics/claude-cookbooks | code-repo | vendor repository | llm-agent/orchestration + prompt-and-context | first-party runnable agent patterns (workflows, orchestrator-worker, evaluator-optimizer, Agent SDK) | currency | queued |
| SEA-034 | 2 | https://github.com/bmad-code-org/bmad-method | code-repo | practitioner build-walkthrough | spec-driven / agentic methodology | BMAD: dominant agentic-agile methodology (agent roles, quality gates, workflows) | content | queued |
| SEA-035 | 2 | https://github.com/Gloriaameng/Awesome-Agent-Harness | reference-repo | paper aggregator | llm-agent/runtime-and-io + orchestration | harness-engineering survey: 110+ papers, 23 systems, completeness matrix | content | queued |
| SEA-036 | 2 | https://github.com/huggingface/smolagents | code-repo | vendor repository | llm-agent/orchestration + runtime-and-io | canonical code-acting-agent paradigm (agents that think in code), sandboxed executors | content | queued |
| SEA-037 | 3 | https://github.com/wshobson/agents | code-repo | app/tutorial aggregator | llm-agent/orchestration (subagent fan-out) | largest production-grade Claude Code subagent/orchestration collection | lead | queued |
| SEA-038 | 3 | https://github.com/dloss/awesome-agent-sandboxes | awesome-list | app/tutorial aggregator | llm-agent/runtime-and-io (sandboxing) | curated map of agent code-execution sandbox solutions (gVisor/Firecracker/microVM landscape) | lead | queued |
| SEA-039 | 3 | https://github.com/anthropics/claude-plugins-official | reference-repo | vendor repository | skills/plugin ecosystems | Anthropic-managed directory of vetted Claude Code plugins; ecosystem ground truth | lead | queued |

## software-engineering / core (28)

| id | pri | source | type | class | target | why it is here | yield | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SEC-001 | 1 | https://github.com/donnemartin/system-design-primer | reference-repo | app/tutorial aggregator | backend-platform (system design) | canonical large-scale design primer; 300k-class repo staff engineers cite by default | content | queued |
| SEC-002 | 1 | https://sre.google/books/ | book | first-party practitioner account | operations + backend-platform (SRE, SLOs, incidents) | Google SRE book + Workbook, free full text; defines the discipline | content | queued |
| SEC-003 | 1 | https://learn.microsoft.com/en-us/azure/architecture/patterns/ | docs | vendor repository | backend-platform/resilience (pattern catalog) | definitive named-pattern catalog (retry, bulkhead, outbox, saga) with tradeoff analysis | content | queued |
| SEC-004 | 1 | https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter | article | first-party practitioner account | backend-platform/resilience | Amazon Builders' Library entry point; principal-engineer accounts of production failure modes | content | queued |
| SEC-005 | 1 | https://github.com/OWASP/CheatSheetSeries | reference-repo | vendor repository | security (input validation, SSRF, authn/z, secrets) | the industry-standard appsec cheat sheet corpus, actively maintained, per-topic depth | content | queued |
| SEC-006 | 1 | https://github.com/google/eng-practices | reference-repo | first-party practitioner account | engineering-process (code review, CL standards) | Google's actual internal review standards; the quality-gate reference | content | queued |
| SEC-007 | 1 | https://github.com/alan2207/bulletproof-react | reference-repo | practitioner build-walkthrough | client-architecture (React structure, state, API layer) | 35k-star production React architecture guide: structure, state, testing, security | content | queued |
| SEC-008 | 1 | https://github.com/standard-webhooks/standard-webhooks | reference-repo | vendor repository | integration (webhooks: spec, signing, retries) | spec + multi-language reference impls; steered by Zapier/Twilio/Svix, adopted by OpenAI/Anthropic | content | queued |
| SEC-009 | 1 | https://github.com/mercari/production-readiness-checklist | reference-repo | first-party practitioner account | operations + backend-platform (readiness gates) | Mercari's real internal design/pre-production checklists, published as reference | content | queued |
| SEC-010 | 1 | https://github.com/PagerDuty/incident-response-docs | reference-repo | first-party practitioner account | operations (incident response, on-call, roles) | PagerDuty's open-sourced internal IR process; the standard IR playbook | content | queued |
| SEC-011 | 1 | https://www.w3.org/WAI/ARIA/apg/ | docs | vendor repository | ui-surfaces (accessibility interaction patterns) | W3C ARIA Authoring Practices: normative widget patterns with keyboard/ARIA semantics | content | queued |
| SEC-012 | 1 | https://dora.dev/resources/ | docs | first-party practitioner account | engineering-assessment (DORA metrics, capabilities) | DORA's own research hub: four keys definitions, capability catalog, reports | content | queued |
| SEC-013 | 2 | https://github.com/binhnguyennus/awesome-scalability | awesome-list | app/tutorial aggregator | backend-platform (scalability, stability) | 70k-star curated index of primary-source engineering posts from Netflix/Uber/Google | lead | queued |
| SEC-014 | 2 | https://abseil.io/resources/swe-book | book | first-party practitioner account | engineering-process/codebase-stewardship | "Software Engineering at Google" full text free; time/scale/tradeoffs canon | content | queued |
| SEC-015 | 2 | https://github.com/zalando/restful-api-guidelines | reference-repo | first-party practitioner account | integration (REST API and event design standards) | most-adopted corporate API guideline set; MUST/SHOULD rules agents can enforce | content | queued |
| SEC-016 | 2 | https://github.com/temporalio/temporal | code-repo | vendor repository | backend-platform/work-execution (durable workflows) | durable-execution reference implementation; architecture docs teach reliable job orchestration | content | queued |
| SEC-017 | 2 | https://github.com/open-telemetry/opentelemetry-specification | reference-repo | vendor repository | backend-platform/platform-observability | normative spec for traces/metrics/logs; the observability vocabulary standard | content | queued |
| SEC-018 | 2 | https://github.com/slsa-framework/slsa | reference-repo | vendor repository | security (supply chain integrity levels) | OpenSSF SLSA spec: provenance, build integrity levels; supply-chain canon | content | queued |
| SEC-019 | 2 | https://github.com/openfga/openfga | code-repo | vendor repository | security (relationship-based authorization) | CNCF Zanzibar implementation; modeling docs teach fine-grained authz design | content | queued |
| SEC-020 | 2 | https://github.com/tanstack/query | code-repo | vendor repository | client-architecture (server-state, caching, offline mutations) | defines modern async/server-state management; docs are the state-architecture reference | content | queued |
| SEC-021 | 2 | https://github.com/shadcn-ui/ui | code-repo | vendor repository | ui-surfaces (design system, data display, input) | de facto component distribution standard; accessible Radix-based patterns in copyable source | content | queued |
| SEC-022 | 2 | https://use-the-index-luke.com/ | book | first-party practitioner account | backend-platform/data-layer (SQL indexing, tuning) | Winand's free indexing book; the SQL performance reference across engines | content | queued |
| SEC-023 | 2 | https://brandur.org/idempotency-keys | article | first-party practitioner account | integration + data-layer (idempotency, transaction safety) | canonical Stripe-style idempotency-key implementation writeup with Postgres transaction mechanics | content | queued |
| SEC-024 | 2 | https://github.com/danluu/post-mortems | reference-repo | app/tutorial aggregator | operations (postmortem corpus) | the standard curated collection of real public outage postmortems | lead | queued |
| SEC-025 | 3 | https://www.inkandswitch.com/essay/local-first/ | paper | first-party practitioner account | client-architecture (offline, local-first, CRDTs) | Kleppmann/Ink & Switch essay that defined local-first software principles | content | queued |
| SEC-026 | 3 | https://github.com/excalidraw/excalidraw | code-repo | vendor repository | client-architecture + ui-surfaces (local-first canvas app) | production TypeScript/React codebase teaching offline persistence, collab sync, component architecture | content | queued |
| SEC-027 | 3 | https://minimumcd.org/ | docs | first-party practitioner account | engineering-process/continuous-integration | practitioner-signed minimum viable continuous delivery definition; concise CD standard | content | queued |
| SEC-028 | 3 | https://www.microsoft.com/en-us/research/publication/the-space-of-developer-productivity-theres-more-to-it-than-you-think/ | paper | paper aggregator | engineering-assessment (beyond DORA) | SPACE framework paper (Forsgren et al.); the maturity-measurement complement to DORA | content | queued |

## llm-observability (14)

| id | pri | source | type | class | target | why it is here | yield | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OBS-001 | 1 | https://github.com/open-telemetry/semantic-conventions-genai | spec | vendor repository | telemetry-and-data (gen_ai semconv) | official OTel GenAI semantic conventions; the interop standard every tracer converges on | content | mined: 0c/1cur/2L/2cat |
| OBS-002 | 1 | https://github.com/Arize-ai/openinference | spec | vendor repository | telemetry-and-data (trace conventions) | the other de-facto trace spec (Phoenix-compatible); defines span kinds for LLM/agent calls | content | mined: 3c/0cur/1L/2cat |
| OBS-003 | 1 | https://github.com/traceloop/openllmetry | code-repo | vendor repository | telemetry-and-data (auto-instrumentation) | reference OTel instrumentation for dozens of providers; issues track semconv migration in real time | content | queued |
| OBS-004 | 2 | https://github.com/openlit/openlit | code-repo | vendor repository | telemetry-and-data + federation-and-surfaces | OTel-native full platform (traces, GPU, guardrails, dashboards); production-grade docs | content | queued |
| OBS-005 | 1 | https://github.com/pydantic/genai-prices | reference-repo | vendor repository | economics-and-governance (price book) | Pydantic-maintained price DB, 35+ providers, historic + tiered pricing, schema'd JSON | currency | mined: 0c/0cur/1L/5cat |
| OBS-006 | 2 | https://github.com/Helicone/helicone | code-repo | vendor repository | economics-and-governance (cost attribution) | open-source gateway/observability with mature per-request cost tracking cookbook | content | queued |
| OBS-007 | 2 | https://github.com/envoyproxy/ai-gateway | code-repo | vendor repository | economics-and-governance (token rate limiting) | CNCF Envoy project; shipped token_ratelimit - canonical infra answer to usage governance | content | queued |
| OBS-008 | 1 | https://arxiv.org/abs/2306.05685 | paper | research-model release | quality-scoring (LLM-as-judge foundations) | the founding LLM-as-judge paper (Zheng et al., NeurIPS); MT-Bench, agreement, biases | content | mined: 2c/0cur/0L/3cat |
| OBS-009 | 1 | https://arxiv.org/abs/2404.12272 | paper | research-model release | quality-scoring (judge-human alignment) | "Who Validates the Validators?" (EvalGen, UIST); names criteria drift - core to judging live traces | content | queued |
| OBS-010 | 1 | https://eugeneyan.com/writing/llm-evaluators/ | article | first-party practitioner account | quality-scoring (evaluating the evaluators) | Eugene Yan's exhaustive, citation-dense synthesis of judge reliability tactics | content | mined: 1c/0cur/2L/5cat |
| OBS-011 | 1 | https://hamel.dev/notes/llm/evals/ | article | first-party practitioner account | quality-scoring (trace-driven eval loops) | Hamel Husain's evals notes; the most-cited practitioner playbook for trace-driven evals | content | mined: 1c/0cur/1L/2cat |
| OBS-012 | 2 | https://github.com/evidentlyai/evidently | code-repo | vendor repository | quality-scoring (drift detection) | canonical open-source drift/monitoring framework extended to LLMs | content | queued |
| OBS-013 | 2 | https://github.com/stanford-crfm/helm | code-repo | research-model release | federation-and-surfaces (benchmark publishing) | Stanford CRFM's transparent, reproducible benchmark framework; the model for sharing eval results | content | queued |
| OBS-014 | 3 | https://github.com/QuesmaOrg/awesome-ai-tokenomics | awesome-list | app/tutorial aggregator | economics-and-governance | curated map of the tokenomics niche (costs, waste, bill-cutting); dense lead generator | lead | queued |

## recruiting (14)

| id | pri | source | type | class | target | why it is here | yield | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| REC-001 | 1 | https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XIV/part-1607 | spec | vendor repository | decision-and-fairness (UGESP 29 CFR 1607) | the primary legal text governing US selection procedures; four-fifths rule, validation duties | content | queued |
| REC-002 | 1 | https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page | docs | vendor repository | decision-and-fairness (NYC LL144 AEDT audits) | DCWP's own AEDT hub (final rules + FAQ); the operative text for AI bias audits | content | queued |
| REC-003 | 1 | https://artificialintelligenceact.eu/annex/3/ | spec | vendor repository | governance (EU AI Act Annex III employment scope) | full Annex III text (recruitment = high-risk 4(a)-(b)) on the standard AI Act explorer | content | queued |
| REC-004 | 1 | https://home.ubalt.edu/tmitch/645/session%204/Schmidt%20&%20Oh%20validity%20and%20util%20100%20yrs%20of%20research%20Wk%20PPR%202016.pdf | paper | research-model release | assessment (predictor validity) | Schmidt & Oh 2016 updating Schmidt-Hunter 1998; the validity table everyone cites | content | queued |
| REC-005 | 1 | http://www.morgeson.com/downloads/levashina_hartwell_morgeson_campion_2014.pdf | paper | research-model release | role-definition + assessment (structured interviews) | Levashina et al. 2014 (Personnel Psychology); definitive review of interview structure components | content | queued |
| REC-006 | 1 | https://arxiv.org/abs/1906.09208 | paper | research-model release | decision-and-fairness (algorithmic hiring claims) | Raghavan, Barocas, Kleinberg, Levy (FAT* 2020); the founding audit-of-claims study | content | queued |
| REC-007 | 2 | https://dl.acm.org/doi/10.1145/3442188.3445928 | paper | research-model release | decision-and-fairness (vendor audit methodology) | Wilson et al. FAccT 2021 pymetrics audit; the template for third-party hiring-algorithm audits | content | queued |
| REC-008 | 2 | https://onlinelibrary.wiley.com/doi/pdf/10.1111/j.1744-6570.2000.tb00195.x | paper | research-model release | measurement (small-N adverse impact statistics) | Morris & Lobsenz 2000; the statistical backbone for small-sample impact analysis | content | queued |
| REC-009 | 1 | https://rework.withgoogle.com/intl/en/guides/a-guide-to-structured-interviewing-for-better-hiring-practices | docs | first-party practitioner account | assessment (structured interviewing) | Google talent-science's operationalization of interview research; canonical practitioner guide | content | queued |
| REC-010 | 2 | https://handbook.gitlab.com/handbook/hiring/ | docs | first-party practitioner account | pipeline-operations + candidate-experience | GitLab's complete open hiring handbook - intake to offer, scorecards, candidate FAQ | content | queued |
| REC-011 | 2 | https://github.com/dssg/aequitas | code-repo | vendor repository | decision-and-fairness (bias-audit tooling) | DSSG's bias-audit toolkit (disparate impact, FPR/FNR by group); fits LL144-style audits | content | queued |
| REC-012 | 2 | https://www.onetcenter.org/database.html | docs | vendor repository | role-definition (occupational taxonomy) | US DOL's O*NET - the authoritative machine-readable job/skills taxonomy | currency | queued |
| REC-013 | 2 | https://www.imsglobal.org/spec/ob/v3p0 | spec | vendor repository | candidate-evidence (verifiable credentials) | Open Badges 3.0 on Verifiable Credentials; the deeper sibling to the consumed W3C VC model | content | queued |
| REC-014 | 3 | https://github.com/opencats/OpenCATS | code-repo | vendor repository | pipeline-operations (ATS data model) | the long-standing open-source ATS; real candidate/pipeline schema to mine, though aging | lead | queued |

## game-production (18)

| id | pri | source | type | class | target | why it is here | yield | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GAME-001 | 1 | https://gamebalanceconcepts.wordpress.com/2010/07/07/level-1-intro-to-game-balance/ | article | first-party practitioner account | systems-canon (balance math) | Schreiber's full 10-week balance course; the canonical free text on balance math | content | mined: 4c/3cur/1L/1cat |
| GAME-002 | 1 | https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics | talk | first-party practitioner account | balance-validation (telemetry-driven tuning) | shipped roguelike's metrics-driven card balance loop, straight from its designers | content | queued |
| GAME-003 | 1 | https://github.com/mxgmn/WaveFunctionCollapse | code-repo | research-model release | content-pipeline (procedural generation) | 25k-star canonical WFC; powers Bad North, Townscaper; links all ports | content | mined: 3c/1cur/1L/1cat |
| GAME-004 | 1 | https://www.redblobgames.com/ | reference-repo | first-party practitioner account | craft-judgment (procedural + game math) | Amit Patel's interactive tutorials; two decades of canonical game-algorithm pedagogy | content | queued |
| GAME-005 | 1 | https://github.com/CleverRaven/Cataclysm-DDA/blob/master/doc/JSON/JSON_INFO.md | docs | vendor repository | content-pipeline (data-driven content schema) | exemplary at-scale JSON content schema sustaining thousands of community contributions | content | mined: 1c+1spec/2cur/1L/1cat |
| GAME-006 | 1 | https://github.com/CoplayDev/unity-mcp | code-repo | vendor repository | engine-integration (AI editor automation) | 13.7k stars, active v10; 47 MCP tools driving Unity editor from LLMs | content | queued |
| GAME-007 | 2 | https://www.gamedeveloper.com/design/the-designer-s-notebook-machinations-a-new-way-to-design-game-mechanics | article | first-party practitioner account | systems-canon (economy modeling) | Dormans' Machinations diagrams: the standard formalism for simulating internal economies | content | mined: 0c/0cur/1L/1cat |
| GAME-008 | 2 | https://www.pcgbook.com/ | reference-repo | paper aggregator | content-pipeline (procedural generation theory) | Togelius/Shaker/Nelson PCG textbook, free online; the academic canon | content | queued |
| GAME-009 | 2 | https://gdcvault.com/play/1023349/A-Course-About-Game | talk | first-party practitioner account | systems-canon (balance curves) | Schreiber's GDC distillation of balance curves, cost curves, transitive systems | content | queued |
| GAME-010 | 2 | https://gdcvault.com/browse/gdc-19/play/1026365 | talk | first-party practitioner account | balance-validation (AI-assisted balancing) | GDC: ML balancing against overwhelming telemetry data in a live game | content | queued |
| GAME-011 | 2 | https://arxiv.org/html/2503.18748v1 | paper | paper aggregator | balance-validation (simulation-based testing) | RL agents simulate players to balance competitive levels; rigorous method | currency | mined: 0c+1spec/0cur/1L/0cat |
| GAME-012 | 2 | https://github.com/jeffcampbellmakesgames/unity-asset-validator | code-repo | vendor repository | content-pipeline (validation gates) | rule-based asset/scene validation gates in-editor and CI; acceptance-ladder exemplar | content | mined: 0c/0cur/3L/2cat |
| GAME-013 | 2 | https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1 | code-repo | research-model release | asset-production (generative 3D with PBR) | image-to-3D with production-ready PBR materials; strongest open game-asset 3D stack | content | queued |
| GAME-014 | 2 | https://www.gdcvault.com/play/1016487/Juice-It-or-Lose | talk | first-party practitioner account | craft-judgment (game feel) | the canonical juice/game-feel talk; defines what polished feedback looks like | content | queued |
| GAME-015 | 2 | https://www.gamedeveloper.com/business/the-game-outcomes-project-part-5-what-great-teams-do | article | first-party practitioner account | production-governance | 273-team survey correlating production practices with shipped-game outcomes | content | queued |
| GAME-016 | 3 | https://github.com/veloren/veloren | code-repo | vendor repository | content-pipeline (open-source game exemplar) | large open voxel RPG with mature contributor pipeline, asset conventions, CI | lead | queued |
| GAME-017 | 3 | https://github.com/godotengine/awesome-godot | awesome-list | app/tutorial aggregator | engine-integration (Godot tooling) | officially curated by Godot org; unusually high signal for plugin discovery | lead | queued |
| GAME-018 | 3 | https://github.blog/open-source/gaming/beyond-the-engine-10-open-source-projects-shaping-how-games-actually-get-made/ | article | app/tutorial aggregator | production-governance (tooling landscape) | GitHub's curated survey of production tooling repos beyond engines | lead | queued |

## media-generation (16)

| id | pri | source | type | class | target | why it is here | yield | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MED-001 | 1 | https://github.com/comfyanonymous/ComfyUI_examples | reference-repo | vendor repository | visual-generation (curated workflows) | canonical workflow set for image/video/audio/3D; metadata-embedded, drag-to-load | content | mined: 0c/1cur/3L/0cat |
| MED-002 | 1 | https://github.com/openai/openai-cookbook/blob/main/examples/multimodal/image-gen-models-prompting-guide.ipynb | docs | vendor repository | visual-generation (image prompting) | OpenAI's own image-model prompting guide; vendor-authoritative, example-dense | content | mined: 0c/5cur/1L/4cat |
| MED-003 | 1 | https://github.com/Libr-AI/OpenFactVerification | code-repo | research-model release | research-grounding (claim verification) | working pipeline: claim extraction, evidence retrieval, verdicts; deployable as library | content | queued |
| MED-004 | 1 | https://www.derek-lieu.com/essays | article | first-party practitioner account | narrative-craft (trailer structure) | working trailer editor's essay corpus; the reference on hook-first editing | content | mined: 3c/0cur/2L/1cat |
| MED-005 | 1 | https://opendoclab.mit.edu/presents/archival-producers-alliance-apa-best-practices-use-generative-ai-documentaries/ | docs | first-party practitioner account | production-ops (GenAI documentary governance) | Archival Producers Alliance standards for generative AI in documentary; field-defining | content | parked: primary PDF egress-blocked; retry fetch route |
| MED-006 | 2 | https://www.routledge.com/Documentary-Storytelling-Creative-Nonfiction-on-Screen/Bernard/p/book/9781032267296 | book | first-party practitioner account | narrative-craft (documentary structure) | Bernard's Documentary Storytelling, 5th ed.; the standard text on factual story structure | content | queued |
| MED-007 | 2 | https://github.com/Wan-Video/Wan2.2 | code-repo | research-model release | visual-generation (open video model) | leading open MoE video model; core of self-hosted documentary b-roll pipelines | content | queued |
| MED-008 | 2 | https://github.com/banodoco/Dough | code-repo | vendor repository | visual-generation (shot steering) | Banodoco's precision animation-steering tool; hub of the serious open-video practitioner community | content | queued |
| MED-009 | 2 | https://github.com/facebookresearch/audiocraft | code-repo | research-model release | audio-generation (MusicGen, EnCodec) | Meta's canonical controllable music-gen library; text and melody conditioning | content | mined: 0c+1spec/2cur/1L/2cat |
| MED-010 | 2 | https://github.com/hkchengrex/MMAudio | code-repo | research-model release | audio-generation (video-synced sound design) | CVPR 2025 video-to-audio synthesis; best open Foley-for-generated-footage option | content | mined: 2c/2cur/1L/0cat |
| MED-011 | 2 | https://www.remotion.dev/docs/the-fundamentals | docs | vendor repository | production-ops (programmatic render pipeline) | video-as-code React framework; deterministic, versionable, CI-renderable explainer production | content | queued |
| MED-012 | 2 | https://www.chatprd.ai/how-i-ai/ai-workflows-for-documentary-filmmaking | article | practitioner build-walkthrough | research-grounding + production-ops | Florentine Films (Ken Burns shop) editor's actual AI documentary workflows | content | queued |
| MED-013 | 3 | https://github.com/Comfy-Org/workflow_templates | reference-repo | vendor repository | visual-generation (template currency) | Comfy-Org's maintained template set; tracks newest model workflows as released | currency | queued |
| MED-014 | 3 | https://doc.dvc.org/user-guide | docs | vendor repository | production-ops (generated-asset versioning) | mature large-binary versioning and pipeline DAGs, transferable to generated-media repos | content | queued |
| MED-015 | 3 | https://github.com/yuxiaw/openfactcheck | code-repo | research-model release | research-grounding (factuality evaluation) | unified LLM factuality-evaluation framework complementing Loki for script checking | lead | queued |
| MED-016 | 3 | https://github.com/eduardolat/kokoro-web | code-repo | vendor repository | audio-generation (self-hosted TTS) | self-hostable OpenAI-compatible Kokoro TTS server; practical narration-ops entry point | lead | queued |

## civic-intelligence (14)

| id | pri | source | type | class | target | why it is here | yield | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CIV-001 | 1 | https://github.com/opensanctions/nomenklatura | code-repo | vendor repository | civic-graph-infrastructure (entity resolution) | OpenSanctions' production dedupe/matching framework; active, 2k+ commits, MIT | content | queued |
| CIV-002 | 1 | https://github.com/alephdata/followthemoney | code-repo | vendor repository | civic-graph-infrastructure (entity data model) | OCCRP/OpenSanctions ontology powering Aleph; de-facto standard for investigative entity graphs | content | queued |
| CIV-003 | 1 | https://github.com/HlidacStatu/Hlidac-Statu | code-repo | vendor repository | public-money (Czech state watchdog) | full production codebase of hlidacstatu.cz (contracts, tenders, political finance); Czech-specific | content | queued |
| CIV-004 | 1 | https://github.com/kokes/od | code-repo | first-party practitioner account | civic-graph-infrastructure (Czech open data pipelines) | unified parsers for IS ReD subsidies, procurement, ARES, parliament, courts; battle-tested | content | queued |
| CIV-005 | 1 | https://standard.open-contracting.org/ | spec | vendor repository | public-money (procurement data standard) | canonical OCDS documentation; the global standard for contracting data | content | queued |
| CIV-006 | 2 | https://github.com/openownership/data-standard | spec | vendor repository | public-money (beneficial ownership) | Beneficial Ownership Data Standard (BODS) source of truth from Open Ownership | content | queued |
| CIV-007 | 1 | https://github.com/mysociety/parlparse | code-repo | vendor repository | parliamentary-data (vote+debate scraping) | 20-year production scraper behind TheyWorkForYou and PublicWhip; proven data model | content | queued |
| CIV-008 | 2 | https://github.com/openstates/openstates-scrapers | code-repo | vendor repository | parliamentary-data (multi-legislature scraper architecture) | largest maintained fleet of legislative scrapers; docs at docs.openstates.org | content | queued |
| CIV-009 | 2 | https://www.popoloproject.com/specs/ | spec | vendor repository | parliamentary-data (people-orgs-memberships model) | international legislative data spec used by mySociety-class projects | content | queued |
| CIV-010 | 1 | https://www.psp.cz/sqw/hp.sqw?k=1300 | dataset | vendor repository | parliamentary-data (Czech Chamber+Senate raw exports) | official psp.cz bulk data (votes, MPs, stenos) - primary source for Czech legislative tracking | currency | queued |
| CIV-011 | 3 | https://github.com/okfde/opentender.eu | code-repo | vendor repository | public-money (EU procurement portals, DIGIWHIST) | OKF Germany code behind opentender.eu, 33-jurisdiction EU tender data incl. Czechia | lead | queued |
| CIV-012 | 1 | https://datajournalism.com/read/handbook/verification-3 | handbook | first-party practitioner account | accountability-method (OSINT verification) | Silverman-edited Verification Handbook; canonical standard for verifying digital evidence about real people | content | queued |
| CIV-013 | 2 | https://gijn.org/resource/reporters-guide-to-investigating-organized-crime/ | handbook | first-party practitioner account | accountability-method (follow-the-money) | GIJN reporter's guide incl. money-laundering chapter; field-standard investigative methodology | content | queued |
| CIV-014 | 3 | https://github.com/bellingcat/toolkit | reference-repo | vendor repository | accountability-method (OSINT tool selection) | Bellingcat's curated, maintained investigations toolkit with per-tool evaluations | lead | queued |

## grant-funding (12)

| id | pri | source | type | class | target | why it is here | yield | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GRA-001 | 1 | https://webgate.ec.europa.eu/funding-tenders-opportunities/display/OM/Help | docs | vendor repository | funding-landscape (EU Funding & Tenders Online Manual) | official EC manual for the whole 2021-27 funding lifecycle, submission to reporting | content | queued |
| GRA-002 | 1 | https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/how-to-participate/reference-documents;programCode=HORIZON | docs | vendor repository | grant-operations (Horizon legal docs incl. AGA) | hosts AGA, model grant agreements, programme guides - the authority on EU cost eligibility | content | queued |
| GRA-003 | 2 | https://data.europa.eu/data/datasets/cordish2020projects | dataset | vendor repository | matching-and-intelligence (CORDIS project data) | official bulk data on all EU-funded research projects; feeds funder-intelligence models | currency | queued |
| GRA-004 | 2 | https://kohesio.ec.europa.eu/en/services | dataset | vendor repository | funding-landscape (EU structural funds projects) | EC platform with 1.5M+ cohesion-funded projects, Czechia included; linked-data services | currency | queued |
| GRA-005 | 1 | https://tacr.gov.cz/en | docs | vendor repository | funding-landscape (Czech national R&D programmes) | official TA CR portal: SIGMA and partnership calls, ISTA submission system, applicant guidance | currency | queued |
| GRA-006 | 1 | https://data.mf.gov.cz/katalog/cs/red---dotace | dataset | vendor repository | funding-landscape (Czech subsidy register IS ReD) | Finance Ministry open data on every Czech subsidy since 1999 (ex-CEDR) | currency | queued |
| GRA-007 | 2 | https://github.com/ThreeSixtyGiving/standard | spec | vendor repository | matching-and-intelligence (open grants data standard) | 360Giving standard for publishing grant awards | content | queued |
| GRA-008 | 2 | https://github.com/HHS/simpler-grants-gov | code-repo | vendor repository | matching-and-intelligence (grant discovery platform) | US government's open-source Grants.gov rebuild; active, 3.4k commits | content | queued |
| GRA-009 | 1 | https://grants.nih.gov/grants-process/write-application | docs | vendor repository | proposal-craft (reviewer-perspective writing) | NIH's official application-writing advice, linked sample funded applications; gold standard | content | queued |
| GRA-010 | 2 | https://github.com/weecology/ogrants | reference-repo | first-party practitioner account | proposal-craft (real funded proposals corpus) | community corpus of openly shared (mostly funded) grant proposals across funders | content | queued |
| GRA-011 | 2 | https://www.naccho.org/uploads/downloadable-resources/Programs/Public-Health-Infrastructure/KelloggLogicModelGuide_161122_162808.pdf | handbook | first-party practitioner account | proposal-craft (logic models) | W.K. Kellogg Foundation Logic Model Development Guide - the canonical logic-model text | content | queued |
| GRA-012 | 2 | https://www.ecfr.gov/current/title-2/subtitle-A/chapter-II/part-200 | spec | vendor repository | grant-operations (cost principles, audit) | 2 CFR 200 Uniform Guidance, live official text - reference model for grant cost accounting | content | queued |

## localization (11)

| id | pri | source | type | class | target | why it is here | yield | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LOC-001 | 1 | https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides | style-guide | vendor repository | craft + all language families | index of Microsoft's ~100 per-language localization style guides; industry baseline | content | queued |
| LOC-002 | 1 | https://download.microsoft.com/download/7/b/5/7b57e4a1-d299-4238-9997-f3ac51d6f763/ces-cze-StyleGuide.pdf | style-guide | vendor repository | european (Czech) | full Czech guide: declension, vykani/tykani address, register rules for software UI | content | queued |
| LOC-003 | 1 | https://github.com/unicode-org/cldr | reference-repo | vendor repository | european + all locale data | Unicode's authoritative locale data: plurals, formats, casing - ground truth every i18n stack consumes | content | queued |
| LOC-004 | 2 | https://github.com/mozilla-l10n/styleguides | style-guide | first-party practitioner account | craft (tone/register per language; Czech at /cs/) | community-written per-locale style guides incl. Czech formality; teaches style-guide construction itself | content | queued |
| LOC-005 | 1 | https://github.com/w3c/jlreq | spec | vendor repository | east-asian (Japanese layout) | W3C line composition, ruby, spacing - definitive Japanese typography requirements | content | queued |
| LOC-006 | 2 | https://github.com/w3c/clreq | spec | vendor repository | east-asian (Chinese layout) | W3C Chinese layout requirements + gap analysis; canonical for hanzi typography and line-breaking | content | queued |
| LOC-007 | 1 | https://www.unicode.org/reports/tr9/ | spec | vendor repository | right-to-left (bidi) | UAX #9 Bidirectional Algorithm, rev 51 (Unicode 17.0) - the bidi ground truth | content | queued |
| LOC-008 | 2 | https://material.io/archive/guidelines/usability/bidirectionality.html | style-guide | vendor repository | right-to-left (UI mirroring) | Google's classic what-mirrors/what-doesn't RTL UI guidance for Arabic/Hebrew products | content | queued |
| LOC-009 | 2 | https://github.com/w3c/sealreq | spec | vendor repository | south-and-southeast-asian (also: w3c.github.io/ilreq for Indic) | W3C Southeast Asian + Indic layout task forces; only authoritative source for these scripts | content | queued |
| LOC-010 | 1 | https://github.com/Unbabel/COMET | code-repo | vendor repository | craft (MT/LLM translation evaluation) | the standard neural MT eval framework (WMT-winning); docs teach evaluation methodology | content | queued |
| LOC-011 | 2 | https://github.com/unicode-org/message-format-wg | spec | vendor repository | craft (grammatical message design) | MessageFormat 2.0, CLDR-approved; teaches plural/gender/agreement handling in UI strings | content | queued |

## knowledge-ops - the registry's own craft (11)

Sources for how THIS registry runs: curation, freshness, agent-consumable knowledge.
Findings here usually land in `.claude/skills/`, `docs/`, or `practices/` rather than
a bundle.

| id | pri | source | type | class | target | why it is here | yield | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| KOP-001 | 1 | https://github.com/AnswerDotAI/llms-txt | spec | vendor repository | knowledge for agent consumption (spec at llmstxt.org) | the canonical /llms.txt spec by its originators; 2.4k stars, ecosystem tooling | content | queued |
| KOP-002 | 1 | https://github.com/agentsmd/agents.md | spec | vendor repository | AGENTS.md conventions (spec at agents.md) | THE open format for agent instruction files, cross-vendor adopted (Codex, Copilot, Cursor) | content | queued |
| KOP-003 | 1 | https://diataxis.fr/ | docs | first-party practitioner account | curation pipelines / doc frameworks | the reference doc-architecture framework; adopted by Canonical, Django; author-maintained | content | queued |
| KOP-004 | 1 | https://www.trychroma.com/research/evaluating-chunking | article | first-party practitioner account | chunking research | Chroma's technical report - the most-cited empirical comparison of chunking strategies | content | queued |
| KOP-005 | 2 | https://github.com/brandonstarxel/chunking_evaluation | code-repo | vendor repository | retrieval corpora design | companion toolkit to the Chroma report; reproducible chunking benchmarks | content | queued |
| KOP-006 | 2 | https://arxiv.org/abs/2310.08560 | paper | paper aggregator | organizational memory systems | MemGPT: seminal paper on tiered memory management for LLM agents; basis of Letta | content | queued |
| KOP-007 | 2 | https://arxiv.org/abs/1902.11116 | paper | paper aggregator | claim provenance / verification | "Citation Needed" (WWW'19): taxonomy + algorithmic assessment of Wikipedia verifiability at scale | content | queued |
| KOP-008 | 2 | https://research.wikimedia.org/knowledge-integrity.html | docs | first-party practitioner account | wiki gardening at scale | Wikimedia's program page for ML-assisted editorial integrity; gateway to the research corpus | content | queued |
| KOP-009 | 2 | https://handbook.gitlab.com/handbook/about/handbook-usage/ | docs | first-party practitioner account | docs-as-code at scale / org memory | the handbook-first operating doctrine from the largest public company-scale knowledge base | content | queued |
| KOP-010 | 3 | https://www.writethedocs.org/guide/docs-as-code/ | docs | app/tutorial aggregator | docs-as-code methodology | community-canonical definition of docs-as-code, with a decade of practitioner talks indexed | content | queued |
| KOP-011 | 3 | https://github.com/sindresorhus/awesome/blob/main/awesome.md | reference-repo | first-party practitioner account | curation-of-curated-lists methodology | the "awesome manifesto": the de facto quality bar and review criteria for curated source lists | content | queued |

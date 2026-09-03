# Software engineering - the subjects this registry carries

`software-engineering` - 191 subjects, 1379 techniques, 786 applications.
Slugs only; resolve one through `index.json` as the access rule beside this file describes.

### ui-surfaces
- **data-display** - canvas-graph, data-viz, diff-comparison, feed, file-browsing, search, table
- **feedback-and-style** - accessibility, adaptive-fidelity-tiers, async-ui-states, design-tokens, motion, status-vocabulary, toasts-notifications
- **input-and-editing** - batch-undo-commit-window, draft-editing, drag-drop, form, schema-driven-ui, ui-controls, undo-history, wizard-flows
- **published-surfaces** - authoring-block-vocabulary, docs-content-model, lazy-section-addressability, long-form-reading-surface, public-claim-provenance
- **shell-and-navigation** - app-shell, chat-transcript, guided-tours, media-playback, modal-stack, session-resume

### client-architecture
- client-fetch-cache, client-state, demo-data-plane, hash-pinned-translation-pipeline, i18n, ipc-contract, native-shell-integration, realtime-events

### llm-agent
- **companion** - companion-identity, companion-runtime, conversation-orchestration
- **evaluation-and-cost** - cost-metering, eval-harness, judgment-guardbands, time-travel-replay, tracing
- **orchestration** - agent-chaining, fleet-orchestration, hitl-approval, model-routing, plan-review, proactive-nudges, remediation-handoff, session-continuation, tenant-scoped-agent-runtime
- **prompt-and-context** - agent-instruction-files, agent-memory, context-hierarchy, llm-extracted-entity-graph, prompt-assembly, prompt-safety, retrieval, structured-output
- **runtime-and-io** - agent-addressable-ui, agent-browser-control, agent-cli-transport, agent-runtime-assembly, mcp-tools, sidecar-provisioning, streaming-output, subprocess-lifecycle, terminal-multiplexing, voice-io

### backend-platform
- **data-layer** - bounded-enumeration, data-access, embedded-db, migrations, read-serving-replicas, sync-replication, transactions-over-a-replicated-log
- **inference-serving** - cross-instance-cache-lease, paged-block-cache, persistent-batch-mutation, serving-process-topology
- **platform-observability** - alerting, metric-surface-contract, metrics-rollups, observability-telemetry, outbound-notifications
- **process-graph-runtime** - correlated-exchange-over-broadcast, data-plane-transport-selection, declared-process-graph, edge-queue-policy, fault-signal-propagation
- **resilience** - error-handling, multi-provider-gateway-plane, optional-dependency-degradation, rate-limiting, retry-backoff, scale-investment-timing, self-healing, stream-proxy-hop, webhook-ingestion
- **work-execution** - admission-queue, background-jobs, concurrency-guards, delivery-guarantees, job-coordination, pipeline-dag, scheduling

### operations
- **control-plane-operations** - convergence-loop-and-requeue, declarative-resource-lifecycle, watch-cache-and-resync
- **governance-and-records** - audit-logging, data-retention, entity-lifecycle, settings, versioning-snapshots
- **service-operations** - health-checks, node-boot-and-declarative-bootstrap, perf-instrumentation, plan-entitlements, quorum-and-recovery-procedures, scoring-rubrics, triage-queues, usage-analytics

### security
- **code-provenance** - decentralized-artifact-distribution, signed-artifacts, supply-chain
- **data-and-transport** - browser-credential-boundary, p2p-networking, telemetry-pii-redaction
- **extension-trust** - extension-trust-boundary, untrusted-extension-host
- **identity-and-access** - authorization, credential-vault, device-pairing

### integration
- cicd-monitoring, connector-catalog, document-text-extraction, embedded-preview, import-normalization, markdown-vault, sql-console, templates-scaffolding, web-scraping

### engineering-process
- **build-and-release** - build-economics, codegen, packaging, release-pipeline, test-harness, test-input-generation
- **codebase-stewardship** - codebase-scanning, concurrent-vcs, dead-code, dependency-declaration, docs-sync, machine-authored-documentation, module-design, repository-landing-document
- **continuous-integration** - ci-execution-trust, deployment-contract, machine-paced-delivery, pipeline-authoring, runner-fleet
- **standards-and-gates** - invariant-placement, knowledge-registry, multi-project, quality-gates, repo-manifest-standard

### engineering-assessment
- **maturity-and-conformance** - conformance-checking, maturity-ladders, public-verdict-badge, readiness-passports
- **measurement-method** - analytics-time-windows, measurement-honesty, metric-forecasting, modelled-performance-estimates, peer-benchmarking, people-analytics-ethics
- **reporting-and-remediation** - adoption-measurement, delivery-analytics, executive-reporting, remediation-roadmaps

### secret-custody-and-issuance
- dynamic-secret-lifecycle, issuance-policy-ladder, priced-authority, seal-and-key-hierarchy

---
subject: operator-surfaces-for-llm-spend
domain: llm-observability
last_touched: 2026-09-10
touched_by: deepen
dry_streak: 0
---

# operator-surfaces-for-llm-spend

First touch: [[2026-08-30-1]], scoped `/deepen` under the librarian sweep that
fixed the demand instrument. Ranked #5 (43 points) on the corrected worklist —
and it had read 83 under the double-counted demand this run removed, which is
the concrete case of why the ranking was wrong: this subject was never twice as
urgent as it is.

Dry on new techniques **by design**, and the reason is worth keeping: the
strongest convergence candidate (result size is metered context) was reachable
by both lanes, but its home was an amendment to an existing technique, not a
seventh one. The truncation rule already existed; the lane gave it a second
justification.

## Landed

- `glyph-encoded-business-thresholds` — two decision rules. A glyph is **not
  reliably one column wide** (pad by rendered display width, not string length;
  keep the glyph leading so a renderer's bad guess shifts one column instead of
  every number). And the severity **must survive being read aloud** — assistive
  technology announces a pictograph by its catalog name, so an encoding that
  exists only in the glyph is unreadable to part of the operator population.
- `single-render-layer-many-consumers` — size the rendering to the transport's
  budget; the rendered half is read by a metered reader, the structured half by
  a program.
- `agent-prompts-as-dashboards` — catalog delivery belongs to the host, so each
  journey must be legible standalone.
- Golden path — the "four doors" enumeration was one short. **An enumeration is
  a claim**, the same catch [[analytics-store-design]] recorded 2026-08-27.

## Counter-evidence

**Refuted:** "the spec revised twice in eighteen months" — a third, larger
revision had shipped *before* this document's own original verification date,
ten days earlier. The intro now states that as the measured rot rate for this
landscape rather than quietly correcting it. The "sessions are never
authentication" bullet cited a mechanism **deleted** in that revision; the
principle survives its mechanism and applies harder, so it was recorded, not
dropped. FOCUS "GenAI dimensions exceed the spec" substantially expired.

**Refuted with a hedge:** the widely repeated claim that structured content
"costs zero tokens" because it never reaches the model. Not a protocol
guarantee — host-dependent. The hedge went into both layers rather than the
vendor phrasing.

**Confirmed:** the read-default posture is still ecosystem norm; annotations
are still declarations, not enforcement. The FinOps trend line — asserted on
the first pass from a *vendor's summary* — was re-checked at the primary and
held, with its n (98% / 63% / 31%, n=1,192).

## Open leads

- **The observability surface is itself a spend source.** An operator surface
  burns tokens reading spend reports; that is apparatus spend and must be
  segregated at write time or carried into the rollup's grouping key. Home is
  ambiguous between here and [[margin-and-unit-economics]]. Return when either
  subject is next opened.
- **Handle hygiene** — a capability-bearing string returned by a read tool is a
  leaked capability; scope it to its read and expire it. Only the narrow
  spend-surface version landed here; the general form belongs in
  `software-engineering`.
- **Cache scope is an entitlement decision** — an entitlement-varying catalog
  cached at a shared intermediary is an entitlement leak. Generalizes well past
  LLM spend.

## Source-class observation (first sighting, not graduating)

Both of this application's secondhand claims were one fetch from a primary, and
they split: the vendor's summary of a foundation report **held**, the spec
status read from prose **did not**. Candidate class rule — *read a
specification's own version page, never a summary of it.* One observation; the
skill's bar is 3+ cross-domain before a class rule graduates.

## Declines

- **No new technique.** Recorded so the next run does not read "dry" as "not
  looked at". The convergence bar was applied and the candidate failed it on
  placement, not on evidence.
- The blind training-data lane diverged from the web lane on three post-cutoff
  facts (protocol statelessness, interactive views promoted into the spec,
  FOCUS 1.3/1.4). The web lane won all three. That divergence is *why* the
  strongest candidate did not clear convergence — one lane never reached it.

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/operator-surfaces-for-llm-spend",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:ac9e925ffcbb55b5",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "glyph(1.0, None) returns healthy even when the ratio needed for classification is unavailable.",
    "A read-only SQL credential with unrestricted tenant access can leak another tenant without writing anything.",
    "A rotation tool can place new material in a vault and return an operation ID without revealing the secret to a model."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/federation-and-surfaces/operator-surfaces-for-llm-spend",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://modelcontextprotocol.io/specification/2026-07-28/changelog",
      "scope": "Primary changelog confirms stateless requests, removed session mechanism, cache result fields and deprecated features; deprecation leaves features functional during transition."
    },
    {
      "url": "https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices",
      "scope": "Official security guidance consulted; no complete ecosystem survey refresh."
    }
  ],
  "documents": {
    "operator-surfaces-for-llm-spend.md": {
      "disposition": "reverify",
      "reason": "Shared semantic reporting and audience scope are useful; a renderer is not authorization and builder ownership does not authorize exposing all data. Tool prompts cannot guarantee deterministic execution or verbatim output. Read-only queries can disclose secrets and consume resources; blanket key-operation absence is one design choice, not a universal requirement for opaque secret-manager workflows."
    },
    "techniques/agent-prompts-as-dashboards.md": {
      "disposition": "reverify",
      "reason": "Named prompts guide but do not enforce execution, scope or exact rendering. Missing project should not silently expand to all projects; list authorized choices or use a disclosed authorized default. Largest cost driver does not alone establish a safe cheaper alternative. Tool results and user labels are untrusted text; host delivery and truncation need verification."
    },
    "techniques/glyph-encoded-business-thresholds.md": {
      "disposition": "clarify",
      "reason": "Repaired unknown as healthy, zero/negative-denominator handling and glyph-only semantics. Classification must include evidence state and task-specific policy; three states are not universally sufficient."
    },
    "techniques/read-tools-default-writes-gated.md": {
      "disposition": "clarify",
      "reason": "Repaired coarse global switch as sole least-privilege model, UI location as determinant of trusted approval and incidental cache/log writes as business mutation. Enforce scopes server-side and distinguish deployment enablement from action authorization."
    },
    "techniques/secret-surfaces-never-exposed-to-agents.md": {
      "disposition": "reverify",
      "reason": "Keeping secret bytes out of model context is sound; credential rotation or minting can safely write directly to a secret manager and return only an opaque handle. Removing one registered tool does not prove general tools cannot reach secrets. Terminal consoles can also log, and rotation is an authorized incident action with continuity requirements. Nonsecret key metadata still needs access control."
    },
    "techniques/single-render-layer-many-consumers.md": {
      "disposition": "reverify",
      "reason": "Centralize semantics but allow transport-specific renderers for accessibility, locale and format. Escape Markdown/HTML/terminal control sequences and treat labels as data. Shared code does not guarantee every consumer displays caveats, and compact structured payload may still enter model context. Empty results require distinguishing filters, missing data and access limits."
    },
    "techniques/sql-panel-sets-over-the-relational-store.md": {
      "disposition": "reverify",
      "reason": "SQL panels need database-enforced row/column scope; omitted panels do not restrict an editor with broad datasource credentials. Aggregates can be sensitive too. Null-aware sums still omit unpriced rows without coverage disclosure. Replicas can lag and contend; source errors should render as errors, not blank panels. Public preaggregates can also disclose if incorrectly scoped."
    },
    "applications/process--agent-prompts-as-dashboards.md": {
      "disposition": "reverify",
      "reason": "Historical seven-prompt catalog retained, not rerun. A substring assertion for list_projects proves prompt text, not runtime fallback or authorization. Prompt-only read instructions are not structural enforcement. Shared code and comments do not prove countermeasures execute, and a dominant model is not by itself evidence for a safe replacement."
    },
    "applications/process--read-tools-default-writes-gated.md": {
      "disposition": "reverify",
      "reason": "Dated survey retained without maturity refresh. Primary changelog confirms stateless/session/cache changes and deprecation, but roots were not an enforcement sandbox and deprecation is not immediate removal. Handles may be authenticated identifiers rather than bearer secrets. Trusted host approval in a chat UI is not equivalent to attacker-written conversation text. FinOps/FOCUS figures, poisoning prevalence and host counts not refreshed."
    },
    "applications/rust--glyph-encoded-business-thresholds.md": {
      "disposition": "reverify",
      "reason": "Historical Rust glyph code retained, not rerun. Nonnegative margin with None percentage becomes green, and trend passes None by design, so thinness is not carried across all surfaces. NaN likewise reaches healthy. Panel omission does not establish datasource authorization; unsigned positive numbers and signed deltas need labeled semantics, not claims of different numeric values."
    }
  }
}
```

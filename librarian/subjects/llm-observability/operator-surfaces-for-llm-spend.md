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

## 2026-09-10 — architecture re-review after the compression revert

Second review on this date, against the reverted bytes (HEAD `44c8996`). All 10
owned documents read in full: the golden path, six techniques, three
applications. This subject's dated survey is the most source-dependent document
in my group, so four primary sources were resolved this run and both cited seams
in the local tracklight tree were opened.

**Retraction.** The earlier 2026-09-10 record's dispositions are retracted as an
outstanding work list and retained above as history; the repairs it describes
were part of the pass reverted the same day.

**Sources checked (read, not executed).** The MCP specification's own versioning
page states "The **current** protocol version is **2026-07-28**" and describes
per-request version negotiation via `_meta` with `server/discover` as the
up-front alternative — so the survey's revision identifier and its
stateless-protocol claim are correct, not a projection. The `2026-07-28`
changelog confirms, item by item, every structural claim the survey makes:
protocol-level sessions and the `Mcp-Session-Id` header removed with list
endpoints no longer varying per-connection and servers using "explicit,
server-minted handles passed as ordinary tool arguments"; the
`initialize`/`notifications/initialized` handshake removed; `ttlMs` and
`cacheScope` (`"public"` / `"private"`) required on list results via a new
`CacheableResult` interface; `inputSchema`/`outputSchema` loosened to any JSON
Schema 2020-12 keywords and `structuredContent` to any JSON value; and a
twelve-month deprecation policy with a deprecated-features registry. The MCP
Apps page confirms the extension's shape — servers return interactive HTML, the
host preloads a `ui://` resource declared in the tool's `_meta.ui.resourceUri`,
rendering happens in a sandboxed iframe, and the app requests tool calls that
the host forwards, with the host controlling which tools an app may call. The
FOCUS specification page confirms v1.4 as latest with v1.5 in development.
Nothing in four sources contradicted the corpus.

**The finding that would justify a content change.** In the survey's
`2026-07-28` section, the third bullet opens by correctly saying Roots, Sampling
and Logging are "deprecated ... under a new twelve-month deprecation policy" and
then, in its next clause, reasons from "Roots' removal". The changelog is
explicit that deprecated features "remain fully functional during the
deprecation window"; nothing has been removed. The conclusion the bullet draws —
that a spend tool server should keep asserting its own scope rather than
assuming the protocol carries one — survives either way, so this is a precision
repair inside one sentence, not a retraction. But a reader planning against
"Roots' removal" today is planning against a state that has not arrived.

**A change the survey missed that lands harder than the one it took.** The
survey reads the session removal through `cacheScope`: a `public` scope invites
a shared intermediary to cache an entitlement-varying catalog, so a spend
server's lists are `private`. That is right and it is the smaller half. The
changelog's first sentence on the same change says list endpoints "no longer
vary per-connection" — which is a constraint on the server, not a hint to the
cache. An agent-facing spend server whose tool list differs by who is asking is
now at odds with the protocol's own statement about those endpoints, and the
technique's layered gate (which puts entitlement in the API credential rather
than in the catalog) happens to be the posture that survives it. Worth stating
in the next pass as the reason the gate is where it is, rather than leaving it
as luck.

**Tree checks.** `crates/mcp/src/prompts.rs` defines exactly the seven journeys
the application names, in that order, each with the one-line description that
doubles as a menu entry. `crates/render/src/margin.rs` carries `glyph` with the
dollars-first test and `pct.is_some_and(|p| p < 0.2)` routing an absent ratio
around the comparison, plus the separate `delta_glyph` and `signed`. The Grafana
dashboard has exactly 14 panels — error rate, errors, calls, total cost, tokens,
avg score, errors over time, cost over time, project health, cost by
project/provider/model, recent errors, recent scores, score trend, pass rate —
and no margin panel. The placement-by-omission claim is confirmed by counting.

**Not evaluated.** No MCP server was started, no tool called, no dashboard
rendered. The FinOps State of FinOps 2026 figures (98% / 63% / 31%, 1,192
respondents) were not re-resolved; neither were the GitHub MCP server README
line, the tool-poisoning prevalence figure (5.5% of 1,899 servers) or
CVE-2025-54136. The survey carries `refresh_by: 2026-11-30`, which is the right
instrument for those.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/operator-surfaces-for-llm-spend",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:fc6c9287a6fd13da",
  "disposition": "keep",
  "coverage": "All 10 owned documents read in full against the reverted bytes. Four primary sources resolved by reading (MCP versioning page, MCP 2026-07-28 changelog, MCP Apps extension page, FOCUS specification version page). Both cited tracklight seams opened plus the Grafana dashboard counted. Not evaluated: any running MCP server, tool call or rendered dashboard; the FinOps State of FinOps 2026 figures; the GitHub MCP server README; the tool-poisoning prevalence figure and CVE-2025-54136.",
  "counterexamples": [
    "An agent-facing catalog that varies by the caller's entitlement now contradicts the 2026-07-28 statement that list endpoints no longer vary per-connection; the subject discusses entitlement-varying catalogs only as a caching hazard.",
    "A journey prompt degrading to `list_projects` on a missing argument leaks the existence of every project to a reader entitled to one of them — the technique's graceful-degradation rule and its own 'a prompt is not an access control' rule pull against each other and neither names the case.",
    "A glyph fused to the row key survives copy-paste, but a screen reader announces the pictograph's catalog name; the technique fixes this by keeping the number and the band name in the row — which the margin-report journey prompt then undercuts by instructing the model to call out rows by glyph."
  ],
  "sources": [
    {
      "url": "https://modelcontextprotocol.io/specification/versioning",
      "result": "Read (not executed). Confirms 2026-07-28 as the current protocol version, per-request version declaration in _meta, server/discover as a mandatory RPC, and the twelve-month deprecation window with a deprecated-features registry. Does not itself enumerate the changes."
    },
    {
      "url": "https://modelcontextprotocol.io/specification/2026-07-28/changelog",
      "result": "Read (not executed). Confirms verbatim: sessions and Mcp-Session-Id removed with list endpoints no longer varying per-connection and server-minted handles as ordinary tool arguments; the initialize handshake removed; ttlMs and cacheScope required on list results; schema loosening. Establishes that Roots, Sampling and Logging are Deprecated and 'remain fully functional during the deprecation window' — not removed, which the survey's third bullet asserts in its second clause."
    },
    {
      "url": "https://modelcontextprotocol.io/docs/extensions/apps",
      "result": "Read (not executed). Confirms sandboxed-iframe rendering of server-shipped HTML, the tool-declared ui:// resource the host can preload, and app-requested tool calls forwarded by the host with the host controlling which tools an app may call. The 2026-01-26 spec line is confirmed by the linked specification path. Does not confirm the 'six host clients at launch' count; the page now lists eight."
    },
    {
      "url": "https://focus.finops.org/focus-specification/",
      "result": "Read (not executed). Confirms v1.4 as the latest release and v1.5 as in development, matching the survey's line. The page does not carry ratification dates, so the survey's 'FOCUS 1.2 (ratified May 2025)' and '1.3 (ratified December 2025)' were not corroborated here."
    },
    {
      "path": "C:/Users/kazda/kiro/tracklight",
      "result": "Read at d398835. Confirms exactly seven prompts in crates/mcp/src/prompts.rs with the named descriptions; the glyph, delta_glyph and signed functions in crates/render/src/margin.rs including the is_some_and absence routing; and 14 Grafana panels with no margin panel. Nothing was built or executed."
    }
  ],
  "documents": {
    "operator-surfaces-for-llm-spend.md": {"disposition": "keep", "reason": "The two-things-at-once framing (one render discipline plus authorization boundaries), the gated-versus-absent distinction and the panel-set-as-audience-decision are the subject's load-bearing claims and all hold. The closing sentence — the surface layer looks like polish and is actually policy — is earned by the placement rule, which the tree confirms by omission."},
    "techniques/agent-prompts-as-dashboards.md": {"disposition": "keep", "reason": "The three-part prompt shape, graceful degradation, and the host-owns-delivery rule are realized in the tree exactly as written, including the catalog-membership test. The 'a prompt is not an access control' closing rule is the right boundary; it does not address what the degradation branch itself discloses."},
    "techniques/glyph-encoded-business-thresholds.md": {"disposition": "keep", "reason": "Three states, dollars-first, the delta triple with its explicit sign, and absence routed around the comparison are all confirmed in the render crate. The two later rules — display-width padding rather than character count, and severity surviving being read aloud — are the kind of hard-won detail that justifies the technique existing separately from the render-layer one."},
    "techniques/read-tools-default-writes-gated.md": {"disposition": "keep", "reason": "The three layers with annotations classed as cooperative rather than enforcing, the order-of-failure argument for the switch, and the per-deployment-not-per-conversation rule are corroborated by the 2026-07-28 security posture and by the tree's own default-off flag. Putting entitlement in the credential rather than in the catalog is also what keeps the technique compatible with list endpoints that no longer vary per-connection."},
    "techniques/secret-surfaces-never-exposed-to-agents.md": {"disposition": "keep", "reason": "Absent-not-gated is argued from cost asymmetry rather than asserted, the inventory-and-denylist procedure is auditable in one screen, and the identifiers-may-flow/material-never-may line is drawn precisely. The rotate-do-not-reason-about-it incident rule follows from the same asymmetry, which is what makes the technique coherent rather than merely strict."},
    "techniques/single-render-layer-many-consumers.md": {"disposition": "keep", "reason": "The canonical-payload-first procedure, the transport-budget sizing rule with its explicit refusal to assume structured content is free, and the honesty rules pushed into the renderer are all sound. The third-renderer paragraph on declared interactive views is confirmed in shape by the MCP Apps page and states the right condition: a report that is only true when rendered as pixels has left the discipline."},
    "techniques/sql-panel-sets-over-the-relational-store.md": {"disposition": "keep", "reason": "Curate-don't-mirror, semantics-survive-the-bypass (nullable measures, mirrored bands, explicit windows) and the audience scope rule are consistent with the golden path and confirmed by the tree's 14-panel set. The closing carve-out for genuinely untrusted viewers (pre-aggregated export, not direct SQL) is the right boundary."},
    "applications/process--agent-prompts-as-dashboards.md": {"disposition": "keep", "reason": "Every structural claim was checked against the tree this run and matched: seven journeys in that order, the descriptions doubling as menu entries, the no-argument branches, and the read-only stance enforced independently by the write gate. The upward lesson it records — framing must be closed-form, not open summarization — is visible in the prompt text itself."},
    "applications/process--read-tools-default-writes-gated.md": {"disposition": "clarify", "reason": "Its MCP claims were re-resolved against the primary changelog and versioning page this run and matched item for item, as did the MCP Apps shape and the FOCUS 1.4/1.5 line — this is a well-sourced survey. One precision repair: the Roots/Sampling/Logging bullet says 'deprecated under a new twelve-month deprecation policy' and then reasons from 'Roots' removal'; the changelog is explicit that deprecated features remain fully functional. One addition owed: the same changelog item says list endpoints no longer vary per-connection, which constrains an entitlement-varying catalog more directly than the cacheScope hazard the survey took from it."},
    "applications/rust--glyph-encoded-business-thresholds.md": {"disposition": "keep", "reason": "The glyph function, the separate delta vocabulary with the pinned '+$13.00' assertion, and the absence-routed-around-the-threshold detail were all opened this run and match. The placement-by-omission claim is confirmed by counting the dashboard: 14 panels, none of them margin."}
  }
}
```

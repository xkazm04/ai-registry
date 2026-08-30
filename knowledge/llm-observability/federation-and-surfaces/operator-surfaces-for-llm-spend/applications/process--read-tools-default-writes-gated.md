---
layer: application
type: application
subject: operator-surfaces-for-llm-spend
technique: read-tools-default-writes-gated
stack: process
status: forged
refresh_by: 2026-11-30
verified_on: 2026-08-30
---

# The 2025-2026 agent-surface landscape: protocol security practice and spend-reporting conventions

A dated survey (re-verified 2026-08-30) of the field this subject's
agent-facing techniques operate in: what agent-tool-protocol security practice
now prescribes, where the ecosystem converged on the read-default posture, and
which reporting conventions the FinOps world expects an AI spend surface to
speak. Refresh by the frontmatter date — this document's first pass, ten days
earlier, already cited a superseded protocol revision, which is the measured
rate at which this particular landscape rots.

## Read-default is now ecosystem practice, not a house rule

The posture this technique prescribes shipped independently across major
first-party MCP servers. GitHub's official MCP server carries a `--read-only`
flag whose documentation states the priority rule exactly as the technique
draws it: "write tools are skipped if `--read-only` is set, even if
explicitly requested via `--tools`" — the gate overrides per-tool opt-ins
rather than composing with them. The same server partitions capability by
toolsets (`GITHUB_TOOLSETS`), defaulting to a discovery/read-leaning subset.
Enterprise security guidance (Descope, Knostic, obot's 2026 MCP security
guide) converged on the same sentence: a production agent should hold
read-only access at most, with writes behind explicit human approval. The
technique's environment-level switch is the deployment-shaped instance of a
now-general norm.

## What the protocol spec itself hardened

The June 2025 MCP revision reclassified tool servers as OAuth Resource
Servers with a dedicated authorization server, and the official Security
Best Practices document (2025-11-25 line) turned several of this subject's
instincts into normative language:

- **Token passthrough is forbidden** ("MUST NOT accept any tokens that were
  not explicitly issued for the MCP server") — the spec-level cousin of this
  technique's "thin client of the API, never wider than the credential".
- **Sessions are never authentication** — a session ID reaching an agent
  context must not be a bearer capability, which is the same asymmetry
  secret-surfaces-never-exposed-to-agents builds on. **This principle
  outlived its mechanism**, and the way it did is the more useful lesson;
  see the next section.
- **Scope minimization**: the prescribed model is a minimal initial scope of
  low-risk discovery/read operations with *incremental elevation* when a
  privileged operation is first attempted. Note the tension with this
  technique, and how it resolves: the spec's elevation challenge arrives
  mid-session, and this technique explicitly rejects conversational "turn
  writes on" as a social-engineering target inside the untrusted channel.
  Both hold at once when the elevation *decision* lands on an out-of-band,
  human-authenticated surface (the deployment environment, an admin console)
  and only the *challenge* is visible in-band. An elevation flow whose
  approve button lives in the chat is the anti-pattern both documents name.

## The 2026-07-28 revision: the session bullet's mechanism was deleted

The first pass of this survey missed a revision that had already shipped:
MCP `2026-07-28` (published before this document's original verification
date, and the reason its "revised twice in eighteen months" framing was
wrong). Its changelog is a structural rewrite, and three items land directly
on this subject:

- **Protocol-level sessions and the `Mcp-Session-Id` header are removed**,
  along with the `initialize` handshake — the protocol is now stateless, with
  every request carrying its version and client capabilities in `_meta`.
  Servers that need cross-call state "use explicit, server-minted handles
  passed as ordinary tool arguments". So the "sessions are never
  authentication" bullet above now names a mechanism that no longer exists —
  and the hazard moved rather than closed. A handle passed as a tool argument
  is a string the model can see, echo into a reply, and carry into a ticket
  or a chat log, with no binding to user, address, or transport; security
  analysis of the new revision names handle replay as its first new attack
  surface. The principle survives its mechanism intact and applies harder:
  **a capability-bearing string in an agent context is a leaked capability**,
  which is precisely the asymmetry
  secret-surfaces-never-exposed-to-agents rests on. For a spend surface the
  practical consequence is narrow and worth stating: if a read tool ever
  returns a handle, that handle must be scoped to the read it came from and
  must expire, because it is going into a transcript.
- **Roots, Sampling and Logging are deprecated** under a new twelve-month
  deprecation policy. Roots' removal deletes a protocol-level filesystem
  boundary and hands scope enforcement to each server — not this subject's
  surface, but it is the reason a spend tool server should keep asserting its
  own scope rather than assuming the protocol carries one.
- **`ttlMs` / `cacheScope` are now required** on list results, and
  `outputSchema` / `structuredContent` were loosened to arbitrary JSON Schema
  2020-12 and any JSON value. The cache scope matters for an accounting
  surface for an unobvious reason: a `public` scope invites shared
  intermediaries to cache a listing, and an entitlement-varying catalog
  cached at a shared hop is an entitlement leak. A spend server's lists are
  `private`.

## Declared interactive views are a new operator surface

The same revision promoted an extension (MCP Apps, SEP-1865, extension spec
line `2026-01-26`) in which **servers ship interactive HTML that the host
renders in a sandboxed iframe**, with UI templates declared by tools ahead of
time so hosts can prefetch, cache and review them, and with UI-initiated
actions routed through the same JSON-RPC consent and audit path as a direct
tool call. Six host clients supported it at launch. This is the concrete
instance of the third-renderer class
single-render-layer-many-consumers now names.

Two consequences for this subject, pulling opposite ways:

- **It confirms the gate.** Because a UI action re-enters the ordinary tool
  path, the write switch and the API's authorization still bound it; a
  rendered button cannot reach past what the tool list allows. The
  read-default posture is not weakened by giving the surface pixels.
- **It sharpens the secret rule.** Published analysis of the extension names
  UI mimicry as a distinct risk: a server-controlled form rendered inside a
  trusted host looks exactly like the authenticated console that
  secret-surfaces-never-exposed-to-agents routes credential work *to*. The
  technique's "route key management to human-authenticated surfaces" now
  needs the operator to be able to tell one from the other, and the honest
  reading is that a view drawn by the server it is authenticating against is
  not such a surface. A spend server should never render a credential field
  at all — which is the technique's absence rule reaching a surface it was
  not written for, and holding.

## Tool poisoning: the attack class the publisher side must answer

The 2025-2026 literature named an attack this subject's forging repo never
had to face as a consumer: **tool poisoning** — adversarial instructions
embedded in tool descriptions and schemas, executed by the model at
selection time. A 2025 analysis of 1,899 open-source MCP servers found 5.5%
exhibiting it; CVE-2025-54136 documents the rug-pull variant, where a
definition mutates *after* the operator approved it. Enterprise defenses
treat tool discovery as untrusted ingress: gateways inspect every schema
before it reaches a model, pin definition hashes, and alert on change.

For a first-party spend-tool server the duties run in the publisher
direction: tool descriptions carry operation semantics and nothing
instruction-shaped beyond them; definitions are versioned and changes ship
as releases (a mutated tool list is indistinguishable from a rug-pull to a
gateway that is doing its job); and annotations are kept truthful because
downstream confirmation policy is built on them — the reason the technique
now classes annotations as a cooperative layer, not an enforcing one.

## The reporting conventions the surface is expected to speak

The FinOps Foundation's FinOps-for-AI track is the closest thing to a
conventions body for the numbers these surfaces render. The audience is
arriving fast, and the trend line is now checkable against the primary
report rather than a vendor's summary of it: the State of FinOps 2026
(1,192 respondents, $83B+ in annual cloud spend) puts AI cost management at
**98%** of surveyed organizations, up from **63%** in 2025 and **31%** in
2024 — the "up from 31% two years earlier" this document asserted on its
first pass, confirmed at the source. Its guidance fixes the vocabulary an
operator report is expected to carry: allocation dimensions
(project/workload, environment, team, cost center, usage type) and
unit-economics metrics (cost per token, per inference, per API call).

FOCUS is the normalization target, and **the caveat this document carried
about it has substantially expired**. The first pass said GenAI API
dimensions and agentic-workflow costs "still exceed what the spec covers";
since then FOCUS 1.2 (ratified May 2025) added SaaS/PaaS virtual-currency
and token-lifecycle support — which is the machinery that makes per-token
billing normalizable, including burn-down and exhaustion forecasting — and
FOCUS 1.3 (ratified December 2025) added data-generator-declared split cost
allocation, which is the shared-resource gap. The current line is 1.4, with
1.5 in development. The residue of the old caveat is narrower and should be
stated narrowly: the spec expresses token spend through generic
virtual-currency and split-allocation columns rather than GenAI-native
dimensions, so the mapping is real but is a mapping. Normalize to FOCUS —
it now reaches further than this document previously credited — and preserve
native fidelity underneath it, which was always the right posture and is
what makes a spec revision a re-mapping rather than a data loss.

The accountability default is **showback**: report spend to the
teams that caused it before ever charging them, which is precisely the
posture of a read-only agent surface over a spend store. Published
threshold *percentages* are notably absent from the guidance — alerting
bands are named as necessary and left to the business, consistent with this
subject's "tune the number, keep the shape".

## The tool result is metered, and the catalog may never be rendered

Two practice findings that bear on the surface techniques rather than the
security ones.

**Result size is a cost.** The 2026 discussion of agent-tool economics is
dominated by context accounting: tool *definitions* alone occupy a
substantial fixed slice of a session before any user message, and a tool that
returns a wide row set spends the window it was supposed to inform.
Prevailing guidance is small default page sizes with an explicit
more-available flag, a compact rendered summary for the model, and full
fidelity in the structured payload or behind a fetchable link. Several
vendor write-ups state flatly that structured content "costs zero tokens"
because it never reaches the model — **treat that as host-dependent, not as a
protocol guarantee**: the spec does not oblige a client to withhold it, and a
surface designed around an assumed exemption is a surface that silently
becomes expensive on a host that behaves differently. What survives the
hedge is the ordering, which is what
single-render-layer-many-consumers now states: render compactly for the
reader that pays per token, carry fidelity beside it.

**The prompt catalog is the least reliably surfaced primitive.** The spec is
explicit that "implementors are free to expose prompts through any interface
pattern that suits their needs — the protocol itself does not mandate any
specific user interaction model", and practice matches: prompts are
repeatedly described as the least-used of the three primitives, well
supported in some clients and the subject of open feature requests in others.
The journey catalog is therefore a delivery convenience, not a delivery
guarantee — the reason agent-prompts-as-dashboards now requires each journey
to be legible as a standalone procedure.

## What the field does not do

No surveyed guidance reaches this subject's absence rule — that secret
minting/reveal must be *unwrappable* rather than gated — in those terms; the
field states it as least-privilege and credential-hygiene generalities. The
structural form (no code path exists, no flag opens it) remains ahead of
observed practice, as does the glyph layer's insistence that an absent ratio
never routes through a threshold comparison.

## Verification note

Re-resolved 2026-08-30. Confirmed unchanged: the read-only priority rule in
the GitHub MCP server README ("write tools are skipped if `--read-only` is
set, even if explicitly requested via `--tools`"); the token-passthrough and
scope-minimization language; the FinOps adoption trend line, now checked
against the primary report. Corrected: the protocol revision count and the
session bullet's mechanism; the FOCUS coverage caveat. Added: the
2026-07-28 changes, declared interactive views, and the two practice
findings above. Source-class lesson for this domain — the first pass took
its FinOps figures from a vendor's summary of a foundation report and its
FOCUS status from prose rather than the spec's own version page; both
primary sources were reachable in one fetch each, and one of the two
secondhand claims had gone stale while the other held.

Sources (resolved 2026-08-30): MCP specification `2026-07-28` — changelog
and server/prompts pages (modelcontextprotocol.io); MCP Apps extension spec
(`2026-01-26` line, modelcontextprotocol/ext-apps) and the MCP blog's
2026-07-28 release posts; Backslash Security on the revision's new attack
surfaces; Model Context Protocol Security Best Practices
(modelcontextprotocol.io, 2025-11-25 line); GitHub MCP server README
(github.com/github/github-mcp-server); Microsoft mcp-for-beginners security
module; MCP security guides (Descope, Knostic, obot, MintMCP, MCP Manager);
TrueFoundry on CVE-2025-54136; State of FinOps 2026 (data.finops.org,
primary); FOCUS specification version page and the FinOps Foundation's
FOCUS 1.2 / 1.3 release announcements (focus.finops.org, finops.org).

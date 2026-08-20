---
layer: application
type: application
subject: operator-surfaces-for-llm-spend
technique: read-tools-default-writes-gated
stack: process
status: forged
refresh_by: 2026-11-20
verified_on: 2026-08-20
---

# The 2025-2026 agent-surface landscape: protocol security practice and spend-reporting conventions

A dated survey (August 2026) of the field this subject's agent-facing
techniques operate in: what agent-tool-protocol security practice now
prescribes, where the ecosystem converged on the read-default posture, and
which reporting conventions the FinOps world expects an AI spend surface to
speak. Refresh by the frontmatter date — the protocol spec revised twice in
eighteen months and the attack literature is moving faster than that.

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
  secret-surfaces-never-exposed-to-agents builds on.
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
conventions body for the numbers these surfaces render. Its State of AI
FinOps reporting shows the audience arriving fast — 98% of surveyed
organizations now manage AI spend, up from 31% two years earlier — and its
guidance fixes the vocabulary an operator report is expected to carry:
allocation dimensions (project/workload, environment, team, cost center,
usage type) and unit-economics metrics (cost per token, per inference, per
API call). FOCUS is the normalization target, with the explicit caveat that
GenAI API dimensions and agentic-workflow costs still exceed what the spec
covers — normalize to FOCUS where it holds, preserve native fidelity where
it does not. The accountability default is **showback**: report spend to the
teams that caused it before ever charging them, which is precisely the
posture of a read-only agent surface over a spend store. Published
threshold *percentages* are notably absent from the guidance — alerting
bands are named as necessary and left to the business, consistent with this
subject's "tune the number, keep the shape".

## What the field does not do

No surveyed guidance reaches this subject's absence rule — that secret
minting/reveal must be *unwrappable* rather than gated — in those terms; the
field states it as least-privilege and credential-hygiene generalities. The
structural form (no code path exists, no flag opens it) remains ahead of
observed practice, as does the glyph layer's insistence that an absent ratio
never routes through a threshold comparison.

Sources: Model Context Protocol Security Best Practices
(modelcontextprotocol.io, 2025-11-25 line); GitHub MCP server README
(github.com/github/github-mcp-server); Microsoft mcp-for-beginners security
module; MCP security guides (Descope, Knostic, obot, MintMCP, MCP Manager);
TrueFoundry on CVE-2025-54136; FinOps Foundation FinOps-for-AI overview and
State of AI FinOps 2025 (finops.org, via Portkey's summary).

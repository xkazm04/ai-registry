---
layer: technique
type: technique
subject: operator-surfaces-for-llm-spend
technique: secret-surfaces-never-exposed-to-agents
status: forged
laws: []
shared_with: []
use_when:
  - deciding which API capabilities an agent tool server may wrap
  - reviewing an agent integration for credential exposure
---

# Secret surfaces never exposed to agents

Some capabilities must not be *gated* from an agent surface; they must be
*absent* from it. The technique: **anything that mints, reveals, or rotates a
secret — API keys, signing material, webhook secrets — is never wrapped as an
agent tool at all, under any flag**, because everything a tool returns enters
the agent's context, and context is a broadcast medium: quoted into replies,
summarized into transcripts, persisted into session logs and telemetry the
operator does not control and cannot redact after the fact.

## Absent, not gated — the load-bearing distinction

A gated write is a capability with a switch: off by default, but one
environment variable away from on, and one social-engineered "please enable
writes so I can help you" away from being asked for. An absent capability has
no switch. There is no flag combination, no credential, no prompt that makes
the tool server able to hand a secret to the model, because the code path
does not exist. For mutations of ordinary data, gating is the right
economics; for secrets the asymmetry is different — a transcript cannot be
unwritten, a leaked key is a standing liability until rotated, and the
convenience saved by agent-driven key management is one CLI command. When the
downside is irreversible and the upside is trivial, delete the surface.

## Procedure

1. Inventory the API for secret-bearing operations: key minting, key listing
   with material, secret reveal endpoints, anything whose response body could
   contain credential bytes. This inventory is the denylist for the agent
   tool server.
2. Wrap none of them. The tool server's registration code simply has no
   entry; a review of the tool list against the denylist is a one-screen
   audit.
3. Route key management to human-authenticated surfaces only — an admin CLI
   or authenticated console where the secret is shown once, to a person, and
   the display is not a durable log.
4. Sweep the *readable* surfaces for incidental leakage: a project listing
   that includes key material "for convenience", an event payload that
   captured an authorization header, a config-dump tool. Redact at the API
   layer, not the tool layer, so every present and future consumer inherits
   the redaction.
5. Extend the rule to journey prompts and docs: no prompt instructs the
   operator to paste a key into the conversation, and setup guides route
   credential steps around the agent ("run this command in your terminal"),
   not through it.

## Decision rules

- Identifiers of secrets (key ids, names, creation dates, last-used) are data
  and may flow to agents; secret *material* never. If a rotation workflow
  needs agent assistance, the agent handles the identifiers and the human
  runs the reveal step.
- Treat "the agent needs the key to configure itself" as a design smell: the
  integration should receive its credential from the environment at deploy
  time, placed by a human or a secret manager, never through the
  conversation.
- When a new tool's response schema is designed, ask what the worst field it
  could ever carry is. Schemas that can transport secret-shaped strings from
  user-controlled config deserve the same scrutiny as reveal endpoints.
- If a secret does reach a context — pasted by the operator, leaked by a
  bug — rotate it. Do not reason about whether the transcript is "probably
  private"; the cost asymmetry that motivated the technique also settles the
  incident response.

## When not to use it

The technique bounds agent surfaces, not automation generally. A headless
provisioning pipeline with a machine identity may legitimately mint keys —
its outputs go to a secret store, not a conversational context. And it does
not demand paranoia about non-secret sensitive data (spend, margins,
customer names); those are entitlement questions for the surface-placement
decision, handled by scoping and authentication, not by deletion. The
deletion rule is for material whose exposure is irreversible and whose
legitimate consumer is never a language model.

---
layer: technique
type: technique
subject: operator-surfaces-for-llm-spend
technique: read-tools-default-writes-gated
status: forged
laws: []
shared_with: []
use_when:
  - exposing a spend store to a conversational agent over a tool protocol
  - deciding the default capability set of an agent integration
---

# Read tools default, writes gated

An agent's tool list is an attack surface and an accident surface at once:
everything callable will eventually be called — by a misread instruction, an
injected prompt inside retrieved content, or an over-eager plan. The
technique: **the agent-facing tool server exposes reads by default and every
mutating tool only behind an explicit environment-level switch the operator
sets, layered on top of — never instead of — the API's own authorization.**

## The layered gate

Three layers — two enforcing, one cooperative:

1. **API authorization.** Mutations require the appropriate credential
   (admin-grade for administrative writes). This layer exists regardless of
   agents and is never weakened for them.
2. **The server-side write switch.** The tool server refuses mutating calls
   unless a deployment-level flag is set, default off. This is the layer that
   makes the *default installation* safe: an operator who wires the agent up
   to explore gets a read-only integration even if they pasted an admin
   credential into the server's environment.
3. **Tool annotations.** Read tools are declared side-effect-free in the
   protocol's metadata, so the agent platform can apply its own
   confirmation policies to the rest. Annotations are declarations, not
   enforcement — a client is free to ignore them, and nothing verifies
   them — so they never substitute for the switch. Their obligation runs
   the other way: the declaration must be truthful, because platforms
   build confirmation policy on it, and a read tool mislabeled as such is
   a hole in someone else's gate.

The order of failure matters: with only layer 1, the common setup (admin key
in the environment, because listing prices required it) silently makes every
write reachable. The switch converts "the credential could" into "the
operator decided".

## Procedure

- Partition the tool list explicitly into reads and writes at registration
  time; the gate is a property of the partition, not a per-tool afterthought.
  A new tool must declare its side before it ships.
- Keep the tool server a thin client of the API. It holds no direct store
  access, so its maximum blast radius is what the API would permit anyone
  with the same credential — the gate narrows that, never widens it.
- Reads stay genuinely side-effect-free: no lazy cache warming that mutates
  state, no "read that creates the entity if missing". A read tool that
  writes voids the whole partition.
- When a gated write is invoked with the gate closed, return a refusal that
  names the switch. The operator discovering the gate through a clear message
  is the enablement flow working as designed; a generic error sends them to
  weaken layer 1 instead.
- Log write invocations (attempted and permitted) distinctly. The gate's
  audit trail is how you learn whether the agent population needs writes at
  all.

## Decision rules

- Enable writes per deployment, not per conversation. A conversational "turn
  writes on" affordance is a social-engineering target inside the very
  channel that is untrusted.
- Scope the gate to the whole mutating class. Fine-grained per-tool flags
  invite a slow drift to "mostly on"; one switch keeps the decision legible.
  If one write genuinely deserves a different posture, that is usually a sign
  it belongs on a non-agent surface entirely.
- Diagnostics and protocol traffic stay on separate channels — the protocol
  channel carries only protocol. A tool server that mixes logging into its
  transport corrupts the one surface the agent parses.
- Re-evaluate the default only with evidence from the audit trail, and never
  flip the shipped default to open: every new installation inherits it.

## When not to use it

A purpose-built remediation agent whose entire job is mutation (rotating
limits, promoting prompt versions) inverts the economics — there, gate the
*scope* (which entities it may touch) rather than the verb class, and run it
under its own credential so the audit trail separates it from exploratory
agents. And the technique does not apply to human-facing admin CLIs
authenticated as a person: gating those behind an extra flag adds friction
without an untrusted context to defend against. The gate defends the surface
where generated text chooses the next call.

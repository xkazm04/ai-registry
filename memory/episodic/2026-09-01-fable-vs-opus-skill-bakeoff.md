---
kind: episodic
confidence: 1.0
namespace: engineering
source: skill-bakeoff-2026-09-01
---

# 2026-09-01: nine lane skills run on Fable 5.1 and Opus 5 with identical inputs

## What happened

The day Fable 5.1 arrived, the operator asked for a head-to-head: each of nine skills run
twice, once per model, as subagents in isolated worktrees on the fleet project that consumes
the skill, with the same fixed inputs and a delegate rule for every operator prompt. Each run
returned a seven-section report; the operator picked per skill. Winners were merged into the
project trunks; the reading is in
[the model-choice note](../semantic/model-choice-fable-vs-opus.md).

| Skill | Project | Fixed inputs | Pick |
| --- | --- | --- | --- |
| research | pof | github.com/CoplayDev/unity-mcp, focus all | merge both |
| friend | kp | area Hiring Pipeline, one cycle | Fable |
| prototype | ascent | `src/components/report/DimensionExplorer.tsx` | Fable |
| spark | ascent | weekly-digest idea | Fable output, Opus method |
| architect | kp | scan, error-handling | Opus base + three Fable commits |
| explorer | kp | Job & JD Management, any | merge both |
| scan-sweep | pof | --develop --one harness-autonomy | merge both |
| perfect | kp | resume, one round, self-gated | merge both |
| dojo | gravitone | one local-stack image cycle | see below |

## What the runs produced

- kp: 30 commits across friend, architect, explorer and perfect, including two tenancy
  guards on job routes, a publish-path atomicity fix, a CAS moved to an immediate
  transaction, a missing rate limiter, revived design-token lint selectors, an all-routes
  response-envelope ratchet, and nine perfect directions.
- pof: tool annotations and tool-group gating on the MCP server, a build long-poll, and
  eighteen harness fixes including a self-heal buffer bug and a prompt-injection fence.
- ascent: a weekly-digest tab and a rebuilt dimension explorer.
- gravitone: the Fable dojo cycle rendered five of eight pairs before the breaker tripped
  under a foreign GPU process; its partial readbacks read as a null result for the
  scoped-override technique.

## What broke and what it taught

- An API session limit killed fourteen runs mid-flight. Every one resumed from its
  transcript, re-verified its tree, and finished; two directors salvaged dead builders'
  work from disk instead of re-dispatching.
- The 20-subagent cap counts nested builders; runs that need a fan-out must expect refusals
  and say so.
- Four Fable runs committed lessons into the registry checkout despite being told their
  worktree was the only writable tree; no Opus run did. The briefs now name the registry
  as read-only explicitly.

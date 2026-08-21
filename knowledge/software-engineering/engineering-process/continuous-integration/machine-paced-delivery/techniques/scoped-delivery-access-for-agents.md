---
layer: technique
type: technique
subject: machine-paced-delivery
technique: scoped-delivery-access-for-agents
status: forged
stage: team
laws: [creation-names-reaper, one-validation-door]
shared_with: []
use_when: [giving an agent access to build data, an agent needs to retry a job, deciding what a background worker may hold]
---

# Scoped delivery access for agents

An agent reading a delivery system is genuinely useful and safe. An agent writing to one is a
different act with a different blast radius, and the two must be different grants. The failure
this technique prevents is the ordinary one: a single credential issued because it was
convenient, holding both, held for months, used by something running unattended.

## Two grants, never one

**Read** covers run status, step results, logs, timings, history, and the change under test.
This is what makes an agent useful at diagnosis, and it should be easy to obtain.

**Write** covers triggering, retrying, cancelling, promoting, deploying, and — the one most
often forgotten — *changing the configuration of the delivery system itself*. A grant that can
edit which checks run is a grant that can turn all of them off, and it is routinely bundled
into administrative scopes that get handed out for unrelated reasons.

The standing rule: **an agent never holds a credential capable of changing a shared
environment.** Not "rarely", not "with a confirmation prompt". The confirmation is a property
of a surface, and a credential outlives the surface it was issued for — it will be used by a
script six months from now that has no surface at all. Where an autonomous action must reach a
shared environment, it goes through a human checkpoint that holds the credential, not through
the agent.

## The scope ladder

Order the write capabilities by what they can destroy, and grant along it:

| rung | capability | typical grant |
|---|---|---|
| 0 | read anything | routine |
| 1 | retry a failed unit, unchanged | narrow, revocable |
| 2 | start a new run on an existing branch | narrow, revocable, rate-limited |
| 3 | promote or deploy to a shared environment | never to an agent |
| 4 | change the delivery configuration | never to an agent |

Rungs 1 and 2 are the only ones with a real case, and both share a property that makes them
tolerable: they cause work that the *existing* gates then evaluate. Rungs 3 and 4 bypass
evaluation, which is why the line is drawn between them.

## One door

Per [one-validation-door](../../../../_laws.md#one-validation-door), autonomous access goes
through one declared surface, and the callers are enumerable. The tempting alternative — the
agent runs the delivery system's command-line tool with a credential in its environment — has
no door at all: every capability the tool has is in scope, forever, and nothing can enumerate
what was used. A declared tool surface can expose rung 0 and rung 1 and simply not implement
rung 3.

The credential itself never lives in the plan, in the agent's prompt, or in a file the agent
can read. It is supplied by the surface at call time. Where it is stored is
credential-vault's subject; that it is never materialized into agent-visible context is this
one's.

## Every action is attributed and recorded

An autonomous action is recorded against **the agent's own identity**, distinct from the
person who started it, with both retained. Two questions have to be answerable later — "what
did this agent do" and "on whose behalf" — and a shared identity answers neither. A retry that
appears in history as having been performed by a person who was asleep is a record that
actively misleads.

Record, at minimum: which identity, which action, which target, when, and the outcome. This is
the audit-logging subject's shape; what this technique requires is that autonomous actions are
in it at all, on the same footing as human ones rather than in a side channel.

## Expiry and revocation

Per [creation-names-reaper](../../../../_laws.md#creation-names-reaper), a grant declares its
own end at issue:

- **Short-lived by default.** Hours, not months. A long-lived credential is a decision to stop
  reviewing the grant, made once, silently.
- **Revocable while work is in flight**, and revocation actually stops the work. A revocation
  that only prevents the *next* action leaves the current one running, which is the case that
  matters — revocation is reached for during an incident, not during a review.
- **A named owner.** An unowned grant is never revoked, because nobody knows whether anything
  depends on it.
- **Rate-limited.** A loop that retries a job every second is not malicious and does not need
  to be; the limit exists because autonomous callers fail in loops.

## Do not confuse read scope with data exposure

A read grant that can fetch logs can fetch whatever is in the logs, and delivery logs
routinely contain material nobody meant to publish — configuration dumps, tokens printed by a
verbose tool, customer data in a fixture. Widening read access to an agent widens it to
wherever the agent's context subsequently travels. Treat log content as sensitive by default,
scrub at the producing end rather than the consuming end, and take a broad read grant as a
reason to audit what is in the logs rather than an occasion to skip that.

## Decision rules

- Read and write are separate grants, issued separately, never bundled.
- Grant rung 0 freely; rungs 1 and 2 narrowly and revocably; never rungs 3 or 4.
- Access goes through one declared surface with enumerable callers, never a bare tool plus a
  credential in the environment.
- The credential is supplied at call time and never enters agent-visible context.
- Every autonomous action records the agent identity and the human behalf, in the main audit
  record.
- Grants are short-lived, rate-limited, owned, and revocable in-flight — revocation stops work
  already running.
- A broad read grant is a reason to audit log contents, not a reason to skip it.

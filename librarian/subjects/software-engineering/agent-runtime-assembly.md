---
subject: agent-runtime-assembly
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# agent-runtime-assembly

## 2026-09-02 - forged by intake `deer-flow` v2 ([[2026-09-02-deer-flow-v2]], run intake-deer-flow-0902-v2)

**Born from a routing count.** The 2.0.0 front half
([[2026-09-02-deer-flow-v2-replication]]) read seven design decisions off an
agent harness and found four with no subject whose golden path models their
forces: the hook chain around model and tool calls as a composition contract;
code loading from an operator-only tier with isolation and fail-open by
failure origin; long-running remote work kept out of the loop behind a
bounded projection; and durable conversation state under a frozen checkpoint
mode with asymmetric compatibility. All four shared one HOME IF NEW, which is
the mechanical XL trigger. The subject sits in `llm-agent/runtime-and-io`
between the gateway's admission door and the model call.

**Six techniques**, forged expert-first by one worker and reconciled against
the source at `08b27aef`: `semantic-hook-placement`, `assembly-identity`,
`operator-tier-code-loading`, `host-routes-win`,
`bounded-projection-of-external-work`, `checkpoint-mode-custody`. Three
source-tree applications (python) from the worker; two fleet applications
(rust) from the director - one `code` better and shipped, one `simulation`
not-better with its condition written into the technique.

**Boundaries stated on both sides.** mcp-tools (wire contract; its scope
paragraph now points here for in-process plugins and host custody of tool
work); prompt-assembly/fingerprinting-and-cache-keys (prompt digest versus
assembly digest); time-travel-replay (restore of conversation state points at
checkpoint-mode-custody); ci-execution-trust/injected-code-scope-ladder (the
runtime's tier instance); job-coordination (technique 5 consumes a lease, does
not define one); fleet-orchestration (the receipt middleware's placement is
technique 1's example, its verification stays there).

**Open, recorded by the worker.** Q1: checkpoint custody may become a second
subject when a third custody decision (lineage, replay base, branch seeding)
lands - re-scan condition in the source note. Q2: two-layer authorization
(assembly-time capability filter plus run-time execution check from one
policy) is a sentence in the golden path and a candidate seventh technique.

**Apply debt.** Four of six techniques are unapplied with return conditions;
the fleet has no runtime extension surface, no contributed routers, no
per-run assembly record and no modal checkpoint store today.

## 2026-09-02 - `/intake` gstack (run `intake-gstack-0902`, intake 2.1.0)

Source-tree application `node--operator-tier-code-loading` written against a Stop hook
that runs a command declared in the repository's instruction file only after the operator
records its content hash in a per-repo trust store; any edit invalidates trust; every
absence fails open; grants are logged with a tty flag. The tree reaches the technique's
rule by a different door - the repo file proposes, the store enables - and admits the gap
in its own comment: the grant is agent-runnable, so the log rather than the store is
where a determined actor is caught. Structural confirmation; no amendment.

## 2026-09-02 - `/intake` hermes-agent (run `intake-hermes-0902`, intake 2.1.1, Opus workers)

Four techniques from the extension-host system of a peer runtime, each with its own mechanism (no folds, argued): `observer-and-mutator-surfaces` (two registration surfaces with opposite return contracts; veto-by-throw rejected because policy denial and contributor bug become indistinguishable downstream), `rewrite-before-the-gate` (a request rewrite runs outside the availability, guardrail, approval and observer gates so policy evaluates the effective value; the continuation is single-use so a post-processing failure never re-executes a non-idempotent tool), `honest-hook-registry` (a timeout requires a safe abandonment direction, so coverage is an allowlist with reasons and lift conditions; no event name registered ahead of a live emit site), `session-scoped-capability` (a client-surface capability resolves from the session source never a process env slot - the golden path had named this absence itself). Source-tree application `python--rewrite-before-the-gate`. The golden path intro and the capability-roster paragraph were updated by the director to reflect the count and the landed pairing. Cross-subject correction applied in `advisory-guard-fail-mode`: "bound every handler" now carries the safe-direction predicate. Fleet: pof is the strongest seam (a direction proposal was written there); personas is the second (the peer comparison study names its runner hook surface).

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

## 2026-09-03 - `/intake` adaptive-agentic-worms (run `worms`, intake 2.3.2)

One technique, `guard-input-custody` (11th): a guard's policy inputs must sit outside
the write reach of the party the guard constrains. The source was a community walkthrough
of a security preprint, and the mechanism it supplied is the **re-read trap** - refreshing
a policy file on every decision is not freshness against a governed party that can write
it, it is re-reading that party's most recent edit, and the careful instinct (never cache,
always re-read) is exactly what produces the vulnerable design. The measured instance:
an autonomous agent found the denylist restricting it inside its own working tree and
rewrote it; the layer that held was in the supervising host, outside the agent's
namespace.

Placement was contested and argued three ways. `operator-tier-code-loading` orders config
tiers by writer but its axis is *whether a file names code* - a denylist names none, so it
passes that rule trivially, and its writer table (operator / administrator / service) has
no row for the governed process itself. `rewrite-before-the-gate` is ordering within a
turn, not custody of durable inputs. `candidate-write-access` in `eval-harness` states the
same underlying rule first and states it well, for the measurement lane; the boundary
between the two subjects is now written on both sides, and it is a real one - **a
measurement can be defended by changing what the optimizer chases (a declared holdout
needs no cooperation from the candidate); a confinement cannot, because it must hold
rather than be believed in.**

The vendor-refusal candidate folded in as the technique's last section rather than
becoming its own landing: a control operated by a service binds the parties who route
through that service and is *absent* rather than weakened for anyone else. Routing around
a refusal you do rent stays owned by provider-routing in the media bundle; the
discriminator is stated in prose, not linked.

Applied `code`/`better`, `ab-paired`, against this registry's own purity gate - which
selected its denylist from a key in the governed bundle's own index file and degraded to
a weaker profile with a note when the key was absent. One deleted line took a planted
violation from red to green. Custody moved into the checker. Application
`node--guard-input-custody`.

Second application the same day, `python--guard-input-custody`, against a fleet project's
memory evaluation harness - and it amended the technique. The harness's confinement is an
injected clock that **cannot** be placed out of reach, because backends load into its own
process; the tree answered the custody question honestly with "no", declined to call the
convention a guard, and built a differential check instead (replay one scenario at two
base dates, require identical rendered recall, normalising generated ids and absolute
instants first). The technique gained a section from that seam - detect the escape when
placement is impossible - with the normalisation condition and the limit stated: it
detects rather than prevents, and a deterministic escape that does not vary with the probe
passes it. `not-better` as a verdict, confirmation as a fact, and the corpus is the thing
that improved.

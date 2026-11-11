---
subject: webhook-ingestion
domain: software-engineering
last_touched: 2026-11-11
dry_streak: 0
---

# webhook-ingestion

First touch: [[2026-08-22-4]], external reconcile against `frain-dev/convoy`
@ `2b60cc6` (v26.6.6). Gained `go--duplicate-and-replay-dedup` — second stack;
single-stack debt cleared. Hint held.

## Open leads (banked, convergence rule applies)

- The dedup namespace component must be an immutable identifier, never a
  display name — a rename re-partitions dedup memory.
- Two dedup predicates over one identity is a named hazard; one predicate per
  identity, or an explicit per-path pairing rule.
- Two-tier check: a cheap advisory fast path explicitly non-authoritative,
  plus the authoritative claim inside the write transaction. (Fail-closed half
  is the SECOND SIGHTING of the gate-fails-closed lead — see self-healing.)
- Dedup memory bound and data retention must be independent knobs — enabling
  retention silently shortened a security window here.
- Duplicate absorption must not increment the success counter without a
  duplicate counter beside it.

## Cross-subject proposals

- Any pre-authentication body read is bound by the same size cap as the main
  read (the 32 MB multipart hole beside a 50 KB policy) → payload-bounds.
- A stage consuming the body before verification must restore it
  byte-identically → payload-bounds / sender-authentication.
- Provider-specific verifiers frequently ship without a timestamp window; the
  receiver adds it → sender-authentication.

## Applied to the technique layer

- 2026-08-22-6: **fail closed when the dedup instrument fails** applied to `duplicate-and-replay-dedup` ([[2026-08-22-6]]).
- 2026-08-22-8: **the digest fallback is the default, not a feature** (opt-in-guard family) applied to `duplicate-and-replay-dedup` ([[2026-08-22-8]]).
- 2026-08-22-10: `duplicate-and-replay-dedup` now cites the promoted `absent-guard-is-loud` law ([[2026-08-22-10]]).

## 2026-09-02 - lead placed by [[2026-09-02-1]]

- **A slow endpoint changes provider behaviour.** From [[plan-entitlements]]'s
  spec application: a hosted checkout waits on the webhook response (order of
  ten seconds) before redirecting; an unacknowledged invoice-created event
  delays finalization by days. Delivery-side facts, not entitlement facts.
  Return when this subject is next opened; check prior art first.

## 2026-09-02 - `/intake` hermes-agent (run `intake-hermes-0902`, intake 2.1.1, Opus workers)

Boundary correction on the relay clause of the topology menu: "verification at the final hop, never delegated to the middle" assumes the final hop can hold its own copy of the secret. Where the relay is the SOLE holder of a shared multi-tenant signing secret and each final hop is a customer-managed, internet-exposed process, obeying the clause means distributing the secret to every tenant - the cross-tenant compromise verification exists to prevent - and where a bearer credential lives inside the signed body, preserving the bytes and stripping the credential are the same operation. Discriminator written beside the rule: who can hold the secret, and what distributing it would cost. The default stands. Enforced in the source by a test asserting the relay package imports no platform crypto.

## 2026-11-11 - /harvest backlog 2-027 ([[../../sources/2026-09-16-agent-own-inbox]], /shift filler)

New technique `signature-names-the-relay`, better, blind-ab, plus a paragraph in the golden
path's authentication section and an index bullet: when the signer is a relay (inbox, code
host, form service), the signature proves who delivered the event, not who caused it, so a
receiver that starts a run gates the wake on the relay-asserted author (as far as the relay
authenticates it) and keys the run-budget bucket on that author; an endpoint bucket after
the signature check is spent by strangers' signed events. Not covered: `sender-authentication`
owns the digest, `session-capability-conjunction` gates the outbound step, prompt-safety fences
the content; none decides who may cause a run.

Blind A/B, claude-opus-5, no tools, no MCP, fresh temp folder per run, no permission bypass,
3 runs per arm, rubric, target and floor written first, one blind judge per probe with a planted
reference and bad answer. Probe: a fleet desktop app's real webhook receiver (HMAC mandatory,
per-trigger rate limit after HMAC, payload published as the woken agent's input). Round 1 (both
arms hold sender-authentication, session-capability-conjunction and the prompt-safety inventory):
A 12 against B 7, target 3. Round 2, declared after it, adds rate-limiting key-design and
trusted-author-verdict-channel to both arms: A 12 against B 6. Every arm-B run named the
relay-versus-author gap unaided and fenced the payload or gated the outbound step; one round-1
run added a sender allowlist, none keyed the bucket on the author, no round-2 run gated the
wake, and one endorsed the after-signature endpoint bucket as correct. Floor (drop the
signature because it does not name the author) 6 of 6 both arms; controls held. Only the wake
clause landed; the content-taint half is cited, not restated. Fleet defect reported, not fixed.

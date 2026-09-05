---
layer: application
type: application
subject: usage-limit-governance
technique: enforcement-placement-and-reconciliation
stack: node
status: forged
verified_on: 2026-09-05
verified_against: node@20
applied: code
ab_verdict: better
proof: ab-paired
---

# Node: what a fail-open client seat's worst case actually is

LightTrack's TypeScript client (read at commit `b92d37e`, 2026-09-05; CI
pins `node-version: "20"`, the package has no `engines` field) is one of
three SDKs that port the same pre-spend admission — the technique's
client-side seat — under one shared contract. This application asked
whether the seat meets the three honesty rules the technique now names,
and whether the tree states the worst case those rules imply anywhere an
operator reads. The rust sibling had already found the second half
missing; this run measured what the missing sentence should say, and it
was not the sentence the corpus expected.

## The seat is at parity, and the contract proves it

`AdmissionCache.admit` (clients/typescript/src/admission.ts:155-183) answers
in the same order as the Rust and Python ports: an unexpired advertised
wait refuses; a view older than the TTL admits and flags `stale: true`
(line 169); `usageRatio >= 1.0` refuses `at_cap`; a positive shed fraction
runs `shedTicket(rule, eventId)`, "ported from `lighttrack_core::shed_ticket`"
(line 70) — the server's own function, not a re-invention. `Enforce` is
`"off"` unless set (index.ts:563-573), and a blocked call is sent as a
zero-usage event tagged `lt_blocked_locally` only when `recordBlocked` asks
for it (admission.test.ts:50-74). The structural fact is that none of this
rests on three separate suites agreeing: `clients/contract/fixtures/limits.json`
pins **twelve** admission verdicts, including a stale one (a view at the cap
observed at t=0, admitted at t=60s under a 30s TTL, expected `ok: true,
stale: true`, lines 679-701), and each SDK's `pre_spend_admission_verdicts`
contract test replays all twelve (contract.test.ts:195-207; the Python and
Rust suites do the same). The two language-local stale tests this run
drafted for TypeScript and Python turned out to be duplicates of that
fixture case and were reverted — the contract already held the claim.

## A and B: which worst-case sentence is true

The technique obliges a pre-provider seat to "state its mode and its
worst-case overshoot". The rust application read the bound off the TTL:
"a client's view is at most 30 seconds old, so the worst-case overshoot is
whatever the app spends in 30 seconds" — staleness window × max rate. That
sentence and its rival were run as two predictions against the same inputs
on the same instrument, the SDK caches with an explicit clock:

- **Input 1.** Last response said `usage_ratio: 0.5` at t=0; the server
  crossed the cap afterwards; no response since. Admit at 29.999s, 30.001s
  and 600s.
- **Input 2.** Same start; one ingest response carrying `usage_ratio: 1.0`
  arrives at t=1s. Admit at 1.001s.

**Arm A** (bound = TTL × rate) predicts the client stops admitting once the
view is 30s old. **Arm B** (bound = one send round-trip when the server is
reachable, no client-side bound when it is not) predicts admit-and-flag
past 30s, and a refusal one response after the crossing.

Read: TypeScript and Python both admit at 30.001s and at 600s with
`stale: true`, and refuse `at_cap` at 1.001s on input 2; Rust's contract
run of the fixture's stale case reads the same. Arm A is right in 0 of 3
SDKs, arm B in 3 of 3. The TTL bounds how long a *refusal* can stand on
old evidence — over-prevention — and says nothing about under-prevention,
because a fail-open seat admits past it by design. "Staleness × max rate"
is the worst case of the fail-*closed* seat this tree deliberately did not
build.

## What shipped

The measurable was operator-facing surfaces stating the seat's worst case:
0 before, 1 after. One paragraph landed in `clients/README.md` under the
"It fails open" property, commit `6cdb080` on `main`, unpushed: the 30s
bounds refusal, not spend; reachable, the overshoot is the calls in flight
during one send round-trip, one step behind a server cap that is itself one
call late; unreachable, the client admits everything and nothing in the SDK
bounds that spend — which is what the provider's own ceiling is for, the
technique's backstop rule stated where a user of the seat will read it.
Gates: `npm test` 43 pass, Python `unittest discover` 41 pass,
`gen-sdk-matrix.mjs --check` current. No product code changed; the seat
already did what the technique says.

## What the tree hands back to the technique

The rust sibling's bound sentence is refuted by this reading and should be
amended to match. The technique's own text is consistent with the finding
but does not yet say it: the "stated staleness" a client seat fails open
past bounds the refusal, and a reader who takes it for a spend bound will
write the wrong number in their documentation, as the corpus itself just
did. One sentence in the client-side bullet — *the staleness window is the
bound on how long a refusal can rest on old evidence; under a fail-open
rule the spend past a crossing is bounded by the next response, and by the
provider ceiling alone when no response comes* — is the correction owed.

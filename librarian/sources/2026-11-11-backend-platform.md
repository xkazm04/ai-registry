---
source: gh-appwrite-appwrite
kind: repo
url: https://github.com/appwrite/appwrite
title: "Self-hosted backend platform repository, /shift cluster backend-platform"
author: "1 vendor: the project's maintainers"
words: 55600
extracted: 11
accepted: 1
declined: 0
leads: 3
already_covered: 2
untriaged: 3
currency: 0
dispatched: 0
applied: 1
shipped: 0
run_id: shift-backend-platform
siblings: 1
fetches: 3
commit: c800a2c089929f564b7efd410957711168517be3
licence: BSD-3-Clause
rescan_when: "a release after c800a2c0 changes the abuse-limit or realtime authorization code; or 8 weeks elapse (2027-01-06)"
---

# Self-hosted backend platform, mined under /shift, 2026-11-11

Plan `plan-web-20261110`, cluster `backend-platform`, board run `shift-backend-platform`. One source:
a vendor's open-source backend-as-a-service repository (a large PHP monorepo with a hosted twin), read at
commit `c800a2c0`. Licence BSD-3-Clause, read by the miner from the licence file. **No code was copied;
everything below is design in our own words.** The miner swept a shallow sparse clone (request
authorization chain, abuse-limit class, key class, realtime adapter, roles and scopes config, collection
security flags, workers config), read nothing it executed, and deleted the clone by name. The lander made
no clone and spent 3 fetches: the abuse-limit source file at the mined commit (raw, to re-check the
miner's quotes), and two pages of an independent web-security training vendor (a brute-force lab whose
bypass is a counter reset by a successful login, and its race-conditions page naming the anti-brute-force
limit overrun and atomic state changes as the fix). No GPU, no install. Phase 7.7: gate=skipped.
`librarian-scan` was not run, so GAIN is scored at the lower value.

**Expected yield, stated first:** a vendor product repository whose docs tier is thin and whose dense
first-party writing is in code comments on the auth, abuse and realtime paths. A design record and a few
amendments. One voice, so no within-batch convergence. That held, with one technique, because an
independent source reaches the same rules.

**The cluster question** (would any wired project change?): **no.** Every project's backend is settled
(a managed document store, a managed SQL backend with row policies, local SQLite) and none has an open
backend decision. Design only.

## What landed

- **New technique `rate-limiting/failure-reserved-counting`** (12th in the subject), linked from the
  golden path's "Which step carries the counter" section. On a door that bounds guessing, count the wrong
  answer, not the arrival; reserve the hit atomically on arrival and give back one hit on success, never
  reset; a refusal by any limit releases what the other limits reserved; pacing limits may exempt trusted
  callers, a secret-guarding limit counts everyone; caller-chosen key parts are tenant-qualified in a
  shared store, the address is not; a fail-open direction on login is declared with its bound. Five
  concurrent test properties. Ran under the Phase 5 score (3/0/2, accept): GAIN 2 (new technique, scan not
  run) +1 convergence (the training vendor's lab and race-conditions page reach the reset bypass and the
  overrun independently); RISK 0 (the abuse-limit file re-read in-run at the mined commit: failures-only
  docblock, reserve on arrival and give back, project qualification for user id and caller-chosen
  parameters with address keys left bare, the trusted-caller exemption and the `everyone` flag on limits
  that guard secrets); append only. Not re-read by the lander: the release-on-refusal and fail-open
  comments in the request controller (miner's quotes only). The release rule is written as
  `limiter-topology`'s "evaluate all, then commit all" in its atomic form, which the corpus already
  states, so it does not rest on the source.
- **A boundary the fleet taught, written into the technique.** The Phase 7.5 seam hunt found a pairing-code
  confirm in a wired project that compares and counts under one write lock, with a fixed delay per miss and
  a withdrawal at the fifth. That holds the overrun invariant without a reservation, because the check is
  local and inside the critical section. The technique now says reservation is the price of deciding the
  outcome after admission, and names the cheaper form.

## Triage

| # | Claim | Prior art | Read | G/R/C | Outcome |
| --- | --- | --- | --- | --- | --- |
| C1 | Failure-only limits reserve on arrival and give back on success, never reset | `metered-step-selection` chooses a step, not an outcome; nothing models failure counting or the overrun | real gap | 3/0/2 | **landed** (technique) |
| C2 | A refusal by one limit releases the failure hits other limits reserved, or an address cap becomes an aimed cross-account lockout | `limiter-topology` § evaluate all, then commit all | partial | - | folded into C1 (the atomic form of a stated rule) |
| C3 | Key parts from caller-chosen identifiers are tenant-qualified; address keys are not | `key-design` § one derivation, one authority | partial | 1/1/1 | folded into C1 for failure limits only; the general `key-design` amendment stays **untriaged** (below) |
| C4 | Trusted callers skip pacing limits, never a limit that guards a secret | `limiter-topology` § exempt set | partial | - | folded into C1 (declared on the limit) |
| C5 | Realtime delivery reuses the read path's role set; expiry is checked per delivery because expiry emits no event | `realtime-events` models the consumer side and partner fan-out | real gap | n/a (lead) | **lead** L1 |
| C6 | Role-changing events re-resolve open connections by default, with an allowlist of exempt events, never a deny-list | same | real gap | n/a (lead) | **lead**, with L1 |
| C7 | A minted key holds no scope and no expiry beyond its minter's | `authorization/ceiling-before-consent` (requested grant before human approval) | partial | 1/1/1 | **untriaged** (below) |
| C8 | Read authority over users hides credential fields unless the caller also holds write | `authorization`: no field-level redaction keyed to write authority | partial | 1/2/1 | **untriaged** (below) |
| C9 | Route scope plus row grants, opt-in item grants unioned with container grants | `authorization`, `browser-credential-boundary/default-deny-plus-defaulted-owner` | catch | - | already covered |
| C10 | A server key disables row checks wholesale; its scope list is the only fence | `browser-credential-boundary` | catch | - | already covered |
| C11 | Queue concurrency declared per worker as data (ordered writes pinned to 1; usage concurrent so it cannot starve mail) | `background-jobs`, not verified | thin | n/a (lead) | **lead** L2 |

Scored rows ran under Phase 5; C5, C6, C11 are leads under the corroboration table.

## Untriaged (anchors kept)

- **C3, `key-design`:** "does this value mean the same thing in every tenant?" as the second form of "can
  the caller change this?". Anchor: the abuse-limit constructor comment (re-read): without the project, a
  caller on any project spends the count of that account or address everywhere. Amendment, one voice, GAIN
  1; banks for a second voice or a fleet tree with a shared multi-tenant limiter store.
- **C7, `authorization/ceiling-before-consent`:** a key-minted key is bounded by the minter's scopes AND
  expiry (none at all if the minter expires); the one exception (organization key minting project keys)
  still bounds lifetime. Anchor: the key class docblock, "a key is a fixed grant" (miner's quote, not
  re-read). Return when an agent or CI flow in the fleet mints credentials from credentials.
- **C8, `authorization`:** read scope over users is not authority over their credentials; minted server
  keys exempt because their minter could grant write. Anchor: the request controller (miner's quote, not
  re-read). Return when a second source states field redaction keyed to write authority, or a fleet admin
  surface exposes user records to a read-only role.

## Leads

- **L1, realtime authorization of open connections (C5, C6).** Delivery authorized from the same
  permission data as reads; the connection holds its roles; session expiry checked before every delivery;
  user events re-resolve that user's connections unless allowlisted; deleting a team closes connections
  holding its role; guest connections capped per IPv4 address or IPv6 /64. Self-reported cost: about 15 ms
  to match one event at 100,000 subscriptions. Home: no subject models server-side authorization of a push
  to principals whose authority changes mid-connection; `realtime-events` is consumer-side. One NONE in its
  system, short of a forge handoff. Return when a second source covers server fan-out authorization, or a
  fleet project subscribes clients to a managed realtime channel (probe: revoke a membership, publish,
  assert nothing arrives).
- **L2, worker concurrency as data (C11).** Return when `background-jobs` is next touched; check it there.
- **L3, the rate-limiting ceiling.** The subject is at twelve techniques. The open lead in the subject note
  (is nine a bar?) stands undecided; this landing adds to the case for a structure pass.

## Not extracted

The monorepo RFC (a packaging question no project has; it names an individual author, stripped), the
function runtimes and executor (out of tree), OAuth and messaging adapters, MFA challenge types, storage
formats (catalogue breadth), the README's agent-first pitch (advertisement), 48 package READMEs (names only).

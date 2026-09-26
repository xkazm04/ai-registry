---
layer: application
type: application
subject: priced-authority
technique: never-persisted-token-class
status: forged
stack: next
verified_on: 2026-09-26
verified_against: next@16
applied: code
ab_verdict: better
---

# A whole web session in the never-persisted class (Next.js, kp)

Written against `kp` at `797102a9c` (Next `16.3.5`, `better-sqlite3@13`),
reading `app/_lib/auth/`. The Go application of this technique shows the class
as a narrow option beside a persisted default. Here it is the only class. Every
browser session the product issues - the password operator's, a member's, the
anonymous demo's - is a signed payload that no table records. That makes the
tree a test of the technique's forfeits list at full scale, and of the one
revocation lever that has to be wired at every gate to count.

## The construction

`session.ts` signs `{workspace, iat, exp, epoch, sub?, org?, role?, op?}` with
HMAC-SHA256 under `KP_SECRET` and sets it as a 7-day `__Host-` cookie.
Validation recomputes the MAC, compares it in constant time, checks `exp`
against the clock, and checks `epoch` against `KP_SESSION_EPOCH`. The same
check runs a second time at the edge in `edge-verify.ts` with Web Crypto.
Nothing is looked up, so nothing is written at login. It is a MAC and not an
AEAD, so the payload is readable by its holder. The technique's construction
encrypts, and here nothing in the payload is secret.

There is no class prefix. The tree mints one class, so no consumer has two
validation paths to confuse. The prefix rule binds only once an issuer offers
a second class beside the first.

## The forfeits, confirmed

- **Renewal is a login.** `session-issuer.ts` states it directly: "A renewal
  is a mint." The workspace switch runs the same account, org and membership
  checks as sign-in, and before that module existed it re-minted a fresh
  7-day token for a disabled user. The technique's reason (the expiry lives
  inside the token, so extending it means issuing a new one) is the design
  the tree arrived at after that defect.
- **No individual revocation.** Both `session.ts` and the organization docs
  say a session cannot be killed before its TTL without a store, and list
  that store as deferred.

## Revocation without a row: which levers the tree has

- **The key.** Rotating `KP_SECRET` would kill every session, but the same
  secret also encrypts stored provider keys and paired-agent keys
  (`pairing.ts:45`, `bridge-client.ts:107`). A key with a second job cannot be
  the break-glass lever, because pulling it destroys data. The tree therefore
  added `KP_SESSION_EPOCH`, a not-before generation that carries only the
  all-sessions lever. **The condition this adds to the technique: key rotation
  is a revocation lever only when the key does nothing else. Otherwise give
  the class a separate generation counter.**
- **The source.** A session that carries `sub` names an account row, and the
  row can be disabled. `capabilitiesForUserInWorkspace` re-reads `users.status`
  on every request, and its comment records the leak that taught it: a
  disabled member "kept reading candidate PII" for the rest of the 7-day TTL.
  The handler gate `isOperator()` did not re-read the account. It admits
  "any valid, non-demo session". It is the only gate on 67 of the 162 route
  files that call it: archetypes, calendar connect, the agent catalog and
  the companion threads, among others. The count is route files with no
  call into any live capability read. **Deviation, fixed below.**
- **The parent.** None exists. Sessions do not nest.

## The deviation and the fix (applied: code, better)

The technique says revoking the source "fails the post-decryption check on
every token that named it". That holds only if every gate that admits on the
token runs the check. The tree ran it at one gate out of two.

Probe first. A test signs a cookie for a real account, disables the account,
and asks `isOperator()` again with the same cookie. On the unmodified tree the
active assertion passed and the disabled one failed (`true !== false`, and
the runner judged it "failed twice - a real failure, not a flake").

The fix (`require-operator.ts`, `accountStillLive`) re-reads the account a
session names, through a call-time import that keeps the data layer out of
the module's static graph, and refuses a missing row or `disabled`. It uses
the issuer's predicate and the capability read's predicate. `isHomeOrgReader`
takes the same check. Committed as kp `460e805b`.

Four test files had signed cookies for accounts that never existed: the
gate's own file and three route suites. That the old gate accepted those
cookies was the same bug seen from the test side. They now create the
accounts, and all four files pass (41 of 41). `tsc --noEmit` is clean. The
full unit run has five other red files (store migrations, tenant keys,
scorecard commit, task-outcome vocabulary). They fail the same way with
the fix reverted. Verdict: **better**, because a disabled member's cookie
now fails at the handler gate on the next request, not up to 7 days later.

## What the fix cannot reach

The password operator's session carries `op: true` and no `sub`. It names no
row, so there is nothing to re-read. Its only early exit is the epoch, which
also signs out everyone else. The technique says "Do not use it for an
operator's own session", and this tree is that case: its highest-privilege
session is the one it can revoke least precisely.

An unmerged branch in the tree adds the targeted store: a table keyed by
principal (`user:<sub>`, `op:<workspace>`) and by exact `iat` or an
all-before cutoff, consulted at the proxy and at the handler gates. It is a
denylist, and its comments choose to **fail open** when the store cannot be
reached, on the grounds that signature, expiry and epoch still gate the
request. That is the golden path's "the ledger again under a different name",
with the failure direction reversed. A ledger that cannot be read admits no
token. A denylist that cannot be read admits every revoked one. The branch
states the trade and bounds it, but a stolen operator cookie revoked through
that store stays live for exactly as long as the store is unreachable. The
branch also keys a device by `iat`. It accepts the collision (two logins in
the same millisecond share it) as over-revocation, but a renewal mints a new
`iat`, so a revocation must be recorded against the cookie the holder has
now. Recorded, not changed: the branch has an owner and has not landed.

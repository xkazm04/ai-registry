---
layer: application
type: application
subject: admission-queue
technique: priority-and-fairness
stack: next
verified_on: 2026-11-16
verified_against: next@16
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Next — per-key limits over a key the caller writes, with no floor underneath

How a Next.js application's server-side rate limiting stands against
[priority-and-fairness](../techniques/priority-and-fairness.md), and
specifically against its rule that **an unattested origin key is a fairness
scheduling key, never a capacity shard**.

## The seam

Two independent admission gates, both sharding capacity on a key the caller
supplies:

- A per-route limiter keyed on the **left-most** entry of the forwarded-for
  header — the hop the client itself wrote — falling back to a constant string
  when the header is absent.
- A public-API limiter keyed on an API key read from a header *or a query
  parameter*, where validation is a format regex unless an allow-list
  environment variable is configured.

Each key gets its own counter and window. Neither is attested. The gates guard
routes that spend real vendor money per call, including one commented in the
tree as an expensive operation, and one write path.

**There is no process-wide ceiling anywhere in the application.** No semaphore,
no spend meter, no concurrency cap in the platform config. The only
concurrency limiter in the tree is a within-request fan-out helper.

## The arms

The application's own limiter logic, transplanted verbatim into a harness, with
its own configured constants, driven by one interleaved trace of ten honest
callers and one attacker:

- **A** — as shipped: per-key capacity shard on the mintable key.
- **B** — the technique's repair: one global budget sized for the honest
  population, with the same key retained only for round-robin ordering.

## What the arms said

| policy | attacker keys | admitted/min | attacker share | honest total |
| --- | --- | --- | --- | --- |
| A | 1 | 110 | 9.1% | 100 |
| A | 1,000 | **10,100** | 99.0% | 100 |
| B | 1,000 | **100** | 99.0% | **1** |

Both halves of the rule reproduce. Occupancy under A is the per-key limit times
the number of keys, and the number of keys is free, so the bound is unbounded
in a quantity the attacker chooses — a 101× overshoot at a thousand keys.
Under B it is fixed at the global bound regardless. And the attacker's
**share** is 99.0% under both, which is the arithmetic the technique now
states: round-robin over a mintable key protects occupancy and protects nothing
about share.

**Verdict: better** — the rule predicted the occupancy blow-up, predicted the
share figure numerically, and named the missing global bound, and all three are
present here.

## The result that changed the technique

The most useful number in the experiment is the one nobody was looking for:
under the *correct* policy, honest throughput fell from 100/min to **1/min**.
The global bound protects the resource and does nothing for the honest caller —
it converts an unbounded occupancy loss into a total-but-bounded share loss,
and the broken policy had been serving honest callers out of capacity it should
never have admitted. A global bound is therefore necessary and not sufficient,
and only an attested key restores the honest caller's slice. That sentence is
now in the technique, and the seam is where it came from.

## The structural fact

Across the managed fleet, twenty-one server-side capacity-control key
derivations were enumerated. **Four are caller-mintable, and all four shard
capacity** — the forbidden case in every instance, with no exceptions in either
direction. Two applications of seven run per-key limits with no process-wide
ceiling at all.

Two independent trees had already reached the rule without it: one carries a
code comment recording that a caller-influenced prefix let an attacker mint a
fresh limiter bucket per prefix and bypass a per-tool cap, fixed by prefixing a
server-assigned identifier; another states the whole rule as a module header,
including both failure directions. That is corroboration rather than adoption,
and it is the better kind — the rule is reached independently where the key is
attested and violated everywhere it is not.

## What this realization cannot do

The harness measures admissions per minute against a synthetic trace, not cost.
It can show that a thousand keys buy a hundredfold overshoot in *admissions*
and cannot show what that overshoot costs, because the routes it guards call
metered vendors whose per-call price is not recorded on the request. Sizing the
global bound in currency rather than in requests needs a spend meter this tree
does not have.

## 2026-11-16 re-check: the seam was retired, and its successor ships the same case one layer down

Read at goat `ae2c83f` (2026-10-25, `next ^16.1.3`), a public clone, read-only.

**The measured seam no longer exists.** `1a4d7c5` (2026-10-12, "v2 becomes the app and v1
is deleted") removed `src/lib/api/rate-limiter.ts` and its test along with every route that
used it. The arms above and the verdict `better` stand for the v1 seam as it was measured on 2026-08-31; they
describe history now, not the running tree.

**The replacement is a per-user daily allowance keyed on a guest identity.**
- `src/v2/ai/quota.ts:2-10`: per task, per user, per rolling 24 h (pool 10, critic 60, gaps 20,
  tag 10, persona 5, recommend 10).
- `src/v2/ai/route-kit.ts:31-41`: the paid path needs a user id, and "a guest session is
  enough"; `src/v2/ai/server.ts:21-26` resolves it from the bearer token.
- `src/v2/auth/session.ts:35`: every visitor without a user gets one from an anonymous sign-in,
  and the schema baseline says so (`supabase/migrations/20261009000000_goat_v2_baseline.sql:14`).
- The vendor's own page (https://supabase.com/docs/guides/auth/auth-anonymous, read 2026-11-16):
  anonymous users "use the `authenticated` role", the sign-in is rate-limited per IP at "30
  requests per hour which can be modified in your dashboard", and CAPTCHA or Turnstile is
  "strongly recommended". The tree has neither (no match for captcha or turnstile under `src`
  or `supabase`).

So the key passes as an authenticated user and costs one sign-in to replace. At the default mint
rate one address holds up to 720 guest identities a day, and the critic allowance alone becomes
43,200 calls a day per address. **There is still no process-wide ceiling**: no global count, no
spend meter, nothing in the six routes but the per-user check. This is the technique's forbidden
case again, one layer down. The technique gained the sentence it lacked ("issued by the system is
not the same as attested").

**The per-key allowance does not hold per key either.** The gate counts usage rows before the
call (`server.ts:33-44`) and the row is written only when the stream finishes
(`src/app/api/critic/route.ts:23,38`; `src/app/api/pool/route.ts:55,84`). K concurrent calls from
one guest all read the same count and all pass, which is the golden path's third lifecycle rule
(check and take are one operation). A call that throws records nothing (`pool/route.ts:86-92`),
so failures are free against the allowance.

Not run. These are findings from reading the tree; the defect is the project's to fix.

### 2026-11-16 (second pass) - the guests are a stock, not a daily flow

The figure above counts one day of minting, and it is too low. Re-read at the same commit
(`ae2c83f`, a public clone, read-only, `git grep` over `src` and `supabase`):
- Nothing deletes or expires guests. There is no cleanup job or cron, and there is no
  `is_anonymous` test anywhere on the paid path. The only `is_anonymous` read is the
  guest/member label in `src/v2/auth/session.ts:22`.
- `quota.ts:2-10` renews each allowance every rolling 24 h for every user id.
- The vendor page (same URL, re-read 2026-11-16) says "Automatic cleanup of anonymous users is
  currently not available". It offers a manual SQL delete of guests "created more than 30 days
  ago", and the tree does not ship one.

So a guest minted on day one still draws its 60 critic calls on day thirty. After D days of
minting at the default rate, one address holds 720×D guests, and its critic take is 43,200×D
calls a day: 1,296,000 a day after thirty days. That assumes the caller keeps each guest's
refresh token. The tree carries no session time-box configuration (no `supabase/config.toml`),
so how long a guest's session lasts is set in the dashboard and could not be read. The technique's product was corrected from
"identities mintable inside the allowance's window" to "identities held".

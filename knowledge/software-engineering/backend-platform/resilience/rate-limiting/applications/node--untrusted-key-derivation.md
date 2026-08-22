---
layer: application
type: application
subject: rate-limiting
technique: untrusted-key-derivation
stack: node
status: forged
verified_on: 2026-08-22
verified_against: node@22
---

# A four-rung ladder, a platform gate, and a fingerprint that says what it is

A server-rendered marketing and community site (Next.js on Vercel, built and
tested on Node 22 per `.github/workflows/ci.yml:23`) exposes five unauthenticated
write endpoints — a waitlist, feature
votes, boosts, comments and requests — and every one of them keys its limiter on
whatever `getClientIp` returns. That function, `src/lib/server/request.ts:31-73`,
is the technique's ladder written out, and its docblock (`:5-30`) is the rare
case of the warrants being stated rung by rung rather than implied by ordering.

## The ladder, and the sentence above it

The docblock opens with the premise rather than the mechanism: forwarded headers
"are attacker-controlled when the request reaches the server without a trusted
proxy in front (preview deploys without Vercel's edge, anyone bypassing the CDN,
or platforms where the header is unauthenticated)", and reading the first hop of
the chain "is the worst case — it's whatever the attacker put in the header, so
it trivially defeats per-IP rate limits and skews analytics" (`:8-13`). Then an
explicit **"Order of trust (most → least)"** with four rungs (`:15-25`): the
platform-set connection fact, the platform's own forwarding header, the
conventional last-hop header, and the conventional chain header — each annotated
with what makes it believable, and the bottom two annotated with the condition
under which they are not.

The connection fact goes first and unconditionally (`:32-33`). There is no
authenticated rung above it because none of these doors authenticates; the
ladder is four rungs deep because the first rung of the general shape does not
exist here.

## The gate is a runtime witness, not a header name

`:43-46` is the technique's central rule as executable code: the platform's
forwarding header is read only inside `if (process.env.VERCEL === "1" ||
trustProxy)`. The comment above it (`:37-42`) states the attack in the
technique's own terms — off-platform the header "is as client-spoofable as any
other forwarded header, so an attacker could forge a fresh IP per request to
mint a new rate-limit bucket and poison abuse attribution. Gate it like the
other forwarded headers below." That is the inversion named at the site: not a
wrong address, a fresh bucket per request.

The conventional rungs sit under `TRUST_PROXY === "true"` (`:35`, `:48-53`) and
are therefore off in any deployment nobody configured — the correct default.

The gate is pinned by tests rather than by the comment. `src/lib/server/request.test.ts:22-48`
covers the ladder with the shape the technique asks for: the load-bearing
assertions are **negative** — `expect(...).not.toBe("6.6.6.6")` for the platform
header with no witness (`:27-29`) and `.not.toBe("5.5.5.5")` for the last-hop
header with no opt-in (`:37`) — so the tests fail when a rung silently reopens,
which a positive assertion about the fallback would not do. The first of them
carries its incident in the title: "the Wave-3 fix". `:23-25` pins the
precedence rule, asserting the connection fact wins over a supplied chain header.

## What the repo taught the standard

Two details here were better than the draft and are now in the technique:

- **Rejected fields are demoted to entropy, not discarded.** The fallback hashes
  the user agent, the language and encoding preferences, *and* the very headers
  the ladder just refused to trust, with the reason written beside them:
  "Untrusted XFF/real-ip: useless for identity here, fine as entropy" (`:66-68`).
  A field that failed a trust test still carries variation, and variation is
  exactly what a spreading function needs.
- **An empty fingerprint is refused rather than hashed.** `:70` checks that the
  joined source is not all-empty and returns the pooled `"unknown"` sentinel if
  it is, instead of hashing the empty string into one constant that would read
  as a derived per-client bucket. The digest is truncated to 16 hex characters
  and prefixed `fp:` (`:71-72`), so the derived value is fixed-width and cannot
  be mistaken for an address in a log — the cheap realization of "the verdict
  carries its rung".

The self-DoS derivation that motivates the whole fallback is stated at `:55-61`,
and its label is the one the companion technique requires, in the source:
"best-effort entropy and trivially spoofable, so it is NOT used for
trust/identity — only to avoid a global self-DoS."

## What the derived key is spent on

`src/lib/server/rate-limit.ts` is one process-local `Map` (`:8`) shared by every
route, keyed `` `${namespace}:${key}` `` (`:39`), so each door gets its own
ceiling from one limiter instance rather than one instance per door — identity,
not configuration. Per-route policy is a named module, e.g.
`src/app/api/votes/rate-limit.ts:1-15` (namespace `votes`, 20 per 60s). The
per-key map names its reaper at creation: `cleanupExpiredBuckets` on a five
minute `setInterval` whose handle is `unref`'d (`:11-22`), so the sweep never
holds the runtime open — the right detail on a serverless runtime.

The companion input cap lives beside the ladder: `parseJsonBody`
(`src/lib/server/request.ts:100-156`) treats a declared `content-length` as a
fast pre-check only, because "a missing or understated header must NOT be a way
to skip the cap", and enforces the real ceiling against actual bytes read from
the stream (`:106-116`, `:128-147`). Same lesson as the ladder, one layer over:
a caller's declaration is a hint, never the enforcement.

## Deviations

- **The polarity is inverted on the waitlist route, and nothing pins it.**
  `src/app/api/waitlist/route.ts:109-116` defines `rateLimit(ip, limit)` as a
  direct pass-through returning the shared *is-limited* boolean, but both call
  sites branch on its negation: `if (!rateLimit(ip, RATE_LIMIT_GET))` (`:148`)
  and `if (!rateLimit(ip, RATE_LIMIT_POST))` (`:197`) return 429. The effect is
  the exact reverse of the policy — within each minute the first 30 reads and
  first 5 signups are refused and everything after them is admitted. Every other
  route branches correctly on `if (isRateLimited(ip))`
  (`src/app/api/votes/route.ts:90`, `feature-boosts/route.ts:97`,
  `feature-comments/route.ts:105`, `feature-requests/route.ts:61`), which is why
  the name reads as safe: only the one wrapper renamed the predicate without
  renaming the meaning. There is no test over `src/lib/server/rate-limit.ts` or
  any route handler — the whole test surface for this subject is the ladder
  itself. A boolean crossing a module boundary with a name that does not state
  its direction is the defect the technique's verdict rule exists to prevent.
- **The refusal contract is three different shapes across five doors.** The
  waitlist returns a machine code plus a constant `Retry-After: 60` (`:149`,
  `:198`); feature-requests returns the constant header with no code (`:62`);
  votes, boosts and comments return a bare `{ error: "Too many requests" }` with
  no header at all (`votes/route.ts:91`). None is computed, though the bucket
  holds `resetAt` and could answer exactly. The root cause is structural:
  `isRateLimited` returns `boolean` (`src/lib/server/rate-limit.ts:31-48`), so
  the retry instant cannot cross the boundary even if a caller wanted it. The
  standard in refusal-contract stands unchanged.
- **The opt-in has no depth.** `TRUST_PROXY=true` admits the chain header and
  reads its leftmost entry (`:51-52`) — the caller's own claim. It is an
  all-hops switch; there is no hop count for the operator to state, so a
  two-hop deployment that sets it trusts the caller.
- **No canonicalization, no salt, no cap.** Trusted values are returned as
  received (a `trim()` on the chain split is the whole normalization), so case,
  port suffixes and address-family spellings each mint a bucket; the fingerprint
  hash is unsalted, so its buckets are guessable and portable between
  deployments.
- **The spread has no ceiling above it.** There is no aggregate limit over the
  unattributable class or the resource, so a caller who rotates one declared
  header mints a fresh `fp:` bucket per request. The route header states the
  consequence plainly rather than hiding it — the in-memory limiter "is reset
  per invocation and shared only within the same warm instance, providing no
  reliable protection against distributed attacks or high-volume spam"
  (`src/app/api/waitlist/route.ts:31-33`) — which is the honest half of the gap,
  and the reason the ladder's quality does not carry the whole defence.

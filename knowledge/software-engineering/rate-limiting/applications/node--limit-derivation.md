---
layer: application
type: application
subject: rate-limiting
technique: limit-derivation
stack: node
---

# A budget table where every entry carries its cost sentence

The public funnel of this repo is a serverless request app whose limits all live
in one module, `src/lib/rate-limit.ts:222-303`, as a table of
`{ name, perIp, global, windowMs }` records — one per operation class, each
preceded by the sentence that justifies its number. It is the closest thing in
the corpus to the technique's output shape, and its gaps are as instructive as
its wins.

## The ceiling: the fan-out is priced, not the handler

`SCAN_RATE_LIMIT` (`:227-234`) states the fan-out in one line — "a single
uncached scan = a GitHub ingest + an LLM completion (real $)" — and derives two
different numbers from it: "generous for a human but caps a script" per address,
plus a global spend ceiling. `CONTACT_RATE_LIMIT` (`:282-292`) prices the
non-obvious tail of an unauthenticated form: a durable row *and* a send against
a metered mail allowance ("Resend's free tier is a few thousand a month"), which
is why its per-address budget is 3/min — "a human submits this once, maybe twice
after a typo". That is the technique's justification sentence, written where the
number is.

## Read-only is not free — twice, and one of them was found the hard way

Both of the technique's slip-through families are exhibited here as fixes:

- `PEEK_RATE_LIMIT` (`:236-246`) covers a cache-only probe that "returns 204"
  and yet spends "one GitHub head request against the operator PAT for a
  never-before-seen repo plus 1-2 DB reads" — the comment names the amplifier
  exactly: "an anonymous client looping distinct repo URLs".
- `QUOTA_PEEK_RATE_LIMIT` (`:248-259`) is the sharper one, because it records
  what it cost to learn: "GET /api/quota was the ONE public endpoint with no
  limiter". A per-request-billed store (Aurora DSQL), `no-store` so no edge
  cache absorbs it, and a client meter that "re-fires it on every
  focus/visibility/pageshow". The endpoint that reports the quota was the
  cheapest way to spend money.

## The cheap mode is not the cheap path

`GATE_RATE_LIMIT` (`:269-280`) is the technique's mode rule stated in the repo's
own words: the CI gate "runs a FULL GitHub repo ingest + a head-resolve against
the operator PAT on EVERY request — even in its default (mock) mode, which only
swaps the LLM provider, not the network I/O. So an unauthenticated flood of the
default path is the same denial-of-wallet vector as the real-LLM path." The
route splits the budgets accordingly (`src/app/api/gate/[owner]/[repo]/route.ts:44-60`):
`?mock=0` takes the strict scan budget, the ingesting mock branches take the
generous gate budget, and the branch that costs nothing takes none — a warm
cache hit does only "a cheap conditional head-resolve (free 304)". That last
clause is the unbilled-call rule from the egress half of the technique, applied
as a reason *not* to charge a limiter.

## The floor: arithmetic, shown

`src/lib/integrations/ingest-guard.ts:37-56` is the best floor derivation in the
repo and reads like the technique's own worked example. It opens by naming the
failure it is avoiding — "a limit tuned to 'an API is usually quiet' would break
a legitimate exporter" — then multiplies: the client's exporter flushes metrics
on a 60s interval and logs on a 5s interval, so one developer machine produces
~1 + ~12 pushes per minute; "a 200-seat engineering org behind ONE office/VPN
egress IP therefore produces ~2,600 requests/minute at the defaults". The
per-address cap is 3,000/min, the per-instance ceiling 20,000/min, and the
comment states the headroom and the unclamped input both: "a team that lowers
the metric interval to 10s produces more". The address-as-key multiplier is
exactly the one the technique warns is not one user.

Every number in the table goes through `envInt` (`src/lib/rate-limit.ts:222-226`)
and every derivation comment ends "Env-overridable" — the deploy-time override
the technique requires, because the flush interval belongs to the client.

## The friction limit says it is one

`src/lib/public-scan-quota.ts:9-22` is the technique's "when not to use" case,
declared rather than discovered. Its own header lists the limitations as
intentional: "Knowingly attackable: an attacker can rotate IPs to mint fresh
buckets, and CGNAT/shared NAT makes many users share one bucket. That's accepted
— this is a friction/cost nudge, not a security control. The burst limiter
remains the per-request abuse backstop." The number is not derived from cost at
all: it is the Free plan's 5 scans/month (`:55-60`), i.e. chosen from the plan
shape. Reviewing that gate against a cost derivation would produce a
recommendation to harden an allowance whose purpose is to be soft.

## Deviations

- **One derivation is arithmetic; the rest are assertions.** Only the ingest
  ceiling shows its multiplication. "Generous for a human but caps a script"
  names a cost and a direction but no cadence, so the floor for the scan, badge,
  and gate budgets cannot be recomputed when the client changes — only
  re-argued. The rule stands: the ceiling sentence is not a substitute for the
  floor arithmetic.
- **Nothing is labelled underived.** No entry says "placeholder, not derived",
  so a reader cannot tell the ingest number (computed) from the badge number
  (matched to "the badge route's previous bespoke 60/min/IP", `:294-296`) —
  which is a legacy value wearing the same confidence as a computation.

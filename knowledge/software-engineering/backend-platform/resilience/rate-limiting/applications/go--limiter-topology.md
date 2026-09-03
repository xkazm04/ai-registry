---
layer: application
type: application
subject: rate-limiting
technique: limiter-topology
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# A quota ladder stated once, a status disambiguated by path, and a fair-share drain

OpenBao's resource quotas are the technique's scoped-ladder case realized in one
resolution function, with the two neighbouring amendments — the refusal that
names its authority (refusal-contract) and the per-queue cap on a shared worker
pool (key-design) — visible in the same tree. Citations are against commit
`6b5f82e1`, `go 1.27.0` (`go.mod:12`).

## The ladder, stated once and resolved once

`internal/vault/quotas/quotas.go:475-479` is the ladder as documentation:
namespace over global, mount over namespace, path suffix over mount, role over
path suffix and mount. `queryQuota` (`:480-592`) is the same ladder as code, and
it walks from the most specific rung outward — role (`:515`), exact path suffix
(`:524`), path suffix with a trailing glob (`:534`), mount (`:548`), namespace
(`:557`) — returning at the first rung that holds a declaration. The concept
doc says the same sentence in operator vocabulary: "the most specific quota
rule will be applied" (`website/content/docs/concepts/resource-quotas.mdx:41`).
Nothing is summed and nothing is minimised; the technique's precedence rule is
confirmed.

Two of the technique's ladder clauses are confirmed as well. Two declarations
at one rung are an error, not a tie: the per-rung fetch returns "conflicting
quota definitions detected" when more than one row matches (`:505-506`). And
descent is declared, not assumed: when a non-root namespace has no declaration
of its own, the walk climbs its parents and accepts a parent's quota only if
`quota.IsInheritable()` (`:569-583`), a flag carried on the quota record
(`internal/vault/quotas/quotas_rate_limit.go:77, 281-283`). The ladder's
inheritable rung was an upward lesson: the draft stated precedence but not that
a coarse declaration must *say* whether it reaches down.

The unit of counting is stated where the number is: the limiter "is applied to
each unique client IP address on a per-node basis (i.e. rate limit quotas are
not replicated)" (`resource-quotas.mdx:29-30`), and `allow` refuses to evaluate
at all without a client address (`quotas_rate_limit.go:289-297`). The exempt set
is data with a default — recovery-token, root-generation, health, seal-status
and unseal paths (`quotas.go:121-129`, `resource-quotas.mdx:52-61`) — and a
stored toggle records whether an operator has overridden it so a restart does
not clobber their set (`quotas.go:102-108`). The block interval is the
technique's ban clause: on a refused request with blocking enabled the client
address is stored with its block time (`quotas_rate_limit.go:337-342`), later
requests are refused until the interval elapses (`:312-322`), and in both cases
the retry-after header is the *ban's* end, not the bucket's reset (`:320, 340`),
which is the refusal-contract's computed-not-configured rule applied to a ban.

## The same ladder for lockout, with the kill switch above it

User lockout resolves through the same shape: "auth mount using tune >> auth
method in config file >> 'all' auth methods in config file >> default values"
(`website/content/docs/concepts/user-lockout.mdx:37-42`), with the defaults
(threshold 5, duration and counter reset 15 minutes) declared as constants
beside the parsed stanza (`internal/helper/configutil/userlockout.go:19-36`).
The disable ladder places the environment kill switch above every rung
(`user-lockout.mdx:44-48`) — the technique's "off cannot be out-ranked by a
scope" clause, confirmed.

## The status is disambiguated by the path that raised it

The client library's error classifier (`api/response.go:31-34`) treats a 429
as "quota limit reached" everywhere except on `/v1/sys/health`, where the same
status is the health signal of a standby node. The branch is exactly the
refusal-contract amendment's shape — one status, more than one meaning, the
path decides before any retry strategy is chosen. One deviation from the
dispatch that produced this application: the tree's second meaning is a
readiness signal, not an upstream provider's limit. The technique states the
rule for both; this tree exhibits the readiness case only.

## Fair-share drain: ceil(0.9 × workers / queues)

`internal/helper/fairshare/jobmanager.go:237-243` computes the per-queue cap
literally as `math.Ceil(0.9 * numTotalWorkers / numActiveQueues)`, from the live
queue count, so it is recomputed on every eligibility check as queues appear
and vanish. `getNextQueue` (`:205-226`) walks queues round-robin from the last
one served and takes the first under its cap. `addQueue` (`:324-337`) keeps a
queue's worker count across a prune-and-recreate, for the reason the technique
gives: workers may still be running jobs from the pruned queue, and wiping the
count would over-subscribe the key. One recorded limitation the tree names
about itself: "we may want to eventually factor in queue length relative to
num queues" (`:236`) — the cap is by workers in flight only, which the
technique also states; weighting by backlog is not implemented.

## Deviations

- **Refusal counting is per quota name, not per rung.** The violation counter
  is labelled with the quota's name (`quotas_rate_limit.go:303`), which
  identifies the declaration but not which rung of the ladder it sat on; an
  operator reading a refusal spike cannot tell a role quota from a namespace
  one without a second lookup. limit-observability's count-carries-predicate
  rule stands.
- **The refusal names the ban's end but not the ladder rung.** The rate-limit
  headers carry limit, remaining and reset (`:331-333`); nothing says which
  scope's declaration refused. The refusal-contract rule that the refusal names
  the *specific* limit is met by the header set only in part.

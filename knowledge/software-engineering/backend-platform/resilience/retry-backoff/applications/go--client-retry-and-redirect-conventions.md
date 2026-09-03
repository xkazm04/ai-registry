---
layer: application
type: application
subject: retry-backoff
technique: client-retry-and-redirect-conventions
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# The OpenBao API client's retry, redirect and status conventions (Go, source tree)

How the OpenBao client library at commit `6b5f82e1` (`api/`) and the agent's
auto-auth loop (`internal/command/agentproxyshared/auth/auth.go`) realize the
client-retry-and-redirect-conventions technique, and where the tree falls
short of it. Every line was re-read at the pinned commit; `go.mod` declares
`go 1.27.0`.

## 1. The retry set, and 412 joined unconditionally

`DefaultRetryPolicy` (`api/client.go:1797-1811`) wraps
`retryablehttp.DefaultRetryPolicy` — connection errors and 5xx other than
501 — and adds one status: `412`. The doc comment names the reason: 412 "is
returned by Vault when a X-Vault-Index header isn't satisfied", the
client-carried consistency index. This confirms the technique's reading of
precondition-failed as *not yet* when an index is in play.

**Deviation.** The retry is unconditional: the policy retries every 412
whether or not the request carried an index. The technique conditions the
retry on the client having sent one, because a 412 raised by a real
precondition is permanent. In this tree the gap is latent rather than live —
the periphery scout's correction stands: the server-side index middleware is
an accepted RFC (`website/content/community/rfcs/index-headers.mdx`) not yet
landed, so at this commit no server path returns a 412 the client should
*not* retry. The condition should ship with the middleware, and the retry
policy is the place to put it.

## 2. One redirect, no downgrade, handled in the retry layer

The transport is configured at `api/client.go:345-352` with a `CheckRedirect`
that returns `http.ErrUseLastResponse`, and the comment is the upward lesson
the technique now carries: without it, "retry clients may try three times on
every redirect because it sees an error from this function". The client
disables the transport's own following so that redirects are decided in the
same layer as retries.

The request loop at `api/client.go:1526-1548` follows a 301, 302 or 307 only
when `redirectCount == 0` and redirects are not disabled; it refuses when the
original scheme is `https` and the target's is not, with the error "redirect
would cause protocol downgrade"; it resets the JSON body, increments
`redirectCount`, and jumps back to the start of the loop. A second redirect
therefore falls through to ordinary response handling. The raw-request path
(`api/client.go:1655-1680`) applies the same scheme check and issues exactly
one follow-up `Do` with no loop, so it is single-hop by structure.

## 3. A 404 with data or warnings is returned as a response

Two parsers carry the rule. The read path (`api/logical.go:185-199`) and the
delete-with-data path (`api/logical.go:475-495`) both parse the body of a
404; on `io.EOF` they return `nil, nil` (a true absence), and when the parsed
secret has `len(Warnings) > 0 || len(Data) > 0` they return it as the
response. The comment at `api/logical.go:485` — "this may actually be a
wrapped 404 error" — is the case the technique describes: the status said
absent, the body said otherwise, and the body wins.

## 4. 429 disambiguated by path, and the health codes rewritten

`Response.Error` (`api/response.go:31-34`) treats 200–399 as success and adds
one exception: a 429 whose request path is `/v1/sys/health` is not an error,
with the comment "429 is the code for health status of standby nodes,
otherwise, 429 is treated as quota limit reached". That is the technique's
classify-by-raising-path rule in one predicate.

The health client goes one step further (`api/sys_health.go:20-28`): it adds
`standbycode`, `sealedcode`, `performancestandbycode` and the other role
parameters with value `299`, so that the server reports every role as a
2xx and the client's error rule never intercepts the body. The comment says
why: "the sys/health API defaults to returning 5xx when not sealed or
inited, so we force this code to be something else so we parse correctly."
The client asks for status codes its own error rule will not eat — the
technique's "where the server lets the caller choose" clause.

## 5. Jittered linear backoff, and the stop as configuration

The default client config (`api/client.go:325-329`) sets
`MinRetryWait = 1000ms`, `MaxRetryWait = 1500ms`, `MaxRetries = 2` and
`Backoff = retryablehttp.RateLimitLinearJitterBackoff`; the request loop
(`api/client.go:1493-1510`) builds a `retryablehttp.Client` from those fields
and falls back to the same linear-jitter backoff when none is set. Linear,
jittered, and the attempt cap is a field.

Two loops in the tree make fatal-versus-retry a property of the schedule
rather than a branch. The lifetime watcher, on a renewal error, constructs an
`ExponentialBackOff` with the library's default randomization factor of one
half (`api/lifetime_watcher.go:311-317`) and, on the next iteration, exits
only when `errorBackoff.NextBackOff() == backoff.Stop` or the remaining lease
duration has gone negative (`api/lifetime_watcher.go:349-351`); the loop's
one decision is whether the schedule stopped. The agent's auto-auth handler
is the cleaner instance: `autoAuthBackoff` carries an `exitOnErr` flag
(`internal/command/agentproxyshared/auth/auth.go:510-516`), and the
`backoff()` helper (`auth.go:116-130`) returns `false` immediately when the
flag is set and otherwise sleeps `current`, advances the schedule and
returns `true`. Every error site in `Run` reads `if backoff(ctx, backoffCfg)
{ continue }` and exits otherwise (fourteen sites, `auth.go:211-466`); none
inspects the error to decide. Fatal is a configuration of the backoff struct,
exactly as the technique states.

## Deviations from the standard

- **Unconditional 412 retry** (§1) — latent until the index middleware lands.
- **One-sided jitter in auto-auth.** `autoAuthBackoff.next`
  (`auth.go:535-543`) doubles then trims a random 0–25% off the top, giving a
  band of `[0.75d, d]` — narrower than the watcher's ±50% and closer to the
  cosmetic wobble backoff-design warns about. Agents that all lost the server
  at once will still cluster; a proportional band around the rung, or full
  jitter, would spread them.
- **The watcher's error backoff never returns Stop on its own.** The
  `ExponentialBackOff` at `api/lifetime_watcher.go:311-317` sets no
  `MaxElapsedTime`, which in this library means the schedule never stops;
  the effective stop is the lease running out. The shape is right and the
  stop value is configured, but by the lease rather than by the backoff.

## What to copy

`CheckRedirect` returning `ErrUseLastResponse` under a retrying client. The
`redirectCount == 0` guard with the scheme check before the body is reset.
The `Warnings || Data` test on a 404 body. The `Path == "/v1/sys/health"`
exception on 429 together with the `299` role codes. The `exitOnErr` field on
the backoff struct and the fourteen identical call sites that read it.

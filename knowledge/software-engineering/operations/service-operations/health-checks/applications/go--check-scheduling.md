---
layer: application
type: application
subject: health-checks
technique: check-scheduling
stack: go
verified_on: 2026-08-22
---

# Check scheduling in the Consul agent

How HashiCorp Consul's local agent decides when its health checks run.
Citations are against `hashicorp/consul` commit `6c576af` (2026-08-20),
version `2.1.0-dev`, in `agent/checks/` and `agent/agent.go`. This is a
reconciliation against an external tree rather than the consumer repo the
sibling applications cite, so the pin lives here in prose rather than in
`verified_against`, whose contract is a stack runtime version.

## 1. Render is structurally incapable of launching a probe

The technique's central inversion — attention flowing to what is looked at
instead of what is depended on — is designed out, not disciplined away.
Every check runner is a goroutine owned by the agent and started at
*registration* time (`agent.go:3372` for alias, the `chkType.Is*()` switch
above it for the rest). The readers — DNS (`agent/dns.go:1798`) and the HTTP
API (`agent/agent_endpoint.go:1054`) — call `AggregatedStatus()` over
already-recorded state and cannot trigger a probe. There is no "check this
now" endpoint at all: the cost of health checking is a function of what is
*registered*, never of who is watching.

## 2. Jittered start, self-limiting cadence

All eight interval-driven runners open the same way:

```go
initialPauseTime := lib.RandomStagger(c.Interval)
next := time.After(initialPauseTime)
```

(`check.go:110,437,603,683,775,901,1031,1116` — script, HTTP, H2PING, TCP,
UDP, Docker, gRPC, OS-service; Docker names the value `firstWait`.)
`RandomStagger` returns a uniform draw in `[0, Interval)`
(`lib/cluster.go:44-49`), so a hundred checks registered in one agent boot
do not fire in lockstep — one draw per check spreads the fleet, and the
re-armed `time.After(c.Interval)` keeps each runner's phase thereafter.

The re-arm also happens *after* `c.check()` returns, making the effective
period `Interval + probe latency` rather than a fixed rate — an anti-pile-up
property: a slow probe delays the next one instead of stacking concurrent
instances. The script and OS-service runners make it explicit, blocking on
the process even after a timeout kill: "Now wait for the process to exit so
we never start another instance concurrently" (`check.go:202-204`, same
shape at `:1166-1168`).

Beneath the per-target cadence sits a hard system floor: `MinInterval =
time.Second`, commented "Do not allow for a interval below this value.
Otherwise we risk fork bombing a system" (`check.go:35-38`), enforced at
registration and *clamped upward with a warning* rather than rejected
(`agent.go:3069-3074` for HTTP, repeated verbatim for the remaining interval
types at `:3116`, `:3147`, `:3172`, …). An impossible cadence yields a
logged correction, not a dead check.

## 3. TTL: the schedule inverted, staleness rendered as its own fact

`CheckTTL` (`check.go:238-331`) has no interval and no probe. It is a bare
`time.Timer` armed at `Start()` (`:266`) and reset by each push from the
service (`SetStatus`, `:329`). Firing *is* the verdict: the runner logs
"Check missed TTL, is now critical" and reports critical (`:285-289`).
Crucially the expiry output is not the last verdict frozen — it is
`"TTL expired (last output before timeout follows): …"` (`:302-307`), so a
consumer can tell a check that *observed* failure from one that *stopped
reporting*, while still carrying the last thing it said. The technique's
"stopped running renders as unverifiable-going-stale" lands in the output
field, because the status field has no third state to spend: Consul's
vocabulary is passing/warning/critical, and this resolves to critical.

## 4. Observation rhythm separated from reporting rhythm

`StatusHandler` (`check.go:1186-1253`) sits between every runner and the
state store, holding `successBeforePassing`, `failuresBeforeWarning` and
`failuresBeforeCritical` (wired per check at `agent.go:3031`). The runner
observes on every tick; the store is notified only when a threshold is
crossed, so a flapping dependency does not flood the catalog — a gossip
fleet's version of the technique's digest. Both counters start **at** their
thresholds (`:1205,1208`, comment "in order to immediatly update status
after first check"), so damping never delays the first verdict, and each
branch resets the opposite counter (`:1216,1233`), so thresholds count
*consecutive* outcomes, not lifetime totals.

## 5. On-event scheduling exists, and it is the only place backoff lives

`CheckAlias` has no interval. `runQuery` (`alias.go:181-254`) blocks on a
catalog index with `MaxQueryTime = 1 * time.Minute` (`:185`) and
re-evaluates only when the aliased target's checks actually change — the
technique's on-event trigger, at the cheapest cost per unit of information.
It is also the only runner that backs off: after `checkAliasBackoffMin = 3`
failed attempts it sleeps `(1 << shift) * time.Second`, capped at
`checkAliasBackoffMaxWait = 1m` (`:18-22`, `:202-212`), guards the shift
against overflow at 31 (`:204-206`), and resets `attempt = 0` on success
(`:233`).

**Deviation.** The eight interval-driven runners never back off. A check
critical for a week re-probes at its full interval forever; the technique's
"repeated identical outcomes earn a stretched interval" is unimplemented
outside alias. Defensibly — a mesh values bounded recovery-detection latency,
and §2 already bounds aggregate load — but the trade is silent. The standard stays.

## 6. The scheduler names its reaper, twice

Each runner's `Stop()` closes `stopCh` and its goroutine returns from the
`select` (`check.go:98-105`, `:271-279`); re-registering a check ID stops
the existing runner before replacing it (`agent.go:3065-3068`), so no
orphaned probers accumulate across reloads. The agent also reaps the
*checked thing*: `reapServices` wakes every `CheckReapInterval` (default
`30s`, `agent/config/default.go:233`) and deregisters any service critical
longer than its `deregister_critical_service_after` (`agent.go:2120-2163`,
`:2165-2178`) — a timeout itself floored at `check_deregister_interval_min`,
default `1m`, clamped with a warning (`:3389-3398`, `default.go:232`).

## Reconciliation summary

Confirmed: probe-on-render designed out; per-target cadence with a single
jittered start; a named interval floor; a self-limiting period preventing
concurrent instances; event-driven watch as a first-class trigger; staleness
rendered distinctly from failure; observation/reporting rhythm split; runner
and subject reapers both named. Deviation: no backoff on repeated failure
for the eight interval-driven types — alias alone implements it. Not present
by scope: prefetch on intent (no UI, so no navigation signal); digest
cadence and interrupt-worthy membership (Consul emits state, leaving
notification policy to whatever watches its API).

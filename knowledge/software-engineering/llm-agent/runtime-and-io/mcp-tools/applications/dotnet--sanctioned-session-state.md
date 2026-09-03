---
layer: application
type: application
subject: mcp-tools
technique: sanctioned-session-state
stack: dotnet
verified_on: 2026-09-03
verified_against: dotnet@10.0.400
---

# `HttpServer.Distributed` — affinity shipped arguing against itself, gated on a display string

`microsoft/mcp` at commit `bc2a3b4eeceb2281cdf944920b7fdb2ccc73f5df` is Microsoft's
official MCP server monorepo — a shared `core/Microsoft.Mcp.Core` framework, ~50 tool
areas, three servers, and one small package that is the whole subject here:
`core/Microsoft.ModelContextProtocol.HttpServer.Distributed`, eleven source files
implementing session affinity for a protocol revision that deliberately removed sessions.
The stack version is witnessed by `global.json`, which pins the SDK to `10.0.400` with
`rollForward: latestFeature`; `Directory.Build.props:4` sets `net10.0`.

It is an unusually clean realization: the counter-argument, the double opt-in, the
ephemeral owner identity, and the 404 channel are all present and all deliberate, with
the reasoning written into the code rather than into a design document. And the one thing
the technique flags as the recurring trap — scoping the eviction predicate on a display
string — is here too, tested thoroughly, and the tests are what make it permanent.

## The counter-argument comes first, on the page

`README.md:5-17` is the technique's "ship it arguing against itself" implemented as
document order. Before any usage text:

- an `[!IMPORTANT]` block: "This package is optional and is **not required** for MCP
  2026-07-28 stateless protocol compliance. Use it only when you intentionally need
  custom stateful routing behavior across replicas" (`:5-7`);
- a `[!TIP]`: "prefer header-based stateless routing (`Mcp-Method`, `Mcp-Name`) at your
  gateway/load balancer" (`:9-11`);
- then the heading **`## When Not To Use It`** (`:13`) with three enumerated conditions,
- and only then **`## Why Use It`** (`:19`).

The refusal precedes the sales pitch by six lines. That ordering is the entire mechanism,
and it is cheap enough that its absence elsewhere is never a resource problem.

## Two gestures, and neither one alone

Registration is `AddMcpHttpSessionAffinity` (`ServiceCollectionExtensions.cs:25-75`); it
registers the options validator, a `HybridCache` with a source-generated serializer, the
`ISessionStore`, the listening-endpoint resolver, YARP's reverse proxy, and the endpoint
filter — and every registration but the cache and the proxy uses `TryAdd*`, so a consumer
that has already supplied its own store, resolver or filter keeps it. Application is
`WithSessionAffinity` (`MapSessionAffinityExtensions.cs:22-35`), an
`IEndpointConventionBuilder` extension whose doc says plainly: "Use this on the return
value of `MapMcp()`… Requires calling `AddMcpHttpSessionAffinity()` on the builder
first." Registering without mapping installs nothing on any route; mapping without
registering throws at filter-factory time on `GetRequiredService`. The technique's
transitive-dependency argument is satisfied by construction — the second gesture is a
line in the endpoint mapping, where a grep for what is sticky will find it.

## The restart oracle, with its reasoning in a comment

`SessionAffinityEndpointFilter.cs:44-46`:

```
// IMPORTANT: The OwnerId (_localOwnerId) is regenerated as a new GUID each time the
// application restarts. Session ownership data does not persist across restarts, so
// stale session entries are cleared when encountered.
_localOwnerId = Guid.NewGuid().ToString();
```

The identity is ephemeral by construction, per process, and the record carries it beside
the address (`SessionOwnerInfo` holds `OwnerId`, `Address`, `ClaimedAt`). The detection
is `:84-104`: when the fetched `ownerInfo.OwnerId != _localOwnerId` **and** the recorded
`Address` equals the local address, "Application restart detected" — the record is
removed, `ownerInfo` and `sessionId` are both nulled, and the request is handled locally
as a fresh session. A different owner at a *different* address is the ordinary case and
logs `SessionOwnedByOther` before forwarding.

This is the technique's argument reduced to one comparison. There is no deregistration
hook, no heartbeat, no lease anywhere in the package — the dead process's claim is
invalidated by a fact the reader already has in hand, so a crash costs nothing that an
orderly shutdown would have saved. The law inversion the technique describes is visible
in the same file: the *session* id survives (it is the routing key, extracted from
`Mcp-Session-Id` and re-claimed on the response path at `:110-127` when the server mints
a new one), while the *owner* id is the restart boundary and must not.

One incidental piece of engineering worth recording, because it is the kind of thing that
gets discovered rather than designed: `HybridCacheSessionStore.cs:84-95` implements
sliding expiry by hand — "HybridCache uses absolute expiration. We need to implement
sliding expiration manually by re-setting the value with a new expiration time on each
access. Only refresh if we retrieved an existing entry (not if we just created it)." The
`wasCreated` flag threaded through the `GetOrCreateAsync` factory (`:63`, `:71`) exists
only to avoid a redundant write on the claim path. Affinity records need sliding lifetime
because a session's liveness is what they track; the cache offered absolute only.

`SemanticLogging.cs:13-69` then gives the two detection channels distinct event ids for
the same remediation: `RemovingStaleSession = 50104` ("Removing stale session after
receiving 404 from remote endpoint") and `RemovingStaleLocalSession = 50106` ("Removing a
stale session that points to the local address but has an outdated OwnerId"). The
remediation is identical — evict the record — and the causes are not, so an operator
watching 50104 climb is watching a different failure than one watching 50106. Deriving
both from one "session evicted" line would have destroyed exactly that distinction.

## The structural fact: the eviction gate reads a display string, and the tests pin it there

The second channel is `:141-159`: when a forwarded request returns 404, and there is a
session id, and `IsMcpEndpointRequest(httpContext)` is true, the ownership record is
removed. The scoping predicate the technique demands is present, with the right comment
("Only remove session if this is an MCP endpoint request (not a health check, metrics,
etc.)") — and it is implemented as the trap, at `:162-187`:

```
var displayName = endpoint.DisplayName;
if (!string.IsNullOrEmpty(displayName)
    && (displayName.Contains("mcp", StringComparison.OrdinalIgnoreCase)
        || displayName.Contains("sse", StringComparison.OrdinalIgnoreCase)))
{
    return true;
}
return false;
```

An endpoint's `DisplayName` is a human-facing label derived from the route pattern and
handler; it is not routing metadata and nothing guarantees its content. The method's own
comment betrays the confusion: `:165` says "Check if the endpoint has MCP-related
metadata or path patterns" and `:172-173` says "Check for MCP-specific endpoint
metadata / The endpoint display name typically contains route pattern information" —
the author is describing metadata and reading a string. Both failure modes the technique
names are live: a server that maps its MCP endpoint at, say, `/api/v1/agent` produces a
display name containing neither token, so eviction silently never fires and stale records
accumulate until the sliding expiry catches them; and any unrelated endpoint whose label
happens to contain those three letters acquires the power to evict live sessions on a
404.

There is a sharper observation available, and it is the one that makes the finding
structural rather than stylistic. The method's *first* comment (`:164`) is "The session
affinity filter is only applied to MCP endpoints." If that is true — and it is, because
the filter is installed by `WithSessionAffinity` on the return value of `MapMcp()`, one
endpoint at a time — then the predicate is guarding against a case that cannot occur, and
its only reachable effect is the false negative: refusing to evict on an MCP endpoint
whose name lacks the token. A check that cannot fire in its intended direction and can
fire in the unintended one is worse than no check.

**And the test suite has locked it in.** `tests/…/SessionAffinityEndpointFilterTests.cs`
covers the behaviour thoroughly across four quadrants — 404 from an MCP endpoint evicts
(`:213`), 404 from an SSE endpoint evicts (`:277`), 404 from a non-MCP endpoint does not
(`:336`), 200 from an MCP endpoint does not (`:395`) — plus 404 with no session id
(`:451`) and the full restart-reclaim path (`:661`). Every one of those constructs its
endpoint the same way:

```
var endpoint = new Endpoint(requestDelegate: null,
                            metadata: new EndpointMetadataCollection(),
                            displayName: "POST /mcp");
```

**Empty metadata, and the distinction carried entirely by the display string** — `"POST
/mcp"` versus `"GET /health"`. The suite does not merely fail to test the predicate's
robustness; it depends on the fragile spelling. Rewriting `IsMcpEndpointRequest` to key
on endpoint metadata — the correct fix, and the one the technique prescribes — turns
every one of these tests red, because there is no metadata in any of them to key on. A
thorough behavioural suite has made the implementation detail load-bearing, which is the
mechanism by which a known-fragile predicate survives review indefinitely. The non-MCP
quadrant is the tell: `"GET /health"` with a session-affinity filter attached is a
configuration `WithSessionAffinity` cannot produce, so the suite spends a test on an
unreachable case and none on the reachable one (`MapMcp("/api/v1/agent")`).

## What this realization cannot do

It cannot tell an operator that eviction has stopped happening. There is no counter for
"forwarded 404 on a session we declined to evict", and 50104 falling to zero is
indistinguishable from a healthy fleet — the absent guard is silent, which is the whole
reason the display-string predicate is dangerous rather than merely ugly.

It does not degrade to nothing at one replica, quite. The technique asks that a single
instance need no shared infrastructure, and the local path is genuinely free — a request
whose owner is `_localOwnerId` returns `await next(context)` at `:129` with no
forwarding — but `AddMcpHttpSessionAffinity` unconditionally registers `HybridCache` and
`AddReverseProxy()` (`:49-51`, `:70`). With no L2 distributed cache configured,
`HybridCache`'s in-memory tier alone is correct for one instance, so the behaviour is
right; the dependency footprint is not conditional on replica count.

And nothing here touches authorization, which is correct and worth stating: the affinity
key is read from a header (`ExtractSessionId`, `:189`) and used only to choose a
destination address. The filter authenticates nobody, and forwards the original request
for the downstream to authorize as it would any other. Affinity is a placement decision
made before authorization, exactly as the boundary requires — the package's silence on
credentials is the design, not an omission.

---
layer: application
type: application
subject: read-serving-replicas
technique: forward-on-storage-error
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Forward on storage error, and the pre-dispatch list, in OpenBao

How OpenBao (a Go secrets server, module `github.com/openbao/openbao/v2`,
`go 1.27.0` in `go.mod:12`) realizes
[forward-on-storage-error](../techniques/forward-on-storage-error.md) and its
complement
[preemptive-forward-for-known-writes](../techniques/preemptive-forward-for-known-writes.md).
Citations are against commit `6b5f82e1acc4868c19e5b11c0aee25ce4fd3ec38`; paths are
relative to the tree root. The design document is
`website/content/community/rfcs/standby-nodes-handle-read-requests.mdx`, whose
"Enhanced Forwarding Logic" section states the standard's rule verbatim —
"forwarding should depend on the error message returned from invoking the
request", with a storage shim returning `ErrReadOnly` — and whose "Downsides"
section admits the reason: "we won't be able to detect all requests that will
write to the storage in the middleware."

## 1. The shim is the barrier's own read-only flag

The read-only shim sits inside the encryption barrier, the layer every write
passes through before reaching the physical backend. `AESGCMBarrier` carries
`readOnly atomic.Bool` (`internal/vault/barrier/aes_gcm.go:81`), and
`putWithBackend` checks it before doing anything else — before the sealed
check, before selecting a key term (`aes_gcm.go:806-811`):

```go
if b.readOnly.Load() {
    return logical.ErrReadOnly
}
```

The flag is set to true by the standby when it enters read-enabled service,
under the state lock so it cannot race the leadership wait
(`internal/vault/ha.go:1097-1099`, in `runReadEnabledStandby` at `ha.go:1073`),
and back to false in the active path immediately after the active context is
created (`ha.go:838-839`, "Mark storage as readable again"). **Confirmed:** the
gate observes the write, below every cache and above the backend.

## 2. The sentinel surfaces at the edge, and forwarding fires on it

The HTTP layer's `request` helper (`internal/http/handler.go:947-952`) calls
`core.HandleRequest` and, before any response processing, asks
`logical.ShouldForward(err)`; a true result returns a "please forward" flag to
the caller, which invokes `core.ForwardRequest(r)` (`handler.go:926`) over the
cluster's forwarding channel and writes the leader's status, headers and body
back as its own. The `ErrPerfStandbyPleaseForward` sentinel is defined at
`sdk/logical/error.go:48`; the tree raises it "as early as possible", as the RFC
asks, from inside token validation (`internal/vault/request_handling.go:411,
423, 587`) and the token lookup at `request_handling.go:2635`, which checks
`errors.Is(err, logical.ErrPerfStandbyPleaseForward)` before any other error
handling. **Confirmed.**

**Deviation.** `ShouldForward` itself (`sdk/logical/error.go:139-146`) matches by
*message text*: `strings.Contains(errMsg, ErrReadOnly.Error())` and three sibling
substrings. The verdict that was computed as a typed sentinel at the barrier
reaches the edge as a string comparison — exactly the erosion the technique's
verdict-survives-boundary citation warns of. It works because plugin errors are
wrapped with `%w`-style messages that preserve the substring, but a plugin that
rewords a read-only failure silently turns a forward into a 500. The standard
stays: the edge should branch on `errors.Is` against the sentinel, and the
substring match is a compatibility shim, not the gate.

**Extension.** Plugins can declare a write-shaped operation up front:
`sdk/framework/backend.go:245-256` returns `logical.ErrReadOnly` before invoking
the handler when the operation's `ForwardPerformanceStandby` property is set and
the node is a standby. This is the technique's shim rule applied one layer up —
the plugin, not the edge, classifies its own operation — and it is inherited
vocabulary from the upstream's separate performance-standby tier; the RFC lists
the `ErrPerfStandbyPleaseForward` name and the `disable_performance_standby`
flag among the things the unified design removes, and at this commit the name
survives.

## 3. The pre-dispatch list, in two entries and one inverse

`handleCancelableRequest` (`request_handling.go:1059-1075`) holds the closed
list. The response-wrapping entry is the standard's second shape exactly, with
the argument in the comment (`request_handling.go:1067-1075`):

```go
// Request wrapping incurs storage (cubbyhole) writes, if the request
// is handled on standby node, it doesn't fail and response is not empty
// it will ultimately fail to save the wrapping token, and we'd still
// have to forward the request.
// Preemptively forward the requests with wrapping info provided.
case req.WrapInfo != nil && req.WrapInfo.TTL != 0:
    if c.Standby() {
        return nil, logical.ErrPerfStandbyPleaseForward
    }
```

The inverse entry sits directly above it (`request_handling.go:1062-1066`):
`sys/metrics` on a standby that is not read-enabled returns
`ErrCannotForwardLocalOnly` rather than forwarding, because "we cannot be sure
if we have an active token store to validate the provided token" and because a
forwarded metrics request would describe the leader. The same local-only guard
appears at `internal/http/logical.go:358` and `internal/http/help.go:38`. This
is the upward lesson the technique's "what must never forward" section records.
**Confirmed**, and the list is as short as the standard asks: two positive
entries and one inverse, with the barrier catching the rest.

## 4. What the tree does not do

There is no single table from which the middleware, the documentation and a
conformance test all read; the list is a `switch` in `handleCancelableRequest`
and the plugin-level flags are per-operation properties. The technique's
one-vocabulary rule is therefore met only by the list being short enough to
audit by eye. No test in the tree asserts "one execution, one effect" from the
leader's audit line across every operation on a two-node cluster; forwarding is
exercised per feature. Both are recorded as gaps in the application layer, not
lowered in the standard.

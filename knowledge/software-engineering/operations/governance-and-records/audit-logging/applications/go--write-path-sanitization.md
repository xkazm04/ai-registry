---
layer: application
type: application
subject: audit-logging
technique: write-path-sanitization
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1.27
---

# Hashing whole requests: the salted-HMAC walker and the pre-parse budget

OpenBao (Go, commit `6b5f82e1`) audits every request and response at
its request seam without knowing their shape, which puts it in the
technique's "when the value must be carried" case. This application
records how the tree realises the keyed-hash rule, its exemption list,
list elision, the walker's blind spot, and the complexity budget that
bounds what the ledger pays before the body is decoded.

## Values hashed, keys kept, one salt per sink

The walker's contract is the technique's rule verbatim: `HashStructure`
"hashes all the values within the structure. Only _values_ are hashed:
keys of objects are not" (`internal/audit/hashstructure.go:198-199`).
Its `Primitive` visitor skips map keys (`:316-318`), touches only string
kinds (`:321-327`), and replaces the value with the callback's output
(`:350`). The callback is the sink's salt: `HashString` and the
`HashAuth`/`HashRequest`/`HashResponse` family all bind
`salter.GetIdentifiedHMAC` (`:22-24`, `:32`, `:50`, `:105`), which
prefixes the HMAC with its algorithm name
(`sdk/helper/salt/salt.go:152-156`) so a record says how it was hashed.
The salt is per backend, created lazily from that backend's own storage
view (`internal/builtin/audit/file/backend.go:176-196`), and each backend
exposes `GetHash` (`:198-201`) — the hash oracle the technique describes,
by which a reader holding a value can find its records, and which the
config-devices RFC names as the detector for an operator who switches a
device to raw output
(`website/content/community/rfcs/config-audit-devices.mdx`, Security
Implications).

## The exemption list is declared, and timestamps are structural

Two exemptions exist and they are the two the technique allows. A
string that parses as an RFC 3339 timestamp is left untouched
(`hashstructure.go:331-337`) — structural, because a hashed time answers
nothing. Every other raw value must be named: the walker carries
`IgnoredKeys` (`:226`, `:339-348`), which the core fills per mount from
`audit_non_hmac_request_keys` and `audit_non_hmac_response_keys`
(`internal/vault/request_handling.go:1206-1218`) — a list an operator
sets on the mount and a reader can inspect, never a per-record guess.
The token accessor is a third, sink-level exemption (`hmac_accessor`,
`file/backend.go:62-69`), defaulting to hashed.

## Lists are elided to counts before hashing

With `elide_list_responses` on and the operation a list
(`internal/audit/format.go:207`), `doElideListResponseData`
(`format.go:572-587`) replaces `keys` with its length and `key_info`
with its size. In the hashed path this runs inside `HashResponse` before
the walk (`hashstructure.go:133-140`), and the comment states the
technique's reason: "elide data before potentially spending time hashing
it". In the raw path the formatter does it itself on a shallow copy
(`format.go:210-220`), so elision holds whichever hash form the sink uses.

## The walker's blind spot, and how the tree closes it

The tree's fix for the two byte-typed advisories (CVE-2025-62513 and
GHSA-rc54-2g2c-g36g, `changelog/2002.txt`) is the normalisation the
technique's amendment describes rather than a marker. `HashResponse`
deep-copies the data by a JSON round trip (`getUnmarshaledCopy`,
`hashstructure.go:164-175`), which turns every struct into a map and
every byte slice into a string the walker will now hash; the raw HTTP
body, which that round trip would base64-encode, is reverted to its
direct string form first (`:126-131`) and then hashed whole. The test
pins the effect: a `[]byte("Response")` raw body lands as a single
`hmac-sha256:` token (`hashstructure_test.go:455-467`). The 2.4.0 release
notes call this redaction (`website/content/community/release-notes/2-4-0.mdx:46-47`);
in the tree it is hash-whole, one of the two honest forms.

## The complexity budget runs before the decode

`parseJSONRequest` (`internal/http/json.go:22-50`) enforces the budget
first, resets the body, decodes, and resets again — the reset-at-every-
boundary rule made literal. `EnforceJSONComplexityLimits`
(`json.go:116-169`) tokenises the raw body once, charging an estimated
memory cost per token (`:81-114`) and, "separately", counting strings
"to reduce cost on the auditing subsystem" (`:153-158`); the doc comment
notes that keys count too because they "aren't HMAC'd but will
contribute to overhead" (`:117-121`). The limits ride the context
(`:63-79`) from the listener, defaulting to roughly 32 MiB of estimated
memory and 1000 strings (`internal/vault/request_handling.go:69-73`,
`internal/http/handler.go:337-342`, `:386-387`), and an exceeded budget
is a client error naming "high complexity" (`json.go:26-30`), not an
audit failure.

The body itself is made seekable once, in the size-limit middleware
(`internal/http/util.go:112-118`), after the byte cap has been applied
(`:84-86`) and with a stated list of the readers that need it
(`:92-104`): the quota role lookup, content-type disambiguation, the
complexity limit, and request forwarding. Every reader resets after
itself — the quota middleware after reading the login role
(`util.go:180-183`), the parser twice (`json.go:36`, `:46`), and the
logical handler before dispatch (`internal/http/logical.go:122`,
`:212`). Snapshot uploads are the declared exception (`util.go:108-112`),
because a snapshot is expected to exceed the cap and is never audited
by body.

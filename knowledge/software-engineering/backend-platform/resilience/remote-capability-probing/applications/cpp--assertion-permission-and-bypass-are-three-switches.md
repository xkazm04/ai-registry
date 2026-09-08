---
layer: application
type: application
subject: remote-capability-probing
technique: assertion-permission-and-bypass-are-three-switches
stack: cpp
status: forged
verified_on: 2026-09-04
verified_against: cpp@17
---

# Three switches declared correctly, and a bypass whose unset value retires the feature

How duckdb-wasm — an analytics engine compiled to WebAssembly that reads
Parquet and CSV files out of HTTP and S3 endpoints from inside a browser tab —
realizes, and where it falls short of,
[assertion-permission-and-bypass-are-three-switches](../techniques/assertion-permission-and-bypass-are-three-switches.md),
read at commit `def100b4`. The C++ standard the library compiles against is what
`verified_against` names (`lib/CMakeLists.txt:9`, `CMAKE_CXX_STANDARD 17`).

## The three switches exist, separately, with the right meanings

`lib/include/duckdb/web/config.h:73-79` declares `FileSystemConfig` with exactly
the three controls the technique names, each as an `std::optional<bool>`
defaulting to `std::nullopt` — so "unset" is a representable third state and not
a silent `false`:

- `allow_full_http_reads` — "Allow falling back to full HTTP reads if the server
  does not support range requests" (`:74-75`). This is the **permission**.
- `force_full_http_reads` — "Force full HTTP reads, suppressing use of range
  requests" (`:76-77`). This is the **bypass**.
- `reliable_head_requests` (`:78`) — the **assertion**: the operator already
  knows this peer's metadata responses are trustworthy, so the ladder may skip
  the disambiguating second request.

They are parsed independently from the configuration document at
`lib/src/config.cc:105-116`, one `HasMember`/`IsBool` pair each, with no
precedence rule collapsing them. The declaration side of the technique is
followed exactly, and the assertion is scoped where the technique says it
should be: `reliable_head_requests` also appears on `DuckDBConfigOptions`
(`config.h:69`), the per-connection option block, so it can be set for a peer
rather than only globally.

The ladder that consumes them is
`packages/duckdb-wasm/src/bindings/runtime_browser.ts:249-352`, and it reads as
the technique's three meanings in order. Line 252 gates the first probe on
`!file.forceFullHttpReads && (file.reliableHeadRequests || !file.allowFullHttpReads)`
— the bypass suppresses everything, the assertion admits the cheap path, the
permission decides whether the ladder even needs the expensive rung. Line 285
gates the fallback on `file.allowFullHttpReads`. The comments at `:255` and
`:288-290` state the acceptance tests as conjunctions in the shape
[advertised-support-is-not-evidence](../techniques/advertised-support-is-not-evidence.md)
demands: "good IFF status is 206 and contentLenght is present", and for the
second rung "good IFF status is 206 and contentLenght2 is 1 -> otherwise, iff
200 and contentLenght2 == contentLenght". The `200` branch at `:344-350` logs
`fall back to full HTTP read for: ${file.dataUrl}` and keeps the body it just
downloaded — the announcement the golden path asks for, and the reason the
transition is visible at all.

## The deviation: the bypass defaults to on, at two sites

`lib/src/io/web_filesystem.cc:328-330` serializes the per-file settings that the
runtime layer above will read:

```cpp
if ((data_protocol_ == DataProtocol::HTTP || data_protocol_ == DataProtocol::S3) &&
    filesystem_.config_->filesystem.force_full_http_reads.value_or(true)) {
    value.AddMember("forceFullHttpReads", true, allocator);
}
```

`value_or(true)` resolves an unset bypass to **on**. The same expression appears
again in the global serializer at `:524-526`. The line immediately above each of
them, `:324-327` and `:521-523`, resolves `allow_full_http_reads` the same way —
which is defensible for a permission, since granting the expensive path by
default only costs money when it is taken. For the bypass it is the failure the
technique names: any deployment that did not explicitly set
`forceFullHTTPReads: false` never probes at all, takes `runtime_browser.ts:285`
directly, and transfers whole objects for every read. Nothing fails. Every query
returns the right answer.

The asymmetry between the three declarations makes the defect legible: the
assertion is serialized with an explicit `if/else` writing `true` or `false`
(`:332-337`, and `:527-531` where it is `value_or(true)` into a two-armed
branch), while the two `value_or(true)` guards above emit the member only when
the value resolves true — so a consumer cannot distinguish "unset" from
"explicitly false" for either of them. The third state the `std::optional` was
declared to preserve is discarded at the boundary.

## The enumerating test that certifies nothing

`lib/test/webdb_test.cc:142-158` (`TEST(WebDB, GlobalFileInfo)`) is the test over
the global serializer — the last place the default could be caught. It asserts
`doc.HasMember("cacheEpoch")` (`:150`), `doc.HasMember("allowFullHttpReads")`
(`:151`) and `doc.HasMember("s3Config")` (`:152`). It does not mention
`forceFullHttpReads`, and it does not mention `reliableHeadRequests`, both of
which the serializer it is testing emits eleven lines apart from the member it
does check.

This is both halves of the technique's test rule failing together. The test is a
**presence** assertion rather than a value assertion, so it would pass even on a
payload whose bypass was serialized with the wrong value; and it runs against
the default configuration — `make_shared<WebDB>(WEB)` at `:143` with no
`FileSystemConfig` supplied — which is the exact configuration in which the
defect is present, and asserts nothing about it. The switch nobody enumerated is
the switch whose default nobody argued.

## What the tree taught the technique

Three things: two upward lessons, and one confirmation of a rule the draft
argued from first principles.

The confirmation is the **ladder ordering**. The gate at `:252` reads
`file.reliableHeadRequests || !file.allowFullHttpReads`, so the metadata-only
probe is issued only when the operator has asserted it trustworthy, or when the
expensive rung is forbidden and there is nothing to lose. In the ordinary
configuration — full reads permitted, no assertion — the tree skips the metadata
question entirely and opens with the one-byte fragment read at `:291-303`, which
is exactly the inversion
[the-probe-that-is-also-the-first-read](../techniques/the-probe-that-is-also-the-first-read.md)
argues for, arrived at independently.

The **assertion switch** was the part the draft was weakest on. `config.h:78`
plus `runtime_browser.ts:252` show what an assertion is actually for: not "skip
the probe" in general, but "skip the *disambiguating* rung", because the ladder's
disambiguating request at `:309-328` exists only to recover a length when the
cheap metadata answer cannot be trusted. An assertion that admits a cheap path is a different
and better-behaved thing than an assertion that admits no path at all, and it is
why the assertion is the one of the three that is safe per peer.

The **serialization boundary** is where the defaults are actually decided. The
`std::optional` declarations in `config.h` are correct; the defect is entirely in
two `value_or` calls in a different file, in a function whose job looked like
formatting. That is the reason the technique's test rule points at the
serialized payload rather than at the configuration struct: the struct preserves
the third state and the wire drops it, and only a test over the wire can see the
drop.

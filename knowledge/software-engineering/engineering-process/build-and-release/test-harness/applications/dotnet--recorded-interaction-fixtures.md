---
layer: application
type: application
subject: test-harness
technique: recorded-interaction-fixtures
stack: dotnet
verified_on: 2026-09-03
verified_against: dotnet@10.0.400
---

# Test-proxy recordings in the Microsoft MCP monorepo

`microsoft/mcp` at commit `bc2a3b4eeceb2281cdf944920b7fdb2ccc73f5df` — Microsoft's
official MCP server monorepo, a shared `core/Microsoft.Mcp.Core` framework over ~50 tool
areas under `tools/`. The stack version is witnessed by `global.json`, which pins the SDK
to `10.0.400` with `rollForward: latestFeature`; `Directory.Build.props:4` sets
`net10.0`. Forty-two of the tool test projects carry an `assets.json`, so this is the
technique at a scale where every dial the technique warns about has been turned by
somebody.

## The seam is in the production transport factory, and compiled out of release

`Services/Http/HttpClientFactoryConfigurator.cs:30-39` is the whole wiring:
`ConfigureDefaultHttpClient(this IServiceCollection services, Func<Uri?>? recordingProxyResolver = null)`
calls `services.ConfigureHttpClientDefaults(...)`, so the seam applies to *every*
`HttpClient` the container hands out — not to a client the tests construct. `:52` is
`ConfigurePrimaryHttpMessageHandler`, which places the hook below every delegating
handler a library may have stacked, closest to the wire. The technique's contract
inversion is therefore literal here: a component that news up its own `HttpClient` gets
no redirection and silently reaches the network, and `docs/recorded-tests.md:46` states
the obligation as a migration step — "Commands must obtain `HttpClient` instances via
`IHttpClientFactory.CreateClient()` to benefit from playback redirection."

The hook is conditionally compiled, not runtime-gated: `:67-76` is the whole injection
block inside `#if DEBUG`, returning a `RecordingRedirectHandler` wrapping the real
`HttpClientHandler`; and the resolver that feeds it (`:81-116`) is itself inside
`#if DEBUG`, with the comment at `:82-86` saying so — "This function will only ever run
in debug mode." A shipped release binary contains no code path that can redirect an
outbound request to an address named in an environment variable.

The resolver is worth a paragraph because its *shape* is a lesson. It takes an optional
`Func<Uri?>` first and falls back to the `TEST_PROXY_URL` environment variable only when
the function is absent or returns null (`:88-113`), and `:84-85` says why the function
exists: "this is necessary for livetest scenarios that directly invoke a service rather
than going through `CallToolAsync()`, as scenarios like this require that the proxy be
set up at the ClientFactory level, where globally set environment variables would break
other tests running in parallel." A global env var is a *process*-scoped switch; parallel
recorded suites in one process need a *container*-scoped one. The production caller
passes nothing (`Extensions/HttpClientServiceCollectionExtensions.cs:59` is a bare
`services.ConfigureDefaultHttpClient()`), and only the test provider supplies a resolver
(`tests/Microsoft.Mcp.Tests/Helpers/TestHttpClientFactoryProvider.cs:37`, from
`fixture.GetProxyUri`). One overload, two callers, and the difference between them is the
entire test/production boundary.

Playback detection is `Helpers/EnvironmentHelpers.cs:27-37`: under `#if DEBUG` it reads
`TEST_MODE` and compares it to `"Playback"`; the `#else` arm is a hard `return false`
with the comment "In non-debug builds, never consider ourselves to be in playback testing
mode." Two independent compile-time gates on two different facts — can we redirect, and
are we replaying — rather than one flag doing both jobs.

## Timing neutralization, stated precisely

`Services/Http/RecordingRedirectHandler.cs:12-17` declares the placement in its own doc:
"intended to be injected as the LAST delegating handler (closest to the transport) so
that it rewrites the final outgoing wire request." `Redirect` (`:35-61`) adds
`x-recording-upstream-base-uri` once per request — guarded by a `Contains` check because
"HttpRequestMessage can be cloned/reused by some handlers" (`:37`) — then rewrites
scheme, host and port to the proxy while preserving path and query.

`StripRetryAfter` (`:64-82`) is the technique's "neutralize the value, never the
behaviour" rule, and the details are where it earns its name being slightly wrong:

- It runs **only in playback**, gated on `_playbackTesting` (`:21`, checked at `:66`). In
  record and live modes the real throttling directives pass through untouched, so a
  recording captures the service's actual instruction rather than a zeroed one.
- It **rewrites existing headers to zero**; it does not strip them, and it does not
  synthesize them where absent. Each of the three arms is
  `if (response.Headers.Remove(H)) { … add H = 0 }` — the remove-then-re-add is how you
  overwrite a header on this type, and the `if` means a response that never carried
  `Retry-After` still does not carry one. `Retry-After` becomes
  `RetryConditionHeaderValue(TimeSpan.Zero)`; `x-ms-retry-after-ms` and `retry-after-ms`
  become the string `"0"`.

The response still says "you were throttled, wait" and says to wait for no time, so the
client's retry branch is taken in full and the wall clock cost is gone — the distinction
the technique insists on, implemented three headers wide because one service dialect was
not enough.

One neighbouring line does something different and should not be confused with it: `:48-52`
*removes* `x-ms-cosmos-supported-serialization-formats` from the outbound request, "Force
Cosmos query responses to JSON so test proxy stores them accurately." That is a fidelity
reduction accepted to buy diffable stored recordings — the request the service sees under
recording is provably not the request production sends — and unlike `StripRetryAfter` it
runs in *every* mode, recording included.

## Both dials, with the sharp edge documented

Sanitizers and matchers live on one base class,
`tests/Microsoft.Mcp.Tests/Client/RecordedCommandTestsBase.cs`, as suite-level virtuals a
test class overrides:

- `EnableDefaultSanitizerAdditions` (`:32`, default true) sanitizes the deployment's
  `ResourceBaseName` out of every recording.
- Five typed sanitizer lists — general regex (`:37`), header regex (`:42`), URI (`:59`),
  body key (`:64`), body regex (`:69`) — each documented as applying "to recorded data at
  rest and during recording, and against test requests during playback."
- `DisabledDefaultSanitizers` (`:77`) opts *out* of individual entries from the proxy's
  ~90 built-in sanitizers, and it defaults to `["AZSDK3430"]` — `$..id`. The suite ships
  with the built-in scrub of every `id` field disabled, because the assertions are about
  resource identity.
- `TestMatcher` (`:89`) is the class-wide matcher, overridable per test method via
  `CustomMatcherAttribute` — the reviewable per-case override the technique asks for.
- `RegisterVariable` / `RegisterOrRetrieveVariable` (`:91-152`) are the "this value is not
  a secret, preserve it" channel, no-ops in playback because the proxy repopulates
  `TestVariables` (`:84`) from the recording file.

The one built-in sanitizer the suite ships (`:42-56`) is the best short argument in the
tree for why the fidelity dial needs a hand on it. It rewrites `WWW-Authenticate`, but
not to a constant: the regex `https://login.microsoftonline.com/(.*?)"` captures the
tenant id into group 1 and replaces only that group with a fixed empty GUID, and the
comment says why — "REMOVAL of this formatting cause complete failure on tool side when
it expects a valid URL with a GUID tenant ID. Hence the more complex replacement rather
than a simple static string replace of the entire header value with `Sanitized`." The
naive sanitizer is not merely lower-fidelity; it makes the client under test fail on a
shape it must parse. Sanitization has to preserve the grammar the code depends on, and
the only way to learn which grammar that is, is to break it once.

Mode selection is a lane property and deliberately not in the repository:
`Client/Helpers/LiveTestSettings.cs:13` names the file `.testsettings.json`, `:31`
declares `TestMode TestMode { get; set; } = TestMode.Live` (live is the *default* when
the file says nothing), and `:36-54` walks up from `AppContext.BaseDirectory` to find it.
The file is gitignored (`.gitignore:6`) and generated by resource deployment. The mode
then crosses a process boundary explicitly: `Client/CommandTestsBase.cs:113` sets
`TEST_PROXY_URL` into the child server process's environment, and `:117-120` sets both
`TEST_MODE=Playback` and `AZURE_TOKEN_CREDENTIALS=PlaybackTokenCredential`, the latter
with the comment that it "tells the server to use a special credential that returns fake
tokens in playback mode, which prevents any accidental live calls if a test is
misconfigured." That is a second, independent tripwire on the escape-to-live failure the
technique names as the silent one — a component that built its own transport and dodged
the redirect still has no usable credential, so it fails loudly instead of quietly
reaching production. The technique names the failure and does not name this defence.

## Warehousing, and the structural fact about what the pointer carries

`docs/recorded-tests.md:28` states the shape: "Recordings are **externalized** via
`assets.json` files and stored in the shared `Azure/azure-sdk-assets` repository. The
proxy clones the relevant slice into `.assets/<hash>/...` on demand." `:48-56` is the
migration step that creates the file, `:85-101` the push-and-commit workflow: push
"stages the local recording updates for commit, creates a new tag in
`Azure/azure-sdk-assets`, and updates the `Tag` field in local `assets.json`", and step 6
requires committing source changes and the updated `assets.json` together — the
technique's "a change that alters requests and a change that updates the tag are the same
change", written as a checklist item. `.assets/` and `.proxy/` are both gitignored
(`.gitignore:1-2`).

**The hunt's answer: the stored metadata carries the recording's storage identity and
nothing else.** A real file, complete —
`tools/Azure.Mcp.Tools.KeyVault/tests/Azure.Mcp.Tools.KeyVault.Tests/assets.json`:

```
{
    "AssetsRepo": "Azure/azure-sdk-assets",
    "AssetsRepoPrefixPath": "",
    "TagPrefix": "Azure.Mcp.Tools.KeyVault.Tests",
    "Tag": "Azure.Mcp.Tools.KeyVault.Tests_2eb816de7c"
}
```

Four fields: which repository, which path prefix, which tag namespace, which tag. No
service version. No API revision. No schema hash. **No capture date** — not even the
fallback the technique offers when the remote side publishes no identity. The tag's
suffix is a content hash of the recordings themselves, so it identifies *what was
recorded* with perfect precision and *what was recorded from* not at all. Forty-two of
these files exist and all four fields are the same four. The technique's central claim —
"a recording carries no fingerprint of the service it recorded" — is confirmed here in
its strongest form: the identity the pointer carries is a self-reference, and by
construction a re-record is indistinguishable from a no-op except by the hash changing.

The freshness obligation's second half fares better but not well. A live lane exists —
`eng/pipelines/templates/jobs/live-test.yml`, invoked from
`eng/pipelines/templates/common.yml:106-119` under
`and(eq(variables['System.TeamProject'], 'internal'), eq(parameters.RunLiveTests, 'true'))`,
with `pullrequest.yml:14` setting `RunLiveTests` true for the internal project. So live
certification runs, and it runs on pull requests. There is no `schedules:` or cron
trigger anywhere in `eng/`, so it does not run **on a cadence** — the live lane is
change-triggered, which means a service that drifts while nobody opens a pull request in
that area drifts unobserved, and the recorded lane goes on reporting green. That is
exactly the gap the technique's clause 2 exists to close, and half of it is open.

## What this realization cannot do

It cannot tell anyone how old a recording is, or against what. There is no artifact —
not `assets.json`, not the tag, not the recording file's own metadata — from which a
reviewer could compute "this exchange was captured against a service version we no longer
run." Age is not even a proxy that is available; it would have to be recovered from the
assets repository's git history in another organization's repository.

It cannot detect the escape it is designed around at review time. `#if DEBUG` removes the
redirect capability from release builds, which is the right trade, but the consequence is
that the honest question — *does this component resolve the shared transport or build its
own?* — is answered by whether a playback test happens to be slow, unauthenticated, or
flaky, and now also by the playback credential tripwire. Nothing enumerates the
components that construct their own transport.

And it cannot make the fidelity dial visible in a diff. A matcher relaxation is a virtual
property override on a test class; the assertion it weakens is in a method a hundred
lines away and often in another file. The base class documents each dial carefully, and a
reviewer still sees a one-line override.

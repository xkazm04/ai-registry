---
layer: application
type: application
subject: demo-data-plane
technique: one-interface-many-planes
stack: go
status: forged
verified_on: 2026-09-02
verified_against: go@1
---

# One interface, many planes in Grafana's TestData data source

*Verified against `grafana/grafana` at `a152335` (`go 1.26.6`,
`grafana-plugin-sdk-go v0.296.4`), read on 2026-09-02. The plugin SDK's
envelope types were read from `grafana-plugin-sdk-go` at `main` the same day.*

Grafana ships a fabricated data plane inside every build: the TestData data
source, a backend plugin that answers the same query interface every real
data source answers, and is selectable wherever a real one is. It is the
subject's shape in a second language and on the server side, and it is
instructive in both directions — it has the parity mechanism exactly right and
the determinism half only partly.

## Parity is a compile error

`pkg/tsdb/grafana-testdata-datasource/testdata.go:50-56` is the whole parity
mechanism, in the Go idiom for it:

```go
var (
	_ backend.QueryDataHandler        = (*Service)(nil)
	_ backend.QueryChunkedDataHandler = (*Service)(nil)
	_ backend.CallResourceHandler     = (*Service)(nil)
	_ backend.AdmissionHandler        = (*Service)(nil)
	_ backend.CollectMetricsHandler   = (*Service)(nil)
)
```

Five blank-identifier assignments assert, at compile time, that the fake plane
implements every handler interface a real data source implements. Remove a
method and the package does not build — the technique's mechanical test,
passed before any browser opens. The file's own comment (`:17`) says what the
assertions are for: *"ensures that testdata implements all client functions."*

The implementation of those methods is a multiplexer: `QueryData` (`:68`)
delegates to a `QueryTypeMux` that routes each query to one of thirty-odd
registered scenarios (`scenarios.go`, `registerScenarios`), so the fake plane's
surface is the *same* surface as a real source's, with the scenario name as
the query.

## Provenance rides with the value, not the client

This is the tree's answer to the technique's condition — the case where a
consumer holds results from more than one plane at once, and the plane must
therefore be on the value. Grafana has a built-in "Mixed" data source that
fans one panel's queries across several real sources, the fake one included,
and the schema puts identity on each query rather than on the client:

- `packages/grafana-schema/src/common/common.gen.ts:37-44` — `DataQuery`
  carries `datasource?` with the comment *"For mixed data sources the selected
  datasource is on the query level. For non mixed scenarios this is
  undefined."* Exactly the condition: when one call returns one plane's data
  the field is absent; when planes mix, the field is on the value.
- `grafana-plugin-sdk-go/backend/data.go:268-280` — the response envelope is
  `DataResponse{Frames, Error, Status, ErrorSource}`, and `:269` says of the
  frames: *"Each Frame repeats the RefID."* A frame is joinable back to the
  query that produced it, and through the query to the source that answered.
- `backend/error_source.go:11-23` — failures carry provenance too:
  `ErrorSource` is `plugin` or `downstream`, with a documented default, so a
  consumer can tell "the plane failed" from "the thing behind the plane
  failed" without inspecting the message.

There is still no "which plane am I" method on the data source interface. The
client is plane-blind; the *data* is not.

## The fake plane's failure space

The scenarios are the network-faithful half of the subject, declared rather
than random in every case but one:

- **Declared slowness.** `scenarios.go:514-533` (`handleRandomWalkSlowScenario`)
  sleeps for a duration the query names in `StringInput`, then answers.
- **Declared failure with provenance.** `:985-1006`
  (`handleErrorWithSourceScenario`) returns an error and, when the query asks,
  wraps it as `backend.DownstreamError` — the fake plane exercises both
  branches of the envelope's error-source field.
- **Failure beside data.** `:496-512` returns a full random walk *and* an
  error on the same response, so consumers that render partial results with a
  warning have a plane that produces that shape.
- **A crash.** `:675-689` panics on an empty input — *"Test Data Panic!"* — to
  exercise the recovery path around the plugin boundary.
- **The one probabilistic scenario.** `:535-575` (`handleFlakyQueryScenario`)
  fails with `ErrorProbability` percent and jitters its delay by
  `QueryDelayVariability` (`flakyQueryDelay`, `:580-593`). This is the
  technique's "explicitly enabled fault mode": the probability is a declared
  parameter of a scenario the author chose, not a property of the plane. A
  dashboard that selects it is asking for flakiness by name.

**Deviation.** `testdata.go:80-85` — `CheckHealth` returns `HealthStatusOk`
with *"Data source is working"* unconditionally. The one method that can never
fail is the one a real source fails first, so the health-check rendering path
cannot be exercised through this plane.

## Determinism: seeded where it counts, unseeded at the edges

`RandomWalk` (`scenarios.go:1008-1009`) seeds its own generator from the
query's time range plus the series index:

```go
rand := rand.New(rand.NewSource(query.TimeRange.From.UnixNano() + query.TimeRange.To.UnixNano() + int64(index)))
```

For an *absolute* range the walk is reproducible across tabs, reloads and
machines — a screenshot of a fixed range matches the page. For a *relative*
range ("last 6 hours") every refresh moves both bounds and the seed with them,
so the series re-rolls on each refresh. That is the seeded-determinism
technique's "the current time" caveat in its purest form: the clock entered the
stream through the window, not through the generator. The exemplars generator
(`:1099`) seeds the same way.

Three places do not hold the line:

- `:276` — `GetJSONModel` defaults `StartValue` to `rand.Float64() * 100` from
  the package-global unseeded source. A query that never saved a start value
  begins somewhere new on every evaluation, before the seeded walk starts.
- `:1267` (`randomWalkTable`) and `:1481` (`randomHeatmapData`) seed from
  `time.Now().UnixNano()` — deterministic in name only.

Recorded as deviations, not as disagreement: a data source built for testing
panels does not owe a prospect a matching screenshot, and the seeded walk
exists for the one scenario where reproducibility was wanted. It is the
subject's point, though, that the moment such a plane is used to *demonstrate*
rather than to test, the three unseeded sites become viewer-facing defects.

## What this tree does not cover

The honesty contract's disclosure clauses are outside this application's read.
The fake plane is *named* — it appears in the source picker as a data source
called TestData — which is clause six in the product's own vocabulary, but no
dashboard chrome marks a panel as fabricated, and nothing here bears on the
count rule. The plane is chosen per query by an operator who can see the
source name, which is the same explicit act the subject requires; whether a
viewer of a shared dashboard can see it is a question this tree does not
answer.

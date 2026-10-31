---
subject: demo-data-plane
domain: software-engineering
last_touched: 2026-09-02
dry_streak: 0
---

# demo-data-plane

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: NEW.

## State

6 techniques, 2 react applications. A director merge of four scout findings from four territories that each saw one face of the same subject. Golden path 346 lines.

## Open leads (banked, with return conditions)

- **a fallback must not change a value's provenance** (proposed law, not added). A substitution made on absence or failure may degrade fidelity but never swap a real source for an invented one. Three sightings in this subject.
- **scripted-scene-choreography** — banked as a separate NEW subject on the forger's explicit verdict, which the director requested as a tiebreaker. It is timeline craft (phases, pacing, loop boundaries, pause/resume) whose real neighbours are `motion`'s two new techniques, not a data plane. Return condition: check its seam against `motion`/loop-pause-governance and `motion`/unprompted-motion-lifecycle BEFORE dispatch.

## 2026-09-02 - deepen batch [[2026-09-02-1]]

**Single-stack closed**: a `go` application on an observability platform's
built-in test data source, read at a pinned commit (`go@1`). Parity as a
compile-time interface assertion; per-query source reference repeated on every
frame; declared slow/failing/partial scenarios; a seeded walk that re-rolls on
relative ranges - exactly the technique's caveat.

**Inbox ruling** (2026-08-29, "invert one-interface-many-planes"): landed as a
**condition, not an inversion**. The rule holds when a call returns one plane's
data; when fabricated and real values can share a result (seed rows in a
tenant's store, mixed-source queries, content re-fed to a model), provenance
becomes a required field of the *value* and consumers legitimately compare it.
The lead's ~42 breaches are the expected shape under the condition. The
technique's descriptive-only exception did NOT already cover it, because the
model-feeding path must compare.

`fake-surface-honesty-contract` clause 3 scoped to *hidden* persistence: an
address-carried plane segment is allowed (re-chosen by every link, visible
before render); a stored preference is not. `runtime-dispatch-not-build-flag`
cross-references it so the two do not contradict.

### Open leads (banked, with return conditions)

- **Proposed law "a fallback must not change a value's provenance"** - fourth
  and fifth sightings this run, both the positive form: provenance carried by
  the value across every boundary, and failure provenance on the envelope
  (which side failed). Worker suggests the wording cover "value or failure".
  Still one subject. Return on a sighting outside client-architecture.
- **Home-ambiguous**: "provenance as a required field of a mixed result" also
  belongs to whichever llm-agent subject owns grounding of content fed to a
  model. No note exists there; recorded here and in the run note.
- `scripted-scene-choreography` (2026-08-22) still banked; condition unchanged.

### Impact (2026-09-02)

Stale verdicts after this landing: systedo-case (1) - the project whose lead produced the condition. Apply row: see `librarian/applied.md`.

## Architecture review - 2026-10-31

First architecture review, against `f0fb680d2`. All 16 documents read in full. The
pinned Grafana files, both afterlife files and a sample of the systedo-case anchors
were re-read at their cited commits. The dashboard applications carry no commit pin.
Its current tree has moved on (a fourth, desktop plane; shifted line numbers), so
those two are `reverify`. Main findings: the Grafana application quotes a comment
that annotates a commented-out line, not the live assertions. The dashboard's
dispatch module imports the mock plane statically, which contradicts the
technique's claim that a real tenant pays only for the dispatch.
seeded-determinism's own verification test breaks against its entry-captured
reference instant. And clause 3 of the honesty contract forbids a cookie that the
mixed-plane application keeps while calling the clause "satisfied differently".

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/demo-data-plane",
  "date": "2026-10-31",
  "baseline": "f0fb680d2",
  "digest": "sha256-b2:8b6581bd5537bf1b",
  "disposition": "clarify",
  "coverage": "All 16 documents read in full. Grafana (a152335) and afterlife (009c7893) citations re-read at their pins; systedo-case (ab11a8b4) sampled; personas-web read at HEAD only, since its applications name no commit.",
  "counterexamples": [
    "A world built from an instant captured at instantiation is not byte-equal across two in-process generations unless the instant is injected, so the technique's own determinism check fails on a correct implementation.",
    "A dispatch module that statically imports the fake plane ships the whole fixture world to every tenant chunk that imports the client, so the cost is not bounded by the demo route.",
    "A persisted coexistence setting (a one-year cookie) keeps demo rows beside real ones across sessions, and clause 3 as written forbids exactly that carrier.",
    "Go map iteration is randomised per range loop, so it is not stable within a process. Python str hashing is stable within a process and differs between processes, not between builds."
  ],
  "sources": [
    {"url": "https://github.com/grafana/grafana/blob/a152335/pkg/tsdb/grafana-testdata-datasource/testdata.go", "result": "Five compile-time assertions confirmed (var block). The ':17' comment 'ensures that testdata implements all client functions' sits above the commented-out '// var _ plugins.Client = &Service{}' at :18, not above the assertions. CheckHealth returns HealthStatusOk unconditionally (:80-85). go.mod: go 1.26.6, plugin-sdk v0.296.4."},
    {"url": "https://github.com/grafana/grafana/blob/a152335/pkg/tsdb/grafana-testdata-datasource/scenarios.go", "result": "Confirmed: 33 registerScenario calls; :276 rand.Float64()*100; :1009 seeded from TimeRange + index; :1099 exemplars seeded the same way; :1267 and :1481 seeded from time.Now(); :684 'Test Data Panic!' on empty input; :999 DownstreamError; flaky ErrorProbability and flakyQueryDelay at :580."},
    {"url": "https://github.com/grafana/grafana-plugin-sdk-go/blob/main/backend/data.go", "result": "DataResponse comment: 'The data returned from the Query. Each Frame repeats the RefID.' error_source.go: 'DefaultErrorSource ... = status.SourcePlugin'. grafana-schema DataQuery: 'For mixed data sources the selected datasource is on the query level.'"},
    {"url": "https://github.com/xkazm04/afterlife/tree/009c7893", "result": "Every anchor in both afterlife applications confirmed: clock.ts:12-20 replayClock, ports.ts:18, fakeGroup.ts:20/22/24, parity.test.ts:33-34/44/54-61/65-68/96/101-103/109-115, README.md:73, .gitlab-ci.yml:21 node:24-bookworm, estate.ts, dataLabel.ts, DemoEstateBanner.tsx, seeded.ts, liveSource.ts:41, types.ts:84-88, saved.ts:1-4, three ownDecisions loaders, demoEstate.ts:31-33/48-51 one-year cookie."},
    {"url": "https://github.com/xkazm04/systedo-case/tree/ab11a8b4", "result": "Sampled: store.ts:24, resolve.ts:46, types.ts:62, ProjectOverview.tsx:129/139/165, portfolio-model.ts:200, aggregate.ts:96, grounding.ts:345, build.ts:51 confirmed. projectDataSource is at source.ts:44, not :43. totalsOf(data.daily.slice(-30)) is at ProjectOverview.tsx:166 and renders near :219, not :217."},
    {"url": "https://github.com/xkazm04/personas-web (HEAD, 2026-10-31)", "result": "api.ts:3 'import { mockApi } from \"./mockApi\"' is static, and mockApi.ts imports MOCK_* from ./mockData statically, so the fixtures sit in every chunk that imports api. HEAD now has a desktopApi plane, and the interface, proxy and USE_SUPABASE sit at :148/:445/:428. The 2026-08-22 anchors cannot be confirmed without a pin."},
    {"url": "https://nextjs.org/docs/app/guides/environment-variables", "result": "Supports the dashboard deviation: NEXT_PUBLIC_ values are inlined 'at build time' and 'will be frozen with the value evaluated at build time'."},
    {"url": "https://docs.python.org/3/reference/datamodel.html#object.__hash__", "result": "'Although they remain constant within an individual Python process, they are not predictable between repeated invocations of Python.' Refutes 'differ across builds' as the axis; the axis is processes."},
    {"url": "https://docs.stripe.com/api/charges/object", "result": "livemode: 'If the object exists in live mode, the value is true. If the object exists in test mode, the value is false.' Supports the provenance-on-the-value example. Stripe's own docs, as fetched, did not confirm the /test/ dashboard path behind clause 3's 'best-known sandbox modes'; only third-party guides did."}
  ],
  "documents": {
    "demo-data-plane.md": {"disposition": "clarify", "reason": "The determinism section promises the same world 'on every reload, on every machine', which the technique's own residual (absolute instants differ between loads) contradicts; qualify it. The seams and the cost statement are sound."},
    "techniques/one-interface-many-planes.md": {"disposition": "keep", "reason": "The condition (provenance on the value once results can mix) is backed by Stripe livemode and Grafana's per-query datasource and RefID; the refusal-not-empty-success rule is independent and sound."},
    "techniques/runtime-dispatch-not-build-flag.md": {"disposition": "clarify", "reason": "The claim that a real tenant 'pays for the dispatch and not for the world' holds only when the fixture module is reached lazily. A static import from the dispatch module (the cited dashboard's shape) ships the world to every tenant."},
    "techniques/fixture-self-consistency.md": {"disposition": "keep", "reason": "Root-and-projection, minted self-labelling ids and the three coherence checks are internally consistent and match the dashboard's -mock ids."},
    "techniques/seeded-determinism.md": {"disposition": "clarify", "reason": "Its 'generate twice in one process' check fails a correct world whose reference instant is captured at instantiation unless the instant is injected. The iteration-order caveat names builds where the primary source says processes."},
    "techniques/network-faithful-mocks.md": {"disposition": "keep", "reason": "Sound. Grafana's declared slow, failing and partial scenarios support declared-not-random failure, and its one probabilistic scenario is an opt-in fault mode, as the technique allows."},
    "techniques/fake-surface-honesty-contract.md": {"disposition": "clarify", "reason": "Clause 3 forbids a cookie outright, while mixed-plane-coexistence and its application accept a persisted coexistence setting under per-row disclosure. The two need one stated relation, and choosing its direction is doctrine. The 'best-known sandbox modes' path claim lacks a primary source."},
    "techniques/mixed-plane-coexistence.md": {"disposition": "clarify", "reason": "Its closing paragraph accepts a setting that forces demo beside real indefinitely, without stating that this sits outside clause 3. Resolve it together with the honesty contract."},
    "techniques/cross-plane-parity-test.md": {"disposition": "keep", "reason": "The method is confirmed line for line by the afterlife rig, including the it-is-not-just-the-seed check."},
    "techniques/replay-clock-pinning.md": {"disposition": "keep", "reason": "The two-faced pinned clock is confirmed at afterlife clock.ts:12-20 and ports.ts:18; the entry-relative versus pinned split is coherent with seeded-determinism."},
    "applications/go--one-interface-many-planes.md": {"disposition": "clarify", "reason": "Pinned source: the quoted ':17' comment annotates the commented-out plugins.Client assertion at :18, not the live var block. Every other anchor re-read and confirmed."},
    "applications/next--one-interface-many-planes.md": {"disposition": "clarify", "reason": "Arithmetic holds (8+3+2+1+6 = 20; 14 expected, 6 failures). Two anchors drift at the pin: projectDataSource at source.ts:44, and last-30 totals computed at ProjectOverview.tsx:166."},
    "applications/node--cross-plane-parity-test.md": {"disposition": "keep", "reason": "Every anchor re-read at 009c7893 and confirmed, including the deviation of inline strips plus a second file."},
    "applications/next--mixed-plane-coexistence.md": {"disposition": "keep", "reason": "Every anchor re-read at 009c7893 and confirmed. Its 'satisfied differently, not waived' reading of the cookie is the technique-level question owed above, not an error in the account."},
    "applications/react--runtime-dispatch-not-build-flag.md": {"disposition": "reverify", "reason": "No commit pin, and HEAD has drifted (four planes, moved anchors). HEAD's static mockApi import contradicts 'bounded by the demo route's code path'; confirm against the 2026-08-22 revision before correcting."},
    "applications/react--fake-surface-honesty-contract.md": {"disposition": "reverify", "reason": "Same unpinned tree. The count-rule and negative-assertion-gap account is plausible, but its anchors were not re-read at a dated revision."}
  }
}
```

Second record, after applying the five confirmed clarify items above. Still owed: the honesty contract and mixed-plane-coexistence need one stated relation for a persisted coexistence setting under clause 3. Choosing its direction is doctrine. Clause 3's sandbox-path claim needs a primary source. The two dashboard applications need re-reading at a dated revision.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/demo-data-plane",
  "date": "2026-10-31",
  "baseline": "f0fb680d2",
  "digest": "sha256-b2:068300f7dac01705",
  "disposition": "clarify",
  "coverage": "All 16 documents read in full. Grafana (a152335) and afterlife (009c7893) citations re-read at their pins; systedo-case (ab11a8b4) sampled; personas-web read at HEAD only, since its applications name no commit. Re-recorded after applying the confirmed clarify items in the same session.",
  "counterexamples": [
    "A world built from an instant captured at instantiation is not byte-equal across two in-process generations unless the instant is injected, so the technique's own determinism check fails on a correct implementation.",
    "A dispatch module that statically imports the fake plane ships the whole fixture world to every tenant chunk that imports the client, so the cost is not bounded by the demo route.",
    "A persisted coexistence setting (a one-year cookie) keeps demo rows beside real ones across sessions, and clause 3 as written forbids exactly that carrier.",
    "Go map iteration is randomised per range loop, so it is not stable within a process. Python str hashing is stable within a process and differs between processes, not between builds."
  ],
  "sources": [
    {
      "url": "https://github.com/grafana/grafana/blob/a152335/pkg/tsdb/grafana-testdata-datasource/testdata.go",
      "result": "Five compile-time assertions confirmed (var block). The ':17' comment 'ensures that testdata implements all client functions' sits above the commented-out '// var _ plugins.Client = &Service{}' at :18, not above the assertions. CheckHealth returns HealthStatusOk unconditionally (:80-85). go.mod: go 1.26.6, plugin-sdk v0.296.4."
    },
    {
      "url": "https://github.com/grafana/grafana/blob/a152335/pkg/tsdb/grafana-testdata-datasource/scenarios.go",
      "result": "Confirmed: 33 registerScenario calls; :276 rand.Float64()*100; :1009 seeded from TimeRange + index; :1099 exemplars seeded the same way; :1267 and :1481 seeded from time.Now(); :684 'Test Data Panic!' on empty input; :999 DownstreamError; flaky ErrorProbability and flakyQueryDelay at :580."
    },
    {
      "url": "https://github.com/grafana/grafana-plugin-sdk-go/blob/main/backend/data.go",
      "result": "DataResponse comment: 'The data returned from the Query. Each Frame repeats the RefID.' error_source.go: 'DefaultErrorSource ... = status.SourcePlugin'. grafana-schema DataQuery: 'For mixed data sources the selected datasource is on the query level.'"
    },
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "Every anchor in both afterlife applications confirmed: clock.ts:12-20 replayClock, ports.ts:18, fakeGroup.ts:20/22/24, parity.test.ts:33-34/44/54-61/65-68/96/101-103/109-115, README.md:73, .gitlab-ci.yml:21 node:24-bookworm, estate.ts, dataLabel.ts, DemoEstateBanner.tsx, seeded.ts, liveSource.ts:41, types.ts:84-88, saved.ts:1-4, three ownDecisions loaders, demoEstate.ts:31-33/48-51 one-year cookie."
    },
    {
      "url": "https://github.com/xkazm04/systedo-case/tree/ab11a8b4",
      "result": "Sampled: store.ts:24, resolve.ts:46, types.ts:62, ProjectOverview.tsx:129/139/165, portfolio-model.ts:200, aggregate.ts:96, grounding.ts:345, build.ts:51 confirmed. projectDataSource is at source.ts:44, not :43. totalsOf(data.daily.slice(-30)) is at ProjectOverview.tsx:166 and renders near :219, not :217."
    },
    {
      "url": "https://github.com/xkazm04/personas-web (HEAD, 2026-10-31)",
      "result": "api.ts:3 'import { mockApi } from \"./mockApi\"' is static, and mockApi.ts imports MOCK_* from ./mockData statically, so the fixtures sit in every chunk that imports api. HEAD now has a desktopApi plane, and the interface, proxy and USE_SUPABASE sit at :148/:445/:428. The 2026-08-22 anchors cannot be confirmed without a pin."
    },
    {
      "url": "https://nextjs.org/docs/app/guides/environment-variables",
      "result": "Supports the dashboard deviation: NEXT_PUBLIC_ values are inlined 'at build time' and 'will be frozen with the value evaluated at build time'."
    },
    {
      "url": "https://docs.python.org/3/reference/datamodel.html#object.__hash__",
      "result": "'Although they remain constant within an individual Python process, they are not predictable between repeated invocations of Python.' Refutes 'differ across builds' as the axis; the axis is processes."
    },
    {
      "url": "https://docs.stripe.com/api/charges/object",
      "result": "livemode: 'If the object exists in live mode, the value is true. If the object exists in test mode, the value is false.' Supports the provenance-on-the-value example. Stripe's own docs, as fetched, did not confirm the /test/ dashboard path behind clause 3's 'best-known sandbox modes'; only third-party guides did."
    }
  ],
  "documents": {
    "demo-data-plane.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the determinism promise is qualified so ages and relative times hold everywhere and absolute instants hold within one entry."
    },
    "techniques/one-interface-many-planes.md": {
      "disposition": "keep",
      "reason": "The condition (provenance on the value once results can mix) is backed by Stripe livemode and Grafana's per-query datasource and RefID; the refusal-not-empty-success rule is independent and sound."
    },
    "techniques/runtime-dispatch-not-build-flag.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the payload bound is made conditional on loading the fake plane lazily; a static import from the dispatch module ships the world to every tenant."
    },
    "techniques/fixture-self-consistency.md": {
      "disposition": "keep",
      "reason": "Root-and-projection, minted self-labelling ids and the three coherence checks are internally consistent and match the dashboard's -mock ids."
    },
    "techniques/seeded-determinism.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the in-process check now hands both generations the same reference instant; the iteration-order caveat says processes, not builds (Python hash salting)."
    },
    "techniques/network-faithful-mocks.md": {
      "disposition": "keep",
      "reason": "Sound. Grafana's declared slow, failing and partial scenarios support declared-not-random failure, and its one probabilistic scenario is an opt-in fault mode, as the technique allows."
    },
    "techniques/fake-surface-honesty-contract.md": {
      "disposition": "clarify",
      "reason": "Clause 3 forbids a cookie outright, while mixed-plane-coexistence and its application accept a persisted coexistence setting under per-row disclosure. The two need one stated relation, and choosing its direction is doctrine. The 'best-known sandbox modes' path claim lacks a primary source."
    },
    "techniques/mixed-plane-coexistence.md": {
      "disposition": "clarify",
      "reason": "Its closing paragraph accepts a setting that forces demo beside real indefinitely, without stating that this sits outside clause 3. Resolve it together with the honesty contract."
    },
    "techniques/cross-plane-parity-test.md": {
      "disposition": "keep",
      "reason": "The method is confirmed line for line by the afterlife rig, including the it-is-not-just-the-seed check."
    },
    "techniques/replay-clock-pinning.md": {
      "disposition": "keep",
      "reason": "The two-faced pinned clock is confirmed at afterlife clock.ts:12-20 and ports.ts:18; the entry-relative versus pinned split is coherent with seeded-determinism."
    },
    "applications/go--one-interface-many-planes.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the :17 comment is attributed to the commented-out plugins.Client assertion at :18; verified_on moved after every citation was re-read at a152335."
    },
    "applications/next--one-interface-many-planes.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: anchors corrected to source.ts:44 and ProjectOverview.tsx:166. Other anchors were sampled, not all re-read, so verified_on is unchanged."
    },
    "applications/node--cross-plane-parity-test.md": {
      "disposition": "keep",
      "reason": "Every anchor re-read at 009c7893 and confirmed, including the deviation of inline strips plus a second file."
    },
    "applications/next--mixed-plane-coexistence.md": {
      "disposition": "keep",
      "reason": "Every anchor re-read at 009c7893 and confirmed. Its 'satisfied differently, not waived' reading of the cookie is the technique-level question owed above, not an error in the account."
    },
    "applications/react--runtime-dispatch-not-build-flag.md": {
      "disposition": "reverify",
      "reason": "No commit pin, and HEAD has drifted (four planes, moved anchors). HEAD's static mockApi import contradicts 'bounded by the demo route's code path'; confirm against the 2026-08-22 revision before correcting."
    },
    "applications/react--fake-surface-honesty-contract.md": {
      "disposition": "reverify",
      "reason": "Same unpinned tree. The count-rule and negative-assertion-gap account is plausible, but its anchors were not re-read at a dated revision."
    }
  }
}
```

---
layer: application
type: application
subject: import-normalization
technique: intermediate-representation
status: forged
stack: node
verified_on: 2026-09-01
verified_against: node@24
---

# The ads connector waist — two capabilities attached after the wrapper, on purpose

`src/lib/campaigns/connector.ts` is a narrow waist of the same species as
the import IR: two vendor providers (Google Ads, Sklik) lower into one
`AdsConnector` shape that every downstream consumer — sync, store, alerts,
report assembly — speaks exclusively. The shared stage is
`withSampleFallback` (`connector.ts:220-275`), described in its own header
as *"the ONE seam every live source shares — Google and Sklik get identical
fallback + flag semantics"*. All citations resolved at HEAD
`6279066f785cabc04d805d9f385297af991c3ca8`.

This repo is the interesting case for the "no adapter writes after the
waist" rule, because it does exactly that — twice, deliberately, with the
reasoning written down.

## What the waist guarantees

Every member built inside `withSampleFallback` carries four things the
vendor code does not have to re-derive:

- **degrade-to-sample fallback** — each live fetch is wrapped in a
  try/catch that serves the deterministic sample provider
  (`connector.ts:237-250` campaigns, `:252-261` series, `:262-274`
  per-campaign series);
- **truth-in-labeling flags** — a shared `degradation` record
  (`connector.ts:226`) whose `campaigns` / `series` / `reason` fields are
  set on every fallback (`:245-246`, `:257-258`, `:269-270`) and read by
  the sync to decide what the persisted rows are *labelled* as
  (`sync.ts:102`, `:116`);
- **provenance capture** — `currency` and `timeZone` resolved from the live
  campaign fetch and reset to the fallback's on degradation
  (`connector.ts:232-235`, `:240-241`, `:247-248`);
- **server-side error logging** at each degradation point (`:244`, `:256`,
  `:266`).

## The two post-waist writes

Both providers call the wrapper, then assign a member onto the object it
returned:

```ts
320:  const connector = withSampleFallback( … );      // google provider
346:  connector.fetchSearchTerms = (period) =>
347:    withLiveRetry( … );
351:  return connector;

373:  const connector = withSampleFallback( … );      // sklik provider
389:  connector.diagnoseMoneyUnit = (campaigns, period) =>
390:    classifySklikMoneyUnit(campaigns, CAMPAIGN_PERIOD_DAYS[period]);
391:  return connector;
```

Neither member gets the fallback, the flags, or the logging. The
`fetchSearchTerms` write re-applies the bounded retry by hand
(`connector.ts:347`, `withLiveRetry` at `:130-155`); `diagnoseMoneyUnit`
re-applies nothing.

## Why this is the technique's *legitimate* form, not its failure mode

The rule says an override either runs before the waist or re-applies every
guarantee explicitly, by name. Here the bypass is the *point*, and the
comment at `connector.ts:340-345` argues it:

> attached AFTER the wrapper … precisely so it is NOT inside
> `withSampleFallback`: a failed search-terms read must surface as a failure
> the sync records, never as sample queries the negative-keyword
> recommender would then score.

That is a guarantee being **refused on purpose** rather than lost by
accident, and the refusal is the safer choice: degrading this one fetch to
sample data would put a fabricated search query one approval click from a
permanent change to a live ad account. The interface declares both members
optional and documents the asymmetry that forces it — only one network can
answer each (`connector.ts:90-111`) — so the post-waist attachment also
encodes *capability*, not just a patch: a provider that cannot answer leaves
the member undefined and the consumer skips the step rather than inventing
rows.

## Where it still diverges — honestly

- **The guarantees are re-applied in the caller, not by the override.** The
  technique asks the override to name every obligation it re-establishes.
  Here the sync does it: `sync.ts:107-110` skips `diagnoseMoneyUnit` unless
  `!degradation.campaigns`, and `sync.ts:150-161` wraps `fetchSearchTerms`
  in its own try/catch plus the `!degradation.campaigns` and
  `terms.length > 0` gates. The invariant holds today because exactly one
  call site exists. The waist's whole value is that it holds for call sites
  nobody has written yet, and these two members have no such protection —
  a second consumer inherits the capability and none of the compensation.
- **`diagnoseMoneyUnit` has no retry at all.** `fetchSearchTerms` at least
  re-applies `withLiveRetry` by hand at `:347`; the Sklik verdict is a pure
  local classification so this is currently harmless, but the pattern that
  makes it harmless is not stated anywhere the next contributor would read.
- **Mutating the returned object is the weak form.** Assigning onto
  `connector` after `withSampleFallback` returned makes the bypass invisible
  in the wrapper's own type: the shape says "optional member" and cannot
  distinguish "the provider declined this capability" from "someone patched
  it in past the seam". Passing the optional capabilities *into*
  `withSampleFallback` as arguments it attaches without wrapping would move
  the same decision inside the waist, where the seam can state which members
  it guards and which it deliberately does not.

## A second, weaker sighting in the same tree

`src/app/api/ai/modes.ts` has the same shape at the model boundary: each
mode's `validate` clamps and sanitizes wire fields
(`src/lib/ai/validation.ts:324-325`, `:1136-1148`), and the per-tool
`prepare` then writes server-resolved grounding onto the validated value
(`modes.ts:615-616`, `:623`, `:657`, `:664`, `:675`) without re-entering
the validator — so the 120-character clamp and the demo-marker stripping
never see those fields, and the mutated object is what becomes both the
prompt and the response-cache key. Low risk because the injected values are
server-derived from the project's own catalog, but it is the same
structural claim: a special case writing over the shared stage's output,
compensated by what the inputs happen to be rather than by the door.

---
layer: application
type: application
subject: state-budget-analysis
technique: peer-group-construction
stack: node
status: forged
---

# Node — peer-group construction in the politicas BudgetMirror

The politicas repo's budget surface (`/rozpocty`) derives peer groups in a pure
module, `features/budget/peerGroups.ts`, and realizes the technique's clauses
almost one-for-one.

## The published rule is the module header

`peerGroups.ts:1-12` opens with the rule the page prints verbatim (via
`peerRuleText`): peers = municipalities of the same population band in the same
region that have a budget series (excluding the town itself); below `MIN_PEERS`
the group widens nationally within the band; the peer count is always shown,
never assumed. The rule text and the executing code live in one module — the
one-definition discipline, applied to prose.

## Structural attributes, external standard

- `POPULATION_BANDS` (`peerGroups.ts:17-28`) — ten half-open bands (`min`
  inclusive, `max` exclusive, top band `max: null`) following the finance/
  statistics authority's standard size categories for municipalities, not
  invented buckets. `bandIndexFor` (`:33-40`) is the boundary arithmetic in one
  place; even the impossible negative-population case is pinned to band 0 with
  a comment saying why it cannot occur.
- `MIN_PEERS = 5` (`peerGroups.ts:31`) — the group-size floor as a named,
  exported constant, with its rationale in the header ("a median over a small
  group would make a claim about two towns").

## The derivation is pure and deterministic

`peerGroupFor` (`peerGroups.ts:57-75`) takes `(town, registry, covered)` and
nothing else:

- coverage gates membership — `covered.has(m.ic)` (`:65`): only municipalities
  with a budget series can be peers ("a median over towns without numbers does
  not exist");
- the town excludes itself — `m.ic !== town.ic` (`:65`);
- geography refines the band — `inKraj` filters the in-band set by region
  (`:67`), and the widening rule picks scope `"kraj"` vs `"celostátní"`
  (`:68-70`) by comparing `inKraj.length` against `MIN_PEERS`;
- determinism is explicit — stable filters preserve registry order, no
  sampling (`:54-55` doc comment).

The returned `PeerGroup` carries `bandIndex`, `bandLabel`, and `scope`
(`:42-49`) so the surface can disclose which rung of the ladder applied.

## Null-safe medians with sample size

`median` (`peerGroups.ts:78-83`) returns `null` on empty input — "a median of
nothing is not 0" — and `peerMedians` (`:99-132`) applies the per-metric
contribution rule: a peer without a reported latest value simply does not enter
that metric's median (`:110-111`), the per-year debt trend recomputes the
sample each year (`:117-124`), and `sampleSize` (`:130`) reports how many peers
the headline median was actually computed from. The inputs come from
`mirrorData.ts`, whose `TownBudgetSeries` types encode `null = source did not
report — never recomputed` (`mirrorData.ts:29-37`).

One deviation worth noting: `PeerMedians.sampleSize` is the *debt* metric's
sample only; `capexRatio` and `saldoPerCapita` medians may draw from different
effective samples that are not separately reported. The technique's rule —
every median ships its own sample — is the standard; the repo ships the
headline metric's.

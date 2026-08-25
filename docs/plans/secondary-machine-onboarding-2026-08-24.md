# Secondary-machine onboarding — 2026-08-24, and what it surfaced

The mkdol box came online as the registry's second machine: six projects
registered as consumers (`.ai/manifest.yaml` committed in each, tagged
`machine: secondary`, `contributor: mkdol-dev-box`), linked to the lane
(61 links; 18 stale pre-migration skill copies migrated to overlays and
deleted), and harvested (17 items landed across 4 bundles — see the bundle
logs for the wave record). `signals/mkdol-dev-box.json` carries the fleet's
stack facts. This note holds the DECISIONS the wave surfaced but did not take
— lane changes are adoptions, and adopting is a human act.

## Lane defects — four skills abort on this machine

`architect`, `explorer`, `research` hardcode
`C:/Users/kazda/Documents/Obsidian/personas` (architect and explorer hard-exit
in Phase 0 when it is absent — which it is, on every machine but the primary),
declare themselves "personas-specific" in the body, and have no
`## Project overlay` section. `leonardo` has no overlay section either. This
violates `docs/skills-lane.md` ("the body is generic") and means the overlays
written this wave at `.claude/<skill>/config.md` in six projects are
documentation, not wiring — nothing in the lane bodies reads them.

**Proposal:** give all four an overlay section with defaults (vault →
`<repo>/.{skill}/` fallback), drop the personas-required-file gates, and move
personas specifics to the personas overlay. `architect` is also 1064 lines
against the doctrine's 500 guidance; pumper's 414-line condensation preserved
every phase and is a plausible slimming template.

## Grant's tiger copy was AHEAD of the lane — recover before it is forgotten

The deleted copy (recoverable at grant repo, commit `9a7a5bd^`,
`.claude/skills/tiger/`) carried a whole value layer lane v2.1 lacks: a
`drill <call-site>` loop-until-maxed mode with value curves and residual
ceilings; `value-model.md` grounding judgment in cited incumbent/competitor
research; a quantified $ model (`value_ceiling × usableFraction + riskAvoidance`)
with the hard-won rule that `usableFraction` must be continuous (bucketed
fractions hide exactly the gains a drill creates); k≥3 sampling with
distribution-overlap win criteria; and depth discipline ($ figure + market
comparison + live measurement, negative rungs first-class).
**Proposal:** merge into the lane's tiger as a minor-version bump.

## Generic craft found in project copies, worth folding into lane bodies

- Concurrent-session git discipline (pumper's architect/explorer copies): never
  a bare `git commit` in a shared checkout — `git commit -m ... -- <paths>`,
  because siblings pre-stage into the shared index; never `--amend`; retry on
  `index.lock`; Edit-append (never Write-replace) for shared lessons files.
  Proved live this very wave: a concurrent politicas session swept a migration
  commit and it had to be surgically split.
- Dev-server lifecycle (three gravity copies converged independently): take a
  non-default port, never 3000; kill only the PID you started, never by
  name/port.
- uat: an `UNMEASURED (harness)` verdict distinct from `fail` (journey failed ≠
  driver failed); batch L1 fan-out by Character above 3 journeys; report-level
  `sources:` list.
- research §2a: YouTube caption de-overlap must be word-level, not line-level
  (line-level leaves ~2× the real word count; wpm > 280 means the de-overlap
  failed); which caption track you got constrains what you may claim.

## Open harvest slots with verified realizations already in hand

- `test-harness/rust--out-of-graph-artifacts` (a real two-repo application:
  tracklight + pumper)
- `quality-gates` application for `blocking-by-input-determinism` (tracklight ci.yml)
- `cost-metering` EXTENDS lead: `visibility-as-enforcement` (pumper — the
  declined duplicate's transplantable half)
- Profile convention debt: one application file cannot express two provenances
  with two `verified_on` dates (hit on goat's second `react--ownership-boundaries`
  sighting).

## Watch item (one repo, needs a second sighting)

goat, three times: correct machinery built and merged while the invoking lines
were never written (a load-time cycle assert with no importer; a 2,183-line
virtualization library with zero importers; an unreachable duplicate assign
path). If a second repo shows it, it is a technique.

## Fleet notes

- kazimi66 leak source is the PRIMARY machine's git config — fix it there;
  this box and all six project checkouts verified/pinned to xkazm04.
- grant's registration commits sit on `chore/decommission-datahub`, not main.
- Project-side commits (manifests, overlay migrations) are local, not pushed —
  push per repo when convenient.

## Operator decisions — 2026-08-24, end of day

Recorded during the wave-2 continuation, binding until revisited:

- **Grant auth: deferred.** No production timeline, audience, or auth strategy
  yet. Conformance rows marked `deferred`; containment stays; no auth schemes
  invented. Revisit at productionization.
- **Data retention: deferred — keeping expired data is the pattern.** No
  deletion/expiry policies fleet-wide; non-destructive visibility and lossless
  maintenance remain in scope. Revisit retention after the production dynamic
  resolves.

## Wave-2b close — 2026-08-25: full coverage

All six projects reached ZERO `deviation` rows against the software-engineering
bundle. Standing: 6 `deferred` rows fleet-wide, all under the two operator
decisions above (grant authorization ×2 + one retention-shaped row each in
grant, tracklight, pumper, politicas; goat carries its auth deferral as 5
suppressed findings in `.ai/findings.json`). The signals lane cannot express
`deferred` (counts are consults/deviations/citations only), so the deviations
map is simply empty there; the per-project conformance files are the record.

Wave-2b also left every repo with CI fully green — for pumper, the first
fully-green run in the repo's history (six masked reds fixed in sequence, none
quarantined).

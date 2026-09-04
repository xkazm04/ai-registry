---
layer: application
type: application
subject: repo-manifest-standard
technique: generated-from-provenance
stack: node
status: forged
verified_on: 2026-09-01
verified_against: node@24
---

# Synthesizing the manifest from a scan, with drift-checkable provenance

`src/lib/standard/manifest.ts` in the Ascent repo
(`C:\Users\kazda\kiro\ascent`) is the synthesizer: `buildManifestData(report,
opts?)` (`manifest.ts:107`) maps a repository scan to the structured contract, and
`serializeManifestYaml(d)` (`manifest.ts:256`) renders it. It is deterministic —
same scan in, same bytes out — which is the precondition for the drift check to
mean anything.

## The object is the contract; the serialization is a view

`src/lib/standard/types.ts:35-36` states the separation directly: "The
YAML/JSON serialization is a VIEW of this object, so the on-disk format can
evolve without changing the contract callers depend on." The serializer's helpers
(`manifest.ts:218-227`) keep the rendering in a deliberately regular subset —
`yamlScalar()` emits a token bare only when it matches `[\w./@-]+` *and* is
neither a YAML-ambiguous word nor number-shaped, `flowList()` emits bracketed flow
lists — because the shipped reference runner parses it with regexes and no
dependencies.

That coupling is itself under test, and the test comment (`standard.test.ts:432`)
is the lesson: the serializer and the runner's parsers are "an IMPLICIT,
executable contract," and a drift in quote style, indent or flow-list shape
"ships green but hard-fails every adopting repo's CI conformance gate on a
manifest Ascent itself produced." The test closes the gap by extracting the
runner's *actual* parser functions out of the generated runner source and
feeding them real serializer output — exercising the shipped regexes verbatim
rather than a hand-copy.

## The provenance pair

`manifest.ts:138` writes `generatedAt` (a date, `report.scannedAt.slice(0,10)`)
and `manifest.ts:142` `generatedFrom` — the repository files the commands were
derived from, taken from the language family's own `sourceFile` where it has one
and otherwise from the `SOURCE_FILE` map at `manifest.ts:28`.

That pair is exactly the recomputation path the technique demands: the reference
checker flags the manifest as stale when any `generatedFrom` file changed after
`generatedAt`. The design principle in the shipped spec (`spec.ts:61-63`,
principle 5) names the payoff: "The manifest is *regenerable*, not hand-canon."

Note the honest weakness in the generic branch — `TYPECHECK.generic` is `null`
(`manifest.ts:42`) and the entry is simply omitted (`manifest.ts:128`) rather than
guessed. A capability the scan cannot observe is not declared.

## Markers, never invented values

Where a scan cannot know the answer, the synthesizer writes a detectable
placeholder instead of a plausible value: `repo.purpose` falls back to `"TODO:
one line on what this repo is for"` (`manifest.ts:146-148`), `boundaries` seeds
`neverTouch: []` under a TODO comment and `secretsFrom` a TODO string
(`manifest.ts:167-172`), and `agents` (`manifest.ts:178`) is filled from the
guidance graph only when the repo registered none by hand.

The sibling guardrails generator states the rule as doctrine
(`src/lib/standard/guardrails.ts:27-28`): the never-touch list is "seeded empty —
a scan can't tell which dirs are generated/vendored, so the agent fills it in
(the same honesty rule the manifest's TODO markers follow: leave a marker, never
invent)."

The placeholder discipline has a second half the repo learned late: a marker only
works if the checker *reports* it. Ten language families were collapsing onto the
generic row and emitting `generatedFrom: ["<your build manifest>"]` — a
placeholder the freshness check skipped in silence, because the named file does
not exist, so the standard's own drift detection was inert for six of ten sampled
languages. `commandsFor` gained a per-family `sourceFile` and the placeholder is
now reported rather than skipped (`manifest.ts:24-25` carries the measurement).

## Claim, not verdict

Every capability starts `verified: false`, and `types.ts:27-29` defines the
write-back rule precisely: `verified` is "a claim the doctor's `--run` writes back
into manifest.yaml: true once it has actually run the command and it passed, false
when the run fails (so a stale true never outlives a broken command)." Generator
claims; prover proves; failure downgrades. Regeneration is explicitly not a
downgrade either: a `verified: true` the prover established is preserved by the
observed-readout path (`manifest.ts:116-120`), because "a tool that silently
discards the edits a maintainer made to its output only gets run once."

## Control placement lives beside the capabilities

`manifest.ts:195-196` ships the default split — `prePush: [lint, typecheck,
scan-secrets]`, `ciHardPass: [test, sast, merge-gate]` — with `typecheck` listed
only where the family has one, and a tuned placement the repo already declared
winning outright (`manifest.ts:192-194`). The shipped spec (`spec.ts:93-94`)
states the cross-check that makes the second list worth having: the runner
"compares the declared `capabilities` against `controls.prePush` +
`controls.ciHardPass` and reports any control that has no backing capability."

## Drift across the producer/consumer boundary

The generator also emits artifacts that run in *someone else's* CI — the
`.ai` conformance workflow (`src/lib/standard/wiring.ts`) and the `ci-gates`
practice artifact (`src/lib/practice-artifact.ts`). Ascent pinned Node 24 for
itself in `.nvmrc`, `package.json` engines and both of its own workflows while
generating `node-version: 20` into every adopting repo from three separate sites
— a runtime whose maintenance window closed in April 2026 — and a suite of
thousands of tests stayed green throughout. The comment on the fix names why
(`practice-artifact.ts:247-254`): "the generated file runs in someone else's CI,
so this repo's own green build says nothing about it."

The repair is the technique's derive-rather-than-restate rule pointed sideways.
One exported `CI_NODE_VERSION` (`practice-artifact.ts:255`) feeds the recipe
(`practice-artifact.ts:263`) and both jobs of the generated conformance workflow
(`wiring.ts:51`, `wiring.ts:72`), and the guard derives the expected value from
the producer's own declaration rather than re-typing it
(`practice-artifact.test.ts:374-378`): it reads `package.json` engines, asserts a
major is pinned at all, and asserts the constant equals it — so the next bump
carries automatically instead of being a second edit nobody remembers. A sibling
test (`practice-artifact.test.ts:381-385`) pins that both generated sites use the
constant rather than a literal. The commit records the verification that matters
for a guard: seeded with `20`, it goes red.

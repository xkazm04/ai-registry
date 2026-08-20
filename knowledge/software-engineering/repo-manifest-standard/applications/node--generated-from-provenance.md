---
layer: application
type: application
subject: repo-manifest-standard
technique: generated-from-provenance
stack: node
status: forged
---

# Synthesizing the manifest from a scan, with drift-checkable provenance

`src/lib/standard/manifest.ts` in the Ascent repo
(`C:\Users\kazda\kiro\ascent`) is the synthesizer: `buildManifestData(report:
ScanReport): ManifestData` maps a repository scan to the structured contract, and
`serializeManifestYaml(d)` renders it. The function is pure and deterministic —
same scan in, same bytes out — which is the precondition for the drift check to
mean anything.

## The object is the contract; the YAML is a view

`src/lib/standard/types.ts:34-36` states the separation directly: "The
YAML/JSON serialization is a VIEW of this object, so the on-disk format can
evolve without changing the contract callers depend on." The serializer's helpers
(`manifest.ts:79-88`) keep the rendering in a deliberately regular subset —
`scalar()` quotes only when a token contains anything outside `[\w./@-]`,
`flowList()` emits bracketed flow lists — because the shipped reference runner
parses it with regexes and no dependencies.

That coupling is itself under test, and the test comment (`standard.test.ts:354`)
is the lesson: the serializer and the runner's parsers are "an IMPLICIT,
executable contract," and a drift in quote style, indent or flow-list shape
"ships green but hard-fails every adopting repo's CI conformance gate on a
manifest Ascent itself produced." The test closes the gap by extracting the
runner's *actual* parser functions out of the generated runner source and
feeding them real serializer output — exercising the shipped regexes verbatim
rather than a hand-copy.

## The provenance pair

`manifest.ts:46-47` writes `generatedAt` (a date, `report.scannedAt.slice(0,10)`)
and `generatedFrom` — the repository files the commands were derived from,
selected per language family by the `SOURCE_FILE` map at `manifest.ts:13-19`
(the dependency manifest for a node repo, the project file for a python one, the
module file for go, the crate manifest for rust, and an explicit
`<your build manifest>` placeholder for the generic case).

That pair is exactly the recomputation path the technique demands: the reference
checker flags the manifest as stale when any `generatedFrom` file changed after
`generatedAt`. The design principle in the shipped spec (`spec.ts:48-127`,
principle 5) names the payoff: "The manifest is *regenerable*, not hand-canon."

Note the honest weakness in the generic branch — `TYPECHECK.generic` is `null`
(`manifest.ts:27`) and the entry is simply omitted (`manifest.ts:38`) rather than
guessed. A capability the scan cannot observe is not declared.

## Markers, never invented values

Where a scan cannot know the answer, the synthesizer writes a detectable
placeholder instead of a plausible value:

- `repo.purpose` falls back to `"TODO: one line on what this repo is for"`
  (`manifest.ts:45`).
- `boundaries.neverTouch` is seeded `[]` with a TODO comment, and
  `boundaries.secretsFrom` a TODO string (`manifest.ts:62-64`).
- `agents` is `[]` with a TODO (`manifest.ts:65`), and the serializer renders the
  empty case as `[] # TODO: register coding agents (id/kind/entrypoint),
  vendor-neutral` (`manifest.ts:97`).

The sibling guardrails generator states the rule as doctrine
(`src/lib/standard/guardrails.ts:23-24`): the never-touch list is "seeded empty —
a scan can't tell which dirs are generated/vendored, so the agent fills it in
(the same honesty rule the manifest's TODO markers follow: leave a marker, never
invent)."

## Claim, not verdict

Every capability is emitted `verified: false` (`manifest.ts:34-38`), and
`types.ts:26-32` defines the write-back rule precisely: `verified` is "a claim
the doctor's `--run` writes back into manifest.yaml: true once it has actually
run the command and it passed, false when the run fails (so a stale true never
outlives a broken command)." Generator claims; prover proves; failure downgrades.
The document-level score is never stored in the manifest — the reference runner
prints it, with its comparability caveats, at run time.

## Control placement lives beside the capabilities

`manifest.ts:68-73` ships the default split — `prePush: [lint, typecheck,
scan-secrets]`, `ciHardPass: [test, sast, merge-gate]` — with an inline
instruction to tune it ("a small test suite can move to prePush; a huge one stays
in CI") and a note that the agent runs tests in its verify step regardless of
where the *gate* lives. The shipped spec's capability section states the
cross-check that makes the second list worth having: the runner "compares the
declared `capabilities` against `controls.prePush` + `controls.ciHardPass` and
reports any control that has no backing capability."

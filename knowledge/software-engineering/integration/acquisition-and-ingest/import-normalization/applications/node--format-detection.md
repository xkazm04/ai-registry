---
layer: application
type: application
subject: import-normalization
technique: format-detection
stack: node
verified_on: 2026-10-31
verified_against: node@22
---

# The workflow detector — fingerprints, confidence grades, and a confessing guess

`src/lib/personas/parsers/workflowDetector.ts` +
`src/lib/personas/parsers/workflowParser.ts` implement detection for four
foreign automation formats (three JSON node-graph/step-list exports and one
YAML CI-workflow format) feeding the import wizard. The detector is pure
and read-only; the parser owns bounded deserialization and the
unknown-outcome escalation.

## Confirmed against the technique

- **Structural fingerprints, ordered by specificity**
  (`workflowDetector.ts:28-92`): the node-graph format is recognized by a
  `nodes` array whose elements carry the vendor's own type prefix
  (high confidence), falling to `nodes` + `connections` co-occurrence
  (medium — the conjunction rule in action); the step-list format by
  `steps[]` elements carrying `app`/`action`/`action_id`; the
  scenario format by `flow[]`/`blueprint.flow`/`modules[]` variants. The
  most vendor-specific markers sit first; envelope-only shapes score
  lower confidence rather than winning outright.
- **Confidence is part of the outcome**: `DetectionResult` carries
  `confidence: 'high' | 'medium' | 'low'` (`workflowDetector.ts:11-25`),
  and the wizard receives `needsConfirmation` + `detectedConfidence`
  through the `FILE_PARSED` action (`useWorkflowImport.ts:70-78`) — the
  format guess is user-confirmable state, not an internal detail.
- **Bounded parsing before detection**: the YAML loader runs with
  `maxDepth: 50, maxMergeSeqLength: 20` (`workflowParser.ts:32-40`), with
  a comment deriving the bound ("workflow files arrive from external
  tools… only semi-trusted") — the depth-cap-before-deserialization rule
  with its rationale written beside the number. The byte cap is enforced
  upstream at file intake (`useWorkflowImport.ts:96-99`) against the
  service-owned limit constant.
- **The speculative-parse escalation, with the honest bit set**
  (`workflowParser.ts:120-133, 156-192`): on `unknown`, `tryParsers` runs
  all three JSON adapters, scores candidates by extracted structure
  (tools + triggers + connectors), and picks the best — with
  `needsConfirmation = true` unconditionally, confidence `medium` when
  exactly one adapter succeeded and `low` when several did (ambiguity
  stays ambiguous). Zero successes throws a refusal that names the four
  supported formats *and* each adapter's own error — the described
  unknown, not an empty result.
- **Unreadable ≠ unrecognized**: syntax errors are caught and rethrown as
  `Invalid JSON: …` / `Invalid YAML: …` with `cause` preserved
  (`workflowParser.ts:224-246`), a different message class from the
  unsupported-format refusal.

## Where it diverges from the technique — honestly

- **Extension is trusted for the syntax split** (`workflowParser.ts:224`):
  `.yml`/`.yaml` routes to the YAML loader, everything else to JSON, and
  `isSupportedFile` gates on extension alone. A YAML export renamed to
  `.json` is refused as invalid JSON rather than detected. Acceptable for
  a file-picker flow with a declared accept list; it would not survive a
  paste-content entry point without a content-sniff fallback.
- **No version detection.** Fingerprints identify the format family only;
  none of the four adapters branches on an export-schema version. The
  vendor revision that renames a key will surface as degraded extraction,
  not as "newer than we support".
- **Fingerprints are code, not data**: the discriminators live in an `if`
  cascade rather than beside the platform capability tables
  (`platformDefinitions.ts`), so adding a fifth format touches the
  detector, the parser's `switch`, *and* the table file. Three sites for
  one vocabulary extension — the "detection is data too" section of the
  technique names exactly this.
- **No detection telemetry**: unknown-rate is not counted anywhere, so a
  vendor shipping a new export shape becomes support tickets, not a
  rising counter.

## Re-checked 2026-10-31

Re-checked 2026-10-31 at personas@61029d7ae0. The anchors above that only
moved have been updated in place. The rest of the body is the 2026-08-18
reading, and five things have changed since then:

- **The telemetry divergence is resolved.** `reportDetection` and
  `reportDetectionFailure` (`workflowParser.ts:303-322`) log every verdict
  and count it through `trackInteraction('workflow_import', …)`, with a
  `:speculative` suffix and an `unrecognized` outcome. Their doc comment
  names vendor drift as the reason. The last bullet above no longer holds.
- **The fingerprints are one walk now.** `analyzeWorkflow`
  (`workflowDetector.ts:67-175`) returns the platform and the element count
  from the same branch. The rules were confirmed in the same order: n8n,
  then Zapier, then Make, then GitHub Actions. A `FORMAT_PLATFORMS` table
  limits YAML to GitHub Actions. A jobs-shaped JSON document is detected as
  GitHub Actions at `medium` instead of falling to `unknown`. The cited
  range `:28-92` no longer covers the rules.
- **The speculative parse covers all four adapters, not three.**
  `tryParsers` (`workflowParser.ts:335-369`) iterates `ROUTABLE_PLATFORMS`,
  which is derived from a total `PLATFORM_ADAPTERS` record (`:171-179`). The
  refusal's format list is derived from the same record. The record's own
  comment says `github-actions` had been missing from the speculative
  array while the refusal still advertised it, which is the state the
  bullet above described as "all three JSON adapters". `needsConfirmation`
  is now `confidence !== 'high'` (`:280`), so a medium fingerprint asks for
  confirmation too, not only the speculative path.
- **The bounds moved and widened.** js-yaml 4.3 dropped
  `maxMergeSeqLength`. The loader now runs with `maxDepth: 50,
  maxTotalMergeKeys: 200` (`workflowParser.ts:56-62`), and the comment at
  `:37-45` records that an unattended upgrade would have dropped the merge
  bound silently. The JSON branch, which had no bound in the parser, now
  checks the byte cap before `JSON.parse` (`assertBoundedSize`, `:105-113`)
  and walks the result iteratively against depth 50 and 250,000 values
  (`assertBoundedStructure`, `:121-144`). The YAML result gets the same walk.
  Against the import-validation expansion cap: the loader options bound
  depth and merge keys, not alias resolution. The walk keeps no
  visited set, though, so every aliased node is counted each time it is
  reached. An alias bomb that parses small therefore meets the 250,000-value
  ceiling after the parse and before any adapter runs. This is a
  post-parse count, not a loader-level alias cap.
- **The "code, not data" divergence is narrower.** The parser's `switch`
  is gone and routing reads the adapter table. A fifth format still
  touches three sites: the detector's cascade, `PLATFORM_ADAPTERS` (which
  `tsc` now forces) and `platformDefinitions.ts`. Detection is still trusted
  to the extension for the syntax split (`workflowDetector.ts:200`), and no
  adapter detects a version.

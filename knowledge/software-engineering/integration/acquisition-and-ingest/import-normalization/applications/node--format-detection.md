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

*Read at personas@61029d7ae0 (2026-10-31). What changed after the first
reading on 2026-08-18 is in the last section.*

`src/lib/personas/parsers/workflowDetector.ts` +
`src/lib/personas/parsers/workflowParser.ts` implement detection for four
foreign automation formats (three JSON node-graph/step-list exports and one
YAML CI-workflow format) feeding the import wizard. The detector is pure
and read-only; the parser owns bounded deserialization, routing, the
unknown-outcome escalation and the detection telemetry.

## Confirmed against the technique

- **Structural fingerprints, ordered by specificity, in one walk**
  (`analyzeWorkflow`, `workflowDetector.ts:67-175`): the node-graph format
  is recognized by a `nodes` array whose elements carry the vendor's own
  type prefix (high confidence), falling to `nodes` + `connections`
  co-occurrence (medium — the conjunction rule in action); the step-list
  format by `steps[]` elements carrying `app`/`action`/`action_id`; the
  scenario format by `flow[]`/`blueprint.flow`/`modules[]` variants; the
  CI format by a `jobs` map plus `on` or a `runs-on` job. The most
  vendor-specific markers sit first; envelope-only shapes score lower
  confidence rather than winning outright. The platform verdict and the
  element count come from the same branch, so the preview card cannot
  print a count from one collection beside a platform named by another
  (the comment at `:50-66` records the document that once did). A
  `FORMAT_PLATFORMS` table (`:39-42`) lets YAML resolve only to the CI
  format; a jobs-shaped JSON document resolves to it at `medium`.
- **Confidence is part of the outcome**: `DetectionResult` carries
  `confidence: 'high' | 'medium' | 'low'` (`workflowDetector.ts:11-25`),
  `needsConfirmation` is `confidence !== 'high'` (`workflowParser.ts:280`),
  and the wizard receives `needsConfirmation` + `detectedConfidence`
  through the `FILE_PARSED` action (`useWorkflowImport.ts:70-78`) — the
  format guess is user-confirmable state, not an internal detail, and a
  medium fingerprint asks as well as the speculative path.
- **Bounded parsing before detection, on both branches.** The YAML loader
  runs with `maxDepth: 50, maxTotalMergeKeys: 200`
  (`workflowParser.ts:56-62`), with a comment deriving the bound
  ("workflow files arrive from external tools… only semi-trusted") and
  recording that the js-yaml 4.3 upgrade renamed the merge option and would
  have dropped it silently (`:37-45`). Every input is checked against the
  service-owned byte cap before either parse (`assertBoundedSize`,
  `:105-113`, called at `:218`), and the parsed result, JSON or YAML, is
  walked iteratively against depth 50 and 250,000 values
  (`assertBoundedStructure`, `:121-144`). The walk keeps no visited set, so
  an aliased YAML node is counted each time it is reached: an alias bomb
  that parses small meets the value ceiling after the parse and before any
  adapter runs. That is a post-parse count, not a loader-level alias cap.
  The byte cap is also enforced at file intake (`useWorkflowImport.ts:96-99`).
- **The speculative-parse escalation, with the honest bit set**
  (`workflowParser.ts:257-273`, `tryParsers` `:335-369`): on `unknown`,
  every adapter in `ROUTABLE_PLATFORMS` is tried — all four, derived from
  the total `PLATFORM_ADAPTERS` record (`:171-179`), which `tsc` forces to
  cover every platform — candidates are scored by extracted structure
  (tools + triggers + connectors), and the best is picked, with confidence
  `medium` when exactly one adapter succeeded and `low` when several did
  (ambiguity stays ambiguous), so confirmation is always required. Zero
  successes throws a refusal that names the supported formats, derived
  from the same record (`supportedFormatsSentence`, `:182-186`), *and* each
  adapter's own error — the described unknown, not an empty result.
- **Detection is counted.** `reportDetection` and `reportDetectionFailure`
  (`workflowParser.ts:303-322`) log every verdict and count it through
  `trackInteraction('workflow_import', …)`, with a `:speculative` suffix
  and an `unrecognized` outcome; the doc comment names vendor drift as the
  reason. A vendor shipping a new export shape shows up as a rising
  counter before it shows up as support tickets.
- **Unreadable ≠ unrecognized**: syntax errors are caught and rethrown as
  `Invalid JSON: …` / `Invalid YAML: …` with `cause` preserved
  (`workflowParser.ts:224-246`), a different message class from the
  unsupported-format refusal.

## Where it diverges from the technique — honestly

- **Extension is trusted for the syntax split** (`workflowParser.ts:224`,
  `workflowDetector.ts:200`): `.yml`/`.yaml` routes to the YAML loader,
  everything else to JSON, and `isSupportedFile` gates on extension alone
  (`workflowDetector.ts:214-217`). A YAML export renamed to `.json` is
  refused as invalid JSON rather than detected. Acceptable for a
  file-picker flow with a declared accept list; it would not survive a
  paste-content entry point without a content-sniff fallback.
- **No version detection.** Fingerprints identify the format family only;
  none of the four adapters branches on an export-schema version. The
  vendor revision that renames a key will surface as degraded extraction,
  not as "newer than we support".
- **Fingerprints are code, not data**: the discriminators live in an `if`
  cascade rather than beside the platform capability tables
  (`src/lib/personas/platformDefinitions.ts`). Routing now reads the
  adapter table, but adding a fifth format still touches the detector's
  cascade, `PLATFORM_ADAPTERS` and the table file. Three sites for one
  vocabulary extension, one of them compiler-enforced — the "detection is
  data too" section of the technique names exactly this.

## Since 2026-08-18

The first reading described an earlier tree, and five of its claims were
true then and are not now. Detection emitted no telemetry; `c57bcf936e`
(2026-08-28) added the counters. The speculative parse tried three JSON
adapters while the refusal advertised four, and `needsConfirmation` was set
only on the speculative path; `be39ca2217` (2026-08-28) added the fourth
adapter and tied confirmation to confidence, and `2883da4ffb` the same day
derived the adapter list and the refusal from `PLATFORM_ADAPTERS` and
removed the router's `switch`.
The JSON branch had no size, depth or value bound in the parser;
`1fbbb6a02c` added `assertBoundedSize` and `assertBoundedStructure`. The
YAML loader ran with `maxMergeSeqLength: 20`; `14300578a4` (2026-09-22)
moved to js-yaml 4.3.2 and `maxTotalMergeKeys: 200`. The fingerprints and
the element count were also two walks with two precedence orders until
`b8138ea56f` and `b40eb0ee0a` (2026-08-28/29) made them one.

---
domain: game-production
subject: motion-quality-gating
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# motion-quality-gating

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/motion-quality-gating",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:fa9995f520f46d07",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Paired comparisons against calibrated anchors can support an absolute acceptance bar. Intended robotic stiffness may be correct, and a zero-pass batch should trigger instrument review as well as content investigation.",
    "Folder names and small byte sizes are heuristics, not authoritative kind or emptiness evidence. Reference scans cover declared languages and reference forms; absent matches do not prove every asset orphaned.",
    "First visible response, attack windup, impact and completed blend are different quantities. Genre thresholds need an authored or measured basis; missing pipeline components leave end-to-end latency unmeasured."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/asset-production/motion-and-audio/motion-quality-gating/motion-quality-gating.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    },
    {
      "url": "https://dev.epicgames.com/documentation/unreal-engine/root-motion-in-unreal-engine",
      "scope": "Official documentation search evidence distinguishes in-place animation from enabled root-motion extraction. It does not impose universal root-motion requirements on action categories."
    }
  ],
  "documents": {
    "motion-quality-gating.md": {
      "disposition": "reverify",
      "reason": "Reverify mandatory root-motion categories, universal response thresholds, six independent rubric dimensions and claims that batch ranking cannot coexist with an absolute anchor. Filmstrip sampling is repaired; the rest remains scoped follow-up."
    },
    "techniques/absolute-not-curved-judgment.md": {
      "disposition": "reverify",
      "reason": "Paired comparisons against calibrated anchors can support an absolute acceptance bar. Intended robotic stiffness may be correct, and a zero-pass batch should trigger instrument review as well as content investigation."
    },
    "techniques/asset-reality-ledger.md": {
      "disposition": "reverify",
      "reason": "Folder names and small byte sizes are heuristics, not authoritative kind or emptiness evidence. Reference scans cover declared languages and reference forms; absent matches do not prove every asset orphaned."
    },
    "techniques/filmstrip-sampling-discipline.md": {
      "disposition": "clarify",
      "reason": "Repaired numeric/timestamp ordering, take identity, zero-frame behavior, endpoint assumptions, rounding and sparse-sample limits on timing and contacts."
    },
    "techniques/genre-response-latency-norms.md": {
      "disposition": "reverify",
      "reason": "First visible response, attack windup, impact and completed blend are different quantities. Genre thresholds need an authored or measured basis; missing pipeline components leave end-to-end latency unmeasured."
    },
    "techniques/montage-budget-and-root-motion-lint.md": {
      "disposition": "reverify",
      "reason": "Root motion is an authored movement choice, not mandatory for every category. A peer median including the only clip produces ratio 1, contrary to the claimed self-flag. Blend completion time is not first-response latency."
    },
    "techniques/six-dimension-motion-rubric.md": {
      "disposition": "reverify",
      "reason": "The dimensions overlap and depend on action/style. A cap below a broken anchor of zero is unreachable on a zero-based scale; a high mean cannot override a failed mandatory dimension."
    },
    "applications/node--asset-reality-ledger.md": {
      "disposition": "reverify",
      "reason": "The historical likely-empty predicate excludes zero-byte files by requiring bytes greater than zero. C++ reference scanning and folder classification do not establish a complete runtime asset inventory. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--filmstrip-sampling-discipline.md": {
      "disposition": "reverify",
      "reason": "The historical n <= 1 branch returns one sample for n = 0. A filename family may span takes, and sparse stills cannot establish every-frame contact correctness. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--six-dimension-motion-rubric.md": {
      "disposition": "reverify",
      "reason": "The historical arithmetic permits scores 0,100,100,100,100,100 to average 83.3. Reconcile hard-failure precedence and the impossible below-zero cap before using the mean as an acceptance result. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```

## Architecture re-review after the compression revert - 2026-09-10

Read the golden path, all six techniques and all three applications at their reverted bytes,
then opened the PoF checkout at `C:/Users/kazda/kiro/pof` (HEAD `d823bffe`) to check the
three applications. Reading source, not executing it: no critic invocation, no capture, no
engine run, no filmstrip assembled.

The subject is in good shape. Separating craft, responsiveness and integrity into three
verdicts that do not average is correct and the reason given - they fail independently and
their fixes are performed by different people - is the right reason. The sampler-is-half-the-
instrument argument, with three rules each of which fails silently, is the most transplantable
part; I checked the arithmetic of the even-subsample formula the application quotes and it
does pin both endpoints as claimed. `HIGH_MEM_FACTOR = 1.8` matches the technique's "roughly
one and four fifths", and `MIN_PEERS = 2` matches the declared minimum peer count.

One finding I can defend, and it is small but it is this subject's own law turned on itself.
`genre-response-latency-norms` opens by giving the ladder in milliseconds - "locomotion
around fifty milliseconds, a hit reaction around a hundred, a dodge around a hundred and
fifty, an attack around two hundred" - and then in the next sentence declares "Each is the
budget for that action class, in seconds of wall-clock time". The numbers and the stated unit
disagree by three orders of magnitude in one paragraph, in a technique whose governing law is
that a number carries its unit and its basis. The realization stores them as seconds
(`locomotion 0.05`, `attacking 0.20`), so the intent is unambiguous and the fix is one clause,
but a reader building a table from the prose will build it wrong.

Two things I did not raise. The claim that six is where the published animation principles
collapse is an authorial judgment stated as one, with the selection criterion given (keep what
is visible in a sampled sequence, drop what is a rule for authoring), and it is defensible.
And the memory-outlier rule being a relative comparison inside an absolute-judgment subject is
explicitly reconciled in the text - it is a check for anomaly, not a grade of quality, and it
is forbidden from producing a craft verdict.

On the applications: `process--six-dimension-motion-rubric` records a deviation - "No capped
disqualifier. A zero on `followThrough` can be carried by five adequate siblings into a
`warn`" - and says "the standard stands". At PoF HEAD that deviation is closed:
`src/lib/anim-critique/score.ts` now computes the verdict from the worst dimension's band,
never the mean, names the worst dimension on the card, and cites this subject by name in the
docstring. The mean survives only as trend telemetry with an explicit instruction that a
consumer must not re-band it. The document's second observation - `believability` inside the
mean - still holds. `node--asset-reality-ledger`'s stated deviation, `DEFAULT_GENRE_NORM =
0.2` applied silently, is still present at HEAD, so that document is accurate.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/motion-quality-gating",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:6e0250d10f5ebac1",
  "disposition": "clarify",
  "coverage": "Golden path, six techniques and three applications read in full at reverted bytes. All three applications' citations re-checked by reading the live PoF checkout (HEAD d823bffe); the even-subsample formula and the memory-outlier constants were checked arithmetically. Not evaluated: any critic invocation, model call, capture directory, filmstrip assembly or engine session; whether the stated genre latency ladder matches measurements of any shipped product.",
  "counterexamples": [
    "The latency ladder is stated in milliseconds and its unit is declared as seconds in the same paragraph, in a technique governed by the law that a number carries its unit. A reader building the table from the prose builds it a thousand times wrong.",
    "The rubric's floor rule caps the verdict when any dimension is below the broken anchor, and the missing-dimension rule says an unscored dimension blocks the verdict. A card with one broken dimension and one unscored dimension has two blocking conditions and no stated precedence between fail and cannot-judge.",
    "The asset reality ledger's size-floor heuristic is per kind, but a legitimately short reaction montage and a failed export of a long traversal montage can land on the same side of a per-kind floor, because the floor is a property of the kind and the defect is a property of the export."
  ],
  "sources": [
    {"path": "C:/Users/kazda/kiro/pof/src/lib/anim-critique/score.ts", "result": "Establishes that the verdict is now the worst dimension's band rather than the mean, with the worst dimension named on the card and this subject cited in the docstring - closing the capped-disqualifier deviation the process application records as open. Does not establish that the thresholds (70/45) were re-validated against any corpus."},
    {"path": "C:/Users/kazda/kiro/pof/src/components/modules/core-engine/sub_animation/_shared/data.ts", "result": "Confirms DEFAULT_GENRE_NORM = 0.2 is still applied as a silent fallback budget, so the node application's recorded deviation still stands. Does not establish where else that fallback surfaces in the UI."}
  ],
  "documents": {
    "motion-quality-gating.md": {"disposition": "keep", "reason": "Three verdicts that do not average, the sampler as half the instrument, the norm-table-is-not-an-audit rule and the four-view reconciliation are each argued from a named failure rather than asserted. The never-manufacture-a-number section states the correct consequence - a function that returns nothing for most inputs is the right behaviour, not a regression."},
    "techniques/absolute-not-curved-judgment.md": {"disposition": "keep", "reason": "The three refusals are stated as instructions to the instrument because none is any rater's default, which is the whole point, and the correctness-is-the-floor sentence is identified as the load-bearing one with the mechanism (raters collapse to the middle) given. The A/B and measurement-exists exclusions are correctly drawn."},
    "techniques/asset-reality-ledger.md": {"disposition": "keep", "reason": "Four views with a distinct finding at each adjacent pair, the hollow-asset case as the reason a content-aware view exists, and the per-kind labelled heuristic that yields to real inspection. The uncollected-view rule - a view that could not be collected is not an empty view - is the guard that stops the worst output the tool can produce."},
    "techniques/filmstrip-sampling-discipline.md": {"disposition": "keep", "reason": "One naming family, numeric order, even subsample pinning both endpoints - each with the specific silent corruption it prevents and each testable in isolation. Binding the score to the frame count, layout, family and sampler version, and treating a sampler change as invalidating prior scores, is the correct consequence of the verdict-binds-to-content law."},
    "techniques/genre-response-latency-norms.md": {"disposition": "clarify", "reason": "The ladder is given in milliseconds and its unit declared as seconds one sentence later, which is this technique's own governing law violated in its own worked example. The realization stores seconds, so state the numbers in seconds or the unit in milliseconds. Everything else - self-labelling as a rubric, the hard rule against folding norms over sample data at load time, unclassified-beats-defaulted - is sound."},
    "techniques/montage-budget-and-root-motion-lint.md": {"disposition": "keep", "reason": "Same-category median with a declared minimum peer count, root motion required by declared category and flagged as a warning rather than a hard failure because code-driven movement is a legitimate choice, and blend-in time as a separate finding from the latency norms. The relative comparison is explicitly reconciled with the subject's absolute stance as an anomaly check that may not produce a craft verdict."},
    "techniques/six-dimension-motion-rubric.md": {"disposition": "keep", "reason": "Each dimension is stated as a visible contrast rather than a noun, which is the technique. The anchors-first, arithmetic-second ordering, the floor rule stated as a cap rather than encoded as a re-weighting, and the deliberate acknowledgement that the overall-read dimension double counts, are all correct and all stated as decisions rather than accidents."},
    "applications/node--asset-reality-ledger.md": {"disposition": "keep", "reason": "Re-checked at PoF HEAD: the per-kind labelled shell heuristic, the path-segment-before-name classification, the pure-core-thin-collectors split and the removed fabrications in computeResponsiveness all hold, and the one deviation it declines to lower - DEFAULT_GENRE_NORM applied silently - is still present. Accurate as written."},
    "applications/node--filmstrip-sampling-discipline.md": {"disposition": "keep", "reason": "The three sampling rules and their code sites hold, and the even-subsample formula does pin both endpoints as the document claims. The sibling footage-gate section correctly identifies why the disqualifiers differ from the image-to-3D pre-gate rather than transplanting them."},
    "applications/process--six-dimension-motion-rubric.md": {"disposition": "reverify", "reason": "Its first recorded deviation is closed at PoF HEAD: the scorer now takes the verdict from the worst dimension's band, names it on the card, and keeps the mean only as trend telemetry a consumer may not re-band - which is the capped-disqualifier rule the document says is not implemented. Its second observation, believability inside the mean, still holds. Re-anchor and restate which deviation stands."}
  }
}
```

---
domain: game-production
subject: runtime-observation-evidence
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# runtime-observation-evidence

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/runtime-observation-evidence",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:c4cbfb9710b5bcd4",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A nonempty screenshot of the wrong scene passes a byte-size floor but cannot satisfy the requested scene's perceptual judgment.",
    "A valid black fade frame and a capture pipeline failure can both have nearly zero luminance; pixels alone do not identify the cause.",
    "An image of a walking character does not reveal whether a hidden health attribute was updated correctly."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/engine-integration/runtime-observation-evidence",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "runtime-observation-evidence.md": {
      "disposition": "reverify",
      "reason": "Reverify evidence tiers as containment, continuous values as uniquely behavioral, determinism as necessary for measurement and black frames as unconditional defects. State observation and perceptual evidence are complementary; fixed timesteps do not guarantee deterministic physics or complete observation."
    },
    "techniques/behavioural-discriminators-over-symbolic-pass.md": {
      "disposition": "reverify",
      "reason": "A boolean or categorical observation can discriminate behavior, and a continuous variance can detect noise rather than intended motion. Overlapping distributions need calibrated error treatment, not automatic rejection of the metric. Same-run deltas do not alone establish causality; a missing new required field must not silently degrade acceptance."
    },
    "techniques/bounded-evidence-with-provenance.md": {
      "disposition": "reverify",
      "reason": "Eight evenly spaced samples can miss short events, and aggregate retention does not preserve every decision-relevant pattern. Keep event excerpts, omission metadata and artifact identities; rerunning a one-off failure may be impossible. A bounded report can link to a separately governed full trace."
    },
    "techniques/deterministic-headless-timestep.md": {
      "disposition": "reverify",
      "reason": "Fixed step controls one variable but not concurrency, physics, rendering-dependent updates or random state. An interval does not prove settling complete. Valid markers and process outcome must both be inspected; renderless mode may disable relevant behavior, and unlit/emissive scenes need not be black."
    },
    "techniques/observation-spine-contract.md": {
      "disposition": "reverify",
      "reason": "Live probing is one evidence source, not the only valid grounding; authoritative docs can be correct. Multiple mutations can have a compound acceptance claim, while pre/post snapshots alone cannot assign causality. Exact result identity also needs schema, completeness and source checks; ambiguity is not the only false-verdict path."
    },
    "techniques/tiers-of-truth.md": {
      "disposition": "clarify",
      "reason": "Repaired tiers as named evidence kinds rather than automatic containment, claim-specific requirements, renderer-dependent behavior and behavioral requirements for pure data. Perceptual evidence cannot replace internal state checks merely because its tier number is higher."
    },
    "techniques/unverifiable-is-not-fail.md": {
      "disposition": "clarify",
      "reason": "Repaired capture versus judgment standing, required-observer outages, black-frame heuristics, failure precedence, scoped unknowns and operational versus content outcomes. Cost alone no longer makes a required observer advisory."
    },
    "applications/node--behavioural-discriminators-over-symbolic-pass.md": {
      "disposition": "reverify",
      "reason": "The historical variance description uses degrees although variance has squared-angle units. Absolute vertical displacement can count falling as rising; max-minus-min resources can reflect regeneration rather than requested activation. Optional ability_found cannot establish the missing attribution; consumer not rerun."
    },
    "applications/node--unverifiable-is-not-fail.md": {
      "disposition": "reverify",
      "reason": "The historical 12 KB floor rejects legitimate compressible frames and accepts unrelated large images; absent pixel inspection weakens evidence. Judge outage cannot satisfy a required perceptual criterion. Cycle-only dedup may reuse the wrong scene/build. Teardown crashes remain operational failures even with retained observations; consumer not rerun."
    },
    "applications/process--tiers-of-truth.md": {
      "disposition": "reverify",
      "reason": "The historical GetState example counts tracks and keyframes structurally, not behaviorally. A seeing agent does not automatically establish independent judgment or current capture cost. The T0-T2 incident demonstrates that particular suite's gap, not universal incapacity of static analysis. No field witness refreshed."
    }
  }
}
```

### 2026-09-10 — re-review after the compression revert

Read all ten owned documents in full at the current bytes. The preceding 2026-09-10 record
marked eight of ten `reverify`; most of its reasons restate qualifications the documents
already carry, and are retracted. Three findings survive re-reading, and all three are
internal — a document contradicting itself or its sibling — which is the class of finding
this corpus can act on without leaving the tree.

**Finding 1: `unverifiable-is-not-fail` uses one word as both the umbrella and a member.**
Its outcome vocabulary is four values — pass, fail, **deferred** ("ran or was attempted and
could not decide"), **skipped** ("never attempted: no runtime configured, prerequisite
absent") — with the instruction that the last two "must never share a bucket". The verdict
table immediately below then classifies *no runtime environment configured* as
**unverifiable**, which by the vocabulary it just defined is the definition of *skipped*.
The same word does duty as the umbrella term for both non-deciding outcomes and as the
label in the table, at the precise boundary the technique exists to police. The golden path
handles it more carefully — "three outcomes, not two", then "the third outcome is really
two" — so the fix is to bring the table into the vocabulary's terms, not to weaken either.

**Finding 2: the discriminator's unit and its name disagree.** The technique instructs the
reader to sample a pose quantity and "take its **variance**". `bounded-evidence-with-
provenance` lists the derived statistic as "pose **swing** in degrees". The application
records the shipped assertion kinds as `animated` — arm-droop varies across samples,
default **≥ 10°** — and `static` — default **≤ 5°**. A variance of an angle has units of
degrees squared; a threshold quoted in degrees is a swing, a range, or a standard
deviation. Three documents in one subject use "variance" for a quantity whose stated unit
is degrees, under a technique that cites `a-number-carries-its-unit-and-basis` in its own
frontmatter and whose decision rules say a number with no basis is not information. Either
the quantity is a swing and should be called one throughout, or it is a variance and the
thresholds need their real unit.

**Finding 3: a byte floor is allowed to condemn.** `applications/node--unverifiable-is-not-
fail.md` records the frame inspection as a byte floor (default 12 KB) **and** a non-black
pixel fraction, with both required to hold for a pass, and quotes the rationale approvingly:
"a small real frame is caught by the byte pass". A genuinely rendered frame of a dark or
largely flat scene can compress below 12 KB, and the conjunction therefore converts a size
proxy into a sufficient condemnation. The technique it realises says the opposite twice —
"when you cannot tell whether an outcome is a fail or an unverifiable, it is an
unverifiable", and "falling to the conservative side is what keeps the layer trustworthy" —
and the mechanical-condemnation clause it relies on is specifically about a frame that is
*measurably* black, which is what the pixel pass measures and the byte pass only estimates.
Where the pixel library is present, the byte floor adds false condemnations and no
detection. This is a finding about the record; whether the code has since changed is not
established here.

**Retracted.** `deterministic-headless-timestep` was marked reverify because "fixed step
controls one variable but not concurrency, physics, rendering-dependent updates or random
state". The document never claims otherwise: it says timing is "only half of it", adds a
declared settle interval and named confounder isolations, and its closing section scopes
out both real-time performance measurement and systems whose variability is the product.
`observation-spine-contract` was marked reverify for treating live probing as the only
valid grounding; its ground step is stated as a precondition against a *live* system
specifically because an automated author working from documentation invents plausible
identifiers — that is an argument about authoring against a running target, not a claim
that documentation is wrong. Both dispositions are withdrawn, along with the blanket
reverify on the three applications for not having been re-executed.

**What I could not verify.** No consuming checkout, no engine run, no capture, no judge
invocation. `observation.ts`, `test-gate-runner/`, `ue-visual-gate.ts` and the two docs
under `docs/catalog/` are historical witnesses at their stated dates (2026-08-30,
2026-08-20) and those dates are left untouched. Settling findings 2 and 3 means reading
`src/types/observation.ts` and `src/lib/harness/ue-visual-gate.ts` at a pinned commit —
finding 2 in particular may be a naming defect in the repo that the application faithfully
reproduced, which would make the repair upstream of this corpus.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/runtime-observation-evidence",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:c39d92e70857c9d1",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at current bytes and cross-checked against each other, with particular attention to the outcome vocabulary, the discriminator's units and the frame-inspection rule. Explicitly not evaluated: the consuming checkout, any engine or headless run, any capture or judge invocation, the calibration that produced the 10-degree and 5-degree defaults, the 12 KB and 439 KB figures, and the cost claims about vision observers. No verification date refreshed.",
  "counterexamples": [
    "A character playing the wrong animation: droop variance is non-zero, the behavioural rung is green, and the discriminator separates only motionless from moving. The founding incident's class is covered; 'moving, but not as authored' is not, and no document says so.",
    "A capture taken during a legitimate authored fade to black: measurably black, condemned by the mechanical rule as a real observed failure, with no term for a frame that is correctly empty.",
    "A T4 request served by an observer made advisory under procedure step 7: the required tier is in the request, the run never blocks, and the request can be answered 'unverifiable' indefinitely with only the unverifiable rate as the signal — which the document names but does not reconcile with the tier contract.",
    "A run whose fixed timestep is honoured and whose content is nondeterministic (a seeded agent, a physics solver with variable substepping): the quantity is reproducible in its clock and not in its value, and 'suspect the timestep before suspecting the content' points the reader away from the cause."
  ],
  "sources": [
    {
      "url": "local: knowledge/game-production/engine-integration/runtime-observation-evidence",
      "result": "All ten documents read as primary evidence; established the vocabulary/table inconsistency, the variance-versus-degrees unit mismatch across three documents, and the byte-floor condemnation against the technique's own conservative rule. Established nothing about the consuming harness, whose behaviour the applications assert at their stated dates."
    },
    {
      "url": "local: knowledge/game-production/content-pipeline/content-acceptance-tiering",
      "result": "Read for the neighbouring ladder. Confirms the two subjects keep separate ladders with one stated mapping rather than merging them, as both claim; the acceptance subject's orthogonality carve-out matches this subject's own decision rule about rungs that cannot be ordered by containment."
    }
  ],
  "documents": {
    "runtime-observation-evidence.md": {
      "disposition": "keep",
      "reason": "The founding incident is used correctly — a category error about what checks can prove, not a missing check — and the ladder is ordered by containment with cost explicitly rejected as the axis. Handles the third outcome more carefully than the technique it delegates to ('three outcomes, not two', then 'the third outcome is really two'). The ambiguous-attribution and substituted-subject failure modes are the two paths to an actively false verdict and both are named."
    },
    "techniques/behavioural-discriminators-over-symbolic-pass.md": {
      "disposition": "clarify",
      "reason": "Instructs the reader to take the variance of a sampled pose quantity, while the sibling technique and the application both quote the resulting statistic in degrees — a variance of an angle is in degrees squared. Under this technique's own cited law, name the quantity that the thresholds are actually in. Everything else — the boolean-as-input rule, calibrating on both distributions before siting a threshold, same-run baselines, and step 6's disambiguate-the-negative — is precise and is the best material in the subject."
    },
    "techniques/bounded-evidence-with-provenance.md": {
      "disposition": "keep",
      "reason": "Six payload parts with the reason each is there, down-sample-do-not-truncate, and statistics computed over the full stream before bounding so the aggregate is not eight points presented as three hundred. The absolute-path rule and the store-with-the-verdict rule are both stated as consequences rather than as style. Uses 'pose swing in degrees', which is the naming this subject should settle on."
    },
    "techniques/deterministic-headless-timestep.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify. The document never claims a fixed step buys full determinism: timing is 'only half of it', settle intervals and named confounder isolations are the other half, and the closing section scopes out real-time performance measurement and product-variability systems explicitly. Judge-by-markers and terminate-by-PID are both recorded with the incident that produced them."
    },
    "techniques/observation-spine-contract.md": {
      "disposition": "keep",
      "reason": "Retracts the prior reverify. The ground step is argued specifically about authoring against a live system, where invented-but-plausible identifiers produce structurally valid artifacts that resolve to nothing; that is not a claim that documentation is unreliable in general. Act-once, observe-by-a-different-reader, single-source-every-string-crossing-the-seam and preview-shares-the-collector are each tied to a named drift."
    },
    "techniques/tiers-of-truth.md": {
      "disposition": "keep",
      "reason": "Each rung names its question, mechanism and blindness, the required tier is attached to the intent rather than the runner, and the ladder is explicitly not a maturity model. The orthogonality decision rule and 'when a rung's mechanism changes, re-verify its blindness statement' are the two rules that keep a ladder honest over years."
    },
    "techniques/unverifiable-is-not-fail.md": {
      "disposition": "clarify",
      "reason": "The four-value vocabulary defines skipped as 'never attempted: no runtime configured' and insists deferred and skipped never share a bucket; the verdict table one section later labels no-runtime-configured as 'unverifiable'. The umbrella term and a member value are the same word at the boundary the technique polices. Bring the table into the vocabulary's terms. The asymmetry that an observer outage never downgrades a captured frame, and that an unverifiable condemnation still condemns while an unverifiable pass does not elevate, is correct and worth preserving exactly."
    },
    "applications/node--behavioural-discriminators-over-symbolic-pass.md": {
      "disposition": "clarify",
      "reason": "Reproduces the variance-in-degrees mismatch: the sample row is documented as droop angle in degrees whose 'variance across samples' is the discriminator, and the shipped assertion defaults are 10 degrees and 5 degrees. Say which statistic the thresholds are in. The rest is strong evidence — the closed assertion vocabulary with overridable defaults, the optional ability_found field with graceful degradation, and terminal-deferred on ambiguous attribution with the colliding ids named. verified_on 2026-08-30 stands unrefreshed."
    },
    "applications/node--unverifiable-is-not-fail.md": {
      "disposition": "clarify",
      "reason": "Records a 12 KB byte floor conjoined with the pixel test so that a small frame is condemned as black, and endorses the rationale. The technique's mechanical condemnation is about a frame that is measurably empty, which the pixel pass measures and the byte pass estimates; the conjunction lets a proxy produce a fail where the technique requires falling to unverifiable. Where the pixel library is present the byte floor adds only false condemnations. The four-way verdict table, the substituted-subject fix with its map precedence, and the deferred/skipped correction are all accurate. verified_on 2026-08-30 stands unrefreshed."
    },
    "applications/process--tiers-of-truth.md": {
      "disposition": "keep",
      "reason": "Cites the repo stating this subject's founding sentence in one line, records the tier-in-the-intent and single-mapping choices as confirmations rather than as the source of the standard, and holds the standard where the repo is weaker — T2 as reachability from a real entry point rather than property-level introspection, with the deviation stated and not lowered. The cost-inversion note is the honest reason T4 became routine. verified_on 2026-08-20 stands unrefreshed."
    }
  }
}
```

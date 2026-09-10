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

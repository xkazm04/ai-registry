---
domain: media-generation
subject: content-research-grounding
last_touched: 2026-08-22
touched_by: research
dry_streak: 0
---

# content-research-grounding

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-22 - `/research`, from an external source

Gained `provenance-signal-asymmetry` (6 -> 7 techniques). Source:
[[2026-08-22-ai-agent-race-exploded]].

The rule - a positive provenance detection is evidence, a negative is not - was
corroborated by the producer's own published wording and by independent reporting, and
it composes with `evidence-grading-ladder` in one direction only. Without that
restriction, paraphrasing machine text once becomes the cheapest route to the top of the
ladder, which is the failure a grading ladder exists to prevent.

## Open leads

- **This should probably be a law.** `recruiting` already carries
  `absence-of-evidence-is-not-evidence`, and this bundle has no equivalent. It was
  written as a technique because the skill's bar for minting a law is convergence across
  runs, and two runs from one channel is not convergence. **Return condition:** a third
  independent sighting from a different source, or a second subject in this bundle
  needing to cite it. Cross-bundle links are forbidden, so it would be a separate
  minting, not a reference.
- **The outbound half is thin here.** Marks on your *own* published output are covered
  in one section; if `generated-output-grading` is ever deepened, check whether that
  half belongs there instead.

## Standing debt

- **Two stacks** (`process`, `react`); the new technique has no application.
- **Never swept by `/librarian`.**

## Declines

None.

## Architecture review - 2026-10-31

First architecture review, against `e1fcb7785`. All 14 documents read in full. The
standing-debt line above ("the new technique has no application") is stale:
`react--provenance-signal-asymmetry` landed 2026-10-14. Primary sources opened this run
qualify two provenance claims. First, one producer's own detector help page does not say
a negative "carries no implication": it says a negative means its own models did not
make or edit the content, while the content "could have been created by other AI
systems". The rule survives, since that negative is scoped to one producer and never
reaches machine origin, but the golden path and technique overstate what producers say.
Second, the C2PA soft-binding specification exists to recover a manifest "when the
metadata containing the C2PA Manifest has been stripped". So stripping metadata does not
always leave no trace. The pipeline prompt behind the process application was re-read at
its current revision. Its quotes hold, but its line anchors and checklist count have
drifted. The react applications cite a tree layout that has since moved, and one of them
may now meet its own return condition. No verification date was refreshed in this record.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/content-research-grounding",
  "date": "2026-10-31",
  "baseline": "e1fcb7785",
  "digest": "sha256-b2:094f1b2708130460",
  "disposition": "clarify",
  "coverage": "All 14 documents (golden path, 7 techniques, 6 applications) read in full. Relative law links resolve to the bundle's _laws.md. Primary sources opened: a producer's detector help page, the producer's developer SynthID page, the C2PA Soft Binding API specification 2.4, and the research prompt and notebook schema of the consuming pipeline at its current shallow HEAD fd09c06. Not evaluated: the stat-reel tree behind two react applications (not available), the consuming tree's commits 78fe0aa and d13a0ce (absent from the shallow clone), any runtime or test rerun.",
  "counterexamples": [
    "A producer-scoped negative can carry weight for that producer: a detector's help page says a negative means its own models did not make or edit an image or video, though other systems could have. The negative still moves nothing about machine origin in general.",
    "A stripped C2PA manifest can be recovered through a registered soft binding (an invisible watermark or a fingerprint resolved against a manifest repository), so 'removed and leaves no trace' fails wherever a soft binding was registered.",
    "Forty-five billion a year is about 1,427 per second. 'About fifteen hundred' rounds that up by 5%, the kind of polish the scale-conversion technique itself warns against.",
    "A tensionless explainer, such as a tutorial, is the honest null the taxonomy asks for, not a failed run."
  ],
  "sources": [
    {
      "url": "https://support.google.com/gemini/answer/16722517",
      "result": "Read. 'If a SynthID watermark is detected, it means all or part of the image or video was created or edited by Google's AI models.' On a negative: 'it means the image or video wasn't created or edited by Google AI, but it could have been created by other AI systems.' It also names unclear cases ('Not enough details to watermark', 'Likely too small an edit') and a 'chance that after many alterations the watermark won't be detected'. This supports a producer-scoped negative and refutes the claim that producers describe absence as carrying no implication."
    },
    {
      "url": "https://ai.google.dev/responsible/docs/safeguards/synthid",
      "result": "Read. 'Detector confidence scores can be greatly reduced when an AI-generated text is thoroughly rewritten, or translated to another language'. 'Watermark application is less effective on factual responses'. The text mark is 'not designed to directly stop motivated adversaries'. This supports the dilution argument."
    },
    {
      "url": "https://spec.c2pa.org/specifications/specifications/2.4/softbinding/Decoupled.html",
      "result": "Read. 'C2PA specifies a mechanism for recovering a C2PA Manifest for an asset, for example when the metadata containing the C2PA Manifest has been stripped. This mechanism is a soft binding (for example an invisible watermark or content fingerprint)'. This qualifies 'stripping it ... leaves no trace'."
    },
    {
      "source": "Consuming pipeline: pipeline/RESEARCH-PROMPT.md and pipeline/NOTEBOOK-SCHEMA.md at fd09c06 (2026-10-31)",
      "result": "Re-read. The brief, the phase order, Phase 2's five shapes, the null-is-a-pass rule, baseline sizing, counter-case downgrade, the 77,800/270,000 scar and the cost note are all present verbatim. Drift: the quality bar is now 18 items at :161-193, not 17 at :161-191. The cost note is at :195-199. The notebook schema still routes unknowns to script/constraints.ts, but that file is gone from the current tree. The notebook code now lives under lib/notebook/, and a probe named cards-carry-evidence-class says buildCards no longer drops structured sources."
    }
  ],
  "documents": {
    "content-research-grounding.md": {
      "disposition": "clarify",
      "reason": "'Producers say as much themselves ... its absence carries no implication either way' overstates the producer wording. One producer's help page reads a negative as ruling out its own models only. 'removed in one operation' should acknowledge soft-binding recovery. The rest is sound: the field-names-its-consumer contract, the five claim kinds, the checkability-versus-exposure split, the sideways edge and recomputed comparisons."
    },
    "techniques/tension-finding-taxonomy.md": {
      "disposition": "keep",
      "reason": "It matches the source prompt's five shapes and its null, baseline and counter-case rules. Strength-as-checkability is stated consistently with prior-declaration-and-steel-man."
    },
    "techniques/pre-linked-causal-mechanisms.md": {
      "disposition": "keep",
      "reason": "The BUT/THEREFORE chain, per-link evidence and the transfer connector are bounded by a render-licence rule. Note that the consuming prompt's Phase 3 and quality bar still admit only BUT or THEREFORE, so the transfer extension is ahead of that application, not contradicted by it."
    },
    "techniques/prior-declaration-and-steel-man.md": {
      "disposition": "keep",
      "reason": "The found/constructed/absent discharge, the rule that an unsearched counter-case is never a gap, and the three re-test outcomes are coherent and match the source prompt's Phase 6 and Phase 9."
    },
    "techniques/unknowns-as-constraints.md": {
      "disposition": "keep",
      "reason": "Impact, scope, the must-say dual, a ledger keyed by id, a superseded state and reported dangling rows. Each rule names the incident that bought it, and the rules agree with each other."
    },
    "techniques/scale-conversion-of-numbers.md": {
      "disposition": "clarify",
      "reason": "Arithmetic: 45e9 / 31,557,600 s = about 1,426 per second, so 'about fifteen hundred' should be 'about fourteen hundred'. The moving-versus-recorded rule and the unit/period/denominator bookkeeping are sound."
    },
    "techniques/evidence-grading-ladder.md": {
      "disposition": "keep",
      "reason": "Class and confidence are kept apart ('interested is not low-confidence'), with the protected class, plural sources, three dates and graded kind. Internally consistent with the golden path."
    },
    "techniques/provenance-signal-asymmetry.md": {
      "disposition": "clarify",
      "reason": "The asymmetry and the three-state table hold and are corroborated by the producer's developer page. Two changes are owed. (1) The producer-wording paragraph should report what the help page actually says: a negative scoped to that producer, plus named unclear cases. It should not say absence 'carries no implication'. (2) 'Stripping it is one operation and leaves no trace' should acknowledge C2PA soft-binding recovery. The rule is unchanged: a missing manifest still moves nothing."
    },
    "applications/process--tension-finding-taxonomy.md": {
      "disposition": "clarify",
      "reason": "Every quoted passage was re-checked at fd09c06 and holds. The line anchors have drifted: the phases now run :20-158, the quality bar is 18 items at :161-193 and the cost note is at :195-199. Update the anchors and pin the commit."
    },
    "applications/react--evidence-grading-ladder.md": {
      "disposition": "reverify",
      "reason": "The not-better verdict was measured at 78fe0aa, which is absent from the shallow clone. The current tree moved the code to lib/notebook/, retired CardTile.tsx, and carries a cards-carry-evidence-class probe saying buildCards now keeps sources[]. The application's return condition may therefore be partly met. The re-run needs a count of load-bearing facts carrying sources[] at a current commit."
    },
    "applications/react--scale-conversion-of-numbers.md": {
      "disposition": "reverify",
      "reason": "unlinked-conversion is still present in lib/notebook/cards.ts, but the cited paths (app/_phases/...) moved. The citations need re-anchoring at a current commit, and the probe needs a rerun."
    },
    "applications/react--unknowns-as-constraints.md": {
      "disposition": "reverify",
      "reason": "app/_phases/script/constraints.ts and its CONSTRAINT_LEDGER no longer exist in the current tree, even though the notebook schema still routes unknowns to that path. The neighbouring conclusions module moved to lib/notebook/conclusions.ts. Find where the ledger lives now, or record that it was retired."
    },
    "applications/react--prior-declaration-and-steel-man.md": {
      "disposition": "reverify",
      "reason": "Internally consistent: it explains why the prior half did not fit, and its arms and limits are stated. The stat-reel tree was not available, so the validator and test counts were not re-checked."
    },
    "applications/react--provenance-signal-asymmetry.md": {
      "disposition": "reverify",
      "reason": "The 'unmeasurable' verdict and its return condition are honest, and the 'unknown' default matches the technique. The stat-reel tree at d13a0ce was not available, so the schema enum and the 28e2316 fix were not re-checked."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the four clarify items the record above names: two provenance passages, one
conversion figure and one application's anchors. The five react applications were not
touched and keep `reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/content-research-grounding",
  "date": "2026-10-31",
  "baseline": "e1fcb7785",
  "digest": "sha256-b2:54a41d3b2c87cc90",
  "disposition": "reverify",
  "coverage": "All 14 documents decided. The four clarify items from the earlier 2026-10-31 record were applied, and the edited passages were re-read against sources opened this run: the producer's detector help page and developer page, the C2PA Soft Binding API 2.4, and the consuming pipeline prompt at fd09c06. The arithmetic was recomputed. The process application's verified_on moved to 2026-10-31 because every citation in it was re-checked at fd09c06. All other documents are byte-unchanged and keep their dispositions. The five react applications stay reverify.",
  "counterexamples": [
    "A producer-scoped negative can carry weight for that producer: a detector's help page says a negative means its own models did not make or edit an image or video, though other systems could have. The negative still moves nothing about machine origin in general.",
    "A stripped C2PA manifest can be recovered through a registered soft binding (an invisible watermark or a fingerprint resolved against a manifest repository), so 'removed and leaves no trace' fails wherever a soft binding was registered.",
    "Forty-five billion a year is about 1,427 per second. 'About fifteen hundred' rounds that up by 5%, the kind of polish the scale-conversion technique itself warns against.",
    "A tensionless explainer, such as a tutorial, is the honest null the taxonomy asks for, not a failed run."
  ],
  "sources": [
    {
      "url": "https://support.google.com/gemini/answer/16722517",
      "result": "Read. 'If a SynthID watermark is detected, it means all or part of the image or video was created or edited by Google's AI models.' On a negative: 'it means the image or video wasn't created or edited by Google AI, but it could have been created by other AI systems.' It also names unclear cases ('Not enough details to watermark', 'Likely too small an edit') and a 'chance that after many alterations the watermark won't be detected'. This supports a producer-scoped negative and refutes the claim that producers describe absence as carrying no implication."
    },
    {
      "url": "https://ai.google.dev/responsible/docs/safeguards/synthid",
      "result": "Read. 'Detector confidence scores can be greatly reduced when an AI-generated text is thoroughly rewritten, or translated to another language'. 'Watermark application is less effective on factual responses'. The text mark is 'not designed to directly stop motivated adversaries'. This supports the dilution argument."
    },
    {
      "url": "https://spec.c2pa.org/specifications/specifications/2.4/softbinding/Decoupled.html",
      "result": "Read. 'C2PA specifies a mechanism for recovering a C2PA Manifest for an asset, for example when the metadata containing the C2PA Manifest has been stripped. This mechanism is a soft binding (for example an invisible watermark or content fingerprint)'. This qualifies 'stripping it ... leaves no trace'."
    },
    {
      "source": "Consuming pipeline: pipeline/RESEARCH-PROMPT.md and pipeline/NOTEBOOK-SCHEMA.md at fd09c06 (2026-10-31)",
      "result": "Re-read. The brief, the phase order, Phase 2's five shapes, the null-is-a-pass rule, baseline sizing, counter-case downgrade, the 77,800/270,000 scar and the cost note are all present verbatim. Drift: the quality bar is now 18 items at :161-193, not 17 at :161-191. The cost note is at :195-199. The notebook schema still routes unknowns to script/constraints.ts, but that file is gone from the current tree. The notebook code now lives under lib/notebook/, and a probe named cards-carry-evidence-class says buildCards no longer drops structured sources."
    }
  ],
  "documents": {
    "content-research-grounding.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'Producers say as much themselves ... no implication either way' now scopes a negative to the producer's own models, quoting 'could have been created by other AI systems'. Signed metadata is now 'recoverable only where a watermark or fingerprint was registered to bind it back'."
    },
    "techniques/tension-finding-taxonomy.md": {
      "disposition": "keep",
      "reason": "It matches the source prompt's five shapes and its null, baseline and counter-case rules. Strength-as-checkability is stated consistently with prior-declaration-and-steel-man."
    },
    "techniques/pre-linked-causal-mechanisms.md": {
      "disposition": "keep",
      "reason": "The BUT/THEREFORE chain, per-link evidence and the transfer connector are bounded by a render-licence rule. Note that the consuming prompt's Phase 3 and quality bar still admit only BUT or THEREFORE, so the transfer extension is ahead of that application, not contradicted by it."
    },
    "techniques/prior-declaration-and-steel-man.md": {
      "disposition": "keep",
      "reason": "The found/constructed/absent discharge, the rule that an unsearched counter-case is never a gap, and the three re-test outcomes are coherent and match the source prompt's Phase 6 and Phase 9."
    },
    "techniques/unknowns-as-constraints.md": {
      "disposition": "keep",
      "reason": "Impact, scope, the must-say dual, a ledger keyed by id, a superseded state and reported dangling rows. Each rule names the incident that bought it, and the rules agree with each other."
    },
    "techniques/scale-conversion-of-numbers.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'About fifteen hundred of profit per second' became 'About fourteen hundred' (45e9 / 31,557,600 s = about 1,426)."
    },
    "techniques/evidence-grading-ladder.md": {
      "disposition": "keep",
      "reason": "Class and confidence are kept apart ('interested is not low-confidence'), with the protected class, plural sources, three dates and graded kind. Internally consistent with the golden path."
    },
    "techniques/provenance-signal-asymmetry.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the producer-wording paragraph now quotes the text-mark documentation ('can be greatly reduced' by rewrite or translation) and the detector help page's producer-scoped negative and uncallable cases. It no longer says absence 'carries no implication'. The metadata paragraph now notes C2PA soft-binding recovery of a stripped manifest, with the rule kept: a recovered manifest is a positive, a missing one is not a negative."
    },
    "applications/process--tension-finding-taxonomy.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: re-anchored at fd09c06. Phases :20-157 -> :20-158, spine :29-43 -> :28-42, the 17-item checklist :161-191 became the 18-item checklist :161-193, cost note :193-197 -> :195-199, and the commit is pinned. All quotes re-checked verbatim. verified_on 2026-10-31."
    },
    "applications/react--evidence-grading-ladder.md": {
      "disposition": "reverify",
      "reason": "The not-better verdict was measured at 78fe0aa, which is absent from the shallow clone. The current tree moved the code to lib/notebook/, retired CardTile.tsx, and carries a cards-carry-evidence-class probe saying buildCards now keeps sources[]. The application's return condition may therefore be partly met. The re-run needs a count of load-bearing facts carrying sources[] at a current commit."
    },
    "applications/react--scale-conversion-of-numbers.md": {
      "disposition": "reverify",
      "reason": "unlinked-conversion is still present in lib/notebook/cards.ts, but the cited paths (app/_phases/...) moved. The citations need re-anchoring at a current commit, and the probe needs a rerun."
    },
    "applications/react--unknowns-as-constraints.md": {
      "disposition": "reverify",
      "reason": "app/_phases/script/constraints.ts and its CONSTRAINT_LEDGER no longer exist in the current tree, even though the notebook schema still routes unknowns to that path. The neighbouring conclusions module moved to lib/notebook/conclusions.ts. Find where the ledger lives now, or record that it was retired."
    },
    "applications/react--prior-declaration-and-steel-man.md": {
      "disposition": "reverify",
      "reason": "Internally consistent: it explains why the prior half did not fit, and its arms and limits are stated. The stat-reel tree was not available, so the validator and test counts were not re-checked."
    },
    "applications/react--provenance-signal-asymmetry.md": {
      "disposition": "reverify",
      "reason": "The 'unmeasurable' verdict and its return condition are honest, and the 'unknown' default matches the technique. The stat-reel tree at d13a0ce was not available, so the schema enum and the 28e2316 fix were not re-checked."
    }
  }
}
```
